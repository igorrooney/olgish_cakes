/**
 * @jest-environment node
 */
import type { SupabaseAdminClient } from '@/lib/supabase-admin-client'
import {
  closeEventPhotoRetentionLifecycle,
  listPrivacyRetentionLifecycleIssues,
  PrivacyRetentionLifecycleReviewError
} from '../lifecycle-review'

type Filter = { method: string, args: unknown[] }

const createQuery = (
  table: string,
  resolver: (tableName: string, filters: Filter[]) => unknown[]
) => {
  const filters: Filter[] = []
  const query: Record<string, jest.Mock> & PromiseLike<{ data: unknown[], error: null }> = {
    select: jest.fn(),
    in: jest.fn(),
    is: jest.fn(),
    eq: jest.fn(),
    lte: jest.fn(),
    not: jest.fn(),
    gt: jest.fn(),
    or: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    then: (resolve) => Promise.resolve({ data: resolver(table, filters), error: null }).then(resolve)
  }
  for (const method of ['select', 'in', 'is', 'eq', 'lte', 'not', 'gt', 'or', 'order', 'range']) {
    query[method].mockImplementation((...args: unknown[]) => {
      filters.push({ method, args })
      return query
    })
  }
  return query
}

describe('privacy-retention lifecycle review', () => {
  it('lists old lifecycle issues with safe direct actions instead of customer content', async () => {
    const resolver = (table: string, filters: Filter[]) => {
      const isOpen = filters.some((filter) => filter.method === 'eq' && filter.args[0] === 'lifecycle_status' && filter.args[1] === 'open')
      const isCleaned = filters.some((filter) => filter.method === 'not' && filter.args[0] === 'files_deleted_at')
      const isMissing = filters.some((filter) => filter.method === 'is' && filter.args[0] === 'retention_due_at')
      const isMissingHealth = filters.some((filter) =>
        filter.method === 'is' &&
        filter.args[0] === 'dietary_health_retention_due_at'
      )

      if (table === 'contact_enquiries' && isMissing && !isOpen) {
        return [{ id: 12, created_at: '2022-01-01T10:00:00.000Z', full_name: 'MUST-NOT-LEAK' }]
      }
      if (table === 'contact_enquiries' && isMissingHealth) {
        return [{
          id: 13,
          created_at: '2022-01-02T10:00:00.000Z',
          dietary_health_information: 'MUST-NOT-LEAK-HEALTH'
        }]
      }
      if (table === 'custom_cake_enquiries' && isOpen) {
        return [{ id: '11111111-1111-4111-8111-111111111111', created_at: '2022-02-01T10:00:00.000Z', requirements: 'MUST-NOT-LEAK' }]
      }
      if (table === 'event_photo_requests' && isOpen && isCleaned) {
        return [{ id: '22222222-2222-4222-8222-222222222222', created_at: '2026-01-01T10:00:00.000Z', image_filenames: ['MUST-NOT-LEAK.jpg'] }]
      }
      if (table === 'orders') {
        return [{
          id: '33333333-3333-4333-8333-333333333333',
          order_number: 'OC-2026-00123',
          created_at: '2023-01-01T10:00:00.000Z',
          customer_name: 'MUST-NOT-LEAK'
        }]
      }
      return []
    }
    const client = {
      from: jest.fn((table: string) => createQuery(table, resolver))
    } as unknown as SupabaseAdminClient

    const result = await listPrivacyRetentionLifecycleIssues({
      page: 1,
      pageSize: 20,
      now: new Date('2026-08-25T12:00:00.000Z'),
      client
    })

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        recordReference: 'contact-12',
        detailHref: '/admin/enquiries/contact/12',
        action: 'open-detail'
      }),
      expect.objectContaining({
        recordReference: 'event-photo-22222222-2222-4222-8222-222222222222',
        action: 'close-event-now'
      }),
      expect.objectContaining({
        recordReference: 'OC-2026-00123',
        detailHref: '/admin/orders/33333333-3333-4333-8333-333333333333'
      }),
      expect.objectContaining({
        recordReference: 'contact-13',
        issueCode: 'missing-health-deadline',
        detailHref: '/admin/enquiries/contact/13'
      })
    ]))
    expect(JSON.stringify(result)).not.toContain('MUST-NOT-LEAK')
    expect(JSON.stringify(result)).not.toContain('MUST-NOT-LEAK-HEALTH')
  })

  it('paginates the globally sorted safe queue', async () => {
    const client = {
      from: jest.fn((table: string) => createQuery(table, (_table, filters) => {
        const isHealthDeadlineQuery = filters.some((filter) =>
          filter.method === 'is' &&
          filter.args[0] === 'dietary_health_retention_due_at'
        )
        return table === 'orders' && !isHealthDeadlineQuery
          ? [
            { id: '11111111-1111-4111-8111-111111111111', order_number: 'OC-1', created_at: '2020-01-01T00:00:00.000Z' },
            { id: '22222222-2222-4222-8222-222222222222', order_number: 'OC-2', created_at: '2021-01-01T00:00:00.000Z' },
            { id: '33333333-3333-4333-8333-333333333333', order_number: 'OC-3', created_at: '2022-01-01T00:00:00.000Z' }
          ]
          : []
      }))
    } as unknown as SupabaseAdminClient

    const result = await listPrivacyRetentionLifecycleIssues({
      page: 2,
      pageSize: 1,
      client,
      now: new Date('2026-08-25T12:00:00.000Z')
    })

    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].recordReference).toBe('OC-2')
    expect(result.hasMore).toBe(true)
  })

  it('uses the atomic event-close RPC and validates its safe response', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{
        status: 'closed',
        closed_at: '2026-08-25T12:00:00.000Z',
        retention_due_at: '2028-08-25T12:00:00.000Z'
      }],
      error: null
    })
    const result = await closeEventPhotoRetentionLifecycle({
      requestId: '22222222-2222-4222-8222-222222222222',
      confirmation: 'CLOSE EVENT 22222222-2222-4222-8222-222222222222',
      client: { rpc } as unknown as SupabaseAdminClient
    })

    expect(rpc).toHaveBeenCalledWith('close_event_photo_retention_lifecycle', {
      p_request_id: '22222222-2222-4222-8222-222222222222',
      p_confirmation: 'CLOSE EVENT 22222222-2222-4222-8222-222222222222'
    })
    expect(result.status).toBe('closed')
  })

  it('maps known RPC failures without exposing provider details', async () => {
    const client = {
      rpc: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'RETENTION_EVENT_LEGAL_HOLD_ACTIVE internal detail' }
      })
    } as unknown as SupabaseAdminClient

    await expect(closeEventPhotoRetentionLifecycle({
      requestId: '22222222-2222-4222-8222-222222222222',
      confirmation: 'CLOSE EVENT 22222222-2222-4222-8222-222222222222',
      client
    })).rejects.toEqual(expect.objectContaining<Partial<PrivacyRetentionLifecycleReviewError>>({
      code: 'RETENTION_EVENT_LEGAL_HOLD_ACTIVE',
      status: 409
    }))
  })
})
