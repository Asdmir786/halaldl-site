import Script from "next/script";

const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!measurementId || !MEASUREMENT_ID_PATTERN.test(measurementId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
