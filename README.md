# HalalDL Site

Marketing site for [HalalDL](https://github.com/Asdmir786/HalalDL), built with Next.js App Router and tuned for Vercel.

This repo is the public-facing site layer for the product, not the desktop app itself. It exists to explain what HalalDL is, establish trust, route people to the right install path, and keep the download flow anchored to GitHub Releases.

## What This Repo Ships

- A deep single-page landing site at `/`
- A stable `/download` route that redirects to the latest GitHub release
- Live GitHub-backed product metadata with a checked fallback snapshot
- Light and dark site themes with matching product screenshots
- Metadata, Open Graph, `robots.txt`, `sitemap.xml`, and structured data for SEO

## Product Context

The site is built around the current public HalalDL product story:

- Product repo: [Asdmir786/HalalDL](https://github.com/Asdmir786/HalalDL)
- Canonical downloads: [GitHub Releases](https://github.com/Asdmir786/HalalDL/releases/latest)
- Upstream README: [HalalDL README](https://github.com/Asdmir786/HalalDL#readme)
- Support: [SUPPORT.md](https://github.com/Asdmir786/HalalDL/blob/main/SUPPORT.md)

Live product details were checked against GitHub on April 12, 2026. At that point, the latest public release was `v0.4.1`, published on April 12, 2026, and the repo described HalalDL as a Windows-first, local-first desktop GUI for `yt-dlp` with presets, raw logs, optional tool bundling, compact quick downloads, preset filename templates, settings persistence fixes, and clearer finished-result cards.

## Site Goals

- Explain HalalDL clearly in one screen
- Show the actual product UI instead of vague marketing abstractions
- Keep the trust posture direct: GitHub Releases, checksums, SmartScreen note, Full vs Lite
- Feel premium and modern without compromising load speed
- Stay deployable on Vercel with minimal moving parts

## Experience Overview

The landing page is intentionally product-led:

- Hero with immediate product framing and primary download CTA
- Trust rail with version, license, Windows scope, checksum, and repo signals
- Feature scrollytelling built around real screenshots
- Install section covering Full, Lite, and WinGet
- Trust and safety section explaining canonical source and verification flow
- FAQ and final CTA

The visual system uses layered glass surfaces, restrained CSS motion, theme-aware screenshots, and a light/dark switch that matches the product screenshots already added to the site.

## Technical Stack

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Motion](https://motion.dev/) for scroll reveals and feature showcase transitions
- `lucide-react`, `clsx`, and `tailwind-merge` for UI composition

## Runtime Behavior

### GitHub Data

The site reads live product data from the GitHub API:

- repo metadata
- latest release metadata
- latest release assets
- checksum file links

If GitHub is unavailable or rate-limited, the site falls back to a checked static snapshot so the page still renders correctly and `/download` still resolves.

### Download Routing

`/download` does not try to be smart. It is a simple redirect to the latest GitHub release so the canonical source stays explicit.

### Theming

The site supports both light and dark mode:

- theme preference is stored locally
- the root document theme is applied before hydration
- screenshots swap to the matching light or dark product image set

## Project Structure

```text
src/
  app/
    page.tsx            # landing page
    layout.tsx          # metadata, fonts, root shell
    download/route.ts   # /download redirect
    robots.ts           # robots.txt
    sitemap.ts          # sitemap.xml
  components/
    feature-showcase.tsx
    theme-toggle.tsx
    themed-screenshot.tsx
  lib/
    github.ts           # live GitHub fetch + fallback snapshot
    site.ts             # page content, links, feature story data

public/
  brand/
  screenshots/
  social/
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Environment

### Required

No environment variables are strictly required for local development.

### Optional

- `NEXT_PUBLIC_SITE_URL`
  - absolute public site URL used for canonical metadata and social URLs
  - example: `https://halaldl.app`
- `SITE_URL`
  - server-side fallback if `NEXT_PUBLIC_SITE_URL` is not set
- `GITHUB_TOKEN`
  - optional GitHub token for higher API rate limits when fetching live repo and release data

If no explicit site URL is set, the app falls back to `VERCEL_URL`, then `https://halaldl.vercel.app`.

## Deployment

This repo is designed for Vercel:

- App Router pages are static-first where possible
- live GitHub data uses revalidation
- `/download` remains a simple runtime redirect
- metadata, sitemap, and robots are generated in-app

Recommended deployment flow:

1. Push the repo.
2. Import it into Vercel.
3. Set `NEXT_PUBLIC_SITE_URL` to the final production domain.
4. Optionally set `GITHUB_TOKEN` if you want more GitHub API headroom.

## Content Notes

The site copy is intentionally practical. It should stay aligned with the upstream product repo and release flow:

- Windows-first, not fake cross-platform
- local-first, not SaaS-framed
- GitHub Releases as canonical source
- Full vs Lite as explicit install choices
- checksums and SmartScreen explained plainly

If the product repo changes its positioning, install story, or release structure, update this site accordingly.
