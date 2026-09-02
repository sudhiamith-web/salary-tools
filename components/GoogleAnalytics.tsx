"use client";

import Script from "next/script";

// Reads the GA4 Measurement ID from an environment variable so the ID
// isn't hardcoded in the repo. Set NEXT_PUBLIC_GA_ID in Netlify's
// environment variables (and in .env.local for local dev).
//
// If the variable isn't set, nothing renders — so local development and
// preview builds don't pollute your analytics with test traffic.

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
