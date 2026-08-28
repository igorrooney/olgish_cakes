import type { SupabaseAdminClient } from '@/lib/supabase-admin-client'
import {
  getPrivacyRetentionRunDetails,
  PrivacyRetentionRunDetailsError
} from '../run-details'

const runReference = 'RET-20260825-A1B2C3D4'
const runRow = {
  id: '11111111-1111-4111-8111-111111111111',
  run_reference: runReference,
  run_mode: 'manual',
  status: 'partial',
  candidate_count: 3,
  selected_count: 2,
  succeeded_count: 1,
  skipped_count: 0,
  failed_count: 1,
  started_at: '2026-08-25T09:00:00.000Z',
  completed_at: '2026-08-25T09:01:00.000Z',
  updated_at: '2026-08-25T09:01:00.000Z',
  deleted_payload: 'SENTINEL_DELETED_CONTENT',
  source_ip: '192.0.2.1'
}
const actionRow = {
  candidate_id: 'order:22222222-2222-4222-8222-222222222222',
  category: 'expired-order',
  record_type: 'Order record',
  record_reference: 'OC-2026-0001',
  action_type: 'delete-order-record',
  outcome: 'failed',
  error_code: 'RETENTION_ORDER_DELETE_FAILED',
  occurred_at: '2026-08-25T09:00:30.000Z',
  storage_path: 'SENTINEL_PRIVATE_STORAGE_PATH',
  request_payload: 'SENTINEL_REQUEST_PAYLOAD'
}
const deletedActionRow = {
  candidate_id: 'enquiry:contact:12',
  category: 'expired-enquiry',
  record_type: 'Contact enquiry',
  record_reference: 'contact-12',
  action_type: 'delete-enquiry-record',
  outcome: 'deleted',
  error_code: null,
  occurred_at: '2026-08-25T09:00:20.000Z'
}

const createClient = (input: {
  runData?: unknown
  runError?: unknown
  actionData?: unknown
  actionError?: unknown
} = {}) => {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: input.runData === undefined ? runRow : input.runData,
    error: input.runError || null
  })
  const runQuery = {
    select: jest.fn(),
    eq: jest.fn(),
    maybeSingle
  }
  runQuery.select.mockReturnValue(runQuery)
  runQuery.eq.mockReturnValue(runQuery)

  const limit = jest.fn().mockResolvedValue({
    data: input.actionData === undefined ? [deletedActionRow, actionRow] : input.actionData,
    error: input.actionError || null
  })
  const actionQuery = {
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    limit
  }
  actionQuery.select.mockReturnValue(actionQuery)
  actionQuery.eq.mockReturnValue(actionQuery)
  actionQuery.order.mockReturnValue(actionQuery)

  const from = jest.fn((table: string) => table === 'privacy_retention_runs'
    ? runQuery
    : actionQuery)

  return {
    client: { from } as unknown as SupabaseAdminClient,
    from,
    runQuery,
    actionQuery
  }
}

