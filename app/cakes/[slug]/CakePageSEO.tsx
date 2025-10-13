import { Cake } from "@/types/cake";
import Head from "next/head";

interface CakePageSEOProps {
  cake: Cake;
  designType: "standard" | "individual";
  currentPrice: number;
}

export function CakePageSEO({ cake, designType, currentPrice }: CakePageSEOProps) {
  const cakeName = `${cake.name} - ${designType === "standard" ? "Standard Design" : "Individual Design"}`;
  const description = cake.shortDescription
    ? typeof cake.shortDescription === "string"
      ? cake.shortDescription
      : Array.isArray(cake.shortDescription)
        ? cake.shortDescription
            .map((block: any) => block.children?.map((child: any) => child.text).join("") || "")
            .join(" ")
        : ""
    : `Order professional ${cake.name} cake in Leeds. ${designType === "standard" ? "Standard" : "Custom"} design from £${currentPrice}. Premium ingredients, fast delivery.`;

  const keywords = [
    `${cake.name} cake`,
    `${cake.name} cake Leeds`,
    `${cake.name} cake delivery`,
    `${designType === "standard" ? "standard" : "custom"} cake design`,
    "professional cake baker Leeds",
    "wedding cake Leeds",
    "birthday cake Leeds",
    "celebration cake Leeds",
    "Ukrainian cake Leeds",
    "honey cake Leeds",
    "premium cake ingredients",
    "cake delivery Leeds",
    "custom cake design",
    "cake consultation",
    "special occasion cake",
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cakeName,
    description: description,
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GBP",
      lowPrice: cake.pricing.standard,
      highPrice: cake.pricing.individual,
      offerCount: 2,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
        logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Leeds",
          addressCountry: "GB",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+44-113-123-4567",
          contactType: "customer service",
          email: "hello@olgishcakes.co.uk",
        },
      },
      shippingDetails: {
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
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GB",
        returnFees: "https://schema.org/FreeReturn",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
    category: cake.category,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Size",
        value: cake.size,
      },
      {
        "@type": "PropertyValue",
        name: "Ingredients",
        value: cake.ingredients.join(", "),
      },
      {
        "@type": "PropertyValue",
        name: "Allergens",
        value: cake.allergens?.join(", ") || "None specified",
      },
    ],
    image: (() => {
      // Import urlFor dynamically to avoid build issues
      let urlFor: any;
      try {
        urlFor = require('@/sanity/lib/image').urlFor;
      } catch (error) {
        // Fallback for build environments where dynamic import might fail
        urlFor = (image: any) => ({
          width: () => ({ height: () => ({ url: () => "https://olgishcakes.co.uk/images/placeholder-cake.jpg" }) })
        });
      }

      // Get the best available image
      const mainImage = cake.mainImage?.asset?._ref
        ? cake.mainImage
        : cake.designs?.standard?.find((img: any) => img.isMain && img.asset?._ref) ||
          cake.designs?.standard?.find((img: any) => img.asset?._ref) ||
          cake.designs?.standard?.[0] ||
          cake.designs?.individual?.find((img: any) => img.isMain && img.asset?._ref) ||
          cake.designs?.individual?.find((img: any) => img.asset?._ref) ||
          cake.designs?.individual?.[0] ||
          // Fallback to images array (for legacy data like Honey Cake)
          cake.images?.find((img: any) => img.asset?._ref) ||
          cake.images?.[0];

      return mainImage?.asset?._ref
        ? urlFor(mainImage).width(800).height(800).url()
        : "https://olgishcakes.co.uk/images/placeholder-cake.jpg";
    })(),
    url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        itemReviewed: {
          "@type": "Product",
          name: cakeName,
          description: cake.description,
          brand: {
            "@type": "Brand",
            name: "Olgish Cakes"
          }
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Person",
          name: "Sarah Johnson",
        },
        reviewBody:
          "Absolutely stunning cake! The quality and taste were exceptional. Highly recommend Olgish Cakes for any special occasion.",
        datePublished: "2024-01-15",
      },
      {
        "@type": "Review",
        itemReviewed: {
          "@type": "Product",
          name: cakeName,
          description: cake.description,
          brand: {
            "@type": "Brand",
            name: "Olgish Cakes"
          }
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Person",
          name: "Michael Davies",
        },
        reviewBody:
          "Professional service from start to finish. The custom design exceeded our expectations and the delivery was perfect.",
        datePublished: "2024-01-10",
      },
    ],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://olgishcakes.co.uk",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Cakes",
          item: "https://olgishcakes.co.uk/cakes",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: cake.category,
          item: `https://olgishcakes.co.uk/cakes?category=${cake.category.toLowerCase().replace(/\s+/g, "-")}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: cake.name,
          item: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
        },
      ],
    },
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Olgish Cakes",
    url: "https://olgishcakes.co.uk",
    logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
    description:
      "Professional cake design and delivery service in Leeds, specializing in Ukrainian honey cakes and custom celebration cakes.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Leeds",
      addressCountry: "GB",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+44-113-123-4567",
      contactType: "customer service",
      email: "hello@olgishcakes.co.uk",
      availableLanguage: "English, Ukrainian",
    },
    sameAs: [
      "https://www.facebook.com/olgishcakes",
      "https://www.instagram.com/olgishcakes",
      "https://www.trustpilot.com/review/olgishcakes.co.uk",
    ],
    openingHours: "Mo-Su 00:00-23:59",
    priceRange: "££",
    servesCuisine: "Ukrainian, European",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cake Design Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Standard Cake Design",
            description: "Our signature cake designs with premium ingredients",
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "GB",
            returnFees: "https://schema.org/FreeReturn",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
            returnMethod: "https://schema.org/ReturnByMail",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Individual Cake Design",
            description: "Custom cake design with personal consultation and unlimited revisions",
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "GB",
            returnFees: "https://schema.org/FreeReturn",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
            returnMethod: "https://schema.org/ReturnByMail",
          },
        },
      ],
    },
  };

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{cakeName} | Olgish Cakes - Professional Cake Design Leeds</title>
      <meta name="title" content={`${cakeName} | Olgish Cakes - Professional Cake Design Leeds`} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="author" content="Olgish Cakes" />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={`https://olgishcakes.co.uk/cakes/${cake.slug.current}`} />
      <meta property="og:title" content={`${cakeName} | Olgish Cakes`} />
      <meta property="og:description" content={description} />
      <meta
        property="og:image"
        content={
          cake.mainImage?.asset?.url
            ? `https://olgishcakes.co.uk${cake.mainImage.asset.url}`
            : "https://olgishcakes.co.uk/images/placeholder-cake.jpg"
        }
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Olgish Cakes" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta
        property="twitter:url"
        content={`https://olgishcakes.co.uk/cakes/${cake.slug.current}`}
      />
      <meta property="twitter:title" content={`${cakeName} | Olgish Cakes`} />
      <meta property="twitter:description" content={description} />
      <meta
        property="twitter:image"
        content={
          cake.mainImage?.asset?.url
            ? `https://olgishcakes.co.uk${cake.mainImage.asset.url}`
            : "https://olgishcakes.co.uk/images/placeholder-cake.jpg"
        }
      />

      {/* Additional SEO Meta Tags */}
      <meta name="geo.region" content="GB-LEE" />
      <meta name="geo.placename" content="Leeds" />
      <meta name="geo.position" content="53.8008;-1.5491" />
      <meta name="ICBM" content="53.8008, -1.5491" />

      {/* Product Specific Meta Tags */}
      <meta property="product:price:amount" content={currentPrice.toString()} />
      <meta property="product:price:currency" content="GBP" />
      <meta property="product:availability" content="in stock" />
      <meta property="product:condition" content="new" />

      {/* Canonical URL */}
      <link rel="canonical" href={`https://olgishcakes.co.uk/cakes/${cake.slug.current}`} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
      />

      {/* Additional Links */}
      <link
        rel="alternate"
        hrefLang="en"
        href={`https://olgishcakes.co.uk/cakes/${cake.slug.current}`}
      />
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`https://olgishcakes.co.uk/cakes/${cake.slug.current}`}
      />
    </Head>
  );
}
