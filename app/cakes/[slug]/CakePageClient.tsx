'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ChangeEvent, type ReactNode } from 'react'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { CatalogProductDetailLayout, type CatalogProductDetailImage, type CatalogProductDetailSection } from '../components/CatalogProductDetailLayout'
import { useOrderFormPrefetch } from '@/app/components/homepage/useOrderFormPrefetch'
import {
  getCakeServingsPricingOptions,
  resolveCakeBasePrice,
  resolveCakeDefaultServingsKey,
  type CakeServingsPriceKey
} from '@/lib/utils/cake-base-price'
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

const fillingPreviewImageSizes = '(min-width: 1024px) 560px, 100vw'
const customDesignSurcharge = 14
const mobileViewportMediaQuery = '(max-width: 1023px)'

const ProductOrderInlineForm = dynamic(
  () => import('@/app/components/homepage/ProductOrderInlineForm').then((module) => module.ProductOrderInlineForm),
  {
    loading: () => (
      <p className='text-sm text-base-content/70'>Loading order form...</p>
    )
  }
)

const servingsConfig: Array<{ key: CakeServingsPriceKey, label: string }> = [
  { key: 'servings2To4', label: 'Serves 2-4 people' },
  { key: 'servings4To8', label: 'Serves 4-8 people' },
  { key: 'servings8To12', label: 'Serves 8-12 people' },
  { key: 'servings12To20', label: 'Serves 12-20 people' },
  { key: 'servings20Plus', label: 'Serves 20+ people' }
]

