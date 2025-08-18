import { Metadata } from "next";
import { OrderPageClient } from "../OrderPageClient";

export const metadata: Metadata = {
  title: "Order Cakes Online Leeds | Ukrainian Bakery Leeds | Olgish Cakes",
  description:
    "Order premium Ukrainian cakes online in Leeds. Professional cake design, custom orders, wedding cakes, birthday cakes. Fast delivery across Leeds, West Yorkshire. Order now!",
  keywords: [
    "order cakes online leeds",
    "ukrainian bakery leeds",
    "cake delivery leeds",
    "wedding cakes leeds",
    "birthday cakes leeds",
    "honey cake leeds",
    "custom cakes leeds",
    "cake shop leeds",
    "leeds cake delivery",
    "ukrainian cake leeds",
    "professional cake design leeds",
    "cake ordering leeds",
    "leeds bakery",
    "west yorkshire cake delivery",
  ],
  openGraph: {
    title: "Order Cakes Online Leeds | Ukrainian Bakery Leeds | Olgish Cakes",
    description:
      "Order premium Ukrainian cakes online in Leeds. Professional cake design, custom orders, wedding cakes, birthday cakes. Fast delivery across Leeds, West Yorkshire.",
    type: "website",
    locale: "en_GB",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "/images/olgish-cakes-logo-bakery-brand.png",
        width: 1200,
        height: 630,
        alt: "Order Cakes Online Leeds - Ukrainian Bakery Leeds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Order Cakes Online Leeds | Ukrainian Bakery Leeds | Olgish Cakes",
    description:
      "Order premium Ukrainian cakes online in Leeds. Professional cake design, custom orders, wedding cakes, birthday cakes. Fast delivery across Leeds, West Yorkshire.",
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

export default async function LeedsOrderPage() {
  return <OrderPageClient />;
}
