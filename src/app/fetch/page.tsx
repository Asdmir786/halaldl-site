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
    </ToolPageShell>
  );
}
