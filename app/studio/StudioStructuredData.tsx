"use client";

import Script from "next/script";

export default function StudioStructuredData() {
  return (
    <Script
      id="studio-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Sanity Studio - Olgish Cakes CMS",
          description: "Content management system for Olgish Cakes website.",
          url: "https://olgishcakes.co.uk/studio",
          applicationCategory: "Content Management System",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: 0,
            priceCurrency: "GBP",
          },
          author: {
            "@type": "Organization",
            name: "Olgish Cakes",
          },
        }),
      }}
    />
  );
}
