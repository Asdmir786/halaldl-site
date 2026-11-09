"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createReadController, type ReadController } from "@/lib/fetch/read-controller";
import { classifyFetchUrl } from "@/lib/fetch/url";
import type { DeliveryMode, PublicFormat } from "@/lib/fetch/formats";

export type Job = { id: string; kind?: string; status: string; platform: string; errorCode: string | null; formats: PublicFormat[]; ready: boolean;
  title: string | null; thumbnail: string | null; duration: number | null; deliveryMode?: DeliveryMode | null; bytes?: number; queuePosition?: number | null;
  expiresAt: string | null; extension: string | null; sourceUrl: string; createdAt?: string; quality?: string };
type Health = { available: boolean; workerConnected?: boolean; canDownload?: boolean; message?: string; cleared?: boolean; jobId?: string | null; supportedPlatforms?: string[] };
export const activeJob = (job: Job | null) => !!job && ["queued", "probing", "waiting_choice", "downloading"].includes(job.status);
const SAVED = "halaldl.current-job";
function remember(id: string | null) { try { if (id) localStorage.setItem(SAVED, id); else localStorage.removeItem(SAVED); } catch {} }
function saved() { try { return localStorage.getItem(SAVED); } catch { return null; } }
class RequestError extends Error { constructor(message: string, readonly code?: string, readonly status?: number) { super(message); } }
async function request<T>(url: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store", signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  const body = await response.json();
  if (!response.ok) throw new RequestError(body.message ?? "This request could not finish. Try again.", body.error, response.status);
  return body as T;
}
const json = (body: unknown) => ({ headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export function useFetchJobs() {
  const [url, setUrl] = useState("");
  const [rights, setRights] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<Job[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [health, setHealth] = useState<Health | null>(null);
  const [message, setMessage] = useState("");
  const [connection, setConnection] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [formatId, setFormatId] = useState("");
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);
  const [preview, setPreview] = useState<{ id: string; url: string } | null>(null);
  const version = useRef(0);
  const selected = useRef<string | null>(null);
  const locked = useRef(false);
  const recovery = useRef(false);
  const alive = useRef(true);
  const sessionPrepared = useRef(false);
  const acceptToken = useCallback((value: string) => setToken(value), []);

  const historyReader = useRef<ReadController | null>(null);
  const statusReader = useRef<ReadController | null>(null);
  const historyUpdated = useRef(0);
  const refreshHistory = useCallback(async () => { await historyReader.current?.refresh(); }, []);
  useEffect(() => {
    alive.current = true;
    const reader = createReadController({
      read: async signal => {
        const value = await request<{ jobs: Job[] }>("/api/fetch/history", {}, signal);
        if (!signal.aborted && alive.current) { setHistory(value.jobs); setHistoryError(""); historyUpdated.current = Date.now(); }
      },
      interval: () => Infinity, retryMs: 60_000, maxRetryMs: 60_000,
      onError: () => setHistoryError("Recent downloads could not be loaded. We’ll try again."),
    });
    historyReader.current = reader;
    const visibility = () => reader.setVisible(!document.hidden, Date.now() - historyUpdated.current > 30_000);
    document.addEventListener("visibilitychange", visibility); visibility();
    return () => { alive.current = false; reader.stop(); historyReader.current = null; document.removeEventListener("visibilitychange", visibility); };
  }, []);

  function show(value: Job) {
    selected.current = value.id; setJob(value); setUrl(value.sourceUrl); remember(value.id);
    setFormatId(value.formats[0]?.formatId ?? ""); setPreview(null); setConnection(""); setMessage("");
  }
  useEffect(() => {
    const initialVersion = version.current;
    let boot = true;
    const reader = createReadController({
      interval: () => recovery.current ? 2000 : 30_000,
      onError: () => setHealth({ available: false, message: "The download service could not be reached. We’ll check again." }),
      read: async signal => {
        const next = await request<Health>("/api/fetch/status", {}, signal);
        if (signal.aborted) return;
        setHealth(next);
        const candidate = recovery.current ? next.jobId : boot && version.current === initialVersion ? next.jobId ?? saved() : null;
        boot = false;
        if (candidate && candidate !== selected.current) {
          const epoch = version.current;
          try {
            const value = await request<Job>(`/api/fetch/jobs/${candidate}`, {}, signal);
            if (!signal.aborted && version.current === epoch) { show(value); recovery.current = false; }
          } catch (error) { if (version.current === epoch && error instanceof RequestError && [401, 404].includes(error.status ?? 0)) remember(null); else throw error; }
        }
        if (recovery.current && !next.jobId) { recovery.current = false; setConnection("No active job was found. You can try again."); }
      },
    });
    statusReader.current = reader;
    const visibility = () => reader.setVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility); visibility();
    return () => { reader.stop(); statusReader.current = null; document.removeEventListener("visibilitychange", visibility); };
  }, []);

  const jobId = job?.id, status = job?.status;
  useEffect(() => {
    if (!jobId) return;
    const epoch = version.current;
    const reader = createReadController({
      interval: () => status === "waiting_choice" ? 30_000 : ["queued", "probing", "downloading"].includes(status ?? "") ? 2000 : Infinity,
      onError: () => { if (version.current === epoch) setConnection("Connection interrupted. Your job is saved; we’re checking again."); },
      read: async signal => {
        const value = await request<Job>(`/api/fetch/jobs/${jobId}`, {}, signal);
        if (signal.aborted || version.current !== epoch || selected.current !== jobId) return;
        setJob(value); setConnection(""); recovery.current = false;
        setFormatId(current => value.formats.some(f => f.formatId === current) ? current : value.formats[0]?.formatId ?? "");
        if (!activeJob(value) && ["queued", "probing", "waiting_choice", "downloading"].includes(status ?? "")) void refreshHistory();
      },
    });
    const visibility = () => reader.setVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility); visibility();
    return () => { reader.stop(); document.removeEventListener("visibilitychange", visibility); };
    // Fence reads to the captured selection rather than the editable draft.
  }, [jobId, status, refreshHistory]);

  function newLink(value = "") {
    if (locked.current) return;
    version.current++; selected.current = null; recovery.current = false;
    setUrl(value); setRights(false); setJob(null); setPreview(null); setFormatId(""); setMessage(""); setConnection(""); remember(null);
    try { if (value) classifyFetchUrl(value); } catch (error) { if (error instanceof Error && "code" in error && error.code === "multiple_links") setMessage(error.message); }
  }
  async function run(action: string, operation: () => Promise<void>) {
    if (locked.current) return false;
    locked.current = true; setBusy(action); setMessage("");
    try { await operation(); return true; }
    catch (error) {
      if (!alive.current) return false;
      setMessage(error instanceof Error && error.name === "TimeoutError" ? "The connection timed out. We’re checking whether your request was accepted." : error instanceof Error ? error.message : "This request could not finish. Try again.");
      if (error instanceof RequestError && /check|clearance/.test(error.code ?? "")) setHealth(current => current ? { ...current, cleared: false } : current);
      if (error instanceof RequestError && (error.code?.startsWith("worker_") || error.code === "storage")) {
        setHealth(current => current ? { ...current, canDownload: false,
          ...(action === "confirm" && error.code !== "worker_offline" ? {} : { available: false }), message: error.message } : current);
      }
      const uncertain = !(error instanceof RequestError) || (error.status ?? 0) >= 500 && !error.code?.startsWith("worker_");
      if (uncertain && ["probe", "confirm", "retry", "change_quality", "cancel"].includes(action)) { recovery.current = true; setConnection("Checking whether your request was accepted. Your job will appear here automatically."); void statusReader.current?.refresh(); }
      return false;
    } finally {
      locked.current = false;
      if (alive.current) { setBusy(null); setToken(""); setReset(v => v + 1); void refreshHistory(); }
    }
  }
  async function open(entry: Job) {
    await run("open", async () => {
      const epoch = version.current;
      const value = await request<Job>(`/api/fetch/jobs/${entry.id}`);
      if (alive.current && epoch === version.current) { version.current++; recovery.current = false; show(value); }
    });
  }
  function queued(result: { id: string; platform: string; queuePosition?: number }, sourceUrl: string) {
    version.current++;
    show({ ...result, status: "queued", sourceUrl, errorCode: null, ready: false, formats: [], title: null, thumbnail: null, duration: null, expiresAt: null, extension: null });
    setHealth(current => current ? { ...current, cleared: true } : current);
  }
  async function probe() {
    await run("probe", async () => {
      const link = classifyFetchUrl(url).href;
      if (!sessionPrepared.current) {
        await request("/api/fetch/clearance", { method: "POST", ...json({ token }) });
        sessionPrepared.current = true;
      }
      const result = await request<{ id: string; platform: string; queuePosition?: number }>("/api/fetch/probe", { method: "POST", ...json({ url: link, token, rights }) });
      if (alive.current) queued(result, link);
    });
  }
  async function confirm() {
    if (!job) return;
    const original = job;
    await run("confirm", async () => {
      await request("/api/fetch/confirm", { method: "POST", ...json({ jobId: original.id, formatId, token }) });
      if (alive.current && selected.current === original.id) { setJob({ ...original, kind: "download", status: "queued", formats: [], queuePosition: null }); setHealth(current => current ? { ...current, cleared: true } : current); }
    });
  }
  async function cancel(changeLink = false) {
    if (!job) return;
    const id = job.id;
    const ok = await run("cancel", async () => {
      try { await request(`/api/fetch/jobs/${id}`, { method: "DELETE" }); }
      catch (error) { if (error instanceof RequestError && error.status === 409) { show(await request<Job>(`/api/fetch/jobs/${id}`)); } throw error; }
      if (alive.current && selected.current === id) { setJob(current => current ? { ...current, status: "cancelled", ready: false, formats: [], errorCode: null } : current); setPreview(null); }
    });
    if (ok && changeLink) newLink();
  }
  async function restart(entry: Job, action: "retry" | "change_quality") {
    await run(action, async () => {
      const link = classifyFetchUrl(entry.sourceUrl).href;
      const result = await request<{ id: string; platform: string; queuePosition?: number }>(`/api/fetch/jobs/${entry.id}`, { method: "PATCH", ...json({ action, token }) });
      if (alive.current) queued(result, link);
    });
  }
  async function media(entry: Job, inline = false) {
    const epoch = version.current;
    await run(inline ? "preview" : "download", async () => {
      classifyFetchUrl(entry.sourceUrl);
      const result = await request<{ url: string }>(`/api/fetch/jobs/${entry.id}${inline ? "?preview=1" : ""}`, { method: "POST" });
      const target = new URL(result.url);
      if (target.protocol !== "https:" || !target.hostname.endsWith(".r2.cloudflarestorage.com")) throw new Error("The download address could not be verified.");
      if (!alive.current || epoch !== version.current) return;
      if (inline) { if (selected.current === entry.id) setPreview({ id: entry.id, url: target.href }); }
      else window.location.assign(target.href);
    });
  }
  return { url, rights, setRights, job, history, historyError, health, message, setMessage, connection, busy, formatId, setFormatId, token, reset, acceptToken, preview,
    newLink, probe, confirm, cancel, restart, media, open };
}
