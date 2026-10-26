import assert from "node:assert/strict";
import test from "node:test";
import { classifyFetchUrl } from "../src/lib/fetch/url.ts";

test("accepts a public youtube video and drops the hash", () => {
  const result = classifyFetchUrl("https://www.youtube.com/watch?v=abc123&list=PL#t=10");
  assert.equal(result.platform, "youtube");
  assert.equal(result.href.includes("#"), false);
  assert.equal(result.privateOrStory, false);
});

test("refuses a youtube playlist", () => {
  assert.throws(() => classifyFetchUrl("https://www.youtube.com/playlist?list=PL123"), /Playlists/);
});

test("refuses an unknown host and an http link", () => {
  assert.throws(() => classifyFetchUrl("https://example.com/video"), /not available/);
  assert.throws(() => classifyFetchUrl("http://youtu.be/abc"), /https/);
});

test("stories are unavailable to every account", () => {
  assert.throws(() => classifyFetchUrl("https://www.instagram.com/stories/someone/1/"), /public links/);
});

test("refuses credentials and ip hosts", () => {
  assert.throws(() => classifyFetchUrl("https://user:pass@youtube.com/watch?v=abc"), /password/);
  assert.throws(() => classifyFetchUrl("https://127.0.0.1/watch?v=abc"), /not allowed/);
});

test("YouTube share/watch/Shorts links normalize to one deduplication key", () => {
  for (const link of ["https://youtu.be/abc123?si=tracking", "https://www.youtube.com/watch?v=abc123&list=ignored", "https://youtube.com/shorts/abc123#t=30"]) {
    assert.equal(classifyFetchUrl(link).href, "https://www.youtube.com/watch?v=abc123");
  }
});

test("custom ports and profile/collection URLs never reach the worker", () => {
  for (const link of ["https://youtube.com:444/watch?v=abc", "https://instagram.com/someone/", "https://tiktok.com/@someone", "https://reddit.com/r/videos/", "https://soundcloud.com/user/sets/music"]) assert.throws(() => classifyFetchUrl(link));
  for (const link of ["https://instagram.com/reel/example/", "https://www.tiktok.com/@example/video/12345", "https://fb.watch/example/", "https://x.com/example/status/12345", "https://reddit.com/r/videos/comments/abc123/title/", "https://vimeo.com/12345", "https://dai.ly/abc123", "https://soundcloud.com/artist/track"]) assert.ok(classifyFetchUrl(link).platform);
});
