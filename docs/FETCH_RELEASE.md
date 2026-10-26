# Public downloader implementation and release

The website and protocol-2 worker are live. The 2026-10-27 update lets all nine recognized platforms attempt public downloads, with a notice about possible source issues. This supersedes the earlier two-source admission restriction; it does not certify every source as working. Source starts from `0b218377ada069da2539969a6334d0b7328bcb77` plus the website work below. Publication receipts identify deployed source packages; later local changes are not automatically live. No existing account or secret rows were deleted. Database changes were additive, with retained row counts verified. Earlier verification and publication sections below are historical snapshots.

## Delivered behavior

- Guest and free Google sign-in remain; persisted legacy paid flags receive free limits. Uploads return 410, private requests are refused, private jobs cannot be downloaded, and workers reject cookie/proxy payloads. The retired guide redirects to `/guides/web-fetch`.
- The header and `/fetch` use separate width constraints, a labelled link field, Paste/Clear, useful file choices, progress/recovery messages and optional notifications. Only the current job UUID is stored for browser recovery; source links are not stored in browser storage.
- Download choices retain audio, use server-stored selectors, expose actual extensions and honest size estimates, and have final output-size and ffprobe stream/container/duration checks. Photo collections, Stories, profiles and playlists are not supported. Source support is conditional until a representative public-media acceptance test passes.
- Admissions and confirmation quotas use a transaction-scoped PostgreSQL advisory lock. Source throttles atomically commit ten verified-IP requests per 60-second window, including requests later refused by validation/admission. Only keyed IP hashes are stored. Caller-supplied forwarding headers are not trusted by default.
- One worker job runs at a time. A guarded HTTPS proxy pins DNS answers, blocks internal/special/host addresses, and checks every connection, including redirects. Its process runner bounds output/time and scrubs child environments. Uploads stream from disk; oversized files are refused rather than transcoded.
- Durable receipt files are replayed before accepting more jobs. A heartbeat and cleanup loop remain supervised during processing. Expired objects are deleted in bounded batches every five minutes; records expire after thirty days. Flagged records are immediately blocked by the application. The worker-authenticated `POST /api/worker/flag` operation also deletes the stored object before reporting success, invalidating existing signed links. Failed deletions are retried by cleanup; direct database-only flag changes cannot revoke an already issued bearer link until storage deletion occurs. Records retain their ordinary deadline.

## API and schema compatibility

Public routes remain. Legacy `privatePost: false` is accepted; `true` is refused. Account GET and Google authentication remain. Account upload POST returns 410 without reading files. Job responses add metadata, expiry, actual extension and audio-safe variants; they never expose downloader selectors.

The existing idempotent schema initializer adds nullable job metadata, `confirmed_at`, `client_hash`, a source-limit table/index and `worker_status.protocol_version`. These are additive changes; obsolete secret storage stays intact but unused. Review the statements in `src/lib/fetch/db.ts` before deployment. Runtime schema setup is retained from the existing implementation. Production migration execution has **not** been verified in this local pass.

New jobs require worker protocol 2. An older worker heartbeat keeps intake unavailable; an older worker cannot claim new jobs. Existing public probe completions can produce new variants, and legacy running download callbacks can use their stored extension. Let old running public jobs drain and verify their completion before worker replacement. Old waiting-choice jobs without safe selectors require checking the link again.

`POST /api/worker/flag` is the protected takedown operation, accepting only a job ID and requiring the worker credential. It has no public browser control.

`DELETE /api/worker` is an authenticated, idempotent cleanup operation. Its storage principal needs DeleteObject permission scoped to this app's `fetch/` prefix, as well as the existing storage permissions. A failed deletion leaves the row/key available for retry. Never grant broad bucket administration to make cleanup pass.

## Worker installation package

Install `worker.mjs`, `egress.mjs`, `process.mjs`, `media.mjs` and the `ops` directory together under `/opt/halaldl-fetch`, owned by root and readable by the dedicated worker user. The worker requires Node 22 or a compatible newer LTS, the reviewed `@aws-sdk/client-s3` dependency, a pinned supported yt-dlp executable, and matching ffmpeg/ffprobe executables. Keep the environment file root-owned mode 600. Disable ad hoc executable auto-updates: tool upgrades are a reviewed maintenance operation with upstream checksum verification and a retained rollback executable.

