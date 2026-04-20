/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { CakePageClient } from '../CakePageClient'
import { useOrderFormPrefetch } from '@/app/components/homepage/useOrderFormPrefetch'
import type { Cake } from '@/types/cake'
import type { CatalogProductDetailImage, CatalogProductDetailSection } from '../../components/CatalogProductDetailLayout'

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

function setMatchMedia(matches: boolean) {
  const mutableWindow = window as Window & { matchMedia: typeof window.matchMedia }

  mutableWindow.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(() => true)
  }))
}

jest.mock('@/app/components/homepage/ProductOrderInlineForm', () => ({
  ProductOrderInlineForm: ({
    productType,
    productId,
    productName,
    totalPrice,
    occasionOptions,
    requestMode
  }: {
    productType: string
    productId: string
    productName: string
    totalPrice: number
    occasionOptions?: Array<{ label: string, value?: string, disabled?: boolean }>
    requestMode?: 'message' | 'custom-design'
  }) => (
    <div
      data-testid='inline-order-form'
      data-product-type={productType}
      data-product-id={productId}
      data-product-name={productName}
      data-total-price={String(totalPrice)}
      data-occasion-options={JSON.stringify(occasionOptions ?? [])}
      data-request-mode={requestMode ?? 'message'}
    >
      Inline order form
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
        {typeof props.onBackToProduct === 'function' ? (
          <button type='button' onClick={props.onBackToProduct as () => void}>
            Trigger back to product
          </button>
        ) : null}
        {props.galleryBelowContent ? (
          <div data-testid='layout-gallery-below-content'>
            {props.galleryBelowContent as React.ReactNode}
          </div>
        ) : null}
        {props.orderContent as React.ReactNode}
      </div>
    )
  }
}))

