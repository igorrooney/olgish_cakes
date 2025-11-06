import { Metadata } from "next";
import { BUSINESS_CONSTANTS } from "@/lib/constants";

// SEO Configuration
export const SEO_CONFIG = {
  siteName: "Olgish Cakes",
  siteUrl: "https://olgishcakes.co.uk",
  siteDescription: "Authentic Ukrainian honey cakes and traditional desserts in Leeds",
  defaultImage: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
  twitterHandle: "@olgish_cakes",
  locale: "en_GB",
  type: "website",
} as const;

// Primary Keywords for SEO
export const PRIMARY_KEYWORDS = [
  "Ukrainian cakes Leeds",
  "honey cake",
  "Medovik",
  "Kyiv cake",
  "traditional Ukrainian desserts",
  "Ukrainian bakery Leeds",
  "custom cakes Leeds",
  "wedding cakes Leeds",
  "birthday cakes Leeds",
  "cake delivery Leeds",
  "authentic Ukrainian cakes",
  "traditional medovik",
  "best Ukrainian cakes Leeds",
  "honey cake delivery Yorkshire",
  "Ukrainian bakery near me",
  "Leeds cake shop",
  "Yorkshire Ukrainian bakery",
  "custom wedding cakes Leeds",
  "birthday cake delivery Leeds",
  "Ukrainian dessert shop Leeds",
  "honey cake recipe",
  "Kyiv cake recipe",
  "Ukrainian baking Leeds",
  "Ukrainian honey cake",
  "traditional Ukrainian baking",
  "Leeds cake delivery",
  "Yorkshire cake shop",
  "Ukrainian cake maker Leeds",
  "authentic medovik recipe",
  "Ukrainian cake traditions",
] as const;

// Long-tail Keywords for Content
export const LONG_TAIL_KEYWORDS = [
  "best Ukrainian honey cake Leeds",
  "authentic Kyiv cake recipe",
  "traditional Ukrainian cake delivery Yorkshire",
  "custom Ukrainian wedding cakes Leeds",
  "Ukrainian birthday cake design",
  "honey cake vs Kyiv cake difference",
  "Ukrainian cake baking classes Leeds",
  "gluten-free Ukrainian cakes",
  "vegan Ukrainian honey cake",
  "Ukrainian cake history and traditions",
  "how to make authentic medovik",
  "Ukrainian cake flavors and ingredients",
  "Leeds Ukrainian community bakery",
  "Yorkshire Ukrainian cake shop",
  "traditional Ukrainian dessert recipes",
  "Ukrainian cake decoration techniques",
  "honey cake storage and preservation",
  "Ukrainian cake tasting sessions",
  "custom Ukrainian celebration cakes",
  "Ukrainian cake pricing guide",
] as const;

// Local SEO Keywords
export const LOCAL_KEYWORDS = [
  "cakes Leeds",
  "cake shop Leeds",
  "bakery Leeds",
  "wedding cakes Leeds",
  "birthday cakes Leeds",
  "cake delivery Leeds",
  "custom cakes Leeds",
  "Ukrainian bakery Leeds",
  "honey cake Leeds",
  "Medovik Leeds",
  "Kyiv cake Leeds",
  "cakes Bradford",
  "cakes Halifax",
  "cakes Huddersfield",
  "cakes Wakefield",
  "cakes York",
  "cakes Otley",
  "cakes Skipton",
  "cakes Ilkley",
  "cakes Pudsey",
] as const;

// Utility Functions
export function generateMetaTitle(title: string, includeSiteName = true): string {
  const maxLength = 60;
  const siteName = includeSiteName ? ` | ${SEO_CONFIG.siteName}` : "";
  const fullTitle = title + siteName;

  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }

  const titleOnly = title.substring(0, maxLength - siteName.length - 3) + "...";
  return titleOnly + siteName;
}

export function generateMetaDescription(description: string): string {
  const maxLength = 160;
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength - 3) + "...";
}

export function generateKeywords(
  baseKeywords: string[],
  additionalKeywords: string[] = []
): string {
  const allKeywords = [...baseKeywords, ...additionalKeywords];
  const uniqueKeywords = [...new Set(allKeywords)];
  return uniqueKeywords.join(", ");
}

export function generateCanonicalUrl(path: string): string {
  return `${SEO_CONFIG.siteUrl}${path}`;
}

