/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import {
  getTestimonialsPage,
  InvalidTestimonialsCursorError
} from '@/app/utils/fetchTestimonials'
import { GET } from '../route'

const mockLoggerError = jest.fn()

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

jest.mock('@/app/utils/fetchTestimonials', () => {
  class MockInvalidTestimonialsCursorError extends Error {}

  return {
    getTestimonialsPage: jest.fn(),
    InvalidTestimonialsCursorError: MockInvalidTestimonialsCursorError,
    maxTestimonialsCursorLength: 512
  }
})

const mockedGetTestimonialsPage = getTestimonialsPage as jest.MockedFunction<
  typeof getTestimonialsPage
>

const createRequest = (url = 'https://olgishcakes.co.uk/api/testimonials') =>
  new NextRequest(url)

describe('GET /api/testimonials', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns a paginated review response', async () => {
    mockedGetTestimonialsPage.mockResolvedValue({
      reviews: [{
        _id: 'review-1',
        customerName: 'Olha',
        rating: 5,
        date: '2026-01-01',
        text: 'A beautiful cake.'
      }],
      nextCursor: 'next-cursor'
    })

    const response = await GET(createRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      reviews: [expect.objectContaining({ _id: 'review-1', rating: 5 })],
      nextCursor: 'next-cursor'
    })
    expect(mockedGetTestimonialsPage).toHaveBeenCalledWith(null)
  })

  it('passes the opaque cursor to the data layer', async () => {
    mockedGetTestimonialsPage.mockResolvedValue({
      reviews: [],
      nextCursor: null
    })

    const response = await GET(createRequest(
      'https://olgishcakes.co.uk/api/testimonials?cursor=opaque-cursor'
    ))

    expect(response.status).toBe(200)
    expect(mockedGetTestimonialsPage).toHaveBeenCalledWith('opaque-cursor')
  })

  it.each([
    'https://olgishcakes.co.uk/api/testimonials?cursor=',
    `https://olgishcakes.co.uk/api/testimonials?cursor=${'a'.repeat(513)}`
  ])('returns 400 for an empty or oversized cursor', async (url) => {
    const response = await GET(createRequest(url))

    expect(response.status).toBe(400)
    expect(mockedGetTestimonialsPage).not.toHaveBeenCalled()
  })

  it('returns 400 when cursor decoding fails', async () => {
    mockedGetTestimonialsPage.mockRejectedValue(
      new InvalidTestimonialsCursorError()
    )

    const response = await GET(createRequest(
      'https://olgishcakes.co.uk/api/testimonials?cursor=malformed'
    ))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid testimonials cursor'
    })
  })

  it('returns a generic 500 without exposing the upstream error', async () => {
    const sentinel = 'PRIVATE_TESTIMONIAL_PROVIDER_MESSAGE'
    mockedGetTestimonialsPage.mockRejectedValue(new Error(sentinel))

    const response = await GET(createRequest())
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Unable to retrieve testimonials' })
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to retrieve testimonials',
      {
        operation: 'testimonials.retrieve',
        code: 'OPERATION_FAILED'
      }
    )
    expect(JSON.stringify({ body, logs: mockLoggerError.mock.calls })).not.toContain(sentinel)
  })
})
