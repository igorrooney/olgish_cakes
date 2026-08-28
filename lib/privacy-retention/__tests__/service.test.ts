/**
 * @jest-environment node
 */

import {
  PrivacyRetentionRepositoryError,
  type PrivacyRetentionPersistedManualRun,
  type PrivacyRetentionRepository,
  type RetentionActionInsert,
  type RetentionRunInsert
} from '../repository'
import {
  discoverPrivacyRetentionCandidates,
  executePrivacyRetentionSelection,
  getPrivacyRetentionPreview,
  PrivacyRetentionServiceError,
  recordPrivacyRetentionOwnerReview,
  releasePrivacyRetentionLegalHold,
  resumePrivacyRetentionRun,
  setPrivacyRetentionLegalHold
} from '../service'
import type {
  PrivacyRetentionCandidate,
  PrivacyRetentionRunHistoryItem
} from '../types'
import {
  createPrivacyRetentionSnapshotToken,
  verifyPrivacyRetentionSnapshotToken
} from '../snapshot'

const now = new Date('2026-08-25T12:00:00.000Z')
const runReference = 'RET-20260825-ABCDEF12'
const snapshotSecret = 'privacy-retention-service-test-secret'

const candidate: PrivacyRetentionCandidate = {
  id: 'enquiry:contact:12',
  category: 'expired-enquiry',
  recordType: 'Contact enquiry',
  recordReference: 'contact-12',
  dueAt: '2026-08-01T00:00:00.000Z',
  reason: 'The documented retention deadline passed.',
  removes: ['The enquiry record'],
  retains: ['The non-sensitive deletion audit entry'],
  itemCount: 1,
  held: false,
  snapshotRevision: 'a'.repeat(64)
}

const heldCandidate: PrivacyRetentionCandidate = {
  ...candidate,
  id: 'enquiry:workshop:13',
  recordType: 'Workshop enquiry',
  recordReference: 'workshop-13',
  held: true,
  holdReason: 'active-complaint',
  holdReviewAt: '2026-10-01T00:00:00.000Z'
}

const createSnapshotToken = (
  candidates: PrivacyRetentionCandidate[] = [candidate],
  tokenRunReference = runReference,
  generatedAt = now.toISOString(),
  descriptor: { page: number, pageSize: number, totalCandidates: number } = {
    page: 1,
    pageSize: 50,
    totalCandidates: candidates.length
  }
) => createPrivacyRetentionSnapshotToken({
  runReference: tokenRunReference,
  generatedAt,
  candidates,
  ...descriptor,
  secret: snapshotSecret
})

const createRepository = (
  candidates: PrivacyRetentionCandidate[] = [candidate],
  history: PrivacyRetentionRunHistoryItem[] = []
): jest.Mocked<PrivacyRetentionRepository> => {
  let persistedRun: PrivacyRetentionPersistedManualRun | null = null
  const categoryCounts = [
    'expired-enquiry',
    'expired-enquiry-upload',
    'expired-order-upload',
    'expired-order',
    'expired-health-information',
    'expired-security-record'
  ].map((category) => {
    const categoryCandidates = candidates.filter((item) => item.category === category)
    const held = categoryCandidates.filter((item) => item.held).length
    return {
      category: category as PrivacyRetentionCandidate['category'],
      total: categoryCandidates.length,
      due: categoryCandidates.length - held,
      held
    }
  })
  const repository = {
    listCandidatePage: jest.fn().mockResolvedValue({
      candidates,
      categoryCounts,
      totalCount: candidates.length,
      dueCount: candidates.filter((item) => !item.held).length,
      heldCount: candidates.filter((item) => item.held).length,
      page: 1,
      pageSize: 50,
      hasMore: false
    }),
    listCandidates: jest.fn().mockResolvedValue(candidates),
    countNeedsLifecycleReview: jest.fn().mockResolvedValue(0),
    listHistory: jest.fn().mockResolvedValue(history),
    createRun: jest.fn().mockResolvedValue('run-id'),
    createManualRun: jest.fn().mockImplementation(async (
      input: RetentionRunInsert,
      actions: RetentionActionInsert[]
    ) => {
      persistedRun = {
        runId: 'run-id',
        runReference: input.runReference,
        status: 'running',
        candidateCount: input.candidateCount,
        selectedCount: input.selectedCount,
        succeededCount: 0,
        skippedCount: 0,
        failedCount: 0,
        startedAt: now.toISOString(),
        completedAt: null,
        actions: actions.map(({ candidate: selectedCandidate, actionType }) => ({
          candidateId: selectedCandidate.id,
          category: selectedCandidate.category,
          recordType: selectedCandidate.recordType,
          recordReference: selectedCandidate.recordReference,
          dueAt: selectedCandidate.dueAt,
          snapshotRevision: selectedCandidate.snapshotRevision || 'b'.repeat(64),
          actionType,
          outcome: 'pending',
          errorCode: null,
          occurredAt: now.toISOString()
        }))
      }
      return {
        runId: 'run-id',
        recovered: false,
        status: 'running',
        startedAt: now.toISOString(),
        completedAt: null
      }
    }),
    getManualRunForResume: jest.fn().mockImplementation(async () => persistedRun),
    completeAction: jest.fn().mockResolvedValue(undefined),
    completeRun: jest.fn().mockResolvedValue(now.toISOString()),
    deleteCandidate: jest.fn().mockResolvedValue('deleted'),
    setLegalHold: jest.fn().mockResolvedValue(true),
    getLegalHold: jest.fn().mockResolvedValue({
      found: true,
      recordReference: candidates[0]?.recordReference || null,
      holdActive: candidates[0]?.held === true,
      holdReason: candidates[0]?.holdReason || null,
      holdReviewAt: candidates[0]?.holdReviewAt || null
    })
  } as jest.Mocked<PrivacyRetentionRepository>

  return repository
}

