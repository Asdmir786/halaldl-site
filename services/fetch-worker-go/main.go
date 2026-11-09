package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"slices"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

func logEvent(event string, detail map[string]any) {
	if detail == nil {
		detail = map[string]any{}
	}
	detail["event"] = event
	detail["time"] = time.Now().UTC().Format(time.RFC3339Nano)
	b, _ := json.Marshal(detail)
	log.Print(string(b))
}
func env(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
func envInt(key string, fallback, maximum int) (int, error) {
	s := env(key, strconv.Itoa(fallback))
	v, e := strconv.Atoi(s)
	if e != nil || v < 1 || v > maximum {
		return 0, fmt.Errorf("invalid %s", key)
	}
	return v, nil
}
func pause(ctx context.Context, d time.Duration) bool {
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-t.C:
		return true
	}
}

type activeJob struct {
	Job    Job
	cancel context.CancelFunc
}
type Runner struct {
	receiptFailed              bool
	receiptsPending            bool
	receiptVersion             uint64
	wake                       chan struct{}
	idleInterval, busyInterval time.Duration
	api                        *API
	processor                  *Processor
	storage                    *Storage
	spool                      string
	maxJobs, maxDownloads      int
	mu                         sync.Mutex
	active                     map[string]activeJob
	healthy                    bool
	wg                         sync.WaitGroup
	readResources              func(string) (Resources, error)
}

func (r *Runner) resources() (Resources, error) {
	if r.readResources != nil {
		return r.readResources(r.processor.WorkRoot)
	}
	return resources(r.processor.WorkRoot)
}

