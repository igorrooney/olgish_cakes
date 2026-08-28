/**
 * @jest-environment node
 */

import { createHash } from 'node:crypto'
import type { SupabaseAdminClient } from '@/lib/supabase-admin-client'
import {
  buildOrderCandidateId,
  buildOrderUploadCandidateId,
  buildSecurityCandidateId
} from '../candidate-id'
import {
  createPrivacyRetentionRepository,
  PrivacyRetentionRepositoryError
} from '../repository'

const orderId = '550e8400-e29b-41d4-a716-446655440000'
const runId = '22222222-2222-4222-8222-222222222222'
const claimToken = '11111111-1111-4111-8111-111111111111'
const now = new Date('2026-08-25T12:00:00.000Z')
const cutoffAt = now.toISOString()
const orderNumber = 'order-1'
const orderPath = `orders/${orderNumber}/reference.jpg`

const revision = (parts: string[]) => createHash('sha256')
  .update(JSON.stringify([...parts].sort()), 'utf8')
  .digest('hex')

type QueryResult = { data: unknown, error: unknown }

class QueryMock implements PromiseLike<QueryResult> {
  readonly table: string
  readonly resolve: (query: QueryMock) => QueryResult
  selected = ''
  filters = new Map<string, unknown>()

  constructor(table: string, resolve: (query: QueryMock) => QueryResult) {
    this.table = table
    this.resolve = resolve
  }

  select(columns: string) {
    this.selected = columns
    return this
  }

  eq(column: string, value: unknown) {
    this.filters.set(`eq:${column}`, value)
    return this
  }

  in(column: string, value: unknown) {
    this.filters.set(`in:${column}`, value)
    return this
  }

  not(column: string, operator: string, value: unknown) {
    this.filters.set(`not:${column}:${operator}`, value)
    return this
  }

  is(column: string, value: unknown) {
    this.filters.set(`is:${column}`, value)
    return this
  }

  lte(column: string, value: unknown) {
    this.filters.set(`lte:${column}`, value)
    return this
  }

  lt(column: string, value: unknown) {
    this.filters.set(`lt:${column}`, value)
    return this
  }
  order() { return this }
  limit(value?: number) {
    this.filters.set('limit', value)
    return this
  }
  or(value?: string) {
    this.filters.set('or', value)
    return this
  }
  range(from?: number, to?: number) {
    this.filters.set('range', [from, to])
    return Promise.resolve(this.resolve(this))
  }
  maybeSingle() { return Promise.resolve(this.resolve(this)) }
  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.resolve(this)).then(onfulfilled, onrejected)
  }
}

const createFrom = (options: {
  actionRevision: string
  orderAssets?: boolean
  securityRows?: Record<string, unknown>[]
}) => jest.fn((table: string) => new QueryMock(table, (query) => {
  if (table === 'privacy_retention_actions') {
    return { data: { snapshot_revision: options.actionRevision }, error: null }
  }
  if (table === 'privacy_retention_security_holds') {
    return { data: [], error: null }
  }
  if (table === 'enquiry_rate_limits' || table === 'event_photo_rate_limit_attempts') {
    return { data: [], error: null }
  }
  if (table === 'admin_login_attempts') {
    return { data: options.securityRows || [], error: null }
  }
  if (table === 'orders') {
    if (query.filters.has('eq:id') && query.selected === 'id,order_number') {
      return { data: { id: orderId, order_number: orderNumber }, error: null }
    }
    if (query.filters.has('lte:retention_due_at')) {
      return { data: [], error: null }
    }
    return {
      data: [{
        id: orderId,
        order_number: orderNumber,
        status: 'completed',
        completed_at: '2024-01-01T00:00:00.000Z',
        retention_due_at: '2030-01-01T00:00:00.000Z',
        legal_hold: false,
        legal_hold_reason: null,
        legal_hold_review_at: null,
        updated_at: '2026-01-01T00:00:00.000Z'
      }],
      error: null
    }
  }
  if (table === 'order_messages') {
    return {
      data: options.orderAssets
        ? [{ id: 'message-1', order_id: orderId, legacy_message: {} }]
        : [],
      error: null
    }
  }
  if (table === 'order_message_attachments') {
    return {
      data: options.orderAssets
        ? [{
            id: 'attachment-1',
            message_id: 'message-1',
            line_number: 1,
            asset_type: 'supabase-file',
            asset_id: null,
            asset_ref: orderPath,
            legacy_attachment: {}
          }]
        : [],
      error: null
    }
  }
  if (
    table === 'order_notes' ||
    table === 'order_note_images' ||
    table === 'order_items' ||
    table === 'contact_enquiries' ||
    table === 'custom_cake_enquiries' ||
    table === 'workshop_enquiries'
  ) {
    return { data: [], error: null }
  }
  throw new Error(`Unexpected table: ${table}`)
}))

