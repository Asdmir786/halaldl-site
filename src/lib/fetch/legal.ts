export const LEGAL_PAGES = {
  terms: {
    title: "Terms",
    description: "Rules for using the HalalDL desktop site and the hosted web fetch tool.",
    paragraphs: [
      "The desktop app is a local Windows program. These terms also cover the hosted web tool at /fetch.",
      "You may submit only media you have the right to access and save. A checkbox on the form records that confirmation with the job.",
      "The web tool accepts supported public links only. Stories, private posts, platform cookies and personal proxies are not supported.",
      "Daily limits, resolution caps, file size caps, and the server-wide queue are enforced by the server. A browser extension or a copied request cannot raise them.",
      "Finished files are deleted about six hours after they are ready. The job record, including the URL, is kept for 30 days.",
      "These terms govern use of this site. They do not grant you a license to someone else's content, and they do not change YouTube, Instagram, or any other platform's rules.",
    ],
  },
  privacy: {
    title: "Privacy",
    description: "What the web fetch tool stores about a browser session, a Google sign-in, and a job.",
    paragraphs: [
      "The desktop app does not send an account or a media URL to this site. The web tool is separate.",
      "An anonymous browser gets an HTTP-only session cookie. A new tab in the same browser uses the same allowance. Signing in with Google attaches that session to the Google account.",
      "A job record stores the URL, platform, size, result, and the rights confirmation for 30 days. The media file itself is deleted about six hours after it is ready.",
      "Cloudflare Turnstile runs on the web tool page and again when a link or resolution is submitted. The secret that checks those tokens stays on the server.",
      "Abuse prevention uses a keyed hash of your connection IP. Request counters expire after one day; admitted-job records follow the 30-day retention period.",
      "The marketing pages may use privacy-limited analytics. Those events do not include media URLs.",
    ],
  },
  "acceptable-use": {
    title: "Acceptable use",
    description: "What the web fetch tool will refuse.",
    paragraphs: [
      "Submit one public post or video per link. Playlists, channels, and unknown sites are refused.",
      "Submit a single video or audio item. Photo posts, carousels and collections are not supported.",
      "Do not submit platform passwords, session cookies or proxy credentials.",
      "Do not try to bypass the daily limit, the active-link limit, or the server-wide ceiling by scripting the API.",
      "When the Contabo worker is at its CPU, memory, disk, or queue ceiling, new work waits. Running jobs finish.",
      "We may fail a job, delete a file, or flag a record when a platform refuses the request or when a takedown arrives.",
    ],
  },
  copyright: {
    title: "Copyright",
    description: "How to send a takedown for a file created by the web fetch tool.",
    paragraphs: [
      "The web tool makes a short-lived copy because someone submitted a link and confirmed they had the right to save it. That confirmation is not a license from the rights holder.",
      "Ordinary files are deleted about six hours after they are ready. Flagged files become inaccessible immediately and follow the same deletion deadline.",
      "Send a takedown to the address published with this site's GitHub support page, and include the URL, the time, and why you are the rights holder or their agent.",
      "A valid notice pulls the file off the download path and flags the job record.",
    ],
  },
} as const;

export type LegalSlug = keyof typeof LEGAL_PAGES;
