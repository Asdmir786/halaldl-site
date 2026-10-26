import type { Metadata } from "next";
import Script from "next/script";
import { FetchTool } from "@/components/fetch/fetch-tool";
import { ToolPageShell } from "@/components/fetch/tool-page-shell";

export const metadata: Metadata = {
  title: { absolute: "Online video downloader — HalalDL" },
  description: "Paste a supported public link, choose a quality, and download your file. No installation required.",
  alternates: { canonical: "/fetch" },
};

export default function FetchPage() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  return (
    <ToolPageShell currentPage="fetch" title="Download a video from a link" lede="Paste a public link, choose a quality, and download your file.">
      {siteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" /> : null}
      <FetchTool siteKey={siteKey} />
      <section className="mt-12 border-t border-line pt-7" aria-label="How to download">
        <ol className="grid gap-6 sm:grid-cols-3">
          {[ ["Copy a link", "Use the share link for one public video."], ["Choose a quality", "Check the file type and estimated size."], ["Download your file", "Keep this page open while it prepares."] ].map(([title, text], i) => (
            <li key={title}><span className="text-xs font-semibold text-mint-strong">0{i + 1}</span><h2 className="mt-2 text-sm font-semibold text-ink">{title}</h2><p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p></li>
          ))}
        </ol>
      </section>
    </ToolPageShell>
  );
}