const orderRevision = revision([
  'parent:2026-01-01T00:00:00.000Z',
  'message:message-1',
  'attachment:attachment-1',
  `storage:${orderPath}`
])

const claimed = (irreversibleStarted = false) => ({
  data: [{
    status: 'claimed',
    claim_token: claimToken,
    irreversible_started: irreversibleStarted,
    cutoff_at: cutoffAt
  }],
  error: null
})

describe('privacy-retention atomic deletion claims', () => {
  it('initializes a manual run and its immutable selected actions in one RPC', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{
        run_id: runId,
        recovered: false,
        run_status: 'running',
        started_at: cutoffAt,
        completed_at: null
      }],
      error: null
    })
    const repository = createPrivacyRetentionRepository({ rpc } as unknown as SupabaseAdminClient)
    const candidate = {
      id: buildOrderCandidateId(orderId),
      category: 'expired-order' as const,
      recordType: 'Order record',
      recordReference: orderNumber,
      dueAt: cutoffAt,
      reason: 'due',
      removes: [],
      retains: [],
      itemCount: 1,
      held: false,
      snapshotRevision: 'a'.repeat(64)
    }

    await expect(repository.createManualRun({
      runReference: 'RET-20260825-ABCDEF12',
      mode: 'manual',
      initiator: 'admin',
      candidateCount: 1,
      selectedCount: 1,
      selectedCategories: ['expired-order']
    }, [{ candidate, actionType: 'delete-order-record' }])).resolves.toEqual({
      runId,
      recovered: false,
      status: 'running',
      startedAt: cutoffAt,
      completedAt: null
    })

    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('create_privacy_retention_manual_run', {
      p_run_reference: 'RET-20260825-ABCDEF12',
      p_initiator: 'admin',
      p_selected_categories: ['expired-order'],
      p_candidate_count: 1,
      p_selected_count: 1,
      p_actions: [expect.objectContaining({
        candidate_id: candidate.id,
        snapshot_revision: candidate.snapshotRevision,
        outcome: 'pending'
      })]
    })
  })

  it('rejects the old two-step manual run initialization path', async () => {
    const rpc = jest.fn()
    const repository = createPrivacyRetentionRepository({ rpc } as unknown as SupabaseAdminClient)

    await expect(repository.createRun({
      runReference: 'RET-20260825-ABCDEF12',
      mode: 'manual',
      initiator: 'admin',
      candidateCount: 1,
      selectedCount: 1,
      selectedCategories: ['expired-order']
    })).rejects.toMatchObject({
      code: 'RETENTION_MANUAL_RUN_REQUIRES_ATOMIC_ACTIONS'
    })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('maps a concurrent pending-candidate collision to exact-run recovery', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { code: '23505' }
    })
    const repository = createPrivacyRetentionRepository({ rpc } as unknown as SupabaseAdminClient)
    const candidate = {
      id: buildOrderCandidateId(orderId),
      category: 'expired-order' as const,
      recordType: 'Order record',
      recordReference: orderNumber,
      dueAt: cutoffAt,
      reason: 'due',
      removes: [],
      retains: [],
      itemCount: 1,
      held: false,
      snapshotRevision: 'a'.repeat(64)
    }

    await expect(repository.createManualRun({
      runReference: 'RET-20260825-12345678',
      mode: 'manual',
      initiator: 'admin',
      candidateCount: 1,
      selectedCount: 1,
      selectedCategories: ['expired-order']
    }, [{ candidate, actionType: 'delete-order-record' }])).rejects.toMatchObject({
      code: 'RETENTION_RUN_RESUME_REQUIRED'
    })
  })

  it('always includes unresolved runs alongside the newest terminal history', async () => {
    const terminalRows = Array.from({ length: 12 }, (_, index) => ({
      id: `terminal-${index.toString().padStart(2, '0')}`,
      run_reference: `RET-20260825-${index.toString(16).padStart(8, '0').toUpperCase()}`,
      run_mode: 'manual',
      status: 'completed',
      selected_count: 1,
      succeeded_count: 1,
      failed_count: 0,
      started_at: new Date(Date.UTC(2026, 7, 25, 12, index)).toISOString(),
      completed_at: new Date(Date.UTC(2026, 7, 25, 12, index, 1)).toISOString()
    }))
    const unresolvedRow = {
      id: 'unresolved-run',
      run_reference: 'RET-20260801-UNRESOLV',
      run_mode: 'manual',
      status: 'running',
      selected_count: 1,
      succeeded_count: 0,
      failed_count: 0,
      started_at: '2026-08-01T00:00:00.000Z',
      completed_at: null
    }
    const from = jest.fn((table: string) => new QueryMock(table, (query) => {
      const statuses = query.filters.get('in:status')
      return {
        data: Array.isArray(statuses) && statuses.includes('running')
          ? [unresolvedRow]
          : terminalRows,
        error: null
      }
    }))
    const repository = createPrivacyRetentionRepository({ from } as unknown as SupabaseAdminClient)

    const history = await repository.listHistory(12)

    expect(history).toHaveLength(13)
    expect(history[0]).toEqual(expect.objectContaining({
      runReference: unresolvedRow.run_reference,
      status: 'running'
    }))
    expect(history.slice(0, 12)).toEqual(expect.arrayContaining([
      expect.objectContaining({ runReference: unresolvedRow.run_reference })
    ]))
  })

  it('loads the exact immutable pending action set for an interrupted run', async () => {
    const runReference = 'RET-20260825-ABCDEF12'
    const from = jest.fn((table: string) => new QueryMock(table, () => {
      if (table === 'privacy_retention_runs') {
        return {
          data: {
            id: runId,
            run_reference: runReference,
            run_mode: 'manual',
            status: 'running',
            candidate_count: 1,
            selected_count: 1,
            succeeded_count: 0,
            skipped_count: 0,
            failed_count: 0,
            started_at: cutoffAt,
            completed_at: null
          },
          error: null
        }
      }
      if (table === 'privacy_retention_actions') {
        return {
          data: [{
            candidate_id: buildOrderCandidateId(orderId),
            category: 'expired-order',
            record_type: 'Order record',
            record_reference: orderNumber,
            due_at: cutoffAt,
            snapshot_revision: 'a'.repeat(64),
            action_type: 'delete-order-record',
            outcome: 'pending',
            error_code: null,
            occurred_at: cutoffAt
          }],
          error: null
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    }))
    const repository = createPrivacyRetentionRepository({ from } as unknown as SupabaseAdminClient)

    await expect(repository.getManualRunForResume(runReference)).resolves.toEqual(
      expect.objectContaining({
        runId,
        runReference,
        status: 'running',
        actions: [expect.objectContaining({
          candidateId: buildOrderCandidateId(orderId),
          snapshotRevision: 'a'.repeat(64),
          outcome: 'pending'
        })]
      })
    )
  })

  it('fails closed on a legacy running run with an incomplete action audit', async () => {
    const runReference = 'RET-20260825-ABCDEF12'
    const from = jest.fn((table: string) => new QueryMock(table, () => ({
      data: table === 'privacy_retention_runs'
        ? {
            id: runId,
            run_reference: runReference,
            run_mode: 'manual',
            status: 'running',
            candidate_count: 1,
            selected_count: 1,
            succeeded_count: 0,
            skipped_count: 0,
            failed_count: 0,
            started_at: cutoffAt,
            completed_at: null
          }
        : [],
      error: null
    })))
    const repository = createPrivacyRetentionRepository({ from } as unknown as SupabaseAdminClient)

    await expect(repository.getManualRunForResume(runReference)).rejects.toMatchObject({
      code: 'RETENTION_RUN_AUDIT_INITIALIZATION_INCOMPLETE'
    })
  })

  it('does not let 250 held enquiries hide a later unheld due candidate', async () => {
    const makeId = (index: number) =>
      `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`
    const heldRows = Array.from({ length: 250 }, (_, index) => ({
      id: makeId(index + 1),
      retention_due_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      legal_hold: true,
      legal_hold_reason: 'legal-claim',
      legal_hold_review_at: '2026-12-01T00:00:00.000Z',
      reference_image_path: null
    }))
    const visibleId = makeId(251)
    const from = jest.fn((table: string) => new QueryMock(table, (query) => {
      if (
        table === 'custom_cake_enquiries' &&
        query.selected.includes('retention_due_at') &&
        !query.selected.includes('upload_retention_due_at') &&
        !query.selected.includes('dietary_health_retention_due_at')
      ) {
        const range = query.filters.get('range')
        return {
          data: Array.isArray(range) && range[0] === 0
            ? heldRows
            : [{
                id: visibleId,
                retention_due_at: '2026-01-02T00:00:00.000Z',
                updated_at: '2026-01-02T00:00:00.000Z',
                legal_hold: false,
                legal_hold_reason: null,
                legal_hold_review_at: null,
                reference_image_path: null
              }],
          error: null
        }
      }
      return { data: [], error: null }
    }))
    const repository = createPrivacyRetentionRepository({ from } as unknown as SupabaseAdminClient)

    const candidates = await repository.listCandidates(now)

    expect(candidates).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `enquiry:custom-cake:${visibleId}`,
        held: false
      })
    ]))
  })

  it('paginates past 250 no-asset orders and excludes each full-due order upload', async () => {
    const makeId = (index: number) =>
      `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`
    const emptyRows = Array.from({ length: 250 }, (_, index) => ({
      id: makeId(index + 1),
      order_number: `OC-${index + 1}`,
      status: 'completed',
      completed_at: '2024-01-01T00:00:00.000Z',
      retention_due_at: '2030-01-01T00:00:00.000Z',
      legal_hold: false,
      legal_hold_reason: null,
      legal_hold_review_at: null,
      updated_at: '2026-01-01T00:00:00.000Z'
    }))
    const uploadId = makeId(251)
    const fullDueId = makeId(252)
    const uploadRow = {
      ...emptyRows[0],
      id: uploadId,
      order_number: 'OC-251'
    }
    const fullDueRow = {
      ...emptyRows[0],
      id: fullDueId,
      order_number: 'OC-252',
      retention_due_at: '2026-01-01T00:00:00.000Z'
    }
    const from = jest.fn((table: string) => new QueryMock(table, (query) => {
      if (table === 'orders') {
        if (query.selected.includes('dietary_health_retention_due_at')) {
          return { data: [], error: null }
        }
        if (query.filters.has('lte:retention_due_at')) {
          return { data: [fullDueRow], error: null }
        }
        if (query.filters.has('lte:completed_at')) {
          return {
            data: query.filters.has('or')
              ? [uploadRow, fullDueRow]
              : emptyRows,
            error: null
          }
        }
        return { data: [], error: null }
      }
      if (table === 'order_messages') {
        const targetId = query.filters.get('eq:order_id')
        return {
          data: targetId === uploadId || targetId === fullDueId
            ? [{ id: `message-${targetId}`, order_id: targetId, legacy_message: {} }]
            : [],
          error: null
        }
      }
      if (table === 'order_message_attachments') {
        const messageIds = query.filters.get('in:message_id')
        const targetId = Array.isArray(messageIds) && messageIds.length === 1
          ? String(messageIds[0]).replace('message-', '')
          : ''
        return {
          data: targetId
            ? [{
                id: `attachment-${targetId}`,
                message_id: `message-${targetId}`,
                line_number: 1,
                asset_type: 'supabase-file',
                asset_id: null,
                asset_ref: `orders/${targetId}/reference.jpg`,
                legacy_attachment: {}
              }]
            : [],
          error: null
        }
      }
      return { data: [], error: null }
    }))
    const repository = createPrivacyRetentionRepository({ from } as unknown as SupabaseAdminClient)

    const candidates = await repository.listCandidates(now)

    expect(candidates).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: buildOrderUploadCandidateId(uploadId) }),
      expect.objectContaining({ id: buildOrderCandidateId(fullDueId) })
    ]))
    expect(candidates).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: buildOrderUploadCandidateId(fullDueId) })
    ]))
  })

  it('claims and finalizes a database-only security deletion through its exact run/action', async () => {
    const securityRows = [{
      id: 'attempt-1',
      failed_at: '2026-01-01T00:00:00.000Z',
      cleared_at: null
    }]
    const actionRevision = revision(securityRows.map((row) => JSON.stringify(row)))
    const rpc = jest.fn().mockImplementation(async (name: string) => {
      if (name === 'claim_privacy_retention_candidate') return claimed()
      if (name === 'get_privacy_retention_candidate_revision') {
        return { data: actionRevision, error: null }
      }
      if (name === 'finalize_privacy_retention_deletion') {
        return { data: [{ status: 'deleted', affected_count: 1 }], error: null }
      }
      throw new Error(`Unexpected RPC: ${name}`)
    })
    const storageFrom = jest.fn()
    const repository = createPrivacyRetentionRepository({
      from: createFrom({ actionRevision, securityRows }),
      rpc,
      storage: { from: storageFrom }
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      buildSecurityCandidateId('admin-login-attempts'), now, runId
    )).resolves.toBe('deleted')

    expect(storageFrom).not.toHaveBeenCalled()
    expect(rpc).toHaveBeenNthCalledWith(1, 'claim_privacy_retention_candidate', {
      p_candidate_id: 'security:admin-login-attempts',
      p_run_id: runId,
      p_now: cutoffAt
    })
    expect(rpc).toHaveBeenNthCalledWith(3, 'finalize_privacy_retention_deletion', {
      p_candidate_id: 'security:admin-login-attempts',
      p_claim_token: claimToken,
      p_cutoff_at: cutoffAt
    })
  })

  it('commits intent before Storage removal and token-bound finalization', async () => {
    const calls: string[] = []
    const rpc = jest.fn().mockImplementation(async (name: string) => {
      calls.push(name)
      if (name === 'claim_privacy_retention_candidate') return claimed()
      if (name === 'get_privacy_retention_candidate_revision') {
        return { data: orderRevision, error: null }
      }
      if (name === 'begin_privacy_retention_external_deletion') {
        return { data: true, error: null }
      }
      if (name === 'finalize_privacy_retention_deletion') {
        return { data: [{ status: 'deleted', affected_count: 1 }], error: null }
      }
      throw new Error(`Unexpected RPC: ${name}`)
    })
    const remove = jest.fn().mockImplementation(async () => {
      calls.push('storage.remove')
      return { error: null }
    })
    const repository = createPrivacyRetentionRepository({
      from: createFrom({ actionRevision: orderRevision, orderAssets: true }),
      rpc,
      storage: { from: jest.fn(() => ({ remove })) }
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      buildOrderUploadCandidateId(orderId), now, runId
    )).resolves.toBe('deleted')

    expect(calls).toEqual([
      'claim_privacy_retention_candidate',
      'get_privacy_retention_candidate_revision',
      'begin_privacy_retention_external_deletion',
      'storage.remove',
      'finalize_privacy_retention_deletion'
    ])
    expect(rpc).toHaveBeenCalledWith(
      'begin_privacy_retention_external_deletion',
      {
        p_candidate_id: buildOrderUploadCandidateId(orderId),
        p_claim_token: claimToken,
        p_bucket: 'custom-cake-enquiries',
        p_paths: [orderPath]
      }
    )
    expect(remove).toHaveBeenCalledWith([orderPath])
  })

  it('leaves an irreversible provider failure pending and explicitly resumable', async () => {
    const rpc = jest.fn().mockImplementation(async (name: string) => {
      if (name === 'claim_privacy_retention_candidate') return claimed()
      if (name === 'get_privacy_retention_candidate_revision') {
        return { data: orderRevision, error: null }
      }
      if (name === 'begin_privacy_retention_external_deletion') {
        return { data: true, error: null }
      }
      if (name === 'release_privacy_retention_deletion_claim') {
        return { data: true, error: null }
      }
      throw new Error(`Unexpected RPC: ${name}`)
    })
    const repository = createPrivacyRetentionRepository({
      from: createFrom({ actionRevision: orderRevision, orderAssets: true }),
      rpc,
      storage: {
        from: jest.fn(() => ({
          remove: jest.fn().mockResolvedValue({ error: { code: 'provider-failure' } })
        }))
      }
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      buildOrderUploadCandidateId(orderId), now, runId
    )).rejects.toMatchObject({ code: 'RETENTION_CLAIM_RETRY_REQUIRED' })
    expect(rpc).toHaveBeenCalledWith(
      'release_privacy_retention_deletion_claim',
      expect.objectContaining({ p_error_code: 'RETENTION_STORAGE_DELETE_FAILED' })
    )
  })

  it('keeps a prior irreversible claim resumable when snapshot recheck fails', async () => {
    const rpc = jest.fn().mockImplementation(async (name: string) => {
      if (name === 'claim_privacy_retention_candidate') return claimed(true)
      if (name === 'get_privacy_retention_candidate_revision') {
        return { data: '1'.repeat(64), error: null }
      }
      if (name === 'release_privacy_retention_deletion_claim') {
        return { data: true, error: null }
      }
      throw new Error(`Unexpected RPC: ${name}`)
    })
    const repository = createPrivacyRetentionRepository({
      from: createFrom({ actionRevision: '0'.repeat(64), orderAssets: true }),
      rpc,
      storage: { from: jest.fn() }
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      buildOrderUploadCandidateId(orderId), now, runId
    )).rejects.toMatchObject({ code: 'RETENTION_CLAIM_RETRY_REQUIRED' })
  })

  it('keeps a pending action resumable when a non-irreversible claim cannot be released', async () => {
    const rpc = jest.fn().mockImplementation(async (name: string) => {
      if (name === 'claim_privacy_retention_candidate') return claimed()
      if (name === 'get_privacy_retention_candidate_revision') {
        return { data: '1'.repeat(64), error: null }
      }
      if (name === 'release_privacy_retention_deletion_claim') {
        return { data: null, error: { code: 'provider-failure' } }
      }
      throw new Error(`Unexpected RPC: ${name}`)
    })
    const repository = createPrivacyRetentionRepository({
      from: createFrom({ actionRevision: '0'.repeat(64), orderAssets: true }),
      rpc,
      storage: { from: jest.fn() }
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      buildOrderUploadCandidateId(orderId), now, runId
    )).rejects.toMatchObject({ code: 'RETENTION_CLAIM_RETRY_REQUIRED' })
  })

  it('keeps a busy claim pending for the exact run to resume', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ status: 'busy', claim_token: null, irreversible_started: false }],
      error: null
    })
    const from = jest.fn()
    const storageFrom = jest.fn()
    const repository = createPrivacyRetentionRepository({
      from,
      rpc,
      storage: { from: storageFrom }
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      buildOrderUploadCandidateId(orderId), now, runId
    )).rejects.toMatchObject({ code: 'RETENTION_CLAIM_RETRY_REQUIRED' })
    expect(from).not.toHaveBeenCalled()
    expect(storageFrom).not.toHaveBeenCalled()
  })

  it('does not load data for a definitively skipped claim', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ status: 'skipped', claim_token: null, irreversible_started: false }],
      error: null
    })
    const from = jest.fn()
    const storageFrom = jest.fn()
    const repository = createPrivacyRetentionRepository({
      from,
      rpc,
      storage: { from: storageFrom }
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      buildOrderUploadCandidateId(orderId), now, runId
    )).resolves.toBe('skipped')
    expect(from).not.toHaveBeenCalled()
    expect(storageFrom).not.toHaveBeenCalled()
  })

  it('returns a persisted terminal outcome without repeating deletion', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{
        status: 'completed',
        claim_token: null,
        irreversible_started: true,
        terminal_outcome: 'deleted'
      }],
      error: null
    })
    const from = jest.fn()
    const repository = createPrivacyRetentionRepository({
      from,
      rpc,
      storage: { from: jest.fn() }
    } as unknown as SupabaseAdminClient)

    await expect(repository.deleteCandidate(
      buildOrderCandidateId(orderId), now, runId
    )).resolves.toBe('deleted')
    expect(from).not.toHaveBeenCalled()
  })

  it('stores and releases security-batch holds only through the controlled RPC', async () => {
    const rpc = jest.fn()
      .mockResolvedValueOnce({ data: [{ updated: true }], error: null })
      .mockResolvedValueOnce({ data: [{ updated: true }], error: null })
    const repository = createPrivacyRetentionRepository({ rpc } as unknown as SupabaseAdminClient)
    const candidateId = buildSecurityCandidateId('admin-login-attempts')

    await expect(repository.setLegalHold(
      candidateId, true, 'fraud-investigation', '2026-09-25T12:00:00.000Z'
    )).resolves.toBe(true)
    await expect(repository.setLegalHold(candidateId, false, null, null))
      .resolves.toBe(true)
  })

  it('rejects a missing immutable snapshot before creating actions', async () => {
    const repository = createPrivacyRetentionRepository({ rpc: jest.fn() } as unknown as SupabaseAdminClient)

    await expect(repository.createManualRun({
      runReference: 'RET-20260825-ABCDEF12',
      mode: 'manual',
      initiator: 'admin',
      candidateCount: 1,
      selectedCount: 1,
      selectedCategories: ['expired-order']
    }, [{
      candidate: {
        id: buildOrderCandidateId(orderId),
        category: 'expired-order',
        recordType: 'Order record',
        recordReference: orderNumber,
        dueAt: cutoffAt,
        reason: 'due',
        removes: [],
        retains: [],
        itemCount: 1,
        held: false
      },
      actionType: 'delete-order-record'
    }])).rejects.toBeInstanceOf(PrivacyRetentionRepositoryError)
  })
})
