import { Metadata } from "next";
import Script from "next/script";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Olgish Cakes - Traditional Ukrainian Baking in Leeds | Honey Cake & Medovik",
  description:
    "Learn about Olgish Cakes, a Ukrainian bakery in Leeds specializing in traditional cakes like honey cake (Medovik), Kyiv cake, and authentic Ukrainian desserts.",
  keywords:
    "Ukrainian bakery Leeds, Ukrainian cakes Leeds, Olga baker Leeds, traditional Ukrainian cakes, honey cake Leeds, Medovik Leeds, Kyiv cake Leeds, custom cakes Leeds, artisan bakery Leeds, traditional medovik",
  openGraph: {
    title: "About Olgish Cakes | Traditional Ukrainian Bakery in Leeds | Honey Cake & Medovik",
    description:
      "Discover authentic Ukrainian cakes in Leeds at Olgish Cakes. Professional baker Olga creates traditional honey cake (Medovik), Kyiv cakes & custom celebration cakes using time-honored recipes.",
    url: "https://olgishcakes.co.uk/about",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/about-baker.jpg",
        width: 1200,
        height: 630,
        alt: "Olga from Olgish Cakes - Ukrainian Baker in Leeds - Honey Cake & Medovik",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Olgish Cakes | Traditional Ukrainian Bakery in Leeds | Honey Cake & Medovik",
    description:
      "Discover authentic Ukrainian cakes in Leeds at Olgish Cakes. Professional baker Olga creates traditional honey cake (Medovik), Kyiv cakes & custom celebration cakes using time-honored recipes.",
    images: ["https://olgishcakes.co.uk/images/about-baker.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </Script>

      <Script id="about-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BakeryBusiness",
          name: "Olgish Cakes",
          image: "https://olgishcakes.co.uk/images/about-baker.jpg",
          "@id": "https://olgishcakes.co.uk",
          url: "https://olgishcakes.co.uk",
          telephone: "+44 786 721 8194",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Allerton Grange",
            addressLocality: "Leeds",
            postalCode: "LS17",
            addressCountry: "GB",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "53.8080",
            longitude: "-1.5200",
          },
          description:
            "Olgish Cakes is an artisan Ukrainian bakery in Leeds, specializing in traditional cakes and pastries. Founded by professional baker Olga, who brings authentic Ukrainian recipes and techniques to create beautiful, delicious celebration cakes.",
          founder: {
            "@type": "Person",
            name: "Olga Ieromenko",
            jobTitle: "Professional Baker",
            description: "A professionally-trained Ukrainian baker who moved to Leeds in 2022",
          },
          sameAs: [
            "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
            "https://www.instagram.com/olgish_cakes/",
          ],
          priceRange: "££",
          servesCuisine: "Ukrainian",
          offers: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Cherry Cake (Vyshnevyi)",
                description:
                  "A delightful Ukrainian Cherry Cake featuring layers of soft sponge cake filled with sweet-tart cherry filling and topped with vanilla cream.",
                price: "38.00",
                priceCurrency: "GBP",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Poppy Seed Roll (Makivnyk)",
                description:
                  "Traditional Ukrainian Poppy Seed Roll with a soft yeast dough filled with sweetened poppy seed filling.",
                price: "35.00",
                priceCurrency: "GBP",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Napoleon Cake",
                description:
                  "A Ukrainian take on the classic Napoleon cake with multiple layers of flaky puff pastry and rich vanilla custard cream.",
                price: "42.00",
                priceCurrency: "GBP",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Honey Cake (Medovik)",
                description:
                  "Traditional Ukrainian Honey Cake with delicate honey-infused layers and smooth sour cream filling.",
                price: "40.00",
                priceCurrency: "GBP",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Kyiv Cake",
                description:
                  "The legendary Kyiv Cake featuring crispy meringue layers with hazelnuts, filled with chocolate-buttercream frosting.",
                price: "45.00",
                priceCurrency: "GBP",
              },
            },
          ],
        })}
      </Script>

      <AboutContent />
    </>
  );
}
