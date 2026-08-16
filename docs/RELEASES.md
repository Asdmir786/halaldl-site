# HalalDL Release Content Playbook

> **Purpose:** Make every release update predictable. A new version should be added once to the central registry, then selectively promoted into the homepage, Changelog, guides, install decisions, and SEO story.

## 1. The single source of truth

The current release model lives in:

```text
src/content/releases/registry.ts
```

`CURRENT_RELEASE` drives the release-aware parts of the site. The registry is intentionally separate from the live GitHub fetch so the page remains accurate when GitHub is unavailable and so product storytelling stays deliberate rather than being generated from raw Markdown.

| Registry field | Used by | Why it exists |
|---|---|---|
| `tag`, `date`, `dateLabel`, `title`, `releaseUrl` | GitHub fallback, hero, release context | Keeps current-version labels consistent |
| `summary` | Release fallback and short editorial summaries | Provides a durable release description |
| `changelogMedia` | Changelog featured release | Uses official light/dark release art |
| `changelog.intro` | Changelog featured story and current-release archive entry | Gives the release a clear human-readable opening |
| `changelog.sections` | Changelog grouped change table | Preserves the complete current-release story without clutter |
| `changelog.beforeYouInstall` | Changelog boundaries card | Keeps installer, signing, watchlist, and update limitations near the release |
| `changelog.developerNote` | Changelog context card | Provides relevant implementation or fixture context when needed |
| `homepage` | Hero, Product Proof, SEO schema | Keeps claims, chips, workflow cues, and screenshots synchronized |
| `fallback` | `src/lib/github.ts` | Prevents an API failure from advertising an old version |
| `schemaFeatures` | Homepage `SoftwareApplication` JSON-LD | Stops structured data drifting away from visible content |

## 2. What is automatic and what is editorial

The GitHub API provides the live release tag, date, release link, release assets, stars, and repository facts. The site updates those live values through `src/lib/github.ts` with caching. The release archive also uses the API when available.

The **registry is editorial**. It holds the messaging a person should see: which screens tell the story, how the current release is grouped in the Changelog, what the hero should promise, which limitations need a note, and which feature words can appear in schema. Do not try to automate these judgments from a raw GitHub release body.

> **Rule:** GitHub is the source for canonical facts, release links, and assets. The registry is the source for the website’s explanation, grouping, fallback state, and product proof.

A future release should be both live and editorial: live release metadata may update automatically, but the current-release story must have a reviewed registry entry before it is promoted across the site.

## 3. Adding a new release

Use this exact sequence for a future `v0.6.x` or later release.

### Step 1 — Gather release evidence

Publish the GitHub release first. Collect the following before touching the website:

| Required input | Example |
|---|---|
| Tag and publish date | `v0.6.1`, ISO date |
| Plain-language release title | `Faster recovery and clearer local history` |
| Official light and dark media | Hero plus one image for each promoted feature |
| Full, Lite, Portable, and checksum asset names | Exact release asset filenames |
| Complete user-facing change groups | Download, recovery, organization, creation, fixes, or other meaningful categories |
| Three to five homepage outcomes | Not implementation-only changelog items |
| Limits or migration notes | Source constraints, unsigned installer note, update path |
| Developer/context note, if relevant | Fixture, packaging, or local-first clarification |

Save media in `public/releases/<major.minor.patch>/`. Prefer names such as `hero-light.png`, `hero-dark.png`, `feature-light.png`, and `feature-dark.png`.

### Step 2 — Update `registry.ts`

1. Add a `ReleaseDefinition` for the new tag.
2. Move the prior `currentRelease` into `legacyReleases` if its Changelog art should remain available.
3. Make the new definition the exported `currentRelease`.
4. Update `fallback.assets` with exact released asset URLs.
5. Add `changelog.intro` with the plain-language release promise.
6. Add `changelog.sections` with the complete grouped release notes; do not reduce the page to the first summary paragraph.
7. Add `beforeYouInstall` and `developerNote` when the release contains meaningful trust, update, fixture, or limitation context.
8. Add at most five `homepage.productProof` stories, each with one real screenshot, a concrete title, three proof points, and one accent.
9. Update `schemaFeatures` only with capabilities that are visible on the homepage.

Do not leave a version string in a component when it belongs in the registry.

### Step 3 — Decide what deserves homepage space

Promote a capability only when it changes a person’s workflow. A dependency bump, internal cleanup, or packaging-only note belongs in the Changelog, not the hero.

| Release change | Homepage treatment |
|---|---|
| New source-selection workflow | Hero demo or Product Proof story |
| New recovery workflow | Product Proof story and FAQ if it resolves a real support question |
| New local organization feature | Product Proof story and dedicated guide if the workflow is substantial |
| New installer option | Install section and Compare page |
| Tool/dependency reliability improvement | One proof story or Changelog item; avoid hero prominence |
| Bug fix only | Changelog only unless it resolves a pervasive user block |

### Step 4 — Add durable content

Create a release guide only when the update deserves explanation beyond a Changelog table. Use `src/lib/guides/content/halaldl-<version>.ts` as the pattern. Register the guide in `src/lib/guides.ts`; that gives it a canonical URL, article schema, internal related links, and automatic sitemap coverage.

### Step 5 — Validate before publishing

```bash
cd /home/ubuntu/halaldl-site
pnpm typecheck
pnpm build
curl -I http://localhost:3000/
curl -I http://localhost:3000/changelog
curl -I http://localhost:3000/download
curl -I http://localhost:3000/install/windows
curl -I http://localhost:3000/trust/verify-checksum
curl http://localhost:3000/sitemap.xml
```

Check that the hero, Product Proof, complete Changelog table, fallback release state, social metadata, and sitemap all reference the new tag. Verify both light and dark screenshots. Check that Full vs Lite and other navigation labels do not wrap awkwardly.

## 4. Definition of done

A release page update is complete only when all rows below are true.

| Requirement | Check |
|---|---|
| Current tag is correct during normal GitHub access | Homepage release card and download links use live API data |
| Current tag is correct during a GitHub failure | `FALLBACK_SNAPSHOT` derives from `CURRENT_RELEASE` |
| Complete release story survives an API failure | `CURRENT_RELEASE.changelog` contains the current intro, grouped changes, boundaries, and context |
| No stale current-release screenshots remain | Product Proof and Changelog media come from the registry |
| SEO reflects the new visible capabilities | Title/description remain useful; schema derives feature text and screenshots from the registry |
| New guide is useful, not thin | It explains a changed user workflow, links to related guides, and has its own FAQ only when needed |
| Sitemap is coherent | New meaningful guide URL appears once with an accurate meaningful-update date |
| Secondary decision pages agree | Download, Compare, Install, Trust, and Changelog use the same release tag and asset boundaries |

## 5. Avoid these release-update mistakes

Do not hand-edit `v0.x.y` across multiple React components. Do not use GitHub release Markdown as hero copy without editorial grouping. Do not show only a short parser-derived subset when the current release has a complete change set. Do not promote every internal fix to the landing page. Do not fabricate screenshots, review snippets, compatibility claims, or quality guarantees. Do not change `lastModified` for a cosmetic typography tweak; reserve it for meaningful page content changes. [1]

## Reference

[1]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google sitemap guidance: meaningful `lastmod` updates and canonical URLs"
