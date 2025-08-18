import { Metadata } from "next";
import { OrderPageClient } from "../OrderPageClient";

export const metadata: Metadata = {
  title: "Order Cakes Online Leeds | Fast Mobile Ordering | Olgish Cakes",
  description:
    "Order premium Ukrainian cakes online in Leeds with fast mobile ordering. Professional cake design, custom orders, wedding cakes, birthday cakes. Optimized for mobile.",
  keywords: [
    "order cakes online leeds mobile",
    "fast cake ordering leeds",
    "mobile cake shop leeds",
    "ukrainian cake delivery leeds",
    "professional cake ordering mobile",
    "custom cake orders leeds",
    "wedding cake orders mobile",
    "birthday cake delivery leeds",
    "honey cake order mobile",
    "premium cake service leeds",
  ],
  openGraph: {
    title: "Order Cakes Online Leeds | Fast Mobile Ordering | Olgish Cakes",
    description:
      "Order premium Ukrainian cakes online in Leeds with fast mobile ordering. Professional cake design, custom orders, wedding cakes, birthday cakes. Optimized for mobile.",
    type: "website",
    locale: "en_GB",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "/images/olgish-cakes-logo-bakery-brand.png",
        width: 1200,
        height: 630,
        alt: "Order Cakes Online Leeds - Fast Mobile Ordering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Order Cakes Online Leeds | Fast Mobile Ordering | Olgish Cakes",
    description:
      "Order premium Ukrainian cakes online in Leeds with fast mobile ordering. Professional cake design, custom orders, wedding cakes, birthday cakes. Optimized for mobile.",
    images: ["/images/olgish-cakes-logo-bakery-brand.png"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/order",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function AmpOrderPage() {
  return (
    <>
      {/* AMP-specific optimizations */}
      <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
      <meta name="format-detection" content="telephone=no" />

      <OrderPageClient />
    </>
  );
}
