/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { CakePageClient } from '../CakePageClient'
import type { Cake } from '@/types/cake'
import type { CatalogProductDetailSection } from '../../components/CatalogProductDetailLayout'

const capturedLayoutProps: Array<Record<string, unknown>> = []

jest.mock('../OrderModal', () => ({
  OrderModal: ({
    open
  }: {
    open: boolean
  }) => (
    <div data-testid='order-modal' data-open={open ? 'true' : 'false'}>
      Order modal
    </div>
  )
}))

jest.mock('../../components/CatalogProductDetailLayout', () => ({
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
  urlFor: () => ({
    width: () => ({
      height: () => ({
        url: () => 'https://cdn.sanity.io/images/test/cake-image.jpg'
      })
    })
  })
}))

const baseCake: Cake = {
  _id: 'cake-1',
  _createdAt: '2025-01-01T00:00:00.000Z',
  name: 'Honey Cake',
  slug: {
    current: 'honey-cake'
  },
  description: [
    {
      _type: 'block',
      children: [
        {
          text: 'A full rich description for honey cake.'
        }
      ]
    }
  ],
  shortDescription: [
    {
      _type: 'block',
      children: [
        {
          text: 'Freshly baked to order.'
        },
        {
          text: ' Free UK delivery.'
        }
      ]
    }
  ],
  size: '8inch',
  pricing: {
    standard: 30,
    individual: 45
  },
  designs: {
    standard: [
      {
        _type: 'image',
        asset: {
          _ref: 'image-standard',
          _type: 'reference'
        },
        isMain: true,
        alt: 'Honey cake standard design'
      }
    ],
    individual: []
  },
  category: 'Traditional',
  ingredients: ['Flour', 'Honey', 'Cream'],
  allergens: ['Gluten']
}

describe('CakePageClient', () => {
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

  it('maps content into shared detail layout and passes back link', () => {
    render(
      <CakePageClient
        cake={baseCake}
        backHref='/cakes?sort=priceLowToHigh&page=2'
      />
    )

    expect(screen.getByTestId('layout-back-link')).toHaveAttribute('href', '/cakes?sort=priceLowToHigh&page=2')
    expect(screen.getByTestId('layout-back-link')).toHaveTextContent('Back to all cakes')
    expect(screen.getByTestId('layout-title')).toHaveTextContent('Honey Cake')
    expect(screen.getByTestId('layout-price')).toHaveTextContent('from \u00A330')
    expect(screen.getByTestId('layout-category')).toHaveTextContent('Custom cakes')
    expect(getLatestLayoutProps().backLabel).toBe('Back to all cakes')
  })

  it('opens the existing order modal when Add to cart is triggered', () => {
    render(
      <CakePageClient
        cake={baseCake}
        backHref='/cakes'
      />
    )

    expect(screen.getByTestId('order-modal')).toHaveAttribute('data-open', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(screen.getByTestId('order-modal')).toHaveAttribute('data-open', 'true')
  })

  it('uses fallback key points when short description does not provide enough items', () => {
    render(
      <CakePageClient
        cake={{
          ...baseCake,
          shortDescription: []
        }}
        backHref='/cakes'
      />
    )

    expect(screen.getByText('Freshly baked to order')).toBeInTheDocument()
    expect(screen.getByText('Personalised design consultation available')).toBeInTheDocument()
    expect(screen.getByText('Free UK delivery')).toBeInTheDocument()
  })

  it('does not render removed legacy below-fold section copy', () => {
    render(
      <CakePageClient
        cake={baseCake}
        backHref='/cakes'
      />
    )

    expect(screen.queryByText('Explore More Ukrainian Cakes')).not.toBeInTheDocument()
  })

  it('includes only full description, ingredients, and delivery sections', () => {
    render(
      <CakePageClient
        cake={baseCake}
        backHref='/cakes'
      />
    )

    const sections = getLatestSections()
    expect(sections.map((section) => section.id)).toEqual(['full-description', 'ingredients', 'delivery'])
  })
})

