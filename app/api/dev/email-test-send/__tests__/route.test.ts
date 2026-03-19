/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockSendEmail = jest.fn()

jest.mock('@/lib/email/service', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args)
}))

jest.mock('@/lib/admin/auth-token', () => ({
  verifyAdminAuthToken: jest.fn()
}))

import { POST } from '../route'

const { verifyAdminAuthToken: mockVerifyAdminAuthToken } = jest.requireMock('@/lib/admin/auth-token') as {
  verifyAdminAuthToken: jest.MockedFunction<(token: string | null | undefined) => Promise<boolean>>
}

describe('/api/dev/email-test-send', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.EMAIL_REAL_SEND_ENABLED = 'true'
    process.env.EMAIL_TEST_RECIPIENT_ALLOWLIST = 'allowlisted@example.com'
    process.env.EMAIL_REAL_SEND_RATE_LIMIT_PER_HOUR = '5'
    process.env.EMAIL_TEST_SUBJECT_PREFIX = '[TEST]'
    mockVerifyAdminAuthToken.mockResolvedValue(true)
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

  function buildRequest(body: Record<string, unknown>, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
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
