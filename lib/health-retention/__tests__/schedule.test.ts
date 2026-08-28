/**
 * @jest-environment node
 */

const mockRpc = jest.fn()

jest.mock('@/lib/supabase-admin-client', () => ({
  getSupabaseAdminClient: () => ({
    rpc: mockRpc
  })
}))

import {
  LegacyHealthRetentionScheduleError,
  scheduleLegacyEnquiryHealthRetention,
  scheduleLegacyOrderHealthRetention
} from '../schedule'

describe('legacy dietary-health retention scheduling repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls the enquiry RPC without accepting a client deadline', async () => {
    mockRpc.mockResolvedValue({
      data: [{
        status: 'scheduled',
        due_at: '2026-09-24T12:00:00.000Z'
      }],
      error: null
    })

    await expect(scheduleLegacyEnquiryHealthRetention('contact', '42'))
      .resolves.toEqual({
        status: 'scheduled',
        dueAt: '2026-09-24T12:00:00.000Z'
      })
    expect(mockRpc).toHaveBeenCalledWith(
      'schedule_legacy_enquiry_health_retention',
      {
        p_enquiry_type: 'contact',
        p_record_id: '42'
      }
    )
  })

  it('calls the order RPC using only the exact record reference', async () => {
    mockRpc.mockResolvedValue({
      data: {
        status: 'already-scheduled',
        due_at: '2026-09-24T12:00:00.000Z'
      },
      error: null
    })

    await expect(scheduleLegacyOrderHealthRetention('order-42'))
      .resolves.toEqual({
        status: 'already-scheduled',
        dueAt: '2026-09-24T12:00:00.000Z'
      })
    expect(mockRpc).toHaveBeenCalledWith(
      'schedule_legacy_order_health_retention',
      { p_identifier: 'order-42' }
    )
  })

  it('maps allowlisted database conflicts without copying provider details', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: {
        message: 'HEALTH_RETENTION_LEGAL_HOLD_ACTIVE SENTINEL-PRIVATE-DETAIL',
        details: 'SENTINEL-HEALTH-INFORMATION'
      }
    })

    await expect(scheduleLegacyOrderHealthRetention('order-42'))
      .rejects.toMatchObject({
        code: 'HEALTH_RETENTION_LEGAL_HOLD_ACTIVE',
        status: 409,
        message: 'HEALTH_RETENTION_LEGAL_HOLD_ACTIVE'
      })
  })

  it('fails closed for malformed success data and unknown provider errors', async () => {
    mockRpc.mockResolvedValueOnce({
      data: [{ status: 'scheduled' }],
      error: null
    })
    await expect(scheduleLegacyOrderHealthRetention('order-42'))
      .rejects.toBeInstanceOf(LegacyHealthRetentionScheduleError)

    mockRpc.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'SENTINEL-HEALTH-INFORMATION',
        details: 'SENTINEL-DATABASE-DETAIL'
      }
    })
    await expect(scheduleLegacyOrderHealthRetention('order-42'))
      .rejects.toMatchObject({
        code: 'HEALTH_RETENTION_SCHEDULE_FAILED',
        status: 500,
        message: 'HEALTH_RETENTION_SCHEDULE_FAILED'
      })
  })

  it.each([
    'not-found',
    'no-active-information',
    'already-withdrawn',
    'already-erased'
  ] as const)('returns the content-free no-op status %s', async (status) => {
    mockRpc.mockResolvedValue({
      data: [{ status, due_at: null }],
      error: null
    })

    await expect(scheduleLegacyOrderHealthRetention('order-42'))
      .resolves.toEqual({ status })
  })
})
