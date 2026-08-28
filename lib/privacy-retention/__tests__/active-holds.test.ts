/**
 * @jest-environment node
 */
import type { SupabaseAdminClient } from '@/lib/supabase-admin-client'
import {
  listPrivacyRetentionActiveHolds,
  PrivacyRetentionActiveHoldError
} from '../active-holds'

type Filter = { method: string, args: unknown[] }

const createQuery = (
  table: string,
  resolver: (tableName: string, filters: Filter[]) => unknown[],
  error: unknown = null
) => {
  const filters: Filter[] = []
  const query: Record<string, jest.Mock> & PromiseLike<{
    data: unknown[]
    error: unknown
  }> = {
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    then: (resolve) => Promise.resolve({
      data: resolver(table, filters),
      error
    }).then(resolve)
  }
  for (const method of ['select', 'eq', 'order', 'range']) {
    query[method].mockImplementation((...args: unknown[]) => {
      filters.push({ method, args })
      return query
    })
  }
  return query
}

describe('active privacy-retention legal holds', () => {
  it('lists due and non-due holds once per underlying record using safe canonical releases', async () => {
    const heldUuid = '11111111-1111-4111-8111-111111111111'
    const orderUuid = '22222222-2222-4222-8222-222222222222'
    const selectedColumns: string[] = []
    const resolver = (table: string, filters: Filter[]) => {
      const select = filters.find((filter) => filter.method === 'select')
      if (typeof select?.args[0] === 'string') {
        selectedColumns.push(select.args[0])
      }

      if (table === 'contact_enquiries') {
        return [{
          id: 12,
          legal_hold_reason: 'active-complaint',
          legal_hold_review_at: '2026-09-25T00:00:00.000Z',
          retention_due_at: '2030-01-01T00:00:00.000Z',
          dietary_health_information: 'MUST-NOT-LEAK'
        }]
      }
      if (table === 'custom_cake_enquiries') {
        const held = {
          id: heldUuid,
          legal_hold_reason: 'legal-claim',
          legal_hold_review_at: '2026-08-01T00:00:00.000Z',
          converted_order_id: orderUuid,
          requirements: 'MUST-NOT-LEAK'
        }
        return [held, held]
      }
      if (table === 'orders') {
        return [{
          id: orderUuid,
          order_number: 'OC-2026-00123',
          legal_hold_reason: 'regulatory-request',
          legal_hold_review_at: '2026-10-01T00:00:00.000Z',
          customer_name: 'MUST-NOT-LEAK'
        }]
      }
      if (table === 'privacy_retention_security_holds') {
        return [{
          record_type: 'admin-login-attempts',
          reason: 'fraud-investigation',
          review_at: '2026-09-01T00:00:00.000Z'
        }]
      }
      return []
    }
    const client = {
      from: jest.fn((table: string) => createQuery(table, resolver))
    } as unknown as SupabaseAdminClient

    const result = await listPrivacyRetentionActiveHolds({
      page: 1,
      pageSize: 20,
      now: new Date('2026-08-25T12:00:00.000Z'),
      client
    })

    expect(result.holds).toHaveLength(4)
    expect(result.holds).toEqual(expect.arrayContaining([
      expect.objectContaining({
        candidateId: 'enquiry:contact:12',
        recordReference: 'contact-12',
        overdue: false,
        detailHref: '/admin/enquiries/contact/12'
      }),
      expect.objectContaining({
        candidateId: `enquiry:custom-cake:${heldUuid}`,
        overdue: true
      }),
      expect.objectContaining({
        candidateId: `order:${orderUuid}`,
        recordReference: 'OC-2026-00123'
      }),
      expect.objectContaining({
        candidateId: 'security:admin-login-attempts',
        recordType: 'security-batch'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('MUST-NOT-LEAK')
    expect(selectedColumns.join(',')).not.toMatch(
      /dietary_health_information|requirements|customer_name|retention_due_at/
    )
    expect(client.from).toHaveBeenCalledWith('event_photo_requests')
  })

  it('paginates a register larger than the page across source tables in global order', async () => {
    const rows = [
      ['11111111-1111-4111-8111-111111111111', 'OC-1', '2026-09-01T00:00:00.000Z'],
      ['22222222-2222-4222-8222-222222222222', 'OC-2', '2026-10-01T00:00:00.000Z'],
      ['33333333-3333-4333-8333-333333333333', 'OC-3', '2026-11-01T00:00:00.000Z']
    ].map(([id, orderNumber, reviewAt]) => ({
      id,
      order_number: orderNumber,
      legal_hold_reason: 'legal-claim',
      legal_hold_review_at: reviewAt
    }))
    const client = {
      from: jest.fn((table: string) => createQuery(table, () => {
        if (table === 'orders') {
          return rows
        }
        if (table === 'contact_enquiries') {
          return [{
            id: 9,
            legal_hold_reason: 'active-complaint',
            legal_hold_review_at: '2026-09-15T00:00:00.000Z'
          }]
        }
        return []
      }))
    } as unknown as SupabaseAdminClient

    const result = await listPrivacyRetentionActiveHolds({
      page: 2,
      pageSize: 1,
      now: new Date('2026-08-25T12:00:00.000Z'),
      client
    })

    expect(result.holds).toHaveLength(1)
    expect(result.holds[0].recordReference).toBe('contact-9')
    expect(result.hasMore).toBe(true)
  })

  it('does not invent an order hold when only a linked enquiry is held', async () => {
    const customId = '11111111-1111-4111-8111-111111111111'
    const orderId = '22222222-2222-4222-8222-222222222222'
    const client = {
      from: jest.fn((table: string) => createQuery(table, () => {
        if (table === 'custom_cake_enquiries') {
          return [{
            id: customId,
            converted_order_id: orderId,
            legal_hold_reason: 'legal-claim',
            legal_hold_review_at: '2026-10-01T00:00:00.000Z'
          }]
        }
        return []
      }))
    } as unknown as SupabaseAdminClient

    const result = await listPrivacyRetentionActiveHolds({
      page: 1,
      pageSize: 20,
      now: new Date('2026-08-25T12:00:00.000Z'),
      client
    })

    expect(result.holds).toEqual([
      expect.objectContaining({
        candidateId: `enquiry:custom-cake:${customId}`,
        recordReference: `custom-cake-${customId}`
      })
    ])
    expect(result.holds.some((hold) => hold.candidateId === `order:${orderId}`)).toBe(false)
  })

  it('fails closed when active hold evidence is invalid', async () => {
    const client = {
      from: jest.fn((table: string) => createQuery(table, () =>
        table === 'contact_enquiries'
          ? [{
              id: 12,
              legal_hold_reason: 'unsupported-provider-value',
              legal_hold_review_at: 'not-a-date'
            }]
          : []))
    } as unknown as SupabaseAdminClient

    await expect(listPrivacyRetentionActiveHolds({
      page: 1,
      pageSize: 20,
      client
    })).rejects.toEqual(expect.objectContaining<Partial<PrivacyRetentionActiveHoldError>>({
      code: 'RETENTION_ACTIVE_HOLD_INVALID'
    }))
  })

  it('maps provider failures to one safe internal code', async () => {
    const client = {
      from: jest.fn((table: string) => createQuery(
        table,
        () => [],
        { message: 'provider schema and customer detail MUST-NOT-LEAK' }
      ))
    } as unknown as SupabaseAdminClient

    await expect(listPrivacyRetentionActiveHolds({
      page: 1,
      pageSize: 20,
      client
    })).rejects.toEqual(expect.objectContaining<Partial<PrivacyRetentionActiveHoldError>>({
      code: 'RETENTION_ACTIVE_HOLDS_LOAD_FAILED'
    }))
  })
})
