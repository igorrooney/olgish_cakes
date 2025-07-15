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

// Enhanced SEO functions for better optimization

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Olgish Cakes",
    url: "https://olgishcakes.co.uk",
    description: "Authentic Ukrainian honey cakes and traditional pastries made fresh in Leeds",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://olgishcakes.co.uk/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateWebPageSchema(page: {
  name: string;
  description: string;
  url: string;
  breadcrumb?: Array<{ name: string; url: string }>;
  mainEntity?: any;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.name,
    description: page.description,
    url: page.url,
    ...(page.breadcrumb && {
      breadcrumb: generateBreadcrumbData(page.breadcrumb),
    }),
    ...(page.mainEntity && {
      mainEntity: page.mainEntity,
    }),
  };
}

export function generateAggregateRatingSchema(rating: number, reviewCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: rating,
    reviewCount: reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

export function generateReviewSchema(review: {
  author: string;
  reviewBody: string;
  ratingValue: number;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewBody: review.reviewBody,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    datePublished: review.datePublished,
  };
}

export function generateImageObjectSchema(image: {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    url: image.url,
    alt: image.alt,
    ...(image.width && { width: image.width }),
    ...(image.height && { height: image.height }),
  };
}

export function generateServiceSchema(service: {
  name: string;
  description: string;
  provider: string;
  areaServed: string[];
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: service.provider,
    },
    areaServed: service.areaServed.map(area => ({
      "@type": "City",
      name: area,
    })),
    serviceType: service.serviceType,
  };
}

export function generateEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address: string;
  };
  organizer: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      "@type": "Place",
      name: event.location.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.location.address,
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer,
    },
  };
}

export function generateArticleSchema(article: {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    author: {
      "@type": "Person",
      name: article.author,
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    image: article.image,
    url: article.url,
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/logo.png",
      },
    },
  };
}

export function generateHowToSchema(howTo: {
  name: string;
  description: string;
  steps: Array<{ text: string; image?: string }>;
  totalTime: string;
  tool: string[];
  supply: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step.text,
      ...(step.image && {
        image: {
          "@type": "ImageObject",
          url: step.image,
        },
      }),
    })),
    totalTime: howTo.totalTime,
    tool: howTo.tool,
    supply: howTo.supply,
  };
}

export function generateRecipeSchema(recipe: {
  name: string;
  description: string;
  author: string;
  datePublished: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  recipeYield: string;
  recipeCategory: string;
  recipeCuisine: string;
  ingredients: string[];
  instructions: string[];
  image: string;
  nutrition?: {
    calories: string;
    proteinContent: string;
    fatContent: string;
    carbohydrateContent: string;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    author: {
      "@type": "Person",
      name: recipe.author,
    },
    datePublished: recipe.datePublished,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    recipeYield: recipe.recipeYield,
    recipeCategory: recipe.recipeCategory,
    recipeCuisine: recipe.recipeCuisine,
    image: recipe.image,
    ingredients: recipe.ingredients,
    recipeInstructions: recipe.instructions.map((instruction, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: instruction,
    })),
    ...(recipe.nutrition && {
      nutrition: {
        "@type": "NutritionInformation",
        calories: recipe.nutrition.calories,
        proteinContent: recipe.nutrition.proteinContent,
        fatContent: recipe.nutrition.fatContent,
        carbohydrateContent: recipe.nutrition.carbohydrateContent,
      },
    }),
  };
}
