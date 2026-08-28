/**
 * @jest-environment node
 */

import type { SupabaseAdminClient } from '@/lib/supabase-admin-client'
import {
  createPrivacyRetentionRepository,
  PrivacyRetentionRepositoryError
} from '../repository'

const categoryCounts = [
  { category: 'expired-enquiry', total: 251, due: 201, held: 50 },
  { category: 'expired-enquiry-upload', total: 0, due: 0, held: 0 },
  { category: 'expired-order-upload', total: 0, due: 0, held: 0 },
  { category: 'expired-order', total: 0, due: 0, held: 0 },
  { category: 'expired-health-information', total: 0, due: 0, held: 0 },
  { category: 'expired-security-record', total: 0, due: 0, held: 0 }
]

const candidate251 = {
  id: 'enquiry:contact:251',
  category: 'expired-enquiry',
  recordType: 'Contact enquiry',
  recordReference: 'contact-251',
  dueAt: '2026-08-20T00:00:00.000Z',
  reason: 'The documented enquiry-retention deadline has passed.',
  removes: ['The enquiry record and its customer information'],
  retains: ['Only the non-sensitive deletion audit entry'],
  itemCount: 1,
  held: false,
  snapshotRevision: 'a'.repeat(64)
}

const createClient = (data: unknown) => {
  const rpc = jest.fn().mockResolvedValue({ data, error: null })
  const from = jest.fn(() => {
    throw new Error('Candidate paging must not fall back to source scans')
  })
  const client = { rpc, from } as unknown as SupabaseAdminClient
  return { client, rpc, from }
}

describe('privacy-retention candidate paging repository', () => {
  it('loads candidate 251 through one bounded RPC with authoritative held totals', async () => {
    const { client, rpc, from } = createClient({
      candidates: [candidate251],
      categoryCounts,
      totalCount: 251,
      dueCount: 201,
      heldCount: 50,
      page: 6,
      pageSize: 50,
      hasMore: false
    })

    const result = await createPrivacyRetentionRepository(client)
      .listCandidatePage(new Date('2026-08-25T12:00:00.000Z'), 6, 50)

    expect(result).toEqual(expect.objectContaining({
      candidates: [candidate251],
      totalCount: 251,
      dueCount: 201,
      heldCount: 50,
      page: 6,
      hasMore: false
    }))
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith(
      'list_privacy_retention_candidate_page',
      {
        p_cutoff: '2026-08-25T12:00:00.000Z',
        p_page: 6,
        p_page_size: 50
      }
    )
    expect(from).not.toHaveBeenCalled()
  })

  it('fails closed on inconsistent totals or an unsigned revision shape', async () => {
    const { client } = createClient({
      candidates: [{ ...candidate251, snapshotRevision: 'not-a-digest' }],
      categoryCounts,
      totalCount: 251,
      dueCount: 202,
      heldCount: 50,
      page: 6,
      pageSize: 50,
      hasMore: false
    })

    await expect(createPrivacyRetentionRepository(client).listCandidatePage(
      new Date('2026-08-25T12:00:00.000Z'),
      6,
      50
    )).rejects.toEqual(expect.objectContaining<Partial<PrivacyRetentionRepositoryError>>({
      code: 'RETENTION_CANDIDATE_PAGE_INVALID'
    }))
  })

  it('accepts the server-clamped last page after the former last page empties', async () => {
    const { client } = createClient({
      candidates: [candidate251],
      categoryCounts: [
        { category: 'expired-enquiry', total: 51, due: 51, held: 0 },
        ...categoryCounts.slice(1)
      ],
      totalCount: 51,
      dueCount: 51,
      heldCount: 0,
      page: 2,
      pageSize: 50,
      hasMore: false
    })

    await expect(createPrivacyRetentionRepository(client).listCandidatePage(
      new Date('2026-08-25T12:00:00.000Z'),
      3,
      50
    )).resolves.toEqual(expect.objectContaining({
      page: 2,
      totalCount: 51,
      hasMore: false
    }))
  })

  it('fails closed when category totals omit or duplicate a category', async () => {
    const { client } = createClient({
      candidates: [candidate251],
      categoryCounts: [
        categoryCounts[0],
        categoryCounts[0],
        ...categoryCounts.slice(2)
      ],
      totalCount: 251,
      dueCount: 201,
      heldCount: 50,
      page: 6,
      pageSize: 50,
      hasMore: false
    })

    await expect(createPrivacyRetentionRepository(client).listCandidatePage(
      new Date('2026-08-25T12:00:00.000Z'),
      6,
      50
    )).rejects.toMatchObject({
      code: 'RETENTION_CANDIDATE_PAGE_INVALID'
    })
  })
})
