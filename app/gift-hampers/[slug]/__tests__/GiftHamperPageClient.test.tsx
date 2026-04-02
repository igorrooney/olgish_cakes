/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { GiftHamperPageClient } from '../GiftHamperPageClient'
import { useOrderFormPrefetch } from '@/app/components/homepage/useOrderFormPrefetch'
import type { GiftHamper } from '@/types/giftHamper'
import type { CatalogProductDetailSection } from '@/app/cakes/components/CatalogProductDetailLayout'

const capturedLayoutProps: Array<Record<string, unknown>> = []
const mockOrderIntentHandler = jest.fn()
const mockedUseOrderFormPrefetch = useOrderFormPrefetch as jest.MockedFunction<typeof useOrderFormPrefetch>
jest.mock('next/dynamic', () => {
  return () => {
    const React = require('react') as typeof import('react')
    const module = require('@/app/components/homepage/ProductOrderInlineForm') as { ProductOrderInlineForm?: React.ComponentType<Record<string, unknown>>, default?: React.ComponentType<Record<string, unknown>> }
    const ResolvedComponent = module.ProductOrderInlineForm ?? module.default ?? (() => null)

    return function DynamicComponent(props: Record<string, unknown>) {
      return <ResolvedComponent {...props} />
    }
  }
})

jest.mock('@/app/components/homepage/useOrderFormPrefetch', () => ({
  useOrderFormPrefetch: jest.fn()
}))

jest.mock('@/app/components/homepage/ProductOrderInlineForm', () => ({
  ProductOrderInlineForm: ({
    productType,
    productId,
    productName,
    totalPrice,
    showOccasionField
  }: {
    productType: string
    productId: string
    productName: string
    totalPrice: number
    showOccasionField?: boolean
  }) => (
    <div
      data-testid='inline-order-form'
      data-product-type={productType}
      data-product-id={productId}
      data-product-name={productName}
      data-total-price={String(totalPrice)}
      data-show-occasion-field={String(showOccasionField)}
    >
      Inline order form
    </div>
  )
}))

