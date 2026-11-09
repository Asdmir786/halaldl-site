# Worker doorbell and invocation reduction — 9 November 2026

The baseline is the source recovered from production deployment
`dpl_GJEemh7dbyPzynbhGTn6bawYzPn9`, including protocol 3, the Go worker,
leases, recovery/history and cancellation. The earlier Node-only doorbell patch
is archived locally under `.analytics/invocation-reduction-20261109/original-patch`.
Do not deploy the older checkout in place of the recovered production source.

## Behavior

The Go scheduler sends one combined heartbeat/claim POST every 15 seconds while
idle, or every 10 seconds with active jobs. It claims only eligible kinds within
the existing two total/one download slots. A claimed job causes a fresh capacity
check to fill a remaining slot. Existing worker POST and PUT contracts remain;
opt-in POST adds `claim: true` and `claimKinds`, returning `job` alongside
`ok` and `activeJobIds`. Lease renewal and cancellation remain authoritative.
Receipts and five-minute cleanup do not block heartbeat requests. API failures
back off to 60 seconds; wakes do not bypass cooldowns.

The listener accepts only an authenticated empty `POST /wake`, carries no job or
media data, and binds only IPv4 loopback. Missing and reused wake secrets are
rejected at startup. Repeated rings coalesce; a full worker ignores external
rings. Committed new probes and confirmed downloads schedule a bounded one-second
notification through Next `after()`. Retry/change-quality use the same probe
path. Duplicates do not ring. Empty `FETCH_WAKE_URL` disables notification.

Visible browser status refreshes every 30 seconds. History refreshes on initial
load, successful mutations, job completion and stale foreground return. Active
jobs retain two-second reads; waiting choices use 30 seconds, finished jobs have
no recurring reads. Hidden pages stop read timers and abort pending reads;
mutations continue. Read errors back off to 30 seconds, history failures retry
after 60 seconds. Lost submission recovery temporarily checks every two seconds.

Database bootstrap is explicit: supply the intended `DATABASE_URL`, then run
`pnpm fetch:db:init`. Runtime clients perform a cached connectivity check and
do not issue schema DDL. The existing schema initializer remains available to
the operator command and disposable database tests.

## HTTPS and installation

Install all Go source/build artifacts as one reviewed release; retain the
current binary, root-owned environment, unit and receipt directory for rollback.
Keep resource limits and the dedicated worker egress rules unchanged.

1. Publish the compatible site with `FETCH_WAKE_URL` empty. Run the explicit
   schema initializer before removing request-time bootstrap in production.
2. Drain active jobs, then replace only `/opt/halaldl-fetch/halaldl-fetch`.
   Generate a new random 32-byte hex secret in the root-owned mode-600 worker
   environment. Set `FETCH_WAKE_BIND=127.0.0.1:18657` and `FETCH_WAKE_TOKEN`.
   Preserve all existing secrets, worker identity, receipts and concurrency.
3. Verify the Docker bridge still uses `10.0.1.1`, then install the relay socket
   and service from the Go `ops` directory. The socket listens only on
   `10.0.1.1:18658` and forwards to `127.0.0.1:18657`. Neither uses a public bind.
   The host has default-deny UFW INPUT. Add only this private bridge rule:
   `ufw allow in on br-c0b0f1e9c444 from 10.0.1.0/24 to 10.0.1.1 port 18658 proto tcp comment 'HalalDL private wake relay'`.
   Back up UFW configuration first. This does not open a public-address port or
   alter the worker UID's egress policy. Reverify the bridge name after Docker
   network changes; remove this exact rule during a full doorbell rollback.
4. Add only `halaldl-wake.yml` to `/data/coolify/proxy/dynamic/`. Existing Traefik
   file watching loads the hostname/path route and Let's Encrypt certificate.
   Do not restart the shared proxy or modify its Docker configuration.
5. Verify DNS, certificate trust, authenticated wake acceptance and token/body
   rejection through `https://halaldl-wake.13.140.157.250.sslip.io/wake`. This
   hostname depends on sslip.io DNS, following the server's existing pattern.
6. Add the matching Vercel server-side wake token and URL, then redeploy HalalDL.
   Never expose secrets through browser variables, URLs, logs or command arguments.

Check a real probe, confirmation, cancellation, second-slot use and missed-wake
fallback. Retain fixture tests separately from actual source/R2 acceptance.
Record deployment IDs, binary hashes, certificate status, service/container IDs,
request cadence and error counts. A successful build is not live verification.

