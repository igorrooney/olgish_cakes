/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Instagram } from '../Instagram'
import { getInstagramPostLimit, getLatestInstagramPosts } from '@/app/utils/fetchInstagramPosts'
import type { InstagramPost } from '@/app/types/instagram'

const mockCarousel = jest.fn(({ posts }: { posts: InstagramPost[] }) => (
  <div data-testid="instagram-carousel" data-count={posts.length} />
))

jest.mock('../DeferredInstagramCarousel', () => ({
  DeferredInstagramCarousel: (props: { posts: InstagramPost[] }) => mockCarousel(props)
}))

jest.mock('@/app/utils/fetchInstagramPosts', () => {
  const actual = jest.requireActual('@/app/utils/fetchInstagramPosts') as typeof import('@/app/utils/fetchInstagramPosts')
  return {
    ...actual,
    getLatestInstagramPosts: jest.fn()
  }
})

const mockGetLatestInstagramPosts = getLatestInstagramPosts as jest.MockedFunction<typeof getLatestInstagramPosts>

describe('Instagram', () => {
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

    const element = await Instagram({ limit: 4 })
    render(element)

    expect(
      screen.getByRole('heading', { name: /follow us on instagram/i, level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByTestId('instagram-carousel')).toHaveAttribute('data-count', '2')
    expect(mockGetLatestInstagramPosts).toHaveBeenCalledWith({
      limit: getInstagramPostLimit(4)
    })
  })

  it('falls back to a placeholder post when fetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetLatestInstagramPosts.mockRejectedValueOnce(new Error('Fetch failed'))

    const element = await Instagram()
    render(element)

    expect(screen.getByTestId('instagram-carousel')).toHaveAttribute('data-count', '1')
    expect(mockGetLatestInstagramPosts).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('logs a warning instead of an error for recoverable Instagram failures', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockGetLatestInstagramPosts.mockRejectedValueOnce(
      new Error('Instagram API error (400): Error validating access token: Session has expired')
    )

    const element = await Instagram()
    render(element)

    expect(screen.getByTestId('instagram-carousel')).toHaveAttribute('data-count', '1')
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Instagram posts unavailable. Refresh INSTAGRAM_ACCESS_TOKEN if the token has expired.',
      'Instagram API error (400): Error validating access token: Session has expired'
    )

    consoleWarnSpy.mockRestore()
  })
})
