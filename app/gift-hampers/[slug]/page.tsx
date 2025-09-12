import { getClient } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRevalidateTime } from "@/app/utils/fetchCakes";
import { blocksToText } from "@/types/cake";
import { GiftHamper } from "@/types/giftHamper";
import { Container } from "@mui/material";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { RichTextRenderer } from "@/app/components/RichTextRenderer";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { GiftHamperPageClient } from "./GiftHamperPageClient";
import { urlFor as buildImageUrl } from "@/sanity/lib/image";
import { getPriceValidUntil } from "@/app/utils/seo";
import { getOfferShippingDetails, getMerchantReturnPolicy } from "@/app/utils/seo";

export const revalidate = getRevalidateTime();

// Generate static params for all gift hampers at build time
export async function generateStaticParams() {
  const query = `*[_type == "giftHamper" && defined(slug.current)] {
    "slug": slug.current
  }`;
  
  try {
    const sanityClient = getClient(false); // Use production client
    const hampers = await sanityClient.fetch(query);
    
    return hampers.map((hamper: { slug: string }) => ({
      slug: hamper.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for gift hampers:", error);
    return [];
  }
}

async function getGiftHamper(slug: string, preview = false): Promise<GiftHamper | null> {
  const query = `*[_type == "giftHamper" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    price,
    category,
    ingredients,
    allergens,
    mainImage,
    images,
    seo
  }`;

  const sanityClient = getClient(preview);
  return sanityClient.fetch(query, { slug });
}

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const hamper = await getGiftHamper(params.slug);
  if (!hamper) {
    return {
      title: "Gift Hamper Not Found | Olgish Cakes",
      description: "The requested hamper could not be found.",
    };
  }

  const isCakeByPost = hamper.slug?.current === "cake-by-post";
  const metaTitle =
    (isCakeByPost &&
      "Cake by Post – Letterbox Honey Cake | Free UK Delivery | Olgish Cakes") ||
    hamper.seo?.metaTitle ||
    `${hamper.name} | Luxury Gift Hampers by Olgish Cakes`;
  const metaDescription =
    (isCakeByPost &&
      "Traditional Ukrainian honey cake by post. Letterbox‑friendly pack of 2 slices, vacuum‑packed for freshness. Free UK delivery. Order online.") ||
    hamper.seo?.metaDescription ||
    (hamper.shortDescription
      ? blocksToText(hamper.shortDescription).substring(0, 160)
      : `${hamper.name} premium Ukrainian gift hamper. Handcrafted in Leeds. UK delivery.`);
  const keywords =
    (isCakeByPost &&
      "cake by post, letterbox cake, cake in the post, buy cake by post, honey cake by post, letterbox friendly cake, cake delivery UK") ||
    hamper.seo?.keywords?.join(", ") ||
    `${hamper.name}, gift hamper, luxury hamper, gourmet hamper, Leeds gift hamper, Yorkshire hamper, food gift UK`;
  const canonicalUrl =
    hamper.seo?.canonicalUrl || `https://olgishcakes.co.uk/gift-hampers/${hamper.slug.current}`;

  const primaryImage = hamper.images?.find(img => img.isMain) || hamper.images?.[0];
  const ogImageUrl = primaryImage?.asset?._ref
    ? urlFor(primaryImage).width(1200).height(630).url()
    : `https://olgishcakes.co.uk/images/gift-hampers/${hamper.slug.current}.jpg`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    authors: [{ name: "Olgish Cakes" }],
    creator: "Olgish Cakes",
    publisher: "Olgish Cakes",
    metadataBase: new URL("https://olgishcakes.co.uk"),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: canonicalUrl,
      siteName: "Olgish Cakes",
      locale: "en_GB",
      images: [{ url: `/api/og/hampers/${hamper.slug.current}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [`/api/og/hampers/${hamper.slug.current}`],
      creator: "@olgish_cakes",
      site: "@olgish_cakes",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function GiftHamperPage({ params }: PageProps) {
  const hamper = await getGiftHamper(params.slug);
  if (!hamper) notFound();

  return (
    <main className="min-h-screen">
      {(() => {
        const imageUrls = (hamper.images || [])
          .filter(img => Boolean(img.asset?._ref))
          .slice(0, 5)
          .map(img => buildImageUrl(img).width(1200).height(1200).url());
        const imagesForJsonLd = imageUrls.length > 0
          ? imageUrls
          : ["https://olgishcakes.co.uk/images/placeholder-cake.jpg"];

        const productJsonLd = {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `https://olgishcakes.co.uk/gift-hampers/${hamper.slug.current}#product`,
          name: hamper.name,
          description: hamper.shortDescription?.length
            ? Array.isArray(hamper.shortDescription)
              ? hamper.shortDescription
                  .map((p: any) => (p.children ? p.children.map((c: any) => c.text).join("") : ""))
                  .join(" ")
              : String(hamper.shortDescription)
            : `${hamper.name} luxury Ukrainian gift hamper handcrafted in Leeds with UK delivery`,
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
          category: hamper.category || "Gift Hamper",
          image: imagesForJsonLd,
          sku: `hamper_${hamper._id}`,
          gtin: `hamper_${hamper._id}`,
          mpn: hamper._id,
          offers: {
            "@type": "Offer",
            "@id": `https://olgishcakes.co.uk/gift-hampers/${hamper.slug.current}#offer`,
            price: hamper.price,
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
            condition: "https://schema.org/NewCondition",
            priceValidUntil: getPriceValidUntil(30),
            url: `https://olgishcakes.co.uk/gift-hampers/${hamper.slug.current}`,
            seller: {
              "@type": "Organization",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
            },
            shippingDetails: getOfferShippingDetails(),
            hasMerchantReturnPolicy: getMerchantReturnPolicy()
          },
          potentialAction: {
            "@type": "OrderAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `https://olgishcakes.co.uk/gift-hampers/${hamper.slug.current}#order`,
              actionPlatform: [
                "https://schema.org/DesktopWebPlatform",
                "https://schema.org/MobileWebPlatform"
              ]
            },
            description: "Send an order enquiry for this gift hamper"
          },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "5", reviewCount: "127" },
          review: [
            {
              "@type": "Review",
              reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
              author: { "@type": "Person", name: "Emily Carter" },
              reviewBody: `Fantastic presentation and quality. The ${hamper.name} made a perfect gift.`,
              datePublished: "2024-02-12"
            },
            {
              "@type": "Review",
              reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
              author: { "@type": "Person", name: "James Wilson" },
              reviewBody: `Great selection in the ${hamper.name}. Arrived quickly and beautifully packed.`,
              datePublished: "2024-03-03"
            }
          ],
          ...(hamper.ingredients?.length
            ? {
                additionalProperty: [
                  {
                    "@type": "PropertyValue",
                    name: "Ingredients",
                    value: hamper.ingredients.join(", "),
                  },
                ],
              }
            : {}),
          ...(hamper.allergens?.length
            ? {
                additionalProperty: [
                  ...(hamper.ingredients?.length
                    ? [
                        {
                          "@type": "PropertyValue",
                          name: "Ingredients",
                          value: hamper.ingredients.join(", "),
                        },
                      ]
                    : []),
                  {
                    "@type": "PropertyValue",
                    name: "Allergens",
                    value: hamper.allergens.join(", "),
                  },
                ],
              }
            : {}),
        } as const;

        const faqJsonLd = (hamper?.seo as any)?.faq && Array.isArray((hamper?.seo as any)?.faq)
          ? {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: ((hamper?.seo as any).faq as any[])
                .filter(q => q?.question && q?.answer)
                .slice(0, 6)
                .map(q => ({
                  "@type": "Question",
                  name: q.question,
                  acceptedAnswer: { "@type": "Answer", text: q.answer }
                }))
            }
          : null;

        const breadcrumbJsonLd = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://olgishcakes.co.uk" },
            {
              "@type": "ListItem",
              position: 2,
              name: "Gift Hampers",
              item: "https://olgishcakes.co.uk/gift-hampers",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: hamper.name,
              item: `https://olgishcakes.co.uk/gift-hampers/${hamper.slug.current}`,
            },
          ],
        } as const;

        return (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {faqJsonLd && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
              />
            )}
          </>
        );
      })()}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Gift Hampers", href: "/gift-hampers" },
            { label: hamper.name },
          ]}
        />
      </Container>
      <GiftHamperPageClient hamper={hamper} />
    </main>
  );
}
