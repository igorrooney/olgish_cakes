/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockSendEmail = jest.fn()
const mockGetTermsEmailAttachment = jest.fn()

jest.mock('@/lib/email/service', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args)
}))

jest.mock('@/lib/legal/terms-document', () => ({
  getTermsEmailAttachment: (...args: unknown[]) => mockGetTermsEmailAttachment(...args)
}))

jest.mock('@/lib/admin/auth-token', () => ({
  verifyAdminAuthToken: jest.fn()
}))

import { POST } from '../route'

const { verifyAdminAuthToken: mockVerifyAdminAuthToken } = jest.requireMock('@/lib/admin/auth-token') as {
  verifyAdminAuthToken: jest.MockedFunction<(token: string | null | undefined) => Promise<boolean>>
}

describe('/api/dev/email-test-send', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NODE_ENV = 'test'
    process.env.EMAIL_REAL_SEND_ENABLED = 'true'
    process.env.EMAIL_TEST_RECIPIENT_ALLOWLIST = 'allowlisted@example.com'
    process.env.EMAIL_REAL_SEND_RATE_LIMIT_PER_HOUR = '5'
    process.env.EMAIL_TEST_SUBJECT_PREFIX = '[TEST]'
    mockVerifyAdminAuthToken.mockResolvedValue(true)
    mockGetTermsEmailAttachment.mockResolvedValue({
      filename: 'olgish-cakes-terms-2026-07-28.pdf',
      content: Buffer.from('test terms'),
      contentType: 'application/pdf'
    })
    mockSendEmail.mockResolvedValue({
      accepted: true,
      mode: 'live',
      id: 'live-id-1',
      error: null,
      rendered: {
        subject: '[TEST] Example',
        text: 'text',
        html: '<p>html</p>'
      }
    })
  })

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  function buildRequest(
    body: Record<string, unknown>,
    token?: string,
    additionalHeaders: Record<string, string> = {}
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Origin: 'http://localhost',
      'Sec-Fetch-Site': 'same-origin',
      ...additionalHeaders
    }

    if (token) {
      headers.Cookie = `admin_auth_token=${token}`
    }

    return new NextRequest('http://localhost/api/dev/email-test-send', {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    })
  }

  it('is unavailable in production before authentication or sending', async () => {
    process.env.NODE_ENV = 'production'

    const request = buildRequest({
      templateId: 'contact-admin-inquiry',
      to: 'allowlisted@example.com'
    }, 'admin-cookie')
    const response = await POST(request)

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(mockVerifyAdminAuthToken).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects unauthorized requests', async () => {
    mockVerifyAdminAuthToken.mockResolvedValue(false)

    const request = buildRequest({
      templateId: 'contact-admin-inquiry',
      to: 'allowlisted@example.com',
      input: {}
    }, 'invalid-cookie')

    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(mockVerifyAdminAuthToken).toHaveBeenCalledWith('invalid-cookie')
  })

  it('rejects cross-origin mutation requests before authentication or sending', async () => {
    const request = buildRequest({
      templateId: 'contact-admin-inquiry',
      to: 'allowlisted@example.com'
    }, 'admin-cookie', {
      Origin: 'https://attacker.example',
      'Sec-Fetch-Site': 'cross-site'
    })

    const response = await POST(request)

    expect(response.status).toBe(403)
    expect(mockVerifyAdminAuthToken).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects oversized request bodies before parsing or sending', async () => {
    const request = buildRequest({
      templateId: 'contact-admin-inquiry',
      to: 'allowlisted@example.com',
      input: {
        message: 'x'.repeat(33 * 1024)
      }
    }, 'oversized-body-cookie')

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(413)
    expect(json.reason).toBe('Request payload is too large')
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects when real-send is disabled', async () => {
    process.env.EMAIL_REAL_SEND_ENABLED = 'false'

    const request = buildRequest({
      templateId: 'contact-admin-inquiry',
      to: 'allowlisted@example.com',
      input: {}
    }, 'admin-cookie-1')

    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  it('rejects non-allowlisted recipient', async () => {
    const request = buildRequest({
      templateId: 'contact-admin-inquiry',
      to: 'blocked@example.com',
      input: {}
    }, 'admin-cookie-2')

    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  it('accepts send when all guards pass', async () => {
    const request = buildRequest({
      templateId: 'contact-admin-inquiry',
      scenarioId: 'minimal',
      to: 'allowlisted@example.com'
    }, 'admin-cookie-3')

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.accepted).toBe(true)
    expect(json.transportId).toBe('live-id-1')
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      templateId: 'contact-admin-inquiry',
      input: expect.objectContaining({
        message: expect.stringContaining('cake order')
      })
    }))
  })

  it('merges scenario defaults when partial input is provided', async () => {
    const request = buildRequest({
      templateId: 'contact-admin-inquiry',
      scenarioId: 'minimal',
      to: 'allowlisted@example.com',
      input: {
        customerName: 'Merged Sender'
      }
    }, 'admin-cookie-4')

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      templateId: 'contact-admin-inquiry',
      input: expect.objectContaining({
        customerName: 'Merged Sender',
        message: expect.stringContaining('cake order')
      })
    }))
  })

  it('derives status scenario from input status before sending', async () => {
    const request = buildRequest({
      templateId: 'orders-status-update',
      scenarioId: 'confirmed',
      to: 'allowlisted@example.com',
      input: {
        status: 'completed'
      }
    }, 'admin-cookie-5')

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({
      templateId: 'orders-status-update',
      input: expect.objectContaining({
        status: 'completed',
        statusMessage: expect.stringContaining('order has been completed'),
        titleOverride: expect.stringContaining('Order Completed #')
      })
    }))
    expect(mockGetTermsEmailAttachment).not.toHaveBeenCalled()
  })

  it('sends a controlled confirmed final offer with approved wording and the current terms PDF', async () => {
    const request = buildRequest({
      templateId: 'orders-status-update',
      scenarioId: 'confirmed',
      to: 'allowlisted@example.com',
      input: {
        status: 'confirmed',
        customerFacingOfferDescription: '  One handmade honey cake for collection.  ',
        allergenStatement: '  Contains WHEAT (gluten), EGG and MILK.  ',
        customerMessage: 'SENTINEL CUSTOMER MESSAGE',
        message: 'SENTINEL MESSAGE',
        note: 'SENTINEL NOTE',
        giftNote: 'SENTINEL GIFT NOTE',
        titleOverride: 'SENTINEL TITLE',
        headingOverride: 'SENTINEL HEADING',
        statusMessage: 'SENTINEL STATUS MESSAGE',
        nextSteps: ['SENTINEL NEXT STEP'],
        hasDietaryHealthInformation: true,
        orderItems: [{
          productName: 'Honey Cake',
          specialInstructions: 'SENTINEL SPECIAL INSTRUCTIONS'
        }]
      }
    }, 'confirmed-final-offer-cookie')

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockGetTermsEmailAttachment).toHaveBeenCalledTimes(1)

    const sendCall = mockSendEmail.mock.calls[0]?.[0]
    expect(sendCall).toMatchObject({
      templateId: 'orders-status-update',
      input: {
        status: 'confirmed',
        customerFacingOfferDescription: 'One handmade honey cake for collection.',
        allergenStatement: 'Contains WHEAT (gluten), EGG and MILK.',
        titleOverride: 'Final Order Offer #OC-2026-1001 - Olgish Cakes',
        headingOverride: 'Your final order offer',
        statusMessage: expect.stringContaining('terms version 2026-07-28')
      },
      message: {
        attachments: [{
          filename: 'olgish-cakes-terms-2026-07-28.pdf',
          contentType: 'application/pdf'
        }]
      }
    })
    expect(sendCall.input.customerMessage).toBeUndefined()
    expect(sendCall.input.message).toBeUndefined()
    expect(sendCall.input.note).toBeUndefined()
    expect(sendCall.input.giftNote).toBeUndefined()
    expect(sendCall.input.hasDietaryHealthInformation).toBeUndefined()
    expect(sendCall.input.nextSteps).toBeUndefined()
    expect(sendCall.input.orderItems[0].specialInstructions).toBeUndefined()
    expect(JSON.stringify(sendCall.input)).not.toContain('SENTINEL')
  })

  it('rejects a confirmed final-offer send when approved allergen wording is missing', async () => {
    const request = buildRequest({
      templateId: 'orders-status-update',
      scenarioId: 'confirmed',
      to: 'allowlisted@example.com',
      input: {
        status: 'confirmed',
        customerFacingOfferDescription: 'One handmade honey cake for collection.',
        allergenStatement: '   '
      }
    }, 'missing-final-offer-allergen-cookie')

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.reason).toBe('Product-specific allergen information is required for a confirmed final-offer send')
    expect(mockGetTermsEmailAttachment).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects a confirmed final-offer send when the staff-authored offer description is missing', async () => {
    const request = buildRequest({
      templateId: 'orders-status-update',
      scenarioId: 'confirmed',
      to: 'allowlisted@example.com',
      input: {
        status: 'confirmed',
        customerFacingOfferDescription: '   ',
        allergenStatement: 'Contains WHEAT (gluten), EGG and MILK.'
      }
    }, 'missing-final-offer-description-cookie')

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.reason).toBe('Customer-facing offer description is required for a confirmed final-offer send')
    expect(mockGetTermsEmailAttachment).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('rejects overlong confirmed final-offer wording', async () => {
    const request = buildRequest({
      templateId: 'orders-status-update',
      scenarioId: 'confirmed',
      to: 'allowlisted@example.com',
      input: {
        status: 'confirmed',
        customerFacingOfferDescription: 'x'.repeat(2001),
        allergenStatement: 'Contains WHEAT (gluten), EGG and MILK.'
      }
    }, 'overlong-final-offer-description-cookie')

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.reason).toBe('Customer-facing offer description must be 2,000 characters or fewer')
    expect(mockGetTermsEmailAttachment).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('fails safely when the current terms attachment cannot be loaded', async () => {
    mockGetTermsEmailAttachment.mockRejectedValueOnce(new Error('private filesystem details'))
    const request = buildRequest({
      templateId: 'orders-status-update',
      scenarioId: 'confirmed',
      to: 'allowlisted@example.com',
      input: {
        status: 'confirmed',
        customerFacingOfferDescription: 'One handmade honey cake for collection.',
        allergenStatement: 'Contains WHEAT (gluten), EGG and MILK.'
      }
    }, 'terms-attachment-failure-cookie')

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({ accepted: false, reason: 'OPERATION_FAILED' })
    expect(JSON.stringify(json)).not.toContain('private filesystem details')
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('enforces rate limit', async () => {
    process.env.EMAIL_REAL_SEND_RATE_LIMIT_PER_HOUR = '1'

    const first = buildRequest({
      templateId: 'contact-admin-inquiry',
      to: 'allowlisted@example.com',
      input: {}
    }, 'rate-limit-cookie')
    const second = buildRequest({
      templateId: 'contact-admin-inquiry',
      to: 'allowlisted@example.com',
      input: {}
    }, 'rate-limit-cookie')

    const firstResponse = await POST(first)
    const secondResponse = await POST(second)

    expect(firstResponse.status).toBe(200)
    expect(secondResponse.status).toBe(429)
  })
})
