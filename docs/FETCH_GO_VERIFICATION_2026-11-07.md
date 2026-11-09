# Fetch Go worker and UI verification — 7 November 2026

Status: release candidate, not deployed. Production still runs the prior Node
worker. Website source, schema additions, Go executable, service unit and
concurrency settings have not been published or installed in production.

## Implemented behavior

- The website checks actual worker heartbeat/readiness and storage configuration.
  Offline, maintenance and resource pauses disable new submissions. The API
  independently rejects unavailable work with HTTP 503 before spending quota.
- Link checks and file preparation have separate readiness. Available quality
  choices remain visible when preparation is paused. Existing accepted jobs
  remain recoverable during an outage.
- One compact result card displays Queued, Working, Choose a file, Done, Paused
  or the actual failure. The visual roadmap/stepper is removed. No fabricated
  progress percentages or completion estimates are shown.
- Failed submissions retain the entered link and rights acknowledgement; failed
  preparation retains the selection. Saved jobs retry loading after connection
  failures. An interrupted submission response can be recovered when the current
  session identifies the accepted job.
- The Go worker coordinates yt-dlp, FFmpeg, verified local output and streaming
  R2 storage. Its pool supports up to twelve total jobs, with a separate limit
  for expensive downloads and conservative disk/memory reservations.
- Protocol 3 is negotiated before readiness. Atomic claims have identity,
  attempt tokens and renewable ninety-second leases. Heartbeats batch-renew
  owned leases. Expired jobs retry at most twice; stale and cross-protocol
  completions are fenced. Private fsynced receipts survive a restart.
- The public-only, ownership, per-account/session limits, source throttles,
  egress protections, scrubbed child environment and process-tree cancellation
  remain. No accounts, private cookies, proxies or paid providers were added.

## Actual server capacity test

The final measured run used a transient systemd unit on the actual shared host,
with PrivateNetwork=yes, two CPU cores, 1.5 GiB memory, no swap, 128 tasks, and
an explicitly verified 512 MiB temporary filesystem at
`/run/halaldl-fetch-go-work`. No production API/database/storage credentials or
production queue access were provided to that unit. All temporary media stayed
inside its temporary filesystem.

Workload: an eight-second 1280×720 H264/AAC local video, equal numbers of combined
video/audio, audio extraction and silent-video extraction, three waves per
concurrency setting. FFmpeg and ffprobe were real. The source extractor was a
local deterministic fixture, and the upload adapter read the output locally.
This measures bounded media-pipeline concurrency, not internet/provider speed.

| Concurrent jobs | Completed | Failures | Batch time | Jobs/sec | Sampled peak RSS |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 6 | 0 | 1.90 s | 3.16 | 86.9 MiB |
| 4 | 12 | 0 | 5.88 s | 2.04 | 134.7 MiB |
| 8 | 24 | 0 | 8.86 s | 2.71 | 257.9 MiB |
| 10 | 30 | 0 | 9.19 s | 3.27 | 295.7 MiB |
| 12 | 36 | 0 | 13.10 s | 2.75 | 326.6 MiB |

All 108 benchmark jobs completed with zero failures. The full Go scheduler also
completed twelve jobs through an isolated TLS API and acknowledged/removed their
receipts. The dedicated-work-mount/cgroup/egress preflight passed, and a normal
directory was correctly rejected as a replacement for the bounded mount.

RSS is a 100 ms sample of the test process and descendants, excluding page cache;
it is not a worst-case memory guarantee. The host's systemd memory-peak summary
was inconsistent with process RSS and was not used in the table. Throughput was
not monotonic under the two-core limit and shared-host activity; these are
observations, not a statistically established optimum.

## What the current production server can safely start

The host was observed with six CPU cores, about 12 GiB RAM, approximately 8.4 GiB
free root disk, and a dedicated work filesystem with roughly 2.9 GiB usable.
Other applications share the machine.

