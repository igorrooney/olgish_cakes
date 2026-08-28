/**
 * @jest-environment node
 */
import {
  AdminEnquiryRetentionLifecycleError,
  updateAdminEnquiryRetentionLifecycle
} from '../supabase-enquiries'

const mockRpc = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@/lib/supabase-admin-client', () => ({
  getSupabaseAdminClient: () => ({ rpc: mockRpc })
}))

jest.mock('@/lib/logger', () => ({
  logger: { error: (...args: unknown[]) => mockLoggerError(...args) }
}))

describe('atomic enquiry retention lifecycle updates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRpc.mockResolvedValue({
      data: [{
        status: 'updated',
        lifecycle_status: 'closed',
        last_contacted_at: '2026-08-25T12:00:00.000Z',
        closed_at: '2026-08-25T12:00:00.000Z',
        converted_order_id: null,
        retention_due_at: '2028-08-25T12:00:00.000Z',
        upload_retention_due_at: null,
        legal_hold: false,
        updated_at: '2026-08-25T12:00:00.000Z'
      }],
      error: null
    })
  })

  it('delegates timestamps, state checks and audit evidence to the database RPC', async () => {
    const result = await updateAdminEnquiryRetentionLifecycle('contact', '42', {
      action: 'close'
    })

    expect(mockRpc).toHaveBeenCalledWith('update_enquiry_retention_lifecycle', {
      p_enquiry_type: 'contact',
      p_record_id: '42',
      p_action: 'close',
      p_converted_order_reference: null
    })
    expect(result).toEqual({
      lifecycle: expect.objectContaining({
        status: 'closed',
        closedAt: '2026-08-25T12:00:00.000Z',
        retentionDueAt: '2028-08-25T12:00:00.000Z',
        legalHold: false
      }),
      updatedAt: '2026-08-25T12:00:00.000Z'
    })
  })

  it('maps converted-link protection to a conflict without logging provider content', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'RETENTION_CONVERTED_LINK_IMMUTABLE provider detail' }
    })

    await expect(updateAdminEnquiryRetentionLifecycle('contact', '42', {
      action: 'reopen'
    })).rejects.toEqual(expect.objectContaining<Partial<AdminEnquiryRetentionLifecycleError>>({
      code: 'RETENTION_CONVERTED_LINK_IMMUTABLE',
      status: 409
    }))
    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('fails closed on malformed RPC output', async () => {
    mockRpc.mockResolvedValue({ data: [{ status: 'updated' }], error: null })
    await expect(updateAdminEnquiryRetentionLifecycle('contact', '42', {
      action: 'close'
    })).rejects.toEqual(expect.objectContaining({
      code: 'RETENTION_LIFECYCLE_UPDATE_FAILED',
      status: 500
    }))
  })

  it('does not send a converted order reference for other actions', async () => {
    await updateAdminEnquiryRetentionLifecycle('custom-cake', '11111111-1111-4111-8111-111111111111', {
      action: 'record-contact',
      convertedOrderId: 'SHOULD-NOT-BE-SENT'
    })
    expect(mockRpc).toHaveBeenCalledWith('update_enquiry_retention_lifecycle', expect.objectContaining({
      p_converted_order_reference: null
    }))
  })
})