func (r *Runner) snapshot() []Job {
	r.mu.Lock()
	defer r.mu.Unlock()
	jobs := make([]Job, 0, len(r.active))
	for _, a := range r.active {
		jobs = append(jobs, a.Job)
	}
	return jobs
}
func capacityReason(resources Resources, active []Job, kind string) string {
	if resources.HostFree < 4*GiB {
		return "low_host_disk"
	}
	if resources.AvailableMemory < 3*GiB {
		return "low_memory"
	}
	var reserved, memoryReserved int64
	for _, j := range active {
		if j.Kind == "download" {
			reserved += 3*j.MaxBytes + 16*MiB
			memoryReserved += 256 * MiB
		} else {
			reserved += 16 * MiB
			memoryReserved += 128 * MiB
		}
	}
	required := int64(16 * MiB)
	memoryRequired := int64(128 * MiB)
	if kind == "download" {
		required = 3*800*MiB + 16*MiB
		memoryRequired = 256 * MiB
	}
	if resources.WorkerMemoryLimit > 0 && resources.WorkerMemoryLimit-resources.WorkerMemoryUsed-memoryReserved-memoryRequired < 128*MiB {
		return "low_worker_memory"
	}
	if resources.HostFree-reserved-required < 4*GiB {
		return "low_host_disk"
	}
	// Reserve worst-case remaining growth, including merge and track-copy files.
	if resources.WorkFree-reserved-required < 512*MiB {
		return "low_work_disk"
	}
	return "ready"
}
func (r *Runner) heartbeat(ctx context.Context) error {
	_, err := r.tick(ctx, false)
	return err
}
func (r *Runner) tick(ctx context.Context, claim bool) (*Job, error) {
	jobs := r.snapshot()
	res, e := r.resources()
	if e != nil {
		return nil, e
	}
	reason := capacityReason(res, jobs, "probe")
	r.mu.Lock()
	if r.receiptFailed || r.receiptsPending {
		reason = "receipt_failed"
	}
	r.mu.Unlock()
	if os.Getenv("FETCH_INTAKE_PAUSED") == "true" {
		reason = "updating"
	}
	entries := make([]map[string]string, 0, len(jobs))
	for _, j := range jobs {
		entries = append(entries, map[string]string{"id": j.ID, "leaseToken": j.LeaseToken})
	}
	var response struct {
		OK           bool     `json:"ok"`
		ActiveJobIDs []string `json:"activeJobIds"`
		Job          *Job     `json:"job"`
	}
	kinds := make([]string, 0, 2)
	downloads := 0
	for _, j := range jobs {
		if j.Kind == "download" {
			downloads++
		}
	}
	if claim && reason == "ready" && len(jobs) < r.maxJobs {
		if downloads < r.maxDownloads && capacityReason(res, jobs, "download") == "ready" {
			kinds = append(kinds, "download")
		}
		if capacityReason(res, jobs, "probe") == "ready" {
			kinds = append(kinds, "probe")
		}
	}
	e = r.api.Call(ctx, "POST", "", map[string]any{"claim": len(kinds) > 0, "claimKinds": kinds, "protocolVersion": 3, "workerId": r.api.WorkerID, "capacity": r.maxJobs, "activeJobs": entries, "runningJobs": len(jobs), "waitingJobs": 0, "accepting": reason == "ready", "downloadAccepting": capacityReason(res, jobs, "download") == "ready", "detail": reason, "transcoding": false, "memoryFreeMb": res.AvailableMemory / MiB, "diskFreeMb": res.HostFree / MiB, "cpuCount": runtime.NumCPU()}, &response)
	r.mu.Lock()
	r.healthy = e == nil && response.OK && reason == "ready"
	if e == nil && response.OK {
		for _, j := range jobs {
			if !slices.Contains(response.ActiveJobIDs, j.ID) {
				if a, ok := r.active[j.ID]; ok {
					a.cancel()
				}
			}
		}
	}
	r.mu.Unlock()
	return response.Job, e
}
func (r *Runner) saveReceipt(result Result) error {
	b, e := json.Marshal(result)
	if e != nil {
		return e
	}
	target := filepath.Join(r.spool, result.ID+"-"+result.LeaseToken+".json")
	f, e := os.OpenFile(target+".next", os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0600)
	if e != nil {
		return e
	}
	if _, e = f.Write(b); e == nil {
		e = f.Sync()
	}
	closeErr := f.Close()
	if e != nil {
		return e
	}
	if closeErr != nil {
		return closeErr
	}
	return os.Rename(target+".next", target)
}
func (r *Runner) flush(ctx context.Context) error {
	files, e := os.ReadDir(r.spool)
	if e != nil {
		return e
	}
	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".json") {
			continue
		}
		path := filepath.Join(r.spool, file.Name())
		info, e := file.Info()
		if e != nil || !info.Mode().IsRegular() || info.Size() > 512_000 {
			return fmt.Errorf("invalid_receipt")
		}
		b, e := os.ReadFile(path)
		if e != nil {
			return e
		}
		var result Result
		if e = json.Unmarshal(b, &result); e != nil {
			return e
		}
		if !uuidPattern.MatchString(result.ID) || !uuidPattern.MatchString(result.LeaseToken) || result.WorkerID != r.api.WorkerID {
			return fmt.Errorf("invalid_receipt")
		}
		e = r.api.Call(ctx, "PATCH", "", result, nil)
		if e != nil {
			var apiError *APIError
			if !errors.As(e, &apiError) || !slices.Contains([]int{404, 409, 410}, apiError.Status) {
				return e
			}
			if result.ObjectKey != "" && strings.HasPrefix(result.ObjectKey, "fetch/"+result.ID+"-") {
				if e = r.storage.Delete(ctx, result.ObjectKey); e != nil {
					return e
				}
			}
		}
		if e = os.Remove(path); e != nil {
			return e
		}
	}
	return nil
}
func (r *Runner) start(ctx context.Context, j Job) {
	jobCtx, cancel := context.WithCancel(ctx)
	r.mu.Lock()
	r.active[j.ID] = activeJob{j, cancel}
	r.mu.Unlock()
	r.wg.Add(1)
	go func() {
		defer r.wg.Done()
		defer cancel()
		result := r.processor.Process(jobCtx, j)
		if e := r.saveReceipt(result); e != nil {
			logEvent("receipt_write_failed", map[string]any{"jobId": j.ID})
			r.mu.Lock()
			r.healthy = false
			r.receiptFailed = true
			r.mu.Unlock()
		}
		r.mu.Lock()
		delete(r.active, j.ID)
		r.receiptsPending = true
		r.receiptVersion++
		r.mu.Unlock()
		r.signalTick()
	}()
}
func (r *Runner) signalTick() bool {
	select {
	case r.wake <- struct{}{}:
		return true
	default:
		return false
	}
}
func (r *Runner) interval() time.Duration {
	if len(r.snapshot()) > 0 {
		if r.busyInterval > 0 {
			return r.busyInterval
		}
		return 10 * time.Second
	}
	if r.idleInterval > 0 {
		return r.idleInterval
	}
	return 15 * time.Second
}
func (r *Runner) Run(ctx context.Context) error {
	ctx, cancel := context.WithCancel(ctx)
	if r.wake == nil {
		r.wake = make(chan struct{}, 1)
	}
	r.mu.Lock()
	r.receiptsPending = true
	r.mu.Unlock()
	var maintenance chan error
	var maintenanceVersion uint64
	var cleanup chan error
	cleanupFailures := 0
	nextTick, nextMaintenance, cleanupAt := time.Now(), time.Now(), time.Now()
	cooldown := time.Time{}
	failures, maintenanceFailures := 0, 0
	defer func() {
		cancel()
		r.wg.Wait()
		if maintenance != nil {
			<-maintenance
		}
		if cleanup != nil {
			<-cleanup
		}
	}()
	for ctx.Err() == nil {
		r.mu.Lock()
		pending := r.receiptsPending
		r.mu.Unlock()
		if maintenance == nil && !time.Now().Before(nextMaintenance) && pending {
			r.mu.Lock()
			maintenanceVersion = r.receiptVersion
			r.mu.Unlock()
			maintenance = make(chan error, 1)
			go func(done chan error) { done <- r.flush(ctx) }(maintenance)
		}
		if cleanup == nil && !time.Now().Before(cleanupAt) {
			cleanup = make(chan error, 1)
			go func(done chan error) { done <- r.api.Call(ctx, "DELETE", "", nil, nil) }(cleanup)
		}
		delay := time.Until(nextTick)
		if delay < 0 {
			delay = 0
		}
		timer := time.NewTimer(delay)
		select {
		case <-ctx.Done():
			timer.Stop()
			return nil
		case err := <-maintenance:
			timer.Stop()
			maintenance = nil
			if err != nil {
				maintenanceFailures++
				nextMaintenance = time.Now().Add(retryDelay(maintenanceFailures))
				logEvent("maintenance_retry", map[string]any{"error": err.Error()})
			} else {
				maintenanceFailures = 0
				nextMaintenance = time.Now()
				r.mu.Lock()
				wasPending := r.receiptsPending
				if maintenanceVersion == r.receiptVersion {
					r.receiptsPending = false
				}
				r.mu.Unlock()
				if wasPending {
					r.signalTick()
				}
			}
			continue
		case err := <-cleanup:
			timer.Stop()
			cleanup = nil
			if err == nil {
				cleanupFailures = 0
				cleanupAt = time.Now().Add(5 * time.Minute)
			} else {
				cleanupFailures++
				cleanupAt = time.Now().Add(retryDelay(cleanupFailures))
				if ctx.Err() == nil {
					logEvent("cleanup_retry", map[string]any{"error": err.Error()})
				}
			}
			continue
		case <-r.wake:
			timer.Stop()
			if time.Now().Before(cooldown) {
				continue
			}
		case <-timer.C:
		}
		if ctx.Err() != nil {
			break
		}
		started := time.Now()
		job, err := r.tick(ctx, true)
		if err != nil {
			failures++
			cooldown = time.Now().Add(retryDelay(failures))
			nextTick = cooldown
			if ctx.Err() == nil {
				logEvent("worker_retry", map[string]any{"error": err.Error(), "retryMs": retryDelay(failures).Milliseconds()})
			}
			continue
		}
		failures = 0
		cooldown = time.Time{}
		if job != nil {
			if job.WorkerID != r.api.WorkerID || job.Validate() != nil {
				return fmt.Errorf("invalid_claim")
			}
			r.start(ctx, *job)
			if len(r.snapshot()) < r.maxJobs {
				r.signalTick()
			}
		}
		nextTick = started.Add(r.interval())
	}
	return nil
}
func main() {
	log.SetFlags(0)
	check := flag.Bool("preflight", false, "validate sandbox and configuration without claiming jobs")
	flag.Parse()
	if e := run(*check); e != nil {
		logEvent("worker_start_failed", map[string]any{"error": e.Error()})
		os.Exit(1)
	}
}
func run(check bool) error {
	bind, wakeToken := strings.TrimSpace(os.Getenv("FETCH_WAKE_BIND")), strings.TrimSpace(os.Getenv("FETCH_WAKE_TOKEN"))
	if err := validateWake(bind, wakeToken, strings.TrimSpace(os.Getenv("WORKER_TOKEN")), strings.TrimSpace(os.Getenv("VERCEL_AUTOMATION_BYPASS_SECRET"))); err != nil {
		return err
	}
	maxJobs, e := envInt("FETCH_MAX_RUNNING", 2, 12)
	if e != nil {
		return e
	}
	downloads, e := envInt("FETCH_MAX_DOWNLOADS", 2, 12)
	if e != nil {
		return e
	}
	work, e := filepath.Abs(env("FETCH_WORK_ROOT", "/var/lib/halaldl-fetch/work"))
	if e != nil {
		return e
	}
	spool, e := filepath.Abs(env("FETCH_RECEIPT_ROOT", "/var/lib/halaldl-fetch/receipts"))
	if e != nil {
		return e
	}
	if e = preflight(work, maxJobs); e != nil {
		return e
	}
	jsRuntime, e := exec.LookPath(env("JS_RUNTIME_PATH", "node"))
	if e != nil {
		return fmt.Errorf("required JavaScript runtime unavailable")
	}
	for _, tool := range []string{env("YT_DLP_PATH", "/opt/halaldl-fetch/bin/yt-dlp"), env("FFMPEG_PATH", "/usr/bin/ffmpeg"), env("FFPROBE_PATH", "/usr/bin/ffprobe"), jsRuntime} {
		info, e := os.Stat(tool)
		if e != nil || !info.Mode().IsRegular() || info.Mode().Perm()&0111 == 0 {
			return fmt.Errorf("required media executable unavailable")
		}
	}
	for _, p := range []string{work, spool} {
		if e = os.MkdirAll(p, 0700); e != nil {
			return e
		}
	}
	idPath := filepath.Join(spool, "worker-id")
	b, e := os.ReadFile(idPath)
	id := strings.TrimSpace(string(b))
	if os.IsNotExist(e) {
		id = newID()
		e = os.WriteFile(idPath, []byte(id+"\n"), 0600)
	}
	if e != nil || !uuidPattern.MatchString(id) {
		return fmt.Errorf("invalid worker identity")
	}
	api, e := newAPI(os.Getenv("FETCH_API_URL"), os.Getenv("WORKER_TOKEN"), os.Getenv("VERCEL_AUTOMATION_BYPASS_SECRET"), id)
	if e != nil {
		return e
	}
	storage, e := newStorage(os.Getenv("R2_ACCOUNT_ID"), os.Getenv("R2_BUCKET"), os.Getenv("R2_ACCESS_KEY_ID"), os.Getenv("R2_SECRET_ACCESS_KEY"))
	if e != nil {
		return e
	}
	if e = api.Negotiate(context.Background()); e != nil {
		return e
	}
	if check {
		logEvent("preflight_passed", nil)
		return nil
	}
	proxy, e := newEgress("127.0.0.1:18656", strings.Split(os.Getenv("FETCH_BLOCKED_ADDRESSES"), ","))
	if e != nil {
		return e
	}
	defer proxy.Close()
	p := &Processor{YTDLP: env("YT_DLP_PATH", "/opt/halaldl-fetch/bin/yt-dlp"), FFmpeg: env("FFMPEG_PATH", "/usr/bin/ffmpeg"), FFprobe: env("FFPROBE_PATH", "/usr/bin/ffprobe"), JSRuntime: jsRuntime, WorkRoot: work, ProxyURL: proxy.URL, Upload: storage.Upload}
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()
	runner := &Runner{api: api, processor: p, storage: storage, spool: spool, maxJobs: maxJobs, maxDownloads: min(downloads, maxJobs), active: map[string]activeJob{}, wake: make(chan struct{}, 1)}
	if bind != "" {
		listener, err := listenWake(bind, wakeToken, func() {
			if len(runner.snapshot()) < runner.maxJobs && runner.signalTick() {
				logEvent("wake_received", nil)
			}
		})
		if err != nil {
			return err
		}
		defer closeWake(listener)
	}
	logEvent("worker_started", map[string]any{"capacity": maxJobs, "downloadSlots": runner.maxDownloads})
	return runner.Run(ctx)
}
