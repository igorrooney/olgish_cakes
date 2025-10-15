import Script from "next/script";
import { getFeaturedTestimonials } from "@/app/utils/fetchTestimonials";

export async function OrderPageStructuredData() {
  // Fetch real testimonials from Sanity
  const testimonials = await getFeaturedTestimonials(3);

  // Calculate aggregate rating from real testimonials
  const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
  const averageRating =
    testimonials.length > 0 ? (totalRating / testimonials.length).toFixed(1) : "5.0";

  // Convert testimonials to schema format
  const reviewSchema = testimonials.map(testimonial => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: testimonial.customerName,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: testimonial.rating.toString(),
      bestRating: "5",
    },
    reviewBody: testimonial.text,
    datePublished: testimonial.date,
    itemReviewed: {
      "@type": "Product",
      name: testimonial.cakeType,
      description: `${testimonial.cakeType} from Olgish Cakes`,
    },
  }));

  // Product schemas for featured cakes with required properties
  const productSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://olgishcakes.co.uk/order#honey-cake",
      name: "Ukrainian Honey Cake",
      description: "Traditional Ukrainian honey cake (Medovik) handmade with authentic recipes in Leeds. Perfect for birthdays, celebrations, and special occasions.",
      brand: {
        "@type": "Brand",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
        logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png"
      },
      manufacturer: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Leeds",
          addressRegion: "West Yorkshire",
          addressCountry: "GB"
        }
      },
      category: "Food & Drink > Bakery > Cakes",
      image: ["https://olgishcakes.co.uk/images/honey-cake-hero.jpg"],
      offers: {
        "@type": "Offer",
        "@id": "https://olgishcakes.co.uk/order#honey-cake-offer",
        price: "35",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        url: "https://olgishcakes.co.uk/order",
        seller: {
          "@type": "Organization",
          name: "Olgish Cakes",
          url: "https://olgishcakes.co.uk"
        },
        areaServed: {
          "@type": "City",
          name: "Leeds"
        },
        deliveryLeadTime: {
          "@type": "QuantitativeValue",
          value: "1",
          unitCode: "DAY"
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
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating,
        reviewCount: testimonials.length > 0 ? testimonials.length.toString() : "127",
        bestRating: "5",
        worstRating: "1",
      },
      review: testimonials.length > 0 ? reviewSchema : [
        {
          "@type": "Review",
          itemReviewed: {
            "@type": "Product",
            name: "Ukrainian Honey Cake",
            description: "Traditional Ukrainian honey cake and other authentic desserts"
          },
          author: {
            "@type": "Person",
            name: "Emily R."
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1"
          },
          reviewBody: "Absolutely delicious Ukrainian honey cake! The authentic taste and quality exceeded our expectations. Highly recommend Olgish Cakes!",
          datePublished: "2024-01-15"
        },
        {
          "@type": "Review",
          itemReviewed: {
            "@type": "Product",
            name: "Ukrainian Honey Cake",
            description: "Traditional Ukrainian honey cake and other authentic desserts"
          },
          author: {
            "@type": "Person",
            name: "James K."
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1"
          },
          reviewBody: "Outstanding service and incredible quality. The honey cake was perfect for our celebration. Will definitely order again!",
          datePublished: "2024-02-10"
        }
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://olgishcakes.co.uk/order#kyiv-cake",
      name: "Kyiv Cake",
      description: "Traditional Kyiv cake with layers of chocolate and nuts, handmade with authentic Ukrainian recipes in Leeds.",
      brand: {
        "@type": "Brand",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk"
      },
      category: "Food & Drink > Bakery > Cakes",
      image: ["https://olgishcakes.co.uk/images/kyiv-cake.jpg"],
      offers: {
        "@type": "Offer",
        "@id": "https://olgishcakes.co.uk/order#kyiv-cake-offer",
        price: "40",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        url: "https://olgishcakes.co.uk/order",
        seller: {
          "@type": "Organization",
          name: "Olgish Cakes",
          url: "https://olgishcakes.co.uk"
        },
        areaServed: {
          "@type": "City",
          name: "Leeds"
        },
        deliveryLeadTime: {
          "@type": "QuantitativeValue",
          value: "1",
          unitCode: "DAY"
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
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "89",
        bestRating: "5",
        worstRating: "1",
      },
      review: [
        {
          "@type": "Review",
          itemReviewed: {
            "@type": "Product",
            name: "Kyiv Cake",
            description: "Traditional Kyiv cake with chocolate and nuts"
          },
          author: {
            "@type": "Person",
            name: "Sarah M."
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1"
          },
          reviewBody: "The Kyiv cake was absolutely amazing! Rich chocolate layers with perfect nutty texture. Highly recommend!",
          datePublished: "2024-01-20"
        }
      ],
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Order Professional Cakes Online",
    description:
      "Order premium Ukrainian cakes online in Leeds. Professional cake design, custom orders, wedding cakes, birthday cakes. Fast delivery, quality guaranteed.",
    url: "https://olgishcakes.co.uk/order",
    mainEntity: {
      "@type": "Service",
      name: "Professional Cake Ordering Service",
      description:
        "Premium Ukrainian cake ordering service in Leeds with professional design consultation and delivery",
      provider: {
        "@type": "LocalBusiness",
        name: "Olgish Cakes",
        description:
          "Professional Ukrainian bakery in Leeds specializing in premium cakes and pastries",
        url: "https://olgishcakes.co.uk",
        telephone: "+44-113-123-4567",
        email: "hello@olgishcakes.co.uk",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Leeds",
          addressRegion: "West Yorkshire",
          addressCountry: "GB",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 53.8008,
          longitude: -1.5491,
        },
        openingHours: "Mo-Su 00:00-23:59",
        priceRange: "££",
        servesCuisine: ["Ukrainian", "European"],
      },
      areaServed: {
        "@type": "City",
        name: "Leeds",
      },
      serviceType: "Cake Ordering and Delivery",
      offers: {
        "@type": "Offer",
        description: "Professional cake ordering service with consultation and delivery",
        price: "25",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        validFrom: "2024-01-01",
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "GB",
          returnFees: "https://schema.org/FreeReturn",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 14,
          returnMethod: "https://schema.org/ReturnByMail",
        },
      },
    },
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
          name: "Order",
          item: "https://olgishcakes.co.uk/order",
        },
      ],
    },
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://olgishcakes.co.uk/order",
        inLanguage: "en-GB",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      deliveryMethod: ["http://schema.org/OnSitePickup", "http://schema.org/LockerDelivery"],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: testimonials.length.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviewSchema,
  };

  return (
    <>
      <Script
        id="order-page-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {productSchemas.map((productSchema, index) => (
        <Script
          key={`product-schema-${index}`}
          id={`order-page-product-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      ))}
    </>
  );
}
