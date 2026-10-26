# Search Console audit - 2026-10-26

Property: `https://halaldl.vercel.app/`. Data was read directly through Google's APIs with the existing service account. The property initially granted Restricted access; the owner then granted Full access for sitemap submission. The audit token requests read-only scope. Sitemap submission uses a separate short-lived token with the required write scope.

## Search performance

Web Search, finalized data, date ranges in Google's Pacific-time reporting calendar. Recent days are excluded to keep the comparison complete. These are organic Google Search clicks, not all website visits, desktop usage or completed downloads.

| Metric | 2026-08-29 to 2026-09-25 | 2026-09-26 to 2026-10-23 | Change |
| --- | ---: | ---: | ---: |
| Clicks | 48 | 83 | +72.9% |
| Impressions | 3,421 | 3,848 | +12.5% |
| CTR | 1.40% | 2.16% | +0.75 percentage points |
| Average position | 9.06 | 6.41 | Improved by 2.65 positions |

The 90-day window, July 26 to October 23, has 174 clicks and 10,166 impressions. `/guides/best-yt-dlp-gui-windows` generated 150 clicks and 8,615 impressions; in the latest 28 days it generated 78 of the property's 83 clicks. This is a concentration risk, not evidence of a site-wide decline. Desktop accounted for 148 of the 174 organic clicks.

Query-level exports omit anonymized queries and are not a substitute for property-level totals. For example, the flagship query/device/country/day CSV contains 45 reported clicks while the page-level total is 150. Do not sum the query export to claim the site's total traffic. Google may also report section-anchor URLs; those are not automatically duplicate pages.

The new hosted downloader and its guides were published after the performance window. Their ranking or conversion performance cannot yet be judged from this dataset.

## Crawl and indexing evidence

- The live sitemap existed, returned 200, and contained 38 URLs. Google's sitemap-list API returned 200 with no registered sitemap under this URL-prefix property. A sitemap may exist on the website without being registered under the selected property.
- All 38 sitemap URLs returned 200. The additional internal sign-in link returned the expected OAuth redirect. No broken internal content route was found in this crawl.
- URL Inspection checked 37 public content URLs, excluding the account page. 21 returned `Submitted and indexed`; 16 returned `URL is unknown to Google`. This is a URL sample from the sitemap, not a property-wide Page Indexing report.
- Unknown URLs: download, changelog, Full/Lite comparison, the 0.4.1 and audio guides, the hosted downloader and six hosted-fetch guides, and four legal pages. Several are newly published. Unknown does not mean penalized or permanently excluded.
- Indexed samples had matching Google/user canonical URLs and allowed indexing. The homepage's serialized canonical without a terminal slash is equivalent to its normalized root URL; it is not classified as a canonical defect.
- Manual actions, the full Page Indexing report, links report and Core Web Vitals were not exposed by these API responses and were not independently certified.

## Corrections

- Remove `/account` from the sitemap and set account metadata to `noindex, follow`. It remains crawlable so Google can observe the directive.
- Exclude API paths from robots crawling. This is crawl guidance, not authorization or protection for API data.
- Tie release-page sitemap dates to the current release's recorded date. Update the hosted-fetch dates to the actual redesign/Pro-removal date, October 26. Derive the guides hub's modification date from guide metadata instead of the old July constant. Do not bump dates on every build.
- Correct the guides hub's current-release card: it claimed v0.6.1 but linked to the v0.6.0 guide. Derive the destination from the central current-release tag.
- Improve the filename-template guide, which had 353 impressions and two clicks in 90 days: name its Windows/template purpose explicitly, replace vague pattern descriptions with actual templates, add missing-metadata/container FAQs and link the official yt-dlp documentation. Preserve its URL and the high-performing comparison guide's URL/content.

## Access security

The Search Console grant is to a service-account identity, not to an individual AI session. Anyone possessing its private key can request tokens and use its granted permissions. Full user is not Owner, and this property grant does not grant Gmail or Google-account sign-in access. Other Cloud IAM permissions of the service account were not audited.

