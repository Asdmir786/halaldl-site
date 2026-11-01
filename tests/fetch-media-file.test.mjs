import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative } from "node:path";
import test from "node:test";
import { run } from "../services/fetch-worker/process.mjs";
import { verifyMedia } from "../services/fetch-worker/media.mjs";

const ffmpeg = process.env.FETCH_TEST_FFMPEG;
const ffprobe = process.env.FETCH_TEST_FFPROBE;
if (!ffmpeg || !ffprobe || !isAbsolute(ffmpeg) || !isAbsolute(ffprobe)) throw new Error("Set absolute FETCH_TEST_FFMPEG and FETCH_TEST_FFPROBE paths to run the real-media fixture test");

test("real MP4 fixtures pass stream checks; silent files and wrong containers fail", async () => {
  const directory = await mkdtemp(join(tmpdir(), "halaldl-media-"));
  const media = join(directory, "sample.mp4");
  const silent = join(directory, "silent.mp4");
  const audio = join(directory, "audio.m4a");
  const options = { cwd: directory, timeoutMs: 60_000 };
  try {
    const made = await run(ffmpeg, ["-v", "error", "-f", "lavfi", "-i", "color=c=black:s=320x180:r=5:d=1", "-f", "lavfi", "-i", "sine=frequency=440:duration=1", "-c:v", "mpeg4", "-c:a", "aac", "-threads", "1", "-shortest", "-y", media], options);
    assert.equal(made.code, 0, made.stderr);
    const probe = await run(ffprobe, ["-v", "error", "-protocol_whitelist", "file,pipe", "-show_entries", "stream=codec_type,height:format=duration,format_name", "-of", "json", media], options);
    assert.equal(probe.code, 0, probe.stderr);
    const job = { mediaType: "video", extension: "mp4", maxHeight: 180, maxSeconds: 10 };
    assert.equal(verifyMedia(JSON.parse(probe.stdout), job), true);
    assert.throws(() => verifyMedia(JSON.parse(probe.stdout), { ...job, extension: "webm" }), /no_format/);
    const stripped = await run(ffmpeg, ["-v", "error", "-i", media, "-an", "-c:v", "copy", "-y", silent], options);
    assert.equal(stripped.code, 0, stripped.stderr);
    const silentInfo = await run(ffprobe, ["-v", "error", "-show_entries", "stream=codec_type,height:format=duration,format_name", "-of", "json", silent], options);
    assert.equal(silentInfo.code, 0, silentInfo.stderr);
    assert.throws(() => verifyMedia(JSON.parse(silentInfo.stdout), job), /no_audio/);
    assert.equal(verifyMedia(JSON.parse(silentInfo.stdout), { ...job, deliveryMode: "video_only" }), true);
    const extracted = await run(ffmpeg, ["-nostdin", "-v", "error", "-protocol_whitelist", "file,pipe", "-i", media, "-map", "0:a:0", "-vn", "-c:a", "copy", "-map_metadata", "-1", "-threads", "1", "-y", audio], options);
    assert.equal(extracted.code, 0, extracted.stderr);
    const audioInfo = await run(ffprobe, ["-v", "error", "-show_entries", "stream=codec_type,height:format=duration,format_name", "-of", "json", audio], options);
    assert.equal(audioInfo.code, 0, audioInfo.stderr);
    assert.equal(verifyMedia(JSON.parse(audioInfo.stdout), { ...job, mediaType: "audio", deliveryMode: "audio", extension: "m4a" }), true);
    assert.throws(() => verifyMedia(JSON.parse(probe.stdout), { ...job, deliveryMode: "video_only" }), /no_format/);
  } finally {
    const inside = relative(tmpdir(), directory);
    if (isAbsolute(inside) || inside.startsWith("..") || !inside.startsWith("halaldl-media-")) throw new Error("Refusing unsafe fixture cleanup");
    await rm(directory, { recursive: true, force: true });
  }
});
