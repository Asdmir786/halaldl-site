//go:build linux

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// Real local media and subprocesses, with a deterministic extractor fixture.
// These tests do not contact source platforms or use production credentials.
func mediaFixture(t *testing.T) (*Processor, string) {
	t.Helper()
	if _, e := os.Stat("/usr/bin/ffmpeg"); e != nil {
		t.Skip("Linux ffmpeg is required")
	}
	root := t.TempDir()
	fixture := filepath.Join(root, "fixture.mp4")
	_, e := runCommand(context.Background(), root, "/usr/bin/ffmpeg", []string{"-nostdin", "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=24", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=44100", "-t", "8", "-c:v", "libx264", "-preset", "ultrafast", "-threads", "1", "-c:a", "aac", "-y", fixture}, 30*time.Second, 1024)
	if e != nil {
		t.Fatal("fixture", e)
	}
	script := filepath.Join(root, "extractor-fixture.py")
	code := `#!/usr/bin/python3
import sys,json,shutil,os,time
args=sys.argv[1:]
if '--dump-single-json' in args:
 print(json.dumps({'title':'Isolated media fixture','duration':8,'formats':[{'format_id':'18','ext':'mp4','height':720,'width':1280,'vcodec':'avc1','acodec':'aac'}]}))
else:
 target=args[args.index('-o')+1].replace('%(ext)s','mp4')
 shutil.copyfile(` + strconv.Quote(fixture) + `,target)
 print(json.dumps(target))
`
	if e = os.WriteFile(script, []byte(code), 0700); e != nil {
		t.Fatal(e)
	}
	work := filepath.Join(root, "work")
	if e = os.Mkdir(work, 0700); e != nil {
		t.Fatal(e)
	}
	p := &Processor{YTDLP: script, FFmpeg: "/usr/bin/ffmpeg", FFprobe: "/usr/bin/ffprobe", WorkRoot: work, ProxyURL: "http://127.0.0.1:1", Upload: func(_ context.Context, _ string, path string, size int64) error {
		f, e := os.Open(path)
		if e != nil {
			return e
		}
		defer f.Close()
		n, e := io.Copy(io.Discard, f)
		if e == nil && n != size {
			return fmt.Errorf("short upload")
		}
		return e
	}}
	return p, root
}
func TestLinuxPipeline(t *testing.T) {
	p, _ := mediaFixture(t)
	for _, kind := range []string{"probe", "download"} {
		for _, mode := range []string{"video_audio", "audio", "video_only"} {
			if kind == "probe" && mode != "video_audio" {
				continue
			}
			j := fixtureJob()
			j.Kind = kind
			j.DeliveryMode = mode
			if mode == "audio" {
				j.MediaType = "audio"
				j.Extension = "m4a"
			}
			r := p.Process(context.Background(), j)
			if !r.OK {
				t.Fatalf("%s/%s: %s", kind, mode, r.ErrorCode)
			}
			files, _ := os.ReadDir(p.WorkRoot)
			if len(files) != 0 {
				t.Fatal("temporary media retained")
			}
		}
	}
}
func TestLinuxProcessTreeCancellation(t *testing.T) {
	root := t.TempDir()
	pidFile := filepath.Join(root, "child.pid")
	script := filepath.Join(root, "tree.sh")
	_ = os.WriteFile(script, []byte("#!/bin/sh\nsleep 120 &\necho $! > "+pidFile+"\nwait\n"), 0700)
	_, e := runCommand(context.Background(), root, script, nil, 300*time.Millisecond, 1024)
	if e == nil {
		t.Fatal("not cancelled")
	}
	b, e := os.ReadFile(pidFile)
	if e != nil {
		t.Fatal(e)
	}
	pid := strings.TrimSpace(string(b))
	// SIGKILL delivery to a different process is asynchronous under load.
	deadline := time.Now().Add(2 * time.Second)
	for {
		status, err := os.ReadFile("/proc/" + pid + "/stat")
		if os.IsNotExist(err) || err == nil && strings.Contains(string(status), ") Z ") {
			break
		}
		if time.Now().After(deadline) {
			t.Fatal("child survived cancellation")
		}
		time.Sleep(10 * time.Millisecond)
	}
}

func TestLinuxSandboxPreflight(t *testing.T) {
	if os.Getenv("FETCH_RUN_BENCHMARK") != "1" {
		t.Skip("managed Linux sandbox required")
	}
	work := os.Getenv("TMPDIR")
	if work == "" {
		t.Fatal("explicit bounded test mount required")
	}
	if e := preflight(work, 12); e != nil {
		t.Fatal(e)
	}
	r, e := resources(work)
	if e != nil {
		t.Fatal(e)
	}
	if r.WorkerMemoryLimit <= 0 || r.WorkerMemoryLimit > 4*GiB {
		t.Fatal("missing cgroup memory bound")
	}
	if preflight(t.TempDir(), 12) == nil {
		t.Fatal("ordinary directory accepted as a dedicated mount")
	}
}
func TestCapacityBenchmark(t *testing.T) {
	if os.Getenv("FETCH_RUN_BENCHMARK") != "1" {
		t.Skip("explicit isolated server benchmark only")
	}
	p, _ := mediaFixture(t)
	type row struct {
		Concurrency   int     `json:"concurrency"`
		Completed     int     `json:"completed"`
		Failed        int     `json:"failed"`
		PeakActive    int64   `json:"peakActive"`
		Seconds       float64 `json:"seconds"`
		JobsPerSecond float64 `json:"jobsPerSecond"`
		TotalBytes    int64   `json:"totalBytes"`
		PeakFamilyRSS int64   `json:"sampledPeakFamilyRSSBytes"`
	}
	var rows []row
	for _, n := range []int{2, 4, 8, 10, 12} {
		var active, peak, passed, failed, bytes, peakRSS atomic.Int64
		var wg sync.WaitGroup
		start := time.Now()
		gate := make(chan struct{})
		slots := make(chan struct{}, n)
		monitorDone := make(chan struct{})
		monitorExit := make(chan struct{})
		go func() {
			defer close(monitorExit)
			ticker := time.NewTicker(100 * time.Millisecond)
			defer ticker.Stop()
			for {
				select {
				case <-monitorDone:
					return
				case <-ticker.C:
					rss := familyRSS(os.Getpid())
					if rss > peakRSS.Load() {
						peakRSS.Store(rss)
					}
				}
			}
		}()
		for i := 0; i < n*3; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				<-gate
				slots <- struct{}{}
				defer func() { <-slots }()
				a := active.Add(1)
				defer active.Add(-1)
				for {
					old := peak.Load()
					if a <= old || peak.CompareAndSwap(old, a) {
						break
					}
				}
				j := fixtureJob()
				if i%3 == 1 {
					j.DeliveryMode = "audio"
					j.MediaType = "audio"
					j.Extension = "m4a"
				} else if i%3 == 2 {
					j.DeliveryMode = "video_only"
				}
				r := p.Process(context.Background(), j)
				if r.OK {
					passed.Add(1)
					bytes.Add(r.Bytes)
				} else {
					failed.Add(1)
				}
			}()
		}
		close(gate)
		wg.Wait()
		close(monitorDone)
		<-monitorExit
		elapsed := time.Since(start).Seconds()
		r := row{n, int(passed.Load()), int(failed.Load()), peak.Load(), elapsed, float64(passed.Load()) / elapsed, bytes.Load(), peakRSS.Load()}
		rows = append(rows, r)
		b, _ := json.Marshal(r)
		t.Log("BENCHMARK " + string(b))
		if failed.Load() != 0 {
			t.Errorf("stage %d had failures", n)
			break
		}
	}
	if path := os.Getenv("FETCH_BENCHMARK_REPORT"); path != "" {
		b, _ := json.MarshalIndent(map[string]any{"fixture": "8s 1280x720 H264/AAC, local extractor fixture, real FFmpeg/ffprobe, no upstream or R2 traffic", "stages": rows}, "", "  ")
		if e := os.WriteFile(path, b, 0600); e != nil {
			t.Fatal(e)
		}
	}
}
