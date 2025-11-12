import { Cake } from "@/types/cake";
import { getPriceValidUntil } from "@/app/utils/seo";
import { urlFor } from "@/sanity/lib/image";

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
      priceValidUntil: getPriceValidUntil(30), // 30 days from now
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
          "@id": `https://olgishcakes.co.uk/cakes/${cake.slug?.current || cake._id || 'cake'}#product`
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
        datePublished: "2025-09-30",
      },
      {
        "@type": "Review",
        itemReviewed: {
          "@id": `https://olgishcakes.co.uk/cakes/${cake.slug?.current || cake._id || 'cake'}#product`
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
        datePublished: "2025-08-15",
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
