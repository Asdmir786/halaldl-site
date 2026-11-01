"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Check, ClipboardPaste, Download, Link2, LoaderCircle, Play, X } from "lucide-react";
import { TurnstileField } from "@/components/fetch/turnstile-field";
import type { DeliveryMode, PublicFormat } from "@/lib/fetch/formats";

type PageStatus = { available: boolean; cleared?: boolean; jobId?: string | null; supportedPlatforms?: string[] };
type Job = { id: string; status: string; platform: string; errorCode: string | null; formats: PublicFormat[]; ready: boolean;
  title: string | null; thumbnail: string | null; duration: number | null; deliveryMode?: DeliveryMode | null; bytes?: number; queuePosition?: number | null; expiresAt: string | null; extension: string | null };
const SAVED_JOB = "halaldl.current-job";
const TERMINAL = ["ready", "failed", "expired", "cancelled"];
const STEPS = ["Link", "Queue", "Choose", "File"];
const SOURCE_NAMES: Record<string, string> = { youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook", x: "X", reddit: "Reddit", vimeo: "Vimeo", dailymotion: "Dailymotion", soundcloud: "SoundCloud" };
const FILE_MODES: { value: DeliveryMode; label: string }[] = [{ value: "video_audio", label: "Video + audio" }, { value: "audio", label: "Audio only" }, { value: "video_only", label: "Video only" }];
const modeOf = (format: PublicFormat): DeliveryMode => format.deliveryMode ?? (format.mediaType === "audio" ? "audio" : format.hasAudio ? "video_audio" : "video_only");
const ERRORS: Record<string, string> = {
  public_only: "Only public links work. Private posts and Stories are not supported.",
  too_long: "This video is too long.", too_big: "This file is too large. Choose a smaller quality.",
  too_many_items: "Choose one video. Collections and carousels are not supported.", no_format: "No playable file fits the current limits.",
  expired: "This download has expired. Check the link again.", blocked: "This link could not be downloaded. Try again later.",
  source_challenge: "This link is blocked right now. Try again later, or use the Windows app.",
  no_audio: "This link has no playable audio.",
  failed: "The download could not finish. Check the link again.", unsupported: "This type of link is not supported.",
};
const CHECK_ERRORS = new Set(["Complete the check and try again.", "The check could not be verified.", "The check failed. Try it again."]);
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint-strong";
const primary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-45 ${focus}`;

function size(bytes: number | null | undefined) { return bytes ? `${(bytes / 1048576).toFixed(1)} MB` : "Size not provided"; }
function duration(seconds: number | null) { return seconds == null ? null : `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`; }
function stepOf(status: string, ready: boolean) {
  if (ready || status === "ready") return 4;
  if (status === "downloading") return 3;
  if (status === "waiting_choice") return 2;
  if (status === "queued" || status === "probing") return 1;
  return 0;
}
function statusWord(status: string) {
  if (status === "probing") return "Checking";
  if (status === "downloading") return "Preparing";
  if (status === "waiting_choice") return "Choose";
  if (status === "ready") return "Ready";
  return "Queued";
}
function placeNote(status: string, ready: boolean, queuePosition?: number | null) {
  if (ready || status === "ready") return "Preview the file here, or save it.";
  if (status === "downloading") return "Preparing the file you chose. Larger files take longer.";
  if (status === "waiting_choice") return "Choose a file. Nothing is prepared until you do.";
  if (status === "probing") return "Checking this link for a title and file choices.";
  if (queuePosition) return `Submitting this link took place ${queuePosition}. Earlier requests go first.`;
  return "Taking a place in line.";
}
async function request<T>(url: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const bounded = AbortSignal.timeout(15_000);
  const response = await fetch(url, { ...init, cache: "no-store", signal: signal ? AbortSignal.any([bounded, signal]) : bounded });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "This request could not finish. Please try again.");
  if (!body || typeof body !== "object") throw new Error("An unexpected response arrived. Please try again.");
  return body as T;
}
function notificationGranted() { return typeof Notification !== "undefined" && Notification.permission === "granted"; }
function notificationCanAsk() { return typeof Notification !== "undefined" && Notification.permission === "default"; }
function notificationServer() { return false; }
function notificationSubscribe() { return () => {}; }
function remember(id: string | null) { try { if (id) localStorage.setItem(SAVED_JOB, id); else localStorage.removeItem(SAVED_JOB); } catch { /* Storage can be disabled. */ } }
function storedJob() {
  try {
    const id = localStorage.getItem(SAVED_JOB);
    return id && /^[a-f0-9-]{36}$/.test(id) ? id : null;
  } catch { return null; }
}

function Progress({ status, ready, queuePosition }: { status: string; ready: boolean; queuePosition?: number | null }) {
  if (["failed", "expired", "cancelled"].includes(status)) return null;
  const current = stepOf(status, ready);
  const queued = status === "queued";
  const moving = queued || status === "probing" || status === "downloading";
  return (
    <div className="mb-5 rounded-2xl border border-line-strong bg-paper p-4">
      {moving ? <div role="status" className="mb-5 flex items-center gap-3">
        <div className="grid h-16 min-w-16 place-items-center rounded-2xl bg-ink px-2 text-paper">
          {queued && queuePosition ? <span className="text-center"><span className="block text-[10px] font-semibold uppercase tracking-wide text-paper/75">Place</span><span className="font-display text-3xl font-semibold leading-none">{queuePosition}</span></span> : <LoaderCircle className="h-6 w-6 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{queued ? "In line" : statusWord(status)}</p>
        </div>
      </div> : null}
      <ol className="grid grid-cols-4" aria-label="Progress">
        {STEPS.map((name, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={name} aria-current={active ? "step" : undefined} className="relative flex flex-col items-center">
              {index > 0 ? <span aria-hidden="true" className={`absolute right-1/2 top-4 h-1 w-full -translate-y-1/2 ${index <= current ? "bg-mint-strong" : "fetch-progress-track"}`} /> : null}
              <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full ${done || active ? "bg-mint-strong text-paper" : "border-2 border-line-strong bg-paper"} ${active ? "ring-4 ring-mint-strong/35" : ""}`}>
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
              </span>
              <span className={`mt-2 text-xs font-semibold ${done || active ? "text-ink" : "text-ink-soft"}`}>{name}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm leading-relaxed text-ink">{placeNote(status, ready, queuePosition)}</p>
    </div>
  );
}

