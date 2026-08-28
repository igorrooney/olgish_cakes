import type { Metadata } from "next";
import { BUSINESS_CONSTANTS } from "@/lib/constants";

export interface ComingSoonPageLink {
  href: string;
  label: string;
  variant: "primary" | "secondary";
}

export interface ComingSoonPageContent {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  bullets: string[];
  links: ComingSoonPageLink[];
}

export const topLevelComingSoonPages: Record<string, ComingSoonPageContent> = {
  "farmers-markets": {
    path: "/farmers-markets",
    eyebrow: "Farmers markets",
    title: "Market dates and visit details are coming soon",
    description:
      "This page will list the markets, dates, and practical visit notes once the next schedule is confirmed.",
    body: "We are still putting together the full market calendar and what we bring to each stall. Until that is live, the easiest way to keep up is through the blog or by getting in touch directly.",
    bullets: [
      "The market calendar will include dates, locations, and what is usually available on the stall.",
      "Postal cakes and local collection options are already live if you need to order before the schedule is published.",
      "If you are planning ahead for an event, contact us and we can tell you what is realistic.",
    ],
    links: [
      { href: "/contact", label: "Ask about the next market", variant: "primary" },
      { href: "/cakes-by-post", label: "Order cakes by post", variant: "secondary" },
      { href: "/blog", label: "Read bakery notes", variant: "secondary" },
    ],
  },
  ingredients: {
    path: "/ingredients",
    eyebrow: "Ingredients",
    title: "Ingredient notes and sourcing details are coming soon",
    description:
      "We are still putting together a cleaner page for ingredients, flavour notes, and the bakery staples that shape the cakes.",
    body: "This page will cover the ingredients and flavour approach in a more useful way than a generic list. Until that is live, the quickest way to understand the cakes is to browse the range or read the bakery notes in the blog.",
    bullets: [
      "Cake pages already show the current range and give you a feel for flavours and finishes.",
      "The blog covers what travels well by post and why some formats behave better than others.",
      "If you need a direct answer about a specific ingredient, send a message before ordering.",
    ],
    links: [
      { href: "/cakes", label: "Browse the cake range", variant: "primary" },
      {
        href: "/blog/best-cakes-you-can-send-by-post-uk",
        label: "Read what travels well",
        variant: "secondary",
      },
      { href: "/contact", label: "Ask a question", variant: "secondary" },
    ],
  },
};

export function getTopLevelComingSoonPage(slug: string) {
  return topLevelComingSoonPages[slug] ?? null;
}

export function getComingSoonMetadata(page: ComingSoonPageContent): Metadata {
  const canonicalUrl = `${BUSINESS_CONSTANTS.BASE_URL}${page.path}`;
  const title = page.title;

  return {
    title,
    description: page.description,
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: page.description,
      type: "website",
      url: canonicalUrl,
      siteName: BUSINESS_CONSTANTS.NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
    },
  };
}
