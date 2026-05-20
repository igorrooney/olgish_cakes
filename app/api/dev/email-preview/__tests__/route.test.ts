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

  it('keeps cakes-by-post status scenario defaults when previewing edited input', async () => {
    const request = buildRequest(
      {
        templateId: 'orders-status-update',
        scenarioId: 'cakes-by-post-confirmed',
        input: {
          status: 'confirmed',
          customerName: 'Edited Customer'
        }
      },
      'valid-admin-cookie'
    )

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.input.customerName).toBe('Edited Customer')
    expect(json.input.productName).toBe('Personalised Congratulations Cake Card')
    expect(json.input.paymentStatus).toBe('pending')
    expect(json.input.titleOverride).toContain('Order Request Confirmed #26051220022842')
    expect(json.rendered.text).toContain('Personalised Congratulations Cake Card')
    expect(json.rendered.text).not.toContain('Payment status:')
    expect(json.rendered.text).toContain('Delivery method: By post')
    expect(json.rendered.text).toContain('secure payment link')
  })

  it('preserves edited cakes-by-post courier when previewing status emails', async () => {
    const request = buildRequest(
      {
        templateId: 'orders-status-update',
        scenarioId: 'cakes-by-post-out-for-delivery',
        input: {
          status: 'out-for-delivery',
          deliveryCourier: 'evri',
          trackingNumber: 'H02X8A0022918652'
        }
      },
      'valid-admin-cookie'
    )

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.input.deliveryCourier).toBe('evri')
    expect(json.input.statusMessage).toContain('Evri')
    expect(json.rendered.text).toContain('Great news, your cakes by post order has been dispatched with Evri.')
    expect(json.rendered.text).toContain('Courier: Evri')
    expect(json.rendered.text).toContain('Evri will update the tracking as your parcel moves through their network.')
    expect(json.rendered.html).toContain('https://www.evri.com/track/parcel/H02X8A0022918652/details')
    expect(json.rendered.text).not.toContain('dispatched with Royal Mail')
    expect(json.rendered.text).not.toContain('Royal Mail will update the tracking')
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
