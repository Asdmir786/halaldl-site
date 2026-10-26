import type { GuideArticle } from "@/lib/guides/types";

const cta = { label: "Paste a link", href: "/fetch", eventCta: "open_web_fetch" as const };

export const webFetchArticle: GuideArticle = {
  slug: "web-fetch",
  faqs: [
    { question: "Do I install anything?", answer: "No. /fetch runs in the browser. The Windows app is a separate download for people who want the file saved on their own PC." },
    { question: "How many links can I paste?", answer: "50 confirmed saves a day with no account, one at a time. A Google sign-in raises that to 75 a day and three links at a time." },
  ],
  blocks: [
    { type: "paragraph", text: "Paste one public link into /fetch, then choose a video quality or original audio format. Some sources may have temporary issues; try again later if a download fails. Completed files expire after six hours." },
    { type: "heading", level: 2, id: "steps", text: "Three steps" },
    { type: "list", ordered: true, items: ["Copy a public video or post link.", "Paste it, confirm you can save it, and pass the check.", "Pick the resolution. The highest one is already selected. Then save the file."] },
    { type: "heading", level: 2, id: "which-link", text: "Which links work" },
    { type: "paragraph", text: "You can try public links from YouTube, Instagram, TikTok, Facebook, X, Reddit, Vimeo, Dailymotion and SoundCloud. Results depend on the source and may vary. Playlists, channels, profiles, Stories and photo collections are not supported on the web." },
    { type: "cta", cta },
  ],
};

export const youtubeFetchArticle: GuideArticle = {
  slug: "save-public-youtube-video",
  faqs: [
    { question: "Can I paste a playlist?", answer: "No. Paste the watch link, the Shorts link, or the youtu.be link for one video. A playlist or channel URL is refused." },
    { question: "Can I try YouTube in the web tool?", answer: "Yes. Paste one public video link. YouTube may have download or verification issues, so a request may not finish. Try again later or use the Windows app." },
  ],
  blocks: [
    { type: "paragraph", text: "Paste one public YouTube video link into /fetch. Some videos may have download or verification issues. If the request fails, try again later or use the Windows app. Only save media you have permission to download." },
    { type: "heading", level: 2, id: "copy", text: "Copy the single video" },
    { type: "list", items: ["On a normal video, the link contains watch?v=.", "On a Short, the link contains /shorts/.", "A youtu.be link is also one video.", "If the link is /playlist or a channel page, it will be refused."] },
    { type: "heading", level: 2, id: "save", text: "Save it" },
    { type: "paragraph", text: "Paste the public link into /fetch, confirm that you have the right to save it, and choose a quality. The Windows app is another option if the web request has issues." },
    { type: "cta", cta },
  ],
};

export const instagramFetchArticle: GuideArticle = {
  slug: "save-public-instagram-post",
  faqs: [
    { question: "Does a carousel count as one link?", answer: "No. Use a single public video or Reel. Photo posts and carousels are not supported." },
    { question: "What about a story?", answer: "Only supported public links are available. Stories, private posts, and login-protected media are not supported." },
  ],
  blocks: [
    { type: "paragraph", text: "Try one public Instagram video or Reel in /fetch. Some links may have download or verification issues; try again later if the request fails. Private posts and Stories are not supported by the web tool." },
    { type: "heading", level: 2, id: "copy", text: "Copy the post, not the profile" },
    { type: "list", items: ["Open the post or Reel.", "Use Share, then Copy link.", "The link should contain /p/ or /reel/.", "A profile URL, a highlight tray, or a /stories/ link is not this job."] },
    { type: "heading", level: 2, id: "carousel", text: "Carousels" },
    { type: "paragraph", text: "Choose a link to one video or Reel. Photo posts and carousels are not supported." },
    { type: "cta", cta },
  ],
};

export const tiktokFetchArticle: GuideArticle = {
  slug: "save-public-tiktok",
  faqs: [
    { question: "Can I paste a profile?", answer: "No. Paste one video link. A profile or a sound page is refused." },
    { question: "Can I try TikTok in the web tool?", answer: "Yes. Paste one public video link into /fetch. Some sources may have temporary issues, so try again later if the download fails." },
  ],
  blocks: [
    { type: "paragraph", text: "Copy one public TikTok video link and try it in /fetch. Some links may have download issues. Only save media you have permission to download." },
    { type: "heading", level: 2, id: "copy", text: "Copy one video" },
    { type: "list", ordered: true, items: ["Open the public video.", "Tap Share, then Copy link.", "Paste the link into /fetch.", "Choose a quality and prepare the file."] },
    { type: "heading", level: 2, id: "phone", text: "On a phone" },
    { type: "paragraph", text: "Open /fetch in your phone browser and paste the public video link. If the source has issues, keep the link and try again later." },
    { type: "cta", cta },
  ],
};

export const facebookFetchArticle: GuideArticle = {
  slug: "save-public-facebook-video",
  faqs: [
    { question: "Which Facebook link?", answer: "One public video or fb.watch link. Private posts and groups that require membership are not supported." },
  ],
  blocks: [
    { type: "paragraph", text: "Try one public Facebook video in /fetch. Some links may have download or verification issues. Only save media you have permission to download." },
    { type: "list", ordered: true, items: ["Open the single public video.", "Copy its video link.", "Paste it into /fetch and choose a quality."] },
    { type: "cta", cta },
  ],
};

export const otherFetchArticle: GuideArticle = {
  slug: "save-public-x-reddit-vimeo",
  faqs: [
    { question: "Which sources can I try?", answer: "You can try public links from X, Reddit, Vimeo, Dailymotion and SoundCloud. Some sources may have temporary issues. Check Supported links and limits on /fetch for accepted link types." },
  ],
  blocks: [
    { type: "paragraph", text: "Paste one public video or original audio link into /fetch. You can try X, Reddit, Vimeo, Dailymotion and SoundCloud. Some sources may have temporary issues; try again later if a request fails." },
    { type: "heading", level: 2, id: "examples", text: "What to copy" },
    { type: "list", items: ["X: one post permalink.", "Reddit: one post, including a v.redd.it link.", "Vimeo: one video, not a showcase.", "Dailymotion: one video or a dai.ly link.", "SoundCloud: one track."] },
    { type: "cta", cta },
  ],
};
