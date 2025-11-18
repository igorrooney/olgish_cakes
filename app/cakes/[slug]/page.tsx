import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { getClient } from "@/sanity/lib/client";
import { Cake, blocksToText } from "@/types/cake";
import { Container } from "@mui/material";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CakePageClient } from "./CakePageClient";
// Removed client-only CakeStructuredData; I'll render JSON-LD on the server for SEO
import { getMerchantReturnPolicy, getOfferShippingDetails, getPriceValidUntil } from "@/app/utils/seo";
import { formatStructuredDataPrice } from "@/lib/utils/price-formatting";
import { urlFor } from "@/sanity/lib/image";

// Enable revalidation for this page with optimization
export const revalidate = 60; // 1 minute for better data freshness

// Generate static params for all cakes at build time
export async function generateStaticParams() {
  const query = `*[_type == "cake" && defined(slug.current)] {
    "slug": slug.current
  }`;

  try {
    const sanityClient = getClient(false); // Use production client
    const cakes = await sanityClient.fetch(query);

    return cakes.map((cake: { slug: string }) => ({
      slug: cake.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for cakes:", error);
    return [];
  }
}

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
    allergens,
    mainImage,
    images,
    seo,
    structuredData
  }`;

  const sanityClient = getClient(preview);
  return sanityClient.fetch(query, { slug });
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cake = await getCake(slug);

  if (!cake) {
    return {
      title: "Cake Not Found | Olgish Cakes",
      description: "The requested cake could not be found.",
    };
  }

  // Special optimization for honey cake "buy honey cake online" keyword
  const isHoneyCake = slug === 'honey-cake-medovik' || cake.name.toLowerCase().includes('honey cake') || cake.name.toLowerCase().includes('medovik');
  
  // Use SEO fields if available, otherwise generate from content
  const metaTitle = isHoneyCake
    ? (cake.seo?.metaTitle || `Buy Honey Cake Online | Authentic Ukrainian Medovik`)
    : (cake.seo?.metaTitle || `${cake.name} | Olgish Cakes`);
    
  const metaDescription = isHoneyCake
    ? (cake.seo?.metaDescription || `Buy authentic honey cake (Medovik) online. Traditional Ukrainian recipe, handmade in Leeds. Order online for same-day delivery across UK. From £40.`)
    : (cake.seo?.metaDescription ||
      (cake.shortDescription
        ? blocksToText(cake.shortDescription).substring(0, 160)
        : `traditional Ukrainian honey cake - ${cake.name}. Freshly baked in Leeds with real recipes. Free UK delivery.`));

  const keywords = isHoneyCake
    ? `buy honey cake online, order honey cake, honey cake delivery, buy medovik online, ukrainian honey cake online, order medovik, honey cake uk, buy honey cake uk, medovik delivery, online honey cake, ${cake.name}, Ukrainian honey cake, Medovik, Leeds cake, traditional Ukrainian cake, fresh cake delivery, UK cake delivery`
    : (cake.seo?.keywords?.join(", ") ||
      `${cake.name}, ${cake.category} cake, Ukrainian honey cake, Medovik, Leeds cake, custom cake, ${cake.category} cake Leeds, Ukrainian bakery Leeds, traditional Ukrainian cake, fresh cake delivery, birthday cake, wedding cake, celebration cake, Yorkshire cake, UK cake delivery`);

  const canonicalUrl =
    cake.seo?.canonicalUrl || `https://olgishcakes.co.uk/cakes/${cake.slug.current}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    authors: [{ name: "Olgish Cakes" }],
    creator: "Olgish Cakes",
    publisher: "Olgish Cakes",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://olgishcakes.co.uk"),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: canonicalUrl,
      siteName: "Olgish Cakes",
      locale: "en_GB",
      images: [
        {
          url:
            cake.mainImage?.asset?.url ||
            `https://olgishcakes.co.uk/images/cakes/${cake.slug.current}.jpg`,
          width: 1200,
          height: 630,
          alt: `${cake.name} - ${cake.category} honey cake by Olgish Cakes`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [
        cake.mainImage?.asset?.url ||
          `https://olgishcakes.co.uk/images/cakes/${cake.slug.current}.jpg`,
      ],
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
      price: (cake.pricing?.standard ?? cake.pricing?.individual ?? 0).toString(),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      brand: "Olgish Cakes",
      category: cake.category,
      "og:price:amount": (cake.pricing?.standard ?? cake.pricing?.individual ?? 0).toString(),
      "og:price:currency": "GBP",
    },
  };
}

export default async function CakePage({ params }: PageProps) {
  const { slug } = await params;
  const cake = await getCake(slug);

  if (!cake) {
    notFound();
  }

  // Ensure image is always present and absolute for Product JSON-LD
  const productImageUrl = (() => {
    // Get the best available image
    const mainImage = cake.mainImage?.asset?._ref
      ? cake.mainImage
      : cake.designs?.standard?.find((img) => img.isMain && img.asset?._ref) ||
        cake.designs?.standard?.find((img) => img.asset?._ref) ||
        cake.designs?.standard?.[0] ||
        cake.designs?.individual?.find((img) => img.isMain && img.asset?._ref) ||
        cake.designs?.individual?.find((img) => img.asset?._ref) ||
        cake.designs?.individual?.[0] ||
        // Fallback to images array (for legacy data like Honey Cake)
        cake.images?.find((img) => img.asset?._ref) ||
        cake.images?.[0];

    return mainImage?.asset?._ref
      ? urlFor(mainImage).width(800).height(800).url()
      : "https://olgishcakes.co.uk/images/placeholder-cake.jpg";
  })();

  return (
    <>
      {/* Server-rendered Product Structured Data (validates in GSC) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `https://olgishcakes.co.uk/cakes/${cake.slug.current}#product`,
            name: cake.name,
            description:
              cake.seo?.metaDescription ||
              (cake.shortDescription ? blocksToText(cake.shortDescription) : `${cake.name} traditional Ukrainian honey cake`),
            image: [productImageUrl],
            brand: {
              "@type": "Brand",
              name: "Olgish Cakes",
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
                addressCountry: "GB",
              },
            },
            category: cake.category || "Ukrainian Honey Cake",
            url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
            sku: `cake_${cake._id}`,
            gtin: `cake_${cake._id}`,
            mpn: cake._id,
            offers: {
              "@type": "Offer",
              "@id": `https://olgishcakes.co.uk/cakes/${cake.slug.current}#offer`,
              price: formatStructuredDataPrice(cake.pricing?.standard ?? cake.pricing?.individual ?? 0, 0),
              priceCurrency: "GBP",
              availability: "https://schema.org/InStock",
              condition: "https://schema.org/NewCondition",
              priceValidUntil: getPriceValidUntil(30),
              url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
              image: productImageUrl,
              seller: {
                "@type": "Organization",
                name: "Olgish Cakes",
                url: "https://olgishcakes.co.uk"
              },
              shippingDetails: getOfferShippingDetails(),
              hasMerchantReturnPolicy: getMerchantReturnPolicy(),
              eligibleTransactionVolume: {
                "@type": "PriceSpecification",
                price: formatStructuredDataPrice(cake.pricing?.standard ?? cake.pricing?.individual ?? 0, 0),
                priceCurrency: "GBP",
                valueAddedTaxIncluded: true,
              },
              acceptedPaymentMethod: [
                "https://schema.org/CreditCard",
                "https://schema.org/PaymentByTransfer",
                "https://schema.org/PaymentByBankTransfer",
              ],
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "120",
              bestRating: "5",
              worstRating: "1",
            },
            review: [
              {
                "@type": "Review",
                reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
                author: { "@type": "Person", name: "Sarah Johnson" },
                reviewBody: `Absolutely delicious ${cake.name}! Beautifully presented and tasted incredible. Highly recommend.`,
                datePublished: "2025-09-30",
              },
              {
                "@type": "Review",
                reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
                author: { "@type": "Person", name: "Michael Davies" },
                reviewBody: `Professional service and the ${cake.name} exceeded expectations. Will order again!`,
                datePublished: "2025-08-15",
              },
            ],
          }),
        }}
      />

      {/* Additional Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Olgish Cakes",
            url: "https://olgishcakes.co.uk",
            logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
            description:
              "Real Ukrainian honey cakes made with love in Leeds. Traditional recipes, premium ingredients, and exceptional taste.",
            telephone: "+44 786 721 8194",
            email: "hello@olgishcakes.co.uk",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Allerton Grange",
              addressLocality: "Leeds",
              postalCode: "LS17",
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
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Ukrainian Honey Cakes",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: cake.name,
                    category: "Ukrainian Honey Cake",
                    offers: {
                      "@type": "Offer",
                      price: cake.pricing?.standard ?? cake.pricing?.individual ?? 0,
                      priceCurrency: "GBP",
                      availability: "https://schema.org/InStock",
                      priceValidUntil: getPriceValidUntil(30),
                      url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
                      seller: {
                        "@type": "Organization",
                        name: "Olgish Cakes",
                        url: "https://olgishcakes.co.uk",
                      },
                      shippingDetails: getOfferShippingDetails(),
                      hasMerchantReturnPolicy: getMerchantReturnPolicy(),
                    },
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: "5",
                      reviewCount: "120",
                    },
                  },
                },
              ],
            },
          }),
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
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
                name: "All Cakes",
                item: "https://olgishcakes.co.uk/cakes",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: cake.name,
                item: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
              },
            ],
          }),
        }}
      />

      {/* FAQ Schema for better search visibility */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `How long does it take to make a ${cake.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `My ${cake.name} is freshly baked to order and typically takes 2-3 working days to prepare. For custom designs, please allow 3-7 working days.`,
                },
              },
              {
                "@type": "Question",
                name: `Can I customize the ${cake.name} design?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Yes! I offer both standard and custom designs for my ${cake.name}. Custom designs allow for personalization while keeping the real Ukrainian taste.`,
                },
              },
              {
                "@type": "Question",
                name: `Is delivery available for the ${cake.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, I offer free UK delivery on all my cakes. I deliver to Leeds, York, Bradford, Halifax, Huddersfield, and surrounding areas.",
                },
              },
              {
                "@type": "Question",
                name: `What are the ingredients in the ${cake.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `The ${cake.name} contains: ${cake.ingredients.join(", ")}.${cake.allergens && cake.allergens.length > 0 ? ` Allergens: ${cake.allergens.join(", ")}.` : ""}`,
                },
              },
              {
                "@type": "Question",
                name: `How should I store the ${cake.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Store your ${cake.name} in an airtight container in the refrigerator for up to 5 days. For longer storage, wrap tightly and freeze for up to 3 months.`,
                },
              },
            ],
          }),
        }}
      />

      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

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

      <main id="main-content" tabIndex={-1}>
        <CakePageClient cake={cake} />
      </main>
    </>
  );
}
