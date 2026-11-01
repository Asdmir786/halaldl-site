import type { NextConfig } from "next";

const storageAccount = process.env.R2_ACCOUNT_ID?.trim();
const storageBucket = process.env.R2_BUCKET?.trim();
const storageHost = storageAccount && /^[a-f0-9]{32}$/.test(storageAccount) ? `${storageAccount}.r2.cloudflarestorage.com` : null;
const mediaOrigins = storageHost ? [`https://${storageHost}`] : [];
if (storageHost && storageBucket && /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(storageBucket)) mediaOrigins.push(`https://${storageBucket}.${storageHost}`);

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src https://challenges.cloudflare.com",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://challenges.cloudflare.com",
  `media-src ${["'self'", ...mediaOrigins].join(" ")}`,
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  },
] as const;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["3000-iwu4puvpeprf5t5da58px-d8369794.us2.manus.computer"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  async redirects() {
    return [
      { source: "/guides/pro-private-posts-and-stories", destination: "/guides/web-fetch", permanent: true },
      { source: "/guides/full-vs-lite", destination: "/compare/full-vs-lite", permanent: true },
      { source: "/guides/install-halaldl-windows", destination: "/install/windows", permanent: true },
      { source: "/guides/verify-sha256-smartscreen", destination: "/trust/verify-checksum", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default nextConfig;
