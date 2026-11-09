package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type API struct {
	Origin, Token, Bypass, WorkerID string
	Client                          *http.Client
}
type APIError struct {
	Status     int
	Mitigation string
}

func (e *APIError) Error() string { return fmt.Sprintf("worker_api_status_%d", e.Status) }
func newAPI(origin, token, bypass, workerID string) (*API, error) {
	u, err := url.Parse(origin)
	if err != nil || u.Scheme != "https" || u.Host == "" || u.User != nil || u.RawQuery != "" || u.Fragment != "" || strings.TrimSpace(token) == "" {
		return nil, fmt.Errorf("configure HTTPS worker API and token")
	}
	return &API{Origin: strings.TrimRight(origin, "/"), Token: strings.TrimSpace(token), Bypass: strings.TrimSpace(bypass), WorkerID: workerID, Client: &http.Client{Timeout: 65 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }, Transport: &http.Transport{Proxy: nil, MaxIdleConns: 8, MaxConnsPerHost: 4, IdleConnTimeout: 60 * time.Second, TLSHandshakeTimeout: 10 * time.Second, ResponseHeaderTimeout: 15 * time.Second}}}, nil
}
func (a *API) Call(ctx context.Context, method, kind string, body any, out any) error {
	timeout := 15 * time.Second
	if method == "DELETE" {
		timeout = 60 * time.Second
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	var b bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&b).Encode(body); err != nil {
			return err
		}
	}
	req, err := http.NewRequestWithContext(ctx, method, a.Origin+"/api/worker", &b)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+a.Token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-halaldl-worker-protocol", "3")
	req.Header.Set("x-halaldl-worker-id", a.WorkerID)
	if a.Bypass != "" {
		req.Header.Set("x-vercel-protection-bypass", a.Bypass)
	}
	if kind != "" {
		req.Header.Set("x-halaldl-job-kind", kind)
	}
	resp, err := a.Client.Do(req)
	if err != nil {
		return fmt.Errorf("worker_api_transport: %T", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		m := resp.Header.Get("x-vercel-mitigated")
		if m != "deny" && m != "challenge" {
			m = ""
		}
		return &APIError{resp.StatusCode, m}
	}
	if out == nil {
		_, err = io.Copy(io.Discard, io.LimitReader(resp.Body, 512_001))
		return err
	}
	return json.NewDecoder(io.LimitReader(resp.Body, 512_001)).Decode(out)
}
func (a *API) Negotiate(ctx context.Context) error {
	var response struct {
		Versions []int `json:"protocolVersions"`
	}
	if e := a.Call(ctx, "GET", "", nil, &response); e != nil {
		return e
	}
	for _, version := range response.Versions {
		if version == 3 {
			return nil
		}
	}
	return fmt.Errorf("worker API protocol 3 required")
}

func retryDelay(failures int) time.Duration {
	if failures < 1 {
		failures = 1
	}
	if failures > 5 {
		failures = 5
	}
	return min(time.Minute, 5*time.Second*time.Duration(1<<(failures-1)))
}
