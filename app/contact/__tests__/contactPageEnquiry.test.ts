/**
 * @jest-environment jsdom
 */
import {
  buildContactPageEnquiryFormData,
  isSubmissionError,
  submitContactPageEnquiry,
} from '../contactPageEnquiry'

describe('contactPageEnquiry service', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('maps string validation details back to the route form fields', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Validation failed',
        details:
          'cakeInterest: Please choose the right question, message: Please add a bit more detail',
      }),
    })

    await expect(
      submitContactPageEnquiry(new FormData())
    ).rejects.toMatchObject({
      message: 'Validation failed. Please check the form fields.',
      fieldErrors: {
        enquiryType: 'Please choose the right question',
        message: 'Please add a bit more detail',
      },
    })
  })

  it('uses the fallback message when the server only returns a masked mail failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Failed to send email',
      }),
    })

    await expect(
      submitContactPageEnquiry(new FormData())
    ).rejects.toThrow(
      'Something went wrong while sending your message. Please try again, or contact me directly at hello@olgishcakes.co.uk or +44 786 721 8194.'
    )
  })

  it('builds form data and keeps submission errors identifiable', () => {
    const formData = buildContactPageEnquiryFormData({
      name: 'Jane Doe',
      email: 'jane@example.com',
      cakeInterest: 'General question',
      message: 'Please point me to the right route.',
      referrer: '/contact',
    })
    const submissionError = new Error('Validation failed') as Error & {
      fieldErrors?: Record<string, string>
    }
    submissionError.fieldErrors = { enquiryType: 'Choose a route' }

    expect(formData.get('name')).toBe('Jane Doe')
    expect(formData.get('cakeInterest')).toBe('General question')
    expect(formData.get('phone')).toBeNull()
    expect(formData.get('referrer')).toBe('/contact')
    expect(isSubmissionError(submissionError)).toBe(true)
    expect(isSubmissionError(new Error('Other error'))).toBe(false)
  })
})
