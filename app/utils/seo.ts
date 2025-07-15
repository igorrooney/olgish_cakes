/**
 * SEO utility functions for Olgish Cakes
 */

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0 ? truncated.substring(0, lastSpace) + "..." : truncated + "...";
}

export function generateMetaTitle(title: string, siteName = "Olgish Cakes"): string {
  const maxLength = 60;
  const separator = " | ";
  const availableLength = maxLength - separator.length - siteName.length;

  if (title.length <= availableLength) {
    return `${title}${separator}${siteName}`;
  }

  return `${truncateText(title, availableLength)}${separator}${siteName}`;
}

export function generateMetaDescription(description: string): string {
  return truncateText(description, 160);
}

export function generateKeywords(
  baseKeywords: string[],
  additionalKeywords: string[] = []
): string {
  const allKeywords = [...baseKeywords, ...additionalKeywords];
  return allKeywords.join(", ");
}

export function generateCanonicalUrl(path: string, domain = "https://olgishcakes.co.uk"): string {
  return `${domain}${path.startsWith("/") ? path : `/${path}`}`;
}

export function generateOpenGraphImage(
  imageUrl: string,
  title: string,
  width = 1200,
  height = 630
): {
  url: string;
  width: number;
  height: number;
  alt: string;
  type: string;
} {
  return {
    url: imageUrl,
    width,
    height,
    alt: `${title} - Traditional Ukrainian honey cake by Olgish Cakes`,
    type: "image/jpeg",
  };
}

export function generateBreadcrumbData(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Olgish Cakes",
    url: "https://olgishcakes.co.uk",
    logo: "https://olgishcakes.co.uk/logo.png",
    description:
      "Authentic Ukrainian honey cakes made with love in Leeds. Traditional recipes, premium ingredients, and exceptional taste.",
    telephone: "+44 786 721 8194",
    email: "olgish.cakes@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "107 Harehills Lane",
      addressLocality: "Leeds",
      postalCode: "LS8 4DN",
      addressRegion: "West Yorkshire",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "53.8008",
      longitude: "-1.5491",
    },
    sameAs: [
      "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
      "https://www.instagram.com/olgish_cakes/",
    ],
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Olgish Cakes",
    url: "https://olgishcakes.co.uk",
    description: "Authentic Ukrainian honey cakes and traditional pastries made fresh in Leeds",
    telephone: "+44 786 721 8194",
    email: "olgish.cakes@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "107 Harehills Lane",
      addressLocality: "Leeds",
      postalCode: "LS8 4DN",
      addressRegion: "West Yorkshire",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "53.8008",
      longitude: "-1.5491",
    },
    openingHours: "Mo-Su 09:00-18:00",
    priceRange: "££",
    servesCuisine: ["Ukrainian", "European"],
    hasMenu: "https://olgishcakes.co.uk/cakes",
    areaServed: [
      {
        "@type": "City",
        name: "Leeds",
      },
      {
        "@type": "City",
        name: "York",
      },
      {
        "@type": "City",
        name: "Bradford",
      },
      {
        "@type": "City",
        name: "Halifax",
      },
      {
        "@type": "City",
        name: "Huddersfield",
      },
    ],
  };
}

export function generateFAQSchema(questions: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  url: string;
  price: number;
  currency?: string;
  availability?: string;
  brand?: string;
  category?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    brand: {
      "@type": "Brand",
      name: product.brand || "Olgish Cakes",
    },
    category: product.category || "Ukrainian Honey Cake",
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "GBP",
      availability: product.availability || "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
      },
    },
    ...(product.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.aggregateRating.ratingValue,
        reviewCount: product.aggregateRating.reviewCount,
      },
    }),
  };
}
