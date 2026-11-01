import { TIER_LIMITS, type FetchTier } from "./limits.ts";
import { MEDIA_EXTENSIONS } from "../../../services/fetch-worker/media.mjs";

export type WorkerFormat = {
  format_id?: string; ext?: string; height?: number | null; fps?: number | null;
  filesize?: number | null; filesize_approx?: number | null;
  vcodec?: string; acodec?: string; abr?: number; tbr?: number;
};
export type DeliveryMode = "video_audio" | "video_only" | "audio";
export type DownloadVariant = {
  formatId: string; selector: string; label: string; ext: string;
  height: number | null; fps: number | null; filesize: number | null;
  mediaType: "video" | "audio"; hasAudio: boolean; deliveryMode?: DeliveryMode;
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
  const silent: DownloadVariant[] = [];
  const seen = new Set<string>();
  for (const f of video) {
    const ext = extension(f)!;
    const mate = codec(f.acodec) ? null : audio.find(a => ext === "mp4" ? a.ext === "m4a" : ext === "webm" ? a.ext === "webm" : true);
    // A silent source remains downloadable. Keep the explicit silent choice
    // separate so a normal video still defaults to including its audio.
    const silentKey = `silent:${f.height}:${ext}:${f.fps ?? 0}`;
    if (!seen.has(silentKey) && (bytes(f) ?? 0) <= cap.maxBytes && silent.length < 12) {
      seen.add(silentKey);
      silent.push({ formatId: `s${silent.length}`, selector: f.format_id!, label: `${f.height}p${f.fps && f.fps > 30 ? ` · ${f.fps} fps` : ""}`, ext,
        height: f.height!, fps: f.fps ?? null, filesize: codec(f.acodec) ? null : bytes(f), mediaType: "video", hasAudio: false, deliveryMode: "video_only" });
    }
    if (!codec(f.acodec) && !mate) continue;
    const outExt = mate ? (ext === "mp4" && mate.ext === "m4a" ? "mp4" : ext === "webm" && mate.ext === "webm" ? "webm" : "mkv") : ext;
    const size = mate ? (bytes(f) && bytes(mate) ? bytes(f)! + bytes(mate)! : null) : bytes(f);
    if (size && size > cap.maxBytes) continue;
    const key = `${f.height}:${outExt}:${f.fps ?? 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ formatId: `v${results.length}`, selector: mate ? `${f.format_id}+${mate.format_id}` : f.format_id!,
      label: `${f.height}p${f.fps && f.fps > 30 ? ` · ${f.fps} fps` : ""}`, ext: outExt,
      height: f.height!, fps: f.fps ?? null, filesize: size, mediaType: "video", hasAudio: true, deliveryMode: "video_audio" });
    if (results.length === 12) break;
  }
  for (const f of audio) {
    const ext = extension(f)!;
    if (seen.has(`audio:${ext}`) || (bytes(f) ?? 0) > cap.maxBytes) continue;
    seen.add(`audio:${ext}`);
    results.push({ formatId: `a${results.length}`, selector: f.format_id!, label: "Audio · original format", ext,
      height: null, fps: null, filesize: bytes(f), mediaType: "audio", hasAudio: true, deliveryMode: "audio" });
    if (results.length >= 16) break;
  }
  // When the source only offers a combined file, copy its existing audio track
  // into a compatible container. This does not convert the audio to MP3.
  if (!results.some(f => f.mediaType === "audio")) {
    const source = [...video].reverse().find(f => codec(f.acodec) && (bytes(f) ?? 0) <= cap.maxBytes);
    const audioExt = source && (/^(?:mp4a|aac)/i.test(source.acodec!) ? "m4a" : /^(?:opus|vorbis)/i.test(source.acodec!) ? "webm" : /^mp3/i.test(source.acodec!) ? "mp3" : null);
    if (source && audioExt) results.push({ formatId: "a0", selector: source.format_id!, label: "Full audio · original quality", ext: audioExt,
      height: null, fps: null, filesize: null, mediaType: "audio", hasAudio: true, deliveryMode: "audio" });
  }
  return [...results, ...silent];
}

export function publicFormat(f: DownloadVariant): PublicFormat {
  return { formatId: f.formatId, label: f.label, ext: f.ext, height: f.height, fps: f.fps, filesize: f.filesize, mediaType: f.mediaType, hasAudio: f.hasAudio,
    deliveryMode: f.deliveryMode ?? (f.mediaType === "audio" ? "audio" : f.hasAudio ? "video_audio" : "video_only") };
}

export function safeThumbnail(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 2048) return null;
  try {
    const u = new URL(raw);
    const domains = ["ytimg.com", "cdninstagram.com", "fbcdn.net", "tiktokcdn.com", "tiktokcdn-us.com", "vimeocdn.com", "redd.it", "sndcdn.com", "dmcdn.net", "twimg.com"];
    return u.protocol === "https:" && !u.username && !u.password && !u.port && domains.some(d => u.hostname === d || u.hostname.endsWith(`.${d}`)) ? u.href : null;
  } catch { return null; }
}
