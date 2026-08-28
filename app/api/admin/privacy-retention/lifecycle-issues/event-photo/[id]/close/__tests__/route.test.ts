import { NextRequest } from 'next/server'
import { POST } from '../route'

const mockAuthorize = jest.fn()
const mockClose = jest.fn()

jest.mock('@/lib/privacy-retention/http', () => ({
  authorizeRetentionMutation: (...args: unknown[]) => mockAuthorize(...args),
  parseStrictJsonBody: async (request: NextRequest, schema: { safeParse: (value: unknown) => { success: boolean, data?: unknown } }) => {
    const value: unknown = await request.json().catch(() => null)
    const parsed = schema.safeParse(value)
    return parsed.success ? parsed.data : null
  },
  retentionPasswordSchema: jest.requireActual('zod').z.string().min(1).max(256)
}))

jest.mock('@/lib/privacy-retention/lifecycle-review', () => {
  class PrivacyRetentionLifecycleReviewError extends Error {
    code: string
    status: number

    constructor(code: string, status: number) {
      super(code)
      this.code = code
      this.status = status
    }
  }
  return {
    closeEventPhotoRetentionLifecycle: (...args: unknown[]) => mockClose(...args),
    PrivacyRetentionLifecycleReviewError
  }
})

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (handler: (request: NextRequest) => Promise<Response>) => handler
}))

const id = '22222222-2222-4222-8222-222222222222'
const request = (body: unknown) => new NextRequest(`http://localhost/api/admin/privacy-retention/lifecycle-issues/event-photo/${id}/close`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    origin: 'http://localhost',
    'sec-fetch-site': 'same-origin'
  },
  body: JSON.stringify(body)
})

describe('event-photo retention close route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthorize.mockResolvedValue(null)
    mockClose.mockResolvedValue({
      status: 'closed',
      closedAt: '2026-08-25T12:00:00.000Z',
      retentionDueAt: '2028-08-25T12:00:00.000Z'
    })
  })

  it('requires password authorization and exact validated input', async () => {
    const response = await POST(request({
      password: 'admin password',
      confirmation: `CLOSE EVENT ${id}`
    }), { params: Promise.resolve({ id }) })

    expect(response.status).toBe(200)
    expect(mockAuthorize).toHaveBeenCalled()
    expect(mockClose).toHaveBeenCalledWith({
      requestId: id,
      confirmation: `CLOSE EVENT ${id}`
    })
  })

  it('rejects malformed IDs and bodies before mutation', async () => {
    const response = await POST(request({ password: '', confirmation: '' }), {
      params: Promise.resolve({ id: 'not-a-uuid' })
    })
    expect(response.status).toBe(400)
    expect(mockAuthorize).not.toHaveBeenCalled()
    expect(mockClose).not.toHaveBeenCalled()
  })

  it('does not mutate when password authorization fails', async () => {
    mockAuthorize.mockResolvedValue(new Response(JSON.stringify({ error: 'Invalid admin password' }), { status: 401 }))
    const response = await POST(request({
      password: 'wrong',
      confirmation: `CLOSE EVENT ${id}`
    }), { params: Promise.resolve({ id }) })
    expect(response.status).toBe(401)
    expect(mockClose).not.toHaveBeenCalled()
  })
})
