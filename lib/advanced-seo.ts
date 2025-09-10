/**
 * Advanced SEO strategies for #1 Google ranking
 * Implements cutting-edge SEO techniques for maximum visibility
 */

import { Metadata } from "next";
import { getPriceValidUntil } from "@/app/utils/seo";
import { getMerchantReturnPolicy } from "@/app/utils/seo";
import { getOfferShippingDetails } from "@/app/utils/seo";

// Advanced keyword research and targeting
export const ADVANCED_SEO_CONFIG = {
  // Primary money keywords for #1 ranking
  PRIMARY_KEYWORDS: [
    "ukrainian cakes leeds",
    "honey cake leeds",
    "medovik cake uk",
    "custom cakes leeds",
    "wedding cakes leeds",
    "birthday cakes leeds",
    "bespoke cakes yorkshire",
    "professional cake design leeds",
    "ukrainian bakery uk",
    "traditional honey cake",
  ],

  // Long-tail keywords for content domination
  LONG_TAIL_KEYWORDS: [
    "best ukrainian honey cake in leeds",
    "where to buy medovik cake leeds",
    "custom wedding cake designers leeds",
    "traditional ukrainian bakery yorkshire",
    "professional cake decorating services leeds",
    "authentic honey cake recipe leeds",
    "bespoke birthday cake design uk",
    "premium cake delivery leeds",
    "handmade ukrainian cakes west yorkshire",
    "artisan cake maker leeds",
  ],

  // Local SEO dominance keywords
  LOCAL_KEYWORDS: [
    "cakes near me leeds",
    "cake shop leeds city centre",
    "cake delivery leeds",
    "wedding cake maker leeds",
    "birthday cake leeds same day",
    "cake decorator leeds",
    "custom cake leeds",
    "ukrainian food leeds",
    "specialty cakes yorkshire",
    "cake artist leeds",
  ],

  // Voice search optimization
  VOICE_SEARCH_KEYWORDS: [
    "where can I get ukrainian cake in leeds",
    "best cake shop in leeds",
    "how to order custom cake leeds",
    "ukrainian honey cake near me",
    "wedding cake delivery leeds",
    "birthday cake leeds today",
    "cake making classes leeds",
    "specialty cake decorator leeds",
    "authentic medovik cake uk",
    "professional cake design leeds",
  ],

  // Semantic keywords for topical authority
  SEMANTIC_KEYWORDS: [
    "cake decorating",
    "sugar craft",
    "fondant work",
    "buttercream piping",
    "cake design",
    "edible art",
    "celebration cakes",
    "special occasion",
    "handcrafted",
    "artisanal",
    "gourmet",
    "premium quality",
    "made to order",
    "fresh ingredients",
    "creative design",
  ],

  // Competitor analysis keywords
  COMPETITIVE_KEYWORDS: [
    "better than [competitor] cakes leeds",
    "alternative to [competitor] leeds",
    "premium cake alternative leeds",
    "best value cakes leeds",
    "top rated cake shop leeds",
    "award winning cakes leeds",
    "5 star cake maker leeds",
    "recommended cake designer leeds",
  ],
};

