package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"net/netip"
	"os"
	"slices"
	"strings"
	"testing"
	"time"
)

func fixtureJob() Job {
	return Job{ID: newID(), WorkerID: newID(), LeaseToken: newID(), ProtocolVersion: 3, Kind: "download", Platform: "vimeo", URL: "https://vimeo.com/1084537", FormatSelector: "18", Extension: "mp4", MediaType: "video", DeliveryMode: "video_audio", MaxBytes: 32 * MiB, MaxSeconds: 60, MaxHeight: 1080}
}
func TestJobValidation(t *testing.T) {
	j := fixtureJob()
	if e := j.Validate(); e != nil {
		t.Fatal(e)
	}
	for _, change := range []func(*Job){func(j *Job) { j.URL = "https://127.0.0.1/private" }, func(j *Job) { j.URL = "https://user:secret@vimeo.com/1" }, func(j *Job) { j.URL = "http://vimeo.com/1" }, func(j *Job) { j.FormatSelector = "--exec rm" }, func(j *Job) { j.ID = "../../outside" }, func(j *Job) { j.MaxBytes = 801 * MiB }, func(j *Job) { j.LeaseToken = "" }, func(j *Job) { j.DeliveryMode = "audio" }} {
		bad := j
		change(&bad)
		if bad.Validate() == nil {
			t.Fatalf("accepted invalid job %+v", bad)
		}
	}
}

func TestJoinedSourceRejected(t *testing.T) {
	for _, u := range []string{"https://www.instagram.com/reel/old/?psln=xhttps://www.instagram.com/p/new/", "https://www.instagram.com/reel/old/?psln=https%3A%2F%2Fwww.instagram.com%2Fp%2Fnew%2F"} {
		j := fixtureJob()
		j.URL = u
		if j.Validate() == nil {
			t.Fatal("accepted joined source")
		}
	}
}

