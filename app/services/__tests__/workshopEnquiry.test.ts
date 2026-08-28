/**
 * @jest-environment jsdom
 */
import {
  buildWorkshopEnquiryFormData,
  fetchCsrfToken,
  isSubmissionError,
  submitWorkshopEnquiry
} from '../workshopEnquiry'

describe('workshopEnquiry service', () => {
  const notificationFailureErrorMessage =
    'Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.'
  const fallbackErrorMessage =
    'Something went wrong while sending your workshop enquiry. Please try again, or contact us directly at hello@olgishcakes.co.uk or +44 786 721 8194.'
  const customerConfirmationFailureMessage =
    'Your enquiry was saved, but we could not send the confirmation email. We will follow up manually.'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches the csrf token with the provided abort signal', async () => {
    const signal = new AbortController().signal
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'csrf-token-123' })
    }) as jest.Mock

    await expect(fetchCsrfToken(signal)).resolves.toBe('csrf-token-123')
    expect(global.fetch).toHaveBeenCalledWith('/api/csrf-token', {
      cache: 'no-store',
      credentials: 'same-origin',
      signal
    })
  })

  it('throws when the csrf response does not include a token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    }) as jest.Mock

    await expect(fetchCsrfToken(new AbortController().signal)).rejects.toThrow('Missing CSRF token')
  })

  it('builds form data and omits empty optional values', () => {
    const formData = buildWorkshopEnquiryFormData({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      eventType: 'Corporate event',
      groupSize: '18 guests',
      location: 'Shoreditch, London',
      preferredDate: '2026-12-24',
      brief: 'Office team social with a calm floral direction.',
      csrfToken: 'csrf-token-123'
    })

    expect(formData.get('fullName')).toBe('Jane Doe')
    expect(formData.get('email')).toBe('jane@example.com')
    expect(formData.get('eventType')).toBe('Corporate event')
    expect(formData.get('csrfToken')).toBe('csrf-token-123')
    expect(formData.get('phone')).toBeNull()
  })

  it('submits the workshop enquiry with credentials and signal', async () => {
    const signal = new AbortController().signal
    const formData = buildWorkshopEnquiryFormData({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      eventType: 'Corporate event',
      groupSize: '18 guests',
      location: 'Shoreditch, London',
      preferredDate: '2026-12-24',
      brief: 'Office team social with a calm floral direction.',
      csrfToken: 'csrf-token-123'
    })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Workshop enquiry submitted successfully' })
    }) as jest.Mock

    await expect(submitWorkshopEnquiry(formData, signal)).resolves.toEqual({
      message: 'Workshop enquiry submitted successfully'
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/workshop-enquiry', expect.objectContaining({
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      signal
    }))
  })

  it('maps validation failures into field errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Validation failed',
        details: [
          {
            path: ['email'],
            message: 'Please add an email address'
          }
        ]
      })
    }) as jest.Mock

    await expect(
      submitWorkshopEnquiry(new FormData(), new AbortController().signal)
    ).rejects.toMatchObject({
      message: 'Validation failed. Please check the form fields.',
      fieldErrors: {
        email: 'Please add an email address'
      }
    })
  })

  it('uses the server error when one is provided', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Too many requests. Please try again later.'
      })
    }) as jest.Mock

    await expect(submitWorkshopEnquiry(new FormData(), new AbortController().signal)).rejects.toThrow(
      'Too many requests. Please try again later.'
    )
  })

  it('masks operator notification failures behind the fallback contact message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: notificationFailureErrorMessage
      })
    }) as jest.Mock

    await expect(submitWorkshopEnquiry(new FormData(), new AbortController().signal)).rejects.toThrow(fallbackErrorMessage)
  })

  it('resolves saved enquiries that include a customer confirmation warning', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Workshop enquiry submitted successfully',
        warning: customerConfirmationFailureMessage
      })
    }) as jest.Mock

    await expect(submitWorkshopEnquiry(new FormData(), new AbortController().signal)).resolves.toEqual({
      message: 'Workshop enquiry submitted successfully',
      warning: customerConfirmationFailureMessage
    })
  })

  it('falls back to the contact message when the server payload is empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    }) as jest.Mock

    await expect(submitWorkshopEnquiry(new FormData(), new AbortController().signal)).rejects.toThrow(fallbackErrorMessage)
  })

  it('exposes the submission error type guard', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Validation failed',
        details: [
          {
            path: ['brief'],
            message: 'Please add a few details about the event'
          }
        ]
      })
    }) as jest.Mock

    try {
      await submitWorkshopEnquiry(new FormData(), new AbortController().signal)
      throw new Error('Expected a submission error')
    } catch (error) {
      expect(isSubmissionError(error)).toBe(true)
    }
  })
})
