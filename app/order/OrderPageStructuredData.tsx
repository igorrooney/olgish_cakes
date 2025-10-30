import Script from "next/script";
import { getFeaturedTestimonials, getAllTestimonialsStats } from "@/app/utils/fetchTestimonials";
import { client } from "@/sanity/lib/client";
import { generateAllProductSchemas } from "@/lib/product-schemas";
import { MAX_PRODUCTS_FOR_SCHEMA } from "@/lib/schema-constants";
import { perfLogger } from "@/lib/performance-logger";

export async function OrderPageStructuredData() {
  perfLogger.start('OrderPage:Total');
  
  // Fetch recent testimonials and stats in parallel
  perfLogger.start('OrderPage:FetchTestimonials');
  const [testimonials, { count: totalTestimonialCount, averageRating: calculatedAverage }] = await Promise.all([
    getFeaturedTestimonials(3),
    getAllTestimonialsStats()
  ]);
  perfLogger.end('OrderPage:FetchTestimonials', { count: totalTestimonialCount });
  
  const averageRating = calculatedAverage.toFixed(1);
  
  // Fetch essential cake data for product schemas (optimized query)
  perfLogger.start('OrderPage:FetchCakes');
  const allCakes = await client.fetch(`
    *[_type == "cake"] | order(name asc) [0...${MAX_PRODUCTS_FOR_SCHEMA}] {
      _id,
      name,
      slug,
      pricing,
      allergens,
      ingredients,
      mainImage {
        asset-> {
          url
        }
      },
      description
    }
  `);
  perfLogger.end('OrderPage:FetchCakes', { cakesCount: allCakes.length });

  // Generate all product schemas
  perfLogger.start('OrderPage:GenerateSchemas');
  const productSchemas = generateAllProductSchemas(allCakes, { 
    count: totalTestimonialCount, 
    averageRating: parseFloat(averageRating) 
  });
  perfLogger.end('OrderPage:GenerateSchemas', { schemasCount: productSchemas.length });

  perfLogger.end('OrderPage:Total');
  
  // Check performance thresholds
  if (process.env.NODE_ENV !== 'production') {
    perfLogger.checkThresholds({
      'OrderPage:FetchCakes': 100,      // Warn if Sanity query > 100ms
      'OrderPage:GenerateSchemas': 50,  // Warn if schema generation > 50ms
      'OrderPage:Total': 200            // Warn if total time > 200ms
    });
  }

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
      "@id": "https://olgishcakes.co.uk/#product"
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: totalTestimonialCount.toString(), // Use total count from all testimonials, not just the 3 displayed
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
      {productSchemas.map((productSchema, index: number) => {
        const schemaId = typeof productSchema['@id'] === 'string' ? productSchema['@id'] : `product-${index}`;
        return (
          <Script
            key={schemaId}
            id={`order-page-product-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          />
        );
      })}
    </>
  );
}
