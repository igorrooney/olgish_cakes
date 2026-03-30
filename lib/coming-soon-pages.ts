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
  faqs: {
    path: "/faqs",
    eyebrow: "FAQs",
    title: "The full FAQ page is on the way",
    description:
      "I am collecting the questions that come up most often about ordering, delivery, allergens, and custom cakes so they can live in one place.",
    body: "The proper FAQ page is being written from real customer questions rather than a generic template. In the meantime, the links below will get you to the pages people usually need first.",
    bullets: [
      "Delivery-friendly orders are covered on the cakes-by-post range and in the blog.",
      "Custom cake requests can go straight through the quote form with as much detail as you have.",
      "If you need a direct answer now, contact me and I will point you to the right option.",
    ],
    links: [
      { href: "/contact", label: "Contact the bakery", variant: "primary" },
      { href: "/cakes-by-post", label: "See cakes by post", variant: "secondary" },
      { href: "/blog", label: "Read practical guides", variant: "secondary" },
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
  delivery: {
    path: "/delivery",
    eyebrow: "Delivery and returns",
    title: "Delivery guidance is being written up properly",
    description:
      "I am turning the day-to-day delivery notes into a clearer page covering dispatch timing, local orders, and what to do if something arrives damaged.",
    body: "A proper delivery page needs practical detail, not filler. I am still writing the version that reflects how postal orders, local cakes, and timing around weekends actually work in the bakery.",
    bullets: [
      "Postal cake timing is covered in the blog if you need help working backwards from an occasion date.",
      "If your order is local and bespoke, the quote form is still the best place to start.",
      "Contact me directly if you need an answer about a live order rather than general guidance.",
    ],
    links: [
      {
        href: "/blog/cake-by-post-uk-complete-guide",
        label: "Read the postal cake guide",
        variant: "primary",
      },
      {
        href: "/get-custom-quote#quote-form",
        label: "Ask about a custom cake",
        variant: "secondary",
      },
      { href: "/contact", label: "Contact the bakery", variant: "secondary" },
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

const learnRootComingSoonPage: ComingSoonPageContent = {
  path: "/learn",
  eyebrow: "Learn hub",
  title: "The learn hub is being assembled",
  description:
    "This section will bring together practical guides, workshop information, and customer stories in one place. The structure is being prepared now.",
  body: "I would rather launch this section once it has real substance than fill it with thin placeholder copy. For now, the live blog is the best place to read the practical side of ordering, gifting, and planning a celebration cake.",
  bullets: [
    "Guides will cover postal cake decisions, timing, and choosing between delivery-friendly and bespoke orders.",
    "Workshops will be listed here once dates and formats are finalised.",
    "Customer stories will sit here once I have the right mix of real occasions and useful detail.",
  ],
  links: [
    { href: "/blog", label: "Read the blog", variant: "primary" },
    { href: "/cakes-by-post", label: "Browse cakes by post", variant: "secondary" },
    { href: "/contact", label: "Contact the bakery", variant: "secondary" },
  ],
};

const learnSectionComingSoonPages: Record<string, ComingSoonPageContent> = {
  guides: {
    path: "/learn/guides",
    eyebrow: "Learn hub",
    title: "More practical guides are coming soon",
    description:
      "This section will collect the most useful ordering and celebration-planning guides in one place. I am still shaping it around real questions from customers.",
    body: "The blog already covers the core questions people ask first. This dedicated guides section will make those notes easier to browse once the structure is ready.",
    bullets: [
      "Start with the postal cake guide if timing and delivery are the main question.",
      "Use the archive if you are comparing postal cake with a local bespoke order.",
      "Get in touch if you need a recommendation for a live occasion rather than a general read.",
    ],
    links: [
      { href: "/blog", label: "Browse live guides", variant: "primary" },
      {
        href: "/blog/cake-by-post-uk-complete-guide",
        label: "Read the postal cake guide",
        variant: "secondary",
      },
      { href: "/contact", label: "Ask a question", variant: "secondary" },
    ],
  },
  workshops: {
    path: "/learn/workshops",
    eyebrow: "Learn hub",
    title: "Workshop details are coming soon",
    description:
      "Workshop information will be published here once formats, dates, and locations are confirmed.",
    body: "I am still working out the right structure for workshops so the page is useful when it goes live. Until then, the bakery is open for orders and direct enquiries rather than workshop bookings.",
    bullets: [
      "When workshops launch, this page will cover format, level, and how to book.",
      "If you want to hear about workshops first, contact me and I can keep your details.",
      "Cake orders and quotes are already live through the usual pages.",
    ],
    links: [
      { href: "/contact", label: "Ask about workshops", variant: "primary" },
      { href: "/cakes", label: "Browse celebration cakes", variant: "secondary" },
      { href: "/blog", label: "Read the blog", variant: "secondary" },
    ],
  },
  "customer-stories": {
    path: "/learn/customer-stories",
    eyebrow: "Learn hub",
    title: "Customer stories are being gathered",
    description:
      "This page will eventually share real occasions, order decisions, and what made the cake right for the moment. I am still curating the first set properly.",
    body: "Customer stories need enough detail to be worth reading. I am still choosing which occasions to publish so the page feels honest and useful rather than padded out.",
    bullets: [
      "The blog already covers the decision side of choosing a cake for birthdays, gifts, and delivery by post.",
      "If you are planning something similar, the current cake range will show what is available now.",
      "For a one-off celebration, send a brief and I can tell you what makes sense.",
    ],
    links: [
      {
        href: "/blog/how-surprise-someone-cake-delivery-post",
        label: "Read a gifting guide",
        variant: "primary",
      },
      { href: "/cakes", label: "Browse celebration cakes", variant: "secondary" },
      { href: "/get-custom-quote#quote-form", label: "Send a brief", variant: "secondary" },
    ],
  },
};

export function getTopLevelComingSoonPage(slug: string) {
  return topLevelComingSoonPages[slug] ?? null;
}

export function getLearnComingSoonPage(slug?: string[]) {
  if (!slug || slug.length === 0) {
    return learnRootComingSoonPage;
  }

  if (slug.length !== 1) {
    return null;
  }

  return learnSectionComingSoonPages[slug[0]] ?? null;
}

export function getComingSoonMetadata(page: ComingSoonPageContent): Metadata {
  const canonicalUrl = `${BUSINESS_CONSTANTS.BASE_URL}${page.path}`;
  const title = page.title;

  return {
    title,
    description: page.description,
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
