# Updating This Site For A New HalalDL Release

This document is the playbook for syncing **halaldl-site** when a new HalalDL desktop release ships.

Use it when:

- The product repo publishes a new GitHub Release
- Someone asks to “update the site for the latest version”
- Release promo assets land under `HalalDL/docs/assets/releases/<version>/`

Do **not** treat every release the same. Decide first whether this is a **required sync**, a **marketing refresh**, or both.

**Never hardcode a remembered version as “the example.”** Always discover the current latest release from GitHub (and matching local assets) before editing.

---

## Discover the latest release first

Before changing anything, resolve the target version from live sources:

1. Fetch latest from GitHub (pick one):
   - API: `https://api.github.com/repos/Asdmir786/HalalDL/releases/latest`
   - CLI: `gh release view --repo Asdmir786/HalalDL`
   - Browser: `https://github.com/Asdmir786/HalalDL/releases/latest`
2. Record from that response: `tag_name`, release title/body, `published_at`, asset names, sizes, digests, download URLs.
3. Strip a leading `v` for folder paths (`v0.5.1` → `0.5.1`) and keep the `v` prefix for tags / `FALLBACK_SNAPSHOT.latestVersion`.
4. Check sibling assets:
   - `../HalalDL/docs/assets/releases/<x.y.z>/` (preferred local source)
   - or the same paths on `main` in the product repo if the sibling checkout is missing
5. Compare against this site:
   - `FALLBACK_SNAPSHOT.latestVersion` in `src/lib/github.ts`
   - Whether `public/releases/<x.y.z>/` already exists
   - Whether homepage hero / `FEATURE_STORIES` still point at an older `/releases/...` folder

Only then classify the release and apply the matching checklist. Do not invent features — use the release body + asset README.

---

## Mental model

| Layer | Behavior | Manual work? |
| --- | --- | --- |
| Live version, download URLs, sizes, checksums, changelog text | Fetched from GitHub Releases API at runtime (`src/lib/github.ts`, `src/lib/changelog.ts`) | **Usually no** once the GitHub Release exists |
| Fallback snapshot | Hardcoded in `src/lib/github.ts` (`FALLBACK_SNAPSHOT`) | **Yes** — update on every noteworthy public release |
| Homepage hero / feature stories / workflow copy / FAQ “what changed” | Hardcoded marketing in `src/lib/site.ts`, `src/components/home/*` | **Yes** when the release story changes |
| Promo / screenshot images under `public/releases/<version>/` | Static files served by Next.js | **Yes** when new art exists |
| Per-version changelog card media | `RELEASE_MEDIA_BY_VERSION` in `src/lib/changelog.ts` | **Yes** if you want a featured image for that tag |
| Historical guides (older `halaldl-0-x-y` pages) | Keep as history | **Do not rewrite** older guides into the new version |
| New release guide | Optional new `/guides/halaldl-0-x-y` | **Yes** for minor/major story releases; optional for tiny patches |

**Why this split exists:** downloads and version badges should stay correct even if nobody edits the site. Marketing imagery and copy still sell the *previous* story until someone refreshes them.

---

## Source of truth (product repo)

Sibling checkout expected at:

```text
../HalalDL/
```

Release assets usually live at:

```text
../HalalDL/docs/assets/releases/<x.y.z>/
  README.md
  promo/          # preferred for homepage + changelog hero
  screenshots/    # optional plainer captures
  generate-images.py
```

Also confirm the published GitHub Release:

- Latest: `https://github.com/Asdmir786/HalalDL/releases/latest`
- Tag page: `https://github.com/Asdmir786/HalalDL/releases/tag/v<x.y.z>`
- Assets: Full/Lite setup `.exe`, optional MSI/Portable, `SHA256SUMS.txt`

Read the product release README + GitHub release body before rewriting site copy. Do not invent features.

---

## Decision tree

### 1. Patch with no visible UI / story change

Examples: dependency bump, tiny bugfix, packaging-only.

**Do:**

- Confirm GitHub Release is public (live site picks it up automatically)
- Update `FALLBACK_SNAPSHOT` in `src/lib/github.ts`
- Optionally bump the “Live product details…” paragraph in `README.md`

**Skip:**

- New `public/releases/<version>/` folder (unless new images were generated)
- Homepage `FEATURE_STORIES` / hero art swap
- New guides page

### 2. Patch or minor with new promo art, same overall product story

**Do** everything in (1), plus:

- Copy assets into `public/releases/<x.y.z>/promo/` (and `screenshots/` if present)
- Point hero + schema screenshots at the new hero (and 1–2 feature images)
- Add `RELEASE_MEDIA_BY_VERSION["v<x.y.z>"]` if changelog should show art
- Lightly refresh FAQ “What changed…” if users would otherwise think the site is stale

### 3. Story release (new themes, brand, trust, workflow)

Use when the release body sells a named update story and ships multiple promo pairs (not just a one-line fix).

**Do** the full checklist below.

---

## Full checklist (story / marketing release)

Work from the site repo root (`halaldl-site`).

### A. Copy assets

```powershell
New-Item -ItemType Directory -Force -Path "public\releases\<x.y.z>\promo","public\releases\<x.y.z>\screenshots" | Out-Null
Copy-Item -Force "..\HalalDL\docs\assets\releases\<x.y.z>\promo\*" "public\releases\<x.y.z>\promo\"
Copy-Item -Force "..\HalalDL\docs\assets\releases\<x.y.z>\screenshots\*" "public\releases\<x.y.z>\screenshots\"
```

Prefer **promo** pairs (`*-light.png` / `*-dark.png`) for the website. Keep light/dark pairs together. Do not invent filenames — match the product folder.

