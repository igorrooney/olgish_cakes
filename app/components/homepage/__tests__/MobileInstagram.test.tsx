/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MobileInstagram } from '../MobileInstagram'
import { getLatestInstagramPosts } from '@/app/utils/fetchInstagramPosts'
import type { InstagramPost } from '@/app/types/instagram'

const mockCarousel = jest.fn(({ posts }: { posts: InstagramPost[] }) => (
  <div data-testid="instagram-carousel" data-count={posts.length} />
))

jest.mock('../MobileInstagramCarousel', () => ({
  MobileInstagramCarousel: (props: { posts: InstagramPost[] }) => mockCarousel(props)
}))

jest.mock('@/app/utils/fetchInstagramPosts', () => {
  const actual = jest.requireActual('@/app/utils/fetchInstagramPosts') as typeof import('@/app/utils/fetchInstagramPosts')
  return {
    ...actual,
    getLatestInstagramPosts: jest.fn()
  }
})

const mockGetLatestInstagramPosts = getLatestInstagramPosts as jest.MockedFunction<typeof getLatestInstagramPosts>

describe('MobileInstagram', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders fetched posts in the carousel', async () => {
    const posts: InstagramPost[] = [
      {
        id: 'post-1',
        imageUrl: 'https://scontent.cdninstagram.com/media-1.jpg',
        permalink: 'https://instagram.com/p/post-1',
        mediaType: 'IMAGE'
      },
      {
        id: 'post-2',
        imageUrl: 'https://scontent.cdninstagram.com/media-2.jpg',
        permalink: 'https://instagram.com/p/post-2',
        mediaType: 'IMAGE'
      }
    ]

    mockGetLatestInstagramPosts.mockResolvedValueOnce(posts)

    const element = await MobileInstagram({ limit: 4 })
    render(element)

    expect(screen.getByText('Follow us on Instagram')).toBeInTheDocument()
    expect(screen.getByTestId('instagram-carousel')).toHaveAttribute('data-count', '2')
    expect(mockGetLatestInstagramPosts).toHaveBeenCalledWith({ limit: 4 })
  })

  it('falls back to a placeholder post when fetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetLatestInstagramPosts.mockRejectedValueOnce(new Error('Fetch failed'))

    const element = await MobileInstagram()
    render(element)

    expect(screen.getByTestId('instagram-carousel')).toHaveAttribute('data-count', '1')
    expect(mockGetLatestInstagramPosts).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
