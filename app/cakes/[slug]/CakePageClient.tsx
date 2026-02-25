'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { CatalogProductDetailLayout, type CatalogProductDetailImage, type CatalogProductDetailSection } from '../components/CatalogProductDetailLayout'
import { OrderModal } from './OrderModal'
import { urlFor } from '@/sanity/lib/image'
import { blocksToText, type Cake, type CakeImage } from '@/types/cake'
import { getCakeDeliveryFallbackKeyPoint, resolveCakeDeliveryContent } from './delivery-content'

interface CakePageClientProps {
  cake: Cake
  backHref: string
}

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

    if (!normalizedCandidate) {
      continue
    }

    if (seen.has(normalizedCandidate)) {
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

function mapCakeImagesToGallery(cake: Cake): CatalogProductDetailImage[] {
  const mappedImages: CatalogProductDetailImage[] = []
  const imageUrls = new Set<string>()
  const fallbackAlt = `${cake.name} by Olgish Cakes`

  function addImage(image: Cake['mainImage'] | CakeImage | undefined) {
    if (!image || !hasImageAssetReference(image)) {
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
  }

  addImage(cake.mainImage)
  cake.designs?.standard?.forEach((image) => addImage(image))
  cake.designs?.individual?.forEach((image) => addImage(image))
  cake.images?.forEach((image) => addImage(image))

  return mappedImages
}

function renderDescriptionSectionContent(descriptionText: string): ReactNode {
  const paragraphs = toParagraphs(descriptionText)

  if (paragraphs.length === 0) {
    return (
      <p>
        Freshly baked to order with traditional Ukrainian recipes and premium ingredients.
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

function renderIngredientsSectionContent(cake: Cake): ReactNode {
  const hasIngredients = cake.ingredients.length > 0
  const hasAllergens = Array.isArray(cake.allergens) && cake.allergens.length > 0

  if (!hasIngredients && !hasAllergens) {
    return (
      <p>
        Ingredient details are available on request before ordering.
      </p>
    )
  }

  return (
    <div className='space-y-3'>
      {hasIngredients ? (
        <div>
          <p className='font-semibold text-base-content'>Ingredients</p>
          <ul className='list-disc space-y-1 pl-5'>
            {cake.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasAllergens ? (
        <div>
          <p className='font-semibold text-base-content'>Allergens</p>
          <ul className='list-disc space-y-1 pl-5'>
            {cake.allergens?.map((allergen) => (
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

export function CakePageClient({
  cake,
  backHref
}: CakePageClientProps) {
  const [designType, setDesignType] = useState<'standard' | 'individual'>('standard')
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const currentPrice = designType === 'individual'
    ? (cake.pricing?.individual ?? 0)
    : (cake.pricing?.standard ?? 0)

  const galleryImages = useMemo(() => {
    return mapCakeImagesToGallery(cake)
  }, [cake])
  const resolvedDeliveryContent = useMemo(() => {
    return resolveCakeDeliveryContent(cake)
  }, [cake])
  const keyPoints = useMemo(() => {
    const deliveryFallbackKeyPoint = resolvedDeliveryContent.shouldEmitShippingDetails
      ? getCakeDeliveryFallbackKeyPoint(resolvedDeliveryContent.policy)
      : 'Delivery details confirmed before dispatch'
    const fallbackPoints = [
      'Freshly baked to order',
      'Personalised design consultation available',
      deliveryFallbackKeyPoint
    ]
    const shortDescriptionText = Array.isArray(cake.shortDescription)
      ? blocksToText(cake.shortDescription)
      : ''
    const extractedPoints = extractKeyPointsFromText(shortDescriptionText)

    if (extractedPoints.length >= 3) {
      return extractedPoints.slice(0, 3)
    }

    return resolveKeyPoints(extractedPoints, fallbackPoints)
  }, [cake.shortDescription, resolvedDeliveryContent.policy])
  const sections = useMemo<CatalogProductDetailSection[]>(() => {
    const descriptionText = blocksToText(cake.description)

    return [
      {
        id: 'full-description',
        title: 'Full description',
        content: renderDescriptionSectionContent(descriptionText)
      },
      {
        id: 'ingredients',
        title: 'Ingredients',
        content: renderIngredientsSectionContent(cake)
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
  }, [cake, resolvedDeliveryContent])

  const handleDesignTypeChange = useCallback((nextDesignType: 'standard' | 'individual') => {
    setDesignType(nextDesignType)

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'design_type_change', {
        cake_name: cake.name,
        design_type: nextDesignType,
        price: nextDesignType === 'individual'
          ? (cake.pricing?.individual ?? 0)
          : (cake.pricing?.standard ?? 0)
      })
    }
  }, [cake.name, cake.pricing?.individual, cake.pricing?.standard])

  const handleAddToCart = useCallback(() => {
    setIsOrderModalOpen(true)

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        cake_name: cake.name,
        design_type: designType,
        price: currentPrice,
        currency: 'GBP'
      })
    }
  }, [cake.name, currentPrice, designType])

  return (
    <>
      <CatalogProductDetailLayout
        backHref={backHref}
        backLabel='Back to all cakes'
        categoryLabel='Custom cakes'
        title={cake.name}
        priceText={`from \u00A3${formatPrice(cake.pricing?.standard ?? 0)}`}
        keyPoints={keyPoints}
        ctaLabel='Order now +'
        onCtaClick={handleAddToCart}
        images={galleryImages}
        sections={sections}
      />

      <OrderModal
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cake={cake}
        designType={designType}
        onDesignTypeChange={handleDesignTypeChange}
      />
    </>
  )
}
