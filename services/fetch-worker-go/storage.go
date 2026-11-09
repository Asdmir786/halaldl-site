package main

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"
)

type Storage struct {
	Account, Bucket, AccessKey, SecretKey string
	Client                                *http.Client
}

func newStorage(account, bucket, access, secret string) (*Storage, error) {
	if !regexp.MustCompile(`^[a-f0-9]{32}$`).MatchString(account) || !regexp.MustCompile(`^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$`).MatchString(bucket) || access == "" || secret == "" {
		return nil, fmt.Errorf("configure R2 storage")
	}
	return &Storage{account, bucket, access, secret, &http.Client{Timeout: 120 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }, Transport: &http.Transport{Proxy: nil, MaxConnsPerHost: 4, TLSHandshakeTimeout: 10 * time.Second, ResponseHeaderTimeout: 30 * time.Second}}}, nil
}
func hmacSHA(key []byte, s string) []byte {
	h := hmac.New(sha256.New, key)
	_, _ = h.Write([]byte(s))
	return h.Sum(nil)
}
func digest(s string) string { h := sha256.Sum256([]byte(s)); return hex.EncodeToString(h[:]) }
func (s *Storage) request(ctx context.Context, method, key, hash string, reader io.Reader, size int64) error {
	if !regexp.MustCompile(`^fetch/[a-f0-9-]+$`).MatchString(key) {
		return fmt.Errorf("invalid_object_key")
	}
	endpoint := "https://" + s.Account + ".r2.cloudflarestorage.com/" + url.PathEscape(s.Bucket) + "/" + key
	req, e := http.NewRequestWithContext(ctx, method, endpoint, reader)
	if e != nil {
		return e
	}
	req.ContentLength = size
	now := time.Now().UTC()
	date := now.Format("20060102")
	stamp := now.Format("20060102T150405Z")
	scope := date + "/auto/s3/aws4_request"
	req.Header.Set("x-amz-date", stamp)
	req.Header.Set("x-amz-content-sha256", hash)
	req.Header.Set("Content-Type", "application/octet-stream")
	signed := "host;x-amz-content-sha256;x-amz-date"
	canonical := strings.Join([]string{method, req.URL.EscapedPath(), "", "host:" + req.URL.Host + "\nx-amz-content-sha256:" + hash + "\nx-amz-date:" + stamp + "\n", signed, hash}, "\n")
	signingKey := hmacSHA(hmacSHA(hmacSHA(hmacSHA([]byte("AWS4"+s.SecretKey), date), "auto"), "s3"), "aws4_request")
	signature := hex.EncodeToString(hmacSHA(signingKey, "AWS4-HMAC-SHA256\n"+stamp+"\n"+scope+"\n"+digest(canonical)))
	req.Header.Set("Authorization", "AWS4-HMAC-SHA256 Credential="+s.AccessKey+"/"+scope+", SignedHeaders="+signed+", Signature="+signature)
	response, e := s.Client.Do(req)
	if e != nil {
		return fmt.Errorf("storage_transport_failed")
	}
	defer response.Body.Close()
	_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, 64*1024))
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("storage_status_%d", response.StatusCode)
	}
	return nil
}
func (s *Storage) Upload(ctx context.Context, key, path string, size int64) error {
	f, e := os.Open(path)
	if e != nil {
		return e
	}
	defer f.Close()
	h := sha256.New()
	if _, e = io.Copy(h, f); e != nil {
		return e
	}
	if _, e = f.Seek(0, 0); e != nil {
		return e
	}
	return s.request(ctx, "PUT", key, hex.EncodeToString(h.Sum(nil)), f, size)
}
func (s *Storage) Delete(ctx context.Context, key string) error {
	return s.request(ctx, "DELETE", key, digest(""), nil, 0)
}
