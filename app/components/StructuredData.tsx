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
    telephone: "+44 786 721 8194",
    email: "olgish.cakes@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "107 Harehills Lane",
      addressLocality: "Leeds",
      postalCode: "LS8 4DN",
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
      "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
      "https://www.instagram.com/olgish_cakes/",
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
