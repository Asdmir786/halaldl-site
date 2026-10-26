import assert from "node:assert/strict";
import test from "node:test";
import { downloadVariants, publicFormat, safeThumbnail, type WorkerFormat } from "../src/lib/fetch/formats.ts";

const video: WorkerFormat = { format_id: "137", ext: "mp4", height: 1080, vcodec: "avc1", acodec: "none", filesize: 10_000 };
const audio: WorkerFormat = { format_id: "140", ext: "m4a", vcodec: "none", acodec: "aac", filesize: 1000 };
test("video-only streams require an audio mate and a server-stored selector", () => {
  assert.equal(downloadVariants([video], "anonymous").length, 0);
  const result = downloadVariants([video, audio], "anonymous");
  assert.equal(result[0].selector, "137+140");
  assert.equal(result[0].filesize, 11_000);
  assert.equal(result[0].hasAudio, true);
  assert.equal("selector" in publicFormat(result[0]), false);
  assert.equal(result[1].mediaType, "audio");
  assert.equal(result[1].ext, "m4a");
});
test("quality caps and combined file-size limits are enforced", () => {
  assert.equal(downloadVariants([{ ...video, height: 2160 }, audio], "anonymous").filter(f => f.mediaType === "video").length, 0);
  assert.equal(downloadVariants([{ ...video, height: 2160 }, audio], "free")[0].height, 2160);
  assert.equal(downloadVariants([{ ...video, filesize: 200 * 1048576 }, audio], "anonymous").filter(f => f.mediaType === "video").length, 0);
});
test("muxed files retain audio and unsafe selectors never enter choices", () => {
  const formats = downloadVariants([{ ...video, acodec: "aac" }, { ...video, format_id: "--exec" }], "anonymous");
  assert.equal(formats[0].selector, "137");
  assert.equal(formats.length, 1);
});
test("unknown sizes are honest and missing codecs are not called audio", () => {
  const [f] = downloadVariants([{ ...video, filesize: undefined }, audio], "anonymous");
  assert.equal(f.filesize, null);
  assert.deepEqual(downloadVariants([{ format_id: "x", ext: "mp4", acodec: "aac" }], "anonymous"), []);
});
test("thumbnails must use known HTTPS media hosts", () => {
  assert.equal(safeThumbnail("https://i.ytimg.com/vi/example/default.jpg"), "https://i.ytimg.com/vi/example/default.jpg");
  for (const url of ["http://i.ytimg.com/x", "https://127.0.0.1/x", "https://i.ytimg.com.evil.test/x", "https://user:pass@i.ytimg.com/x", "https://i.ytimg.com:444/x"]) assert.equal(safeThumbnail(url), null);
});
