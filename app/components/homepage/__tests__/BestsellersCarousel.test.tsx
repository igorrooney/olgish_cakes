/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import { BestsellersCarousel, type CakeWithImage } from '../BestsellersCarousel'

type ImageProps = {
  alt?: string
  src?: string
  fill?: boolean
  className?: string
  quality?: number
  sizes?: string
}

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, fill: _fill, ...props }: ImageProps) => (
    <img alt={alt} src={src} {...props} />
  )
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => (
    <a href={href} className={className}>{children}</a>
  )
}))

const cake: CakeWithImage = {
  _id: 'cake-1',
  _createdAt: '2026-01-01T00:00:00Z',
  name: 'Honey Cake',
  slug: { current: 'honey-cake' },
  description: [],
  shortDescription: [],
  size: '8 inch',
  pricing: { standard: 30, individual: 45 },
  mainImage: {
    _type: 'image',
    asset: {
      _ref: 'image-1',
      url: 'https://example.com/honey-cake.jpg'
    },
    alt: 'Honey cake'
  },
  images: [],
  designs: { standard: [] },
  category: 'traditional',
  ingredients: ['Honey'],
  allergens: ['Gluten'],
  isBestseller: true,
  imageUrl: 'https://example.com/honey-cake.jpg'
}

describe('BestsellersCarousel', () => {
  it('avoids load-time scroll snap by using padding without mandatory snap', () => {
    const { container } = render(<BestsellersCarousel cakes={[cake]} />)

    const carousel = container.querySelector('.carousel')
    const firstItem = container.querySelector('.carousel-item') as HTMLElement | null

    expect(carousel).toHaveClass('px-6')
    expect(carousel).toHaveClass('[scroll-snap-type:none]')
    expect(carousel).not.toHaveClass('ml-[15px]')
    expect(carousel).not.toHaveClass('[scroll-snap-type:x_mandatory]')
    expect(firstItem).toHaveClass('[scroll-snap-align:start]')
    expect(firstItem?.style.marginLeft).toBe('')
  })

  it('serves the bestseller sticker at its rendered badge size', () => {
    const { container } = render(<BestsellersCarousel cakes={[cake]} />)

    const sticker = container.querySelector('img[src="/design/mobile-home/bestseller-sticker.png"]')

    expect(sticker).toHaveAttribute('sizes', '73px')
    expect(sticker).toHaveAttribute('quality', '45')
  })
})
