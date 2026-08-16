# HalalDL Website Design System

> **Purpose:** Keep HalalDL recognizably calm, local-first, Windows-first, and trustworthy as new features, releases, and pages are added.

## 1. Product character

HalalDL is a **local Windows application** built on yt-dlp. The site should make the product feel precise and capable without resorting to neon excess, fake terminal aesthetics, generic WebGL spectacle, or cluttered glass-card repetition.

The current visual direction is best described as **“Lusion camera energy with Linear product clarity.”** The camera may move, cards may choreograph, and the pointer may add a subtle field of energy, but the product evidence and explanation must remain readable.

Every new section should answer one of four questions: **What can the app do? How does a person control it? What happens when something goes wrong? Why should a person trust the release path?** If a section answers none of these, it does not belong on the page.

| Design principle | Required expression | Avoid |
|---|---|---|
| **Local-first** | On-device queues, files, folders, visible logs, no-account language | Cloud-dashboard metaphors, sync claims, invented user profiles |
| **Windows-first** | Practical layouts, clear installers, source and checksum links | Unsupported platform claims or generic device mockups |
| **Calm capability** | Graphite/steel surfaces, generous hierarchy, controlled highlights | Cyberpunk overload, competing gradients, constant animation |
| **Trust through evidence** | Official screenshots, GitHub links, checksums, plain limitations | Vague security claims, fake ratings, unverified testimonials |
| **Product before decoration** | Every animation demonstrates a state, transition, hierarchy, or reading rhythm | Decorative motion that delays reading or hides content |
| **Camera energy, product clarity** | 2.5D card fields, gentle parallax, real app states, deliberate scene changes | Astronaut/spectacle imagery, floating 3D logos, full-page WebGL cinema |

## 2. Tokens and theme roles

The implementation source of truth is `src/app/globals.css`. Use semantic variables rather than raw hex values in new CSS.

| Role | Light token | Dark token | Use |
|---|---|---|---|
| Page base | `--paper: #f5f7fb` | `--paper: #080e17` | Page backgrounds and quiet open space |
| Elevated surface | `--paper-elevated` | `--paper-elevated` | Cards, panels, screenshot chrome |
| Primary text | `--ink: #080e17` | `--ink: #f5f7fb` | Headlines and key labels |
| Supporting text | `--ink-soft` / `--ink-muted` | `--ink-soft` / `--ink-muted` | Body copy and metadata |
| Steel blue | `--sky-strong: #5b7fa8` | `--sky-strong: #5b7fa8` | Structure, secondary emphasis, information |
| Mint | `--mint-strong: #0b7f72` | `--mint-strong: #26e0c6` | Active state, successful state, focus, verified cues |
| Coral | `--coral-strong` | `--coral-strong` | Recovery, warning, Download Doctor emphasis |
| Amber | `--amber-strong` | `--amber-strong` | Caution, installer and verification context |
| Boundary | `--line` / `--line-strong` | `--line` / `--line-strong` | Separators and low-contrast card edges |

### Accent rules

Mint communicates **active, selected, completed, or verified**. Steel blue communicates **structure or neutral information**. Coral is reserved for a recovery issue or a high-attention state. Amber is reserved for a caution that still allows a clear next step.

A surface should normally have **one accent**. Do not stack mint, coral, amber, and blue in the same small card unless each color maps to an actual product state.

The dark theme is **graphite with restrained teal depth**, not a repeated navy-card grid. Use near-black open space, a small number of elevated surfaces, thin boundaries, and mint only for meaningful active states.

## 3. Shell, layout, and hierarchy

The site uses two intentional width systems. The navigation remains contained; the homepage body uses the full canvas while its content receives a readable inner gutter.

