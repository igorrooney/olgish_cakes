import { getGiftHamperBySlug, getAllGiftHampers } from '@/app/utils/fetchGiftHampers'
import { getMerchantReturnPolicy, getOfferShippingDetails, getPriceValidUntil } from '@/app/utils/seo'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { normalizeCmsTitle } from '@/lib/metadata'
import { BRAND_ID } from '@/lib/schema-constants'
import { formatStructuredDataPrice } from '@/lib/utils/price-formatting'
import { urlFor as buildImageUrl, urlFor } from '@/sanity/lib/image'
import { blocksToText } from '@/types/cake'
import type { GiftHamper } from '@/types/giftHamper'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Brand, Graph, Product } from 'schema-dts'
import { GiftHamperPageClient } from './GiftHamperPageClient'
import { getGiftHamperVisibleDescriptionText } from './description-content'
import { resolveGiftHamperDeliveryContent } from './delivery-content'
import { buildCatalogBackHref } from '../../cakes/catalogNavigation'

// Generate static params for all gift hampers at build time
export async function generateStaticParams() {
  try {
    const hampers = await getAllGiftHampers(false);

    return hampers
      .filter((hamper: GiftHamper) => hamper.slug?.current)
      .map((hamper: GiftHamper) => ({
        slug: hamper.slug.current,
      }));
  } catch (error) {
    console.error("Error generating static params for gift hampers:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function normalizeMetaDescription(value: string | undefined) {
  if (!value) {
    return ''
  }

  return value.replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hamper = await getGiftHamperBySlug(slug);
  if (!hamper) {
    return {
      title: 'Gift hamper not found',
      description: "The requested hamper could not be found.",
    };
  }

  const isCakeByPost = hamper.slug?.current === "cake-by-post";
  const normalizedShortDescription = hamper.shortDescription
    ? normalizeMetaDescription(blocksToText(hamper.shortDescription))
    : ''
  
  // Prioritize custom SEO fields first, then special case optimizations, then generic fallbacks
  const metaTitle =
    hamper.seo?.metaTitle ||
    (isCakeByPost &&
      "Cake by Post Gift Hamper | Traditional Ukrainian Honey Cake UK Delivery") ||
    `${hamper.name} | Cakes by Post UK`;
  const normalizedMetaTitle = normalizeCmsTitle(metaTitle) || hamper.name
  
  const metaDescription =
    normalizeMetaDescription(hamper.seo?.metaDescription) ||
    (isCakeByPost &&
      "Buy traditional Ukrainian honey cake by post from OlgishCakes. Letterbox-friendly gift hamper with vacuum-packed cake slices. Perfect surprise delivery for birthdays, anniversaries & special occasions across the UK.") ||
    normalizedShortDescription ||
    `${hamper.name} premium Ukrainian gift hamper. Handcrafted in Leeds. UK delivery.`;
  const canonicalUrl = `https://olgishcakes.co.uk/cakes-by-post/${hamper.slug?.current || slug}`;

  const primaryImage = hamper.images?.find(img => img.isMain) || hamper.images?.[0];
  const _ogImageUrl = primaryImage?.asset?._ref
    ? urlFor(primaryImage).width(1200).height(630).url()
    : `https://olgishcakes.co.uk/images/gift-hampers/${hamper.slug?.current || slug}.jpg`;

  return {
    title: normalizedMetaTitle,
    description: metaDescription,
    authors: [{ name: "Olgish Cakes" }],
    creator: "Olgish Cakes",
    publisher: "Olgish Cakes",
    metadataBase: new URL("https://olgishcakes.co.uk"),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: normalizedMetaTitle,
      description: metaDescription,
      type: "website",
      url: canonicalUrl,
      siteName: "Olgish Cakes",
      locale: "en_GB",
      images: [{ url: `/api/og/hampers/${hamper.slug?.current || slug}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedMetaTitle,
      description: metaDescription,
      images: [`/api/og/hampers/${hamper.slug?.current || slug}`],
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

export default async function GiftHamperPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const hamper = await getGiftHamperBySlug(slug);
  const backHref = buildCatalogBackHref({
    fallbackHref: '/cakes-by-post',
    fromParam: resolvedSearchParams?.from
  })
  if (!hamper) notFound();

  const resolvedDeliveryContent = resolveGiftHamperDeliveryContent(hamper)
  const shouldEmitShippingDetails = resolvedDeliveryContent.shouldEmitShippingDetails
  const shippingDetailsForStructuredData = shouldEmitShippingDetails
    ? getOfferShippingDetails(
      resolvedDeliveryContent.policy,
      resolvedDeliveryContent.shippingDetailsVisibleClaims
    )
    : undefined
  const shouldLogShippingDetailsOmission = process.env.NODE_ENV !== 'production'

  if (!shouldEmitShippingDetails && shouldLogShippingDetailsOmission) {
    console.warn(
      `[seo][${hamper.slug.current}] Omitted Offer.shippingDetails due to delivery policy mismatch: ${resolvedDeliveryContent.shippingDetailsOmissionReason || 'unknown reason'}`
    )
  }

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
        const visibleDescriptionText = getGiftHamperVisibleDescriptionText(hamper)
        const productJsonLd: Graph = {
          "@context": "https://schema.org",
          "@graph": [
            // Single Brand entity referenced by the product
            {
              "@type": "Brand",
              "@id": BRAND_ID,
              name: BUSINESS_CONSTANTS.NAME,
              url: BUSINESS_CONSTANTS.WEBSITE,
              logo: `${BUSINESS_CONSTANTS.WEBSITE}/images/olgish-cakes-logo-bakery-brand.png`
            } as Brand,
            // Product referencing the brand by @id
            {
              "@type": "Product",
              "@id": `https://olgishcakes.co.uk/cakes-by-post/${hamper.slug?.current || slug}#product`,
              name: hamper.name,
              description: visibleDescriptionText,
              brand: { "@id": BRAND_ID },
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
          offers: {
            "@type": "Offer",
            "@id": `https://olgishcakes.co.uk/cakes-by-post/${hamper.slug?.current || slug}#offer`,
            price: formatStructuredDataPrice(hamper.price, 0),
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
            condition: "https://schema.org/NewCondition",
            priceValidUntil: getPriceValidUntil(30),
            url: `https://olgishcakes.co.uk/cakes-by-post/${hamper.slug?.current || slug}`,
            image: imagesForJsonLd[0],
            seller: {
              "@type": "Organization",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
            },
            ...(shippingDetailsForStructuredData ? { shippingDetails: shippingDetailsForStructuredData } : {}),
            hasMerchantReturnPolicy: getMerchantReturnPolicy()
          },
          potentialAction: {
            "@type": "OrderAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `https://olgishcakes.co.uk/cakes-by-post/${hamper.slug?.current || slug}#order`,
              actionPlatform: [
                "https://schema.org/DesktopWebPlatform",
                "https://schema.org/MobileWebPlatform"
              ]
            },
            description: "Send an order enquiry for this gift hamper"
          },
            } as Product
          ]
        };

        return (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c') }}
            />
          </>
        );
      })()}
      <GiftHamperPageClient
        hamper={hamper}
        backHref={backHref}
      />
    </main>
  );
}
