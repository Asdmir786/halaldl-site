"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ClipboardPaste, Download, Link2, LoaderCircle, Play, X, AlertCircle, Clock3 } from "lucide-react";
import { TurnstileField } from "./turnstile-field";
import { activeJob, useFetchJobs, type Job } from "./use-fetch-jobs";
import { jobPresentation } from "@/lib/fetch/presentation";
import type { DeliveryMode, PublicFormat } from "@/lib/fetch/formats";

const NAMES: Record<string, string> = { youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook", x: "X", reddit: "Reddit", vimeo: "Vimeo", dailymotion: "Dailymotion", soundcloud: "SoundCloud" };
const MODES: { value: DeliveryMode; label: string }[] = [{ value: "video_audio", label: "Video + audio" }, { value: "audio", label: "Audio only" }, { value: "video_only", label: "Video only" }];
const modeOf = (f: PublicFormat) => f.deliveryMode ?? (f.mediaType === "audio" ? "audio" : f.hasAudio ? "video_audio" : "video_only");
const ERRORS: Record<string, string> = {
  public_only: "Only public links work. Private posts and Stories are not supported.", too_long: "This video is too long.", too_big: "This file is too large. Try a smaller quality.",
  too_many_items: "Choose one video. Collections and carousels are not supported.", no_format: "No playable file fits the current limits.", expired: "This file has expired. Recheck the link to prepare a new file.",
  blocked: "The source refused this download. Try again later.", source_challenge: "The source requires verification. Try again later, or use the Windows app.",
  no_audio: "This link has no playable audio.", failed: "The download could not finish. You can retry this link.", unsupported: "This type of link is not supported.",
};
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint-strong";
const primary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-45 ${focus}`;
const secondary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line-strong px-3 py-2 text-sm font-semibold text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-45 ${focus}`;
const size = (bytes?: number | null) => bytes ? `${(bytes / 1048576).toFixed(1)} MB` : "Size not provided";
const duration = (s: number | null) => s == null ? "" : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

function Source({ job, small = false }: { job: Job; small?: boolean }) {
  return <div className="flex min-w-0 items-start gap-3">
    {job.thumbnail ? <Image key={`${job.id}:${job.thumbnail}`} unoptimized width={160} height={100} src={job.thumbnail} alt="" referrerPolicy="no-referrer" className={`${small ? "h-12 w-16" : "h-16 w-24"} shrink-0 rounded-lg bg-paper object-cover`} /> : <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line text-ink-muted"><Link2 className="size-4" aria-hidden="true" /></span>}
    <div className="min-w-0 flex-1"><p className="text-xs text-ink-soft">{NAMES[job.platform] ?? "Link"}{duration(job.duration) ? ` · ${duration(job.duration)}` : ""}</p>
      <p className={`${small ? "text-sm" : "text-base"} mt-1 break-words font-semibold text-ink`}>{job.title || "Checking this link…"}</p>
      <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className={`mt-1 block break-all text-xs text-ink-soft underline decoration-line-strong underline-offset-2 ${focus}`} aria-label={`Open source: ${job.sourceUrl}`}>{job.sourceUrl}</a>
    </div>
  </div>;
}

export function FetchTool({ siteKey }: { siteKey: string }) {
  const f = useFetchJobs();
  const { job, health, busy } = f;
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (job?.id) document.getElementById("fetch-current-job")?.focus(); }, [job?.id]);
  const [previewError, setPreviewError] = useState("");
  const [notify, setNotify] = useState(false);
  const seen = useRef<string | null>(null);
  useEffect(() => {
    if (!job) return;
    if (activeJob(job)) { seen.current = job.id; return; }
    if (notify && seen.current === job.id && typeof Notification !== "undefined" && Notification.permission === "granted") {
      seen.current = null;
      try { new Notification(job.ready ? "Your file is ready" : "Your download needs attention", { body: "Return to HalalDL to view your download." }); } catch {}
    }
  }, [job, notify]);
  const active = activeJob(job);
  const available = !!health?.available && (!!health.cleared || !!siteKey);
  const cleared = !!health?.cleared || !!f.token;
  const selected = job?.formats.find(item => item.formatId === f.formatId) ?? job?.formats[0];
  const mode = selected ? modeOf(selected) : "video_audio";
  const state = job ? jobPresentation(job.status, ["probing", "downloading"].includes(job.status) ? !!health?.workerConnected : job.kind === "download" ? !!health?.canDownload : !!health?.available, job.queuePosition) : null;
  const Icon = state?.moving ? LoaderCircle : job?.ready ? Check : job && ["failed", "expired"].includes(job.status) ? AlertCircle : Clock3;
  const canRestart = !busy && available && cleared;
  async function paste() {
    try { f.newLink((await navigator.clipboard.readText()).slice(0, 2048)); input.current?.focus(); }
    catch { f.setMessage("Clipboard is blocked. Paste the link into the field."); }
  }
  function another() { f.newLink(); input.current?.focus(); }
  return <div>
    <div className="fetch-panel rounded-2xl p-4">
      <form onSubmit={event => { event.preventDefault(); if (!job) void f.probe(); }} className="grid gap-3">
        <label htmlFor="fetch-url" className="text-sm font-semibold text-ink">Public video link</label>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line-strong bg-paper px-3 focus-within:border-mint-strong focus-within:ring-2 focus-within:ring-mint-strong/30">
          <Link2 className="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
          <input ref={input} id="fetch-url" aria-invalid={f.message.startsWith("Two links") || undefined} aria-describedby={f.message ? "fetch-message" : undefined} type="url" inputMode="url" autoComplete="off" spellCheck={false} required maxLength={2048} value={f.url} onChange={e => f.newLink(e.target.value)} onPaste={e => { e.preventDefault(); f.newLink(e.clipboardData.getData("text")); }} placeholder="Paste a public link" disabled={!!busy || active} className="min-h-12 w-0 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted disabled:opacity-60" />
          <button type="button" aria-label="Paste link" disabled={!!busy || active} onClick={() => void paste()} className={`grid min-h-11 min-w-9 place-items-center rounded-lg text-ink disabled:opacity-40 ${focus}`}><ClipboardPaste className="size-4" aria-hidden="true" /></button>
          {f.url ? <button type="button" aria-label="Clear link" disabled={!!busy || active} onClick={another} className={`grid min-h-11 min-w-9 place-items-center rounded-lg text-ink disabled:opacity-40 ${focus}`}><X className="size-4" aria-hidden="true" /></button> : null}
        </div>{!job ? <button type="submit" disabled={!!busy || !f.rights || !f.url.trim() || !available || !cleared} className={primary}>{busy === "probe" ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}{busy === "probe" ? "Checking…" : "Check link"}</button> : null}</div>
        {!job ? <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-soft"><input type="checkbox" required checked={f.rights} onChange={e => f.setRights(e.target.checked)} className="mt-0.5 size-4 accent-mint-strong" /><span>I have the right to download this. <Link href="/legal/terms" className={`underline underline-offset-2 ${focus}`}>Terms</Link></span></label> : null}
        {health && !health.available ? <p role="status" className="rounded-lg border border-line-strong px-3 py-2 text-sm text-ink">{health.message ?? "The download service is unavailable. We’ll check again automatically."}</p> : null}
        {siteKey && !health?.cleared ? <TurnstileField siteKey={siteKey} resetKey={f.reset} onToken={f.acceptToken} /> : null}
      </form>
      {f.message ? <p id="fetch-message" role="alert" className="mt-4 rounded-lg border border-coral-strong/40 bg-coral px-3 py-2 text-sm text-ink">{f.message}</p> : null}
      {f.connection ? <p role="status" className="mt-3 text-sm text-ink-soft">{f.connection}</p> : null}
      {job && state ? <section key={job.id} id="fetch-current-job" tabIndex={-1} aria-label="Download result" className="mt-4 border-t border-line-strong pt-4 outline-none" aria-busy={!!busy}>
        <div role="status" aria-live="polite" className="mb-3 flex items-center gap-2.5"><Icon className={`size-5 shrink-0 text-ink ${state.moving ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" /><div><h2 className="text-sm font-semibold text-ink">{state.label}</h2>{state.detail ? <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{state.detail}</p> : null}</div></div>
        <Source job={job} />
        {job.errorCode || ["failed", "expired"].includes(job.status) ? <p role="alert" className="mt-4 text-sm text-ink">{ERRORS[job.errorCode ?? job.status] ?? ERRORS.failed}</p> : null}
        {job.status === "waiting_choice" ? <form onSubmit={event => { event.preventDefault(); void f.confirm(); }} className="mt-4 grid gap-4">
          <fieldset disabled={!!busy}><legend className="mb-2 text-xs font-semibold text-ink-soft">File</legend><div className="flex flex-wrap gap-2">{MODES.map(item => {
            const first = job.formats.find(format => modeOf(format) === item.value);
            return <label key={item.value} className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm ${!first ? "border-line text-ink-muted" : mode === item.value ? "border-mint-strong bg-paper font-semibold text-ink" : "border-line-strong text-ink"}`}><input type="radio" name="file-mode" checked={mode === item.value} disabled={!first} onChange={() => first && f.setFormatId(first.formatId)} className="accent-mint-strong" />{item.label}</label>;
          })}</div></fieldset>
          <div className="flex flex-wrap items-end gap-3"><label className="grid flex-1 gap-2 text-xs font-semibold text-ink-soft" htmlFor="fetch-quality">{mode === "audio" ? "Audio" : "Quality"}<select id="fetch-quality" value={f.formatId} onChange={e => f.setFormatId(e.target.value)} disabled={!!busy} className={`min-h-11 min-w-0 rounded-lg border border-line-strong bg-paper px-3 text-sm text-ink ${focus}`}>{job.formats.filter(format => modeOf(format) === mode).map(format => <option key={format.formatId} value={format.formatId}>{format.label} · {format.ext.toUpperCase()}{format.filesize ? ` · ${size(format.filesize)}` : ""}</option>)}</select></label><button type="submit" disabled={!!busy || !canRestart || !health?.canDownload || !f.formatId} className={primary}>{busy === "confirm" ? "Starting…" : "Prepare download"}<ArrowRight className="size-4" aria-hidden="true" /></button></div>
          {!job.formats.some(format => format.hasAudio) ? <p className="text-xs text-ink-soft">No audio on this link.</p> : mode === "video_only" ? <p className="text-xs text-ink-soft">Video without audio.</p> : null}
          {!health?.canDownload ? <p role="status" className="text-sm text-ink-soft">File preparation is temporarily paused. Your link and choices are saved.</p> : null}
        </form> : null}
        {job.ready ? <div className="mt-3"><p className="text-xs text-ink-soft">{MODES.find(item => item.value === job.deliveryMode)?.label ?? "File"}{job.quality ? ` · ${job.quality}` : ""} · {size(job.bytes)} · {job.extension?.toUpperCase()}{job.expiresAt ? ` · Expires ${new Date(job.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</p>
          {f.preview?.id === job.id ? <div className="mt-3">{job.deliveryMode === "audio" ? <audio key={`${job.id}:${f.preview.url}`} controls preload="metadata" src={f.preview.url} aria-label="Audio preview" className="w-full" onError={() => setPreviewError("Preview could not play. Try downloading the file.")} /> : <video key={`${job.id}:${f.preview.url}`} controls playsInline preload="metadata" src={f.preview.url} aria-label="Video preview" className="max-h-80 w-full rounded-lg bg-black" onError={() => setPreviewError("Preview could not play. Try downloading the file.")} />}{previewError ? <p role="status" className="mt-2 text-xs text-ink-soft">{previewError}</p> : null}</div> : null}
          <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={!!busy} onClick={() => void f.media(job)} className={primary}><Download className="size-4" aria-hidden="true" />Download</button><button type="button" disabled={!!busy} onClick={() => { setPreviewError(""); void f.media(job, true); }} className={secondary}><Play className="size-4" aria-hidden="true" />Preview</button><button type="button" disabled={!canRestart} onClick={() => void f.restart(job, "change_quality")} className={secondary}>Change quality</button></div>
        </div> : null}
        <div className="mt-4 flex flex-wrap gap-2">{active ? <><button type="button" disabled={!!busy} onClick={() => void f.cancel()} className={secondary}>{busy === "cancel" ? "Cancelling…" : "Cancel"}</button><button type="button" disabled={!!busy} onClick={() => void f.cancel(true).then(() => input.current?.focus())} className={secondary}>Cancel & change link</button></> : <>{!job.ready ? <button type="button" disabled={!canRestart} onClick={() => void f.restart(job, "retry")} className={primary}>{job.status === "expired" ? "Recheck link" : "Retry this link"}</button> : null}<button type="button" disabled={!!busy} onClick={another} className={secondary}>Another link</button></>}
          {active && !notify ? <button type="button" onClick={() => { if (typeof Notification !== "undefined") void Notification.requestPermission().then(value => setNotify(value === "granted")); }} className={`min-h-11 px-2 text-xs text-ink-soft underline ${focus}`}>Notify me</button> : null}
        </div>
      </section> : null}
    </div>
    <section aria-label="Recent downloads" className="mt-7"><div className="mb-2 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-sm font-semibold text-ink">Recent downloads</h2><p className="text-xs text-ink-muted">Latest 20 · Files last 6 hours</p></div><p className="mb-3 text-xs text-ink-soft">Guest history stays with this browser. Signed-in history follows your account.</p>
      {f.historyError ? <p role="status" className="mb-3 text-sm text-ink-soft">{f.historyError}</p> : null}
      {f.history.filter(item => item.id !== job?.id).length ? <ul className="divide-y divide-line border-y border-line">{f.history.filter(item => item.id !== job?.id).map(entry => <li key={entry.id} className="py-4"><Source job={entry} small />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft"><span>{jobPresentation(entry.status, true).label}</span>{entry.extension ? <span>{entry.quality ? `${entry.quality} · ` : ""}{entry.extension.toUpperCase()} · {size(entry.bytes)}</span> : null}{entry.createdAt ? <time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time> : null}</div>
        <div className="mt-2 flex flex-wrap gap-2"><button type="button" disabled={!!busy} onClick={() => void f.open(entry)} className={secondary}>View</button>{entry.ready ? <button type="button" disabled={!!busy} onClick={() => void f.media(entry)} className={secondary}>Download again</button> : !activeJob(entry) ? <button type="button" disabled={!canRestart || active} onClick={() => void f.restart(entry, "retry")} className={secondary}>{entry.status === "expired" ? "Recheck link" : "Retry"}</button> : null}</div>
      </li>)}</ul> : <p className="rounded-xl border border-dashed border-line-strong px-4 py-5 text-sm text-ink-soft">{job ? "Your current link is above. Earlier downloads will appear here." : "Your recent links will appear here."}</p>}
    </section>
    <details className="mt-6 text-xs text-ink-soft"><summary className={`cursor-pointer py-2 font-semibold ${focus}`}>Limits & supported sites</summary><div className="mt-2 grid gap-2 leading-relaxed"><p>{health?.supportedPlatforms?.map(name => NAMES[name] ?? name).join(", ") || "Public video links only."} Playlists, channels, photo posts and private media are not supported.</p><p>Guest: 50 a day, 1080p, 10 minutes, 200 MB. <Link href="/account" className="underline">Signed in</Link>: 75 a day, 4K, 30 minutes, 800 MB. Files stay for six hours. <Link href="/guides/web-fetch" className="underline">Guide</Link></p></div></details>
  </div>;
}