The supplied systemd unit enforces CPUQuota=100%, MemoryHigh=1G, MemoryMax=1536M, no swap, TasksMax=64 and a bounded work filesystem. The worker refuses to start without matching cgroup v2 limits, a work volume of at most 3 GiB and a root-owned managed-egress marker. Source files alone do not prove those protections are active on the server.

1. Review capacity alongside existing workloads. Create a dedicated **new** 3 GiB ext4 backing image at `/var/lib/halaldl-fetch-work.img`; format only that new image after checking it does not already contain data. Mount it at `/var/lib/halaldl-fetch/work` with nodev,nosuid,noexec. The mount example's installed filename must be the result of `systemd-escape --path --suffix=mount /var/lib/halaldl-fetch/work`.
2. Create a worker-owned receipts directory at `/var/lib/halaldl-fetch/receipts`. Set the work/receipt variables from `.env.example`; the service supplies those paths too. Restrict permissions to the dedicated user.
3. Review `ops/apply-egress.py` and `ops/halaldl-fetch-egress.service`. The installer renders rules by default; only `--apply` changes them. It installs one dedicated nftables OUTPUT table scoped to the worker UID. Other applications' rules are untouched. It allows the local guarded proxy on TCP 18656 and the host's local DNS stub on port 53, then blocks host/internal/special destinations in IPv4/IPv6. Add any public NAT/VIP addresses absent from interfaces to `/etc/halaldl-fetch-blocked-addresses` and to `FETCH_BLOCKED_ADDRESSES`.
4. Validate the rendered policy with `nft --check` before applying. Install the egress service before the worker service. Its root-owned `/run/halaldl-fetch-egress/ready` marker is recreated on boot; the worker service requires that service and the mounted filesystem.
5. Run systemd unit validation and worker `--preflight` under the actual service context. Verify effective limits, writable-path restrictions, denied loopback/Docker/metadata access, DNS/CDN access and restart behavior. Do not bypass preflight to make a deployment green.

The generated worker-scoped nftables policy passed `nft --check` on the current Contabo host. It was **not applied**. Cgroup enforcement, mounted-volume limits, service activation, Linux process-tree termination and real media processing still require the isolated Linux rollout gate.

## Ordered release and rollback

1. Review the complete dirty-tree change, including untracked files. Preserve unrelated changes. Record exact source revision, built artifact identity, worker/module hashes and current website deployment.
2. Take the existing approved schema/data backup and verify recovery readiness. Review additive DDL and storage deletion permissions.
3. Publish backward-compatible backend rejection/ownership/schema changes first. Verify upload retirement, private-job denial and existing public-job drainage. Protocol gating prevents old workers claiming new jobs.
4. Stop the old worker after its active public jobs finish. Install the reviewed code, bounded volume, worker-scoped egress and systemd units. Start the new worker; verify protocol-2 heartbeat, resources, storage and cleanup before opening intake.
5. Publish/verify the frontend against the same reviewed backend contract. Run source-specific media acceptance and check audio, actual format, size, filename, duration and expiration. Do not label a platform verified from a successful probe alone.
6. For rollback, stop new intake/worker claims first. Keep additive columns and retained rows. Restore a reviewed **public-only** backend/frontend/worker set; do not roll back to credential uploads or the anonymous ownership bug. Preserve unacknowledged receipts and inspect uploaded-object references before replaying work.

No Git push, website deployment, production migration, bucket lifecycle change or worker service replacement is authorized merely by these instructions.

## Shared-host hardening gate

The audit found publicly bound database/pooler, administration and direct application listeners. Five established database/pooler connections were observed during the later read-only check. That snapshot cannot identify all periodic consumers or justify an IP allowlist. Shared-port and SSH changes remain blocked on a complete consumer inventory and verified non-root key/recovery access.

