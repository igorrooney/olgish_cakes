/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MobileInstagramCarousel } from '../MobileInstagramCarousel'
import type { InstagramPost } from '@/app/types/instagram'

interface ImageProps {
  alt?: string
  src?: string
  [key: string]: unknown
}

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: ImageProps) => (
    <img alt={alt} src={src} data-testid="next-image" {...props} />
  )
}))

describe('MobileInstagramCarousel', () => {
  const posts: InstagramPost[] = [
    {
      id: 'post-1',
      caption: 'Honey cake close-up',
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
      <MobileInstagramCarousel
        posts={posts}
        profileUrl="https://www.instagram.com/olgish_cakes/"
        profileName="Olgish Cakes"
        profileHandle="@olgish_cakes"
      />
    )

    expect(screen.getAllByText('View Profile')).toHaveLength(2)
    expect(screen.getByAltText('Honey cake close-up')).toBeInTheDocument()
    expect(screen.getAllByText('View More on Instagram')).toHaveLength(2)
  })

  it('shows next control when multiple posts are available', () => {
    render(
      <MobileInstagramCarousel
        posts={posts}
        profileUrl="https://www.instagram.com/olgish_cakes/"
        profileName="Olgish Cakes"
        profileHandle="@olgish_cakes"
      />
    )

    expect(screen.getByLabelText('Next post')).toBeInTheDocument()
    expect(screen.queryByLabelText('Previous post')).toBeNull()
  })
})
