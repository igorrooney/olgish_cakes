import { getFaqs, FAQ } from '../fetchFaqs'

// Mock Sanity client
jest.mock('@sanity/client', () => {
  const mockFetch = jest.fn()
  const mockCreateClient = jest.fn(() => ({ fetch: mockFetch }))
  return {
    createClient: mockCreateClient,
    __mockFetch: mockFetch,
    __mockCreateClient: mockCreateClient
  }
})

const { __mockFetch: mockFetch, __mockCreateClient: mockCreateClient } = jest.requireMock('@sanity/client')

jest.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray) => strings[0]
}))

describe('fetchFaqs', () => {
  const mockFAQ: FAQ = {
    _id: '1',
    question: 'What flavors do you offer?',
    answer: 'We offer many traditional Ukrainian flavors.',
    order: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project'
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'production'
    process.env.NEXT_PUBLIC_SANITY_API_VERSION = '2025-03-31'
  })

  // Client Configuration tested implicitly through getFaqs

  describe('getFaqs', () => {
    it('should fetch FAQs', async () => {
      mockFetch.mockResolvedValue([mockFAQ])

      const result = await getFaqs()

      expect(result).toEqual([mockFAQ])
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should order FAQs by order field', async () => {
      mockFetch.mockResolvedValue([mockFAQ])

      await getFaqs()

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('order(order asc)')
    })

    it('should include all FAQ fields', async () => {
      mockFetch.mockResolvedValue([mockFAQ])

      await getFaqs()

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('_id')
      expect(query).toContain('question')
      expect(query).toContain('answer')
      expect(query).toContain('order')
    })

    it('should return empty array for invalid result format', async () => {
      mockFetch.mockResolvedValue({ notAnArray: true })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getFaqs()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected result format:', { notAnArray: true })

      consoleSpy.mockRestore()
    })

    it('should return empty array for null result', async () => {
      mockFetch.mockResolvedValue(null)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getFaqs()

      expect(result).toEqual([])

      consoleSpy.mockRestore()
    })

    it('should throw error on fetch failure', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await expect(getFaqs()).rejects.toThrow('Fetch failed')
    })

    it('should log error on fetch failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      try {
        await getFaqs()
      } catch (e) {
        // Expected
      }

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching FAQs:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should handle multiple FAQs', async () => {
      const mockFAQs = [
        { ...mockFAQ, _id: '1', order: 1 },
        { ...mockFAQ, _id: '2', order: 2 },
        { ...mockFAQ, _id: '3', order: 3 }
      ]

      mockFetch.mockResolvedValue(mockFAQs)

      const result = await getFaqs()

      expect(result).toHaveLength(3)
      expect(result).toEqual(mockFAQs)
    })

    it('should handle empty array result', async () => {
      mockFetch.mockResolvedValue([])

      const result = await getFaqs()

      expect(result).toEqual([])
    })
  })

  describe('FAQ Type', () => {
    it('should have correct FAQ interface', () => {
      const faq: FAQ = {
        _id: 'test',
        question: 'Test Question?',
        answer: 'Test Answer',
        order: 1
      }

      expect(faq._id).toBeDefined()
      expect(faq.question).toBeDefined()
      expect(faq.answer).toBeDefined()
      expect(faq.order).toBeDefined()
    })
  })
})

