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
- `DATABASE_URL`
  - required for the private in-site analytics dashboard
  - use a small Postgres database connected through Vercel Marketplace
- `AUTH_SECRET`
  - required by Auth.js for encrypted session handling
- `AUTH_GOOGLE_ID`
  - Google OAuth client ID for the private dashboard sign-in
- `AUTH_GOOGLE_SECRET`
  - Google OAuth client secret for the private dashboard sign-in

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
4. Connect a small Postgres database and add `DATABASE_URL`.
5. Set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET`.
6. In Google Cloud Console, add the authorized redirect URI:
   `https://YOUR_DOMAIN/api/auth/callback/google`
7. For local testing, also add:
   `http://localhost:3000/api/auth/callback/google`
8. Optionally set `GITHUB_TOKEN` if you want more GitHub API headroom.

## Analytics

The site now includes a private in-site analytics dashboard at `/dashboard`.

### What is tracked

- Page views
- Anonymous visitor IDs and rolling visit/session IDs
- CTA click events under `cta_click`
- WinGet copy actions under `command_copy`
- Download/install section visibility under `section_view`
- Referrer host, country, device type, browser, and OS summaries

Current tracked CTA values include:

- `download_full`
- `download_lite`
- `open_github_release`
- `open_changelog`
- `open_install_guide`
- `open_verify_guide`
- `open_support_docs`
- `open_support_issues`
- `open_checksums`
- `view_github_repo`
- `compare_full_vs_lite`
- `go_to_download`

Current tracked section values include:

- `install_options` on the home page
- `download_options` on the download page

Current tracked command values include:

- `winget_install`

### Where to view it

- Open `/dashboard` in the deployed site
- Sign in with `asmir.alams.com@gmail.com`
- The dashboard shows last-30-day summaries plus week-over-week change cards

### Limits and setup notes

- This setup does not require a Vercel Analytics paid plan because tracking is stored in your own database
- It does require a persistent database such as Postgres
- The dashboard login is intentionally minimal: Google OAuth plus a hardcoded one-email allowlist
- Country data depends on the deployment platform forwarding geolocation headers in production

### What this setup will not tell you

- It does not identify individual users
- It does not tell you whether a GitHub download completed after the click
- It does not provide multi-step user funnels across external systems
- It does not track behavior inside the desktop app itself
- It does not reconstruct perfect people-based journeys across devices or browsers

### How to extend later

- Add more `cta_click` values for new important buttons
- Add more `section_view` values for major content blocks
- Add extra dashboard panels by querying the `analytics_events` table
- Keep event payloads small so the setup stays easy to maintain

## Content Notes

The site copy is intentionally practical. It should stay aligned with the upstream product repo and release flow:

- Windows-first, not fake cross-platform
- local-first, not SaaS-framed
- GitHub Releases as canonical source
- Full vs Lite as explicit install choices
- checksums and SmartScreen explained plainly

If the product repo changes its positioning, install story, or release structure, update this site accordingly.