const createPersistedRun = (
  overrides: Partial<PrivacyRetentionPersistedManualRun> = {}
): PrivacyRetentionPersistedManualRun => ({
  runId: 'run-id',
  runReference,
  status: 'running',
  candidateCount: 1,
  selectedCount: 1,
  succeededCount: 0,
  skippedCount: 0,
  failedCount: 0,
  startedAt: now.toISOString(),
  completedAt: null,
  actions: [{
    candidateId: candidate.id,
    category: candidate.category,
    recordType: candidate.recordType,
    recordReference: candidate.recordReference,
    dueAt: candidate.dueAt,
    snapshotRevision: candidate.snapshotRevision || 'a'.repeat(64),
    actionType: 'delete-enquiry-record',
    outcome: 'pending',
    errorCode: null,
    occurredAt: now.toISOString()
  }],
  ...overrides
})

describe('privacy retention service', () => {
  it('builds a safe selectable preview and quarterly owner-review status', async () => {
    const repository = createRepository([candidate, heldCandidate], [{
      runReference: 'RET-20260525-11223344',
      mode: 'owner-review',
      status: 'completed',
      startedAt: '2026-05-25T12:00:00.000Z',
      completedAt: '2026-05-25T12:00:00.000Z',
      selectedCount: 0,
      succeededCount: 0,
      failedCount: 0
    }])
    repository.countNeedsLifecycleReview.mockResolvedValue(3)

    const preview = await getPrivacyRetentionPreview({
      repository,
      now,
      runReference,
      snapshotSecret
    })

    expect(preview).toEqual(expect.objectContaining({
      generatedAt: now.toISOString(),
      runReference,
      confirmationPhrase: `DELETE ${runReference}`,
      summary: {
        due: 1,
        held: 1,
        needsLifecycleReview: 3,
        failedLastRun: 0
      }
    }))
    expect(preview.ownerReview).toEqual(expect.objectContaining({
      ownerLabel: expect.any(String),
      status: 'due-soon',
      nextReviewDueAt: '2026-08-25T12:00:00.000Z'
    }))
    expect(JSON.stringify(preview)).not.toContain('allergy')
    expect(JSON.stringify(preview)).not.toContain(candidate.snapshotRevision)
    expect(preview.candidates.every((item) => item.snapshotRevision === undefined)).toBe(true)
  })

  it('reports a missing owner review without inventing evidence', async () => {
    const preview = await getPrivacyRetentionPreview({
      repository: createRepository(),
      now,
      runReference,
      snapshotSecret
    })

    expect(preview.ownerReview).toEqual(expect.objectContaining({
      lastReviewedAt: null,
      nextReviewDueAt: null,
      status: 'not-recorded'
    }))
  })

  it('binds page six and authoritative totals into the signed preview', async () => {
    const repository = createRepository([candidate])
    repository.listCandidatePage.mockResolvedValue({
      candidates: [candidate],
      categoryCounts: [{
        category: 'expired-enquiry',
        total: 251,
        due: 201,
        held: 50
      }],
      totalCount: 251,
      dueCount: 201,
      heldCount: 50,
      page: 6,
      pageSize: 50,
      hasMore: false
    })

    const result = await getPrivacyRetentionPreview({
      repository,
      now,
      runReference,
      snapshotSecret,
      page: 6
    })
    const signed = verifyPrivacyRetentionSnapshotToken({
      token: result.snapshotToken,
      now,
      secret: snapshotSecret
    })

    expect(result.pagination).toEqual({
      page: 6,
      pageSize: 50,
      totalCandidates: 251,
      totalPages: 6,
      hasPrevious: true,
      hasMore: false
    })
    expect(result.summary).toEqual(expect.objectContaining({ due: 201, held: 50 }))
    expect(signed).toEqual(expect.objectContaining({
      page: 6,
      pageSize: 50,
      totalCandidates: 251
    }))
  })

  it.each([
    {
      name: 'wrong confirmation',
      input: { runReference, snapshotToken: createSnapshotToken(), confirmation: 'DELETE SOMETHING-ELSE', candidateIds: [candidate.id], acknowledgedExternalCopies: true },
      code: 'RETENTION_CONFIRMATION_INVALID',
      status: 400
    },
    {
      name: 'empty selection',
      input: { runReference, snapshotToken: createSnapshotToken(), confirmation: `DELETE ${runReference}`, candidateIds: [], acknowledgedExternalCopies: true },
      code: 'RETENTION_SELECTION_INVALID',
      status: 400
    },
    {
      name: 'duplicate selection',
      input: {
        runReference,
        snapshotToken: createSnapshotToken(),
        confirmation: `DELETE ${runReference}`,
        candidateIds: [candidate.id, candidate.id],
        acknowledgedExternalCopies: true
      },
      code: 'RETENTION_SELECTION_INVALID',
      status: 400
    },
    {
      name: 'missing external-copy acknowledgement',
      input: {
        runReference,
        snapshotToken: createSnapshotToken(),
        confirmation: `DELETE ${runReference}`,
        candidateIds: [candidate.id],
        acknowledgedExternalCopies: false
      },
      code: 'RETENTION_EXTERNAL_COPIES_ACKNOWLEDGEMENT_REQUIRED',
      status: 400
    }
  ])('rejects $name before creating an audit run', async ({ input, code, status }) => {
    const repository = createRepository()

    await expect(executePrivacyRetentionSelection(input, {
      repository,
      now,
      snapshotSecret
    }))
      .rejects.toMatchObject({ code, status })
    expect(repository.createManualRun).not.toHaveBeenCalled()
    expect(repository.deleteCandidate).not.toHaveBeenCalled()
  })

  it('rejects stale and held selections before destructive work', async () => {
    const staleRepository = createRepository([])
    await expect(executePrivacyRetentionSelection({
      runReference,
      snapshotToken: createSnapshotToken(),
      confirmation: `DELETE ${runReference}`,
      candidateIds: [candidate.id],
      acknowledgedExternalCopies: true
    }, {
      repository: staleRepository,
      now,
      snapshotSecret
    })).rejects.toMatchObject({
      code: 'RETENTION_PREVIEW_STALE',
      status: 409
    })

    const heldRepository = createRepository([heldCandidate])
    await expect(executePrivacyRetentionSelection({
      runReference,
      snapshotToken: createSnapshotToken([heldCandidate]),
      confirmation: `DELETE ${runReference}`,
      candidateIds: [heldCandidate.id],
      acknowledgedExternalCopies: true
    }, {
      repository: heldRepository,
      now,
      snapshotSecret
    })).rejects.toMatchObject({
      code: 'RETENTION_LEGAL_HOLD_ACTIVE',
      status: 409
    })

    expect(staleRepository.deleteCandidate).not.toHaveBeenCalled()
    expect(heldRepository.deleteCandidate).not.toHaveBeenCalled()
  })

  it('authenticates the snapshot before reading candidates or creating audit evidence', async () => {
    const authenticToken = createSnapshotToken()
    const [encodedPayload, encodedSignature] = authenticToken.split('.')
    const tamperedToken = `${encodedPayload}.${
      encodedSignature.startsWith('A') ? 'B' : 'A'
    }${encodedSignature.slice(1)}`
    const expiredAt = new Date(now.getTime() - (31 * 60 * 1000)).toISOString()
    const cases = [
      {
        token: tamperedToken,
        code: 'RETENTION_PREVIEW_TOKEN_INVALID'
      },
      {
        token: createSnapshotToken(
          [candidate],
          'RET-20260825-12345678'
        ),
        code: 'RETENTION_PREVIEW_TOKEN_INVALID'
      },
      {
        token: createSnapshotToken([candidate], runReference, expiredAt),
        code: 'RETENTION_PREVIEW_EXPIRED'
      }
    ]

    for (const testCase of cases) {
      const repository = createRepository()

      await expect(executePrivacyRetentionSelection({
        runReference,
        snapshotToken: testCase.token,
        confirmation: `DELETE ${runReference}`,
        candidateIds: [candidate.id],
        acknowledgedExternalCopies: true
      }, {
        repository,
        now,
        snapshotSecret
      })).rejects.toMatchObject({
        code: testCase.code,
        status: 409
      })

      expect(repository.listCandidatePage).not.toHaveBeenCalled()
      expect(repository.createManualRun).not.toHaveBeenCalled()
      expect(repository.deleteCandidate).not.toHaveBeenCalled()
    }
  })

  it('uses the authenticated generation time as the cutoff and rejects a changed candidate count', async () => {
    const previewAt = new Date('2026-08-25T11:50:00.000Z')
    const validRepository = createRepository([candidate])

    await executePrivacyRetentionSelection({
      runReference,
      snapshotToken: createSnapshotToken(
        [candidate],
        runReference,
        previewAt.toISOString()
      ),
      confirmation: `DELETE ${runReference}`,
      candidateIds: [candidate.id],
      acknowledgedExternalCopies: true
    }, {
      repository: validRepository,
      now,
      snapshotSecret
    })

    expect(validRepository.listCandidatePage).toHaveBeenCalledWith(
      previewAt,
      1,
      50
    )

    const newCandidate: PrivacyRetentionCandidate = {
      ...candidate,
      id: 'enquiry:contact:recently-added',
      recordReference: 'recently-added'
    }
    const changedRepository = createRepository([candidate, newCandidate])

    await expect(executePrivacyRetentionSelection({
      runReference,
      snapshotToken: createSnapshotToken(),
      confirmation: `DELETE ${runReference}`,
      candidateIds: [candidate.id],
      acknowledgedExternalCopies: true
    }, {
      repository: changedRepository,
      now,
      snapshotSecret
    })).rejects.toMatchObject({
      code: 'RETENTION_PREVIEW_STALE',
      status: 409
    })

    expect(changedRepository.createManualRun).not.toHaveBeenCalled()
    expect(changedRepository.deleteCandidate).not.toHaveBeenCalled()
  })

  it('atomically creates audit evidence before deleting only selected candidates', async () => {
    const secondCandidate: PrivacyRetentionCandidate = {
      ...candidate,
      id: 'security:admin-login-attempts',
      category: 'expired-security-record',
      recordType: 'Admin login-attempt records',
      recordReference: 'admin-login-attempts'
    }
    const repository = createRepository([candidate, secondCandidate])
    const callOrder: string[] = []
    repository.createManualRun.mockImplementation(async (input, actions) => {
      callOrder.push('audit')
      repository.getManualRunForResume.mockResolvedValue({
        runId: 'run-id',
        runReference: input.runReference,
        status: 'running',
        candidateCount: input.candidateCount,
        selectedCount: input.selectedCount,
        succeededCount: 0,
        skippedCount: 0,
        failedCount: 0,
        startedAt: now.toISOString(),
        completedAt: null,
        actions: actions.map(({ candidate: selectedCandidate, actionType }) => ({
          candidateId: selectedCandidate.id,
          category: selectedCandidate.category,
          recordType: selectedCandidate.recordType,
          recordReference: selectedCandidate.recordReference,
          dueAt: selectedCandidate.dueAt,
          snapshotRevision: selectedCandidate.snapshotRevision || 'b'.repeat(64),
          actionType,
          outcome: 'pending',
          errorCode: null,
          occurredAt: now.toISOString()
        }))
      })
      return {
        runId: 'run-id',
        recovered: false,
        status: 'running',
        startedAt: now.toISOString(),
        completedAt: null
      }
    })
    repository.deleteCandidate.mockImplementation(async () => {
      callOrder.push('delete')
      return 'deleted'
    })

    const result = await executePrivacyRetentionSelection({
      runReference,
      snapshotToken: createSnapshotToken([candidate, secondCandidate]),
      confirmation: `DELETE ${runReference}`,
      candidateIds: [candidate.id],
      acknowledgedExternalCopies: true
    }, { repository, now, snapshotSecret })

    expect(callOrder).toEqual(['audit', 'delete'])
    expect(repository.createManualRun).toHaveBeenCalledWith(
      expect.objectContaining({
        runReference,
        mode: 'manual',
        selectedCount: 1
      }),
      [{
        candidate,
        actionType: 'delete-enquiry-record'
      }]
    )
    expect(repository.deleteCandidate).toHaveBeenCalledWith(candidate.id, now, 'run-id')
    expect(repository.deleteCandidate).not.toHaveBeenCalledWith(secondCandidate.id, now, 'run-id')
    expect(result).toEqual(expect.objectContaining({
      status: 'completed',
      selectedCount: 1,
      succeededCount: 1,
      failedCount: 0
    }))
  })

  it('keeps a concurrent pending candidate with its existing resumable run', async () => {
    const repository = createRepository()
    repository.createManualRun.mockRejectedValue(
      new PrivacyRetentionRepositoryError('RETENTION_RUN_RESUME_REQUIRED')
    )

    await expect(executePrivacyRetentionSelection({
      runReference,
      snapshotToken: createSnapshotToken(),
      confirmation: `DELETE ${runReference}`,
      candidateIds: [candidate.id],
      acknowledgedExternalCopies: true
    }, { repository, now, snapshotSecret })).rejects.toMatchObject({
      code: 'RETENTION_RUN_RESUME_REQUIRED',
      status: 409
    })

    expect(repository.getManualRunForResume).not.toHaveBeenCalled()
    expect(repository.deleteCandidate).not.toHaveBeenCalled()
  })

  it('records safe partial failure without returning the raw exception', async () => {
    const sentinel = 'PRIVATE_DIETARY_HEALTH_SENTINEL'
    const repository = createRepository()
    repository.deleteCandidate.mockRejectedValue(new Error(sentinel))

    const result = await executePrivacyRetentionSelection({
      runReference,
      snapshotToken: createSnapshotToken(),
      confirmation: `DELETE ${runReference}`,
      candidateIds: [candidate.id],
      acknowledgedExternalCopies: true
    }, { repository, now, snapshotSecret })

    expect(result.status).toBe('failed')
    expect(result.failedCount).toBe(1)
    expect(repository.completeAction).toHaveBeenCalledWith(
      'run-id',
      candidate.id,
      'failed',
      'OPERATION_FAILED'
    )
    expect(JSON.stringify(result)).not.toContain(sentinel)
  })

  it('requires the exact resume phrase and an existing persisted manual run', async () => {
    const repository = createRepository()

    await expect(resumePrivacyRetentionRun({
      runReference,
      confirmation: `DELETE ${runReference}`
    }, { repository, now })).rejects.toMatchObject({
      code: 'RETENTION_CONFIRMATION_INVALID',
      status: 400
    })
    expect(repository.getManualRunForResume).not.toHaveBeenCalled()

    repository.getManualRunForResume.mockResolvedValue(null)
    await expect(resumePrivacyRetentionRun({
      runReference,
      confirmation: `RESUME ${runReference}`
    }, { repository, now })).rejects.toMatchObject({
      code: 'RETENTION_RUN_NOT_FOUND',
      status: 404
    })
    expect(repository.deleteCandidate).not.toHaveBeenCalled()
  })

  it('returns a terminal persisted run idempotently without deleting again', async () => {
    const repository = createRepository()
    repository.getManualRunForResume.mockResolvedValue(createPersistedRun({
      status: 'completed',
      succeededCount: 1,
      completedAt: '2026-08-25T12:01:00.000Z',
      actions: [{
        ...createPersistedRun().actions[0],
        outcome: 'deleted',
        occurredAt: '2026-08-25T12:00:30.000Z'
      }]
    }))

    const result = await resumePrivacyRetentionRun({
      runReference,
      confirmation: `RESUME ${runReference}`
    }, { repository, now })

    expect(result).toEqual(expect.objectContaining({
      status: 'completed',
      selectedCount: 1,
      succeededCount: 1,
      failedCount: 0
    }))
    expect(JSON.stringify(result)).not.toContain(candidate.snapshotRevision)
    expect(repository.deleteCandidate).not.toHaveBeenCalled()
    expect(repository.completeAction).not.toHaveBeenCalled()
    expect(repository.completeRun).not.toHaveBeenCalled()
  })

  it('resumes only pending actions and preserves existing terminal outcomes', async () => {
    const repository = createRepository()
    const pendingCandidateId = 'security:admin-login-attempts'
    repository.getManualRunForResume.mockResolvedValue(createPersistedRun({
      candidateCount: 2,
      selectedCount: 2,
      actions: [
        {
          ...createPersistedRun().actions[0],
          outcome: 'deleted'
        },
        {
          ...createPersistedRun().actions[0],
          candidateId: pendingCandidateId,
          category: 'expired-security-record',
          recordType: 'Admin login-attempt records',
          recordReference: 'admin-login-attempts',
          actionType: 'delete-security-records',
          snapshotRevision: 'c'.repeat(64)
        }
      ]
    }))
    repository.deleteCandidate.mockResolvedValue('skipped')

    const result = await resumePrivacyRetentionRun({
      runReference,
      confirmation: `RESUME ${runReference}`
    }, { repository, now })

    expect(repository.deleteCandidate).toHaveBeenCalledTimes(1)
    expect(repository.deleteCandidate).toHaveBeenCalledWith(
      pendingCandidateId,
      now,
      'run-id'
    )
    expect(repository.completeAction).toHaveBeenCalledWith(
      'run-id',
      pendingCandidateId,
      'skipped'
    )
    expect(repository.completeRun).toHaveBeenCalledWith(
      'run-id',
      'partial',
      { succeeded: 1, skipped: 1, failed: 0 },
      now.toISOString()
    )
    expect(result.results.map(({ status }) => status)).toEqual([
      'deleted',
      'skipped'
    ])
  })

  it('keeps an irreversible or unreleased claim pending for explicit recovery', async () => {
    const repository = createRepository()
    repository.getManualRunForResume.mockResolvedValue(createPersistedRun())
    repository.deleteCandidate.mockRejectedValue(
      new PrivacyRetentionRepositoryError('RETENTION_CLAIM_RETRY_REQUIRED')
    )

    await expect(resumePrivacyRetentionRun({
      runReference,
      confirmation: `RESUME ${runReference}`
    }, { repository, now })).rejects.toMatchObject({
      code: 'RETENTION_RUN_RESUME_REQUIRED',
      status: 409
    })
    expect(repository.completeAction).not.toHaveBeenCalled()
    expect(repository.completeRun).not.toHaveBeenCalled()
  })

  it('requires explicit recovery when action or run completion persistence is interrupted', async () => {
    const actionRepository = createRepository()
    actionRepository.getManualRunForResume.mockResolvedValue(createPersistedRun())
    actionRepository.completeAction.mockRejectedValue(new Error('database timeout'))

    await expect(resumePrivacyRetentionRun({
      runReference,
      confirmation: `RESUME ${runReference}`
    }, { repository: actionRepository, now })).rejects.toMatchObject({
      code: 'RETENTION_RUN_RESUME_REQUIRED',
      status: 409
    })
    expect(actionRepository.completeRun).not.toHaveBeenCalled()

    const runRepository = createRepository()
    runRepository.getManualRunForResume.mockResolvedValue(createPersistedRun())
    runRepository.completeRun.mockRejectedValueOnce(new Error('database timeout'))

    await expect(resumePrivacyRetentionRun({
      runReference,
      confirmation: `RESUME ${runReference}`
    }, { repository: runRepository, now })).rejects.toMatchObject({
      code: 'RETENTION_RUN_RESUME_REQUIRED',
      status: 409
    })
    expect(runRepository.completeAction).toHaveBeenCalledWith(
      'run-id',
      candidate.id,
      'deleted'
    )

    runRepository.getManualRunForResume.mockResolvedValue(createPersistedRun({
      actions: [{
        ...createPersistedRun().actions[0],
        outcome: 'deleted'
      }]
    }))
    runRepository.completeRun.mockResolvedValue(now.toISOString())

    await expect(resumePrivacyRetentionRun({
      runReference,
      confirmation: `RESUME ${runReference}`
    }, { repository: runRepository, now })).resolves.toEqual(
      expect.objectContaining({ status: 'completed', succeededCount: 1 })
    )
    expect(runRepository.deleteCandidate).toHaveBeenCalledTimes(1)
  })

  it('fails a changed persisted revision safely without exposing provider details', async () => {
    const repository = createRepository()
    repository.getManualRunForResume.mockResolvedValue(createPersistedRun())
    repository.deleteCandidate.mockRejectedValue(
      new PrivacyRetentionRepositoryError('RETENTION_PREVIEW_STALE')
    )

    const result = await resumePrivacyRetentionRun({
      runReference,
      confirmation: `RESUME ${runReference}`
    }, { repository, now })

    expect(result).toEqual(expect.objectContaining({
      status: 'failed',
      succeededCount: 0,
      failedCount: 1
    }))
    expect(repository.completeAction).toHaveBeenCalledWith(
      'run-id',
      candidate.id,
      'failed',
      'RETENTION_PREVIEW_STALE'
    )
    expect(JSON.stringify(result)).not.toContain(candidate.snapshotRevision)
  })

  it('records owner review and scheduled discovery without deleting records', async () => {
    const repository = createRepository([candidate])

    const review = await recordPrivacyRetentionOwnerReview({
      runReference,
      confirmation: `REVIEW ${runReference}`,
      reviewedSchedule: true,
      reviewedExternalSystems: true
    }, { repository, now })
    const discovery = await discoverPrivacyRetentionCandidates({
      repository,
      now,
      runReference: 'RET-20260825-12345678'
    })

    expect(review).toEqual(expect.objectContaining({
      status: 'recorded',
      nextReviewDueAt: '2026-11-25T12:00:00.000Z'
    }))
    expect(discovery).toEqual(expect.objectContaining({
      status: 'completed',
      dueCount: 1
    }))
    expect(repository.createRun).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'owner-review',
      selectedCount: 0,
      reviewedSchedule: true,
      reviewedExternalSystems: true
    }))
    expect(repository.createRun).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'discovery',
      initiator: 'scheduled'
    }))
    expect(repository.deleteCandidate).not.toHaveBeenCalled()
  })

  it('requires future hold reviews and exact server-derived release confirmation', async () => {
    const repository = createRepository([heldCandidate])

    await expect(setPrivacyRetentionLegalHold({
      candidateId: candidate.id,
      reason: 'active-complaint',
      reviewAt: '2026-08-20T00:00:00.000Z'
    }, { repository, now })).rejects.toBeInstanceOf(PrivacyRetentionServiceError)

    await expect(releasePrivacyRetentionLegalHold({
      candidateId: heldCandidate.id,
      confirmation: 'REMOVE HOLD wrong-reference'
    }, { repository, now })).rejects.toMatchObject({
      code: 'RETENTION_CONFIRMATION_INVALID',
      status: 400
    })

    await expect(releasePrivacyRetentionLegalHold({
      candidateId: heldCandidate.id,
      confirmation: `REMOVE HOLD ${heldCandidate.recordReference}`
    }, { repository, now })).resolves.toEqual(expect.objectContaining({
      status: 'released'
    }))
    expect(repository.setLegalHold).toHaveBeenCalledWith(
      heldCandidate.id,
      false,
      null,
      null
    )
    expect(repository.listCandidates).not.toHaveBeenCalled()
  })

  it('returns an idempotent release without appending another hold event', async () => {
    const repository = createRepository([candidate])

    await expect(releasePrivacyRetentionLegalHold({
      candidateId: candidate.id,
      confirmation: `REMOVE HOLD ${candidate.recordReference}`
    }, { repository, now })).resolves.toEqual(expect.objectContaining({
      status: 'released'
    }))

    expect(repository.getLegalHold).toHaveBeenCalledWith(candidate.id)
    expect(repository.setLegalHold).not.toHaveBeenCalled()
  })
})
