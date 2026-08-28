/**
 * @jest-environment jsdom
 */
import {
  buildCustomCakeEnquiryFormData,
  customCakeEnquiryFallbackErrorMessage,
  isSubmissionError,
  submitCustomCakeEnquiry,
  withCustomCakeEnquiryContactFallback
} from '../customCakeEnquiry'

describe('customCakeEnquiry service', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('builds form data with explicit consent and an optional image', () => {
    const referenceImage = new File(['image'], 'reference.jpg', {
      type: 'image/jpeg'
    })
    const formData = buildCustomCakeEnquiryFormData({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      date: '2026-12-24',
      dietaryHealthInformation: 'Nut allergy',
      dietaryHealthConsent: true,
      csrfToken: 'csrf-token-123'
    }, referenceImage)

    expect(formData.get('fullName')).toBe('Jane Doe')
    expect(formData.get('phone')).toBeNull()
    expect(formData.get('dietaryHealthConsent')).toBe('true')
    expect(formData.get('referenceImage')).toBe(referenceImage)
  })

  it('normalises fallback contact guidance without duplicating it', () => {
    expect(withCustomCakeEnquiryContactFallback('   ')).toBe(
      customCakeEnquiryFallbackErrorMessage
    )
    expect(withCustomCakeEnquiryContactFallback(
      'Please try again, or contact us directly at hello@olgishcakes.co.uk or +44 786 721 8194.'
    )).toBe(
      'Please try again, or contact us directly at hello@olgishcakes.co.uk or +44 786 721 8194.'
    )
    expect(withCustomCakeEnquiryContactFallback('Too many requests.')).toContain(
      'Too many requests. Please try again, or contact us directly'
    )
  })

  it('submits with same-origin credentials and the provided signal', async () => {
    const signal = new AbortController().signal
    const formData = new FormData()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Enquiry submitted successfully' })
    })

    await expect(submitCustomCakeEnquiry(formData, signal)).resolves.toEqual({
      message: 'Enquiry submitted successfully'
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/custom-cake-enquiry', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      signal
    })
  })

  it('maps validation details to identifiable field errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Validation failed',
        details: [
          {
            path: ['dietaryHealthConsent'],
            message: 'Explicit consent is required'
          },
          {
            path: [],
            message: 'Ignored non-field error'
          }
        ]
      })
    })

    try {
      await submitCustomCakeEnquiry(
        new FormData(),
        new AbortController().signal
      )
      throw new Error('Expected submission to fail')
    } catch (error) {
      expect(isSubmissionError(error)).toBe(true)
      expect(error).toMatchObject({
        message: 'Validation failed. Please check the form fields.',
        fieldErrors: {
          dietaryHealthConsent: 'Explicit consent is required'
        }
      })
    }
  })

  it('uses safe fallback copy when the error payload cannot be read', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('Malformed provider response')
      }
    })

    await expect(submitCustomCakeEnquiry(
      new FormData(),
      new AbortController().signal
    )).rejects.toThrow(customCakeEnquiryFallbackErrorMessage)
  })

  it('masks operator notification failures but retains safe server guidance', async () => {
    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.'
      })
    })

    await expect(submitCustomCakeEnquiry(
      new FormData(),
      new AbortController().signal
    )).rejects.toThrow(customCakeEnquiryFallbackErrorMessage)

    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Too many requests. Please try again later.'
      })
    })

    await expect(submitCustomCakeEnquiry(
      new FormData(),
      new AbortController().signal
    )).rejects.toThrow(
      'Too many requests. Please try again later. Please try again, or contact us directly'
    )
  })

  it('does not identify ordinary errors as submission errors', () => {
    expect(isSubmissionError(new Error('Other error'))).toBe(false)
    expect(isSubmissionError(null)).toBe(false)
  })
})
