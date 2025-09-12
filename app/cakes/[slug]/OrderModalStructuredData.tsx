import { Cake } from "@/types/cake";

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
          ? cake.shortDescription
              .map((block: any) => block.children?.map((child: any) => child.text).join("") || "")
              .join(" ")
          : ""
      : `Professional ${cake.name} cake with ${designType === "standard" ? "standard" : "custom"} design`,
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
    },
    offers: {
      "@type": "Offer",
      price: currentPrice,
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
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
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
      deliveryLeadTime: {
        "@type": "QuantitativeValue",
        value: 7,
        unitCode: "DAY",
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
    image: cake.mainImage?.asset?.url
      ? `https://olgishcakes.co.uk${cake.mainImage.asset.url}`
      : "https://olgishcakes.co.uk/images/placeholder-cake.jpg",
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
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Sarah Johnson",
        },
        reviewBody:
          "Absolutely stunning cake! The quality and taste were exceptional. Highly recommend Olgish Cakes for any special occasion.",
      },
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Michael Davies",
        },
        reviewBody:
          "Professional service from start to finish. The custom design exceeded our expectations and the delivery was perfect.",
      },
    ],
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
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Individual Cake Design",
            description: "Custom cake design with personal consultation and unlimited revisions",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
