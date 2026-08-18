# Maintaining the HalalDL Site

> **Purpose:** Provide a practical map for making changes without turning the site into a collection of oversized files, fragile motion, stale release references, or inconsistent secondary pages.

## 1. Project map

| Area | Location | Responsibility |
|---|---|---|
| Routes and metadata | `src/app/` | Next.js pages, layout metadata, robots, sitemap, route-level metadata |
| Core site data | `src/lib/` | Links, GitHub data, SEO helpers, Changelog parser, guides index |
| Release registry | `src/content/releases/registry.ts` | Current release story, complete Changelog groups, release assets, fallback values, Product Proof content |
| Homepage composition | `src/components/home/landing-page.tsx` | Section order only; keep it thin |
| Homepage shell | `src/components/experience/home-experience.tsx` | Contained header plus full-width body/story canvas with readable inner gutters |
| Homepage scroll substrate | `src/components/experience/home-scroll-director.tsx` | Gentle hero-stage parallax and scene state; no heavy full-page camera cinema |
| Hero | `src/components/home/hero-section.tsx` | Hero copy, CTA, Local Control Room visual stage, and release-aware presentation |
| Local Control Room | `src/components/home/local-control-room.tsx` | Real app-state cards, 2.5D depth, pointer energy, and scroll-linked transforms |
| Live hero demo | `hero-live-app*.tsx` and `use-hero-live-app-demo.ts` | Data, timeline, UI primitives, and app views are intentionally separated |
| Product Proof | `src/components/home/proof-section.tsx` plus `FEATURE_STORIES` | Official screenshots and feature narratives from the current release registry |
| Install | `src/components/home/install-section.tsx` and `src/components/install/windows-install-content.tsx` | Homepage build choreography and secondary first-run guide |
| Changelog | `src/lib/changelog.ts`, `src/content/releases/registry.ts`, and `src/components/changelog/` | Live archive metadata plus registry-backed current-release story and media |
| Guides | `src/lib/guides.ts`, `src/lib/guides/content/`, and `src/components/guides/` | Searchable, substantial help content, article schema, and shared related guides |
| Download/Compare/Trust | `src/components/download/`, `src/components/compare/`, `src/components/trust/` | Release-aware decisions, build boundaries, and verification workflows |
| Shared motion | `src/components/ui/scroll-reveal.tsx`, `motion-field.tsx`, and `src/components/experience/` | Reusable reveal, section choreography, scroll, and reduced-motion conventions |
| Global style system | `src/app/globals.css` | Theme tokens, shared surfaces, section-specific styling, motion rules, reduced-motion rules |

## 2. File-size and boundary rules

A component should compose a clear UI responsibility, not contain all data, state, animation, and markup for an entire experience.

| If a file starts doing this | Move it here |
|---|---|
| Holds static feature or release copy | `src/content/` or a focused `*-data.ts` module |
| Holds complete current-release Changelog groups | `src/content/releases/registry.ts` under `changelog` |
| Controls a multi-stage demo timeline | `use-<feature>-demo.ts` hook |
| Reuses a visual atom in multiple places | `*-ui.tsx` primitive module |
| Renders distinct application views | `*-views.tsx` module |
| Defines release facts, image paths, or fallback assets | `src/content/releases/registry.ts` |
| Explains an enduring user workflow | `src/lib/guides/content/` article |
| Adds a new visual token or shared motion selector | `src/app/globals.css`, using semantic naming |

Prefer a small number of coherent modules over abstracting every wrapper. A good boundary exists when a file can be read as one responsibility.

## 3. Daily development loop

```bash
cd /home/ubuntu/halaldl-site
pnpm dev
```

For a normal visual change, edit the relevant component or token, let the development server rebuild, then check the live preview in both themes. Do not restart the server unless configuration changes or the development process is actually unhealthy.

Before any handoff, run:

```bash
pnpm typecheck
pnpm build
```

For meaningful content, release, route, or SEO changes, also verify:

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/robots.txt
curl -I http://localhost:3000/sitemap.xml
curl -I http://localhost:3000/changelog
curl -I http://localhost:3000/download
curl -I http://localhost:3000/compare/full-vs-lite
curl -I http://localhost:3000/install/windows
curl -I http://localhost:3000/trust/verify-checksum
```

## 4. Safe visual-change workflow

1. Read `docs/DESIGN.md` and identify the section’s existing role.
2. Read `docs/CONTENT.md` for claims and `docs/RELEASES.md` for release-led work.
3. Check the section in both light and dark themes before editing.
4. Change the smallest coherent unit: data, component, shared primitive, or CSS token.
5. Preserve static first paint; an animation must enhance—not reveal—required content.
6. Check desktop hierarchy and a narrow viewport before considering the change complete.
7. Verify `prefers-reduced-motion` still leaves the content available.
8. If a release claim changed, trace it to the canonical GitHub release and update the registry before editing page copy.

## 5. Content, SEO, release, and route workflow

Use these documents together:

| Situation | Read first | Main edit location |
|---|---|---|
| New release | `docs/RELEASES.md` | `src/content/releases/registry.ts` |
| New product story | `docs/DESIGN.md` and `docs/CONTENT.md` | Release registry plus the relevant section |
| Complete Changelog story | `docs/RELEASES.md` | Registry `changelog` object plus `src/components/changelog/` only for presentation |
| New guide | `docs/CONTENT.md` | `src/lib/guides/content/` and `src/lib/guides.ts` |
| SEO change | `docs/CONTENT.md` | `src/lib/seo.ts`, page metadata, and visible content |
| Footer or navigation update | `docs/DESIGN.md` | `src/components/home/home-cta-footer.tsx`, `home-header.tsx`, and route-strip data |
| Shared animation update | `docs/DESIGN.md` | `src/components/ui/`, `src/components/experience/`, and `globals.css` |
| Install or build-boundary update | `docs/RELEASES.md` | Download, Compare, Install, Trust components and release registry |

## 6. Definition of ready-to-merge

A change is ready only when it passes the following checks.

- `pnpm typecheck` succeeds.
- `pnpm build` succeeds and all expected routes generate.
- No console errors appear on the changed route.
- Text, controls, and visible screenshots are correct in light and dark themes.
- The homepage background can remain edge-to-edge while text and controls retain readable inner gutters.
- Navigation labels such as `Full vs Lite` do not wrap awkwardly where one-line treatment is intended.
- The page has no accidental overflow or blank tail space.
- A changed claim is traceable to a release note, official screenshot, or documented product behavior.
- Motion never controls whether required content appears, and reduced motion leaves content and controls available.
- A changed public URL has a canonical route and remains present only once in the sitemap.
- Release updates do not leave previous-version strings in the active hero, Product Proof, fallback snapshot, current Changelog story, or asset links.

## 7. Documentation index

| Document | Use it for |
|---|---|
| [`DESIGN.md`](./DESIGN.md) | Visual decisions, token usage, shell, layout, interaction, and motion |
| [`CONTENT.md`](./CONTENT.md) | Copy style, product claims, guides, Changelog grouping, and SEO boundaries |
| [`RELEASES.md`](./RELEASES.md) | Version updates, complete release sections, official media, fallback data, and release validation |
| `MAINTAINING_THE_SITE.md` | Architecture map, module boundaries, and day-to-day validation |
