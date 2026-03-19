import { SITE_LINKS } from "@/lib/site";

type GitHubRepoResponse = {
  description: string | null;
  stargazers_count: number;
  open_issues_count: number;
  pushed_at: string;
  html_url: string;
  license: {
    name: string;
  } | null;
};

type GitHubReleaseAssetResponse = {
  name: string;
  browser_download_url: string;
  size: number;
  digest?: string | null;
};

type GitHubReleaseResponse = {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
  assets: GitHubReleaseAssetResponse[];
};

export type GitHubSnapshot = {
  source: "live" | "fallback";
  repoUrl: string;
  repoDescription: string;
  stars: number;
  openIssues: number;
  licenseName: string;
  lastPushedAt: string;
  lastPushedLabel: string;
  latestVersion: string;
  latestReleaseName: string;
  latestReleaseUrl: string;
  latestReleaseDate: string;
  latestReleaseLabel: string;
  firstPublicVersion: string;
  firstPublicReleaseDate: string;
  firstPublicReleaseLabel: string;
  releaseNotes: string;
  fullSetupUrl: string;
  fullSetupSize: number | null;
  liteSetupUrl: string;
  liteSetupSize: number | null;
  checksumsUrl: string;
  checksumDigest: string | null;
};

const FALLBACK_SNAPSHOT: GitHubSnapshot = {
  source: "fallback",
  repoUrl: SITE_LINKS.repoUrl,
  repoDescription:
    "A lightweight, modern Windows desktop GUI for yt-dlp with presets, raw logs, and optional tool bundling.",
  stars: 3,
  openIssues: 0,
  licenseName: "MIT License",
  lastPushedAt: "2026-03-17T18:48:16Z",
  lastPushedLabel: formatDate("2026-03-17T18:48:16Z"),
  latestVersion: "v0.3.9",
  latestReleaseName: "v0.3.9 - The Faster Flow Update",
  latestReleaseUrl: "https://github.com/Asdmir786/HalalDL/releases/tag/v0.3.9",
  latestReleaseDate: "2026-03-12T14:16:26Z",
  latestReleaseLabel: formatDate("2026-03-12T14:16:26Z"),
  firstPublicVersion: "v0.1.0",
  firstPublicReleaseDate: "2026-01-10T18:09:25Z",
  firstPublicReleaseLabel: formatDate("2026-01-10T18:09:25Z"),
  releaseNotes:
    "Latest checked release snapshot from March 18, 2026. Faster Full setup flow, better link feedback, and cleaner install/update UX.",
  fullSetupUrl:
    "https://github.com/Asdmir786/HalalDL/releases/download/v0.3.9/HalalDL-Full-v0.3.9-win10%2B11-x64-setup.exe",
  fullSetupSize: 4188336,
  liteSetupUrl:
    "https://github.com/Asdmir786/HalalDL/releases/download/v0.3.9/HalalDL-Lite-v0.3.9-win10%2B11-x64-setup.exe",
  liteSetupSize: 4189308,
  checksumsUrl:
    "https://github.com/Asdmir786/HalalDL/releases/download/v0.3.9/SHA256SUMS.txt",
  checksumDigest: "sha256:b9cfcda9b5c38d9ead6c3b5829aa782265da2b9a85109e2dbb05fd6aff72246a",
};

function formatDate(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

function extractDigest(asset: GitHubReleaseAssetResponse | undefined) {
  if (!asset?.digest) {
    return null;
  }

  return asset.digest.startsWith("sha256:") ? asset.digest : `sha256:${asset.digest}`;
}

function trimReleaseNotes(input: string) {
  const collapsed = input
    .replace(/\r/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[*_`~]+/g, "")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^\s*[-+]\s+/gm, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
  return collapsed.length > 220 ? `${collapsed.slice(0, 217).trimEnd()}...` : collapsed;
}

async function fetchJson<T>(url: string) {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, {
    headers,
    next: {
      revalidate: 1800,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getGitHubSnapshot(): Promise<GitHubSnapshot> {
  try {
    const [repo, release, releases] = await Promise.all([
      fetchJson<GitHubRepoResponse>("https://api.github.com/repos/Asdmir786/HalalDL"),
      fetchJson<GitHubReleaseResponse>(
        "https://api.github.com/repos/Asdmir786/HalalDL/releases/latest",
      ),
      fetchJson<GitHubReleaseResponse[]>(
        "https://api.github.com/repos/Asdmir786/HalalDL/releases?per_page=100",
      ),
    ]);
    const firstPublicRelease = releases.filter((entry) => !entry.draft && !entry.prerelease).at(-1);

    const fullSetup = release.assets.find(
      (asset) => asset.name.includes("Full") && asset.name.endsWith("-setup.exe"),
    );
    const liteSetup = release.assets.find(
      (asset) => asset.name.includes("Lite") && asset.name.endsWith("-setup.exe"),
    );
    const checksums = release.assets.find((asset) => asset.name === "SHA256SUMS.txt");

    return {
      source: "live",
      repoUrl: repo.html_url,
      repoDescription: repo.description ?? FALLBACK_SNAPSHOT.repoDescription,
      stars: repo.stargazers_count,
      openIssues: repo.open_issues_count,
      licenseName: repo.license?.name ?? FALLBACK_SNAPSHOT.licenseName,
      lastPushedAt: repo.pushed_at,
      lastPushedLabel: formatDate(repo.pushed_at),
      latestVersion: release.tag_name,
      latestReleaseName: release.name,
      latestReleaseUrl: release.html_url,
      latestReleaseDate: release.published_at,
      latestReleaseLabel: formatDate(release.published_at),
      firstPublicVersion: firstPublicRelease?.tag_name ?? FALLBACK_SNAPSHOT.firstPublicVersion,
      firstPublicReleaseDate:
        firstPublicRelease?.published_at ?? FALLBACK_SNAPSHOT.firstPublicReleaseDate,
      firstPublicReleaseLabel: firstPublicRelease?.published_at
        ? formatDate(firstPublicRelease.published_at)
        : FALLBACK_SNAPSHOT.firstPublicReleaseLabel,
      releaseNotes: trimReleaseNotes(release.body),
      fullSetupUrl: fullSetup?.browser_download_url ?? FALLBACK_SNAPSHOT.fullSetupUrl,
      fullSetupSize: fullSetup?.size ?? null,
      liteSetupUrl: liteSetup?.browser_download_url ?? FALLBACK_SNAPSHOT.liteSetupUrl,
      liteSetupSize: liteSetup?.size ?? null,
      checksumsUrl: checksums?.browser_download_url ?? FALLBACK_SNAPSHOT.checksumsUrl,
      checksumDigest: extractDigest(checksums),
    };
  } catch {
    return FALLBACK_SNAPSHOT;
  }
}
