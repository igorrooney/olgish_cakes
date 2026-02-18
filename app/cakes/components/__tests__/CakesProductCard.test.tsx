/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CakesProductCard } from '../CakesProductCard'
import { TabletCake } from '../types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    fill,
    priority,
    ...props
  }: React.ComponentProps<'img'> & { fill?: boolean, priority?: boolean }) => (
    <img alt={alt || ''} {...props} />
  )
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={href} {...props}>{children}</a>
  )
}))

const baseCake: TabletCake = {
  id: 'cake-1',
  slug: 'christmas-honey-cake',
  href: '/cakes/christmas-honey-cake',
  name: 'Christmas Honey Cake',
  description: 'Layered honey sponge with sour cream and festive decoration.',
  price: 27,
  imageUrl: '/images/placeholder-cake.jpg',
  imageAlt: 'Christmas honey cake decorated with festive details',
  isByPost: false,
  isCustom: true,
  isPopular: true,
  collectionIds: ['collection-1'],
  productType: 'cake'
}

interface RenderCardOptions {
  isLcpCandidate?: boolean
}

function renderCard(cakeOverrides: Partial<TabletCake> = {}, options: RenderCardOptions = {}) {
  const cake = { ...baseCake, ...cakeOverrides }
  const { isLcpCandidate = false } = options

  return render(<CakesProductCard cake={cake} isLcpCandidate={isLcpCandidate} />)
}

function renderMobileCard(
  cakeOverrides: Partial<TabletCake> = {},
  mobileViewMode: 'grid' | 'single' = 'grid',
  options: RenderCardOptions = {}
) {
  const cake = { ...baseCake, ...cakeOverrides }
  const { isLcpCandidate = false } = options

  return render(
    <CakesProductCard
      cake={cake}
      variant='mobile'
      mobileViewMode={mobileViewMode}
      isLcpCandidate={isLcpCandidate}
    />
  )
}