| Layer | Guidance |
|---|---|
| **Header** | Compact contained frame with persistent navigation, a clear GitHub mark, and a one-line `Full vs Lite` label. Never compete with the hero heading. |
| **Homepage body** | Full-width `.homepage-body` background and story canvas. Do not reintroduce a large outer page margin. Apply responsive inner padding to text and controls so content never touches the viewport edge. |
| **Hero** | One promise, one supporting explanation, primary download action, Local Control Room visual stage, then concise trust signals. |
| **Local Control Room** | A 2.5D field made from real HalalDL app states: the living app window, source preview, video output, audio output, and completion cards. Use pointer and scroll depth subtly. |
| **Product Proof** | Official, theme-aware screenshots. One screen equals one product claim and three short proof points. The pinned showcase may move; the intro remains independently readable. |
| **Install** | Recommend Full clearly, then show Lite and Portable as legitimate alternatives. Keep verification nearby. Use a quick path only as a summary; put detailed first-run explanations below. |
| **Trust** | Short actions, source links, checksum path, and product facts. Avoid dense legal-copy blocks. |
| **FAQ** | A readable question field with restrained staggered arrival and smooth native answer expansion. Never hide answers behind animation. |
| **Secondary pages** | Use a contained page frame, a shared secondary hero, clear route navigation, and section-level reveals. Do not make every page a separate visual universe. |
| **Changelog** | Treat the current release as an editorial story: featured release, complete grouped change table, install boundaries, developer note, then reverse-chronological archive. |
| **Footer** | One release-aware CTA, three concise link groups, and a tight legal/trust row. The page must end exactly at the footer. |

Headlines should use the display face and a short, concrete statement. Body copy should stay practical: explain what a person can do, what remains local, and where a limitation applies. Use an accent line only for a meaningful contrast inside the headline.

## 4. Screenshots and product media

Official product screenshots are evidence, not filler. Store each release’s assets under `public/releases/<major.minor.patch>/` with matching `-light` and `-dark` images when available.

1. Use `ThemedScreenshot` for product views that have light and dark variants.
2. Use an image only when it explains the claim more clearly than a live simulation.
3. Use a live demo for a **sequence**—for example, link preview → entry selection → output selection—not as a substitute for a real screen.
4. Give every image specific alt text describing the visible workflow, not merely “HalalDL screenshot.”
5. Do not invent interface details to make a marketing story more dramatic.
6. Verify official raw image URLs and release tags before adding them to a public page.

## 5. Motion system

Motion must be perceptible, purposeful, optional, and **content-safe**.

| Pattern | Use | Default behavior |
|---|---|---|
| **Hero word reveal** | Make the first promise feel authored | One initial entrance only; never re-run while scrolling |
| **Local Control Room depth** | Establish product-state relationships | Gentle pointer/scroll transforms on real cards; no decorative 3D logo |
| **Hero app sequence** | Demonstrate an interaction path | Stable populated first frame, then deliberate state changes |
| **Scroll story** | Connect reading to a product workflow | One active step at a time; preserve manual controls |
| **Screenshot transition** | Change product proof state | Crossfade or slide with context retained; do not flash blank |
| **Card entrance** | Establish hierarchy, such as Full before Lite/Portable | Short staged sequence, then a stable layout |
| **Secondary hero** | Give every non-home route a clear arrival | Visible-by-default content plus a subtle settle after intersection |
| **ScrollReveal** | Reveal supporting sections across homepage and secondary routes | Render normally first; add `.is-motion-active` only after intersection |
| **FAQ accordion** | Clarify the active answer | Animate height/chevron/open state while keeping native semantics |
| **Footer reveal** | Mark the page close | One visible blur-and-rise entrance; never create empty tail space |

`ScrollReveal` and `MotionField` must never apply a hidden initial state to required content. Animation enhances the page after paint; it does not decide whether a heading, CTA, release name, screenshot, or answer exists.

Always respect `prefers-reduced-motion`. Reduced motion must leave the same information, layout, and controls available without requiring a callback or observer.

## 6. Interaction and accessibility checklist

Before merging any visual change, confirm the following.

- The keyboard focus state uses `--focus-ring` and is visible in both themes.
- Every meaningful control has text or an accessible label.
- Decorative visual layers are `aria-hidden`.
- Scroll-driven states can also be reached with a click or tap where appropriate.
- Light and dark screenshots swap with the document theme.
- Body copy remains readable at normal desktop width and on a narrow mobile layout.
- Navigation labels such as `Full vs Lite` use `whitespace-nowrap` when the label itself must not break.
- Native FAQ disclosure semantics remain intact.
- No section leaves intentional-looking but accidental blank page height below the footer.

## 7. Review questions

Ask these questions before adding a new treatment:

1. **Does this make a real HalalDL capability easier to understand?**
2. **Would the section still look intentional without motion?**
3. **Does the accent color describe a state, rather than merely decorate?**
4. **Can the current release’s official assets support this claim?**
5. **Does the camera movement remain subordinate to product clarity?**
6. **Does the design remain calmer than the product interface it presents?**