jest.mock('@/sanity/lib/image', () => ({
  urlFor: (image?: { asset?: { _ref?: string } }) => ({
    width: () => ({
      height: () => ({
        url: () => `https://cdn.sanity.io/images/test/${image?.asset?._ref ?? 'cake-image'}.jpg`
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

function createCakeWithOrderOptions(overrides: Partial<Cake> = {}): Cake {
  return {
    ...baseCake,
    fillingTypes: [
      {
        _id: 'filling-cherry',
        name: 'Cherry',
        image: {
          _type: 'image',
          asset: {
            _ref: 'image-filling-cherry',
            _type: 'reference'
          },
          alt: 'Cherry filling slice'
        }
      },
      {
        _id: 'filling-chocolate',
        name: 'Chocolate',
        image: {
          _type: 'image',
          asset: {
            _ref: 'image-filling-chocolate',
            _type: 'reference'
          },
          alt: 'Chocolate filling slice'
        }
      }
    ],
    defaultFillingType: {
      _id: 'filling-cherry',
      name: 'Cherry',
      image: {
        _type: 'image',
        asset: {
          _ref: 'image-filling-cherry',
          _type: 'reference'
        },
        alt: 'Cherry filling slice'
      }
    },
    newDesignPricingByServings: {
      servings2To4: 30,
      servings4To8: 45,
      servings8To12: 60,
      servings12To20: 75,
      servings20Plus: 90,
      servings2To4IsDefault: false,
      servings4To8IsDefault: true,
      servings8To12IsDefault: false,
      servings12To20IsDefault: false,
      servings20PlusIsDefault: false
    },
    ...overrides
  }
}

describe('CakePageClient', () => {
  beforeEach(() => {
    capturedLayoutProps.length = 0
    mockOrderIntentHandler.mockReset()
    mockedUseOrderFormPrefetch.mockReset()
    mockedUseOrderFormPrefetch.mockReturnValue(mockOrderIntentHandler)
    setMatchMedia(false)
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

  function getLatestLayoutImages() {
    return getLatestLayoutProps().images as CatalogProductDetailImage[]
  }

  function getDeliverySection() {
    const sections = getLatestSections()
    return sections.find((section) => section.id === 'delivery')
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

  it('configures order-form prefetch with cake occasion options enabled', () => {
    render(
      <CakePageClient
        cake={baseCake}
        backHref='/cakes'
      />
    )

    expect(mockedUseOrderFormPrefetch).toHaveBeenCalledWith({ prefetchOccasionOptions: true })
    expect(getLatestLayoutProps().onCtaIntent).toBe(mockOrderIntentHandler)
  })
  it('reveals inline order form when Add to cart is triggered', () => {
    render(
      <CakePageClient
        cake={baseCake}
        backHref='/cakes'
      />
    )

    expect(screen.queryByTestId('inline-order-form')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(screen.getByTestId('inline-order-form')).toHaveAttribute('data-product-type', 'cake')
    expect(screen.getByTestId('inline-order-form')).toHaveAttribute('data-product-id', 'honey-cake')
    expect(screen.getByTestId('inline-order-form')).toHaveAttribute('data-product-name', 'Honey Cake')
  })

  it('passes requestMode to inline order form based on custom design toggle', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    const inlineOrderForm = screen.getByTestId('inline-order-form')
    const customDesignButton = screen.getByLabelText('Custom design')

    expect(inlineOrderForm).toHaveAttribute('data-request-mode', 'message')

    fireEvent.click(customDesignButton)
    expect(inlineOrderForm).toHaveAttribute('data-request-mode', 'custom-design')

    fireEvent.click(customDesignButton)
    expect(inlineOrderForm).toHaveAttribute('data-request-mode', 'message')
  })

  it('does not pass explicit occasion options to inline order form', () => {
    render(
      <CakePageClient
        cake={baseCake}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByTestId('inline-order-form')).toHaveAttribute(
      'data-occasion-options',
      JSON.stringify([])
    )
  })

  it('uses centered primary-50 styling for filling and servings selects and custom design button', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    const fillingTypeSelect = screen.getByLabelText('Filling type')
    const servingsSelect = screen.getByLabelText('Servings')
    const customDesignButton = screen.getByLabelText('Custom design')

    expect(fillingTypeSelect).toHaveClass('bg-primary-50')
    expect(servingsSelect).toHaveClass('bg-primary-50')
    expect(customDesignButton).toHaveClass('bg-primary-50')
    expect(fillingTypeSelect).toHaveClass('tablet:h-12')
    expect(fillingTypeSelect).toHaveClass('tablet:min-h-12')
    expect(servingsSelect).toHaveClass('tablet:h-12')
    expect(servingsSelect).toHaveClass('tablet:min-h-12')
    expect(fillingTypeSelect).toHaveClass('text-center')
    expect(servingsSelect).toHaveClass('text-center')
    expect(customDesignButton).toHaveClass('text-center')
    expect(fillingTypeSelect).toHaveClass('justify-center')
    expect(servingsSelect).toHaveClass('justify-center')
    expect(customDesignButton).toHaveClass('justify-center')
    expect(fillingTypeSelect).toHaveClass('cursor-pointer')
    expect(servingsSelect).toHaveClass('cursor-pointer')
    expect(customDesignButton).toHaveClass('cursor-pointer')
    expect(fillingTypeSelect).toHaveStyle('text-align-last: center')
    expect(servingsSelect).toHaveStyle('text-align-last: center')
    expect(fillingTypeSelect).toHaveStyle('justify-content: center')
    expect(servingsSelect).toHaveStyle('justify-content: center')
    expect(fillingTypeSelect).not.toHaveClass('bg-base-200')
    expect(servingsSelect).not.toHaveClass('bg-base-200')
    expect(customDesignButton).not.toHaveClass('bg-base-200')
    expect(customDesignButton).toHaveAttribute('aria-pressed', 'false')

    Array.from(fillingTypeSelect.querySelectorAll('option')).forEach((option) => {
      expect(option).toHaveClass('text-center')
      expect(option).toHaveClass('justify-center')
      expect(option).toHaveStyle('text-align: center')
      expect(option).toHaveStyle('justify-content: center')
    })

    Array.from(servingsSelect.querySelectorAll('option')).forEach((option) => {
      expect(option).toHaveClass('text-center')
      expect(option).toHaveClass('justify-center')
      expect(option).toHaveStyle('text-align: center')
      expect(option).toHaveStyle('justify-content: center')
    })
  })

  it('does not render filling preview below gallery when order form is closed', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    expect(screen.queryByTestId('layout-gallery-below-content')).not.toBeInTheDocument()
  })

  it('renders default filling preview below gallery when order form opens', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByTestId('layout-gallery-below-content')).toBeInTheDocument()
    expect(screen.getByAltText('Cherry filling slice')).toBeInTheDocument()

    const layoutImages = getLatestLayoutImages()
    expect(layoutImages.some((image) => image.alt === 'Cherry filling slice')).toBe(false)
  })

  it('injects selected filling image as second gallery slide on mobile when order form opens', () => {
    setMatchMedia(true)

    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    const layoutImages = getLatestLayoutImages()
    expect(layoutImages[1]?.alt).toBe('Cherry filling slice')
    expect(screen.queryByTestId('layout-gallery-below-content')).not.toBeInTheDocument()
  })

  it('does not request carousel focus on mobile until filling changes', () => {
    setMatchMedia(true)

    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(getLatestLayoutProps().requestedActiveImageIndex).toBeUndefined()
    expect(getLatestLayoutProps().requestedActiveImageKey).toBeUndefined()
  })

  it('requests carousel focus to second slide after mobile filling change', () => {
    setMatchMedia(true)

    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    fireEvent.change(screen.getByLabelText('Filling type'), { target: { value: 'filling-chocolate' } })

    expect(getLatestLayoutProps().requestedActiveImageIndex).toBe(1)
    expect(getLatestLayoutProps().requestedActiveImageKey).toBe('filling-change-1')

    const layoutImages = getLatestLayoutImages()
    expect(layoutImages[1]?.alt).toBe('Chocolate filling slice')
  })

  it('clears mobile carousel focus request when selected filling has no image', () => {
    setMatchMedia(true)

    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          fillingTypes: [
            {
              _id: 'filling-cherry',
              name: 'Cherry',
              image: {
                _type: 'image',
                asset: {
                  _ref: 'image-filling-cherry',
                  _type: 'reference'
                },
                alt: 'Cherry filling slice'
              }
            },
            {
              _id: 'filling-no-image',
              name: 'No image filling'
            }
          ],
          defaultFillingType: {
            _id: 'filling-cherry',
            name: 'Cherry'
          }
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    fireEvent.change(screen.getByLabelText('Filling type'), { target: { value: 'filling-no-image' } })

    expect(getLatestLayoutProps().requestedActiveImageIndex).toBeUndefined()
    expect(getLatestLayoutProps().requestedActiveImageKey).toBeUndefined()
  })

  it('updates filling preview when filling selection changes', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(screen.getByAltText('Cherry filling slice')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Filling type'), { target: { value: 'filling-chocolate' } })

    expect(screen.queryByAltText('Cherry filling slice')).not.toBeInTheDocument()
    expect(screen.getByAltText('Chocolate filling slice')).toBeInTheDocument()
  })

  it('hides filling preview when selected filling has no image', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          fillingTypes: [
            {
              _id: 'filling-cherry',
              name: 'Cherry',
              image: {
                _type: 'image',
                asset: {
                  _ref: 'image-filling-cherry',
                  _type: 'reference'
                },
                alt: 'Cherry filling slice'
              }
            },
            {
              _id: 'filling-no-image',
              name: 'No image filling'
            }
          ],
          defaultFillingType: {
            _id: 'filling-cherry',
            name: 'Cherry'
          }
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(screen.getByTestId('layout-gallery-below-content')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Filling type'), { target: { value: 'filling-no-image' } })

    expect(screen.queryByTestId('layout-gallery-below-content')).not.toBeInTheDocument()
  })

  it('switches back label to "Back to product" when the inline order form is open', () => {
    render(
      <CakePageClient
        cake={baseCake}
        backHref='/cakes'
      />
    )

    expect(getLatestLayoutProps().backLabel).toBe('Back to all cakes')
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(getLatestLayoutProps().backLabel).toBe('Back to product')
    expect(screen.getByTestId('layout-back-link')).toHaveTextContent('Back to product')
  })

  it('resets filling preview back to default after back to product', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    fireEvent.change(screen.getByLabelText('Filling type'), { target: { value: 'filling-chocolate' } })
    expect(screen.getByAltText('Chocolate filling slice')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Trigger back to product' }))
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByAltText('Cherry filling slice')).toBeInTheDocument()
    expect(screen.queryByAltText('Chocolate filling slice')).not.toBeInTheDocument()
  })

  it('uses live selected price text in open state and updates as options change', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    expect(getLatestLayoutProps().priceText).toBe('from \u00A330')
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    expect(getLatestLayoutProps().priceText).toBe('from \u00A330')

    fireEvent.change(screen.getByLabelText('Servings'), { target: { value: 'servings8To12' } })
    expect(getLatestLayoutProps().priceText).toBe('from \u00A360')

    const customDesignButton = screen.getByLabelText('Custom design')
    fireEvent.click(customDesignButton)
    expect(getLatestLayoutProps().priceText).toBe('from \u00A374')

    fireEvent.click(customDesignButton)
    expect(getLatestLayoutProps().priceText).toBe('from \u00A360')
  })

  it('closes open state via back action and resets cake options to defaults', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions()}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    fireEvent.change(screen.getByLabelText('Filling type'), { target: { value: 'filling-chocolate' } })
    fireEvent.change(screen.getByLabelText('Servings'), { target: { value: 'servings8To12' } })
    fireEvent.click(screen.getByLabelText('Custom design'))

    fireEvent.click(screen.getByRole('button', { name: 'Trigger back to product' }))

    expect(screen.queryByTestId('inline-order-form')).not.toBeInTheDocument()
    expect(getLatestLayoutProps().backLabel).toBe('Back to all cakes')

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByLabelText('Filling type')).toHaveValue('filling-cherry')
    expect(screen.getByLabelText('Servings')).toHaveValue('servings2To4')
    const resetCustomDesignButton = screen.getByLabelText('Custom design')
    expect(resetCustomDesignButton).toHaveAttribute('aria-pressed', 'false')
    expect(resetCustomDesignButton).toHaveTextContent('Add a custom design? + \u00A314')
  })

  it('uses explicitly selected default filling type when available', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          defaultFillingType: {
            _id: 'filling-chocolate',
            name: 'Chocolate'
          }
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByLabelText('Filling type')).toHaveValue('filling-chocolate')
  })

  it('falls back to first filling type when default filling is missing', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          defaultFillingType: undefined
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByLabelText('Filling type')).toHaveValue('filling-cherry')
  })

  it('falls back to first filling type when default filling is not selected', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          defaultFillingType: {
            _id: 'filling-lemon',
            name: 'Lemon'
          }
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByLabelText('Filling type')).toHaveValue('filling-cherry')
  })

  it('restores explicit default filling type after back to product reset', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          defaultFillingType: {
            _id: 'filling-chocolate',
            name: 'Chocolate'
          }
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    fireEvent.change(screen.getByLabelText('Filling type'), { target: { value: 'filling-cherry' } })

    fireEvent.click(screen.getByRole('button', { name: 'Trigger back to product' }))
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByLabelText('Filling type')).toHaveValue('filling-chocolate')
  })

  it('uses minimum-priced serving even when a non-min tier is flagged default', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          newDesignPricingByServings: {
            servings2To4: 30,
            servings4To8: 45,
            servings8To12: 60,
            servings12To20: 75,
            servings20Plus: 90,
            servings2To4IsDefault: false,
            servings4To8IsDefault: false,
            servings8To12IsDefault: true,
            servings12To20IsDefault: false,
            servings20PlusIsDefault: false
          }
        })}
        backHref='/cakes'
      />
    )

    expect(getLatestLayoutProps().priceText).toBe('from \u00A330')
    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByLabelText('Servings')).toHaveValue('servings2To4')
    expect(getLatestLayoutProps().priceText).toBe('from \u00A330')
  })

  it('falls back to minimum legacy price when servings pricing is unavailable', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          pricing: {
            standard: 33,
            individual: 31
          },
          newDesignPricingByServings: undefined
        })}
        backHref='/cakes'
      />
    )

    expect(getLatestLayoutProps().priceText).toBe('from \u00A331')
  })

  it('falls back to minimum serving when default flags are missing', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          newDesignPricingByServings: {
            servings2To4: 30,
            servings4To8: 45,
            servings8To12: 60,
            servings12To20: 75,
            servings20Plus: 90
          }
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByLabelText('Servings')).toHaveValue('servings2To4')
  })

  it('falls back to first minimum serving when multiple defaults are set', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          newDesignPricingByServings: {
            servings2To4: 30,
            servings4To8: 45,
            servings8To12: 60,
            servings12To20: 75,
            servings20Plus: 90,
            servings2To4IsDefault: true,
            servings4To8IsDefault: false,
            servings8To12IsDefault: true,
            servings12To20IsDefault: false,
            servings20PlusIsDefault: false
          }
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByLabelText('Servings')).toHaveValue('servings2To4')
  })

  it('falls back to first available minimum serving when 4-8 price is unavailable', () => {
    const pricingWithoutCanonicalServing = {
      ...createCakeWithOrderOptions().newDesignPricingByServings
    } as Record<string, unknown>

    delete pricingWithoutCanonicalServing.servings4To8

    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          newDesignPricingByServings: pricingWithoutCanonicalServing as Cake['newDesignPricingByServings']
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    expect(screen.getByLabelText('Servings')).toHaveValue('servings2To4')
    expect(getLatestLayoutProps().priceText).toBe('from \u00A330')
  })

  it('shows only priced servings in dropdown and keeps existing labels unchanged', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          newDesignPricingByServings: {
            servings4To8: 45,
            servings20Plus: 90,
            servings2To4IsDefault: true,
            servings4To8IsDefault: false,
            servings8To12IsDefault: false,
            servings12To20IsDefault: false,
            servings20PlusIsDefault: false
          }
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))

    const servingsSelect = screen.getByLabelText('Servings') as HTMLSelectElement
    const servingOptions = Array.from(servingsSelect.querySelectorAll('option')).map((option) => ({
      value: option.value,
      label: option.textContent ?? ''
    }))

    expect(servingsSelect).toHaveValue('servings4To8')
    expect(servingOptions).toEqual([
      { value: 'servings4To8', label: 'Serves 4-8 people' },
      { value: 'servings20Plus', label: 'Serves 20+ people' }
    ])
    servingOptions.forEach((servingOption) => {
      expect(/\u00A3/.test(servingOption.label)).toBe(false)
    })
  })

  it('renders fixed custom design surcharge text and toggles active state text', () => {
    render(
      <CakePageClient
        cake={createCakeWithOrderOptions({
          pricing: {
            standard: 29,
            individual: 99
          }
        })}
        backHref='/cakes'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Trigger add to cart' }))
    const customDesignButton = screen.getByLabelText('Custom design')
    expect(customDesignButton).toHaveTextContent('Add a custom design? + \u00A314')
    expect(customDesignButton).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(customDesignButton)
    expect(customDesignButton).toHaveTextContent('Custom design added + \u00A314')
    expect(customDesignButton).toHaveAttribute('aria-pressed', 'true')
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

  it('uses paid-delivery fallback key point when shipping fee is above zero', () => {
    render(
      <CakePageClient
        cake={{
          ...baseCake,
          shortDescription: [],
          deliverySection: {
            descriptionSource: 'custom',
            customDescription: [
              {
                _type: 'block',
                children: [
                  {
                    text: 'Dispatch in 2-3 working days. UK delivery is \u00A34.50.'
                  }
                ]
              }
            ],
            customPolicy: {
              dispatchMinDays: 2,
              dispatchMaxDays: 3,
              shippingFeeGbp: 4.5,
              shippingDestinationCountry: 'GB',
              deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
            }
          }
        }}
        backHref='/cakes'
      />
    )

    expect(screen.getByText('UK delivery from \u00A34.50')).toBeInTheDocument()
    expect(screen.queryByText('Free UK delivery')).not.toBeInTheDocument()
  })

  it('uses neutral delivery fallback key point when shipping details are omitted', () => {
    render(
      <CakePageClient
        cake={{
          ...baseCake,
          shortDescription: [],
          deliverySection: {
            descriptionSource: 'custom',
            customDescription: [
              {
                _type: 'block',
                children: [
                  {
                    text: 'UK delivery is \u00A30.'
                  }
                ]
              }
            ],
            customPolicy: {
              dispatchMinDays: 2,
              dispatchMaxDays: 3,
              shippingFeeGbp: 4.5,
              shippingDestinationCountry: 'GB',
              deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
            }
          }
        }}
        backHref='/cakes'
      />
    )

    expect(screen.getByText('Delivery details confirmed before dispatch')).toBeInTheDocument()
    expect(screen.queryByText('UK delivery from \u00A34.50')).not.toBeInTheDocument()
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

  it('renders full description from portable text blocks without flattening formatting away', () => {
    render(
      <CakePageClient
        cake={{
          ...baseCake,
          description: [
            {
              _type: 'block',
              style: 'h2',
              children: [
                {
                  _type: 'span',
                  text: 'Cake details'
                }
              ]
            },
            {
              _type: 'block',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  text: 'First formatted point'
                }
              ]
            }
          ]
        }}
        backHref='/cakes'
      />
    )

    const fullDescriptionSection = getLatestSections().find((section) => section.id === 'full-description')
    render(<>{fullDescriptionSection?.content as React.ReactNode}</>)

    expect(screen.getByRole('heading', { level: 3, name: 'Cake details' })).toBeInTheDocument()
    expect(screen.getByText('First formatted point')).toBeInTheDocument()
  })

  it('falls back to short description when description blocks contain no visible text', () => {
    render(
      <CakePageClient
        cake={{
          ...baseCake,
          description: [
            {
              _type: 'block',
              children: [
                {
                  _type: 'span',
                  text: '   '
                }
              ]
            }
          ],
          shortDescription: [
            {
              _type: 'block',
              style: 'h2',
              children: [
                {
                  _type: 'span',
                  text: 'Fallback details'
                }
              ]
            }
          ]
        }}
        backHref='/cakes'
      />
    )

    const fullDescriptionSection = getLatestSections().find((section) => section.id === 'full-description')
    render(<>{fullDescriptionSection?.content as React.ReactNode}</>)

    expect(screen.getByRole('heading', { level: 3, name: 'Fallback details' })).toBeInTheDocument()
  })

  it('uses the global cakes delivery section name as the delivery accordion title', () => {
    render(
      <CakePageClient
        cake={{
          ...baseCake,
          cakesDeliverySection: {
            name: 'Shipping & delivery',
            description: [
              {
                _type: 'block',
                children: [
                  {
                    text: 'Global delivery description'
                  }
                ]
              }
            ]
          }
        }}
        backHref='/cakes'
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
            text: 'Custom delivery description'
          }
        ]
      }
    ]

    render(
      <CakePageClient
        cake={{
          ...baseCake,
          deliverySection: {
            descriptionSource: 'custom',
            customDescription: customDeliveryDescription
          },
          cakesDeliverySection: {
            name: 'Shipping & delivery',
            description: [
              {
                _type: 'block',
                children: [
                  {
                    text: 'Global delivery description'
                  }
                ]
              }
            ]
          }
        }}
        backHref='/cakes'
      />
    )

    const deliverySection = getDeliverySection()
    const deliveryContent = deliverySection?.content as React.ReactElement<{ value: unknown }>

    expect(deliveryContent.props.value).toEqual(customDeliveryDescription)
  })

  it('prefers ingredient reference rich text over legacy arrays in the ingredients section', () => {
    render(
      <CakePageClient
        cake={{
          ...baseCake,
          ingredientReference: {
            _id: 'ingredient-1',
            ingredients: [
              {
                _type: 'block',
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    text: 'Reference ingredient copy'
                  }
                ]
              }
            ]
          }
        }}
        backHref='/cakes'
      />
    )

    const ingredientsSection = getLatestSections().find((section) => section.id === 'ingredients')
    render(<>{ingredientsSection?.content as React.ReactNode}</>)

    expect(screen.getByText('Reference ingredient copy')).toBeInTheDocument()
    expect(screen.queryByText('Flour')).not.toBeInTheDocument()
    expect(screen.queryByText('Allergens')).not.toBeInTheDocument()
  })

  it('falls back to legacy ingredient and allergen arrays when no ingredient reference exists', () => {
    render(
      <CakePageClient
        cake={{
          ...baseCake,
          ingredientReference: undefined
        }}
        backHref='/cakes'
      />
    )

    const ingredientsSection = getLatestSections().find((section) => section.id === 'ingredients')
    render(<>{ingredientsSection?.content as React.ReactNode}</>)

    expect(screen.getByText('Flour')).toBeInTheDocument()
    expect(screen.getByText('Honey')).toBeInTheDocument()
    expect(screen.getByText('Cream')).toBeInTheDocument()
    expect(screen.getByText('Allergens')).toBeInTheDocument()
    expect(screen.getByText('Gluten')).toBeInTheDocument()
  })

  it('shows the generic ingredients fallback only when both reference and legacy arrays are empty', () => {
    render(
      <CakePageClient
        cake={{
          ...baseCake,
          ingredientReference: undefined,
          ingredients: [],
          allergens: []
        }}
        backHref='/cakes'
      />
    )

    const ingredientsSection = getLatestSections().find((section) => section.id === 'ingredients')
    render(<>{ingredientsSection?.content as React.ReactNode}</>)

    expect(screen.getByText('Ingredient details are available on request before ordering.')).toBeInTheDocument()
  })
})