Keep older `public/releases/<older>/` trees. They still back historical changelog media and guides.

### B. Update GitHub fallback (`src/lib/github.ts`)

Update `FALLBACK_SNAPSHOT` fields from the live release API / assets:

- `latestVersion` → `v<x.y.z>`
- `latestReleaseName` → clean title (drop leading `#` if GitHub includes it)
- `latestReleaseUrl`, `latestReleaseDate`, labels
- `releaseNotes` → one factual sentence grounded in the release body
- `fullSetupUrl` / `liteSetupUrl` / `checksumsUrl`
- `fullSetupSize` / `liteSetupSize` (bytes from GitHub asset `size`)
- `checksumDigest` → Full setup asset digest (`sha256:…`) when available

**Why:** used when the GitHub API is unavailable so download CTAs do not point at a dead old build.

### C. Homepage marketing

Update these to the new release story and image paths:

| File | What to change |
| --- | --- |
| `src/components/home/hero-section.tsx` | Hero `lightSrc` / `darkSrc` / `alt` under `/releases/<x.y.z>/promo/` |
| `src/lib/site.ts` → `FEATURE_STORIES` | Replace featured stories to match **this** release’s promo themes; update paths, titles, bullets |
| `src/lib/site.ts` → `FAQ_ITEMS` | Replace “What changed in HalalDL …” with the new version; update any FAQ that still tells people to install an obsolete fix as if it were current |
| `src/components/home/home-data.ts` | `workflowSteps` + `valueProps` copy for the new story |
| `src/app/page.tsx` | JSON-LD `screenshot` URLs → new promo images |

**Rules for `FEATURE_STORIES`:**

- One story ≈ one promo pair when possible
- Keep evergreen stories (for example raw logs) only if they still fit; retarget the framing to the new release
- Do not leave homepage stories pointing at the previous version’s promo folder

### D. Changelog media

In `src/lib/changelog.ts`, add:

```ts
"v<x.y.z>": {
  type: "image",
  lightSrc: "/releases/<x.y.z>/promo/hero-light.png",
  darkSrc: "/releases/<x.y.z>/promo/hero-dark.png",
  alt: "…",
},
```

Leave older version entries intact.

Changelog **text** still comes from GitHub release bodies — do not hand-maintain a full second changelog unless the parser needs help.

### E. Guides

For story releases, add a new guide rather than overwriting the previous one:

1. Create `src/lib/guides/content/halaldl-0-x-y.ts` (slug `halaldl-0-x-y`)
2. Register meta + article in `src/lib/guides.ts`
3. Point “latest release notes” related links at the new slug
4. Keep older `halaldl-0-…` guides as historical pages; you may add the new slug into their `relatedSlugs`

**Do not** mass-edit every guide that mentions an older version as a historical milestone (for example “fixed in 0.4.1+”). Those references are still true.

### F. README product snapshot

Update the “Live product details were checked against GitHub on …” paragraph in `README.md` to the new version date and one-line story.

### G. Verify

- Confirm files exist under `public/releases/<x.y.z>/promo/`
- Typecheck / lint as usual for the repo
- Spot-check: home hero, feature showcase, `/changelog`, `/download`, `/guides/halaldl-0-x-y`
- Confirm live API already returns the new tag (site should show it without hardcoding everywhere)

---

## What not to change (and why)

| Leave alone | Why |
| --- | --- |
| Runtime GitHub fetch logic unless broken | Latest version should stay API-driven |
| Older `public/releases/<prev>/` trees | Historical changelog / docs still reference them |
| Older release guides’ factual content | They document that release, not the latest |
| Download page structure / WinGet command / trust verify flow | Product distribution model rarely changes per release |
| Analytics event names / CTA keys | Changing them breaks dashboard continuity |
| Brand tokens / theme system “just because” the app rebranded | Only update if the **site** design intentionally follows; app promo art can change first |
| Forcing a new guide for every patch | Noise; use the decision tree |

---

## Copy tone for release marketing

- Lead with user-visible outcomes from the GitHub release body
- Prefer concrete nouns (Install Trust, Copy Diagnostics, presets) over hype
- Mention SmartScreen / unsigned installers / `SHA256SUMS.txt` when trust is part of the story
- Keep Windows-first, local-first, MIT, no-account positioning stable unless the product pitch itself changed

---

## Quick reference — files touched in a typical story release

```text
public/releases/<x.y.z>/promo/*          # copied from HalalDL docs assets
public/releases/<x.y.z>/screenshots/*    # optional
src/lib/github.ts                        # FALLBACK_SNAPSHOT
src/lib/site.ts                          # FEATURE_STORIES + FAQ
src/components/home/hero-section.tsx     # hero images
src/components/home/home-data.ts         # workflow + value props
src/app/page.tsx                         # JSON-LD screenshots
src/lib/changelog.ts                     # RELEASE_MEDIA_BY_VERSION entry
src/lib/guides/content/halaldl-0-x-y.ts  # new guide article
src/lib/guides.ts                        # register guide + related links
README.md                                # checked-against snapshot line
```

---

## Agent instructions (short)

When the user says a new HalalDL version is out (or asks whether the site needs a sync):

1. Read this file end-to-end
2. **Fetch the current latest GitHub Release** — do not assume a remembered version
3. Inspect matching `../HalalDL/docs/assets/releases/<version>/` (or product-repo assets)
4. Diff that against fallback snapshot + homepage image paths on this site
5. Classify patch vs story release
6. Apply only the matching sections of the checklist
7. Do not redesign unrelated pages
8. Prefer copying real promo assets over generating new site-only art
9. Summarize what you updated vs intentionally skipped
