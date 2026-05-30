/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { InstagramCarousel } from '../InstagramCarousel'
import type { InstagramCarouselPost } from '../instagramCarouselContent'

interface ImageProps {
  alt?: string
  src?: string
  fill?: boolean
  [key: string]: unknown
}

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, fill: _fill, ...props }: ImageProps) => (
    <img alt={alt} src={src} data-testid="next-image" {...props} />
  )
}))

describe('InstagramCarousel', () => {
  const posts: InstagramCarouselPost[] = [
    {
      id: 'post-1',
      captionLine: 'Honey cake close-up',
      imageAlt: 'Honey cake close-up',
      imageUrl: 'https://scontent.cdninstagram.com/media-1.jpg',
      mediaType: 'IMAGE',
      permalink: 'https://instagram.com/p/post-1'
    },
    {
      id: 'post-2',
      captionLine: 'Birthday cake details',
      imageAlt: 'Birthday cake details',
      imageUrl: 'https://scontent.cdninstagram.com/media-2.jpg',
      mediaType: 'VIDEO',
      permalink: 'https://instagram.com/p/post-2'
    }
  ]

  it('renders Instagram posts with profile details', () => {
    render(
      <InstagramCarousel
        posts={posts}
        profileUrl="https://www.instagram.com/olgish_cakes/"
        profileName="Olgish Cakes"
        profileHandle="@olgish_cakes"
      />
    )

    expect(screen.getAllByText('View Profile')).toHaveLength(2)
    expect(screen.getByAltText('Honey cake close-up')).toBeInTheDocument()
    expect(screen.getByAltText('Honey cake close-up')).toHaveClass('object-cover')
    expect(screen.getByAltText('Birthday cake details').closest('a')?.style.aspectRatio).toBe('3 / 4')
    expect(screen.getByText('Honey cake close-up')).toBeInTheDocument()
    expect(screen.queryByText('More details here')).toBeNull()
    expect(screen.getByText('Birthday cake details')).toBeInTheDocument()
    expect(screen.getAllByText('View More on Instagram')).toHaveLength(2)
  })

  it('shows next control when multiple posts are available', () => {
    const { container } = render(
      <InstagramCarousel
        posts={posts}
        profileUrl="https://www.instagram.com/olgish_cakes/"
        profileName="Olgish Cakes"
        profileHandle="@olgish_cakes"
      />
    )

    const carousel = container.querySelector('.carousel') as HTMLDivElement | null
    const items = container.querySelectorAll('.carousel-item')
    expect(carousel).toBeTruthy()
    expect(items.length).toBeGreaterThan(1)

    if (!carousel || items.length < 2) {
      throw new Error('Carousel elements not found for navigation test')
    }

    const createRect = (left: number, right: number): DOMRect => ({
      left,
      right,
      top: 0,
      bottom: 0,
      width: right - left,
      height: 100,
      x: left,
      y: 0,
      toJSON: () => ''
    } as DOMRect)

    const firstItem = items[0] as HTMLElement
    const lastItem = items[items.length - 1] as HTMLElement

    carousel.getBoundingClientRect = () => createRect(0, 300)
    firstItem.getBoundingClientRect = () => createRect(0, 100)
    lastItem.getBoundingClientRect = () => createRect(400, 500)

    fireEvent.scroll(carousel)

    expect(screen.getAllByLabelText('Next post')).toHaveLength(2)
    const previousButtons = screen.getAllByLabelText('Previous post')
    expect(previousButtons).toHaveLength(1)
    expect(previousButtons[0]).toBeDisabled()
  })

  it('avoids load-time scroll snap by using padding without mandatory snap', () => {
    const { container } = render(
      <InstagramCarousel
        posts={posts}
        profileUrl="https://www.instagram.com/olgish_cakes/"
        profileName="Olgish Cakes"
        profileHandle="@olgish_cakes"
      />
    )

    const carousel = container.querySelector('#instagram-carousel')
    const firstItem = container.querySelector('.carousel-item') as HTMLElement | null

    expect(carousel).toHaveClass('px-6')
    expect(carousel).toHaveClass('[scroll-snap-type:none]')
    expect(carousel).not.toHaveClass('ml-[15px]')
    expect(carousel).not.toHaveClass('[scroll-snap-type:x_mandatory]')
    expect(firstItem).toHaveClass('[scroll-snap-align:start]')
    expect(firstItem?.style.marginLeft).toBe('')
  })
})
