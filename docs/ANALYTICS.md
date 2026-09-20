# Website analytics contract

HalalDL's desktop application does not send usage telemetry. The public website
can optionally load Google Analytics when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
to a valid `G-...` measurement ID.

The analytics adapter is limited to product-funnel metadata. Custom events must
never include media URLs, filenames, local paths, clipboard content, download
history, logs, or other user-provided media data.

## Events

| Event | Properties | Purpose |
| --- | --- | --- |
| `download_cta_click` | `cta`, `surface` | Measure movement from guides to the download path. |
| `download_channel_select` | `channel`, `surface` | Measure Full, Lite, Portable, and checksum choices. |
| `comparison_interaction` | `action`, `surface`, optional `tool` | Measure comparison-page interactions without user content. |
| `open_in_app_click` | `surface` | Reserved for the approved website-to-desktop handoff. |
| `extension_interest_click` | `surface`, optional `browser` | Reserved for the approved browser-extension work. |

Google Signals and ad-personalization signals are disabled by the site
integration. When the environment variable is omitted, no Google Analytics
script is rendered and tracked links continue to work normally.
