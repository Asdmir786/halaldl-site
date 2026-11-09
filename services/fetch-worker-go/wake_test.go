package main

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
)

func TestWakeAuthentication(t *testing.T) {
	for _, bind := range []string{"0.0.0.0:18657", "[::1]:18657", "127.0.0.1:18656"} {
		if validateWake(bind, "wake", "worker", "") == nil {
			t.Fatal(bind)
		}
	}
	for _, token := range []string{"", "worker", "bypass"} {
		if validateWake("127.0.0.1:18657", token, "worker", "bypass") == nil {
			t.Fatal("reused token")
		}
	}
	rings := 0
	handler := wakeHandler("wake", func() { rings++ })
	for _, c := range []struct {
		method, path, token, body string
		status                    int
	}{
		{"POST", "/wake", "wrong", "", 401}, {"GET", "/wake", "wake", "", 405}, {"POST", "/wake?job=1", "wake", "", 404}, {"POST", "/wake", "wake", "url", 400}, {"POST", "/wake", "wake", "", 204},
	} {
		req := httptest.NewRequest(c.method, c.path, strings.NewReader(c.body))
		req.Header.Set("Authorization", "Bearer "+c.token)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != c.status {
			t.Fatalf("%+v got %d", c, res.Code)
		}
	}
	if rings != 1 {
		t.Fatal(rings)
	}
}

func TestTickCombinesClaimAndPreservesLeases(t *testing.T) {
	j := fixtureJob()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	api, _ := newAPI("https://fixture.example", "worker", "", j.WorkerID)
	api.Client.Transport = roundTripFunc(func(req *http.Request) (*http.Response, error) {
		if req.Method != "POST" {
			t.Fatal(req.Method)
		}
		var body struct {
			Claim      bool
			ClaimKinds []string
			ActiveJobs []any
		}
		_ = json.NewDecoder(req.Body).Decode(&body)
		if !body.Claim || len(body.ClaimKinds) != 1 || body.ClaimKinds[0] != "probe" || len(body.ActiveJobs) != 1 {
			t.Fatalf("%+v", body)
		}
		return &http.Response{StatusCode: 200, Header: http.Header{}, Body: io.NopCloser(strings.NewReader(`{"ok":true,"activeJobIds":[],"job":null}`))}, nil
	})
	r := &Runner{api: api, processor: &Processor{}, maxJobs: 2, maxDownloads: 1, active: map[string]activeJob{j.ID: {Job: j, cancel: cancel}}, readResources: func(string) (Resources, error) {
		return Resources{AvailableMemory: 12 * GiB, HostFree: 100 * GiB, WorkFree: 40 * GiB}, nil
	}}
	if _, err := r.tick(context.Background(), true); err != nil {
		t.Fatal(err)
	}
	if ctx.Err() != context.Canceled {
		t.Fatal("lease cancellation lost")
	}
}

func TestIdleClockWakeCoalescingAndSlowCleanup(t *testing.T) {
	api, _ := newAPI("https://fixture.example", "worker", "", newID())
	var mu sync.Mutex
	posts, puts, claims := 0, 0, 0
	api.Client.Transport = roundTripFunc(func(req *http.Request) (*http.Response, error) {
		var b struct{ Claim bool }
		if req.Method == "POST" {
			_ = json.NewDecoder(req.Body).Decode(&b)
		}
		mu.Lock()
		if req.Method == "POST" {
			posts++
			if b.Claim {
				claims++
			}
		}
		if req.Method == "PUT" {
			puts++
		}
		mu.Unlock()
		if req.Method == "DELETE" {
			select {
			case <-req.Context().Done():
			case <-time.After(200 * time.Millisecond):
			}
		}
		return &http.Response{StatusCode: 200, Header: http.Header{}, Body: io.NopCloser(strings.NewReader(`{"ok":true,"activeJobIds":[],"job":null}`))}, nil
	})
	r := &Runner{api: api, processor: &Processor{}, spool: t.TempDir(), maxJobs: 2, maxDownloads: 1, active: map[string]activeJob{}, wake: make(chan struct{}, 1), idleInterval: 30 * time.Millisecond, readResources: func(string) (Resources, error) {
		return Resources{AvailableMemory: 12 * GiB, HostFree: 100 * GiB, WorkFree: 40 * GiB}, nil
	}}
	if !r.signalTick() {
		t.Fatal("first ring")
	}
	for i := 0; i < 100; i++ {
		if r.signalTick() {
			t.Fatal("ring did not coalesce")
		}
	}
	ctx, cancel := context.WithTimeout(context.Background(), 150*time.Millisecond)
	defer cancel()
	if err := r.Run(ctx); err != nil {
		t.Fatal(err)
	}
	mu.Lock()
	defer mu.Unlock()
	if posts < 3 || posts > 9 || puts != 0 || claims == 0 {
		t.Fatalf("posts=%d puts=%d claims=%d", posts, puts, claims)
	}
	if (&Runner{active: map[string]activeJob{}}).interval() != 15*time.Second {
		t.Fatal("idle interval")
	}
}
