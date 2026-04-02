'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState, type ReactNode } from 'react'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { CatalogProductDetailLayout, type CatalogProductDetailImage, type CatalogProductDetailSection } from '@/app/cakes/components/CatalogProductDetailLayout'
import { useOrderFormPrefetch } from '@/app/components/homepage/useOrderFormPrefetch'
import { blocksToText } from '@/types/cake'
import type { GiftHamper } from '@/types/giftHamper'
import { urlFor } from '@/sanity/lib/image'
import { getGiftHamperVisibleDescriptionText, giftHamperVisibleDescriptionFallback } from './description-content'
import { getGiftHamperDeliveryFallbackKeyPoint, resolveGiftHamperDeliveryContent } from './delivery-content'

interface GiftHamperPageClientProps {
  hamper: GiftHamper
  backHref: string
}

const ProductOrderInlineForm = dynamic(
  () => import('@/app/components/homepage/ProductOrderInlineForm').then((module) => module.ProductOrderInlineForm),
  {
    loading: () => (
      <p className='text-sm text-base-content/70'>Loading order form...</p>
    )
  }
)
function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function toParagraphs(text: string) {
  return text
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
}

function normalizeCandidatePoint(value: string) {
  const normalized = value
    .replace(/\s+/g, ' ')
    .replace(/^[-*]\s*/, '')
    .trim()

  if (normalized.length === 0) {
    return null
  }

  if (normalized.length <= 88) {
    return normalized
  }

  return `${normalized.slice(0, 85).trimEnd()}...`
}

function extractKeyPointsFromText(text: string) {
  const paragraphCandidates = toParagraphs(text)
  const sentenceCandidates = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
  const orderedCandidates = [...paragraphCandidates, ...sentenceCandidates]
  const keyPoints: string[] = []
  const seen = new Set<string>()

  for (const candidate of orderedCandidates) {
    const normalizedCandidate = normalizeCandidatePoint(candidate)

    if (!normalizedCandidate || seen.has(normalizedCandidate)) {
      continue
    }

    seen.add(normalizedCandidate)
    keyPoints.push(normalizedCandidate)

    if (keyPoints.length === 3) {
      break
    }
  }

  return keyPoints
}

function resolveKeyPoints(extractedPoints: string[], fallbackPoints: string[]) {
  const uniquePoints: string[] = []
  const seen = new Set<string>()

  for (const point of [...extractedPoints, ...fallbackPoints]) {
    if (seen.has(point)) {
      continue
    }

    seen.add(point)
    uniquePoints.push(point)

    if (uniquePoints.length === 3) {
      break
    }
  }

  return uniquePoints
}

function hasImageAssetReference(value: unknown): value is { asset: { _ref: string }, alt?: string } {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const maybeImage = value as { asset?: { _ref?: unknown } }

  return typeof maybeImage.asset?._ref === 'string' && maybeImage.asset._ref.length > 0
}

function mapHamperImagesToGallery(hamper: GiftHamper): CatalogProductDetailImage[] {
  const mappedImages: CatalogProductDetailImage[] = []
  const imageUrls = new Set<string>()
  const fallbackAlt = `${hamper.name} by Olgish Cakes`
  const hamperImages = Array.isArray(hamper.images) ? hamper.images : []
  const mainImageIndex = hamperImages.findIndex((image) => image.isMain === true)
  const orderedImages = mainImageIndex >= 0
    ? [hamperImages[mainImageIndex], ...hamperImages.filter((_, index) => index !== mainImageIndex)]
    : hamperImages

  orderedImages.forEach((image) => {
    if (!hasImageAssetReference(image)) {
      return
    }

    const imageUrl = urlFor(image).width(1200).height(1200).url()

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
  })

  return mappedImages
}

