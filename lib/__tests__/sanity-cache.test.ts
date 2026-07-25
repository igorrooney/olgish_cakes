const mockClientFetch = jest.fn()
const mockUnstableCache = jest.fn((fetcher: () => Promise<unknown>) => fetcher)

jest.mock('next/cache', () => ({
  unstable_cache: (...args: unknown[]) => mockUnstableCache(...args)
}))

jest.mock('@/sanity/lib/client', () => ({
  client: {
    fetch: (...args: unknown[]) => mockClientFetch(...args)
  },
  sanityFetchOptions: {
    perspective: 'published'
  },
  USE_REAL_TIME_DATA: false
}))

describe('cachedSanityFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('forwards cancellation to the cached Sanity request without adding it to the cache key', async () => {
    const signal = new AbortController().signal
    mockClientFetch.mockResolvedValue([{ _id: 'article-1' }])

    const { cachedSanityFetch } = await import('../sanity-cache')
    const result = await cachedSanityFetch(
      '*[_type == "article"]',
      { topic: 'cake-by-post' },
      {
        revalidate: 300,
        tags: ['articles'],
        signal
      }
    )

    expect(result).toEqual([{ _id: 'article-1' }])
    expect(mockClientFetch).toHaveBeenCalledWith(
      '*[_type == "article"]',
      { topic: 'cake-by-post' },
      { signal }
    )
    expect(mockUnstableCache).toHaveBeenCalledWith(
      expect.any(Function),
      [
        JSON.stringify({
          query: '*[_type == "article"]',
          params: { topic: 'cake-by-post' }
        })
      ],
      {
        revalidate: 300,
        tags: ['articles']
      }
    )
  })
})
