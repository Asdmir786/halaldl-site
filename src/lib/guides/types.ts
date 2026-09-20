export type GuideTier = 1 | 2 | 3;

export type GuideCta = {
  label: string;
  href: string;
  eventCta: "go_to_download" | "compare_full_vs_lite";
};

export type GuideFaqItem = {
  question: string;
  answer: string;
};

export type GuideTable = {
  headers: string[];
  rows: string[][];
};

export type GuideComparisonSource = {
  label: string;
  url: string;
};

export type GuideComparisonTool = {
  id: "halaldl" | "parabolic" | "open-video-downloader" | "tartube" | "stacher" | "yt-dlp";
  name: string;
  shortName: string;
  summary: string;
  officialUrl: string;
  verifiedAt: string;
  filters: Array<"windows" | "cross-platform" | "simple" | "power" | "archive" | "open-source">;
  platforms: string;
  installation: string;
  toolManagement: string;
  playlists: string;
  subtitles: string;
  cookies: string;
  presets: string;
  queues: string;
  rawLogs: string;
  archiveWorkflows: string;
  license: string;
  telemetryAndAccount: string;
  releaseActivity: string;
  bestFor: string;
  limitations: string;
  sources: GuideComparisonSource[];
};

export type GuideComparisonUseCase = {
  label: string;
  toolId: GuideComparisonTool["id"];
  reason: string;
};

export type GuideComparisonBlock = {
  type: "comparison";
  title: string;
  description: string;
  verifiedAt: string;
  useCases: GuideComparisonUseCase[];
  tools: GuideComparisonTool[];
};

export type GuideBlock =
  | { type: "heading"; level: 2 | 3; id: string; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; tone: "mint" | "sky" | "amber" | "coral"; title: string; body: string }
  | { type: "table"; caption?: string; table: GuideTable }
  | GuideComparisonBlock
  | { type: "handoff"; surface: "flagship_comparison" }
  | { type: "faq"; items: GuideFaqItem[] }
  | { type: "cta"; cta: GuideCta };

export type GuideArticle = {
  slug: string;
  blocks: GuideBlock[];
  faqs?: GuideFaqItem[];
};

export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string;
  tier: GuideTier;
  publishedAt: string;
  updatedAt: string;
  /** Public URL path — may point outside /guides for product canonicals. */
  canonicalPath: string;
  /** True when the long-form article is rendered under /guides/[slug]. */
  hostedInGuides: boolean;
  relatedSlugs: string[];
  cta: GuideCta;
  eyebrow?: string;
};
