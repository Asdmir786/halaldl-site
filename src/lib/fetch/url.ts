import { InputError } from "./policy.ts";

export type FetchPlatform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "x"
  | "reddit"
  | "vimeo"
  | "dailymotion"
  | "soundcloud";

export type ClassifiedUrl = {
  href: string;
  platform: FetchPlatform;
  privateOrStory: boolean;
  guideSlug: string;
};

const HOSTS: Record<FetchPlatform, string[]> = {
  youtube: ["youtube.com", "youtu.be", "music.youtube.com"],
  instagram: ["instagram.com"],
  tiktok: ["tiktok.com"],
  facebook: ["facebook.com", "fb.watch"],
  x: ["x.com", "twitter.com"],
  reddit: ["reddit.com", "redd.it"],
  vimeo: ["vimeo.com"],
  dailymotion: ["dailymotion.com", "dai.ly"],
  soundcloud: ["soundcloud.com"],
};

const GUIDE_SLUG: Record<FetchPlatform, string> = {
  youtube: "save-public-youtube-video",
  instagram: "save-public-instagram-post",
  tiktok: "save-public-tiktok",
  facebook: "save-public-facebook-video",
  x: "save-public-x-reddit-vimeo",
  reddit: "save-public-x-reddit-vimeo",
  vimeo: "save-public-x-reddit-vimeo",
  dailymotion: "save-public-x-reddit-vimeo",
  soundcloud: "save-public-x-reddit-vimeo",
};

function hostMatches(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function isIpHost(hostname: string) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true;
  return hostname.includes(":");
}

export function classifyFetchUrl(raw: string): ClassifiedUrl {
  if (typeof raw !== "string" || raw.length > 2048) throw new InputError("invalid_url", "Paste a link shorter than 2,048 characters.");
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new InputError("invalid_url", "Paste a full https link.");
  }

  if (url.port && url.port !== "443") throw new InputError("invalid_url", "Custom ports are not supported.");
  if (url.protocol !== "https:") throw new InputError("invalid_url", "Only https links are accepted.");
  if (url.username || url.password) throw new InputError("invalid_url", "Links cannot contain a username or password.");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!hostname || isIpHost(hostname) || hostname === "localhost") {
    throw new InputError("invalid_url", "That host is not allowed.");
  }

  const platform = (Object.keys(HOSTS) as FetchPlatform[]).find((name) =>
    HOSTS[name].some((domain) => hostMatches(hostname, domain)),
  );
  if (!platform) throw new InputError("invalid_url", "That site is not available. Check the supported links below.");

  const path = url.pathname;
  if (platform === "instagram" && /\/(stories|story|highlights)\//i.test(path)) throw new InputError("public_only", "Only supported public links are available. Stories are not supported.");
  let single = false;
  switch (platform) {
    case "youtube": single = (hostname === "youtu.be" && /^\/[A-Za-z0-9_-]{1,100}\/?$/.test(path)) || (path === "/watch" && /^[A-Za-z0-9_-]{1,100}$/.test(url.searchParams.get("v") ?? "")) || /^\/(shorts|live|embed)\/[A-Za-z0-9_-]{1,100}\/?$/.test(path); break;
    case "instagram": single = /^\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?$/.test(path); break;
    case "tiktok": single = /^\/@[^/]+\/video\/\d+\/?$/.test(path) || (["vm.tiktok.com", "vt.tiktok.com"].includes(hostname) && /^\/[A-Za-z0-9]+\/?$/.test(path)) || /^\/t\/[A-Za-z0-9]+\/?$/.test(path); break;
    case "facebook": single = (hostname === "fb.watch" && /^\/[A-Za-z0-9_-]+\/?$/.test(path)) || (path === "/watch/" && /^\d+$/.test(url.searchParams.get("v") ?? "")) || /\/(videos|reel)\/\d+\/?$/.test(path) || /^\/share\/[vr]\/[A-Za-z0-9]+\/?$/.test(path); break;
    case "x": single = /^\/[^/]+\/status\/\d+\/?$/.test(path); break;
    case "reddit": single = hostname === "redd.it" ? /^\/[A-Za-z0-9]+\/?$/.test(path) : /^\/(?:r\/[^/]+\/)?comments\/[A-Za-z0-9]+(?:\/.*)?$/.test(path); break;
    case "vimeo": single = /^\/(?:video\/)?\d+(?:\/[a-f0-9]+)?\/?$/.test(path); break;
    case "dailymotion": single = hostname === "dai.ly" ? /^\/[A-Za-z0-9]+\/?$/.test(path) : /^\/video\/[A-Za-z0-9]+\/?$/.test(path); break;
    case "soundcloud": single = /^\/[A-Za-z0-9_-]+\/(?!sets(?:\/|$))[A-Za-z0-9_-]+\/?$/.test(path); break;
  }
  if (!single) throw new InputError("unsupported_link", "Paste one public video or audio link. Playlists, channels, profiles and collections are refused.");
  const privateOrStory = false;

  if (platform === "youtube") {
    const id = path === "/watch" ? url.searchParams.get("v")! : path.split("/").filter(Boolean).at(-1)!;
    url = new URL(`https://www.youtube.com/watch?v=${id}`);
  } else {
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || ["si", "feature", "fbclid", "igsh", "igshid"].includes(key)) url.searchParams.delete(key);
    }
  }
  url.hash = "";
  return { href: url.toString(), platform, privateOrStory, guideSlug: GUIDE_SLUG[platform] };
}
