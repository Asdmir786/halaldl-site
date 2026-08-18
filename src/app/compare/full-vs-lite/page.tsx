import type { Metadata } from "next";
import { BuildComparisonContent } from "@/components/compare/build-comparison-content";
import { getGitHubSnapshot } from "@/lib/github";
import { getSocialImage } from "@/lib/site";
import { getBreadcrumbSchema, serializeJsonLd } from "@/lib/seo";

const FULL_VS_LITE_META_TITLE = "HalalDL Full vs Lite vs Portable — Windows Build Comparison";
const FULL_VS_LITE_META_DESCRIPTION =
  "Compare HalalDL Full, Lite, and Portable builds for Windows. See which option fits your setup, toolchain responsibility, portability, and update path.";

export const metadata: Metadata = {
  title: { absolute: FULL_VS_LITE_META_TITLE },
  description: FULL_VS_LITE_META_DESCRIPTION,
  alternates: { canonical: "/compare/full-vs-lite" },
  openGraph: {
    title: FULL_VS_LITE_META_TITLE,
    description: FULL_VS_LITE_META_DESCRIPTION,
    url: "/compare/full-vs-lite",
    type: "article",
    siteName: "HalalDL",
    images: getSocialImage("HalalDL Full Lite and Portable comparison page social preview"),
  },
  twitter: {
    card: "summary_large_image",
    title: FULL_VS_LITE_META_TITLE,
    description: FULL_VS_LITE_META_DESCRIPTION,
    images: ["/social/halaldl-social-preview.png"],
  },
};

export default async function FullVsLitePage() {
  const github = await getGitHubSnapshot();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which build should most people use?",
        acceptedAnswer: { "@type": "Answer", text: "Most people should use the Full build because it provides the smoother first-run path." },
      },
      {
        "@type": "Question",
        name: "When should I choose Lite?",
        acceptedAnswer: { "@type": "Answer", text: "Choose Lite when you already prefer managing more of the yt-dlp, ffmpeg, aria2, or related toolchain boundary yourself." },
      },
      {
        "@type": "Question",
        name: "When should I choose Portable?",
        acceptedAnswer: { "@type": "Answer", text: "Choose Portable when you prefer a self-contained app folder and are comfortable replacing that folder manually when you update." },
      },
    ],
  };
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Full vs Lite", path: "/compare/full-vs-lite" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <BuildComparisonContent github={github} />
    </>
  );
}
