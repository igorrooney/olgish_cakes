"use client";

import { getMerchantReturnPolicy } from "@/app/utils/seo";
import { formatStructuredDataPrice } from "@/lib/utils/price-formatting";
import { urlFor } from "@/sanity/lib/image";
import { blocksToText, Cake } from "@/types/cake";
import { serializeJsonLd } from '@/lib/structured-data/serialize-json-ld'

interface OrderModalStructuredDataProps {
  cake: Cake;
  designType: "standard" | "individual";
  currentPrice: number;
}

export function OrderModalStructuredData({
  cake,
  designType,
  currentPrice,
}: OrderModalStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${cake.name} - ${designType === "standard" ? "Standard Design" : "Individual Design"}`,
    description: cake.shortDescription
      ? typeof cake.shortDescription === "string"
        ? cake.shortDescription
        : Array.isArray(cake.shortDescription)
          ? blocksToText(cake.shortDescription)
          : ""
      : `Professional ${cake.name} cake with ${designType === "standard" ? "standard" : "custom"} design`,
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
    },
    offers: {
      "@type": "Offer",
      price: formatStructuredDataPrice(currentPrice, 0),
      priceCurrency: "GBP",
      seller: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Leeds",
          addressCountry: "GB",
        },
      },
      hasMerchantReturnPolicy: getMerchantReturnPolicy(),
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
        name: "Design Type",
        value: designType === "standard" ? "Standard Design" : "Individual Design",
      },
      {
        "@type": "PropertyValue",
        name: "Ingredients",
        value: cake.ingredients.join(", "),
      },
    ],
    image: (() => {
      // Get the best available image
      const mainImage = cake.mainImage?.asset?._ref
        ? cake.mainImage
        : cake.designs?.standard?.find((img) => img.isMain && img.asset?._ref) ||
          cake.designs?.standard?.find((img) => img.asset?._ref) ||
          cake.designs?.standard?.[0] ||
          cake.designs?.individual?.find((img) => img.isMain && img.asset?._ref) ||
          cake.designs?.individual?.find((img) => img.asset?._ref) ||
          cake.designs?.individual?.[0] ||
          // Fallback to images array (for legacy data like Honey Cake)
          cake.images?.find((img) => img.asset?._ref) ||
          cake.images?.[0];

      return mainImage?.asset?._ref
        ? urlFor(mainImage).width(800).height(800).url()
        : "https://olgishcakes.co.uk/images/placeholder-cake.jpg";
    })(),
    url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
    serviceType: "Cake Design and Delivery",
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
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
          hasMerchantReturnPolicy: getMerchantReturnPolicy(),
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Individual Cake Design",
            description: "Custom cake design with a personal consultation",
          },
          hasMerchantReturnPolicy: getMerchantReturnPolicy(),
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
    />
  );
}