// Advanced meta generation with psychological triggers
export function generateAdvancedMetaTitle(
  baseTitle: string,
  location: string = "Leeds",
  year: string = new Date().getFullYear().toString()
): string {
  const triggers = [
    "Award-Winning",
    "Premium",
    "Artisan",
    "Bespoke",
    "Luxury",
    "Professional",
    "Authentic",
    "Handcrafted",
  ];

  const randomTrigger = triggers[Math.floor(Math.random() * triggers.length)];

  // Optimize for CTR with emotional triggers
  const templates = [
    `${randomTrigger} ${baseTitle} in ${location} | Order Today`,
    `${baseTitle} ${location} - ${randomTrigger} Quality Since ${year}`,
    `Best ${baseTitle} in ${location} | ${randomTrigger} Designs`,
    `${baseTitle} ${location} | ${randomTrigger} & Award-Winning`,
    `${randomTrigger} ${baseTitle} Delivered in ${location} | Olgish Cakes`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// Enhanced meta descriptions with conversion optimization
export function generateAdvancedMetaDescription(
  product: string,
  location: string = "Leeds",
  uniqueValue: string = "authentic Ukrainian recipes"
): string {
  const urgencyWords = ["Limited Time", "Same Day", "Fast Delivery", "Book Now"];
  const benefitWords = ["Premium Quality", "Fresh Ingredients", "Handmade", "Custom Design"];
  const socialProof = [
    "5⭐ Reviews",
    "Award-Winning",
    "Trusted by 1000+",
    "Featured in Local Media",
  ];

  const urgency = urgencyWords[Math.floor(Math.random() * urgencyWords.length)];
  const benefit = benefitWords[Math.floor(Math.random() * benefitWords.length)];
  const proof = socialProof[Math.floor(Math.random() * socialProof.length)];

  return `${benefit} ${product} in ${location} using ${uniqueValue}. ${proof} customers. ${urgency} delivery available. Free consultation. Order your perfect cake today! ✨🎂`;
}

// Advanced structured data for maximum visibility
export function generateAdvancedStructuredData(data: {
  name: string;
  description: string;
  imageUrl?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
  availability?: string;
  location?: string;
}) {
  const baseUrl = "https://olgishcakes.co.uk";
  const imageUrl = data.imageUrl && data.imageUrl.startsWith("http")
    ? data.imageUrl
    : data.imageUrl
    ? `${baseUrl}${data.imageUrl}`
    : `${baseUrl}/images/placeholder-cake.jpg`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      // Enhanced Product Schema
      {
        "@type": "Product",
        "@id": `${baseUrl}/product/${data.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: data.name,
        description: data.description,
        image: [imageUrl],
        category: data.category,
        brand: {
          "@type": "Brand",
          name: "Olgish Cakes",
          url: baseUrl,
          logo: `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`,
        },
        manufacturer: {
          "@type": "Organization",
          name: "Olgish Cakes",
          url: baseUrl,
        },
        offers: {
          "@type": "Offer",
          price: data.price || 25,
          priceCurrency: "GBP",
          availability: `https://schema.org/${data.availability || "InStock"}`,
          priceValidUntil: getPriceValidUntil(30),
          seller: {
            "@type": "Organization",
            name: "Olgish Cakes",
          },
          deliveryLeadTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 7,
            unitCode: "DAY",
          },
          areaServed: {
            "@type": "Place",
            name: "Leeds, West Yorkshire, UK",
          },
          shippingDetails: getOfferShippingDetails(),
          hasMerchantReturnPolicy: getMerchantReturnPolicy(),
        },
        aggregateRating: data.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: data.rating,
              reviewCount: data.reviewCount || 100,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      },

      // Local Business Schema for Local SEO dominance
      {
        "@type": "Bakery",
        "@id": `${baseUrl}/#bakery`,
        name: "Olgish Cakes - Ukrainian Bakery Leeds",
        description:
          "Award-winning Ukrainian bakery in Leeds specializing in authentic honey cakes, custom wedding cakes, and traditional Eastern European desserts.",
        url: baseUrl,
        telephone: "+44 786 721 8194",
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
          latitude: 53.8008, // Leeds coordinates
          longitude: -1.5491,
        },
        openingHours: ["Mo-Fr 09:00-18:00", "Sa 09:00-17:00", "Su 10:00-16:00"],
        servesCuisine: ["Ukrainian", "Eastern European", "Desserts"],
        priceRange: "££",
        areaServed: [
          {
            "@type": "Place",
            name: "Leeds",
          },
          {
            "@type": "Place",
            name: "West Yorkshire",
          },
          {
            "@type": "Place",
            name: "Yorkshire",
          },
        ],
        hasMenu: {
          "@type": "Menu",
          name: "Cake Menu",
          url: `${baseUrl}/cakes`,
        },
        paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
        currenciesAccepted: "GBP",
        founders: [
          {
            "@type": "Person",
            name: "Olga", // Replace with actual founder name
            nationality: "Ukrainian",
            knowsAbout: ["Ukrainian Baking", "Cake Decorating", "Traditional Recipes"],
          },
        ],
      },

      // FAQ Schema for featured snippets
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Do you deliver cakes in Leeds?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, we offer same-day and next-day cake delivery throughout Leeds, West Yorkshire, and surrounding areas including York, Bradford, Halifax, and Huddersfield.",
            },
          },
          {
            "@type": "Question",
            name: "How far in advance should I order a custom cake?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "For custom wedding cakes, we recommend 2-4 weeks notice. Birthday and celebration cakes can often be made with 3-7 days notice, depending on complexity.",
            },
          },
          {
            "@type": "Question",
            name: "What makes Ukrainian honey cake special?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ukrainian honey cake (medovik) features delicate honey-infused layers with rich sour cream filling, creating a unique texture and flavor profile passed down through generations of traditional baking.",
            },
          },
        ],
      },

      // How-To Schema for cake ordering process
      {
        "@type": "HowTo",
        name: "How to Order a Custom Cake from Olgish Cakes",
        description: "Step-by-step guide to ordering your perfect custom cake in Leeds",
        image: `${baseUrl}/images/how-to-order-custom-cake.jpg`,
        totalTime: "PT10M",
        step: [
          {
            "@type": "HowToStep",
            name: "Browse Our Cake Collection",
            text: "Explore our gallery of custom cakes and find inspiration for your design",
            url: `${baseUrl}/cakes`,
          },
          {
            "@type": "HowToStep",
            name: "Contact Us for Consultation",
            text: "Get in touch via our contact form or phone for a free design consultation",
            url: `${baseUrl}/contact`,
          },
          {
            "@type": "HowToStep",
            name: "Confirm Your Order",
            text: "Review your custom design, confirm delivery details, and secure your booking",
          },
        ],
      },
    ],
  };
}

