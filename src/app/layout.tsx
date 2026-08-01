import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { PageViewTracker } from "@/components/analytics/tracked-interactions";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteUrl, SITE_LINKS } from "@/lib/site";
import {
  HOMEPAGE_OG_DESCRIPTION,
  HOMEPAGE_OG_TITLE,
  HOMEPAGE_TITLE,
  HOMEPAGE_TWITTER_DESCRIPTION,
  HOMEPAGE_TWITTER_TITLE,
  getSiteStructuredData,
  serializeJsonLd,
  SITE_DESCRIPTION,
} from "@/lib/seo";
import { getThemeScript, THEME_COLOR_DARK, THEME_COLOR_LIGHT } from "@/lib/theme";

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
    default: HOMEPAGE_TITLE,
    template: "%s | HalalDL",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "HalalDL",
    "yt-dlp GUI for Windows",
    "best yt-dlp GUI Windows",
    "Windows yt-dlp GUI",
    "free yt-dlp GUI",
    "local-first media downloader",
    "yt-dlp Windows app",
  ],
  applicationName: "HalalDL",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: HOMEPAGE_OG_TITLE,
    description: HOMEPAGE_OG_DESCRIPTION,
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
    title: HOMEPAGE_TWITTER_TITLE,
    description: HOMEPAGE_TWITTER_DESCRIPTION,
    images: ["/social/halaldl-social-preview.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/brand/icon-512.png", type: "image/png", sizes: "512x512" },
      {
        url: "/brand/icon-light.png",
        type: "image/png",
        sizes: "512x512",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/brand/icon-dark.png",
        type: "image/png",
        sizes: "512x512",
        media: "(prefers-color-scheme: dark)",
      },
      { url: "/brand/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  category: "software",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR_DARK },
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
        <ThemeProvider>{children}</ThemeProvider>
        <PageViewTracker />
        <SpeedInsights />
        <div className="sr-only">
          Canonical downloads route: {SITE_LINKS.latestReleaseUrl}
        </div>
      </body>
    </html>
  );
}
