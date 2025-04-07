import { MetadataRoute } from "next";

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Olgish Cakes",
    description: "Authentic Ukrainian cakes made with love in Leeds",
    image: "https://olgishcakes.com/og-image.jpg",
    url: "https://olgishcakes.com",
    telephone: "+44 123 456 7890", // Replace with your actual phone number
    address: {
      "@type": "PostalAddress",
      streetAddress: "Your Street Address", // Replace with your actual address
      addressLocality: "Leeds",
      postalCode: "Your Postcode", // Replace with your actual postcode
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "53.8008", // Replace with your actual coordinates
      longitude: "-1.5491", // Replace with your actual coordinates
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "££",
    servesCuisine: "Ukrainian",
    hasMenu: "https://olgishcakes.com/cakes",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