jest.mock('@/app/cakes/components/CatalogProductDetailLayout', () => ({
  CatalogProductDetailLayout: (props: Record<string, unknown>) => {
    capturedLayoutProps.push(props)
    const backLabel = typeof props.backLabel === 'string'
      ? props.backLabel
      : 'Back to results'

    return (
      <div data-testid='catalog-product-detail-layout'>
        <a href={String(props.backHref)} data-testid='layout-back-link'>{backLabel}</a>
        <p data-testid='layout-title'>{String(props.title)}</p>
        <p data-testid='layout-price'>{String(props.priceText)}</p>
        <p data-testid='layout-price-suffix'>{typeof props.priceSuffix === 'string' ? props.priceSuffix : ''}</p>
        <p data-testid='layout-category'>{String(props.categoryLabel)}</p>
        <ul>
          {(props.keyPoints as string[]).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <button type='button' onClick={props.onCtaClick as () => void}>
          Trigger add to cart
        </button>
        {typeof props.onBackToProduct === 'function' ? (
          <button type='button' onClick={props.onBackToProduct as () => void}>
            Trigger back to product
          </button>
        ) : null}
        {props.orderContent as React.ReactNode}
      </div>
    )
  }
}))

jest.mock('@/sanity/lib/image', () => ({
  urlFor: (image: { asset?: { _ref?: string } }) => ({
    width: () => ({
      height: () => ({
        url: () => `https://cdn.sanity.io/images/test/${image.asset?._ref || 'fallback-image'}.jpg`
      })
    })
  })
}))

const baseHamper: GiftHamper = {
  _id: 'hamper-1',
  _createdAt: '2025-01-01T00:00:00.000Z',
  name: 'Christmas Gift Box & Card',
  slug: {
    current: 'christmas-gift-box'
  },
  price: 8.5,
  description: [
    {
      _type: 'block',
      children: [
        {
          text: 'Full hamper description text.'
        }
      ]
    }
  ],
  shortDescription: [
    {
      _type: 'block',
      children: [
        {
          text: 'Freshly baked and packed.'
        },
        {
          text: ' Personalised charity postcard.'
        },
        {
          text: ' Free UK shipping.'
        }
      ]
    }
  ],
  images: [
    {
      _type: 'image',
      asset: {
        _ref: 'image-hamper'
      },
      alt: 'Hamper image',
      isMain: true
    }
  ],
  category: 'Gift Hamper',
  ingredientReference: {
    _id: 'ingredient-1',
    cakeName: 'Christmas Gift Box & Card',
    ingredients: [
      {
        _type: 'block',
        children: [
          {
            text: 'Honey, Flour'
          }
        ]
      }
    ]
  }
}

describe('GiftHamperPageClient', () => {
  beforeEach(() => {
    capturedLayoutProps.length = 0
    mockOrderIntentHandler.mockReset()
    mockedUseOrderFormPrefetch.mockReset()
    mockedUseOrderFormPrefetch.mockReturnValue(mockOrderIntentHandler)
  })

  function getLatestSections() {
    const latestProps = capturedLayoutProps.at(-1)
    if (!latestProps) {
      throw new Error('Expected captured layout props')
    }

    return latestProps.sections as CatalogProductDetailSection[]
  }

  function getLatestLayoutProps() {
    const latestProps = capturedLayoutProps.at(-1)
    if (!latestProps) {
      throw new Error('Expected captured layout props')
    }

    return latestProps
  }

  function getLatestImages() {
    return getLatestLayoutProps().images as Array<{ src: string, alt: string }>
  }

  function getDeliverySection() {
    const sections = getLatestSections()
    return sections.find((section) => section.id === 'delivery')
  }

  it('maps content into shared detail layout and passes back link', () => {
    render(
      <GiftHamperPageClient
        hamper={baseHamper}
        backHref='/cakes-by-post?sort=new&page=2'
      />
    )

    expect(screen.getByTestId('layout-back-link')).toHaveAttribute('href', '/cakes-by-post?sort=new&page=2')
    expect(screen.getByTestId('layout-back-link')).toHaveTextContent('Back to cakes by post')
    expect(screen.getByTestId('layout-title')).toHaveTextContent('Christmas Gift Box & Card')
    expect(screen.getByTestId('layout-price')).toHaveTextContent('\u00A38.50')
    expect(screen.getByTestId('layout-price-suffix')).toBeEmptyDOMElement()
    expect(screen.getByTestId('layout-category')).toHaveTextContent('Cakes by post')
    expect(getLatestLayoutProps().backLabel).toBe('Back to cakes by post')
    expect(getLatestLayoutProps().priceSuffix).toBeUndefined()
  })

  it('configures order-form prefetch with occasion prefetch disabled', () => {
    render(
      <GiftHamperPageClient
        hamper={baseHamper}
        backHref='/cakes-by-post'
      />
    )

    expect(mockedUseOrderFormPrefetch).toHaveBeenCalledWith({ prefetchOccasionOptions: false })
    expect(getLatestLayoutProps().onCtaIntent).toBe(mockOrderIntentHandler)
  })
  it('reveals inline order form when Add to cart is triggered', () => {
    render(
      <GiftHamperPageClient
        hamper={baseHamper}
        backHref='/cakes-by-post'
      />
    )

    expect(screen.queryByTestId('inline-order-form')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(screen.getByTestId('inline-order-form')).toHaveAttribute('data-product-type', 'gift-hamper')
    expect(screen.getByTestId('inline-order-form')).toHaveAttribute('data-product-id', 'christmas-gift-box')
    expect(screen.getByTestId('inline-order-form')).toHaveAttribute('data-product-name', 'Christmas Gift Box & Card')
    expect(screen.getByTestId('inline-order-form')).toHaveAttribute('data-show-occasion-field', 'false')
  })

  it('switches back label to "Back to product" when the inline order form is open', () => {
    render(
      <GiftHamperPageClient
        hamper={baseHamper}
        backHref='/cakes-by-post'
      />
    )

    expect(getLatestLayoutProps().backLabel).toBe('Back to cakes by post')
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(getLatestLayoutProps().backLabel).toBe('Back to product')
    expect(screen.getByTestId('layout-back-link')).toHaveTextContent('Back to product')
  })

  it('keeps price text contract when order form is open', () => {
    render(
      <GiftHamperPageClient
        hamper={baseHamper}
        backHref='/cakes-by-post'
      />
    )

    expect(getLatestLayoutProps().priceText).toBe('\u00A38.50')
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(getLatestLayoutProps().priceText).toBe('\u00A38.50')
    expect(screen.getByTestId('inline-order-form')).toBeInTheDocument()
  })

  it('closes open state via back action and restores closed view', () => {
    render(
      <GiftHamperPageClient
        hamper={baseHamper}
        backHref='/cakes-by-post'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(screen.getByTestId('inline-order-form')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Trigger back to product' }))

    expect(screen.queryByTestId('inline-order-form')).not.toBeInTheDocument()
    expect(getLatestLayoutProps().backLabel).toBe('Back to cakes by post')
  })

  it('uses fallback key points when short description does not provide enough items', () => {
    render(
      <GiftHamperPageClient
        hamper={{
          ...baseHamper,
          shortDescription: []
        }}
        backHref='/cakes-by-post'
      />
    )

    expect(screen.getByText('Freshly baked and packed')).toBeInTheDocument()
    expect(screen.getByText('Personalised charity postcard')).toBeInTheDocument()
    expect(screen.getByText('Free UK shipping')).toBeInTheDocument()
  })

  it('uses paid-shipping fallback key point when shipping fee is above zero', () => {
    render(
      <GiftHamperPageClient
        hamper={{
          ...baseHamper,
          shortDescription: [],
          deliverySection: {
            descriptionSource: 'custom',
            customDescription: [
              {
                _type: 'block',
                children: [
                  {
                    text: 'Dispatch in 2-3 working days. UK shipping is \u00A36.75.'
                  }
                ]
              }
            ],
            customPolicy: {
              dispatchMinDays: 2,
              dispatchMaxDays: 3,
              shippingFeeGbp: 6.75,
              shippingDestinationCountry: 'GB',
              deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
            }
          }
        }}
        backHref='/cakes-by-post'
      />
    )

    expect(screen.getByText('UK shipping from \u00A36.75')).toBeInTheDocument()
    expect(screen.queryByText('Free UK shipping')).not.toBeInTheDocument()
  })

  it('uses neutral delivery fallback key point when shipping details are omitted', () => {
    render(
      <GiftHamperPageClient
        hamper={{
          ...baseHamper,
          shortDescription: [],
          deliverySection: {
            descriptionSource: 'custom',
            customDescription: [
              {
                _type: 'block',
                children: [
                  {
                    text: 'UK shipping is \u00A30.'
                  }
                ]
              }
            ],
            customPolicy: {
              dispatchMinDays: 2,
              dispatchMaxDays: 3,
              shippingFeeGbp: 6.75,
              shippingDestinationCountry: 'GB',
              deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
            }
          }
        }}
        backHref='/cakes-by-post'
      />
    )

    expect(screen.getByText('Delivery details confirmed before dispatch')).toBeInTheDocument()
    expect(screen.queryByText('UK shipping from \u00A36.75')).not.toBeInTheDocument()
  })

  it('does not render removed legacy below-fold section copy', () => {
    render(
      <GiftHamperPageClient
        hamper={baseHamper}
        backHref='/cakes-by-post'
      />
    )

    expect(screen.queryByText('Explore More Gift Hampers')).not.toBeInTheDocument()
  })

  it('includes only full description, ingredients, and delivery sections', () => {
    render(
      <GiftHamperPageClient
        hamper={baseHamper}
        backHref='/cakes-by-post'
      />
    )

    const sections = getLatestSections()
    expect(sections.map((section) => section.id)).toEqual(['full-description', 'ingredients', 'delivery'])
  })

  it('uses the global gift hampers delivery section name as the delivery accordion title', () => {
    render(
      <GiftHamperPageClient
        hamper={{
          ...baseHamper,
          giftHampersDeliverySection: {
            name: 'Shipping & delivery',
            description: [
              {
                _type: 'block',
                children: [
                  {
                    text: 'Global hamper delivery description'
                  }
                ]
              }
            ]
          }
        }}
        backHref='/cakes-by-post'
      />
    )

    const deliverySection = getDeliverySection()
    expect(deliverySection?.title).toBe('Shipping & delivery')
  })

  it('passes custom delivery rich text to the delivery section when custom source is selected', () => {
    const customDeliveryDescription = [
      {
        _type: 'block',
        children: [
          {
            text: 'Custom hamper delivery description'
          }
        ]
      }
    ]

    render(
      <GiftHamperPageClient
        hamper={{
          ...baseHamper,
          deliverySection: {
            descriptionSource: 'custom',
            customDescription: customDeliveryDescription
          },
          giftHampersDeliverySection: {
            name: 'Shipping & delivery',
            description: [
              {
                _type: 'block',
                children: [
                  {
                    text: 'Global hamper delivery description'
                  }
                ]
              }
            ]
          }
        }}
        backHref='/cakes-by-post'
      />
    )

    const deliverySection = getDeliverySection()
    const deliveryContent = deliverySection?.content as React.ReactElement<{ value: unknown }>

    expect(deliveryContent.props.value).toEqual(customDeliveryDescription)
  })

  it('prefers ingredient reference rich text over legacy arrays in the ingredients section', () => {
    render(
      <GiftHamperPageClient
        hamper={{
          ...baseHamper,
          ingredientReference: {
            _id: 'ingredient-2',
            cakeName: 'Christmas Gift Box & Card',
            ingredients: [
              {
                _type: 'block',
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    text: 'Reference hamper ingredient copy'
                  }
                ]
              }
            ]
          },
          ingredients: ['Legacy flour'],
          allergens: ['Legacy gluten']
        }}
        backHref='/cakes-by-post'
      />
    )

    const ingredientsSection = getLatestSections().find((section) => section.id === 'ingredients')
    render(<>{ingredientsSection?.content as React.ReactNode}</>)

    expect(screen.getByText('Reference hamper ingredient copy')).toBeInTheDocument()
    expect(screen.queryByText('Legacy flour')).not.toBeInTheDocument()
    expect(screen.queryByText('Allergens')).not.toBeInTheDocument()
  })

  it('falls back to legacy ingredient and allergen arrays when no ingredient reference exists', () => {
    render(
      <GiftHamperPageClient
        hamper={{
          ...baseHamper,
          ingredientReference: undefined,
          ingredients: ['Legacy flour', 'Legacy honey'],
          allergens: ['Legacy gluten']
        }}
        backHref='/cakes-by-post'
      />
    )

    const ingredientsSection = getLatestSections().find((section) => section.id === 'ingredients')
    render(<>{ingredientsSection?.content as React.ReactNode}</>)

    expect(screen.getByText('Legacy flour')).toBeInTheDocument()
    expect(screen.getByText('Legacy honey')).toBeInTheDocument()
    expect(screen.getByText('Allergens')).toBeInTheDocument()
    expect(screen.getByText('Legacy gluten')).toBeInTheDocument()
  })

  it('shows the generic ingredients fallback only when both reference and legacy arrays are empty', () => {
    render(
      <GiftHamperPageClient
        hamper={{
          ...baseHamper,
          ingredientReference: undefined,
          ingredients: [],
          allergens: []
        }}
        backHref='/cakes-by-post'
      />
    )

    const ingredientsSection = getLatestSections().find((section) => section.id === 'ingredients')
    render(<>{ingredientsSection?.content as React.ReactNode}</>)

    expect(screen.getByText('Ingredient details are available on request before ordering.')).toBeInTheDocument()
  })

  it('forces the first isMain hamper image to index 0 in the gallery payload', () => {
    const hamperWithMainImageSecond: GiftHamper = {
      ...baseHamper,
      images: [
        {
          _type: 'image',
          asset: {
            _ref: 'image-secondary'
          },
          alt: 'Secondary hamper image'
        },
        {
          _type: 'image',
          asset: {
            _ref: 'image-primary'
          },
          alt: 'Primary hamper image',
          isMain: true
        }
      ]
    }

    render(
      <GiftHamperPageClient
        hamper={hamperWithMainImageSecond}
        backHref='/cakes-by-post'
      />
    )

    const images = getLatestImages()
    expect(images).toHaveLength(2)
    expect(images[0]).toEqual({
      src: 'https://cdn.sanity.io/images/test/image-primary.jpg',
      alt: 'Primary hamper image'
    })
    expect(images[1]).toEqual({
      src: 'https://cdn.sanity.io/images/test/image-secondary.jpg',
      alt: 'Secondary hamper image'
    })
  })
})
