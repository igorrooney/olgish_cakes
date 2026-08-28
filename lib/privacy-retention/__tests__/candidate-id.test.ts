/**
 * @jest-environment node
 */

import { createHash } from 'node:crypto'
import type { SupabaseAdminClient } from '@/lib/supabase-admin-client'
import {
  buildEnquiryCandidateId,
  buildEnquiryUploadCandidateId,
  buildOrderCandidateId,
  buildOrderUploadCandidateId,
  buildSecurityCandidateId,
  parsePrivacyRetentionCandidateId
} from '../candidate-id'
import {
  createPrivacyRetentionRepository
} from '../repository'

const uuid = '550e8400-e29b-41d4-a716-446655440000'

describe('privacy retention candidate identifiers', () => {
  it.each([
    {
      value: buildEnquiryCandidateId('contact', '123'),
      expected: {
        kind: 'enquiry',
        category: 'expired-enquiry',
        enquiryType: 'contact',
        recordId: '123'
      }
    },
    {
      value: buildEnquiryCandidateId('workshop', '456'),
      expected: {
        kind: 'enquiry',
        category: 'expired-enquiry',
        enquiryType: 'workshop',
        recordId: '456'
      }
    },
    {
      value: buildEnquiryCandidateId('custom-cake', uuid),
      expected: {
        kind: 'enquiry',
        category: 'expired-enquiry',
        enquiryType: 'custom-cake',
        recordId: uuid
      }
    },
    {
      value: buildEnquiryCandidateId('event-photo', uuid.toUpperCase()),
      expected: {
        kind: 'enquiry',
        category: 'expired-enquiry',
        enquiryType: 'event-photo',
        recordId: uuid.toUpperCase()
      }
    },
    {
      value: buildEnquiryUploadCandidateId('custom-cake', uuid),
      expected: {
        kind: 'enquiry-upload',
        category: 'expired-enquiry-upload',
        enquiryType: 'custom-cake',
        recordId: uuid
      }
    },
    {
      value: buildEnquiryUploadCandidateId('event-photo', uuid),
      expected: {
        kind: 'enquiry-upload',
        category: 'expired-enquiry-upload',
        enquiryType: 'event-photo',
        recordId: uuid
      }
    },
    {
      value: buildOrderUploadCandidateId(uuid),
      expected: {
        kind: 'order-upload',
        category: 'expired-order-upload',
        orderId: uuid
      }
    },
    {
      value: buildOrderCandidateId(uuid),
      expected: {
        kind: 'order',
        category: 'expired-order',
        orderId: uuid
      }
    },
    {
      value: buildSecurityCandidateId('admin-login-attempts'),
      expected: {
        kind: 'security',
        category: 'expired-security-record',
        recordType: 'admin-login-attempts'
      }
    }
  ])('parses the server-built identifier $value', ({ value, expected }) => {
    expect(parsePrivacyRetentionCandidateId(value)).toEqual(expected)
  })

  it.each([
    '',
    ' ',
    'enquiry:contact:',
    'enquiry:contact:-1',
    'enquiry:contact:+1',
    'enquiry:contact:1.5',
    'enquiry:contact:12 34',
    'enquiry:contact:123456789012345678901',
    `enquiry:contact:${uuid}`,
    'enquiry:custom-cake:123',
    'enquiry:unknown:123',
    `enquiry-upload:contact:${uuid}`,
    `enquiry-upload:custom-cake:${uuid}:forged`,
    'order:not-a-uuid',
    'order:550e8400-e29b-71d4-a716-446655440000',
    'order-upload:../../private',
    'order-upload:%2e%2e%2fprivate',
    `order:${uuid}:forged`,
    'security:unknown-table',
    'security:admin-login-attempts:forged',
    `enquiry:contact:${'1'.repeat(161)}`
  ])('rejects malformed or forged identifier %s', (value) => {
    expect(parsePrivacyRetentionCandidateId(value)).toBeNull()
  })

  it.each([
    'enquiry-rate-limits',
    'admin-login-attempts',
    'event-photo-rate-limits'
  ] as const)('accepts only the allowlisted security record type %s', (recordType) => {
    expect(parsePrivacyRetentionCandidateId(
      buildSecurityCandidateId(recordType)
    )).toEqual(expect.objectContaining({ recordType }))
  })

  it('rejects an invalid identifier before any database operation', async () => {
    const from = jest.fn(() => {
      throw new Error('Database access must not be attempted')
    })
    const repository = createPrivacyRetentionRepository({
      from
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      'order-upload:../../private',
      new Date('2026-08-25T12:00:00.000Z')
    )).rejects.toEqual(expect.objectContaining({
      name: 'PrivacyRetentionRepositoryError',
      code: 'RETENTION_CANDIDATE_ID_INVALID'
    }))
    expect(from).not.toHaveBeenCalled()
  })

  it('rejects a traversing stored path before calling Supabase Storage', async () => {
    const cutoffAt = '2026-08-25T12:00:00.000Z'
    const runId = '22222222-2222-4222-8222-222222222222'
    const updatedAt = '2026-08-01T00:00:00.000Z'
    const unsafePath = 'enquiries/../../private-file'
    const snapshotRevision = createHash('sha256')
      .update(JSON.stringify([
        `parent:${updatedAt}`,
        `path:${unsafePath}`
      ].sort()), 'utf8')
      .digest('hex')
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: uuid,
        retention_due_at: '2026-08-01T00:00:00.000Z',
        updated_at: updatedAt,
        legal_hold: false,
        legal_hold_reason: null,
        legal_hold_review_at: null,
        reference_image_bucket: 'custom-cake-enquiries',
        reference_image_path: unsafePath
      },
      error: null
    })
    const query: {
      select: jest.Mock
      eq: jest.Mock
      not: jest.Mock
      lte: jest.Mock
      order: jest.Mock
      range: jest.Mock
      maybeSingle: jest.Mock
    } = {
      select: jest.fn(),
      eq: jest.fn(),
      not: jest.fn(),
      lte: jest.fn(),
      order: jest.fn(),
      range: jest.fn().mockResolvedValue({
        data: [{
          id: uuid,
          retention_due_at: '2026-08-01T00:00:00.000Z',
          updated_at: updatedAt,
          legal_hold: false,
          legal_hold_reason: null,
          legal_hold_review_at: null,
          reference_image_bucket: 'custom-cake-enquiries',
          reference_image_path: unsafePath
        }],
        error: null
      }),
      maybeSingle
    }
    query.select.mockReturnValue(query)
    query.eq.mockReturnValue(query)
    query.not.mockReturnValue(query)
    query.lte.mockReturnValue(query)
    query.order.mockReturnValue(query)

    const storageFrom = jest.fn()
    const rpc = jest.fn().mockImplementation(async (name: string) => {
      if (name === 'claim_privacy_retention_candidate') {
        return {
          data: [{
            status: 'claimed',
            claim_token: '11111111-1111-4111-8111-111111111111',
            irreversible_started: false,
            cutoff_at: cutoffAt
          }],
          error: null
        }
      }
      if (name === 'get_privacy_retention_candidate_revision') {
        return { data: snapshotRevision, error: null }
      }
      if (name === 'release_privacy_retention_deletion_claim') {
        return { data: true, error: null }
      }
      throw new Error(`Unexpected RPC: ${name}`)
    })
    const repository = createPrivacyRetentionRepository({
      from: jest.fn((table: string) => {
        if (table === 'privacy_retention_actions') {
          const actionQuery: {
            select: jest.Mock
            eq: jest.Mock
            maybeSingle: jest.Mock
          } = {
            select: jest.fn(),
            eq: jest.fn(),
            maybeSingle: jest.fn().mockResolvedValue({
            data: { snapshot_revision: snapshotRevision },
            error: null
            })
          }
          actionQuery.select.mockReturnValue(actionQuery)
          actionQuery.eq.mockReturnValue(actionQuery)
          return actionQuery
        }
        return query
      }),
      rpc,
      storage: { from: storageFrom }
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      buildEnquiryCandidateId('custom-cake', uuid),
      new Date(cutoffAt),
      runId
    )).rejects.toMatchObject({ code: 'RETENTION_STORAGE_PATH_INVALID' })
    expect(storageFrom).not.toHaveBeenCalled()
    expect(rpc).toHaveBeenCalledWith(
      'release_privacy_retention_deletion_claim',
      expect.objectContaining({ p_error_code: 'RETENTION_STORAGE_PATH_INVALID' })
    )
  })
})
