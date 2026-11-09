//go:build linux

package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"
)

func TestRunnerConcurrentLifecycle(t *testing.T) {
	p, root := mediaFixture(t)
	id := newID()
	var jobs []Job
	for range 12 {
		j := fixtureJob()
		j.WorkerID = id
		jobs = append(jobs, j)
	}
	var mu sync.Mutex
	claimed := map[string]bool{}
	completed := map[string]bool{}
	allDone := make(chan struct{})
	var closeOnce sync.Once
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		mu.Lock()
		defer mu.Unlock()
		switch r.Method {
		case "POST":
			var b struct {
				Claim      bool `json:"claim"`
				ActiveJobs []struct {
					ID string `json:"id"`
				} `json:"activeJobs"`
			}
			_ = json.NewDecoder(r.Body).Decode(&b)
			ids := []string{}
			for _, j := range b.ActiveJobs {
				ids = append(ids, j.ID)
			}
			var job *Job
			if b.Claim && len(jobs) > 0 {
				j := jobs[0]
				jobs = jobs[1:]
				claimed[j.ID] = true
				job = &j
			}
			_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "activeJobIds": ids, "job": job})
		case "PUT":
			if len(jobs) > 0 && r.Header.Get("x-halaldl-job-kind") == "download" {
				j := jobs[0]
				jobs = jobs[1:]
				if claimed[j.ID] {
					t.Error("duplicate claim")
				}
				claimed[j.ID] = true
				_ = json.NewEncoder(w).Encode(map[string]any{"job": j})
			} else {
				_, _ = w.Write([]byte(`{"job":null}`))
			}
		case "PATCH":
			var b Result
			_ = json.NewDecoder(r.Body).Decode(&b)
			if !b.OK || !claimed[b.ID] {
				t.Error("bad completion")
			}
			completed[b.ID] = true
			_, _ = w.Write([]byte(`{"ok":true}`))
			if len(completed) == 12 {
				closeOnce.Do(func() { close(allDone) })
			}
		default:
			_, _ = w.Write([]byte(`{"ok":true}`))
		}
	}))
	defer server.Close()
	api, e := newAPI(server.URL, "test-worker", "", id)
	if e != nil {
		t.Fatal(e)
	}
	api.Client.Transport = server.Client().Transport
	spool := filepath.Join(root, "receipts")
	_ = os.Mkdir(spool, 0700)
	runner := &Runner{api: api, processor: p, spool: spool, maxJobs: 12, maxDownloads: 12, active: map[string]activeJob{}, readResources: func(string) (Resources, error) {
		return Resources{AvailableMemory: 12 * GiB, HostFree: 100 * GiB, WorkFree: 40 * GiB}, nil
	}}
	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second)
	defer cancel()
	errCh := make(chan error, 1)
	go func() { errCh <- runner.Run(ctx) }()
	select {
	case e := <-errCh:
		t.Fatalf("runner stopped before completion: %v", e)
	case <-allDone:
		time.Sleep(50 * time.Millisecond)
		cancel()
	case <-ctx.Done():
		t.Fatal("runner did not complete twelve jobs")
	}
	if e = <-errCh; e != nil {
		t.Fatal(e)
	}
	mu.Lock()
	defer mu.Unlock()
	if len(claimed) != 12 || len(completed) != 12 {
		t.Fatal(len(claimed), len(completed))
	}
	files, _ := os.ReadDir(spool)
	if len(files) != 0 {
		t.Fatal("accepted receipt retained")
	}
}