The local `.env.local` inherited broad Windows read permissions. Its ACL was restricted to the current Windows user, SYSTEM and Administrators; the prior ACL is retained locally for review. The file is untracked, and environment/analytics files are explicitly excluded from deployment. Checked public environment, analytics and script paths returned 404. These checks do not prove that a key has never leaked.

The existing key is also configured in Vercel Production/Preview. It is not used by the public runtime code, but authorized Vercel project members may be able to retrieve it; old deployments may retain their environments. No key was rotated or remote IAM/environment permission changed during this audit. Removing unnecessary runtime copies and reviewing key/IAM history would be a separate credential-management step. Return the property user to Restricted after submission, or remove it to revoke this identity's access to the property.

## Evidence and next priorities

Raw API/crawl evidence and the flagship CSV are local under `.analytics/seo-2026-10-26/`, excluded from Git and deployment. Publication/submission receipts are recorded below when completed. API credentials and tokens must not be copied into this document or the report.

1. Submit the corrected sitemap and verify Google's receipt; submission is a discovery hint, not an indexing guarantee.
2. Finish and verify the separately gated hosted-worker rollout before promoting the hosted downloader as operational.
3. Improve substantive desktop workflow guides that already receive impressions, particularly filename templates, CLI-vs-GUI and FFmpeg, with tested examples and relevant internal links. Avoid generating many near-identical platform pages.
4. Keep the winning comparison guide accurate using dated official sources. Measure changes against the baseline; 28-day comparisons are more useful here than daily swings on a small sample.
5. Validate conversion analytics separately before estimating ad revenue: Search Console cannot tell us total sessions or completed downloads.

Sources: [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query), [URL Inspection API](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect), [sitemap submission](https://developers.google.com/webmaster-tools/v1/sitemaps/submit), [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Search Console permissions](https://support.google.com/webmasters/answer/7687615?hl=en), [service-account key security](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys), [yt-dlp templates](https://github.com/yt-dlp/yt-dlp#output-template).

## Publication and submission receipt

- Published and promoted website deployment: `dpl_xuuVrifrnuCE4rDwAzugmQ7UPUto`, `https://halaldl-site-b1yykw6jq-halall-mans-projects.vercel.app`. Vercel inspection independently resolved `https://halaldl.vercel.app` to that deployment. Used Windows PowerShell and the existing named Windows Vercel environment credential; no Git push.
- Packaged-source SHA-256: `21d046f63193a03c0cd84fd79676cbfdab64bdf2e5147a4e7e13a0cef9fb0263`, 264 source files. The package excludes environment files, analytics exports and local diagnostics. The source is the preserved dirty working tree based on `0b218377ada069da2539969a6334d0b7328bcb77`; no exact new Git commit is implied. Previous public-only deployment retained: `dpl_j6sJ14RsWQmnyww1C3YdJuxFSaTh`. This content/metadata release has no additional database or worker changes.
- Local lint passed without warnings after excluding operational analytics artifacts. TypeScript/production build passed. Six fetch HTTP regression tests passed. Focused checks verified the 37-URL sitemap, account directives, robots output, real template examples, official source link and v0.6.1 guide-card destination. Rendered guide examples were checked at 1440 and 360 pixels with no overflowing cells.
- A complete post-publication crawl verified all 37 submitted URLs return 200 and their normalized canonicals match. Sitemap excludes the account page; account emits `noindex, follow` for general crawlers and Googlebot; robots excludes API routes. This is live technical verification, not proof that Google has reindexed the changes.
- Submitted `https://halaldl.vercel.app/sitemap.xml` at **20:26 PKT on 2026-10-26**. Google returned HTTP 204. An immediate list request returned HTTP 200 with that exact sitemap and `lastSubmitted=2026-10-26T15:26:09.926Z`, `isPending=true`, warnings=0 and errors=0. Pending processing means no final processing/indexing result is claimed.
- Evidence: `.analytics/seo-2026-10-26/audit-before.json`, `download-inspection.json`, `live-verification.json`, `sitemap-submission.json`, `source-receipt.json`, `flagship-baseline.csv` and before/after sitemap snapshots. No access token is recorded in those receipts.
- The owner was advised to return the property user to Restricted after submission, or remove it for complete property-access revocation. This grant change is a user action; it has not been performed by the agent.
