import { getAllCakes, getCakeBySlug } from '@/app/utils/fetchCakes'
import { Cake, blocksToText } from '@/types/cake'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CakePageClient, type CakePageClientData } from './CakePageClient'
// Removed client-only CakeStructuredData; I'll render JSON-LD on the server for SEO
import { getMerchantReturnPolicy, getOfferShippingDetails } from '@/app/utils/seo'
import { ensureAbsoluteImageUrl, getSanityCdnImageUrl } from '@/lib/utils/image-url'
import { resolveCakeBasePrice } from '@/lib/utils/cake-base-price'
import { normalizeCmsTitle } from '@/lib/metadata'
import { formatStructuredDataPrice } from '@/lib/utils/price-formatting'
import { urlFor } from '@/sanity/lib/image'
import { resolveCakeDeliveryContent, type ResolvedCakeDeliveryContent } from './delivery-content'
import { buildCatalogBackHref } from '../catalogNavigation'
import type { CatalogProductDetailImage } from '../components/CatalogProductDetailLayout'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

type UrlForImage = Parameters<typeof urlFor>[0]
type CakeGalleryImageInput = {
  asset?: {
    _ref?: string
  }
  alt?: string
}

// Generate static params for all cakes at build time
export async function generateStaticParams() {
  try {
    const cakes = await getAllCakes(false);

    return cakes
      .filter((cake: Cake) => cake.slug?.current)
      .map((cake: Cake) => ({
        slug: cake.slug.current,
      }));
  } catch (error) {
    console.error("Cake static parameter generation failed", {
      operation: "cakes.static-params.generate",
      ...toSafeOperationalError(error),
    });
    return [];
  }
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function normalizeMetaDescription(value: string | undefined) {
  if (!value) {
    return ''
  }

  return value.replace(/\s+/g, ' ').trim()
}

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function getCakePrimaryImage(cake: Cake): UrlForImage | null {
  const primaryImage = cake.mainImage?.asset?._ref
    ? cake.mainImage
    : cake.designs?.standard?.find((img) => img.isMain && img.asset?._ref) ||
      cake.designs?.standard?.find((img) => img.asset?._ref) ||
      cake.designs?.standard?.[0] ||
      cake.designs?.individual?.find((img) => img.isMain && img.asset?._ref) ||
      cake.designs?.individual?.find((img) => img.asset?._ref) ||
      cake.designs?.individual?.[0] ||
      cake.images?.find((img) => img.asset?._ref) ||
      cake.images?.[0]

  return primaryImage?.asset?._ref ? primaryImage as UrlForImage : null
}

function hasImageAssetReference(value: unknown): value is { asset: { _ref: string }, alt?: string } {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const maybeImage = value as { asset?: { _ref?: unknown } }

  return typeof maybeImage.asset?._ref === 'string' && maybeImage.asset._ref.length > 0
}

function getCakeGalleryImageUrl(image: CakeGalleryImageInput) {
  const rawImageUrl = urlFor(image as UrlForImage).width(960).height(960).url()

  return getSanityCdnImageUrl(rawImageUrl, {
    width: 960,
    height: 960,
    fit: 'crop',
    quality: 80
  }) ?? rawImageUrl
}

function mapCakeImagesToGallery(cake: Cake): CatalogProductDetailImage[] {
  const mappedImages: CatalogProductDetailImage[] = []
  const imageUrls = new Set<string>()
  const fallbackAlt = `${cake.name} by Olgish Cakes`

  function addImage(image: CakeGalleryImageInput | undefined) {
    if (!image || !hasImageAssetReference(image)) {
      return
    }

    const imageUrl = getCakeGalleryImageUrl(image)

    if (imageUrl.length === 0 || imageUrls.has(imageUrl)) {
      return
    }

    imageUrls.add(imageUrl)
    mappedImages.push({
      src: imageUrl,
      alt: typeof image.alt === 'string' && image.alt.trim().length > 0
        ? image.alt.trim()
        : fallbackAlt
    })
  }

  addImage(cake.mainImage)
  cake.designs?.standard?.forEach((image) => addImage(image))
  cake.designs?.individual?.forEach((image) => addImage(image))
  cake.images?.forEach((image) => addImage(image))

  return mappedImages
}

function mapCakeFillingOptions(cake: Cake): NonNullable<CakePageClientData['fillingOptions']> {
  const seenFillingIds = new Set<string>()

  return cake.fillingTypes?.flatMap((fillingType) => {
    const fillingId = typeof fillingType._id === 'string' ? fillingType._id.trim() : ''
    const fillingName = typeof fillingType.name === 'string' ? fillingType.name.trim() : ''

    if (fillingId.length === 0 || fillingName.length === 0 || seenFillingIds.has(fillingId)) {
      return []
    }

    seenFillingIds.add(fillingId)

    const fillingImage = hasImageAssetReference(fillingType.image)
      ? {
          src: getCakeGalleryImageUrl(fillingType.image),
          alt: typeof fillingType.image.alt === 'string' && fillingType.image.alt.trim().length > 0
            ? fillingType.image.alt.trim()
            : `${fillingName} filling for ${cake.name}`
        }
      : null

    return [{
      id: fillingId,
      name: fillingName,
      image: fillingImage
    }]
  }) ?? []
}

function getCakePageClientData(
  cake: Cake,
  deliveryContent: ResolvedCakeDeliveryContent
): CakePageClientData {
  return {
    name: cake.name,
    slug: cake.slug,
    description: cake.description,
    shortDescription: cake.shortDescription,
    deliveryContent,
    pricing: cake.pricing,
    newDesignPricingByServings: cake.newDesignPricingByServings,
    fillingOptions: mapCakeFillingOptions(cake),
    defaultFillingTypeId: cake.defaultFillingType?._id,
    galleryImages: mapCakeImagesToGallery(cake),
    ingredients: cake.ingredients,
    allergens: cake.allergens,
    ingredientReference: cake.ingredientReference
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cake = await getCakeBySlug(slug);

  if (!cake) {
    return {
      title: 'Cake not found',
      description: "The requested cake could not be found.",
    };
  }
  const cakeBasePrice = resolveCakeBasePrice({
    newDesignPricingByServings: cake.newDesignPricingByServings,
    pricing: cake.pricing
  })

  // Special optimization for honey cake "buy honey cake online" keyword
  const isHoneyCake = slug === 'honey-cake-medovik' || cake.name.toLowerCase().includes('honey cake') || cake.name.toLowerCase().includes('medovik');
  const normalizedShortDescription = cake.shortDescription
    ? normalizeMetaDescription(blocksToText(cake.shortDescription))
    : ''

  // Use SEO fields if available, otherwise generate from content
  const metaTitle = isHoneyCake
    ? (cake.seo?.metaTitle || 'Honey Cake (Medovik) | Olgish Cakes')
    : (cake.seo?.metaTitle || `${cake.name} | Olgish Cakes`);
  const normalizedMetaTitle = normalizeCmsTitle(metaTitle) || cake.name

  const metaDescription = isHoneyCake
    ? (normalizeMetaDescription(cake.seo?.metaDescription) ||
      `Traditional Ukrainian honey cake (Medovik), handmade in Leeds. Prices start from £${formatStructuredDataPrice(cakeBasePrice, 0)}. Send an enquiry and we'll confirm collection or delivery for your date.`)
    : (normalizeMetaDescription(cake.seo?.metaDescription) ||
      normalizedShortDescription ||
      `Traditional Ukrainian honey cake - ${cake.name}, freshly baked in Leeds. Ask us to confirm collection or delivery for your date.`);

  const canonicalUrl = `https://olgishcakes.co.uk/cakes/${cake.slug.current}`;

  return {
    title: normalizedMetaTitle,
    description: metaDescription,
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
      title: normalizedMetaTitle,
      description: metaDescription,
      type: "website",
      url: canonicalUrl,
      siteName: "Olgish Cakes",
      locale: "en_GB",
      images: [
        {
          url:
            cake.mainImage?.asset?.url ||
            'https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png',
          width: 1200,
          height: 630,
          alt: `${cake.name} - ${cake.category} honey cake by Olgish Cakes`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedMetaTitle,
      description: metaDescription,
      images: [
        cake.mainImage?.asset?.url ||
        'https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png',
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
    other: {
      price: cakeBasePrice.toString(),
      priceCurrency: "GBP",
      brand: "Olgish Cakes",
      category: cake.category,
      "og:price:amount": cakeBasePrice.toString(),
      "og:price:currency": "GBP",
    },
  };
}

export default async function CakePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const cake = await getCakeBySlug(slug)
  const backHref = buildCatalogBackHref({
    fallbackHref: '/cakes',
    fromParam: resolvedSearchParams?.from
  })

  if (!cake) {
    notFound();
  }
  const cakeBasePrice = resolveCakeBasePrice({
    newDesignPricingByServings: cake.newDesignPricingByServings,
    pricing: cake.pricing
  })

  const resolvedDeliveryContent = resolveCakeDeliveryContent(cake)
  const shouldEmitShippingDetails = resolvedDeliveryContent.shouldEmitShippingDetails
  const shippingDetailsForStructuredData = shouldEmitShippingDetails
    ? getOfferShippingDetails(
      resolvedDeliveryContent.policy,
      resolvedDeliveryContent.shippingDetailsVisibleClaims
    )
    : undefined
  const primaryImage = getCakePrimaryImage(cake)
  const productImageUrl = (() => {
    if (primaryImage) {
      const imageUrl = urlFor(primaryImage).width(800).height(800).url()
      // Ensure URL is absolute (Sanity should return absolute, but double-check)
      return ensureAbsoluteImageUrl(imageUrl)
    }

    return undefined
  })()
  const productDescription = cake.shortDescription
    ? blocksToText(cake.shortDescription).trim()
    : cake.description
      ? blocksToText(cake.description).trim()
      : ''
  const hasProductStructuredData = Boolean(
    productImageUrl && productDescription && cakeBasePrice > 0
  )
  const cakePageClientData = getCakePageClientData(cake, resolvedDeliveryContent)

  return (
    <>
      {/* Server-rendered Product Structured Data (validates in GSC) */}
      {hasProductStructuredData ? <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `https://olgishcakes.co.uk/cakes/${cake.slug.current}#product`,
            name: cake.name,
            description: productDescription,
            image: productImageUrl,
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
            ...(cake.category ? { category: cake.category } : {}),
            url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
            offers: {
              "@type": "Offer",
              "@id": `https://olgishcakes.co.uk/cakes/${cake.slug.current}#offer`,
              price: formatStructuredDataPrice(cakeBasePrice, 0),
              priceCurrency: "GBP",
              url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
              image: productImageUrl,
              seller: {
                "@type": "Organization",
                name: "Olgish Cakes",
                url: "https://olgishcakes.co.uk"
              },
              ...(shippingDetailsForStructuredData ? { shippingDetails: shippingDetailsForStructuredData } : {}),
              hasMerchantReturnPolicy: getMerchantReturnPolicy(),
            },
          }),
        }}
      /> : null}

      {/* Additional Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Olgish Cakes",
            url: "https://olgishcakes.co.uk",
            logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
            description: "Ukrainian honey cakes and celebration cakes made in Leeds.",
            telephone: "+44 786 721 8194",
            email: "hello@olgishcakes.co.uk",
            address: {
              "@type": "PostalAddress",
              streetAddress: "15 Allerton Grange Avenue",
              addressLocality: "Leeds",
              postalCode: "LS17 6PR",
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
            ]
          }),
        }}
      />

      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main id="main-content" tabIndex={-1}>
        <CakePageClient
          cake={cakePageClientData}
          backHref={backHref}
        />
      </main>
    </>
  );
}



