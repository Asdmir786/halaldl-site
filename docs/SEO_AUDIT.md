# HalalDL SEO Audit and Execution Notes

> **Scope:** Route intent, technical SEO, guide discoverability, structured data, performance, and repository-facing authority work for the current site.

## 1. Route intent map

| Route | Primary search intent | Supporting intent | Main conversion |
|---|---|---|---|
| `/` | Free local yt-dlp GUI for Windows | Download, organize, recover, and create locally | Download latest |
| `/download` | Download HalalDL for Windows | Choose Full, Lite, or Portable; verify the source | Official release |
| `/compare/full-vs-lite` | Compare Full, Lite, and Portable builds | Toolchain responsibility and update paths | Choose a build |
| `/install/windows` | Install and verify HalalDL on Windows | Full recommendation, SmartScreen, WinGet | Download Full / verify |
| `/trust/verify-checksum` | Verify SHA256 and handle SmartScreen safely | PowerShell hash workflow and source provenance | Download after match |
| `/guides` | Find a useful Windows yt-dlp or HalalDL guide | Browse by choosing, installing, verifying, and workflows | Open a guide |
| `/guides/[slug]` | Answer one specific Windows workflow question | Link to product, download, compare, and trust paths | Next relevant guide/action |
| `/changelog` | Read HalalDL release history and v0.6.0 changes | Canonical GitHub release notes and limitations | Open release/download |

## 2. Current strengths

The site already has route-level titles and descriptions, canonical paths, Open Graph/Twitter metadata, a sitemap, robots output, breadcrumbs, `SoftwareApplication`, `Organization`, `WebSite`, `Article`, `HowTo`, and FAQ structured-data paths. The content is also unusually specific about Windows, GitHub Releases, SHA256, local workflows, source limitations, and the Full/Lite/Portable boundary.

## 3. Highest-impact gaps

The main opportunity is not adding more keywords. It is making every route’s search promise and internal-link role unmistakable, expanding the guide cluster around real user questions, ensuring structured data stays aligned with visible content, improving the repository-to-site discovery loop, and measuring the production site after the canonical domain is selected.

The current preview exposes canonical output for `https://halaldl.vercel.app`. The temporary Manus preview host is not used as the canonical URL, sitemap host, or robots host. When a custom domain is chosen, replace the production URL once and redirect the Vercel hostname to it.

## 4. Planned execution

1. Refine metadata, H1 copy, social descriptions, and structured-data alignment.
2. Strengthen internal links across homepage, Download, Compare, Install, Trust, Guides, and Changelog.
3. Organize the guide cluster around choosing, installing, trust, workflow, troubleshooting, and release knowledge.
4. Run Lighthouse-style checks and optimize the highest-impact media, client-motion, mobile-layout, and layout-shift issues.
5. Validate canonical URLs, sitemap, robots, schema, links, images, builds, and route responses.

## 5. Domain note

A `.com` domain has no automatic ranking bonus. A memorable domain you can own long-term is more important than the extension. For future web/mobile payments, prefer a name that is short, brandable, easy to spell, and broad enough for desktop, web, and mobile products. Avoid changing domains after launch unless necessary; stable canonical history is valuable.
