import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { getSiteUrl, SITE_LINKS } from "@/lib/site";
import { getSiteStructuredData, serializeJsonLd, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { getThemeScript } from "@/lib/theme";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: `${SITE_NAME} | Windows-first yt-dlp GUI for local-first downloads`,
    template: "%s | HalalDL",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "HalalDL",
    "Windows yt-dlp GUI",
    "local-first desktop downloader",
    "open source downloader for Windows",
    "yt-dlp Windows app",
  ],
  applicationName: "HalalDL",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "HalalDL | Windows-first yt-dlp GUI for local-first downloads",
    description:
      "Local-first desktop downloads with presets, visible raw logs, and practical install choices.",
    siteName: "HalalDL",
    images: [
      {
        url: "/social/halaldl-social-preview.png",
        width: 1280,
        height: 640,
        alt: "HalalDL landing page social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HalalDL | Windows-first yt-dlp GUI",
    description:
      "Local-first desktop downloads with presets, visible raw logs, and practical install choices.",
    images: ["/social/halaldl-social-preview.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/icon.png", type: "image/png" },
    ],
    apple: "/brand/icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  category: "software",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#080e17" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteStructuredData = getSiteStructuredData();

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} bg-paper font-sans text-ink antialiased`}
      >
        <Script id="theme-script" strategy="beforeInteractive">
          {getThemeScript()}
        </Script>
        {siteStructuredData.map((schema, index) => (
          <script
            key={schema["@id"] ?? index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
          />
        ))}
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
        <div className="sr-only">
          Canonical downloads route: {SITE_LINKS.latestReleaseUrl}
        </div>
      </body>
    </html>
  );
}