Twelve small fixture jobs worked. Twelve maximum-size real jobs are not certified
or safely provisioned. For twelve 800 MiB jobs, the implemented worst-case disk
reservation is `12 × (3 × 800 + 16) + 512 = 29,504 MiB`, approximately 28.8 GiB of
work space, plus host headroom. The existing 3 GiB work volume cannot provide it.
Real yt-dlp/provider memory and rate-limit behavior also need staged observation.

The candidate starts at two total slots and one heavy download slot; resource
checks can reduce actual concurrency. Both API and worker ceilings are explicit
and configurable up to twelve. No automatic increase, disk expansion, cleanup of
shared applications or server resource-limit change was applied. Raising the
ceiling alone cannot bypass capacity checks.

## Verification receipts

- Go 1.27.3 Windows unit suite and `go vet`: passed.
- Go Linux suite in the verified isolated server mount: all fifteen tests passed,
  including real media modes, deadline/output limits, process-tree cancellation,
  SSRF/DNS rules, protocol negotiation, sandbox preflight and scheduler lifecycle.
- Fetch unit/worker suite: 32 passed.
- Isolated HTTP smoke suite: eight passed, including worker GET
  authentication, private-request rejection and preview ownership boundaries.
- Existing desktop-handoff suite: five passed.
- Browser fixtures: 72 states (360/390/768/1366 widths, both themes), three outage
  recovery scenarios, audio selection and no horizontal overflow passed. Keyboard
  navigation to the primary action and its visible focus outline also passed.
- Changed-file ESLint, TypeScript and optimized production build: passed.
- Final disposable PostgreSQL regression suite: passed, including batched lease
  renewal and cross-protocol stale-result fencing. The disposable database
  `halaldl_fetch_verify_20261107_209ce655` was removed after the run.

The PostgreSQL suites use newly created empty databases named
`halaldl_fetch_verify_20261107_*`; no production rows are copied. They cover
concurrent admission, quotas, ownership, queue ranks, offline and download-only
pauses, sixteen simultaneous claims capped at twelve, lease renewal, expiry,
retry fencing and idempotent completions. Disposable databases are dropped after
execution, including failed runs. Storage is stubbed for these database tests.

The Go storage signer has deterministic unit coverage. A live Go-to-R2 round
trip, source-specific real downloads, authenticated Google/Turnstile flows and
internet-bandwidth saturation have not been newly certified by this isolated
work. Browser Ready/Preview screens use explicit fixtures. Upstream source
restrictions (including YouTube challenges) are not solved by changing language.
The Go race detector was not run because no Linux C compiler is installed; no
compiler or host-wide software was installed to obtain it.

## Deployment boundary and rollback

No Vercel publication, Git push, production schema migration, production service
restart, shared firewall change or production concurrency change was performed.
The production worker remained PID 1162252 with zero restarts and start time
06:19:50 PKT, predating this implementation request. Its Node source hash remained
`ca5b2deca696e84c0a04c918350d241c3c3ba2c27033f6018fcaa462fbf34bbb`.

The old Node implementation is retained. After approval, publish the compatible
API/schema first, pause and drain existing work, then replace the service with
the reviewed Go candidate. Preserve queue rows, sessions, objects and receipts.
Keep the prior service/environment/binary backup. On rollback, keep additive
columns and allow the heartbeat/lease ownership windows to expire before legacy
claiming resumes. Detailed build/configuration and rollout instructions are in
`services/fetch-worker-go/README.md`.

Evidence files are local under `.analytics/fetch-go/`: `capacity-results.json`,
`server-bounded-final.log`, `database-test.log`, `ui-results.json`, and screenshots.
These diagnostics are ignored by Git and contain test data, not deployment secrets.

## Final candidate hashes

- `halaldl-fetch` SHA-256: `ec68d1d3d9891701051915f9be581c0a7e04536fd61576a708758b40a8251c99`.
- `worker.test` SHA-256: `c09b764178c85a4207e29eafede25bbc98352201a0d30712281fee981d785b0e`.

The final candidate remains uncommitted in the website checkout. Existing dirty
changes from the earlier incident were preserved; no desktop-app files were edited.

Temporary server test binaries were removed after verification. Transient units
and their temporary media filesystems finished; production PID/hash were checked
again without restarting the service. Review artifacts remain local.
