"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ClipboardPaste, Download, Link2, LoaderCircle, X } from "lucide-react";
import { TurnstileField } from "@/components/fetch/turnstile-field";
import type { PublicFormat } from "@/lib/fetch/formats";

type Status = { workerConnected: boolean; accepting: boolean; storageConfigured: boolean; notice?: string; supportedPlatforms?: string[] };
type Job = { id: string; status: string; platform: string; errorCode: string | null; formats: PublicFormat[]; ready: boolean;
  title: string | null; thumbnail: string | null; duration: number | null; bytes?: number; queueAhead?: number; expiresAt: string | null; extension: string | null };
const SAVED_JOB = "halaldl.current-job";
const TERMINAL = ["ready", "failed", "expired", "cancelled"];
const SOURCE_NAMES: Record<string, string> = { youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook", x: "X", reddit: "Reddit", vimeo: "Vimeo", dailymotion: "Dailymotion", soundcloud: "SoundCloud" };
const ERRORS: Record<string, string> = {
  public_only: "Only supported public links are available. Private posts and Stories are not supported.",
  too_long: "This video exceeds your duration limit. Try a shorter video.", too_big: "This file exceeds the size limit. Choose a smaller quality.",
  too_many_items: "Choose one video. Collections, photo posts and carousels are not supported.", no_format: "No playable file fits the current limits.",
  expired: "This download has expired. Check the link again.", blocked: "This source ran into a download issue. Check that the link is public and try again later.",
  no_audio: "The source did not provide playable audio. Try another video or quality.",
  failed: "The download could not finish. You can check the link again.", unsupported: "This type of link is not supported.",
};
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint-strong";
const primary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-45 ${focus}`;

function size(bytes: number | null | undefined) { return bytes ? `${(bytes / 1048576).toFixed(1)} MB` : "Size not provided"; }
function duration(seconds: number | null) { return seconds == null ? null : `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`; }
async function request<T>(url: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const bounded = AbortSignal.timeout(15_000);
  const response = await fetch(url, { ...init, cache: "no-store", signal: signal ? AbortSignal.any([bounded, signal]) : bounded });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof body?.message === "string" ? body.message : "This request could not finish. Please try again.");
  if (!body || typeof body !== "object") throw new Error("An unexpected response arrived. Please try again.");
  return body as T;
}
function remember(id: string | null) { try { if (id) localStorage.setItem(SAVED_JOB, id); else localStorage.removeItem(SAVED_JOB); } catch { /* Storage can be disabled. */ } }

export function FetchTool({ siteKey }: { siteKey: string }) {
  const [url, setUrl] = useState("");
  const [rights, setRights] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState("");
  const [connection, setConnection] = useState("");
  const [busy, setBusy] = useState<"probe" | "confirm" | "download" | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [formatId, setFormatId] = useState("");
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);
  const [notify, setNotify] = useState(false);
  const [notificationNote, setNotificationNote] = useState("");
  const pending = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const notified = useRef("");
  const rememberToken = useCallback((value: string) => setToken(value), []);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      try { setStatus(await request<Status>("/api/fetch/status", {}, controller.signal)); }
      catch { if (!controller.signal.aborted) setStatus({ workerConnected: false, accepting: false, storageConfigured: false }); }
      if (!controller.signal.aborted) timer = setTimeout(tick, 10_000);
    }
    void tick();
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let id: string | null = null;
    try { id = localStorage.getItem(SAVED_JOB); } catch { /* Optional recovery. */ }
    if (id && /^[a-f0-9-]{36}$/.test(id)) {
      void request<Job>(`/api/fetch/jobs/${id}`, {}, controller.signal).then(value => {
        setJob(value); setFormatId(value.formats?.[0]?.formatId ?? "");
      }).catch(() => { if (!controller.signal.aborted) { remember(null); setMessage("The previous download could not be restored. Enter its public link again."); } });
    }
    return () => { controller.abort(); pending.current?.abort(); };
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
      } catch { if (!controller.signal.aborted) setConnection("Connection interrupted. We are checking again; your download is still saved here."); }
      if (!controller.signal.aborted) timer = setTimeout(tick, jobStatus === "waiting_choice" ? 8000 : 3000);
    }
    timer = setTimeout(tick, 1500);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [jobId, jobStatus]);

  useEffect(() => {
    if (!notify || !job || !TERMINAL.includes(job.status) || typeof Notification === "undefined" || Notification.permission !== "granted" || notified.current === `${job.id}:${job.status}`) return;
    notified.current = `${job.id}:${job.status}`;
    try { new Notification(job.ready ? "Your file is ready" : "Your download needs attention", { body: "Return to HalalDL to view your download." }); } catch { /* Some mobile browsers require a service worker. */ }
  }, [job, notify]);

  const available = !!siteKey && !!status?.accepting && status.storageConfigured;
  const availability = !siteKey ? "The download check has a temporary issue. You can still enter a link."
    : !status ? "Checking download availability…" : status.notice === "updating" ? "The downloader is being updated. Please try again shortly."
    : !status.workerConnected ? "The downloader is temporarily offline. This page checks again automatically."
    : !status.storageConfigured ? "File downloads are having temporary issues. Please try again later."
    : !status.accepting ? "The download queue is full. This page checks again automatically." : "";

  async function run(action: "probe" | "confirm" | "download", operation: (signal: AbortSignal) => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(action); setMessage("");
    const controller = new AbortController(); pending.current = controller;
    try { await operation(controller.signal); }
    catch (error) { setMessage(controller.signal.aborted ? "Stopped waiting for this request. Any accepted job can still finish in the background." : error instanceof Error ? error.message : "Please try again."); }
    finally { lock.current = false; setBusy(null); pending.current = null; if (action !== "download") { setToken(""); setReset(value => value + 1); } }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (job && !TERMINAL.includes(job.status)) return;
    await run("probe", async signal => {
      const result = await request<{ id: string }>("/api/fetch/probe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, url: url.trim(), rights }) }, signal);
      remember(result.id);
      const next = await request<Job>(`/api/fetch/jobs/${result.id}`, {}, signal);
      setJob(next); setFormatId(next.formats?.[0]?.formatId ?? "");
    });
  }
  async function confirm(event: React.FormEvent) {
    event.preventDefault(); if (!job) return;
    await run("confirm", async signal => {
      await request("/api/fetch/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, jobId: job.id, formatId }) }, signal);
      setJob({ ...job, status: "queued", formats: [] });
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
  async function paste() {
    try { const text = await navigator.clipboard.readText(); setUrl(text.slice(0, 2048)); setMessage(""); }
    catch { setMessage("The clipboard could not be read. Paste the link using your keyboard or touch menu."); }
    document.getElementById("fetch-url")?.focus();
  }
  function startAnother() { if (lock.current) return; setJob(null); setFormatId(""); setMessage(""); setConnection(""); remember(null); setToken(""); setReset(value => value + 1); }
  async function notifications() {
    if (typeof Notification === "undefined") { setNotificationNote("This browser could not enable notifications. Keep this page open."); return; }
    const permission = await Notification.requestPermission().catch(() => "denied");
    setNotify(permission === "granted"); setNotificationNote(permission === "granted" ? "Notifications enabled for this visit." : "Notifications are blocked. Keep this page open to check progress.");
  }

  return (
    <div>
      <div className="rounded-3xl border border-line bg-paper-strong p-5 shadow-lg sm:p-8">
        <form onSubmit={submit} className="grid grid-cols-1 gap-5">
          <label htmlFor="fetch-url" className="text-sm font-semibold text-ink">Public video link</label>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line-strong bg-paper px-3 focus-within:border-mint-strong focus-within:ring-2 focus-within:ring-mint-strong/20">
              <Link2 className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
              <input id="fetch-url" type="url" inputMode="url" autoComplete="off" spellCheck={false} required maxLength={2048} value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste a public link" aria-describedby="fetch-input-help" disabled={!!busy || !!job && !TERMINAL.includes(job.status)} className="min-h-14 w-0 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted disabled:opacity-60" />
              <button type="button" onClick={() => void paste()} disabled={!!busy || !!job && !TERMINAL.includes(job.status)} className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-ink-soft hover:bg-line disabled:opacity-40 ${focus}`} aria-label="Paste link"><ClipboardPaste className="h-4 w-4" aria-hidden="true" /><span className="hidden lg:inline">Paste</span></button>
              {url ? <button type="button" aria-label="Clear link" disabled={!!busy || !!job && !TERMINAL.includes(job.status)} onClick={() => setUrl("")} className={`min-h-11 min-w-9 rounded-lg text-ink-soft ${focus}`}><X className="mx-auto h-4 w-4" aria-hidden="true" /></button> : null}
            </div>
            {!job || TERMINAL.includes(job.status) ? <button type="submit" disabled={!!busy || !token || !rights || !url.trim() || !available} className={primary}>{busy === "probe" ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}{busy === "probe" ? "Checking link…" : "Get download options"}</button> : null}
          </div>
          <p id="fetch-input-help" className="-mt-2 text-xs leading-relaxed text-ink-soft">One public video at a time. No installation required. Some sources may have temporary issues. If a download fails, try again later.</p>
          {!job || TERMINAL.includes(job.status) ? <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft"><input type="checkbox" required checked={rights} onChange={e => setRights(e.target.checked)} className="mt-1 size-4 accent-mint-strong" /><span>I have the right to download this media. <Link className="font-medium text-ink underline underline-offset-4" href="/legal/terms">Terms</Link></span></label> : null}
          {availability ? <p role="status" className="rounded-xl bg-paper px-4 py-3 text-sm text-ink-soft">{availability}</p> : null}
          {siteKey && (!job || job.status === "waiting_choice" || TERMINAL.includes(job.status)) ? <div><TurnstileField siteKey={siteKey} resetKey={reset} onToken={rememberToken} /></div> : null}
        </form>
        {message ? <p className="mt-5 rounded-xl border border-coral-strong/25 bg-coral px-4 py-3 text-sm text-ink" role="alert">{message}</p> : null}
        {busy ? <button type="button" onClick={() => pending.current?.abort()} className={`mt-3 min-h-11 text-sm text-ink-soft underline ${focus}`}>Stop waiting for request</button> : null}
        {job ? <section className="mt-7 border-t border-line pt-6" aria-label="Download result" aria-busy={!TERMINAL.includes(job.status) && job.status !== "waiting_choice"}>
          <div className="flex items-start gap-4">
            {job.thumbnail ? <Image unoptimized width={320} height={180} src={job.thumbnail} alt="" referrerPolicy="no-referrer" className="hidden aspect-video w-32 rounded-xl object-cover sm:block" /> : null}
            <div className="min-w-0"><p className="text-xs font-medium capitalize tracking-wide text-ink-soft">{job.platform} {duration(job.duration) ? `· ${duration(job.duration)}` : ""}</p><h2 className="mt-1 break-words text-lg font-semibold text-ink">{job.title || "Your download"}</h2></div>
          </div>
          {job.errorCode || ["failed", "expired"].includes(job.status) ? <div className="mt-5"><p role="alert" className="text-sm leading-relaxed text-ink-soft">{ERRORS[job.errorCode ?? "failed"] ?? ERRORS.failed}</p><button type="button" onClick={startAnother} className={`${primary} mt-4`}>Check link again</button></div>
          : job.status === "waiting_choice" ? <form onSubmit={confirm} className="mt-5 grid gap-4"><fieldset><legend className="mb-3 text-sm font-semibold text-ink">Choose your file</legend><div className="grid gap-2 sm:grid-cols-2">{job.formats.map(f => <label key={f.formatId} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${formatId === f.formatId ? "border-mint-strong bg-mint" : "border-line hover:border-line-strong"}`}><input type="radio" name="format" required value={f.formatId} checked={formatId === f.formatId} onChange={() => setFormatId(f.formatId)} className="mt-1 accent-mint-strong" /><span><span className="block text-sm font-semibold text-ink">{f.label}</span><span className="mt-1 block text-xs text-ink-soft">{f.ext.toUpperCase()} · {f.filesize ? `≈ ${size(f.filesize)}` : "Size not provided"}{f.mediaType === "video" ? " · with audio" : ""}</span></span></label>)}</div></fieldset><button disabled={!!busy || !token || !formatId || !available} className={primary} type="submit">{busy === "confirm" ? "Starting…" : "Prepare download"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button></form>
          : job.ready ? <div className="mt-5"><p role="status" className="flex items-center gap-2 text-sm font-semibold text-mint-strong"><Check className="h-4 w-4" aria-hidden="true" />Your file is ready</p><p className="mt-2 text-sm text-ink-soft">{size(job.bytes)}{job.extension ? ` · ${job.extension.toUpperCase()}` : ""}{job.expiresAt ? ` · Available until ${new Date(job.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</p><button onClick={() => void download()} disabled={!!busy} className={`${primary} mt-4`} type="button"><Download className="h-4 w-4" aria-hidden="true" />{busy === "download" ? "Opening download…" : "Download file"}</button><button onClick={startAnother} type="button" className={`ml-4 mt-4 min-h-12 text-sm font-medium text-ink underline underline-offset-4 ${focus}`}>Download another</button></div>
          : <div className="mt-5"><p role="status" className="flex items-center gap-2 text-sm font-medium text-ink"><LoaderCircle className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />{job.status === "queued" ? `Queued${typeof job.queueAhead === "number" ? job.queueAhead === 0 ? " · next in line" : ` · ${job.queueAhead} ahead` : ""}` : job.status === "probing" ? "Checking your link…" : "Preparing your file…"}</p><p className="mt-2 text-sm leading-relaxed text-ink-soft">You can keep this tab in the background. Larger files take longer.</p>{!notify ? <button type="button" onClick={() => void notifications()} className={`mt-3 min-h-11 text-sm font-medium text-ink underline underline-offset-4 ${focus}`}>Notify me when ready</button> : null}{notificationNote ? <p role="status" className="text-xs text-ink-soft">{notificationNote}</p> : null}</div>}
          {connection ? <p role="status" className="mt-4 text-sm text-ink-soft">{connection}</p> : null}
        </section> : null}
      </div>
      <details className="mt-6 rounded-xl border border-line px-5 py-4 text-sm text-ink-soft"><summary className={`cursor-pointer font-semibold text-ink ${focus}`}>Supported links and limits</summary><div className="mt-4 grid gap-3 leading-relaxed"><p>{status?.supportedPlatforms?.length ? `Sources you can try: ${status.supportedPlatforms.map(value => SOURCE_NAMES[value] ?? value).join(", ")}.` : "Paste a link from one of the sources listed in the download guide."} Use one public video or original audio link. Playlists, channels, photo posts, carousels, Stories and private media are not supported.</p><p>Some sources may have temporary issues. If a link does not work, try again later or use the <Link href="/download" className="font-medium text-ink underline">Windows app</Link>.</p><p>Guest: 50 downloads a day, one active link, up to 1080p, 10 minutes and 200 MB. <Link href="/account" className="font-medium text-ink underline">Free Google sign-in</Link>: 75 downloads a day, three active links, up to 4K, 30 minutes and 800 MB. Actual choices depend on the source.</p><p>Files expire after six hours. <Link href="/guides/web-fetch" className="font-medium text-ink underline">Read the download guide</Link></p></div></details>
    </div>
  );
}
