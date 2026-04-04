import { getGitHubReleases, type GitHubRelease } from "@/lib/github";

export type ChangelogMedia =
  | {
      type: "image";
      lightSrc: string;
      darkSrc: string;
      alt: string;
    }
  | {
      type: "video";
      src: string;
      poster?: string;
      alt: string;
    };

export type ChangelogEntry = {
  version: string;
  date: string;
  headline: string;
  summary: string;
  releaseUrl: string;
  featured?: boolean;
  media?: ChangelogMedia;
  added?: string[];
  improved?: string[];
  fixed?: string[];
  notes?: string[];
};

export type ReleaseChecklistGroup = {
  title: string;
  items: string[];
};

const RELEASE_MEDIA_BY_VERSION: Record<string, ChangelogMedia> = {
  "v0.4.0": {
    type: "image",
    lightSrc: "/releases/0.4.0/promo/update-flow.png",
    darkSrc: "/releases/0.4.0/promo/update-flow-dark.png",
    alt: "HalalDL 0.4.0 update flow and verified app update experience",
  },
  "v0.3.9": {
    type: "image",
    lightSrc: "/screenshots/light/halaldl-downloads.png",
    darkSrc: "/screenshots/halaldl-downloads.png",
    alt: "HalalDL downloads screen",
  },
};

export const RELEASE_CHECKLIST: ReleaseChecklistGroup[] = [
  {
    title: "Write The Release",
    items: [
      "Draft a one-line release headline that explains what changed in plain language.",
      "Group release notes into Added, Improved, Fixed, and Known Issues if needed.",
      "Link the website entry back to the matching GitHub Release.",
    ],
  },
  {
    title: "Capture Proof",
    items: [
      "Patch release: text only unless the UI visibly changed.",
      "Minor release like 0.4.0: add one polished screenshot if the interface changed.",
      "Workflow-heavy release: add one screenshot and optionally one short WebM or MP4 clip.",
      "Avoid GIFs unless there is no better option; video is cleaner and lighter.",
    ],
  },
  {
    title: "Publish Cleanly",
    items: [
      "Use screenshots by default, not autoplay media.",
      "Keep changelog entries reverse-chronological and concise.",
      "Call out SmartScreen, checksums, or migration notes when they matter.",
      "Do not create bespoke heavy animations per release; keep site motion reusable.",
    ],
  },
];

type ParsedReleaseContent = {
  headline: string;
  summary: string;
  added: string[];
  improved: string[];
  fixed: string[];
  notes: string[];
};

