# Fetch queue incident — 7 November 2026

## Finding

One Instagram probe was waiting with no jobs ahead of it. The worker was alive
but unable to process it. Two independent blockers were observed:

1. Requests from the Contabo host to `halaldl.vercel.app` received HTTP 403,
   `Server: Vercel`, `X-Vercel-Mitigated: deny`, and a plain `Forbidden` body.
   This was an edge rejection. Application worker authentication rejects with
   401, so this evidence does not indicate a worker-token mismatch. The same
   production deployment was reachable through the project's stable production
   alias with its existing automation credential.
2. The worker required 12 GiB free on the host. The database heartbeat reported
   `accepting=false`, `detail=high-limit`, and `disk_free_mb=7823` during diagnosis.
   The host filesystem was 97% used. The dedicated 3 GiB work mount was nearly
   empty, with approximately 2.9 GiB available. Even successful API requests
   would not allow a claim while the old host reserve check failed.

Position 1 was the correct waiting rank. It did not mean another user was ahead
of the request, and it did not prove the worker was able to start. The current
browser UI does not expose the worker pause reason, making this failure look
like a normal queue wait.

## Ten-minute evidence window

Window: **06:09:00–06:19:00 PKT**, equivalent to 01:09:00–01:19:00 UTC.

The jobs table contains exactly one record created in this window: this
Instagram probe. At the initial inspection, there were no probing or downloading
records and exactly one queued record.

The retained service journal contains the following failures within the window:

| Minute, PKT | Worker-loop HTTP 403 | Upkeep HTTP 403 |
| --- | ---: | ---: |
| 06:12 | 9 | 5 |
| 06:13 | 9 | 7 |
| 06:14 | 10 | 6 |
| 06:15 | 11 | 7 |
| 06:16 | 10 | 7 |
| 06:17 | 11 | 7 |
| 06:18 | 8 | 5 |
| **Total** | **68** | **44** |

There are **112 retained rejection events**. No entries for 06:09–06:11 were
returned by this journal query; those minutes are unobserved, not certified as
error-free. These counts describe failed worker API operations, not visitors.
Database admission counts do not measure all page views or rejected submissions.
No Vercel traffic-analytics export was obtained.

The response header establishes Vercel mitigation, but no rule ID or internal
classification reason was exposed. The evidence does not establish whether
request frequency, IP reputation, or another platform signal triggered it.
Likewise, host disk pressure was measured, but this investigation did not
attribute the occupied space to a particular application.

## Timeline and actual outcome

All times below are PKT on 7 November 2026.

| Time | Evidence |
| --- | --- |
| 06:09:12.974 | Job `6f06c9f2-e424-4545-a527-6a68853dbe1c` created. |
| 06:09:13.005 | Job enqueued. |
| 06:19:47 | Scoped worker restart began after rollback backup. |
| 06:19:50.663 | Worker sandbox preflight passed. |
| 06:19:52.096 | Capacity changed to ready; host free 7600 MiB, work mount free 2935 MiB. |
| 06:20:18.067 | Worker logged successful completion of this probe, duration 25,457 ms. |
| 06:20:18.279 | Job row updated to `waiting_choice`, seven formats, no error. |
| 06:20:49.468 | Fresh heartbeat: accepting=true, detail=null, running=0, host free 7553 MiB. |

This proves recovery of the user's actual queued link through source inspection
and file choices. It does **not** certify a completed download, playback, or every
supported source. The user's file choice was not made for them.

## Changes already installed

Only the `halaldl-fetch` worker was changed and restarted. No website/UI
deployment, Git push, shared firewall change, unrelated container restart, or
shared-host deletion was performed.

- Set worker API traffic to
  `https://halaldl-site-halall-mans-projects.vercel.app`, the stable production
  alias of the same Vercel project, and configured its existing automation
  credential in the root-only worker environment file.
- Added a worker API client that sends the automation credential only in a
  header, retains the independent worker bearer token, refuses redirects, and
  logs a bounded mitigation indicator without response bodies or secrets.
- Reduced idle polling to once per 15 seconds and added bounded exponential
  retry delays, up to 60 seconds, to avoid repeated rapid failed requests.
- Adjusted the host free-space floor from 12 GiB to 4 GiB. This remains greater
  than the dedicated work volume's entire 3 GiB capacity, including its possible
  sparse-file growth. The 2 GiB work-volume floor, 3 GiB memory floor, maximum
  file sizes, one-job concurrency, cgroup limits, and egress guard remain enforced.
- Added capacity-transition logs so future pauses identify low host disk,
  work-volume capacity, memory, pending receipts, or maintenance.

Rollback backup:
`/var/backups/halaldl-fetch/20261107T011947Z-queue-recovery`.
It contains the previous worker and root-only environment configuration.
Restoring those files and restarting this service reinstates the previous
behavior, including its two known blockers.

The live worker was compared with repository HEAD before replacement and matched;
the unchanged media, process and egress modules also matched local SHA-256 values.
Source changes remain local and uncommitted at this report's creation. Git fetch
confirmed main and origin/main had zero divergence, so no pull was necessary.

## Verification and deployment hold

- 30 fetch tests passed, including reserve boundaries, authenticated automation
  headers, redirect rejection, bounded backoff, SSRF protection, process limits,
  format validation and ownership policy tests.
- TypeScript checking and `git diff --check` passed.
- Full-repository lint was started but stopped before completion when work was
  limited to the incident evidence. No full-lint pass is claimed.
- The installed service passed sandbox preflight and processed the original job
  successfully, as recorded above.

The user requested the ten-minute evidence and exact cause before any further
deployment. Further deployments are on hold. Website queue-state messaging,
broader UI improvements, long-term shared-host disk management, and additional
download acceptance checks have not been deployed as part of this incident.
