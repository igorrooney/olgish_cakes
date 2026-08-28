/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockGetPreview = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/privacy-retention/service', () => {
  const actual = jest.requireActual('@/lib/privacy-retention/service')
  return {
    ...actual,
    getPrivacyRetentionPreview: (...args: unknown[]) => mockGetPreview(...args)
  }
})

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

const makeRequest = () => new NextRequest(
  'http://localhost/api/admin/privacy-retention'
)

const preview = {
  generatedAt: '2026-08-25T09:00:00.000Z',
  runReference: 'RET-20260825-A1B2C3D4',
  snapshotToken: `eyJ2ZXJzaW9uIjoxfQ.${'a'.repeat(43)}`,
  confirmationPhrase: 'DELETE RET-20260825-A1B2C3D4',
  ownerReview: {
    ownerLabel: 'Data Controller',
    lastReviewedAt: null,
    nextReviewDueAt: null,
    status: 'not-recorded'
  },
  summary: {
    due: 1,
    held: 0,
    needsLifecycleReview: 0,
    failedLastRun: 0
  },
  categoryCounts: [],
  pagination: {
    page: 1,
    pageSize: 50,
    totalCandidates: 1,
    totalPages: 1,
    hasPrevious: false,
    hasMore: false
  },
  categories: [],
  candidates: [],
  history: []
}

describe('GET /api/admin/privacy-retention', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockGetPreview.mockResolvedValue(preview)
  })

  it('requires an authenticated admin session', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)

    const response = await GET(makeRequest())

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(mockGetPreview).not.toHaveBeenCalled()
  })

  it('returns the safe preview with private, noindex response headers', async () => {
    const response = await GET(makeRequest())

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(preview)
    expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate')
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(mockGetPreview).toHaveBeenCalledWith({ page: 1 })
  })

  it('rejects malformed page input before candidate discovery', async () => {
    const response = await GET(new NextRequest(
      'http://localhost/api/admin/privacy-retention?page=2.5'
    ))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid retention page.' })
    expect(mockGetPreview).not.toHaveBeenCalled()
  })

  it('does not leak persistence details or sensitive content on failure', async () => {
    const sentinel = 'SENTINEL-DIETARY-HEALTH-CONTENT'
    mockGetPreview.mockRejectedValue(Object.assign(
      new Error(`${sentinel} database failure`),
      {
        code: 'PGRST500',
        details: sentinel,
        hint: sentinel
      }
    ))

    const response = await GET(makeRequest())
    const responseText = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(responseText).not.toContain(sentinel)
    expect(logged).not.toContain(sentinel)
    expect(logged).toContain('PGRST500')
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Privacy-retention operation failed',
      expect.objectContaining({
        operation: 'admin.privacy-retention.preview',
        code: 'PGRST500'
      })
    )
  })
})