interface FillingOption {
  id: string
  name: string
  image: CakeImage | undefined
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

function resolveFillingCarouselImage({
  cakeName,
  fillingOption
}: {
  cakeName: string
  fillingOption: FillingOption | null
}): CatalogProductDetailImage | null {
  if (!fillingOption || !hasImageAssetReference(fillingOption.image)) {
    return null
  }

  const fillingImageUrl = urlFor(fillingOption.image).width(1200).height(1200).url()
  if (fillingImageUrl.length === 0) {
    return null
  }

  const fillingImageAlt = typeof fillingOption.image.alt === 'string' && fillingOption.image.alt.trim().length > 0
    ? fillingOption.image.alt.trim()
    : `${fillingOption.name} filling for ${cakeName}`

  return {
    src: fillingImageUrl,
    alt: fillingImageAlt
  }
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
  const referencedIngredients = cake.ingredientReference?.ingredients
  const hasReferencedIngredients = Array.isArray(referencedIngredients) && referencedIngredients.length > 0
  const legacyIngredients = Array.isArray(cake.ingredients) ? cake.ingredients : []
  const legacyAllergens = Array.isArray(cake.allergens) ? cake.allergens : []
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

export function CakePageClient({
  cake,
  backHref
}: CakePageClientProps) {
  const [designType, setDesignType] = useState<'standard' | 'individual'>('standard')
  const [isOrderFormVisible, setIsOrderFormVisible] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [fillingChangeTokenCounter, setFillingChangeTokenCounter] = useState(0)
  const handleOrderIntent = useOrderFormPrefetch({ prefetchOccasionOptions: true })
  const servingOptions = useMemo(() => {
    const servingsPricingOptions = getCakeServingsPricingOptions(cake.newDesignPricingByServings)

    return servingsConfig
      .flatMap(({ key, label }) => {
        const servingsPricingOption = servingsPricingOptions.find((pricingOption) => {
          return pricingOption.key === key
        })

        if (!servingsPricingOption) {
          return []
        }

        return [{
          key,
          label,
          price: servingsPricingOption.price
        }]
      })
  }, [cake.newDesignPricingByServings])
  const defaultBasePrice = useMemo(() => {
    return resolveCakeBasePrice({
      newDesignPricingByServings: cake.newDesignPricingByServings,
      pricing: cake.pricing
    })
  }, [cake.newDesignPricingByServings, cake.pricing])
  const fillingOptions = useMemo<FillingOption[]>(() => {
    const seenFillingIds = new Set<string>()
    const resolvedOptions = cake.fillingTypes?.flatMap((fillingType) => {
      const fillingId = typeof fillingType._id === 'string' ? fillingType._id.trim() : ''
      const fillingName = typeof fillingType.name === 'string' ? fillingType.name.trim() : ''

      if (fillingId.length === 0 || fillingName.length === 0 || seenFillingIds.has(fillingId)) {
        return []
      }

      seenFillingIds.add(fillingId)

      return [{
        id: fillingId,
        name: fillingName,
        image: fillingType.image
      }]
    }) ?? []

    return resolvedOptions
  }, [cake.fillingTypes])
  const defaultSelectedFillingId = useMemo(() => {
    if (typeof cake.defaultFillingType?._id === 'string' && fillingOptions.some((fillingOption) => fillingOption.id === cake.defaultFillingType?._id)) {
      return cake.defaultFillingType._id
    }

    return fillingOptions[0]?.id ?? ''
  }, [cake.defaultFillingType?._id, fillingOptions])
  const defaultSelectedServingsKey = useMemo<CakeServingsPriceKey | ''>(() => {
    if (servingOptions.length === 0) {
      return ''
    }

    const resolvedDefaultServingsKey = resolveCakeDefaultServingsKey(cake.newDesignPricingByServings)
    if (resolvedDefaultServingsKey && servingOptions.some((servingOption) => servingOption.key === resolvedDefaultServingsKey)) {
      return resolvedDefaultServingsKey
    }

    return servingOptions[0].key
  }, [cake.newDesignPricingByServings, servingOptions])
  const [selectedFillingId, setSelectedFillingId] = useState(defaultSelectedFillingId)
  const [selectedServingsKey, setSelectedServingsKey] = useState<CakeServingsPriceKey | ''>(defaultSelectedServingsKey)
  const basePrice = useMemo(() => {
    const selectedServingPrice = selectedServingsKey
      ? cake.newDesignPricingByServings?.[selectedServingsKey]
      : undefined

    return typeof selectedServingPrice === 'number'
      ? selectedServingPrice
      : defaultBasePrice
  }, [
    cake.newDesignPricingByServings,
    defaultBasePrice,
    selectedServingsKey
  ])

  const currentPrice = useMemo(() => {
    return designType === 'individual'
      ? basePrice + customDesignSurcharge
      : basePrice
  }, [basePrice, designType])
  const customDesignButtonOffLabel = `Add a custom design? + \u00A3${formatPrice(customDesignSurcharge)}`
  const customDesignButtonOnLabel = `Custom design added + \u00A3${formatPrice(customDesignSurcharge)}`
  const customDesignButtonLabel = designType === 'individual'
    ? customDesignButtonOnLabel
    : customDesignButtonOffLabel
  const backLabel = isOrderFormVisible ? 'Back to product' : 'Back to all cakes'
  const priceText = isOrderFormVisible
    ? `from \u00A3${formatPrice(currentPrice)}`
    : `from \u00A3${formatPrice(defaultBasePrice)}`
  const selectedFillingOption = useMemo(() => {
    if (selectedFillingId.length === 0) {
      return null
    }

    return fillingOptions.find((fillingOption) => fillingOption.id === selectedFillingId) ?? null
  }, [fillingOptions, selectedFillingId])
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQueryList = window.matchMedia(mobileViewportMediaQuery)
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches)
    }

