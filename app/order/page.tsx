import { Metadata } from "next";
import { OrderPageClient } from "./OrderPageClient";
import { OrderPageSEO } from "./OrderPageSEO";
import { getFeaturedTestimonials } from "@/app/utils/fetchTestimonials";

export const metadata: Metadata = {
  title: "Order Professional Cakes Online | Olgish Cakes Leeds",
  description:
    "Order premium Ukrainian cakes online in Leeds. Professional cake design, custom orders, wedding cakes, birthday cakes. Fast delivery, quality guaranteed. Order now!",
  keywords: [
    "order cakes online leeds",
    "ukrainian cake delivery leeds",
    "professional cake ordering",
    "custom cake orders leeds",
    "wedding cake orders",
    "birthday cake delivery",
    "honey cake order",
    "premium cake service leeds",
    "cake design consultation",
    "online cake shop leeds",
    "cake delivery yorkshire",
    "leeds cake shop",
    "west yorkshire cake delivery",
    "ukrainian bakery leeds",
    "custom cakes leeds",
    "wedding cakes leeds",
    "birthday cakes leeds",
    "honey cake leeds",
    "cake ordering leeds",
    "professional cake design leeds",
  ],
  openGraph: {
    title: "Order Professional Cakes Online | Olgish Cakes Leeds",
    description:
      "Order premium Ukrainian cakes online in Leeds. Professional cake design, custom orders, wedding cakes, birthday cakes. Fast delivery, quality guaranteed.",
    type: "website",
    locale: "en_GB",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "/images/olgish-cakes-logo-bakery-brand.png",
        width: 1200,
        height: 630,
        alt: "Order Professional Cakes Online - Olgish Cakes Leeds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Order Professional Cakes Online | Olgish Cakes Leeds",
    description:
      "Order premium Ukrainian cakes online in Leeds. Professional cake design, custom orders, wedding cakes, birthday cakes. Fast delivery, quality guaranteed.",
    images: ["/images/olgish-cakes-logo-bakery-brand.png"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/order",
    types: {
      "application/rss+xml": "https://olgishcakes.co.uk/feed.xml",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function OrderPage() {
  // Fetch testimonials server-side for better performance
  const testimonials = await getFeaturedTestimonials(3).catch(() => []);

  return (
    <>
      <OrderPageSEO />
      <OrderPageClient testimonials={testimonials} />
    </>
  );
}