describe('CakesProductCard', () => {
  it('renders cake name, description and image alt text', () => {
    renderCard()

    expect(screen.getByText('Christmas Honey Cake')).toBeInTheDocument()
    expect(screen.getByText('Layered honey sponge with sour cream and festive decoration.')).toBeInTheDocument()
    expect(screen.getByAltText('Christmas honey cake decorated with festive details')).toBeInTheDocument()
  })

  it('renders regular cake price with the from prefix', () => {
    renderCard()

    expect(screen.getByText(/from.*27/i)).toBeInTheDocument()
  })

  it('renders by-post cake price as fixed amount without from prefix', () => {
    renderCard({ productType: 'giftHamper', isByPost: true, isCustom: false })
    const price = screen.getByText(/27/)

    expect(price).toBeInTheDocument()
    expect(price).not.toHaveTextContent(/from/i)
  })

  it('keeps lazy loading for non-LCP images by default', () => {
    renderCard()

    expect(screen.getByAltText('Christmas honey cake decorated with festive details')).toHaveAttribute('loading', 'lazy')
  })

  it('uses eager loading for LCP candidate image', () => {
    renderCard({}, { isLcpCandidate: true })

    expect(screen.getByAltText('Christmas honey cake decorated with festive details')).toHaveAttribute('loading', 'eager')
  })

  it('reveals already-complete image without waiting for load event', async () => {
    const completeSpy = jest.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    const naturalWidthSpy = jest.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1200)

    try {
      renderCard({}, { isLcpCandidate: true })

      const image = screen.getByAltText('Christmas honey cake decorated with festive details')
      const loadingOverlay = screen.getByTestId('cake-card-image-loading-overlay')

      await waitFor(() => {
        expect(loadingOverlay).toHaveClass('opacity-0')
        expect(image).toHaveClass('opacity-100')
      })

      expect(loadingOverlay).not.toHaveClass('opacity-100')
      expect(loadingOverlay).not.toHaveClass('animate-pulse')
      expect(image).not.toHaveClass('opacity-0')
    } finally {
      completeSpy.mockRestore()
      naturalWidthSpy.mockRestore()
    }
  })

  it('renders the card as a single clickable link', () => {
    renderCard()

    expect(screen.getByRole('link', { name: 'View details for Christmas Honey Cake' })).toBeInTheDocument()
  })

  it('links CTA to the cake details page', () => {
    renderCard()

    expect(screen.getByRole('link', { name: 'View details for Christmas Honey Cake' })).toHaveAttribute(
      'href',
      '/cakes/christmas-honey-cake'
    )
  })

  it('sets CTA accessible name using the cake name', () => {
    renderCard({ name: 'Kyiv Cake' })

    expect(screen.getByRole('link', { name: 'View details for Kyiv Cake' })).toBeInTheDocument()
  })

  it('keeps card layout classes for equal-height rows and bottom-aligned price', () => {
    const { container } = renderCard()
    const article = container.querySelector('article')
    const cardLink = screen.getByRole('link', { name: 'View details for Christmas Honey Cake' })
    const price = screen.getByText(/from.*27/i)
    const image = screen.getByAltText('Christmas honey cake decorated with festive details')
    const imageWrapper = image.parentElement

    expect(article).not.toBeNull()
    expect(article).toHaveClass('flex', 'h-full', 'flex-col')
    expect(article).toHaveClass('border', 'border-primary-50', 'bg-primary-50')
    expect(cardLink).toHaveClass('block', 'h-full')
    expect(price).toHaveClass('mt-auto')
    expect(imageWrapper).not.toBeNull()
    expect(imageWrapper).toHaveClass('aspect-square', 'rounded-[8px]')
    expect(imageWrapper).not.toHaveClass('aspect-[4/3]')
  })

  it('shows shimmer overlay before desktop image load and fades it after load', () => {
    renderCard()

    const image = screen.getByAltText('Christmas honey cake decorated with festive details')
    const loadingOverlay = screen.getByTestId('cake-card-image-loading-overlay')

    expect(loadingOverlay).toHaveClass(
      'bg-base-200',
      'animate-pulse',
      'opacity-100',
      'motion-reduce:animate-none'
    )
    expect(image).toHaveClass('opacity-0')

    fireEvent.load(image)

    expect(loadingOverlay).toHaveClass('opacity-0')
    expect(loadingOverlay).not.toHaveClass('opacity-100')
    expect(loadingOverlay).not.toHaveClass('animate-pulse')
    expect(image).toHaveClass('opacity-100')
    expect(image).not.toHaveClass('opacity-0')
  })

  it('renders mobile variant without description and with a chip price on image', () => {
    const { container } = renderMobileCard()
    const article = container.querySelector('article')
    const mobilePriceChip = screen.getByTestId('mobile-price-chip')
    const mobileHeading = screen.getByRole('heading', { level: 3, name: 'Christmas Honey Cake' })

    expect(screen.queryByText('Layered honey sponge with sour cream and festive decoration.')).not.toBeInTheDocument()
    expect(mobilePriceChip).toHaveTextContent(/from.*27/i)
    expect(mobilePriceChip).toHaveClass(
      'h-6',
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-[8px]',
      'px-3',
      'py-0',
      'bg-primary-50',
      '[font-family:var(--font-more-sugar),cursive,fantasy]',
      '[font-weight:var(--t-font-weight-semibold)]',
      'not-italic',
      'text-[16px]',
      '[leading-trim:none]',
      '[line-height:var(--d-lineHeight-14)]',
      'tracking-[0]',
      'text-center',
      'align-middle',
      'text-primary-500',
      'shadow-sm'
    )
    expect(mobilePriceChip).not.toHaveClass('rounded-[18px]', 'px-4', 'py-1', 'text-[20px]', 'leading-7')
    expect(mobileHeading).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-semibold)]',
      '[font-style:normal]',
      'text-[12px]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--color-filter-sort-mobile-text)'
    )
    expect(mobileHeading).not.toHaveClass('text-[19px]', 'leading-[28px]', 'text-base-content')
    expect(article).not.toBeNull()
    expect(article).not.toHaveClass('bg-primary-50')
    expect(article).not.toHaveClass('border')
  })

  it('uses fixed 163 square image with token radius in mobile grid mode', () => {
    renderMobileCard()

    const image = screen.getByAltText('Christmas honey cake decorated with festive details')
    const imageWrapper = image.parentElement
    const mobileLink = screen.getByRole('link', { name: 'View details for Christmas Honey Cake' })

    expect(image).toHaveAttribute('sizes', '163px')
    expect(imageWrapper).not.toBeNull()
    expect(imageWrapper).toHaveClass('aspect-square', 'max-w-[163px]', 'rounded-btn')
    expect(imageWrapper).not.toHaveClass('aspect-[4/3]')
    expect(mobileLink).toHaveClass('block', 'h-full', 'w-full', 'max-w-[163px]', 'mx-auto')
  })

  it('uses square image in mobile single-column mode', () => {
    renderMobileCard({}, 'single')

    const image = screen.getByAltText('Christmas honey cake decorated with festive details')
    const imageWrapper = image.parentElement
    const mobileLink = screen.getByRole('link', { name: 'View details for Christmas Honey Cake' })
    const mobilePriceChip = screen.getByTestId('mobile-price-chip')
    const mobileHeading = screen.getByRole('heading', { level: 3, name: 'Christmas Honey Cake' })

    expect(image).toHaveAttribute(
      'sizes',
      '(min-width: 1512px) 379px, (min-width: 1280px) 301px, (min-width: 1024px) 336px, calc(100vw - 2rem)'
    )
    expect(imageWrapper).not.toBeNull()
    expect(imageWrapper).toHaveClass('aspect-square', 'rounded-[10px]')
    expect(imageWrapper).not.toHaveClass('aspect-[4/3]')
    expect(imageWrapper).not.toHaveClass('max-w-[163px]')
    expect(imageWrapper).not.toHaveClass('rounded-btn')
    expect(mobileLink).toHaveClass('block', 'h-full')
    expect(mobileLink).not.toHaveClass('w-full')
    expect(mobileLink).not.toHaveClass('max-w-[163px]')
    expect(mobileLink).not.toHaveClass('mx-auto')
    expect(mobilePriceChip).toHaveClass(
      'h-6',
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-[8px]',
      'px-3',
      'py-0',
      'bg-primary-50',
      '[font-family:var(--font-more-sugar),cursive,fantasy]',
      '[font-weight:var(--t-font-weight-semibold)]',
      'not-italic',
      'text-[16px]',
      '[leading-trim:none]',
      '[line-height:var(--d-lineHeight-14)]',
      'tracking-[0]',
      'text-center',
      'align-middle',
      'text-primary-500',
      'shadow-sm'
    )
    expect(mobilePriceChip).not.toHaveClass('rounded-[18px]', 'px-4', 'py-1', 'text-[20px]', 'leading-7')
    expect(mobileHeading).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-semibold)]',
      '[font-style:normal]',
      'text-[12px]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--color-filter-sort-mobile-text)'
    )
    expect(mobileHeading).not.toHaveClass('text-[19px]', 'leading-[28px]', 'text-base-content')
  })

  it('shows shimmer overlay before mobile image load and clears it on error', () => {
    renderMobileCard()

    const image = screen.getByAltText('Christmas honey cake decorated with festive details')
    const loadingOverlay = screen.getByTestId('cake-card-image-loading-overlay')

    expect(loadingOverlay).toHaveClass(
      'bg-base-200',
      'animate-pulse',
      'opacity-100',
      'motion-reduce:animate-none'
    )
    expect(image).toHaveClass('opacity-0')

    fireEvent.error(image)

    expect(loadingOverlay).toHaveClass('opacity-0')
    expect(loadingOverlay).not.toHaveClass('opacity-100')
    expect(loadingOverlay).not.toHaveClass('animate-pulse')
    expect(image).toHaveClass('opacity-100')
    expect(image).not.toHaveClass('opacity-0')
  })

  it('renders mobile by-post cake price chip without from prefix', () => {
    renderMobileCard({ productType: 'giftHamper', isByPost: true, isCustom: false })

    expect(screen.getByTestId('mobile-price-chip')).toHaveTextContent(/27/)
    expect(screen.getByTestId('mobile-price-chip')).not.toHaveTextContent(/from/i)
  })
})
