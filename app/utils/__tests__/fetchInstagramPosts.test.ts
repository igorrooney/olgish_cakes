import {
  getLatestInstagramPosts,
  getInstagramPostLimit,
  getInstagramRevalidateSeconds
} from '../fetchInstagramPosts'
import type { InstagramPost } from '@/app/types/instagram'

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('fetchInstagramPosts', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token'
    process.env.INSTAGRAM_USER_ID = '123456'
    process.env.INSTAGRAM_GRAPH_API_VERSION = 'v19.0'
    delete process.env.INSTAGRAM_POST_LIMIT
    delete process.env.INSTAGRAM_REVALIDATE_SECONDS
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('throws when Instagram environment variables are missing', async () => {
    delete process.env.INSTAGRAM_ACCESS_TOKEN

    await expect(getLatestInstagramPosts()).rejects.toThrow('Missing required Instagram environment variables')
  })

  it('fetches and maps Instagram posts', async () => {
    const apiResponse = {
      data: [
        {
          id: 'post-1',
          caption: 'Honey cake love',
          media_type: 'IMAGE',
          media_url: 'https://scontent.cdninstagram.com/media-1.jpg',
          permalink: 'https://instagram.com/p/post-1',
          timestamp: '2024-01-01T10:00:00+0000',
          like_count: 1200
        },
        {
          id: 'post-2',
          media_type: 'VIDEO',
          media_url: 'https://scontent.cdninstagram.com/video-1.mp4',
          thumbnail_url: 'https://scontent.cdninstagram.com/thumb-1.jpg',
          permalink: 'https://instagram.com/p/post-2',
          timestamp: '2024-01-02T10:00:00+0000'
        },
        {
          id: 'post-3',
          media_type: 'CAROUSEL_ALBUM',
          media_url: 'https://scontent.cdninstagram.com/media-3.jpg',
          permalink: 'https://instagram.com/p/post-3',
          timestamp: '2024-01-03T10:00:00+0000'
        }
      ]
    }

    const mockResponse = {
      ok: true,
      json: async () => apiResponse
    } as unknown as Response

    mockFetch.mockResolvedValueOnce(mockResponse)

    const posts = await getLatestInstagramPosts({ limit: 4 })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=9'),
      expect.objectContaining({ next: { revalidate: 1800 } })
    )

    expect(posts).toHaveLength(2)
    expect(posts[0]).toEqual<InstagramPost>({
      id: 'post-1',
      caption: 'Honey cake love',
      imageUrl: 'https://scontent.cdninstagram.com/media-1.jpg',
      permalink: 'https://instagram.com/p/post-1',
      mediaType: 'IMAGE',
      timestamp: '2024-01-01T10:00:00+0000',
      likeCount: 1200
    })
    expect(posts[1]).toEqual<InstagramPost>({
      id: 'post-3',
      imageUrl: 'https://scontent.cdninstagram.com/media-3.jpg',
      permalink: 'https://instagram.com/p/post-3',
      mediaType: 'CAROUSEL_ALBUM',
      timestamp: '2024-01-03T10:00:00+0000'
    })
  })

  it('clamps the Instagram post limit from env', () => {
    process.env.INSTAGRAM_POST_LIMIT = '12'

    expect(getInstagramPostLimit()).toBe(3)
  })

  it('uses a default revalidate time when env is missing', () => {
    delete process.env.INSTAGRAM_REVALIDATE_SECONDS

    expect(getInstagramRevalidateSeconds()).toBe(1800)
  })
})
