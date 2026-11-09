# Downloader source identity, recovery and UI — 8 November 2026

Implemented locally; no push or deployment. The installed production Node worker was not replaced or restarted. The previous Go candidate and other existing checkout changes were preserved.

Follow-up: the real ElevenLabs/R2 browser acceptance test has now passed; see `docs/FETCH_R2_E2E_2026-11-08.md`. It also exposed and corrected initial guest session setup before a slow first submission. The earlier fixture-only boundaries below describe that original verification pass.

## Behavior

- Frontend and authoritative backend reject multiple joined links before normalization. This includes raw, encoded, double-encoded and malformed-tracking combinations. Instagram share parameters and /p or /reel aliases normalize to one shortcode identity. The Node and Go media workers also reject joined-source jobs.
- Typing, clearing or pasting a new source removes the current job, thumbnail, preview and Download action together. Ordinary paste replaces the entire prior value. Another link clears and focuses the input. Earlier files remain explicitly labelled in history.
- Restore and poll responses are fenced by the selected job and selection generation. A late response cannot replace a new draft. Failed history opens do not strand the current poll. An obsolete missing-job response cannot erase a newer remembered selection.
- Cancel is owner checked, transactional and idempotent. It works for queued, inspecting, waiting-for-choice and preparing jobs, including when intake is unavailable. Completion winning the race returns a conflict with the finished result; cancellation winning the race fences subsequent receipts. Cancellation does not silently refund the existing daily preparation quota.
- Node checks server cancellation approximately every three seconds while processing. Go stops jobs whose leases are no longer renewed, through its existing ten-second heartbeat. Receipt rejection prevents a cancelled upload from becoming downloadable even if cancellation races upload completion. Existing worker cleanup discards its rejected upload.
- Retry and Change quality start fresh inspection using the owned job's saved source. They do not use the editable draft, reuse stale selectors or overwrite a completed file. Duplicate simultaneous restarts deduplicate to the active new inspection. Download again reuses the unexpired original file and does not start another preparation.
- Saved legacy joined-link jobs cannot generate new download or preview URLs, or be confirmed/retried as if they were valid. Their records are preserved; the user must paste the intended single source again.
- A worker rejection disables further starts immediately. Confirm-only capacity pauses disable preparation while keeping inspection available. A lost submission response triggers recovery of the accepted job; its stale error disappears when recovery succeeds.
- The screen uses one current-job card, a visible source link and small thumbnail, compact file/quality controls and one current status. Cancel, Cancel & change link, Retry this link, Change quality, Preview and Download appear in the applicable state. There is no progress roadmap.
- A vertical newest-first history sits underneath. It returns the latest twenty owned records from the existing thirty-day retention window; six-hour file expiry remains unchanged. Private/flagged records, object keys, owner identifiers and worker selectors are not exposed. Guest history follows its signed browser session; signed-in history follows account ownership.

## API and release contract

| Endpoint | Behavior |
| --- | --- |
| GET /api/fetch/history | Owner-scoped latest twenty; no session gives an empty list; private/no-store response |
| DELETE /api/fetch/jobs/:id | Cancel an active owned job; repeat cancellation succeeds; finished-job conflict returns 409 |
| PATCH /api/fetch/jobs/:id | JSON action retry or change_quality plus clearance token; owner/clearance/throttle checked; fresh job uses the original source |
| POST /api/fetch/jobs/:id | Existing signed download/preview contract, with source validation for legacy records |
| GET /api/worker?jobId=:id | Authenticated active-job check used by Node cancellation polling |

No new schema change is required specifically for these recovery/history features. The earlier Go candidate still has its own schema/protocol requirements documented separately. A future release must coordinate the website API and updated worker; the current installed Node worker does not yet have the new cancellation poll. Server receipt fencing still prevents a cancelled job from becoming downloadable if an older worker finishes it.

## Verification

