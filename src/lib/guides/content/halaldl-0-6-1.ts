import type { GuideArticle } from "@/lib/guides/types";

export const halaldl061Article: GuideArticle = {
  slug: "halaldl-0-6-1",
  blocks: [
    {
      type: "callout",
      tone: "mint",
      title: "Maintenance release, no workflow removal",
      body: "v0.6.1 removes the legacy desktop telemetry path, hardens app boundaries, and makes website handoffs queue-only by default. Downloads, history, presets, settings, cookies, and local media stay intact.",
    },
    {
      type: "heading",
      level: 2,
      id: "privacy",
      text: "Desktop telemetry removed",
    },
    {
      type: "paragraph",
      text: "The desktop app no longer collects or transmits telemetry. Startup cleanup removes only the obsolete telemetry.json identifier file; it does not remove your working data or downloaded media.",
    },
    {
      type: "heading",
      level: 2,
      id: "deep-links",
      text: "Safer website-to-app handoffs",
    },
    {
      type: "paragraph",
      text: "A valid halaldl://download?url=... link now queues the media URL and waits for you. Starting automatically requires an explicit start=1 flag, and malformed, credentialed, unsupported, or oversized input is rejected.",
    },
    {
      type: "handoff",
      surface: "flagship_comparison",
    },
    {
      type: "heading",
      level: 2,
      id: "hardening",
      text: "Tighter desktop boundaries",
    },
    {
      type: "list",
      items: [
        "Tighter Tauri content security policy and window capabilities",
        "Restricted local file opening to approved paths and supported targets",
        "Full, Lite, and Portable artifacts produced together with SHA256 checksums",
        "The existing local queue, history, presets, Library, and media files remain available",
      ],
    },
    {
      type: "cta",
      cta: { label: "Download HalalDL v0.6.1", href: "/download", eventCta: "go_to_download" },
    },
  ],
};
