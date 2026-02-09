/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { InstagramCarousel } from '../InstagramCarousel'
import type { InstagramPost } from '@/app/types/instagram'

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
  const posts: InstagramPost[] = [
    {
      id: 'post-1',
      caption: 'Honey cake close-up\nMore details here',
      imageUrl: 'https://scontent.cdninstagram.com/media-1.jpg',
      permalink: 'https://instagram.com/p/post-1',
      mediaType: 'IMAGE',
      likeCount: 120
    },
    {
      id: 'post-2',
      caption: 'Birthday cake details',
      imageUrl: 'https://scontent.cdninstagram.com/media-2.jpg',
      permalink: 'https://instagram.com/p/post-2',
      mediaType: 'IMAGE'
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
})
