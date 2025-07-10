"use client";

/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 */

import { NextStudio } from "next-sanity/studio";
import config from "../../sanity.config";
import Script from "next/script";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanity Studio - Olgish Cakes CMS",
  description:
    "Content management system for Olgish Cakes website. Manage cakes, testimonials, and website content.",
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/studio",
  },
  openGraph: {
    title: "Sanity Studio - Olgish Cakes CMS",
    description:
      "Content management system for Olgish Cakes website. Manage cakes, testimonials, and website content.",
    url: "https://olgish-cakes.vercel.app/studio",
    siteName: "Olgish Cakes",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioPage() {
  return (
    <>
      <Script
        id="studio-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Sanity Studio - Olgish Cakes CMS",
            description: "Content management system for Olgish Cakes website.",
            url: "https://olgish-cakes.vercel.app/studio",
            applicationCategory: "Content Management System",
            operatingSystem: "Web Browser",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "GBP",
            },
            author: {
              "@type": "Organization",
              name: "Olgish Cakes",
            },
          }),
        }}
      />
      <NextStudio config={config} />
    </>
  );
}
