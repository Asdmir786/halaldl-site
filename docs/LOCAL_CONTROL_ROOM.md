# HalalDL Local Control Room

## Purpose

This document defines the approved homepage direction before implementation. HalalDL should feel like a living local product interface: **Lusion-style camera and card choreography**, constrained by **Linear-style hierarchy, real product proof, and readability**. The result must never become a portfolio canvas or a generic 3D scene.

The official HalalDL PNG logo remains the brand identity. The page should not use a 3D logo as its central concept. The interface, URL preview, output choices, recovery state, local Library, and Clip Maker are the visual objects.

## Narrative

> A source enters the local control room. The user chooses exactly what to keep, recovers deliberately when needed, keeps completed files local, and creates from them.

| Act | Visitor question | Product proof | Motion treatment |
|---|---|---|---|
| **Arrive** | What is HalalDL? | Real desktop app window and local-first promise | Slow camera drift; nearby cards establish depth. |
| **Preview** | Can I inspect a source first? | URL preview and playlist-entry selection | Preview card travels toward the camera. |
| **Control** | Can I choose quality and output? | 720p, 1080p, 4K, MP3, M4A, subtitles, presets | Output cards fan forward; active choice gains focus. |
| **Recover** | What happens when a job fails? | Download Doctor and visible logs | Misaligned card field resolves into an ordered state. |
| **Keep and create** | What happens after download? | Library, Follows, History, and Local Clip Maker | Completed-media card settles into a shelf, then becomes a clip timeline. |

## Page Architecture

The current page repeats broad capability copy in the hero, Workflow, Product Proof, install material, Trust, and FAQ. The revised page uses fewer words in the visual journey and places durable explanatory material where readers and crawlers expect it.

| Homepage area | Job | Copy level | Required semantics |
|---|---|---|---|
| **Hero — Local Control Room** | Establish local-first value, real product, and CTA | One headline, one sentence, 3–5 short capability labels | One `<h1>`, descriptive paragraph, CTA links. |
| **Story field — Preview / Control / Recover / Keep** | Show the core product journey through cards, screenshots, and interaction | One strong sentence plus optional concise capability labels per act | One `<h2>`, four `<article>` elements with distinct `<h3>` headings. |
| **Release proof** | Show official v0.6 screenshots for Download Doctor, Library, Clip Maker, and reliability | Short contextual captions only | Image alt text, feature headings, internal link to Changelog and release guide. |
| **Install decision** | Direct visitors to Full, Lite, or Portable | One recommended path and a compact comparison | Heading, comparison labels, semantic links to Download and Full vs Lite. |
| **Verification / Trust** | Give one practical verification route | Three concise steps | Heading, ordered list, links to checksum guide and GitHub Releases. |
| **FAQ and guides** | Keep detailed questions and long-tail search material available without burdening the visual story | Full answers, collapsed until requested | Existing FAQ schema and internal guide links. |

## Interaction Rules

| Input | Approved behavior | Limit |
|---|---|---|
| **Scroll** | Moves a camera-like view between product-card fields; short pins only where a transition is meaningful | At most two or three short pinned scenes across the homepage. |
| **Mouse** | A soft field produces small counter-parallax and makes nearby cards sharpen or rise | Keep the system cursor; movement must remain below 12px of travel and 3° of rotation. |
| **Hover** | Interactive output, playlist, and build cards rise, sharpen, and gain edge light | Only meaningful decisions respond. |
| **Click** | Visible selection changes on output or playlist cards | Do not create fake interaction that goes nowhere. |
| **Ambient motion** | Slow depth haze, card float, and signal movement | No particle snow, continuous spinning, or neon background loops. |

## Dark Theme Rules

Dark mode is **Obsidian Control Room**, not light mode recolored navy.

| Material | Rule |
|---|---|
| Canvas | Near-black charcoal base with a distant blue-green depth field. |
| Product cards | Graphite or smoked glass; cards gain contrast only when active or near the camera. |
| Mint | Reserved for selected, downloading, verified, complete, or actionable states. Never use it as default body-copy color. |
| Typography | Neutral white for hierarchy and blue-grey for supporting copy; color cannot be the sole state indicator. |
| Depth | Use scale, blur, shadow, occlusion, and edge light before adding glows. |

## SEO Preservation Rules

Reducing visible prose must not remove useful information. The homepage stays search-ready through clear on-page meaning rather than repeated paragraphs.

1. Keep the single topic-defining `<h1>` and an explicit description of the Windows yt-dlp GUI, local-first workflow, and main supported tasks.
2. Give each story act a unique feature heading and concise explanatory text. Do not repeat the same phrase across hero, Workflow, and Product Proof.
3. Keep official release screenshots, relevant alt text, software structured data, FAQ structured data, and the current internal links to Download, comparison, verification, Changelog, and guides.
4. Keep full operational explanations in FAQ answers and dedicated guides, where they are useful to readers rather than interrupting visual storytelling.
5. Do not add artificial keyword lists, invented review markup, or unrelated topical content.

## First Prototype Scope

The first implementation is only the **Arrive → Preview → Control** field. It must use real product UI planes:

- central HalalDL app window;
- front-left URL preview card;
- rear-right video and audio output cards;
- a local pointer field that shifts card depth;
- first-scroll choreography where preview moves forward and output choices fan into focus.

Recovery, Library, and Clip Maker will follow only after this first scene feels like Lusion energy with Linear clarity.