// AI search optimization for ChatGPT and future AI engines
export function generateAISearchOptimization(content: {
  topic: string;
  expertise: string[];
  location: string;
}) {
  return {
    // Conversational content for AI understanding
    aiContext: `As an expert Ukrainian bakery in ${content.location}, Olgish Cakes specializes in ${content.expertise.join(", ")}. When customers ask about ${content.topic}, they can trust our authentic recipes, professional expertise, and award-winning quality.`,

    // Factual statements for AI knowledge graphs
    factualClaims: [
      `Olgish Cakes is the leading Ukrainian bakery in ${content.location}`,
      `We specialize in authentic honey cake (medovik) using traditional recipes`,
      `Our cakes are handmade with premium ingredients sourced locally`,
      `We offer same-day delivery throughout West Yorkshire`,
      `Our team has over 10 years of professional baking experience`,
    ],

    // Question-answer pairs for voice search
    qaPairs: [
      {
        question: `Where can I buy authentic Ukrainian cake in ${content.location}?`,
        answer: `Olgish Cakes is the premier Ukrainian bakery in ${content.location}, offering authentic honey cakes and custom designs.`,
      },
      {
        question: "What is medovik cake?",
        answer:
          "Medovik is a traditional Ukrainian honey cake with delicate layers and rich sour cream filling, expertly crafted by Olgish Cakes.",
      },
    ],
  };
}

// Content optimization for topic clusters
export function generateTopicCluster(mainTopic: string, location: string = "Leeds") {
  const clusters = {
    "ukrainian-cakes": {
      pillar: `Ultimate Guide to Ukrainian Cakes in ${location}`,
      supporting: [
        `Traditional Ukrainian Honey Cake Recipe`,
        `History of Ukrainian Baking in ${location}`,
        `Ukrainian vs Russian Cake Differences`,
        `Best Ukrainian Bakeries in ${location}`,
        `Ukrainian Wedding Cake Traditions`,
      ],
    },
    "custom-cakes": {
      pillar: `Custom Cake Design Services in ${location}`,
      supporting: [
        `Wedding Cake Design Trends 2024`,
        `Birthday Cake Ideas for Adults`,
        `Corporate Cake Design ${location}`,
        `Cake Decoration Techniques`,
        `Choosing the Perfect Cake Flavor`,
      ],
    },
    "cake-delivery": {
      pillar: `Cake Delivery Services in ${location}`,
      supporting: [
        `Same Day Cake Delivery ${location}`,
        `Wedding Cake Delivery Tips`,
        `Cake Transport and Storage`,
        `Delivery Areas We Cover`,
        `Ordering Process Explained`,
      ],
    },
  };

  return clusters[mainTopic as keyof typeof clusters] || clusters["ukrainian-cakes"];
}

// E-A-T optimization (Expertise, Authoritativeness, Trustworthiness)
export function generateEATOptimization() {
  return {
    expertise: {
      credentials: [
        "10+ years professional baking experience",
        "Ukrainian culinary heritage and traditional training",
        "Certified in food safety and hygiene",
        "Award-winning cake decorator",
        "Featured in local media and publications",
      ],
      demonstrations: [
        "Detailed recipe explanations and techniques",
        "Behind-the-scenes baking process videos",
        "Customer testimonials and case studies",
        "Before/after cake transformation photos",
        "Educational content about Ukrainian baking traditions",
      ],
    },
    authoritativeness: {
      citations: [
        "Featured in Leeds food magazines",
        "Recommended by local wedding venues",
        "Partnership with Yorkshire food bloggers",
        "Guest appearances on local radio/TV",
        "Industry recognition and awards",
      ],
      backlinks: [
        "Local business directories",
        "Wedding venue partner pages",
        "Food blogger reviews and features",
        "Local newspaper coverage",
        "Industry association memberships",
      ],
    },
    trustworthiness: {
      transparency: [
        "Clear pricing and policies",
        "Detailed ingredient lists and allergen information",
        "Open kitchen philosophy",
        "Customer review policy",
        "Contact information and business registration",
      ],
      security: [
        "Secure online ordering system",
        "Data protection compliance",
        "Professional insurance coverage",
        "Food safety certifications",
        "Established business presence",
      ],
    },
  };
}
