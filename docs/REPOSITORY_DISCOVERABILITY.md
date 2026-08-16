# Repository Discoverability Checklist

> **Purpose:** Make the HalalDL GitHub project and website reinforce one another through clear, truthful links and descriptions.

## Recommended GitHub repository surfaces

Apply these changes to the **HalalDL application repository** when you are ready to edit that repository:

| Surface | Recommended content |
|---|---|
| Repository About website field | The chosen canonical website URL, not the temporary Vercel hostname |
| Repository description | `A local-first yt-dlp GUI for Windows to preview, select, download, recover, organize, and create locally.` |
| README opening | One concise product paragraph followed by links to Download, Full vs Lite, Install, Verify SHA256, Guides, Changelog, and GitHub Releases |
| README release section | Link the current release guide and Changelog entry, then link directly to the canonical GitHub Release |
| README trust section | Explain that releases are from GitHub, installers are currently unsigned if that remains true, and SHA256SUMS.txt is available |
| Release body | Keep the canonical release notes complete, link the website’s durable release guide, and use the same Full/Lite/Portable boundaries as the site |
| Topics | Use only accurate topics such as `yt-dlp`, `windows`, `media-downloader`, `desktop-app`, and `open-source` if they describe the repository |

## Link architecture

The public path should be coherent:

> GitHub repository → canonical website → Download → Compare → Install → Verify → Guides → Changelog → canonical GitHub Release

Use descriptive link text such as **Install HalalDL on Windows**, **Compare Full, Lite, and Portable**, and **Verify SHA256**. Avoid repeated bare URLs or generic `click here` links.

## Domain transition

When the canonical domain is chosen:

1. Set the repository About website field to the custom domain.
2. Set `NEXT_PUBLIC_SITE_URL` in the site deployment environment.
3. Configure the custom domain in Vercel and redirect `halaldl.vercel.app` to it.
4. Confirm canonical URLs, Open Graph URLs, JSON-LD, robots, and sitemap all use the custom domain.
5. Add the domain to Google Search Console and submit `/sitemap.xml`.

Do not publish two competing public websites. The Vercel hostname may remain as an infrastructure alias, but it should redirect to the canonical domain and should not be the preferred link in the repository or release notes.

## What not to do

Do not create keyword-stuffed README sections, fake review claims, link farms, paid backlinks, or thin pages for every minor variation of “free downloader.” Authority should come from a useful open-source project, clear release evidence, genuinely helpful guides, and links that make the product easier to verify and use.
