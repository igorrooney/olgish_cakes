import { getClient } from "@/sanity/lib/client";
import { Cake, blocksToText } from "@/types/cake";
import { notFound } from "next/navigation";
import { CakePageClient } from "./CakePageClient";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@mui/material";
import { Metadata } from "next";
import { getRevalidateTime } from "@/app/utils/fetchCakes";

// Enable revalidation for this page
export const revalidate = getRevalidateTime();

async function getCake(slug: string, preview = false): Promise<Cake | null> {
  const query = `*[_type == "cake" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    designs,
    category,
    ingredients,
    allergens
  }`;

  const sanityClient = getClient(preview);
  return sanityClient.fetch(query, { slug });
}

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cake = await getCake(params.slug);

  if (!cake) {
    return {
      title: "Cake Not Found | Olgish Cakes",
      description: "The requested cake could not be found.",
    };
  }

  const description = cake.shortDescription
    ? blocksToText(cake.shortDescription)
    : blocksToText(cake.description);
  const title = `${cake.name} | Olgish Cakes - Traditional Ukrainian Cakes in Leeds`;
  const keywords = `${cake.name}, ${cake.category} cake, Ukrainian cake, honey cake, Medovik, Leeds cake, custom cake, ${cake.category} cake Leeds, Ukrainian bakery Leeds, traditional Ukrainian cake, fresh cake delivery, birthday cake, wedding cake, celebration cake, Yorkshire cake, UK cake delivery`;

  return {
    title,
    description,
    keywords,
    authors: [{ name: "Olgish Cakes" }],
    creator: "Olgish Cakes",
    publisher: "Olgish Cakes",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://olgish-cakes.vercel.app"),
    alternates: {
      canonical: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
      siteName: "Olgish Cakes",
      locale: "en_GB",
      images: [
        {
          url: `https://olgish-cakes.vercel.app/images/cakes/${cake.slug.current}.jpg`,
          width: 1200,
          height: 630,
          alt: `${cake.name} - ${cake.category} cake by Olgish Cakes`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://olgish-cakes.vercel.app/images/cakes/${cake.slug.current}.jpg`],
      creator: "@olgish_cakes",
      site: "@olgish_cakes",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
    other: {
      price: cake.pricing.standard.toString(),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      brand: "Olgish Cakes",
      category: cake.category,
    },
  };
}

export default async function CakePage({ params }: PageProps) {
  const cake = await getCake(params.slug);

  if (!cake) {
    notFound();
  }

  // Generate structured data for the cake
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cake.name,
    description: cake.shortDescription
      ? blocksToText(cake.shortDescription)
      : blocksToText(cake.description),
    image: `https://olgish-cakes.vercel.app/images/cakes/${cake.slug.current}.jpg`,
    url: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
      url: "https://olgish-cakes.vercel.app",
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
        name: "Ingredients",
        value: cake.ingredients.join(", "),
      },
      {
        "@type": "PropertyValue",
        name: "Cake Type",
        value: "Ukrainian Traditional Cake",
      },
      {
        "@type": "PropertyValue",
        name: "Baking Method",
        value: "Freshly Baked to Order",
      },
      {
        "@type": "PropertyValue",
        name: "Delivery",
        value: "Free UK Delivery",
      },
      ...(cake.allergens && cake.allergens.length > 0
        ? [
            {
              "@type": "PropertyValue",
              name: "Allergens",
              value: cake.allergens.join(", "),
            },
          ]
        : []),
    ],
    offers: [
      {
        "@type": "Offer",
        name: `${cake.name} - Standard Design`,
        price: cake.pricing.standard,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "Olgish Cakes",
          url: "https://olgish-cakes.vercel.app",
          telephone: "+44 786 721 8194",
          email: "olgish.cakes@gmail.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "107 Harehills Lane",
            addressLocality: "Leeds",
            postalCode: "LS8 4DN",
            addressRegion: "West Yorkshire",
            addressCountry: "GB",
          },
        },
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
        deliveryLeadTime: {
          "@type": "QuantitativeValue",
          minValue: 2,
          maxValue: 5,
          unitText: "DAY",
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "GBP",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 3,
              unitText: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 2,
              unitText: "DAY",
            },
          },
        },
      },
      ...(cake.pricing.individual
        ? [
            {
              "@type": "Offer",
              name: `${cake.name} - Custom Design`,
              price: cake.pricing.individual,
              priceCurrency: "GBP",
              availability: "https://schema.org/InStock",
              seller: {
                "@type": "Organization",
                name: "Olgish Cakes",
                url: "https://olgish-cakes.vercel.app",
                telephone: "+44 786 721 8194",
                email: "olgish.cakes@gmail.com",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "107 Harehills Lane",
                  addressLocality: "Leeds",
                  postalCode: "LS8 4DN",
                  addressRegion: "West Yorkshire",
                  addressCountry: "GB",
                },
              },
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
              deliveryLeadTime: {
                "@type": "QuantitativeValue",
                minValue: 3,
                maxValue: 7,
                unitText: "DAY",
              },
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                  "@type": "MonetaryAmount",
                  value: "0",
                  currency: "GBP",
                },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: {
                    "@type": "QuantitativeValue",
                    minValue: 2,
                    maxValue: 5,
                    unitText: "DAY",
                  },
                  transitTime: {
                    "@type": "QuantitativeValue",
                    minValue: 1,
                    maxValue: 2,
                    unitText: "DAY",
                  },
                },
              },
            },
          ]
        : []),
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "50",
      bestRating: "5",
      worstRating: "1",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://olgish-cakes.vercel.app",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "All Cakes",
          item: "https://olgish-cakes.vercel.app/cakes",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: cake.name,
          item: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
        },
      ],
    },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is included with this cake?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Each cake comes with free UK delivery and a gift note included. Cakes are freshly baked to order.",
          },
        },
        {
          "@type": "Question",
          name: "How long does delivery take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We aim to ship orders within 2-3 working days. For guaranteed delivery on a specific day, please contact us directly.",
          },
        },
        {
          "@type": "Question",
          name: "Can I customize this cake?",
          acceptedAnswer: {
            "@type": "Answer",
            text: cake.pricing.individual
              ? "Yes, we offer custom design options for this cake. Please select the custom design option when ordering."
              : "This cake is available in our standard design. For custom cakes, please browse our custom cake collection.",
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Additional Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Olgish Cakes",
            url: "https://olgish-cakes.vercel.app",
            logo: "https://olgish-cakes.vercel.app/logo.png",
            description:
              "Authentic Ukrainian cakes made with love in Leeds. Traditional recipes, premium ingredients, and exceptional taste.",
            telephone: "+44 786 721 8194",
            email: "olgish.cakes@gmail.com",
            address: {
              "@type": "PostalAddress",
              streetAddress: "107 Harehills Lane",
              addressLocality: "Leeds",
              postalCode: "LS8 4DN",
              addressRegion: "West Yorkshire",
              addressCountry: "GB",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: "53.8008",
              longitude: "-1.5491",
            },
            sameAs: [
              "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
              "https://www.instagram.com/olgish_cakes/",
            ],
          }),
        }}
      />

      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <nav aria-label="Breadcrumb navigation">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "All Cakes", href: "/cakes" },
              { label: cake.name, href: `/cakes/${cake.slug.current}` },
            ]}
          />
        </nav>
      </Container>

      <CakePageClient cake={cake} />
    </>
  );
}
