# Go fetch worker (release candidate)

This replaces the Node worker coordinator. yt-dlp still extracts/downloads media,
FFmpeg copies or merges tracks, and ffprobe verifies the actual output. A Node
JavaScript runtime remains available to yt-dlp for sources that require it.

Nothing in this directory installs or starts the production service. The old
`../fetch-worker` implementation remains available for rollback and comparison.

## Build and test

Use the verified stable Go 1.27 toolchain (development used Go 1.27.3). This module
has no third-party Go dependencies.

```powershell
go test ./...
go vet ./...
$env:GOOS='linux'
$env:GOARCH='amd64'
$env:CGO_ENABLED='0'
go build -trimpath -o halaldl-fetch .
go test -c -o worker.test .
```

Linux tests include real local H264/AAC fixtures, FFmpeg/ffprobe, subprocess tree
termination, and twelve-job scheduler/receipt integration against an isolated TLS
API. The extractor and upload adapters in those tests are deliberate fixtures;
they never contact production or certify upstream-source/R2 availability.

The opt-in `TestCapacityBenchmark` runs three waves at concurrency 2, 4, 8, 10,
and 12. It measures elapsed time, completions, peak active jobs, output bytes, and
sampled RSS of the test process plus its descendants. Run in a temporary systemd
unit with PrivateNetwork=yes, two CPU cores, 1.5 GiB RAM, no swap, 128 tasks, a
512 MiB temporary filesystem, and a ten-minute runtime limit. Set
`FETCH_RUN_BENCHMARK=1` only in that test unit. This is not a large-file or
internet-bandwidth benchmark. See `docs/FETCH_GO_VERIFICATION_2026-11-07.md`.

A reproducible sandbox invocation (use a separate test-artifact path) is:

```sh
systemd-run --wait --pipe --collect \
  -p DynamicUser=yes -p PrivateNetwork=yes -p NoNewPrivileges=yes \
  -p ProtectSystem=strict -p ProtectHome=yes \
  -p CPUQuota=200% -p MemoryMax=1536M -p MemorySwapMax=0 \
  -p TasksMax=128 -p RuntimeMaxSec=600 \
  -p 'TemporaryFileSystem=/run/halaldl-fetch-go-work:rw,size=512M,mode=1777,exec' \
  --setenv=TMPDIR=/run/halaldl-fetch-go-work \
  --setenv=FETCH_RUN_BENCHMARK=1 \
  /path/to/test-artifacts/worker.test -test.v -test.timeout=9m
```

Use an explicit mount away from `/tmp`: DynamicUser's private temporary directory
can mask a filesystem mounted at `/tmp`. The sandbox preflight test verifies the
actual selected mount, size and cgroup limits before capacity claims are made.

## Worker contract

- The existing HTTPS worker API remains the database authority. The Go worker
  negotiates protocol 3 before reporting readiness or claiming jobs.
- One scheduler owns configurable total/download slots, up to twelve. The server
  clamps advertised slots to its independently configured `FETCH_MAX_RUNNING`.
  The default is conservative; raising a number does not bypass resource checks.
- Claims are atomic and carry worker identity, an attempt-specific token, and a
  90-second lease. Heartbeats run every ten seconds and renew only owned active
  jobs. Lost leases cancel their subprocesses. Expired jobs requeue at most twice;
  old completions cannot overwrite a later attempt.
- A persistent, private `worker-id` in the receipt directory allows acknowledged
  results to be reconciled after restart. Receipts are fsynced, atomically renamed,
  and retried independently. Terminally rejected uploads delete only their own
  job-prefixed object. A receipt write failure stops further admission.
- Public availability becomes stale after thirty seconds. Probe and download
  readiness are separate, so link choices can remain visible while file
  preparation is unavailable. New work is rejected before quota changes when
  its required worker capability is unavailable.
- A shared HTTPS CONNECT proxy resolves every destination, rejects mixed
  public/private DNS and host-local addresses, and dials the validated address.
  The existing dedicated-UID nftables policy and ready marker remain required.
- Subprocesses receive a scrubbed environment. Linux process groups are killed
  on cancellation/deadline, stdout is bounded, and intermediate files are
  monitored. Downloads are verified for size, duration, tracks, container and
  portrait-aware resolution before streaming to R2 with AWS Signature V4.

## Configuration and resource reservations

Use the existing worker API token, stable production alias, automation bypass
header secret, R2 credentials, executable paths, and dedicated work/receipt paths.
Keep all credentials out of public browser variables and URLs.

`FETCH_MAX_RUNNING` defaults to 2 in Go and supports 1..12. Configure the same
value on the website; the API otherwise defaults to 1. `FETCH_MAX_DOWNLOADS`
limits expensive jobs separately. The candidate service starts with two total
slots and one download slot. `JS_RUNTIME_PATH` can select the installed Node
runtime used by yt-dlp; an empty value discovers it on the service PATH.

Reservations cover worst-case temporary growth: three times the job's file cap
plus 16 MiB for a download, or 16 MiB for a probe. Keep at least 512 MiB in the
work volume and 4 GiB on the host after outstanding reservations. Worker memory
also reserves 256 MiB per download or 128 MiB per probe, plus 128 MiB headroom;
host available memory must remain above 3 GiB. Conservative reservation can
reduce actual concurrency below the configured ceiling. Preflight requires a
separate bounded work mount, cgroup v2 limits, and the managed egress guard.

The present 3 GiB production work volume cannot reserve twelve 800 MiB jobs.
Those jobs require approximately 28.8 GiB of work capacity including the safety
floor, plus host headroom. No disk expansion or resource-limit change has been
applied by this implementation.

## Future rollout, after approval

1. Review the verification report and select a proven resource/concurrency budget.
2. Back up the database, worker environment, current executable and service unit.
3. Publish the backward-compatible API/UI and additive schema first. Verify old
   protocol-2 worker behavior and health gating with the API ceiling still low.
4. Pause intake and drain running jobs before stopping the Node service. Preserve
   queued jobs, existing receipt files, storage objects, accounts and sessions.
5. Install the reviewed Go binary and candidate unit, configure both concurrency
   ceilings and the correct JS runtime, then run preflight and start the worker.
6. Verify a fresh protocol-3 heartbeat, a controlled real probe/download/preview,
   ownership, and existing queue recovery. Raise concurrency only within measured
   disk, memory, CPU and provider limits.

For rollback, drain/stop Go and restore the saved Node executable/unit/environment.
Do not drop the additive columns. A fresh Go heartbeat fences a different worker
for thirty seconds; unfinished leases expire within ninety seconds. Allow that
window before legacy claiming resumes. Do not erase queued jobs or receipts to
force a faster rollback.
