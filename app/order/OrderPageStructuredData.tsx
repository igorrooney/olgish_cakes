import Script from "next/script";
import { getFeaturedTestimonials } from "@/app/utils/fetchTestimonials";

export async function OrderPageStructuredData() {
  // Fetch real testimonials from Sanity
  const testimonials = await getFeaturedTestimonials(3);
  
  // Calculate aggregate rating from real testimonials
  const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
  const averageRating = testimonials.length > 0 ? (totalRating / testimonials.length).toFixed(1) : "5.0";
  
  // Convert testimonials to schema format
  const reviewSchema = testimonials.map((testimonial) => ({
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
        openingHours: "Mo-Su 09:00-18:00",
        priceRange: "££",
        servesCuisine: ["Ukrainian", "European"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Cake Collection",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Honey Cake",
                description: "Traditional Ukrainian honey cake with premium ingredients",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Wedding Cakes",
                description: "Custom wedding cakes with professional design",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Birthday Cakes",
                description: "Personalized birthday cakes for all ages",
              },
            },
          ],
        },
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
    <Script
      id="order-page-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