describe('getPrivacyRetentionRunDetails', () => {
  it('returns only allowlisted run and action audit fields', async () => {
    const { client, runQuery, actionQuery } = createClient()
    const result = await getPrivacyRetentionRunDetails(runReference, client)

    expect(result).toEqual({
      runReference,
      mode: 'manual',
      status: 'partial',
      startedAt: '2026-08-25T09:00:00.000Z',
      completedAt: '2026-08-25T09:01:00.000Z',
      updatedAt: '2026-08-25T09:01:00.000Z',
      counts: {
        candidates: 3,
        selected: 2,
        succeeded: 1,
        skipped: 0,
        failed: 1
      },
      auditInitialisationIncomplete: false,
      actions: [
        {
          candidateId: 'enquiry:contact:12',
          category: 'expired-enquiry',
          recordType: 'Contact enquiry',
          recordReference: 'contact-12',
          action: 'delete-enquiry-record',
          outcome: 'deleted',
          errorCode: null,
          occurredAt: '2026-08-25T09:00:20.000Z'
        },
        {
          candidateId: 'order:22222222-2222-4222-8222-222222222222',
          category: 'expired-order',
          recordType: 'Order record',
          recordReference: 'OC-2026-0001',
          action: 'delete-order-record',
          outcome: 'failed',
          errorCode: 'RETENTION_ORDER_DELETE_FAILED',
          occurredAt: '2026-08-25T09:00:30.000Z'
        }
      ]
    })
    expect(JSON.stringify(result)).not.toContain('SENTINEL')
    expect(runQuery.select).toHaveBeenCalledWith(
      'id,run_reference,run_mode,status,candidate_count,selected_count,succeeded_count,skipped_count,failed_count,started_at,completed_at,updated_at'
    )
    expect(actionQuery.select).toHaveBeenCalledWith(
      'candidate_id,category,record_type,record_reference,action_type,outcome,error_code,occurred_at'
    )
  })

  it('supports a pending run with no actions', async () => {
    const { client } = createClient({
      runData: {
        ...runRow,
        status: 'pending',
        selected_count: 0,
        succeeded_count: 0,
        failed_count: 0,
        completed_at: null
      },
      actionData: []
    })

    await expect(getPrivacyRetentionRunDetails(runReference, client)).resolves.toEqual(
      expect.objectContaining({
        status: 'pending',
        completedAt: null,
        auditInitialisationIncomplete: false,
        actions: []
      })
    )
  })

  it('flags an active manual run whose action audit is not fully initialised', async () => {
    const { client } = createClient({
      runData: {
        ...runRow,
        status: 'running',
        succeeded_count: 0,
        failed_count: 0,
        completed_at: null
      },
      actionData: [deletedActionRow]
    })

    await expect(getPrivacyRetentionRunDetails(runReference, client)).resolves.toEqual(
      expect.objectContaining({
        status: 'running',
        auditInitialisationIncomplete: true,
        actions: [expect.objectContaining({ outcome: 'deleted' })]
      })
    )
  })

  it.each([
    {
      label: 'a terminal manual run with a missing action',
      runData: runRow,
      actionData: [actionRow]
    },
    {
      label: 'a terminal manual run with a pending action',
      runData: runRow,
      actionData: [
        deletedActionRow,
        { ...actionRow, outcome: 'pending', error_code: null }
      ]
    },
    {
      label: 'a terminal manual run whose outcome tallies differ',
      runData: {
        ...runRow,
        succeeded_count: 0,
        skipped_count: 1,
        failed_count: 1
      },
      actionData: [deletedActionRow, actionRow]
    },
    {
      label: 'a terminal owner review with selected deletion actions',
      runData: {
        ...runRow,
        run_mode: 'owner-review'
      },
      actionData: [deletedActionRow, actionRow]
    },
    {
      label: 'a terminal discovery run with an action despite no selection',
      runData: {
        ...runRow,
        run_mode: 'discovery',
        candidate_count: 2,
        selected_count: 0,
        succeeded_count: 0,
        failed_count: 0
      },
      actionData: [deletedActionRow]
    },
    {
      label: 'an active manual run with more actions than selected records',
      runData: {
        ...runRow,
        status: 'running',
        selected_count: 1,
        succeeded_count: 0,
        failed_count: 0,
        completed_at: null
      },
      actionData: [
        { ...deletedActionRow, outcome: 'pending', error_code: null },
        { ...actionRow, outcome: 'pending', error_code: null }
      ]
    },
    {
      label: 'an active manual run whose aggregate tallies claim an unrecorded outcome',
      runData: {
        ...runRow,
        status: 'running',
        succeeded_count: 1,
        failed_count: 0,
        completed_at: null
      },
      actionData: [{ ...deletedActionRow, outcome: 'pending', error_code: null }]
    }
  ])('fails closed for $label', async ({ runData, actionData }) => {
    const { client } = createClient({ runData, actionData })
    await expect(getPrivacyRetentionRunDetails(runReference, client)).rejects.toMatchObject({
      code: 'RETENTION_RUN_AUDIT_INCONSISTENT'
    })
  })

  it('returns null without querying actions when the run does not exist', async () => {
    const { client, from } = createClient({ runData: null })
    await expect(getPrivacyRetentionRunDetails(runReference, client)).resolves.toBeNull()
    expect(from).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid references before reading the database', async () => {
    const { client, from } = createClient()
    await expect(getPrivacyRetentionRunDetails('RET-invalid', client)).rejects.toMatchObject({
      code: 'RETENTION_RUN_REFERENCE_INVALID'
    })
    expect(from).not.toHaveBeenCalled()
  })

  it('fails closed on database errors and malformed audit rows', async () => {
    const databaseFailure = createClient({ runError: { message: 'provider detail' } })
    await expect(getPrivacyRetentionRunDetails(runReference, databaseFailure.client)).rejects.toMatchObject({
      code: 'RETENTION_RUN_DETAILS_LOAD_FAILED'
    })

    const malformedAction = createClient({
      actionData: [{ ...actionRow, record_reference: 'customer@example.com' }]
    })
    await expect(getPrivacyRetentionRunDetails(runReference, malformedAction.client)).rejects.toBeInstanceOf(
      PrivacyRetentionRunDetailsError
    )

    const storagePathReference = createClient({
      actionData: [{ ...actionRow, record_reference: 'private/customer-file.jpg' }]
    })
    await expect(getPrivacyRetentionRunDetails(runReference, storagePathReference.client)).rejects.toMatchObject({
      code: 'RETENTION_RUN_ACTION_INVALID'
    })
  })
})
