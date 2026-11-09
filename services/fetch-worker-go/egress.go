package main

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/netip"
	"strings"
	"sync"
	"time"
)

var deniedPrefixes = func() []netip.Prefix {
	var out []netip.Prefix
	for _, s := range []string{"0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8", "169.254.0.0/16", "172.16.0.0/12", "192.0.0.0/24", "192.0.2.0/24", "192.168.0.0/16", "198.18.0.0/15", "198.51.100.0/24", "203.0.113.0/24", "224.0.0.0/4", "240.0.0.0/4", "2001::/23", "2001:db8::/32", "2002::/16"} {
		out = append(out, netip.MustParsePrefix(s))
	}
	return out
}()

func publicAddress(ip netip.Addr, blocked []netip.Addr) bool {
	if !ip.IsValid() || ip.Is4In6() || !ip.IsGlobalUnicast() {
		return false
	}
	if ip.Is6() && !netip.MustParsePrefix("2000::/3").Contains(ip) {
		return false
	}
	for _, p := range deniedPrefixes {
		if p.Contains(ip) {
			return false
		}
	}
	for _, a := range blocked {
		if a == ip {
			return false
		}
	}
	return true
}

type lookupFunc func(context.Context, string) ([]netip.Addr, error)

func resolvePublic(ctx context.Context, host string, blocked []netip.Addr, lookup lookupFunc) (netip.Addr, error) {
	host = strings.Trim(host, "[]")
	if host == "" || len(host) > 253 || strings.EqualFold(host, "localhost") || strings.HasSuffix(strings.ToLower(host), ".localhost") || strings.HasSuffix(strings.ToLower(host), ".local") {
		return netip.Addr{}, fmt.Errorf("blocked_destination")
	}
	var addresses []netip.Addr
	if ip, e := netip.ParseAddr(host); e == nil {
		addresses = []netip.Addr{ip}
	} else {
		var e error
		addresses, e = lookup(ctx, host)
		if e != nil {
			return netip.Addr{}, fmt.Errorf("dns_failed")
		}
	}
	if len(addresses) == 0 {
		return netip.Addr{}, fmt.Errorf("dns_failed")
	}
	for _, ip := range addresses {
		if !publicAddress(ip, blocked) {
			return netip.Addr{}, fmt.Errorf("blocked_destination")
		}
	}
	return addresses[0], nil
}

type idleConn struct{ net.Conn }

func (c idleConn) Read(p []byte) (int, error) {
	_ = c.SetReadDeadline(time.Now().Add(30 * time.Second))
	return c.Conn.Read(p)
}
func (c idleConn) Write(p []byte) (int, error) {
	_ = c.SetWriteDeadline(time.Now().Add(30 * time.Second))
	return c.Conn.Write(p)
}

type Egress struct {
	URL      string
	server   *http.Server
	listener net.Listener
	mu       sync.Mutex
	sockets  map[net.Conn]bool
	slots    chan struct{}
	blocked  []netip.Addr
	lookup   lookupFunc
}

func newEgress(address string, extra []string) (*Egress, error) {
	p := &Egress{sockets: map[net.Conn]bool{}, slots: make(chan struct{}, 128), lookup: func(ctx context.Context, h string) ([]netip.Addr, error) {
		return net.DefaultResolver.LookupNetIP(ctx, "ip", h)
	}}
	local, _ := net.InterfaceAddrs()
	for _, a := range local {
		h, _, _ := strings.Cut(a.String(), "/")
		if ip, e := netip.ParseAddr(h); e == nil {
			p.blocked = append(p.blocked, ip)
		}
	}
	for _, s := range extra {
		if ip, e := netip.ParseAddr(s); e == nil {
			p.blocked = append(p.blocked, ip)
		}
	}
	l, e := net.Listen("tcp", address)
	if e != nil {
		return nil, e
	}
	p.listener = l
	p.URL = "http://" + l.Addr().String()
	p.server = &http.Server{Handler: p, ReadHeaderTimeout: 10 * time.Second, MaxHeaderBytes: 8192, IdleTimeout: 30 * time.Second}
	go func() { _ = p.server.Serve(l) }()
	return p, nil
}
func (p *Egress) track(c net.Conn, add bool) {
	p.mu.Lock()
	defer p.mu.Unlock()
	if add {
		p.sockets[c] = true
	} else {
		delete(p.sockets, c)
	}
}
func (p *Egress) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "CONNECT" {
		http.Error(w, "HTTPS connections only", 403)
		return
	}
	host, port, e := net.SplitHostPort(r.Host)
	if e != nil || port != "443" {
		http.Error(w, "Forbidden", 403)
		return
	}
	select {
	case p.slots <- struct{}{}:
		defer func() { <-p.slots }()
	default:
		http.Error(w, "Busy", 503)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	ip, e := resolvePublic(ctx, host, p.blocked, p.lookup)
	if e != nil {
		http.Error(w, "Forbidden", 403)
		return
	}
	upstream, e := (&net.Dialer{Timeout: 5 * time.Second}).DialContext(ctx, "tcp", net.JoinHostPort(ip.String(), "443"))
	if e != nil {
		http.Error(w, "Unavailable", 502)
		return
	}
	defer upstream.Close()
	p.track(upstream, true)
	defer p.track(upstream, false)
	client, buffer, e := w.(http.Hijacker).Hijack()
	if e != nil {
		return
	}
	defer client.Close()
	p.track(client, true)
	defer p.track(client, false)
	if _, e = client.Write([]byte("HTTP/1.1 200 Connection Established\r\n\r\n")); e != nil {
		return
	}
	done := make(chan struct{})
	go func() { _, _ = io.Copy(idleConn{upstream}, buffer); _ = upstream.Close(); close(done) }()
	_, _ = io.Copy(idleConn{client}, idleConn{upstream})
	_ = client.Close()
	_ = upstream.Close()
	<-done
}
func (p *Egress) Close() {
	_ = p.server.Close()
	p.mu.Lock()
	for c := range p.sockets {
		_ = c.Close()
	}
	p.mu.Unlock()
}
