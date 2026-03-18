import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { getSiteUrl, SITE_LINKS } from "@/lib/site";

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
    default: "HalalDL | Windows-first yt-dlp GUI for local-first downloads",
    template: "%s | HalalDL",
  },
  description:
    "HalalDL is a Windows-first, local-first desktop GUI for yt-dlp with presets, visible raw logs, Full and Lite installers, and zero telemetry.",
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
  category: "software",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef4fb" },
    { media: "(prefers-color-scheme: dark)", color: "#09111c" },
  ],
};

const themeScript = `
  (() => {
    const storageKey = "halaldl-site-theme";
    try {
      const stored = window.localStorage.getItem(storageKey);
      const theme =
        stored === "light" || stored === "dark"
          ? stored
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} bg-paper font-sans text-ink antialiased`}
      >
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <div className="sr-only">
          Canonical downloads route: {SITE_LINKS.latestReleaseUrl}
        </div>
      </body>
    </html>
  );
}