    setIsMobileViewport(mediaQueryList.matches)

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleMediaQueryChange)

      return () => {
        mediaQueryList.removeEventListener('change', handleMediaQueryChange)
      }
    }

    mediaQueryList.addListener(handleMediaQueryChange)

    return () => {
      mediaQueryList.removeListener(handleMediaQueryChange)
    }
  }, [])

  const galleryImages = useMemo(() => {
    return mapCakeImagesToGallery(cake)
  }, [cake])
  const fillingCarouselImage = useMemo(() => {
    return resolveFillingCarouselImage({
      cakeName: cake.name,
      fillingOption: selectedFillingOption
    })
  }, [cake.name, selectedFillingOption])
  const layoutImages = useMemo(() => {
    if (!isMobileViewport || !isOrderFormVisible || !fillingCarouselImage) {
      return galleryImages
    }

    const deduplicatedGalleryImages = galleryImages.filter((galleryImage) => {
      return galleryImage.src !== fillingCarouselImage.src
    })
    if (deduplicatedGalleryImages.length === 0) {
      return [fillingCarouselImage]
    }

    const firstGalleryImage = deduplicatedGalleryImages[0]
    const trailingGalleryImages = deduplicatedGalleryImages.slice(1)

    return [firstGalleryImage, fillingCarouselImage, ...trailingGalleryImages]
  }, [fillingCarouselImage, galleryImages, isMobileViewport, isOrderFormVisible])
  const fillingPreviewContent = useMemo(() => {
    if (isMobileViewport || !isOrderFormVisible || !fillingCarouselImage) {
      return null
    }

    return (
      <div className='space-y-3'>
        <p className='[font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-normal)] [font-style:normal] text-[12px] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-base-content/55 tablet:[font-size:var(--t-font-size-sm)] tablet:text-(--color-catalog-detail-muted)'>
          Filling:
        </p>
        <div className='relative aspect-square w-full overflow-hidden rounded-[8px] bg-base-200'>
          <Image
            src={fillingCarouselImage.src}
            alt={fillingCarouselImage.alt}
            fill
            sizes={fillingPreviewImageSizes}
            className='object-cover'
          />
        </div>
      </div>
    )
  }, [fillingCarouselImage, isMobileViewport, isOrderFormVisible])
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
      const trackedPrice = nextDesignType === 'individual'
        ? basePrice + customDesignSurcharge
        : basePrice

      window.gtag('event', 'design_type_change', {
        cake_name: cake.name,
        design_type: nextDesignType,
        price: trackedPrice
      })
    }
  }, [basePrice, cake.name])

  const handleCustomDesignToggle = useCallback(() => {
    handleDesignTypeChange(designType === 'individual' ? 'standard' : 'individual')
  }, [designType, handleDesignTypeChange])

  const handleAddToCart = useCallback(() => {
    setIsOrderFormVisible(true)

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        cake_name: cake.name,
        design_type: designType,
        price: currentPrice,
        currency: 'GBP'
      })
    }
  }, [cake.name, currentPrice, designType])
  const handleFillingTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const nextFillingId = event.target.value
    const hasSelectionChanged = nextFillingId !== selectedFillingId

    setSelectedFillingId(nextFillingId)

    if (isOrderFormVisible && hasSelectionChanged) {
      setFillingChangeTokenCounter((currentTokenCounter) => currentTokenCounter + 1)
    }
  }, [isOrderFormVisible, selectedFillingId])
  const handleBackToProduct = useCallback(() => {
    setIsOrderFormVisible(false)
    setDesignType('standard')
    setSelectedFillingId(defaultSelectedFillingId)
    setSelectedServingsKey(defaultSelectedServingsKey)
    setFillingChangeTokenCounter(0)
  }, [defaultSelectedFillingId, defaultSelectedServingsKey])
  const shouldRequestFillingImageFocus = isMobileViewport &&
    isOrderFormVisible &&
    fillingCarouselImage !== null &&
    fillingChangeTokenCounter > 0
  const requestedActiveImageIndex = shouldRequestFillingImageFocus ? 1 : undefined
  const requestedActiveImageKey = shouldRequestFillingImageFocus
    ? `filling-change-${fillingChangeTokenCounter}`
    : undefined
  const orderSelectClassName = 'select w-full cursor-pointer tablet:h-12 tablet:min-h-12 rounded-full border-base-300 bg-primary-50 !ps-7 justify-center text-center text-base-content focus:!outline-none'
  const orderCustomDesignButtonClassName = 'flex h-[32px] w-full cursor-pointer items-center justify-center rounded-full border border-base-300 bg-primary-50 px-7 py-0 text-center text-[12px] leading-[14px] text-base-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
  const orderCustomDesignButtonActiveClassName = 'border-[var(--d-color-status-success-bg)]'
  const orderOptionClassName = 'text-center justify-center'
  const orderSelectStyle: CSSProperties = {
    textAlignLast: 'center',
    justifyContent: 'center'
  }
  const orderOptionStyle: CSSProperties = {
    textAlign: 'center',
    justifyContent: 'center'
  }

  return (
    <>
      <CatalogProductDetailLayout
        backHref={backHref}
        backLabel={backLabel}
        categoryLabel='Custom cakes'
        title={cake.name}
        priceText={priceText}
        keyPoints={keyPoints}
        ctaLabel='Order now +'
        onCtaClick={handleAddToCart}
        onCtaIntent={handleOrderIntent}
        isOrderFormOpen={isOrderFormVisible}
        onBackToProduct={isOrderFormVisible ? handleBackToProduct : undefined}
        galleryBelowContent={!isMobileViewport ? fillingPreviewContent : undefined}
        requestedActiveImageIndex={requestedActiveImageIndex}
        requestedActiveImageKey={requestedActiveImageKey}
        orderContent={isOrderFormVisible ? (
          <div className='space-y-5'>
            {fillingOptions.length > 0 ? (
              <select
                aria-label='Filling type'
                className={orderSelectClassName}
                style={orderSelectStyle}
                value={selectedFillingId}
                onChange={handleFillingTypeChange}
              >
                {fillingOptions.map((fillingOption) => (
                  <option
                    key={fillingOption.id}
                    value={fillingOption.id}
                    className={orderOptionClassName}
                    style={orderOptionStyle}
                  >
                    {`${fillingOption.name} filling`}
                  </option>
                ))}
              </select>
            ) : null}

            {servingOptions.length > 0 ? (
              <select
                aria-label='Servings'
                className={orderSelectClassName}
                style={orderSelectStyle}
                value={selectedServingsKey}
                onChange={(event) => setSelectedServingsKey(event.target.value as CakeServingsPriceKey)}
              >
                {servingOptions.map((servingOption) => (
                  <option
                    key={servingOption.key}
                    value={servingOption.key}
                    className={orderOptionClassName}
                    style={orderOptionStyle}
                  >
                    {servingOption.label}
                  </option>
                ))}
              </select>
            ) : null}

            <button
              type='button'
              aria-label='Custom design'
              aria-pressed={designType === 'individual'}
              className={`${orderCustomDesignButtonClassName} ${designType === 'individual' ? orderCustomDesignButtonActiveClassName : ''}`}
              onClick={handleCustomDesignToggle}
            >
              <span className='text-center'>{customDesignButtonLabel}</span>
              {designType === 'individual' ? (
                <span
                  aria-hidden='true'
                  className='ml-2 inline-flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--d-color-status-success-bg)] text-[10px] font-semibold leading-none text-success-content'
                >
                  ✓
                </span>
              ) : null}
            </button>

            <ProductOrderInlineForm
              productType='cake'
              productId={cake.slug.current}
              productName={cake.name}
              totalPrice={currentPrice}
              requestMode={designType === 'individual' ? 'custom-design' : 'message'}
              orderEmailContext={{
                designType,
                filling: selectedFillingOption?.name,
                servings: selectedServingsKey
                  ? servingOptions.find((servingOption) => servingOption.key === selectedServingsKey)?.label
                  : undefined
              }}
              contextLines={[
                `Product: ${cake.name}`,
                `Product type: cake`,
                `Design type: ${designType}`,
                selectedFillingOption ? `Filling: ${selectedFillingOption.name}` : '',
                selectedServingsKey
                  ? servingOptions.find((servingOption) => servingOption.key === selectedServingsKey)?.label ?? ''
                  : '',
                `Price: \u00A3${formatPrice(currentPrice)}`
              ].filter((line) => line.length > 0)}
            />
          </div>
        ) : undefined}
        images={layoutImages}
        sections={sections}
      />
    </>
  )
}
