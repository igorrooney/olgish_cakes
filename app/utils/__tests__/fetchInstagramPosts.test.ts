import {
  getLatestInstagramPosts,
  getInstagramPostLimit,
  getInstagramRevalidateSeconds,
  isRecoverableInstagramError
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

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
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
          id: 'reel-only-post',
          media_type: 'VIDEO',
          media_url: 'https://scontent.cdninstagram.com/video-1.mp4',
          thumbnail_url: 'https://scontent.cdninstagram.com/thumb-1.jpg',
          permalink: 'https://instagram.com/reel/reel-only-post',
          timestamp: '2024-01-02T10:00:00+0000',
          is_shared_to_feed: false
        },
        {
          id: 'post-2',
          media_type: 'VIDEO',
          media_url: 'https://scontent.cdninstagram.com/video-2.mp4',
          thumbnail_url: 'https://scontent.cdninstagram.com/thumb-2.jpg',
          permalink: 'https://instagram.com/p/post-2',
          timestamp: '2024-01-03T10:00:00+0000',
          is_shared_to_feed: true
        },
        {
          id: 'post-3',
          media_type: 'CAROUSEL_ALBUM',
          media_url: 'https://scontent.cdninstagram.com/media-3.jpg',
          permalink: 'https://instagram.com/p/post-3',
          timestamp: '2024-01-04T10:00:00+0000'
        }
      ]
    }

    const mockResponse = {
      ok: true,
      json: async () => apiResponse
    } as unknown as Response

    mockFetch.mockResolvedValueOnce(mockResponse)

    const posts = await getLatestInstagramPosts({ limit: 4 })

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('limit=9'),
      expect.objectContaining({ next: { revalidate: 1800 }, signal: expect.any(AbortSignal) })
    )
    expect(mockFetch).toHaveBeenCalledTimes(1)

    expect(posts).toHaveLength(3)
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
      id: 'post-2',
      imageUrl: 'https://scontent.cdninstagram.com/thumb-2.jpg',
      permalink: 'https://instagram.com/p/post-2',
      mediaType: 'VIDEO',
      timestamp: '2024-01-03T10:00:00+0000'
    })
    expect(posts[2]).toEqual<InstagramPost>({
      id: 'post-3',
      imageUrl: 'https://scontent.cdninstagram.com/media-3.jpg',
      permalink: 'https://instagram.com/p/post-3',
      mediaType: 'CAROUSEL_ALBUM',
      timestamp: '2024-01-04T10:00:00+0000'
    })
  })

  it('uses the Instagram Login graph host by default', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ data: [] })
    } as unknown as Response

    mockFetch.mockResolvedValueOnce(mockResponse)

    await getLatestInstagramPosts()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://graph.instagram.com/v19.0/123456/media?'),
      expect.objectContaining({ next: { revalidate: 1800 }, signal: expect.any(AbortSignal) })
    )
  })

  it('creates a timeout-backed signal when no caller signal is provided', async () => {
    jest.useFakeTimers()
    const mockResponse = {
      ok: true,
      json: async () => ({ data: [] })
    } as unknown as Response

    mockFetch.mockResolvedValueOnce(mockResponse)

    await getLatestInstagramPosts()

    const [, options] = mockFetch.mock.calls[0]
    const fetchSignal = options?.signal as AbortSignal

    expect(fetchSignal).toBeInstanceOf(AbortSignal)
    expect(fetchSignal.aborted).toBe(false)

    jest.advanceTimersByTime(8000)

    expect(fetchSignal.aborted).toBe(true)
  })

  it('combines a caller signal with the Instagram timeout signal', async () => {
    const callerController = new AbortController()
    const mockResponse = {
      ok: true,
      json: async () => ({ data: [] })
    } as unknown as Response

    mockFetch.mockResolvedValueOnce(mockResponse)

    await getLatestInstagramPosts({ signal: callerController.signal })

    const [, options] = mockFetch.mock.calls[0]
    const fetchSignal = options?.signal as AbortSignal

    expect(fetchSignal).toBeInstanceOf(AbortSignal)
    expect(fetchSignal).not.toBe(callerController.signal)

    callerController.abort()

    expect(fetchSignal.aborted).toBe(true)
  })

  it('clamps the Instagram post limit from env', () => {
    process.env.INSTAGRAM_POST_LIMIT = '12'

    expect(getInstagramPostLimit()).toBe(3)
  })

  it('uses a default revalidate time when env is missing', () => {
    delete process.env.INSTAGRAM_REVALIDATE_SECONDS

    expect(getInstagramRevalidateSeconds()).toBe(1800)
  })

  it('identifies recoverable Instagram errors', () => {
    expect(
      isRecoverableInstagramError(
        new Error('Instagram API error (400): Error validating access token: Session has expired')
      )
    ).toBe(true)
    expect(
      isRecoverableInstagramError(
        new Error('Instagram API error (400): Invalid OAuth access token - Cannot parse access token')
      )
    ).toBe(true)
    expect(
      isRecoverableInstagramError(
        new Error('Missing required Instagram environment variables: INSTAGRAM_ACCESS_TOKEN')
      )
    ).toBe(true)
    expect(isRecoverableInstagramError(new Error('Unexpected API error'))).toBe(false)
  })
})