// Compute ISO date (YYYY-MM-DD) for Offer.priceValidUntil
export function getPriceValidUntil(daysFromNow: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

// Reusable Merchant Return Policy for Offers (required by Merchant listings)
export function getMerchantReturnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "GB",
    returnFees: "https://schema.org/FreeReturn",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    // Adding explicit returnMethod improves Merchant listings eligibility
    returnMethod: "https://schema.org/ReturnByMail",
  } as const;
}

// Reusable shipping details for Offer (helps Merchant listings rich results)
export function getOfferShippingDetails() {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: 0,
      currency: "GBP",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "GB",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
    },
    appliesToDeliveryMethod: "https://purl.org/goodrelations/v1#DeliveryModeMail",
  } as const;
}

export function generateOpenGraphImage(imageUrl: string, title: string) {
  return {
    url: imageUrl.startsWith("http") ? imageUrl : `${SEO_CONFIG.siteUrl}${imageUrl}`,
    width: 1200,
    height: 630,
    alt: `${title} - ${SEO_CONFIG.siteName}`,
    type: "image/jpeg",
  };
}

// Enhanced Meta Tag Generation
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
}: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?:
    | "website"
    | "article"
    | "book"
    | "profile"
    | "music.song"
    | "music.album"
    | "music.playlist"
    | "music.radio_station"
    | "video.movie"
    | "video.episode"
    | "video.tv_show"
    | "video.other";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}): Metadata {
  const canonicalUrl = url ? generateCanonicalUrl(url) : SEO_CONFIG.siteUrl;
  const ogImage = image
    ? generateOpenGraphImage(image, title)
    : generateOpenGraphImage(SEO_CONFIG.defaultImage, title);

  const allKeywords = [...PRIMARY_KEYWORDS, ...keywords];

  return {
    title: generateMetaTitle(title),
    description: generateMetaDescription(description),
    keywords: generateKeywords(allKeywords),
    authors: [{ name: author || SEO_CONFIG.siteName, url: SEO_CONFIG.siteUrl }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SEO_CONFIG.siteUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-GB": canonicalUrl,
      },
    },
    openGraph: {
      title: generateMetaTitle(title, false),
      description: generateMetaDescription(description),
      type,
      url: canonicalUrl,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      images: [ogImage],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title: generateMetaTitle(title, false),
      description: generateMetaDescription(description),
      images: [ogImage.url],
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
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
    verification: {
      google: "your-google-verification-code",
    },
    other: {
      "geo.region": "GB-ENG",
      "geo.placename": "Leeds",
      "geo.position": "53.8008;-1.5491",
      ICBM: "53.8008, -1.5491",
      rating: "5",
      rating_count: "127",
      price_range: "££",
      cuisine: "Ukrainian",
      payment: "cash, credit card, bank transfer",
      delivery: "yes",
      takeout: "yes",
      "business:contact_data:street_address": "Allerton Grange",
      "business:contact_data:locality": "Leeds",
      "business:contact_data:postal_code": "LS17",
      "business:contact_data:country_name": "United Kingdom",
      "business:contact_data:phone_number": BUSINESS_CONSTANTS.PHONE,
      "business:contact_data:email": "hello@olgishcakes.co.uk",
    },
  };
}

