import { TIER_LIMITS, type FetchTier } from "./limits.ts";
import { MEDIA_EXTENSIONS } from "../../../services/fetch-worker/media.mjs";

export type WorkerFormat = {
  format_id?: string; ext?: string; height?: number | null; fps?: number | null;
  filesize?: number | null; filesize_approx?: number | null;
  vcodec?: string; acodec?: string; abr?: number; tbr?: number;
};
export type DownloadVariant = {
  formatId: string; selector: string; label: string; ext: string;
  height: number | null; fps: number | null; filesize: number | null;
  mediaType: "video" | "audio"; hasAudio: true;
};
export type PublicFormat = Omit<DownloadVariant, "selector">;

const validId = (id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(id);
const bytes = (f: WorkerFormat) => {
  const n = f.filesize ?? f.filesize_approx;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.ceil(n) : null;
};
const codec = (value: unknown) => typeof value === "string" && value !== "none" && value.length > 0;
const extension = (f: WorkerFormat) => typeof f.ext === "string" && MEDIA_EXTENSIONS.includes(f.ext) ? f.ext : null;

export function downloadVariants(input: WorkerFormat[], tier: FetchTier): DownloadVariant[] {
  const cap = TIER_LIMITS[tier];
  const formats = input.slice(0, 500).filter(f => validId(f.format_id) && extension(f));
  const audio = formats.filter(f => f.vcodec === "none" && codec(f.acodec))
    .sort((a, b) => (b.abr ?? b.tbr ?? 0) - (a.abr ?? a.tbr ?? 0));
  const video = formats.filter(f => codec(f.vcodec) && Number.isFinite(f.height) && f.height! > 0 && f.height! <= cap.maxHeight)
    .sort((a, b) => b.height! - a.height! || (b.tbr ?? 0) - (a.tbr ?? 0));
  const results: DownloadVariant[] = [];
  const seen = new Set<string>();
  for (const f of video) {
    const ext = extension(f)!;
    const mate = codec(f.acodec) ? null : audio.find(a => ext === "mp4" ? a.ext === "m4a" : ext === "webm" ? a.ext === "webm" : true);
    if (!codec(f.acodec) && !mate) continue;
    const outExt = mate ? (ext === "mp4" && mate.ext === "m4a" ? "mp4" : ext === "webm" && mate.ext === "webm" ? "webm" : "mkv") : ext;
    const size = mate ? (bytes(f) && bytes(mate) ? bytes(f)! + bytes(mate)! : null) : bytes(f);
    if (size && size > cap.maxBytes) continue;
    const key = `${f.height}:${outExt}:${f.fps ?? 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ formatId: `v${results.length}`, selector: mate ? `${f.format_id}+${mate.format_id}` : f.format_id!,
      label: `${f.height}p${f.fps && f.fps > 30 ? ` · ${f.fps} fps` : ""}`, ext: outExt,
      height: f.height!, fps: f.fps ?? null, filesize: size, mediaType: "video", hasAudio: true });
    if (results.length === 12) break;
  }
  for (const f of audio) {
    const ext = extension(f)!;
    if (seen.has(`audio:${ext}`) || (bytes(f) ?? 0) > cap.maxBytes) continue;
    seen.add(`audio:${ext}`);
    results.push({ formatId: `a${results.length}`, selector: f.format_id!, label: "Audio · original format", ext,
      height: null, fps: null, filesize: bytes(f), mediaType: "audio", hasAudio: true });
    if (results.length >= 16) break;
  }
  return results;
}

export function publicFormat(f: DownloadVariant): PublicFormat {
  return { formatId: f.formatId, label: f.label, ext: f.ext, height: f.height, fps: f.fps, filesize: f.filesize, mediaType: f.mediaType, hasAudio: f.hasAudio };
}

export function safeThumbnail(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 2048) return null;
  try {
    const u = new URL(raw);
    const domains = ["ytimg.com", "cdninstagram.com", "fbcdn.net", "tiktokcdn.com", "tiktokcdn-us.com", "vimeocdn.com", "redd.it", "sndcdn.com", "dmcdn.net", "twimg.com"];
    return u.protocol === "https:" && !u.username && !u.password && !u.port && domains.some(d => u.hostname === d || u.hostname.endsWith(`.${d}`)) ? u.href : null;
  } catch { return null; }
}
