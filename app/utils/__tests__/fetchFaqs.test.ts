jest.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray) => strings[0]
}))

jest.mock('@/lib/sanity-cache', () => ({
  cachedSanityFetch: jest.fn(),
  getCacheConfig: jest.fn(() => ({ revalidate: 3600, tags: ['faqs'] }))
}))

import type { FAQ } from '../fetchFaqs'
import { getFaqs } from '../fetchFaqs'
import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'

const mockCachedSanityFetch = jest.mocked(cachedSanityFetch)
const mockGetCacheConfig = jest.mocked(getCacheConfig)

describe('fetchFaqs', () => {
  const mockFaq: FAQ = {
    _id: '1',
    question: 'What flavors do you offer?',
    answer: 'We offer many traditional Ukrainian flavors.',
    order: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCacheConfig.mockReturnValue({ revalidate: 3600, tags: ['faqs'] })
  })

  describe('getFaqs', () => {
    it('fetches FAQs with the faq cache config', async () => {
      mockCachedSanityFetch.mockResolvedValue([mockFaq])

      const result = await getFaqs()

      expect(result).toEqual([mockFaq])
      expect(mockGetCacheConfig).toHaveBeenCalledWith('faqs')
      expect(mockCachedSanityFetch).toHaveBeenCalledWith(
        expect.stringContaining('*[_type == "faq"] | order(order asc)'),
        {},
        { revalidate: 3600, tags: ['faqs'] }
      )
    })

    it('returns empty array for invalid result format', async () => {
      mockCachedSanityFetch.mockResolvedValue({ notAnArray: true } as never)
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getFaqs()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected result format:', { notAnArray: true })

      consoleSpy.mockRestore()
    })

    it('rethrows fetch failures', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockCachedSanityFetch.mockRejectedValue(new Error('Fetch failed'))

      await expect(getFaqs()).rejects.toThrow('Fetch failed')

      consoleSpy.mockRestore()
    })

    it('logs error on fetch failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockCachedSanityFetch.mockRejectedValue(new Error('Fetch failed'))

      await expect(getFaqs()).rejects.toThrow('Fetch failed')

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching FAQs:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('deduplicates repeated questions after fetching', async () => {
      mockCachedSanityFetch.mockResolvedValue([
        {
          _id: 'faq-1',
          question: 'What are your delivery options?',
          answer: 'First answer',
          order: 0
        },
        {
          _id: 'faq-2',
          question: '  What are your delivery options?  ',
          answer: 'Second answer',
          order: 1
        }
      ])

      const result = await getFaqs()

      expect(result).toHaveLength(1)
      expect(result[0]?._id).toBe('faq-1')
    })

    it('preserves Sanity-authored faq copy', async () => {
      mockCachedSanityFetch.mockResolvedValue([
        {
          _id: 'faq-1',
          question: 'What is your process for custom cake orders?',
          answer:
            'Our custom cake process begins with a consultation (in-person, phone, or online) to discuss your vision.',
          order: 0
        }
      ])

      const result = await getFaqs()

      expect(result[0]?.question).toBe('What is your process for custom cake orders?')
      expect(result[0]?.answer).toBe(
        'Our custom cake process begins with a consultation (in-person, phone, or online) to discuss your vision.'
      )
    })

    it('trims question and answer whitespace without changing content', async () => {
      mockCachedSanityFetch.mockResolvedValue([
        {
          _id: 'faq-1',
          question: '  Do you offer traditional Ukrainian cake flavors?  ',
          answer: '  Original answer  ',
          order: 0
        }
      ])

      const result = await getFaqs()

      expect(result[0]?.question).toBe('Do you offer traditional Ukrainian cake flavors?')
      expect(result[0]?.answer).toBe('Original answer')
    })

    it('drops FAQs with blank questions or answers', async () => {
      mockCachedSanityFetch.mockResolvedValue([
        {
          _id: 'faq-1',
          question: '   ',
          answer: 'Answer',
          order: 0
        },
        {
          _id: 'faq-2',
          question: 'Real question?',
          answer: '   ',
          order: 1
        }
      ])

      const result = await getFaqs()

      expect(result).toEqual([])
    })

    it('skips malformed FAQ records but keeps valid ones', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      mockCachedSanityFetch.mockResolvedValue([
        {
          _id: 'faq-1',
          question: 'Valid question?',
          answer: 'Valid answer.',
          order: 0
        },
        {
          _id: 'faq-2',
          question: null,
          answer: 'Broken answer',
          order: 1
        }
      ] as never)

      const result = await getFaqs()

      expect(result).toEqual([
        {
          _id: 'faq-1',
          question: 'Valid question?',
          answer: 'Valid answer.',
          order: 0
        }
      ])
      expect(consoleSpy).toHaveBeenCalledWith(
        'Skipping malformed FAQ record:',
        expect.objectContaining({ _id: 'faq-2' })
      )

      consoleSpy.mockRestore()
    })
  })
})