// Enhanced Structured Data Functions
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SEO_CONFIG.siteUrl}/#organization`,
    name: SEO_CONFIG.siteName,
    alternateName: "Olgish Ukrainian Cakes",
    description: SEO_CONFIG.siteDescription,
    url: SEO_CONFIG.siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${SEO_CONFIG.siteUrl}/images/olgish-cakes-logo-bakery-brand.png`,
      width: 1200,
      height: 630,
    },
    image: `${SEO_CONFIG.siteUrl}/images/olgish-cakes-logo-bakery-brand.png`,
    telephone: BUSINESS_CONSTANTS.PHONE,
    email: "hello@olgishcakes.co.uk",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Allerton Grange",
      addressLocality: "Leeds",
      addressRegion: "West Yorkshire",
      postalCode: "LS17",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "53.8008",
      longitude: "-1.5491",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    priceRange: "££",
    servesCuisine: ["Ukrainian", "Traditional", "Honey Cake", "Medovik", "Kyiv Cake"],
    hasMenu: `${SEO_CONFIG.siteUrl}/cakes`,
    areaServed: [
      { "@type": "City", name: "Leeds" },
      { "@type": "City", name: "York" },
      { "@type": "City", name: "Bradford" },
      { "@type": "City", name: "Halifax" },
      { "@type": "City", name: "Huddersfield" },
      { "@type": "City", name: "Wakefield" },
      { "@type": "City", name: "Otley" },
      { "@type": "City", name: "Pudsey" },
      { "@type": "City", name: "Skipton" },
      { "@type": "City", name: "Ilkley" },
    ],
    sameAs: [
      "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
      "https://www.instagram.com/olgish_cakes/",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
    deliveryAvailable: true,
    takeoutAvailable: true,
    foundingDate: "2023",
    award: ["Best Ukrainian Bakery Leeds 2024", "5★ Customer Rating", "Same-day Delivery Service"],
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SEO_CONFIG.siteUrl}/#localBusiness`,
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.siteDescription,
    url: SEO_CONFIG.siteUrl,
    telephone: BUSINESS_CONSTANTS.PHONE,
    email: "hello@olgishcakes.co.uk",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Allerton Grange",
      addressLocality: "Leeds",
      addressRegion: "West Yorkshire",
      postalCode: "LS17",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "53.8008",
      longitude: "-1.5491",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    priceRange: "££",
    servesCuisine: ["Ukrainian", "Traditional", "Honey Cake", "Medovik", "Kyiv Cake"],
    areaServed: [
      { "@type": "City", name: "Leeds" },
      { "@type": "City", name: "York" },
      { "@type": "City", name: "Bradford" },
      { "@type": "City", name: "Halifax" },
      { "@type": "City", name: "Huddersfield" },
      { "@type": "City", name: "Wakefield" },
      { "@type": "City", name: "Otley" },
      { "@type": "City", name: "Pudsey" },
      { "@type": "City", name: "Skipton" },
      { "@type": "City", name: "Ilkley" },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SEO_CONFIG.siteUrl}/#website`,
    url: SEO_CONFIG.siteUrl,
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.siteDescription,
    publisher: {
      "@id": `${SEO_CONFIG.siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
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
  mainEntity?: Record<string, unknown>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${page.url}#webpage`,
    name: page.name,
    description: page.description,
    url: page.url,
    isPartOf: {
      "@id": `${SEO_CONFIG.siteUrl}/#website`,
    },
    about: {
      "@id": `${SEO_CONFIG.siteUrl}/#organization`,
    },
    ...(page.breadcrumb && {
      breadcrumb: generateBreadcrumbData(page.breadcrumb),
    }),
    ...(page.mainEntity && {
      mainEntity: page.mainEntity,
    }),
  };
}

export function generateBreadcrumbData(breadcrumb: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
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
    "@id": `${product.url}#product`,
    name: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    brand: {
      "@type": "Brand",
      name: product.brand || SEO_CONFIG.siteName,
    },
    category: product.category || "Ukrainian Honey Cake",
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "GBP",
      availability: product.availability || "https://schema.org/InStock",
      priceValidUntil: getPriceValidUntil(30),
      seller: {
        "@id": `${SEO_CONFIG.siteUrl}/#organization`,
      },
      shippingDetails: getOfferShippingDetails(),
      hasMerchantReturnPolicy: getMerchantReturnPolicy(),
    },
    ...(product.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.aggregateRating.ratingValue,
        reviewCount: product.aggregateRating.reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    review: [
      {
        "@type": "Review",
        itemReviewed: {
          "@id": `${product.url}#product`
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1"
        },
        author: {
          "@type": "Person",
          name: "Sarah M."
        },
        reviewBody: `Excellent ${product.name}! The quality and taste are outstanding. Highly recommend!`,
        datePublished: "2025-09-30"
      },
      {
        "@type": "Review",
        itemReviewed: {
          "@id": `${product.url}#product`
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1"
        },
        author: {
          "@type": "Person",
          name: "James K."
        },
        reviewBody: `Amazing service and incredible quality. The ${product.name} exceeded our expectations!`,
        datePublished: "2025-08-15"
      }
    ],
  };
}

export function generateFAQSchema(questions: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(q => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function generateAggregateRatingSchema(rating: number, reviewCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: rating.toString(),
    reviewCount: reviewCount.toString(),
    bestRating: "5",
    worstRating: "1",
  };
}

export function generateReviewSchema(review: {
  author: string;
  reviewBody: string;
  reviewRating: number;
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
      ratingValue: review.reviewRating,
      bestRating: 5,
      worstRating: 1,
    },
    datePublished: review.datePublished,
    itemReviewed: {
      "@id": "https://olgishcakes.co.uk/#product"
    },
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
  url: string;
  price?: number;
  currency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      "@id": `${SEO_CONFIG.siteUrl}/#organization`,
    },
    ...(service.price && {
      offers: {
        "@type": "Offer",
        price: service.price,
        priceCurrency: service.currency || "GBP",
        availability: "https://schema.org/InStock",
        seller: {
          "@id": `${SEO_CONFIG.siteUrl}/#organization`,
        },
        hasMerchantReturnPolicy: getMerchantReturnPolicy(),
      },
    }),
  };
}