function formatDate(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripInlineMarkdown(input: string) {
  return input
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_`~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHeading(input: string) {
  return stripInlineMarkdown(input).replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function stripVersionPrefix(input: string, version: string) {
  return input
    .replace(new RegExp(`^${escapeRegExp(version)}\\s*[-:–—]?\\s*`, "i"), "")
    .trim();
}

function collapseParagraphs(lines: string[]) {
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    if (!line) {
      if (buffer.length) {
        paragraphs.push(buffer.join(" ").trim());
        buffer = [];
      }
      continue;
    }

    buffer.push(line);
  }

  if (buffer.length) {
    paragraphs.push(buffer.join(" ").trim());
  }

  return paragraphs.filter(Boolean);
}

function formatBullet(line: string) {
  const bullet = line.replace(/^[-*]\s+/, "").trim();
  const namedMatch = bullet.match(/^\*\*(.+?)\*\*:\s*(.+)$/);

  if (namedMatch) {
    return `${stripInlineMarkdown(namedMatch[1])}: ${stripInlineMarkdown(namedMatch[2])}`;
  }

  return stripInlineMarkdown(bullet);
}

function looksLikeFix(item: string) {
  return /\b(fix|fixed|bug|issue|error|crash|broken|resolve|resolved|regression|warning)\b/i.test(
    item,
  );
}

function isMetaLine(line: string) {
  const normalized = line.replace(/^[-*]\s+/, "").trim();
  return normalized === "---" || /^Full Changelog:/i.test(normalized) || /^Built with/i.test(normalized);
}

function prefixCategory(item: string, category: string | null) {
  if (!category) {
    return item;
  }

  const normalizedCategory = cleanHeading(category);
  if (!normalizedCategory) {
    return item;
  }

  return `${normalizedCategory}: ${item}`;
}

function fallbackSummary(body: string, headline: string) {
  const lines = body
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith("#") &&
        !line.startsWith("* ") &&
        !line.startsWith("- ") &&
        line !== "---" &&
        !/^Full Changelog:/i.test(line) &&
        !/^Built with/i.test(line),
    )
    .map(stripInlineMarkdown);

  return lines[0] ?? headline;
}

function parseReleaseBody(release: GitHubRelease): ParsedReleaseContent {
  const lines = release.body.replace(/\r/g, "").split("\n");
  const parsedHeadlineFromName = stripVersionPrefix(
    stripInlineMarkdown(release.name || release.tagName),
    release.tagName,
  );
  let parsedHeadline = parsedHeadlineFromName || release.tagName;
  let currentSection: "summary" | "added" | "fixes" | "choice" | "note" | null = null;
  let currentSubsection: string | null = null;
  const summaryLines: string[] = [];
  const noteLines: string[] = [];
  const choiceLines: string[] = [];
  const added: string[] = [];
  const improved: string[] = [];
  const fixed: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (currentSection === "summary") {
        summaryLines.push("");
      } else if (currentSection === "note") {
        noteLines.push("");
      }
      continue;
    }

    if (/^#\s+/.test(line)) {
      const title = cleanHeading(line.replace(/^#\s+/, ""));
      parsedHeadline = stripVersionPrefix(title, release.tagName) || parsedHeadline;
      continue;
    }

    if (/^##\s+/.test(line)) {
      const heading = cleanHeading(line.replace(/^##\s+/, ""));
      const normalizedHeading = heading.toLowerCase();

      currentSubsection = null;

      if (normalizedHeading.includes("what") && normalizedHeading.includes("new")) {
        currentSection = "added";
      } else if (normalizedHeading.includes("fix")) {
        currentSection = "fixes";
      } else if (normalizedHeading.includes("choosing your version")) {
        currentSection = "choice";
      } else if (normalizedHeading.includes("note from the developer")) {
        currentSection = "note";
      } else if (normalizedHeading.includes("update")) {
        currentSection = "summary";
      } else {
        currentSection = null;
      }

      continue;
    }

    if (/^###\s+/.test(line)) {
      currentSubsection = cleanHeading(line.replace(/^###\s+/, ""));
      continue;
    }

    if (isMetaLine(line)) {
      continue;
    }

    if (currentSection === "summary") {
      summaryLines.push(stripInlineMarkdown(line));
      continue;
    }

    if (currentSection === "note") {
      noteLines.push(stripInlineMarkdown(line));
      continue;
    }

    if ((currentSection === "added" || currentSection === "fixes" || currentSection === "choice") && /^[-*]\s+/.test(line)) {
      const item = formatBullet(line);
      if (!item || isMetaLine(item)) {
        continue;
      }

      if (currentSection === "added") {
        added.push(prefixCategory(item, currentSubsection));
      } else if (currentSection === "choice") {
        choiceLines.push(item);
      } else if (looksLikeFix(item)) {
        fixed.push(item);
      } else {
        improved.push(item);
      }
    }
  }

  const summary = collapseParagraphs(summaryLines)[0] ?? fallbackSummary(release.body, parsedHeadline);
  const notes = [...choiceLines, ...collapseParagraphs(noteLines)].filter((item) => !isMetaLine(item));

  return {
    headline: parsedHeadline,
    summary,
    added,
    improved,
    fixed,
    notes,
  };
}

function toChangelogEntry(release: GitHubRelease, index: number): ChangelogEntry {
  const parsed = parseReleaseBody(release);

  return {
    version: release.tagName,
    date: formatDate(release.publishedAt),
    headline: parsed.headline,
    summary: parsed.summary,
    releaseUrl: release.htmlUrl,
    featured: index === 0,
    media: RELEASE_MEDIA_BY_VERSION[release.tagName],
    added: parsed.added.length ? parsed.added : undefined,
    improved: parsed.improved.length ? parsed.improved : undefined,
    fixed: parsed.fixed.length ? parsed.fixed : undefined,
    notes: parsed.notes.length ? parsed.notes : undefined,
  };
}

export async function getChangelogEntries() {
  const releases = await getGitHubReleases();
  return releases.map((release, index) => toChangelogEntry(release, index));
}
