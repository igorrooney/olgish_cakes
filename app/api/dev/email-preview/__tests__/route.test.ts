/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('@/lib/admin/auth-token', () => ({
  verifyAdminAuthToken: jest.fn()
}))

import { POST } from '../route'

const { verifyAdminAuthToken: mockVerifyAdminAuthToken } = jest.requireMock('@/lib/admin/auth-token') as {
  verifyAdminAuthToken: jest.MockedFunction<(token: string | null | undefined) => Promise<boolean>>
}

function buildRequest(body: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers.Cookie = `admin_auth_token=${token}`
  }

  return new NextRequest('http://localhost/api/dev/email-preview', {
    method: 'POST',
    body: JSON.stringify(body),
    headers
  })
}

describe('/api/dev/email-preview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockVerifyAdminAuthToken.mockResolvedValue(true)
  })

  it('rejects missing admin auth cookie', async () => {
    mockVerifyAdminAuthToken.mockResolvedValue(false)

    const request = buildRequest({ templateId: 'contact-admin-inquiry' })

    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(mockVerifyAdminAuthToken).toHaveBeenCalledWith('')
  })

  it('rejects invalid admin auth cookie', async () => {
    mockVerifyAdminAuthToken.mockResolvedValue(false)

    const request = buildRequest(
      { templateId: 'contact-admin-inquiry' },
      'invalid-admin-cookie'
    )

    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(mockVerifyAdminAuthToken).toHaveBeenCalledWith('invalid-admin-cookie')
  })

  it('returns rendered preview for valid request', async () => {
    const request = buildRequest(
      { templateId: 'contact-inline-order-customer' },
      'valid-admin-cookie'
    )

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.templateId).toBe('contact-inline-order-customer')
    expect(json.rendered.subject).toBeDefined()
    expect(json.rendered.text).toContain('Thank you for choosing Olgish Cakes')
    expect(json.rendered.html).toContain('<html')
    expect(mockVerifyAdminAuthToken).toHaveBeenCalledWith('valid-admin-cookie')
  })

  it('uses scenario defaults when scenarioId is provided', async () => {
    const request = buildRequest(
      { templateId: 'contact-admin-inquiry', scenarioId: 'minimal' },
      'valid-admin-cookie'
    )

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.scenarioId).toBe('minimal')
    expect(json.input.message).toContain('cake order')
  })

  it('merges scenario defaults with partial input for non-status templates', async () => {
    const request = buildRequest(
      {
        templateId: 'contact-admin-inquiry',
        scenarioId: 'minimal',
        input: {
          customerName: 'Merged Name'
        }
      },
      'valid-admin-cookie'
    )

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.input.customerName).toBe('Merged Name')
    expect(json.input.message).toContain('cake order')
    expect(json.rendered.subject).toContain('Merged Name')
    expect(json.rendered.text).toContain('Can you help with a cake order?')
  })

  it('derives status scenario from input status for orders status updates', async () => {
    const request = buildRequest(
      {
        templateId: 'orders-status-update',
        scenarioId: 'confirmed',
        input: {
          status: 'completed'
        }
      },
      'valid-admin-cookie'
    )

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.input.status).toBe('completed')
    expect(json.input.statusMessage).toContain('order has been completed')
    expect(json.input.titleOverride).toContain('Order Completed #')
    expect(json.rendered.subject).toContain('Order Completed #')
    expect(json.rendered.text).toContain('order has been completed')
    expect(json.rendered.text).not.toContain('The order status has been updated.')
  })

  it('rejects malformed template input with status 400', async () => {
    const request = buildRequest(
      {
        templateId: 'contact-inline-order-customer',
        input: {
          quantity: 'not-a-number'
        }
      },
      'valid-admin-cookie'
    )

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Invalid template input')
  })
  it('rejects unsupported template id', async () => {
    const request = buildRequest(
      { templateId: 'unknown-template' },
      'valid-admin-cookie'
    )

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