func TestHeartbeatRevocationCancelsRunningJob(t *testing.T) {
	j := fixtureJob()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	api, e := newAPI("https://fixture.example", "worker-test", "", j.WorkerID)
	if e != nil {
		t.Fatal(e)
	}
	api.Client.Transport = roundTripFunc(func(r *http.Request) (*http.Response, error) {
		return &http.Response{StatusCode: 200, Header: http.Header{}, Body: io.NopCloser(strings.NewReader(`{"ok":true,"activeJobIds":[]}`))}, nil
	})
	r := &Runner{api: api, processor: &Processor{}, maxJobs: 2, active: map[string]activeJob{j.ID: {Job: j, cancel: cancel}}, readResources: func(string) (Resources, error) {
		return Resources{AvailableMemory: 12 * GiB, HostFree: 100 * GiB, WorkFree: 40 * GiB}, nil
	}}
	if e = r.heartbeat(context.Background()); e != nil {
		t.Fatal(e)
	}
	if ctx.Err() != context.Canceled {
		t.Fatal("revoked lease kept running")
	}
}
func TestDestinationPolicy(t *testing.T) {
	for _, ip := range []string{"127.0.0.1", "10.0.0.1", "172.16.0.2", "192.168.1.1", "169.254.169.254", "100.64.0.1", "224.0.0.1", "::1", "::ffff:8.8.8.8", "2001:db8::1", "2002:7f00:1::", "fe80::1", "fc00::1"} {
		if publicAddress(netip.MustParseAddr(ip), nil) {
			t.Fatal(ip)
		}
	}
	if !publicAddress(netip.MustParseAddr("8.8.8.8"), nil) {
		t.Fatal("public denied")
	}
	if publicAddress(netip.MustParseAddr("8.8.8.8"), []netip.Addr{netip.MustParseAddr("8.8.8.8")}) {
		t.Fatal("host address allowed")
	}
	lookup := func(context.Context, string) ([]netip.Addr, error) {
		return []netip.Addr{netip.MustParseAddr("8.8.8.8"), netip.MustParseAddr("127.0.0.1")}, nil
	}
	if _, e := resolvePublic(context.Background(), "mixed.example", nil, lookup); e == nil {
		t.Fatal("mixed DNS accepted")
	}
}
func TestProxyRefusesPrivateAndCustomPorts(t *testing.T) {
	p, e := newEgress("127.0.0.1:0", nil)
	if e != nil {
		t.Fatal(e)
	}
	defer p.Close()
	for _, target := range []string{"127.0.0.1:443", "example.com:22", "[::1]:443"} {
		req, _ := http.NewRequest("CONNECT", p.URL, nil)
		req.Host = target
		res, e := http.DefaultClient.Do(req)
		if e != nil {
			t.Fatal(e)
		}
		_ = res.Body.Close()
		if res.StatusCode != 403 {
			t.Fatal(target, res.StatusCode)
		}
	}
}
func TestAPIAuthenticationAndRedirection(t *testing.T) {
	var body map[string]any
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer worker-test" || r.Header.Get("x-vercel-protection-bypass") != "bypass-test" || r.Header.Get("x-halaldl-worker-protocol") != "3" {
			t.Error("missing authentication")
		}
		if strings.Contains(r.URL.String(), "bypass-test") {
			t.Error("secret in URL")
		}
		if r.Method == "POST" {
			_ = json.NewDecoder(r.Body).Decode(&body)
			w.Header().Set("Content-Type", "application/json")
			_, _ = io.WriteString(w, `{"ok":true}`)
		} else {
			w.Header().Set("Location", "https://untrusted.example")
			w.WriteHeader(307)
		}
	}))
	defer server.Close()
	api, e := newAPI(server.URL, "worker-test", "bypass-test", newID())
	if e != nil {
		t.Fatal(e)
	}
	api.Client.Transport = server.Client().Transport
	var response map[string]any
	if e = api.Call(context.Background(), "POST", "", map[string]any{"capacity": 12}, &response); e != nil {
		t.Fatal(e)
	}
	if body["capacity"] != float64(12) {
		t.Fatal(body)
	}
	if api.Call(context.Background(), "PUT", "probe", nil, nil) == nil {
		t.Fatal("redirect followed")
	}
	for _, origin := range []string{"http://example.com", "https://user:secret@example.com", "https://example.com?token=secret"} {
		if _, e = newAPI(origin, "secret", "", newID()); e == nil {
			t.Fatal(origin)
		}
	}
}
func TestCapacityReservation(t *testing.T) {
	r := Resources{AvailableMemory: 8 * GiB, HostFree: 20 * GiB, WorkFree: 3 * GiB}
	if capacityReason(r, nil, "download") != "ready" {
		t.Fatal("one job should fit")
	}
	j := fixtureJob()
	j.MaxBytes = 800 * MiB
	if capacityReason(r, []Job{j}, "download") != "low_work_disk" {
		t.Fatal("two worst-case jobs incorrectly admitted")
	}
	r.WorkFree = 36 * GiB
	if capacityReason(r, make([]Job, 0), "download") != "ready" {
		t.Fatal("expanded work capacity rejected")
	}
	r.HostFree = 3 * GiB
	if capacityReason(r, nil, "probe") != "low_host_disk" {
		t.Fatal("host reserve ignored")
	}
	for _, n := range []int{1, 2, 3, 4, 5, 100} {
		if retryDelay(n) > time.Minute {
			t.Fatal("unbounded backoff")
		}
	}
}
func TestMediaVerification(t *testing.T) {
	j := fixtureJob()
	valid := []byte(`{"streams":[{"codec_type":"video","width":1080,"height":1920},{"codec_type":"audio"}],"format":{"duration":"15","format_name":"mov,mp4"}}`)
	if _, e := verifyMedia(valid, j); e != nil {
		t.Fatal(e)
	}
	for _, bad := range []string{`{"streams":[{"codec_type":"video","height":720}],"format":{"duration":"15","format_name":"mp4"}}`, `{"streams":[{"codec_type":"audio"}],"format":{"duration":"15","format_name":"mp4"}}`, `{"streams":[{"codec_type":"video","height":720},{"codec_type":"audio"}],"format":{"duration":"NaN","format_name":"mp4"}}`} {
		if _, e := verifyMedia([]byte(bad), j); e == nil {
			t.Fatal(bad)
		}
	}
	j.DeliveryMode = "video_only"
	if _, e := verifyMedia(valid, j); e == nil {
		t.Fatal("video-only included audio")
	}
}
func TestSubprocessScrubsSecretsAndBoundsOutput(t *testing.T) {
	t.Setenv("WORKER_TOKEN", "must-not-leak")
	exe, _ := os.Executable()
	dir := t.TempDir()
	r, e := runCommand(context.Background(), dir, exe, []string{"-test.run=TestChildProcess", "--", "env"}, 15*time.Second, 1024)
	if e != nil || strings.TrimSpace(r.Stdout) != "" {
		t.Fatalf("environment leak: %q %v", r.Stdout, e)
	}
	_, e = runCommand(context.Background(), dir, exe, []string{"-test.run=TestChildProcess", "--", "output"}, 15*time.Second, 100)
	if e == nil {
		t.Fatal("output unbounded")
	}
	start := time.Now()
	_, e = runCommand(context.Background(), dir, exe, []string{"-test.run=TestChildProcess", "--", "sleep"}, 100*time.Millisecond, 1024)
	if e == nil || time.Since(start) > 5*time.Second {
		t.Fatal("timeout not enforced")
	}
}
func TestChildProcess(t *testing.T) {
	index := slices.Index(os.Args, "--")
	if index < 0 || index+1 >= len(os.Args) {
		return
	}
	switch os.Args[index+1] {
	case "env":
		fmt.Print(os.Getenv("WORKER_TOKEN"))
	case "output":
		fmt.Print(strings.Repeat("x", 10000))
	case "sleep":
		time.Sleep(time.Minute)
	}
	os.Exit(0)
}
func TestStorageSigning(t *testing.T) {
	s, e := newStorage(strings.Repeat("a", 32), "test-bucket", "test-access", "test-secret")
	if e != nil {
		t.Fatal(e)
	}
	s.Client.Transport = roundTripFunc(func(r *http.Request) (*http.Response, error) {
		if !strings.HasPrefix(r.Header.Get("Authorization"), "AWS4-HMAC-SHA256 Credential=test-access/") || !strings.Contains(r.Header.Get("Authorization"), "/auto/s3/aws4_request") || r.Header.Get("x-amz-content-sha256") != digest("") {
			t.Fatal("bad signature headers")
		}
		return &http.Response{StatusCode: 204, Body: io.NopCloser(strings.NewReader("")), Header: http.Header{}}, nil
	})
	if e = s.Delete(context.Background(), "fetch/"+newID()+"-"+newID()); e != nil {
		t.Fatal(e)
	}
	if s.Delete(context.Background(), "fetch/../../other") == nil {
		t.Fatal("unsafe key")
	}
}

func TestProtocolNegotiation(t *testing.T) {
	api, e := newAPI("https://project.vercel.app", "test-worker", "", newID())
	if e != nil {
		t.Fatal(e)
	}
	api.Client.Transport = roundTripFunc(func(r *http.Request) (*http.Response, error) {
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(`{"protocolVersions":[2,3]}`)), Header: http.Header{}}, nil
	})
	if e = api.Negotiate(context.Background()); e != nil {
		t.Fatal(e)
	}
	api.Client.Transport = roundTripFunc(func(r *http.Request) (*http.Response, error) {
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(`{"protocolVersions":[2]}`)), Header: http.Header{}}, nil
	})
	if api.Negotiate(context.Background()) == nil {
		t.Fatal("legacy API incorrectly accepted")
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
