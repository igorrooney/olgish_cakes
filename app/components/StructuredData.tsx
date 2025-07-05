import { MetadataRoute } from "next";

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Olgish Cakes",
    description:
      "Authentic Ukrainian cakes made with love in Leeds. Traditional recipes, premium ingredients, and exceptional taste.",
    image: "https://olgish-cakes.vercel.app/images/logo.png",
    url: "https://olgish-cakes.vercel.app",
    telephone: "+44 113 123 4567", // Update with actual phone number
    email: "hello@olgishcakes.com", // Update with actual email
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Baker Street", // Update with actual address
      addressLocality: "Leeds",
      postalCode: "LS1 1AA", // Update with actual postcode
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "53.8008", // Update with actual coordinates
      longitude: "-1.5491", // Update with actual coordinates
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "10:00",
        closes: "16:00",
      },
    ],
    priceRange: "££",
    servesCuisine: "Ukrainian",
    hasMenu: "https://olgish-cakes.vercel.app/cakes",
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
    sameAs: [
      "https://www.facebook.com/olgishcakes",
      "https://www.instagram.com/olgishcakes",
      "https://www.google.com/maps?cid=YOUR_GOOGLE_MY_BUSINESS_ID",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