For a separately reviewed rollout, map every published listener to its application and proxy route, inventory scheduled/serverless clients and their egress requirements, select private/loopback binding or justified source restrictions, then verify IPv4 and IPv6 from an independent external vantage. Do not close database ports or recreate unrelated containers as part of the fetch-worker rollout. UFW alone does not restrict all Docker-published traffic.

## Checks and acceptance gaps

Pro removal was checked independently with typecheck and nine focused tests before the larger redesign. A real one-second MP4 fixture was generated and inspected with ffmpeg/ffprobe: the audio/video file passed, and silent/wrong-container checks failed as intended. `pnpm test:fetch:media` reruns this with absolute `FETCH_TEST_FFMPEG` and `FETCH_TEST_FFPROBE` paths. Later unit/worker tests cover ownership, URL rejection, video/audio combinations, size caps, private-address/DNS blocking, proxy CONNECT rejection, process deadlines/output and child-environment scrubbing. Local HTTP smoke tests cover endpoint retirement, private requests, oversized/malformed bodies, unauthenticated operations and the retired guide.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test:handoff`, `pnpm test:fetch`, `pnpm build`, then start an isolated preview and run `pnpm test:fetch:http`. Blank production database, storage, OAuth, worker and Turnstile credentials in that preview. Never point test commands at the production database.

Remaining release gates: disposable-PostgreSQL concurrent admission/retention integration, actual Google authentication, real Turnstile failure/expiry, storage deletion and expiry across the full retention interval, source-platform media/audio acceptance, Linux service/process-tree/resource tests and production health. These require dedicated test principals/infrastructure or the separately authorized rollout. No supported-platform certification or live-download claim is made by local fixture/unit checks.

Security dependencies were updated from Next.js/eslint-config-next 16.3.5 to 16.4.1; the resulting Sharp is 0.35.5 and source-map-js is pinned to 1.2.2; the existing brace-expansion 1.x override is raised to 1.1.21. The full production and development dependency audit returned zero advisories after the security updates. A newly enforced hook lint rule required deriving the existing homepage mockup's reduced-motion view rather than synchronously setting its state in an effect.

## Local verification record - 2026-10-26

- Final production build, including TypeScript and `/api/worker/flag`, passed. ESLint passed. No production database/storage/authentication credentials were enabled in the local preview.
- 34 tests passed: 22 fetch policy/URL/format/worker tests, six local HTTP tests, five existing handoff tests and one actual ffmpeg/ffprobe fixture test.
- Both themes were rendered at 360, 390, 768, 1024 and 1440 pixels. The narrow form clipping found during review was fixed. Paste/Clear, visible keyboard focus and the mobile menu were checked. Screenshots and form-boundary measurements are in the task's `fetch-implementation` artifact directory.
- Full dependency audit: zero advisories. `git diff --check` passed. Generated nftables rules passed syntax validation on the shared host without applying them.
- Migration result: not executed. Published source revision and deployment rollback target: not created; this is still the preserved dirty working tree based on the revision above. Release gates in this document remain open.

Reviewed local module SHA-256 values (recompute if any source changes):

| Module | SHA-256 |
| --- | --- |
| worker.mjs | E901739EEED2926017B1CF30E4AA61C176ADF7B3CE5F7B7028366998B5276617 |
| egress.mjs | 694F5BFC45FD4F0286C6E71F96BC8A15B305FCAD2F5FEE06B54EE381969946F6 |
| process.mjs | 18111779D28F3F8B24C9412A75BA3B4E9D301C5150ECA5B8545EA19A2A8F04F7 |
| media.mjs | 2CADEE13632DB5B94FFDBE9A01F1083672859C1CFCE56B8C8866717228B8F2EE |

## Website publication - 2026-10-26 (Asia/Karachi)

The user subsequently authorized publication. Windows PowerShell and the existing Windows user environment `VERCEL_TOKEN_ASMIR` were used, without printing the credential or putting it in command arguments. No Git push was performed.

- Website deployment: `dpl_j6sJ14RsWQmnyww1C3YdJuxFSaTh`, `https://halaldl-site-80em3t9ks-halall-mans-projects.vercel.app`.
- `https://halaldl.vercel.app` was independently resolved through Vercel inspection to that deployment after promotion. Live `/fetch` returned 200 with the new title and no Pro pitch; account upload returned 410, unauthenticated worker flag returned 401, and the retired guide returned 308.
- Packaged-source SHA-256: `dce07c08b63cd16cab65c047710b4c43283e171fef594b897941c97218a0d534`, 263 source files, based on the dirty tree at the base revision above. `.vercelignore` explicitly excludes diagnostics, local environments and build outputs. An earlier staging upload was removed after its inclusion list showed local diagnostics. The clean package was rechecked before publication.
- Additive schema initialization completed: 57 columns, all eight checked additions present. Row counts remained jobs=0, users=0, secrets=0, sessions=1. An encrypted Windows-user DPAPI snapshot was saved locally and decrypted byte-for-byte successfully before release. This was a snapshot recovery check, not a full PostgreSQL restore drill. Backup SHA-256: `6BCD6D09F28D0C76D8E3AE4170CA803BEF6188D4EBDB453EC0012AF1E51C89F7`.
- Previous deployment retained: `dpl_CzRvoKEP4Zf9M9oPwxZ84ughjtff`. It is a forensic reference, not an automatic safe rollback: reverting it would restore retired behavior. Follow the public-only forward-fix/rollback requirements above.
- Live status: worker connected, accepting=false, notice=updating, storage configured. This release intentionally refuses intake from the old protocol-1 worker. The worker code, Linux units, volume and egress rules have **not** been installed; source-platform download verification remains open. Website publication does not mean downloads are operational.
- No ads were added. No shared-host access, container, SSH or credential settings were changed.