| Layer | Observed result |
| --- | --- |
| Fetch unit/Node worker tests | 36 passed, including joined-source encodings, cancellation polling and subprocess limits |
| Isolated HTTP smoke tests | 9 passed, including new recovery verbs, session requirements and empty anonymous history |
| Existing full disposable PostgreSQL suite | Passed: queue ordering, six-request deduplication/confirmation races, quotas, ownership, 16 parallel claim attempts capped at 12, leases, cancellation and history |
| Focused disposable PostgreSQL recovery suite | Passed: cancellation before/after completion, stale receipt rejection, withdrawn lease, legacy joined-file denial, duplicate restart, empty new thumbnail/formats, fresh 720p preparation, preserved 1080p original, separate file keys and owner-scoped history limited to twenty |
| Go Linux tests | 15 passed; 2 gated tests skipped: managed-sandbox preflight and explicit capacity benchmark. Includes actual local ffmpeg media modes, process-tree cancellation, lease-revocation cancellation and twelve-job scheduler lifecycle |
| Go vet | Passed |
| Browser layout matrix | 60 passed: ten states at 360×800, 768×1024 and 1366×768, light and dark themes; no horizontal overflow |
| Browser flow checks | 16 passed: cancellation/retry, audio/quality selection, preview identity, stale-result clearing, joined input, normal paste replacement, lost 502 recovery, clearing its old error, source changes, intake outage, immediate Start blocking, paused worker state, keyboard cancellation while offline, delayed restore and short-laptop CTA visibility |
| Short laptop | 1265×529; Download button bottom measured at 522.17 px with the page at the top |
| Code/build checks | Full repository lint passed; subsequent changed-file lint passed; TypeScript and final optimized production build passed; git diff --check passed |

The first full PostgreSQL attempt encountered a transport ECONNRESET after the existing modern-worker checks. Its disposable database was removed. A full rerun and the focused suite then passed. The successful databases `halaldl_fetch_verify_20261107_dc2b63d9` and `halaldl_fetch_verify_20261107_2cc14564` were removed after testing. These were separate test databases, not production application schemas.

Browser checks used the actual production build behind a loopback fixture API; database tests exercised the actual service functions against disposable PostgreSQL databases with a storage adapter. Go Linux tests used real local media with a deterministic extractor fixture, without provider or R2 calls. No fresh candidate browser-to-production-queue-to-R2 download is claimed. The clean real ElevenLabs worker download from the preceding investigation remains separate evidence, not a new end-to-end candidate acceptance result.

The existing Python UI suite was adjusted for the new quality select/history endpoint and syntax checked; it was not executed in this turn. The sixty-state and sixteen-flow browser receipts were obtained through the desktop browser automation tool instead.

## Receipts and review

Local screenshots and JSON/text receipts are in `E:/GitHub/halaldl-site/.analytics/fetch-identity-audit-20261108/`:

- fixed-desktop.jpg and fixed-mobile.jpg — local UI with explicitly labelled fixture media.
- fixed-ui-results.json — all sixty layout records and sixteen flow records.
- fixed-unit-results.txt and fixed-http-results.txt — passing test output.
- recovery-db-results.txt — focused real-database result and its assertions.
- go-fixed-tests.txt — Linux media/worker results and explicit skips.
- fixed-build.txt — final production build.

Run unit/HTTP/recovery checks through package scripts. `test:fetch:recovery` refuses database names outside `halaldl_fetch_verify_*` and refuses the application database. `test:fetch:preview` serves fixtures on 127.0.0.1:4189 and expects a separately started credential-free Next preview on 127.0.0.1:4188. It does not forward API traffic to that Next server or to production.

The production worker was checked after tests: active, MainPID 1162252, worker SHA-256 ca5b2deca696e84c0a04c918350d241c3c3ba2c27033f6018fcaa462fbf34bbb, matching the pre-change installed version. Production changes remain on hold for review.
