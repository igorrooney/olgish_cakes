/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { GiftHamperPageClient } from '../GiftHamperPageClient'
import type { GiftHamper } from '@/types/giftHamper'
import type { CatalogProductDetailSection } from '@/app/cakes/components/CatalogProductDetailLayout'

const capturedLayoutProps: Array<Record<string, unknown>> = []

jest.mock('../GiftHamperOrderModal', () => ({
  GiftHamperOrderModal: ({
    open
  }: {
    open: boolean
  }) => (
    <div data-testid='gift-hamper-order-modal' data-open={open ? 'true' : 'false'}>
      Gift hamper order modal
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
        <p data-testid='layout-price-suffix'>{String(props.priceSuffix)}</p>
        <p data-testid='layout-category'>{String(props.categoryLabel)}</p>
        <ul>
          {(props.keyPoints as string[]).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <button type='button' onClick={props.onCtaClick as () => void}>
          Trigger add to cart
        </button>
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
  ingredients: ['Honey', 'Flour'],
  allergens: ['Gluten']
}

describe('GiftHamperPageClient', () => {
  beforeEach(() => {
    capturedLayoutProps.length = 0
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
    expect(screen.getByTestId('layout-price-suffix')).toHaveTextContent('+ free shipping')
    expect(screen.getByTestId('layout-category')).toHaveTextContent('Cakes by post')
    expect(getLatestLayoutProps().backLabel).toBe('Back to cakes by post')
  })

  it('opens the existing gift hamper order modal when Add to cart is triggered', () => {
    render(
      <GiftHamperPageClient
        hamper={baseHamper}
        backHref='/cakes-by-post'
      />
    )

    expect(screen.getByTestId('gift-hamper-order-modal')).toHaveAttribute('data-open', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(screen.getByTestId('gift-hamper-order-modal')).toHaveAttribute('data-open', 'true')
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

