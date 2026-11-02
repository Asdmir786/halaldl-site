export const MEDIA_EXTENSIONS = ["mp4", "webm", "mkv", "m4a", "mp3", "aac", "ogg", "opus", "wav", "flac", "mov", "m4v"];

/** The conventional quality number is the shorter side. Portrait files stay measurable. */
export function pictureEdge(width, height) {
  const h = Number(height);
  const w = Number(width);
  if (!Number.isFinite(h) || h <= 0) return null;
  if (!Number.isFinite(w) || w <= 0) return h;
  return Math.min(w, h);
}

/** Check the actual downloaded file, independently of extractor metadata. */
export function verifyMedia(info, job) {
  const streams = Array.isArray(info?.streams) ? info.streams : [];
  const audio = streams.some(s => s.codec_type === "audio");
  const mode = job.deliveryMode ?? (job.mediaType === "audio" ? "audio" : "video_audio");
  if (mode !== "video_only" && !audio) throw new Error("no_audio");
  if (mode === "video_only" && audio) throw new Error("no_format");
  if (mode === "audio" && streams.some(s => s.codec_type === "video")) throw new Error("no_format");
  const duration = Number(info?.format?.duration);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("unsupported");
  if (duration > job.maxSeconds + 1) throw new Error("too_long");
  if (job.mediaType === "video") {
    const video = streams.filter(s => s.codec_type === "video");
    const limit = Math.min(job.maxHeight, job.expectedHeight ?? job.maxHeight);
    if (!video.length || video.some(s => { const edge = pictureEdge(s.width, s.height); return edge == null || edge > limit; })) throw new Error("no_format");
  }
  const containers = {
    mp4: ["mov", "mp4"], m4a: ["mov", "mp4"], mov: ["mov"], m4v: ["mov", "mp4", "m4v"],
    webm: ["webm"], mkv: ["matroska"], mp3: ["mp3"], aac: ["aac"],
    ogg: ["ogg"], opus: ["ogg"], wav: ["wav"], flac: ["flac"],
  };
  const actual = String(info?.format?.format_name ?? "").split(",");
  if (!containers[job.extension]?.some(name => actual.includes(name))) throw new Error("no_format");
  return true;
}
