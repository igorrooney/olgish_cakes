import { GET } from '../route'
import { getLatestInstagramPosts } from '@/app/utils/fetchInstagramPosts'
import type { InstagramPost } from '@/app/types/instagram'

jest.mock('@/app/utils/fetchInstagramPosts', () => {
  const actual = jest.requireActual('@/app/utils/fetchInstagramPosts') as typeof import('@/app/utils/fetchInstagramPosts')
  return {
    ...actual,
    getLatestInstagramPosts: jest.fn()
  }
})

const mockGetLatestInstagramPosts = getLatestInstagramPosts as jest.MockedFunction<typeof getLatestInstagramPosts>

describe('instagram posts route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns Instagram posts with a parsed limit', async () => {
    const posts: InstagramPost[] = [
      {
        id: 'post-1',
        imageUrl: 'https://scontent.cdninstagram.com/media-1.jpg',
        permalink: 'https://instagram.com/p/post-1',
        mediaType: 'IMAGE'
      }
    ]

    mockGetLatestInstagramPosts.mockResolvedValueOnce(posts)

    const response = await GET(new Request('http://localhost/api/instagram/posts?limit=4'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(mockGetLatestInstagramPosts).toHaveBeenCalledWith({ limit: 4 })
  })

  it('returns a 500 response when fetching fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetLatestInstagramPosts.mockRejectedValueOnce(new Error('API error'))

    const response = await GET(new Request('http://localhost/api/instagram/posts'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Unable to fetch Instagram posts')

    consoleSpy.mockRestore()
  })
})
