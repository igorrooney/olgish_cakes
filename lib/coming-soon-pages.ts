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
  "custom-cakes": {
    path: "/custom-cakes",
    eyebrow: "Custom cakes",
    title: "Custom cake details are coming soon",
    description:
      "This page is being prepared. For now you can browse the current celebration range or send a short brief if you already know the kind of cake you need.",
    body: "I am still building out the gallery, pricing notes, and planning advice for bespoke cakes. Until that is ready, the quickest route is to look at the current cake range or send a brief with your date, size, and style.",
    bullets: [
      "Browse the current cake range to see sizes, finishes, and flavour direction.",
      "Use the quote form if you already have a date, servings, or a rough design idea.",
      "Read the blog if you want help choosing between postal cake and a local custom order.",
    ],
    links: [
      { href: "/cakes", label: "Browse celebration cakes", variant: "primary" },
      { href: "/get-custom-quote#quote-form", label: "Send a custom brief", variant: "secondary" },
      { href: "/blog", label: "Read the blog", variant: "secondary" },
    ],
  },
  "farmers-markets": {
    path: "/farmers-markets",
    eyebrow: "Farmers markets",
    title: "Market dates and visit details are coming soon",
    description:
      "This page will list the markets, dates, and practical visit notes once the next schedule is confirmed.",
    body: "I am still putting together the full market calendar and what I bring to each stall. Until that is live, the easiest way to keep up is through the blog or by getting in touch directly.",
    bullets: [
      "The market calendar will include dates, locations, and what is usually available on the stall.",
      "Postal cakes and local collection options are already live if you need to order before the schedule is published.",
      "If you are planning ahead for an event, contact me and I can tell you what is realistic.",
    ],
    links: [
      { href: "/contact", label: "Ask about the next market", variant: "primary" },
      { href: "/cakes-by-post", label: "Order cakes by post", variant: "secondary" },
      { href: "/blog", label: "Read bakery notes", variant: "secondary" },
    ],
  },
  allergens: {
    path: "/allergens",
    eyebrow: "Allergens",
    title: "Detailed allergen guidance is coming soon",
    description:
      "This page is being prepared so ingredient and allergen notes are easier to find before you order.",
    body: "Allergen questions need careful, specific answers. I am putting together a clearer page that explains how I handle common ingredients, what can and cannot be adapted, and when it is better to ask directly before ordering.",
    bullets: [
      "If you have a live allergen question, contact me before placing the order.",
      "Custom cakes often depend on the exact brief, finish, and kitchen timing, so it is better to ask than assume.",
      "Postal cake guides are still useful for understanding which formats are most straightforward.",
    ],
    links: [
      { href: "/contact", label: "Ask about allergens", variant: "primary" },
      { href: "/get-custom-quote#quote-form", label: "Send a cake brief", variant: "secondary" },
      { href: "/blog", label: "Read bakery guides", variant: "secondary" },
    ],
  },
  ingredients: {
    path: "/ingredients",
    eyebrow: "Ingredients",
    title: "Ingredient notes and sourcing details are coming soon",
    description:
      "I am still putting together a cleaner page for ingredients, flavour notes, and the bakery staples that shape the cakes.",
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
