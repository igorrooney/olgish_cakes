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
import { getAllTestimonialsStats } from "@/app/utils/fetchTestimonials";

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
      "Cake by Post Gift Hamper | Traditional Ukrainian Honey Cake UK Delivery") ||
    hamper.seo?.metaTitle ||
    `${hamper.name} | Luxury Gift Hampers`;
  const metaDescription =
    (isCakeByPost &&
      "Buy traditional Ukrainian honey cake by post from OlgishCakes. Letterbox-friendly gift hamper with vacuum-packed cake slices. Perfect surprise delivery for birthdays, anniversaries & special occasions across the UK.") ||
    hamper.seo?.metaDescription ||
    (hamper.shortDescription
      ? blocksToText(hamper.shortDescription).substring(0, 160)
      : `${hamper.name} premium Ukrainian gift hamper. Handcrafted in Leeds. UK delivery.`);
  const keywords =
    (isCakeByPost &&
      "cake by post, cakes delivered by post, letterbox cakes, order cake online UK, postal cakes UK, cake delivery by post, cake by post UK, cakes delivered UK, honey cake by post, letterbox friendly cake, surprise cake delivery, birthday cake by post, anniversary cake delivery, cake gift by post") ||
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
  const [hamper, testimonialStats] = await Promise.all([
    getGiftHamper(params.slug),
    getAllTestimonialsStats()
  ]);
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

        const isCakeByPost = hamper.slug?.current === "cake-by-post";
        const productJsonLd = {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `https://olgishcakes.co.uk/gift-hampers/${hamper.slug.current}#product`,
          name: hamper.name,
          description: isCakeByPost
            ? "Traditional Ukrainian honey cake by post. Letterbox-friendly pack of 2 slices, vacuum-packed for freshness. Perfect for surprising loved ones with delicious cake delivery anywhere in the UK."
            : hamper.shortDescription?.length
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
          category: isCakeByPost ? "Food & Beverage > Baked Goods > Cakes" : (hamper.category || "Gift Hamper"),
          image: imagesForJsonLd,
          sku: `OC-HAMPER-${(hamper.slug?.current || hamper._id || 'hamper').toUpperCase().replace(/[^A-Z0-9]/g, '-').substring(0, 20)}`,
          mpn: `${(hamper.slug?.current || hamper._id || 'hamper').toUpperCase()}-${hamper.price || 'QUOTE'}`,
          keywords: isCakeByPost ? "honey cake by post, cake by post UK, letterbox delivery, traditional Ukrainian cake, cake by post service, letterbox friendly cake" : undefined,
          ...(hamper.allergens && hamper.allergens.length > 0 && {
            containsAllergens: hamper.allergens,
          }),
          additionalProperty: [
            ...(isCakeByPost ? [
              {
                "@type": "PropertyValue",
                name: "Delivery Method",
                value: "Letterbox Post"
              },
              {
                "@type": "PropertyValue",
                name: "Packaging",
                value: "Vacuum Sealed"
              },
              {
                "@type": "PropertyValue",
                name: "Shelf Life",
                value: "7 days"
              }
            ] : []),
            ...(hamper.allergens && hamper.allergens.length > 0 ? [{
              "@type": "PropertyValue",
              name: "Allergens",
              value: hamper.allergens.join(", ")
            }] : [])
          ],
          ...(isCakeByPost && {
            nutrition: {
              "@type": "NutritionInformation",
              calories: "320 calories",
              fatContent: "12 grams",
              saturatedFatContent: "7 grams",
              carbohydrateContent: "48 grams",
              sugarContent: "28 grams",
              proteinContent: "5 grams",
              servingSize: "100g"
            }
          }),
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
            shippingDetails: isCakeByPost ? {
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
            } : getOfferShippingDetails(),
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
          aggregateRating: { 
            "@type": "AggregateRating", 
            ratingValue: testimonialStats.averageRating.toFixed(1), 
            reviewCount: testimonialStats.count.toString(), 
            bestRating: "5", 
            worstRating: "1" 
          },
          review: [
            {
              "@type": "Review",
              itemReviewed: {
                "@type": "Product",
                name: hamper.name,
                description: isCakeByPost
                  ? "Traditional Ukrainian honey cake by post. Letterbox-friendly pack of 2 slices, vacuum-packed for freshness. Perfect for surprising loved ones with delicious cake delivery anywhere in the UK."
                  : hamper.shortDescription?.length
                    ? Array.isArray(hamper.shortDescription)
                      ? hamper.shortDescription
                          .map((p: any) => (p.children ? p.children.map((c: any) => c.text).join("") : ""))
                          .join(" ")
                      : String(hamper.shortDescription)
                    : `${hamper.name} luxury Ukrainian gift hamper handcrafted in Leeds with UK delivery`,
                brand: {
                  "@type": "Brand",
                  name: "Olgish Cakes"
                }
              },
              reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
              author: { "@type": "Person", name: "Emily Carter" },
              reviewBody: `Fantastic presentation and quality. The ${hamper.name} made a perfect gift.`,
              datePublished: "2024-02-12"
            },
            {
              "@type": "Review",
              itemReviewed: {
                "@type": "Product",
                name: hamper.name,
                description: isCakeByPost
                  ? "Traditional Ukrainian honey cake by post. Letterbox-friendly pack of 2 slices, vacuum-packed for freshness. Perfect for surprising loved ones with delicious cake delivery anywhere in the UK."
                  : hamper.shortDescription?.length
                    ? Array.isArray(hamper.shortDescription)
                      ? hamper.shortDescription
                          .map((p: any) => (p.children ? p.children.map((c: any) => c.text).join("") : ""))
                          .join(" ")
                      : String(hamper.shortDescription)
                    : `${hamper.name} luxury Ukrainian gift hamper handcrafted in Leeds with UK delivery`,
                brand: {
                  "@type": "Brand",
                  name: "Olgish Cakes"
                }
              },
              reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
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

        const faqJsonLd = isCakeByPost
          ? {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is cake by post?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Cake by post is a convenient way to send delicious cakes through the mail. Our letterbox-friendly packaging ensures your cake arrives fresh and ready to enjoy, perfect for surprising loved ones anywhere in the UK."
                  }
                },
                {
                  "@type": "Question",
                  name: "How long does cake by post stay fresh?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our cakes are vacuum-packed and specially designed for postal delivery. They stay fresh for up to 7 days when stored properly. We recommend consuming within 3-4 days for the best taste experience."
                  }
                },
                {
                  "@type": "Question",
                  name: "Do you deliver cake by post to all UK addresses?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, we deliver our cake by post service to all UK mainland addresses. We offer free standard delivery on all orders. For guaranteed delivery on a specific day, please contact us directly."
                  }
                },
                {
                  "@type": "Question",
                  name: "What types of cake can be sent by post?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We specialize in traditional Ukrainian honey cake (honey cake) that's perfect for postal delivery. Our cakes are cut into letterbox-friendly slices and vacuum-packed to maintain freshness during transit."
                  }
                },
                {
                  "@type": "Question",
                  name: "How do I order cake by post?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Simply select the 'Cake by Post' option, add to cart, and proceed to checkout. Include the recipient's address and any special delivery instructions. We'll pack and ship your cake within 2-3 working days."
                  }
                }
              ]
            }
          : (hamper?.seo as any)?.faq && Array.isArray((hamper?.seo as any)?.faq)
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