## Worker and storage rollout receipt - 2026-10-26 (Asia/Karachi)

- Current website: `dpl_5YPNxaaUirq6F8bF6sXGwKkfvMDn`, `https://halaldl-site-km5cqsuo7-halall-mans-projects.vercel.app`. Independently inspecting `https://halaldl.vercel.app` resolved to that deployment after promotion. Production build returned READY. Packaged source: 265 files, SHA-256 `503b45750bbe1fc1b01d5157ed1a8254e0f4c137329aedcefcee8ce944e2aba2`, dirty base revision above. Environment files and diagnostic contents were excluded; the dry listing contained only an empty `.analytics` directory entry. This receipt was added locally after packaging.
- Worker hash, checked locally and on Contabo: `5d6c34e298f136cef737f5a9b629e1c684a690edb89cf51253a0ee940b57b6ee`. Installed service/egress/mount units are enabled. Effective cgroup limits: CPU quota 100%, memory high 1 GiB, maximum 1.5 GiB, swap zero, tasks 64. The new 3 GiB backing image is mounted with nodev,nosuid,noexec. Only the dedicated worker UID's nftables output table was installed. All 35 existing container names were retained; unrelated failed services were recorded without changing them.
- Root-owned rollback backup: `/var/backups/halaldl-fetch/20261026T162329Z`. Credential-change backup: `/var/backups/halaldl-fetch/20261026T171119Z-storage`; paused-intake backup: `/var/backups/halaldl-fetch/20261026T171846Z-intake`. Backups containing invalid old storage credentials are forensic references, not credentials to restore blindly. To stop admissions, set `FETCH_INTAKE_PAUSED=true` and restart the service after draining active public jobs. Keep protocol-2 rejection behavior and additive schema when rolling back.
- Website rollback reference: `dpl_xuuVrifrnuCE4rDwAzugmQ7UPUto`, with intake paused. That prior package lacks the verified-source allowlist, so it must not reopen intake until forward-fixed. No Git commit or push was performed.
- Storage failure was traced to `R2_ACCESS_KEY_ID` containing the account ID. The user supplied a replacement S3 credential pair through the existing local environment file. Only the two R2 credential fields were synchronized to the worker and Vercel; account, endpoint and bucket stayed unchanged. Local and worker principals independently passed upload/delete checks. No credentials were printed or passed as command arguments.
- Dailymotion's public Blender Foundation Big Buck Bunny clip downloaded as MP4, 19,470,382 bytes, 334.415 seconds, with video and audio. SoundCloud's Scott Buckley Rise Above CC-BY track downloaded as original M4A, 5,405,437 bytes, 267.912 seconds, with audio. Actual R2 retrieval and ffprobe checks passed. Both public website download URLs returned the matching size and attachment filename, with six-hour record expiry. These initial backend acceptance jobs were explicitly operator-created with licensed public media; they do not replace a browser Turnstile check.
- Public cross-session download access returned 404. Worker-authenticated flagging blocked the own test job and deleted its R2 object; the previously issued GET link then returned 404. An own test job's expiry was moved into the past: download returned 410 and cleanup deleted the object, invalidating its GET link. An initial test used HEAD on a GET-signed URL and received an authentication mismatch; the corrected GET-based check passed. Application code required no change for this test correction.
- Public health after reopening: workerConnected=true, accepting=true, notice=ok, running=0, waiting=0; supportedPlatforms=[dailymotion,soundcloud]. Runtime advertising fails closed on an empty source allowlist. YouTube was refused by the source's bot/sign-in check from this host; Vimeo required authentication. Those sources and other unverified platforms remain disabled in the hosted tool and guide copy.
- Live browser acceptance subsequently passed with the ordinary guest form and Cloudflare showing Success without interactive assistance: entered the licensed Dailymotion link, acknowledged rights, received audio-safe choices, selected 288p MP4 and prepared the file. Reload restored the current job and Ready state. Clicking Download file saved `C:\Users\halal\Downloads\dailymotion-a4e924d6.mp4`; the page displayed 18.6 MB and expiry. Browser job `a4e924d6-e74b-4614-9374-65d3d59f1579` remains available until normal six-hour cleanup. Proof screenshot: task artifact `fetch-implementation/live-download-ready.png`.
- Linux checks under the actual service limits passed: denied private/metadata/host IPv4 and IPv6 connections, guarded-proxy refusal, public HTTPS access, noexec workspace and subprocess-tree termination. The local app-only Python environment uses pinned yt-dlp 2026.10.21, bundled EJS, explicit Node runtime and curl_cffi; package provenance and 15-package advisory results (zero reported) are retained on the host. No cookie or user proxy support was enabled.
- Disposable PostgreSQL integration passed actual parallel admission and confirmation, verified-client throttle, final quota slot competition, legacy paid-account mapping, ownership, expired/flagged denial and retention key selection. That database contained no copied production data and was removed after verification. Real R2 deletion was verified separately as described above. The original additive migration and encrypted snapshot receipts remain above.
- Current lint, typecheck and 23 fetch policy/URL/format/worker tests passed; prior isolated local HTTP smoke passed six tests. Production build passed. Google OAuth acceptance and the complete six-hour/30-day elapsed retention interval have not been manually certified; accelerated own-row expiry plus real object deletion and the five-minute supervised cleanup loop were checked. Shared database/pooler/SSH exposure remains a separate consumer-inventory/recovery gate. No shared-port closures, unrelated container recreation or ads were performed.

## Source-attempt policy update - 2026-10-27 (Asia/Karachi)

The user requested removal of platform-specific admission restrictions and wording that acknowledges download issues without declaring platforms unavailable. All recognized public-link platforms can now reach the existing worker: YouTube, Instagram, TikTok, Facebook, X, Reddit, Vimeo, Dailymotion and SoundCloud. The obsolete `FETCH_ENABLED_PLATFORMS` setting is ignored and removed from the environment example. Public-only validation, supported URL shapes, Turnstile, ownership, quotas, resource limits and SSRF protection remain in force.

The form displays: "Some sources may have temporary issues. If a download fails, try again later." Failed source requests receive a retry message; source guides and their calls to action allow web attempts. This is an admission and copy change, not a claim that upstream access problems are fixed. A fresh controlled YouTube probe still returned its sign-in/bot-verification response before this change. Dailymotion and SoundCloud retain the real media acceptance evidence above. Worker code is unchanged by this update.

The user explicitly authorized pushing all pending website changes in this turn. Local environment files, credentials and `.analytics` diagnostics remain ignored and are excluded from the commit/deployment. The desktop application repository is outside this website push.
