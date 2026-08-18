# HalalDL Content and SEO Guide

> **Purpose:** Help future updates explain real product value in a clear, local-first voice while keeping search visibility grounded in useful content rather than SEO theatre.

## 1. The content model

Every page should begin with an honest user need, then use the product evidence that solves it. HalalDL’s current release narrative is **Preview, Select, Download, Recover, Organize, and Create locally**.

| Content pillar | User need | Product evidence |
|---|---|---|
| **Control** | “I only want some items from this source.” | Link preview, playlist-entry selection, explicit queue selection, output choices |
| **Output** | “I need the right video, audio, subtitle, or preset result.” | Quality choices, audio choices, subtitles, reusable presets |
| **Recovery** | “The job failed; what should I do next?” | Download Doctor, visible logs, tool detection, aria2 fallback where applicable |
| **Local organization** | “Where did my finished media go?” | History, Library folders, Follows, local storage language |
| **Creation** | “I need an excerpt, not the whole file.” | Local Clip Maker, chapter-informed ranges, original file unchanged |
| **Trust** | “Is the installer real and what should I verify?” | GitHub Releases, SHA256SUMS, public issues, transparent signing context |

## 2. Voice and copy rules

HalalDL copy is direct, helpful, and specific. It should describe what a person can do in the app—not what a marketer hopes the person assumes.

| Prefer | Avoid |
|---|---|
| “Preview the link. Pick the entries you want.” | “The ultimate downloader experience.” |
| “Up to 4K where the source provides it.” | “Guaranteed 4K downloads.” |
| “Download Doctor offers safe next steps.” | “Fixes every error automatically.” |
| “Files stay on your machine.” | “Military-grade private cloud.” |
| “Download from GitHub Releases and verify SHA256.” | “100% safe download.” |
| “Supported links and formats vary by source.” | “Download anything from anywhere.” |

Use short active sentences in headings. Follow a claim with an explanation or screenshot. Keep a limitation near the claim it qualifies instead of hiding it in the FAQ.

## 3. Page-writing pattern

A feature section should use this order:

1. **Outcome:** What the person can accomplish.
2. **Mechanism:** How HalalDL helps them accomplish it.
3. **Evidence:** Official screenshot, live state, or a short list of visible controls.
4. **Boundary:** The source, tool, or platform limitation that applies.
5. **Next action:** A relevant internal link or download CTA.

Example:

> **Preview the link. Keep the entries you actually want.**  
> Supported links can be previewed before the queue begins, so a playlist can be narrowed to individual entries. Availability still depends on the source and formats it exposes.

For secondary pages, use the same sequence at page scale: a clear user question in the hero, a short explanation, a structured decision or workflow surface, evidence or commands, then a related next action. Do not make every route an animation showcase; page purpose comes first.

## 4. Search visibility rules

Google’s current guidance prioritizes helpful, reliable people-first content; terminology a user would search for in prominent page locations; crawlable links; and appropriate handling of image, video, and structured data. It does not promise indexing or rankings because a page has metadata or markup. [1]

The practical SEO work for this project is therefore:

| Do | Do not |
|---|---|
| Write pages that answer a real Windows, yt-dlp, playlist, verification, or recovery question | Create thin pages that repeat the same “free downloader” phrase |
| Use descriptive page titles, headings, image alt text, and internal link text | Add a `keywords` tag, repetitive keyword blocks, or vague “click here” links |
| Link related guides, release notes, download paths, and verification pages with real anchor text | Hide links in click handlers, empty icon controls, or unrelated footer clusters |
| Keep schema aligned with text a visitor can see | Add ratings, reviews, prices, or rich-result types the site cannot substantiate |
| Update page content and sitemap `lastModified` for meaningful releases | Change dates for cosmetic edits only |

The `SoftwareApplication`, `Organization`, `WebSite`, `Article`, Breadcrumb, and FAQ data already have implementation paths in the project. Use only the types that describe the rendered page. Google’s supported gallery lists software-app and organization markup, while actual search appearance can differ from the markup provided. [2]

## 5. Release-led content update

When a release contains a meaningful user-facing capability, update the following in this order:

1. **Central release registry:** add the release facts, complete editorial Changelog sections, screenshots, homepage support copy, fallback release data, and schema feature list in `src/content/releases/registry.ts`.
2. **Homepage Product Proof:** keep five or fewer distinct product stories.
3. **Hero and live demo:** show only the most legible release sequence.
4. **Changelog:** show the official release hero, a clear intro, the complete grouped change set, install boundaries, developer/context notes when useful, and a concise historical archive linked to canonical GitHub Releases.
5. **Guide:** publish one substantive release guide when the update changes the workflow enough to merit a durable explanation.
6. **Download/Install/Compare/Trust:** update decision boundaries, asset links, verification language, and release-aware calls to action when the release changes them.
7. **FAQ:** add a question only when it prevents genuine install, capability, or trust confusion.

The Changelog should be **release-driven but not raw-Markdown-driven**. GitHub remains the source for canonical facts and release links; the registry controls the website’s readable grouping and durable page structure. The release archive can be fetched live, but the current release’s editorial story must remain available when the GitHub API is unavailable.

## 6. Motion and content visibility

Motion is not content. A headline, release detail, CTA, screenshot, FAQ answer, or verification command must render meaningfully before optional intersection choreography activates.

- Use `ScrollReveal` for content-safe section entrances.
- Use `MotionField` for a whole section’s staged choreography.
- Do not add `opacity: 0`, `visibility: hidden`, or a blank initial screenshot state to required content.
- Keep motion short and subordinate to reading hierarchy.
- Respect `prefers-reduced-motion` without removing content or controls.

## 7. Content review checklist

- Every product claim has a source in the release notes, a real screenshot, or both.
- Quality, platform, and source-dependent limits are stated in the relevant section.
- Links use actual `<a href>` navigation and descriptive text. [3]
- New images have accurate alt text and theme variants where the app UI differs.
- The guide’s title and description describe the page itself, not a large set of unrelated searches.
- The feature story does not duplicate an older section unless it adds a new user outcome.
- Changelog groups preserve the complete current-release story rather than showing only the first parsed paragraph.
- Release-specific claims are consistent across the registry, homepage, Changelog, guides, downloads, and verification pages.
- Tables are used when they improve scanning; they must remain readable on narrow screens.

## References

[1]: https://developers.google.com/search/docs/essentials "Google Search Essentials"
[2]: https://developers.google.com/search/docs/appearance/structured-data/search-gallery "Structured data markup that Google Search supports"
[3]: https://developers.google.com/search/docs/crawling-indexing/links-crawlable "Google Link Best Practices"
