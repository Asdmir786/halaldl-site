package main

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func validateWake(bind, token, workerToken, bypass string) error {
	if bind == "" {
		return nil
	}
	host, portText, err := net.SplitHostPort(bind)
	port, numberErr := strconv.Atoi(portText)
	if err != nil || numberErr != nil || host != "127.0.0.1" || port < 1 || port > 65535 || port == 18656 {
		return fmt.Errorf("FETCH_WAKE_BIND must be a separate IPv4 loopback port")
	}
	if token == "" || token == workerToken || token == bypass || strings.ContainsAny(token, "\r\n") {
		return fmt.Errorf("configure a separate FETCH_WAKE_TOKEN")
	}
	return nil
}

func wakeHandler(token string, ring func()) http.Handler {
	expected := sha256.Sum256([]byte("Bearer " + token))
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		if req.URL.RequestURI() != "/wake" {
			http.NotFound(w, req)
			return
		}
		if req.Method != http.MethodPost {
			w.Header().Set("Allow", "POST")
			w.WriteHeader(405)
			return
		}
		actual := sha256.Sum256([]byte(req.Header.Get("Authorization")))
		if subtle.ConstantTimeCompare(expected[:], actual[:]) != 1 {
			w.WriteHeader(401)
			return
		}
		if req.ContentLength != 0 || len(req.TransferEncoding) != 0 {
			w.WriteHeader(400)
			return
		}
		ring()
		w.WriteHeader(204)
	})
}

func listenWake(bind, token string, ring func()) (*http.Server, error) {
	listener, err := net.Listen("tcp4", bind)
	if err != nil {
		return nil, err
	}
	server := &http.Server{Handler: wakeHandler(token, ring), ReadHeaderTimeout: 3 * time.Second, ReadTimeout: 3 * time.Second, WriteTimeout: 3 * time.Second, IdleTimeout: 3 * time.Second, MaxHeaderBytes: 4096}
	go func() {
		if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
			logEvent("wake_listener_failed", nil)
		}
	}()
	return server, nil
}

func closeWake(server *http.Server) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_ = server.Shutdown(ctx)
	_ = server.Close()
}
