export const MEDIA_EXTENSIONS = ["mp4", "webm", "mkv", "m4a", "mp3", "aac", "ogg", "opus", "wav", "flac", "mov", "m4v"];

/** Check the actual downloaded file, independently of extractor metadata. */
export function verifyMedia(info, job) {
  const streams = Array.isArray(info?.streams) ? info.streams : [];
  if (!streams.some(s => s.codec_type === "audio")) throw new Error("no_audio");
  const duration = Number(info?.format?.duration);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("unsupported");
  if (duration > job.maxSeconds + 1) throw new Error("too_long");
  if (job.mediaType === "video") {
    const video = streams.filter(s => s.codec_type === "video");
    if (!video.length || video.some(s => !Number.isFinite(s.height) || s.height < 1 || s.height > Math.min(job.maxHeight, job.expectedHeight ?? job.maxHeight))) throw new Error("no_format");
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
