export type GuideTier = 1 | 2 | 3;

export type GuideCta = {
  label: string;
  href: string;
  eventCta: string;
};

export type GuideFaqItem = {
  question: string;
  answer: string;
};

export type GuideTable = {
  headers: string[];
  rows: string[][];
};

export type GuideBlock =
  | { type: "heading"; level: 2 | 3; id: string; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; tone: "mint" | "sky" | "amber" | "coral"; title: string; body: string }
  | { type: "table"; caption?: string; table: GuideTable }
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
