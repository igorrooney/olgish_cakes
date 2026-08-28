/**
 * @jest-environment node
 */

import {
  createPrivacyRetentionCandidateFingerprint,
  createPrivacyRetentionSnapshotToken,
  PRIVACY_RETENTION_SNAPSHOT_MAX_AGE_MS,
  PrivacyRetentionSnapshotError,
  verifyPrivacyRetentionSnapshotToken
} from '../snapshot'
import type { PrivacyRetentionCandidate } from '../types'

const secret = 'snapshot-test-secret'
const generatedAt = '2026-08-25T12:00:00.000Z'
const runReference = 'RET-20260825-ABCDEF12'

const candidate: PrivacyRetentionCandidate = {
  id: 'enquiry:contact:12',
  category: 'expired-enquiry',
  recordType: 'Contact enquiry',
  recordReference: 'contact-12',
  dueAt: '2026-08-01T00:00:00.000Z',
  reason: 'The documented retention deadline passed.',
  removes: ['Upload', 'Enquiry record'],
  retains: ['Deletion audit', 'Consent withdrawal evidence'],
  itemCount: 2,
  held: true,
  snapshotRevision: 'row-revision-1',
  holdReason: 'active-complaint',
  holdReviewAt: '2026-10-01T00:00:00.000Z'
}

const createToken = (
  candidates: PrivacyRetentionCandidate[] = [candidate],
  tokenGeneratedAt = generatedAt
) => createPrivacyRetentionSnapshotToken({
  runReference,
  generatedAt: tokenGeneratedAt,
  candidates,
  secret
})

describe('privacy retention snapshot binding', () => {
  it('creates an order-independent fingerprint covering every deletion-critical field', () => {
    const secondCandidate: PrivacyRetentionCandidate = {
      ...candidate,
      id: 'order:24',
      category: 'expired-order',
      removes: ['Order row'],
      retains: []
    }
    const expected = createPrivacyRetentionCandidateFingerprint([
      candidate,
      secondCandidate
    ])

    expect(createPrivacyRetentionCandidateFingerprint([
      { ...secondCandidate },
      {
        ...candidate,
        removes: [...candidate.removes].reverse(),
        retains: [...candidate.retains].reverse()
      }
    ])).toBe(expected)

    const mutations: PrivacyRetentionCandidate[] = [
      { ...candidate, id: `${candidate.id}:changed` },
      { ...candidate, category: 'expired-order' },
      { ...candidate, recordType: 'Changed record type' },
      { ...candidate, recordReference: 'changed-reference' },
      { ...candidate, dueAt: '2026-08-02T00:00:00.000Z' },
      { ...candidate, reason: 'Changed retention reason.' },
      { ...candidate, itemCount: candidate.itemCount + 1 },
      { ...candidate, held: false },
      { ...candidate, snapshotRevision: 'row-revision-2' },
      { ...candidate, holdReason: 'legal-claim' },
      { ...candidate, holdReviewAt: '2026-11-01T00:00:00.000Z' },
      { ...candidate, removes: [...candidate.removes, 'Another row'] },
      { ...candidate, retains: [...candidate.retains, 'Another audit field'] }
    ]

    mutations.forEach((changedCandidate) => {
      expect(createPrivacyRetentionCandidateFingerprint([
        changedCandidate,
        secondCandidate
      ])).not.toBe(expected)
    })
  })

  it('signs the exact page descriptor and candidate fingerprint', () => {
    const token = createToken()
    const [encodedPayload] = token.split('.')
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as unknown

    expect(payload).toEqual({
      version: 2,
      runReference,
      generatedAt,
      fingerprint: createPrivacyRetentionCandidateFingerprint([candidate]),
      page: 1,
      pageSize: 50,
      totalCandidates: 1
    })
    expect(JSON.stringify(payload)).not.toContain(candidate.id)
    expect(JSON.stringify(payload)).not.toContain(candidate.removes[0])
  })

  it('verifies an authentic token for no more than 30 minutes', () => {
    const token = createToken()
    const atMaximumAge = new Date(
      new Date(generatedAt).getTime() + PRIVACY_RETENTION_SNAPSHOT_MAX_AGE_MS
    )

    expect(verifyPrivacyRetentionSnapshotToken({
      token,
      now: atMaximumAge,
      secret
    })).toEqual(expect.objectContaining({ runReference, generatedAt }))

    expect(() => verifyPrivacyRetentionSnapshotToken({
      token,
      now: new Date(atMaximumAge.getTime() + 1),
      secret
    })).toThrow(expect.objectContaining({
      code: 'RETENTION_PREVIEW_EXPIRED'
    }))
  })

  it('rejects tampering, the wrong secret and future-dated envelopes', () => {
    const token = createToken()
    const [encodedPayload, encodedSignature] = token.split('.')
    const tamperedToken = `${encodedPayload}.${
      encodedSignature.startsWith('A') ? 'B' : 'A'
    }${encodedSignature.slice(1)}`

    const invalidInputs = [
      { token: tamperedToken, now: new Date(generatedAt), secret },
      { token, now: new Date(generatedAt), secret: 'wrong-secret' },
      {
        token,
        now: new Date(new Date(generatedAt).getTime() - 1),
        secret
      }
    ]

    invalidInputs.forEach((input) => {
      expect(() => verifyPrivacyRetentionSnapshotToken(input))
        .toThrow(PrivacyRetentionSnapshotError)
      expect(() => verifyPrivacyRetentionSnapshotToken(input))
        .toThrow(expect.objectContaining({
          code: 'RETENTION_PREVIEW_TOKEN_INVALID'
        }))
    })
  })

  it('fails safely when an explicitly injected signing secret is empty', () => {
    expect(() => createPrivacyRetentionSnapshotToken({
      runReference,
      generatedAt,
      candidates: [candidate],
      secret: '   '
    })).toThrow('RETENTION_SNAPSHOT_CONFIGURATION_ERROR')
  })
})
