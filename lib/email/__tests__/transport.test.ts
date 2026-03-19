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
    expect(result.error?.message).toContain('RESEND_API_KEY')
  })
})