For notification rollback, clear the Vercel URL and redeploy; the 15-second tick
continues. To roll back the worker, drain and restore the complete previous Go
binary/configuration while preserving receipts. Remove only the HalalDL dynamic
route and relay units if necessary. Keep unrelated proxy routes and applications.

## Savings model

| Healthy steady-state baseline | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Idle worker API calls/day, including cleanup | 20,448 | 6,048 | 70.4% |
| Same worker baseline over 30 days | 613,440 | 181,440 | 432,000 calls |
| Visible idle browser reads/hour, excluding initial loads/actions | 1,440 | 120 | 91.7% |
| Visible active browser reads/hour | 3,240 | 1,920 | 40.7% |
| Waiting-choice browser reads/hour | 3,240 | 240 | 92.6% |

These are scheduling estimates. Jobs, wakes, startup, retries, user actions and
response durations change actual counts. They do not establish the percentage
reduction in total Vercel CPU, memory or monthly invoice. Record controlled
browser counts and observed production worker cadence separately after rollout.

## Production receipt (added locally after publication)

- Final website deployment: `dpl_2GSqAzVJrCH3hNmnsQmhvqxkpRQp`. Both public and stable worker API
  aliases were independently resolved to it; production health reports available,
  worker connected and downloads enabled.
- Installed Go binary SHA-256:
  `a3d8562ddca1a759c609c90f45bf50d5dcee2b849b79c8f663f3528d69b267e4`.
  Root-owned rollback directory: `/var/backups/halaldl-fetch/20261109T133118Z-doorbell`.
- The TLS certificate is trusted. Empty authenticated wake returns 204; missing
  authentication returns 401; nonempty bodies return 400 and GET returns 405.
  External TCP checks could not reach ports 18657 or 18658. Unit permissions were
  verified as root-owned 0644; environment remains root-owned 0600.
- All **35 pre-existing containers retained their IDs**, including the shared
  proxy. Worker CPU quota remains 200%, memory maximum 1536 MiB and tasks 128.
  The only firewall addition permits the private bridge's wake relay port.
- Explicit schema initialization retained **65 columns before and after**. No
  application records were deleted. Disposable verification databases were removed.
- Local checks passed: 41 fetch tests, 10 isolated HTTP checks, 5 handoff tests,
  typecheck, lint and production build. Three real disposable-database suites
  passed, including combined POST claims, post-commit notifications, duplicate
  suppression, kind priority, two slots, leases, cancellation, quotas and recovery.
- Go race checks and vet passed. Sixteen tests passed in the bounded Linux host
  test unit, including real FFmpeg media modes, process-tree cancellation,
  sandbox preflight and twelve-job receipt lifecycle. Race tests in the isolated
  compiler container passed sixteen checks; media/sandbox tests there are skipped
  and were exercised separately on the host. No capacity benchmark was run.
- A real visitor-flow SoundCloud probe and confirmation reached **Ready** for
  operator-owned canary `79aaf756-17c0-40dc-828b-b688f6165eff`: M4A, **5,405,229 bytes**, 267.912 seconds.
  Source: [Rise Above by Scott Buckley](https://soundcloud.com/scottbuckley/rise-above-cc-by),
  released under CC-BY 4.0; credit www.scottbuckley.com.au. No fabricated browser
  clearance was used. The normal browser form completed successfully.
- The production worker journal recorded the successful probe and download with
  **zero worker, receipt or cleanup retry events** during the observed rollout.
  Additional live cancellation/outage drills were not run; those paths were
  checked in the automated database, scheduler and Linux tests.
- A controlled browser observation recorded **4 status reads and zero history
  reads in 120.7 seconds**, versus 48 reads scheduled by the old timers:
  **91.7% fewer**. The production idle sample below validates the worker
  cadence; it does not represent a full billing cycle.
- Production worker sample: `2026-11-09T13:45:11.464Z` to `2026-11-09T13:50:11.464Z`; 21 requests, response
  groups `{"POST": {"count": 20, "errors": 0}, "DELETE": {"count": 1, "errors": 0}}`, median POST interval **15.017 seconds**. The API returned
  the complete filtered sample rather than a truncated log page.
- Local preview servers and task browser tabs were closed at the user's request
  to keep the gaming machine free of additional local workload. Build/test runs
  were finished; final verification used lightweight API and server reads.

Detailed JSON and test logs are retained locally in
`.analytics/invocation-reduction-20261109/`. Scheduled monthly request savings are
projections. Actual Vercel CPU, memory and invoice reductions require longer
production usage data. This receipt was added after the initial publication and is included in the
Git commit with the recovered source and invocation-reduction implementation.