export function FetchTool({ siteKey }: { siteKey: string }) {
  const [url, setUrl] = useState("");
  const [rights, setRights] = useState(false);
  const [status, setStatus] = useState<PageStatus | null>(null);
  const [message, setMessage] = useState("");
  const [connection, setConnection] = useState("");
  const [busy, setBusy] = useState<"probe" | "confirm" | "download" | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [formatId, setFormatId] = useState("");
  const [preview, setPreview] = useState<{ id: string; url: string } | null>(null);
  const [previewNote, setPreviewNote] = useState("");
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);
  const [decision, setDecision] = useState<NotificationPermission | null>(null);
  const granted = useSyncExternalStore(notificationSubscribe, notificationGranted, notificationServer);
  const askable = useSyncExternalStore(notificationSubscribe, notificationCanAsk, notificationServer);
  const notify = decision === "granted" || (decision === null && granted);
  const canAsk = decision === null && askable;
  const pending = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const notified = useRef("");
  const seenLive = useRef(false);
  const rememberToken = useCallback((value: string) => setToken(value), []);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let restored = false;
    async function loadSaved(id: string) {
      try {
        const value = await request<Job>(`/api/fetch/jobs/${id}`, {}, controller.signal);
        setJob(value);
        setFormatId(value.formats?.[0]?.formatId ?? "");
        remember(value.id);
      } catch { if (!controller.signal.aborted) remember(null); }
    }
    async function tick() {
      try {
        const next = await request<PageStatus>("/api/fetch/status", {}, controller.signal);
        setStatus(next);
        if (!restored) {
          restored = true;
          const id = next.jobId ?? storedJob();
          if (id) await loadSaved(id);
        }
      } catch {
        if (controller.signal.aborted) return;
        setStatus({ available: false, cleared: false, jobId: null });
        if (!restored) {
          restored = true;
          const id = storedJob();
          if (id) await loadSaved(id);
        }
      }
      if (!controller.signal.aborted) timer = setTimeout(tick, 20_000);
    }
    void tick();
    return () => { controller.abort(); clearTimeout(timer); pending.current?.abort(); };
  }, []);

  const jobId = job?.id;
  const jobStatus = job?.status;
  useEffect(() => {
    if (!jobId || !jobStatus || TERMINAL.includes(jobStatus)) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const id = jobId;
    async function tick() {
      try {
        const next = await request<Job>(`/api/fetch/jobs/${id}`, {}, controller.signal);
        setJob(next); setConnection("");
        if (next.status === "waiting_choice") setFormatId(current => next.formats?.some(f => f.formatId === current) ? current : next.formats?.[0]?.formatId ?? "");
        if (TERMINAL.includes(next.status)) return;
      } catch { if (!controller.signal.aborted) setConnection("Still checking. This download is saved."); }
      if (!controller.signal.aborted) timer = setTimeout(tick, jobStatus === "waiting_choice" ? 8000 : 2000);
    }
    timer = setTimeout(tick, 400);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [jobId, jobStatus]);

  useEffect(() => {
    if (job && !TERMINAL.includes(job.status)) seenLive.current = true;
  }, [job]);

  useEffect(() => {
    if (!notify || !seenLive.current || !job || !TERMINAL.includes(job.status) || typeof Notification === "undefined" || Notification.permission !== "granted" || notified.current === `${job.id}:${job.status}`) return;
    notified.current = `${job.id}:${job.status}`;
    try { new Notification(job.ready ? "Your file is ready" : "Your download needs attention", { body: "Return to HalalDL to view your download." }); } catch { /* Some mobile browsers require a service worker. */ }
  }, [job, notify]);

  const cleared = !!status?.cleared;
  const available = !!status?.available && (cleared || !!siteKey);
  const selectedFormat = job?.formats.find(f => f.formatId === formatId) ?? job?.formats[0];
  const selectedMode = selectedFormat ? modeOf(selectedFormat) : "video_audio";
  const showCheck = !!siteKey && !cleared && (!job || job.status === "waiting_choice" || TERMINAL.includes(job.status));

  async function run(action: "probe" | "confirm" | "download", operation: (signal: AbortSignal) => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(action); setMessage("");
    const controller = new AbortController(); pending.current = controller;
    try {
      await operation(controller.signal);
      if (action !== "download") setStatus(current => current ? { ...current, cleared: true } : current);
    }
    catch (error) {
      const text = controller.signal.aborted ? "Stopped waiting." : error instanceof Error ? error.message : "Please try again.";
      if (CHECK_ERRORS.has(text)) setStatus(current => current ? { ...current, cleared: false } : current);
      setMessage(text);
    }
    finally {
      lock.current = false; setBusy(null); pending.current = null;
      if (action !== "download") {
        setToken(""); setReset(value => value + 1);
        void request<PageStatus>("/api/fetch/status").then(next => { if (!controller.signal.aborted) setStatus(next); }).catch(() => {});
      }
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (job && !TERMINAL.includes(job.status)) return;
    await run("probe", async signal => {
      const result = await request<{ id: string; platform: string; queuePosition?: number }>("/api/fetch/probe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, url: url.trim(), rights }) }, signal);
      remember(result.id);
      setJob({ id: result.id, platform: result.platform, status: result.queuePosition ? "queued" : "probing", queuePosition: result.queuePosition ?? null, errorCode: null, formats: [], ready: false, title: null, thumbnail: null, duration: null, expiresAt: null, extension: null });
    });
  }
  async function confirm(event: React.FormEvent) {
    event.preventDefault(); if (!job) return;
    await run("confirm", async signal => {
      const result = await request<{ queuePosition: number }>("/api/fetch/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, jobId: job.id, formatId }) }, signal);
      setJob({ ...job, status: "queued", formats: [], queuePosition: result.queuePosition });
    });
  }
  async function download() {
    if (!job) return;
    await run("download", async signal => {
      const result = await request<{ url: string }>(`/api/fetch/jobs/${job.id}`, { method: "POST" }, signal);
      const target = new URL(result.url);
      if (target.protocol !== "https:" || !target.hostname.endsWith(".r2.cloudflarestorage.com")) throw new Error("The download address could not be verified.");
      window.location.assign(target.href);
    });
  }
  async function previewFile() {
    if (!job) return;
    await run("download", async signal => {
      const result = await request<{ url: string }>(`/api/fetch/jobs/${job.id}?preview=1`, { method: "POST" }, signal);
      const target = new URL(result.url);
      if (target.protocol !== "https:" || !target.hostname.endsWith(".r2.cloudflarestorage.com")) throw new Error("The preview address could not be verified.");
      setPreviewNote(""); setPreview({ id: job.id, url: target.href });
    });
  }
  async function paste() {
    try { const text = await navigator.clipboard.readText(); setUrl(text.slice(0, 2048)); setMessage(""); }
    catch { setMessage("Clipboard is blocked. Paste the link yourself."); }
    document.getElementById("fetch-url")?.focus();
  }
  function startAnother() { if (lock.current) return; setJob(null); setFormatId(""); setPreview(null); setPreviewNote(""); setMessage(""); setConnection(""); remember(null); setToken(""); setReset(value => value + 1); }
  async function notifications() {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") { setDecision("granted"); return; }
    const permission = await Notification.requestPermission().catch(() => "denied" as NotificationPermission);
    setDecision(permission);
  }

  return (
    <div>
      <div className="fetch-panel rounded-3xl p-5 sm:p-8">
        <form onSubmit={submit} className="grid grid-cols-1 gap-5">
          <label htmlFor="fetch-url" className="text-sm font-semibold text-ink">Public video link</label>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line-strong bg-paper px-3 focus-within:border-mint-strong focus-within:ring-2 focus-within:ring-mint-strong/30">
              <Link2 className="h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
              <input id="fetch-url" type="url" inputMode="url" autoComplete="off" spellCheck={false} required maxLength={2048} value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste a public link" aria-describedby="fetch-input-help" disabled={!!busy || !!job && !TERMINAL.includes(job.status)} className="min-h-14 w-0 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted disabled:opacity-60" />
              <button type="button" onClick={() => void paste()} disabled={!!busy || !!job && !TERMINAL.includes(job.status)} className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-ink hover:bg-line disabled:opacity-40 ${focus}`} aria-label="Paste link"><ClipboardPaste className="h-4 w-4" aria-hidden="true" /><span className="hidden lg:inline">Paste</span></button>
              {url ? <button type="button" aria-label="Clear link" disabled={!!busy || !!job && !TERMINAL.includes(job.status)} onClick={() => setUrl("")} className={`min-h-11 min-w-9 rounded-lg text-ink ${focus}`}><X className="mx-auto h-4 w-4" aria-hidden="true" /></button> : null}
            </div>
            {!job || TERMINAL.includes(job.status) ? <button type="submit" disabled={!!busy || !rights || !url.trim() || !available || (!cleared && !token)} className={primary}>{busy === "probe" ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}{busy === "probe" ? "Joining…" : "Get download options"}</button> : null}
          </div>
          <p id="fetch-input-help" className="-mt-2 text-sm text-ink-soft">One public video. Submit takes a place in line.</p>
          {!job || TERMINAL.includes(job.status) ? <label className="flex items-start gap-3 text-sm leading-relaxed text-ink"><input type="checkbox" required checked={rights} onChange={e => setRights(e.target.checked)} className="mt-1 size-4 accent-mint-strong" /><span>I have the right to download this. <Link className="font-semibold underline underline-offset-4" href="/legal/terms">Terms</Link></span></label> : null}
          {status && !status.available ? <p role="status" className="rounded-xl border border-line-strong bg-paper px-4 py-3 text-sm text-ink">Downloads are paused. This page checks again.</p> : null}
          {showCheck ? <TurnstileField siteKey={siteKey} resetKey={reset} onToken={rememberToken} /> : null}
        </form>
        {message ? <p className="mt-5 rounded-xl border border-coral-strong/40 bg-coral px-4 py-3 text-sm text-ink" role="alert">{message}</p> : null}
        {busy ? <button type="button" onClick={() => pending.current?.abort()} className={`mt-3 min-h-11 text-sm font-medium text-ink underline ${focus}`}>Stop waiting</button> : null}
        {job ? <section className="mt-7 border-t border-line-strong pt-6" aria-label="Download result" aria-busy={!TERMINAL.includes(job.status) && job.status !== "waiting_choice"}>
          <Progress status={job.status} ready={job.ready} queuePosition={job.queuePosition} />
          {job.thumbnail || job.title ? <div className="grid min-w-0 gap-4">
            {job.thumbnail ? <Image unoptimized width={640} height={360} src={job.thumbnail} alt={job.title ? `${job.title} thumbnail` : "Video thumbnail"} referrerPolicy="no-referrer" className="max-h-64 w-full rounded-xl bg-paper object-contain" /> : null}
            <div className="min-w-0"><p className="text-sm font-medium text-ink-soft">{SOURCE_NAMES[job.platform] ?? "Link"} {duration(job.duration) ? `· ${duration(job.duration)}` : ""}</p>{job.title ? <h2 className="mt-1 break-words text-lg font-semibold text-ink">{job.title}</h2> : null}</div>
          </div> : null}
          {job.errorCode || ["failed", "expired"].includes(job.status) ? <div className="mt-5"><p role="alert" className="text-sm leading-relaxed text-ink">{ERRORS[job.errorCode ?? "failed"] ?? ERRORS.failed}</p><button type="button" onClick={startAnother} className={`${primary} mt-4`}>Check link again</button></div>
          : job.status === "waiting_choice" ? <form onSubmit={confirm} className="mt-5 grid gap-5">
            <fieldset><legend className="mb-3 text-sm font-semibold text-ink">File</legend><div className="flex flex-wrap gap-2">{FILE_MODES.map(mode => {
              const first = job.formats.find(f => modeOf(f) === mode.value);
              return <label key={mode.value} className={`flex min-h-12 items-center gap-2 rounded-xl border px-4 py-3 text-sm ${!first ? "cursor-not-allowed border-line text-ink-muted" : selectedMode === mode.value ? "cursor-pointer border-mint-strong bg-paper font-semibold text-ink shadow-[inset_4px_0_0_var(--mint-strong)]" : "cursor-pointer border-line-strong bg-paper text-ink hover:border-mint-strong"}`}><input type="radio" name="delivery-mode" value={mode.value} disabled={!first} checked={selectedMode === mode.value} onChange={() => { if (first) setFormatId(first.formatId); }} className="accent-mint-strong" />{mode.label}</label>;
            })}</div></fieldset>
            <p className="text-sm text-ink">{!job.formats.some(f => f.hasAudio) ? "No audio on this link." : selectedMode === "audio" ? "Audio only." : selectedMode === "video_only" ? "Video without audio." : "Video and audio."}</p>
            <fieldset><legend className="mb-3 text-sm font-semibold text-ink">{selectedMode === "audio" ? "Audio" : "Quality"}</legend><div className="grid gap-2 sm:grid-cols-2">{job.formats.filter(f => modeOf(f) === selectedMode).map(f => <label key={f.formatId} className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-paper p-4 ${formatId === f.formatId ? "border-mint-strong shadow-[inset_4px_0_0_var(--mint-strong)]" : "border-line-strong hover:border-mint-strong"}`}><input type="radio" name="format" required value={f.formatId} checked={formatId === f.formatId} onChange={() => setFormatId(f.formatId)} className="mt-1 accent-mint-strong" /><span><span className="block text-sm font-semibold text-ink">{f.label}</span><span className="mt-1 block text-xs text-ink-soft">{f.ext.toUpperCase()} · {f.filesize ? size(f.filesize) : "Size not provided"}</span></span></label>)}</div></fieldset>
            <button disabled={!!busy || (!cleared && !token) || !formatId || !available} className={primary} type="submit">{busy === "confirm" ? "Starting…" : "Prepare download"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button></form>
          : job.ready ? <div className="mt-5"><div role="status" className="flex items-center gap-3"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-mint-strong text-paper"><Check className="h-7 w-7" aria-hidden="true" /></div><div><p className="text-sm font-semibold text-ink">Ready</p><p className="mt-1 text-sm text-ink-soft">{FILE_MODES.find(mode => mode.value === job.deliveryMode)?.label ?? ""}{job.deliveryMode ? " · " : ""}{size(job.bytes)}{job.extension ? ` · ${job.extension.toUpperCase()}` : ""}{job.expiresAt ? ` · Until ${new Date(job.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</p></div></div>
            {preview?.id === job.id ? <div className="mt-4">{job.deliveryMode === "audio" ? <audio controls preload="metadata" src={preview.url} aria-label="Audio preview" className="w-full" onError={() => setPreviewNote("This browser could not play the preview. Download the file.")} /> : <video controls playsInline preload="metadata" src={preview.url} aria-label="Video preview" className="max-h-96 w-full rounded-xl bg-black" onError={() => setPreviewNote("This browser could not play the preview. Download the file.")} />}{previewNote ? <p role="status" className="mt-2 text-sm text-ink">{previewNote}</p> : null}</div> : null}
            <div className="mt-4 flex flex-wrap items-center gap-4"><button onClick={() => void previewFile()} disabled={!!busy} type="button" className={`inline-flex min-h-12 items-center gap-2 rounded-xl border border-line-strong bg-paper px-4 text-sm font-semibold text-ink ${focus}`}><Play className="h-4 w-4" aria-hidden="true" />{busy === "download" ? "Opening…" : preview?.id === job.id ? "Refresh preview" : "Preview"}</button><button onClick={() => void download()} disabled={!!busy} className={primary} type="button"><Download className="h-4 w-4" aria-hidden="true" />Download</button><button onClick={startAnother} type="button" className={`min-h-12 text-sm font-semibold text-ink underline underline-offset-4 ${focus}`}>Another link</button></div></div>
          : null}
          {canAsk && !TERMINAL.includes(job.status) ? <button type="button" onClick={() => void notifications()} className={`mt-4 min-h-11 text-sm font-semibold text-ink underline ${focus}`}>Notify me</button> : null}
          {connection ? <p role="status" className="mt-4 text-sm text-ink">{connection}</p> : null}
        </section> : null}
      </div>
      <details className="fetch-panel mt-6 rounded-xl px-5 py-4 text-sm text-ink"><summary className={`cursor-pointer font-semibold ${focus}`}>Limits</summary><div className="mt-3 grid gap-2 leading-relaxed text-ink-soft"><p>{status?.supportedPlatforms?.length ? status.supportedPlatforms.map(value => SOURCE_NAMES[value] ?? value).join(", ") : "Public video links only."} Playlists, channels, photo posts, and private media are not supported.</p><p>Guest: 50 a day, 1080p, 10 minutes, 200 MB. <Link href="/account" className="font-semibold text-ink underline">Signed in</Link>: 75 a day, 4K, 30 minutes, 800 MB. Files stay for six hours. <Link href="/guides/web-fetch" className="font-semibold text-ink underline">Guide</Link></p></div></details>
    </div>
  );
}