function renderDescriptionSectionContent(text: string): ReactNode {
  const paragraphs = toParagraphs(text)

  if (paragraphs.length === 0) {
    return (
      <p>
        {giftHamperVisibleDescriptionFallback}
      </p>
    )
  }

  return (
    <div className='space-y-3'>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

function renderIngredientsSectionContent(hamper: GiftHamper): ReactNode {
  const referencedIngredients = hamper.ingredientReference?.ingredients
  const hasReferencedIngredients = Array.isArray(referencedIngredients) && referencedIngredients.length > 0
  const legacyIngredients = Array.isArray(hamper.ingredients) ? hamper.ingredients : []
  const legacyAllergens = Array.isArray(hamper.allergens) ? hamper.allergens : []
  const hasLegacyIngredients = legacyIngredients.length > 0
  const hasLegacyAllergens = legacyAllergens.length > 0

  if (!hasReferencedIngredients && !hasLegacyIngredients && !hasLegacyAllergens) {
    return (
      <p>
        Ingredient details are available on request before ordering.
      </p>
    )
  }

  return (
    <div className='space-y-3'>
      <div>
        <p className='font-semibold text-base-content'>Ingredients</p>
        {hasReferencedIngredients ? (
          <div className='mt-2'>
            <PortableText
              value={referencedIngredients}
              components={deliveryPortableTextComponents}
            />
          </div>
        ) : (
          <ul className='list-disc space-y-1 pl-5'>
            {legacyIngredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        )}
      </div>
      {!hasReferencedIngredients && hasLegacyAllergens ? (
        <div>
          <p className='font-semibold text-base-content'>Allergens</p>
          <ul className='list-disc space-y-1 pl-5'>
            {legacyAllergens.map((allergen) => (
              <li key={allergen}>{allergen}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

const deliveryPortableTextComponents: PortableTextComponents = {
  block: {
    normal: ({
      children
    }) => (
      <p className='mb-3 last:mb-0'>{children}</p>
    )
  },
  list: {
    bullet: ({
      children
    }) => (
      <ul className='mb-3 list-disc space-y-1 pl-5 last:mb-0'>{children}</ul>
    ),
    number: ({
      children
    }) => (
      <ol className='mb-3 list-decimal space-y-1 pl-5 last:mb-0'>{children}</ol>
    )
  },
  listItem: ({
    children
  }) => (
    <li>{children}</li>
  )
}

export function GiftHamperPageClient({
  hamper,
  backHref
}: GiftHamperPageClientProps) {
  const [isOrderFormVisible, setIsOrderFormVisible] = useState(false)
  const handleOrderIntent = useOrderFormPrefetch({ prefetchOccasionOptions: false })
  const backLabel = isOrderFormVisible ? 'Back to product' : 'Back to cakes by post'
  const galleryImages = useMemo(() => {
    return mapHamperImagesToGallery(hamper)
  }, [hamper])
  const resolvedDeliveryContent = useMemo(() => {
    return resolveGiftHamperDeliveryContent(hamper)
  }, [hamper])
  const keyPoints = useMemo(() => {
    const deliveryFallbackKeyPoint = resolvedDeliveryContent.shouldEmitShippingDetails
      ? getGiftHamperDeliveryFallbackKeyPoint(resolvedDeliveryContent.policy)
      : 'Delivery details confirmed before dispatch'
    const fallbackPoints = [
      'Freshly baked and packed',
      'Personalised charity postcard',
      deliveryFallbackKeyPoint
    ]
    const shortDescriptionText = Array.isArray(hamper.shortDescription)
      ? blocksToText(hamper.shortDescription)
      : ''
    const extractedPoints = extractKeyPointsFromText(shortDescriptionText)

    if (extractedPoints.length >= 3) {
      return extractedPoints.slice(0, 3)
    }

    return resolveKeyPoints(extractedPoints, fallbackPoints)
  }, [hamper.shortDescription, resolvedDeliveryContent.policy])
  const sections = useMemo<CatalogProductDetailSection[]>(() => {
    const descriptionText = getGiftHamperVisibleDescriptionText(hamper)

    return [
      {
        id: 'full-description',
        title: 'Full description',
        content: renderDescriptionSectionContent(descriptionText)
      },
      {
        id: 'ingredients',
        title: 'Ingredients',
        content: renderIngredientsSectionContent(hamper)
      },
      {
        id: 'delivery',
        title: resolvedDeliveryContent.title,
        content: (
          <PortableText
            value={resolvedDeliveryContent.description}
            components={deliveryPortableTextComponents}
          />
        )
      }
    ]
  }, [hamper, resolvedDeliveryContent])

  const handleBackToProduct = () => {
    setIsOrderFormVisible(false)
  }

  return (
    <>
      <CatalogProductDetailLayout
        backHref={backHref}
        backLabel={backLabel}
        categoryLabel='Cakes by post'
        title={hamper.name}
        priceText={`\u00A3${formatPrice(hamper.price)}`}
        keyPoints={keyPoints}
        ctaLabel='Order now +'
        onCtaClick={() => setIsOrderFormVisible(true)}
        onCtaIntent={handleOrderIntent}
        isOrderFormOpen={isOrderFormVisible}
        onBackToProduct={isOrderFormVisible ? handleBackToProduct : undefined}
        orderContent={isOrderFormVisible ? (
          <ProductOrderInlineForm
            productType='gift-hamper'
            productId={hamper.slug.current}
            productName={hamper.name}
            totalPrice={hamper.price}
            orderEmailContext={{
              designType: 'standard'
            }}
            showOccasionField={false}
            contextLines={[
              `Product: ${hamper.name}`,
              'Product type: gift-hamper',
              `Price: \u00A3${formatPrice(hamper.price)}`
            ]}
          />
        ) : undefined}
        images={galleryImages}
        sections={sections}
      />
    </>
  )
}
