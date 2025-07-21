import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanity Studio | Olgish Cakes",
  description: "Content management system for Olgish Cakes website.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Sanity Studio | Olgish Cakes",
    description: "Content management system for Olgish Cakes website.",
    url: "https://olgishcakes.co.uk/studio",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/studio.jpg",
        width: 1200,
        height: 630,
        alt: "Sanity Studio - Olgish Cakes CMS",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanity Studio | Olgish Cakes",
    description: "Content management system for Olgish Cakes website.",
    images: ["https://olgishcakes.co.uk/images/studio.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/studio",
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
