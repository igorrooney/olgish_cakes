/**
 * @jest-environment node
 */

const mockSend = jest.fn()

jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: { send: mockSend }
  }))
}))

import { clearCapturedEmails, deliverEmail, getCapturedEmails } from '../transport'

describe('email transport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearCapturedEmails()
    process.env.RESEND_API_KEY = 'test-key'
  })

  it('stores payload in capture mode', async () => {
    const result = await deliverEmail({
      mode: 'capture',
      templateId: 'contact-admin-inquiry',
      message: {
        from: 'test@example.com',
        to: 'john@example.com',
        subject: 'Ignored',
        text: 'Text',
        html: '<p>Text</p>'
      },
      rendered: {
        subject: 'Rendered Subject',
        text: 'Rendered Text',
        html: '<p>Rendered</p>'
      }
    })

    expect(result.accepted).toBe(true)
    expect(result.mode).toBe('capture')
    expect(result.error).toBeNull()

    const captured = getCapturedEmails()
    expect(captured).toHaveLength(1)
    expect(captured[0]?.message.subject).toBe('Rendered Subject')
  })

  it('never sends in disabled mode', async () => {
    const result = await deliverEmail({
      mode: 'disabled',
      templateId: 'quote-admin-request',
      message: {
        from: 'test@example.com',
        to: 'john@example.com',
        subject: 'A',
        text: 'B',
        html: '<p>B</p>'
      },
      rendered: {
        subject: 'A',
        text: 'B',
        html: '<p>B</p>'
      }
    })

    expect(result.accepted).toBe(false)
    expect(result.error).toBeNull()
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('calls resend in live mode', async () => {
    mockSend.mockResolvedValue({ data: { id: 'resend-id-1' }, error: null })

    const result = await deliverEmail({
      mode: 'live',
      templateId: 'orders-status-update',
      message: {
        from: 'test@example.com',
        to: 'john@example.com',
        subject: 'A',
        text: 'B',
        html: '<p>B</p>'
      },
      rendered: {
        subject: 'Subject',
        text: 'Text',
        html: '<p>Html</p>'
      }
    })

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(result.accepted).toBe(true)
    expect(result.id).toBe('resend-id-1')
  })

  it('maps internal contentId attachments to Resend inlineContentId in live mode', async () => {
    mockSend.mockResolvedValue({ data: { id: 'resend-id-inline' }, error: null })

    const result = await deliverEmail({
      mode: 'live',
      templateId: 'custom-cake-enquiry-customer',
      message: {
        from: 'test@example.com',
        to: 'john@example.com',
        subject: 'A',
        text: 'B',
        html: '<img src="cid:olgish-cakes-email-logo" alt="Olgish Cakes">',
        attachments: [
          {
            filename: 'olgish-cakes-email-logo.png',
            content: Buffer.from('logo'),
            contentType: 'image/png',
            contentId: 'olgish-cakes-email-logo'
          }
        ]
      },
      rendered: {
        subject: 'Subject',
        text: 'Text',
        html: '<img src="cid:olgish-cakes-email-logo" alt="Olgish Cakes">'
      }
    })

    expect(result.accepted).toBe(true)
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      attachments: [
        expect.objectContaining({
          filename: 'olgish-cakes-email-logo.png',
          contentType: 'image/png',
          contentId: 'olgish-cakes-email-logo',
          inlineContentId: 'olgish-cakes-email-logo'
        })
      ]
    }))
  })

  it('returns error when live mode missing api key', async () => {
    delete process.env.RESEND_API_KEY

    const result = await deliverEmail({
      mode: 'live',
      templateId: 'orders-status-update',
      message: {
        from: 'test@example.com',
        to: 'john@example.com',
        subject: 'A',
        text: 'B',
        html: '<p>B</p>'
      },
      rendered: {
        subject: 'Subject',
        text: 'Text',
        html: '<p>Html</p>'
      }
    })

    expect(result.accepted).toBe(false)
    expect(result.error).toEqual({
      message: 'Email delivery is not configured',
      code: 'EMAIL_TRANSPORT_NOT_CONFIGURED'
    })
  })

  it('does not expose a provider response body in returned errors', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: {
        name: 'validation_error',
        message: 'SENTINEL-PROVIDER-BODY',
        statusCode: 422,
        details: 'SENTINEL-CUSTOMER-CONTENT'
      }
    })

    const result = await deliverEmail({
      mode: 'live',
      templateId: 'orders-status-update',
      message: {
        from: 'test@example.com',
        to: 'john@example.com',
        subject: 'A'
      },
      rendered: {
        subject: 'Subject',
        text: 'Text',
        html: '<p>Html</p>'
      }
    })

    expect(result.error).toEqual({
      message: 'Email delivery failed',
      code: 'validation_error',
      status: 422
    })
    expect(JSON.stringify(result.error)).not.toContain('SENTINEL-PROVIDER-BODY')
    expect(JSON.stringify(result.error)).not.toContain('SENTINEL-CUSTOMER-CONTENT')
  })

  it('does not expose a thrown provider exception in returned errors', async () => {
    mockSend.mockRejectedValue(Object.assign(
      new Error('SENTINEL-PROVIDER-EXCEPTION'),
      { code: 'ETIMEDOUT', status: 503, responseBody: 'SENTINEL-RESPONSE-BODY' }
    ))

    const result = await deliverEmail({
      mode: 'live',
      templateId: 'orders-status-update',
      message: {
        from: 'test@example.com',
        to: 'john@example.com',
        subject: 'A'
      },
      rendered: {
        subject: 'Subject',
        text: 'Text',
        html: '<p>Html</p>'
      }
    })

    expect(result.error).toEqual({
      message: 'Email delivery failed',
      code: 'ETIMEDOUT',
      status: 503
    })
    expect(JSON.stringify(result.error)).not.toContain('SENTINEL-PROVIDER-EXCEPTION')
    expect(JSON.stringify(result.error)).not.toContain('SENTINEL-RESPONSE-BODY')
  })
})