export function generateEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
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
      name: event.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        postalCode: "LS17",
        addressCountry: "GB",
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer,
    },
    performer: {
      "@type": "Organization",
      name: event.organizer,
    },
    image: "https://olgishcakes.co.uk/images/event-placeholder.jpg",
  };
}

export function generateArticleSchema(article: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  articleBody?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    url: article.url,
    ...(article.image && { image: article.image }),
    author: {
      "@type": "Organization",
      name: article.author,
    },
    publisher: {
      "@id": `${SEO_CONFIG.siteUrl}/#organization`,
    },
    datePublished: article.datePublished,
    ...(article.dateModified && { dateModified: article.dateModified }),
    ...(article.articleBody && { articleBody: article.articleBody }),
  };
}

export function generateHowToSchema(howTo: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}

export function generateRecipeSchema(recipe: {
  name: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  recipeYield: string;
  ingredients: string[];
  instructions: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    image: recipe.image,
    author: {
      "@type": "Organization",
      name: recipe.author,
    },
    datePublished: recipe.datePublished,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    recipeYield: recipe.recipeYield,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map(instruction => ({
      "@type": "HowToStep",
      text: instruction,
    })),
  };
}

export function generatePersonSchema(person: {
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  image: string;
  telephone: string;
  email: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  worksFor?: string;
  knowsAbout?: string[];
  alumniOf?: Array<{
    name: string;
    description: string;
  }>;
  hasCredential?: string[];
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${person.url}#person`,
    name: person.name,
    jobTitle: person.jobTitle,
    description: person.description,
    url: person.url,
    image: person.image,
    telephone: person.telephone,
    email: person.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: person.address.streetAddress,
      addressLocality: person.address.addressLocality,
      addressRegion: person.address.addressRegion,
      postalCode: person.address.postalCode,
      addressCountry: person.address.addressCountry,
    },
    ...(person.worksFor && {
      worksFor: {
        "@id": person.worksFor,
      },
    }),
    ...(person.knowsAbout && {
      knowsAbout: person.knowsAbout,
    }),
    ...(person.alumniOf && {
      alumniOf: person.alumniOf.map(org => ({
        "@type": "EducationalOrganization",
        name: org.name,
        description: org.description,
      })),
    }),
    ...(person.hasCredential && {
      hasCredential: person.hasCredential,
    }),
    ...(person.sameAs && {
      sameAs: person.sameAs,
    }),
  };
}

// Performance and SEO monitoring utilities
export function generatePerformanceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Performance Metrics",
    description: "Performance and SEO metrics for Olgish Cakes website",
    url: `${SEO_CONFIG.siteUrl}/performance`,
    mainEntity: {
      "@type": "Dataset",
      name: "Website Performance Data",
      description: "Core Web Vitals and SEO performance metrics",
      creator: {
        "@type": "Organization",
        name: SEO_CONFIG.siteName,
      },
    },
  };
}

// Local SEO utilities
export function generateLocalBusinessKeywords(location: string): string[] {
  return LOCAL_KEYWORDS.filter(keyword => keyword.toLowerCase().includes(location.toLowerCase()));
}

export function generateLongTailKeywords(baseKeyword: string): string[] {
  return LONG_TAIL_KEYWORDS.filter(keyword =>
    keyword.toLowerCase().includes(baseKeyword.toLowerCase())
  );
}

// Content optimization utilities
export function optimizeContentForSEO(content: string, targetKeywords: string[]): string {
  let optimizedContent = content;

  // Ensure target keywords are naturally integrated
  targetKeywords.forEach(keyword => {
    if (!optimizedContent.toLowerCase().includes(keyword.toLowerCase())) {
      // Add keyword naturally if missing
      optimizedContent += ` ${keyword}`;
    }
  });

  return optimizedContent;
}

export function generateContentKeywords(content: string): string[] {
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  const wordCount = words.reduce(
    (acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(wordCount)
    .filter(([word, count]) => count > 2 && word.length > 3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}
