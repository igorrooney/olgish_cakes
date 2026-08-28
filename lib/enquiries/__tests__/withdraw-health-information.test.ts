/**
 * @jest-environment node
 */

const mockFrom = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@/lib/supabase-admin-client', () => ({
  getSupabaseAdminClient: () => ({
    from: mockFrom
  })
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

import { withdrawAdminEnquiryDietaryHealthInformation } from '../supabase-enquiries'

const activeRow = {
  id: 42,
  dietary_health_information: 'SENTINEL-HEALTH-INFORMATION',
  dietary_health_consent: true,
  dietary_health_consent_version: '2026-07-29',
  dietary_health_consented_at: '2026-07-30T09:00:00.000Z',
  dietary_health_withdrawn_at: null
}

const createReadQuery = (params: {
  data: unknown
  error?: unknown
}) => {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: params.data,
    error: params.error ?? null
  })
  const eq = jest.fn(() => ({ maybeSingle }))
  const select = jest.fn(() => ({ eq }))

  return { select, eq, maybeSingle }
}

const createUpdateQuery = (params: {
  data: unknown
  error?: unknown
}) => {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: params.data,
    error: params.error ?? null
  })
  const select = jest.fn(() => ({ maybeSingle }))
  const is = jest.fn(() => ({ select }))
  const eq = jest.fn(() => ({ is }))
  const update = jest.fn(() => ({ eq }))

  return { update, eq, is, select, maybeSingle }
}

describe('withdrawAdminEnquiryDietaryHealthInformation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('returns not-found without attempting a write', async () => {
    mockFrom.mockReturnValueOnce(createReadQuery({ data: null }))

    await expect(withdrawAdminEnquiryDietaryHealthInformation('contact', '42'))
      .resolves.toEqual({ status: 'not-found' })

    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('rejects a record that never contained active health information', async () => {
    mockFrom.mockReturnValueOnce(createReadQuery({
      data: {
        ...activeRow,
        dietary_health_information: null,
        dietary_health_consent: false,
        dietary_health_consent_version: null,
        dietary_health_consented_at: null
      }
    }))

    await expect(withdrawAdminEnquiryDietaryHealthInformation('contact', '42'))
      .resolves.toEqual({ status: 'no-active-information' })

    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('returns the original timestamp for an already-withdrawn record', async () => {
    mockFrom.mockReturnValueOnce(createReadQuery({
      data: {
        ...activeRow,
        dietary_health_information: null,
        dietary_health_consent: false,
        dietary_health_withdrawn_at: '2026-07-31T10:00:00.000Z'
      }
    }))

    await expect(withdrawAdminEnquiryDietaryHealthInformation('contact', '42'))
      .resolves.toEqual({
        status: 'already-withdrawn',
        withdrawnAt: '2026-07-31T10:00:00.000Z'
      })

    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('atomically guards the redaction and retains the original consent evidence', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-31T10:00:00.000Z'))
    const readQuery = createReadQuery({ data: activeRow })
    const updateQuery = createUpdateQuery({
      data: { dietary_health_withdrawn_at: '2026-07-31T10:00:00.000Z' }
    })
    mockFrom
      .mockReturnValueOnce(readQuery)
      .mockReturnValueOnce(updateQuery)

    await expect(withdrawAdminEnquiryDietaryHealthInformation('contact', '42'))
      .resolves.toEqual({
        status: 'withdrawn',
        withdrawnAt: '2026-07-31T10:00:00.000Z'
      })

    expect(updateQuery.update).toHaveBeenCalledWith({
      dietary_health_information: null,
      dietary_health_consent: false,
      dietary_health_withdrawn_at: '2026-07-31T10:00:00.000Z'
    })
    expect(updateQuery.eq).toHaveBeenCalledWith('id', '42')
    expect(updateQuery.is).toHaveBeenCalledWith('dietary_health_withdrawn_at', null)
    expect(updateQuery.update.mock.calls[0]?.[0]).not.toHaveProperty(
      'dietary_health_consent_version'
    )
    expect(updateQuery.update.mock.calls[0]?.[0]).not.toHaveProperty(
      'dietary_health_consented_at'
    )
  })

  it('maps a lost concurrent update race to idempotent success', async () => {
    const readQuery = createReadQuery({ data: activeRow })
    const updateQuery = createUpdateQuery({ data: null })
    const rereadQuery = createReadQuery({
      data: {
        ...activeRow,
        dietary_health_information: null,
        dietary_health_consent: false,
        dietary_health_withdrawn_at: '2026-07-31T10:00:00.000Z'
      }
    })
    mockFrom
      .mockReturnValueOnce(readQuery)
      .mockReturnValueOnce(updateQuery)
      .mockReturnValueOnce(rereadQuery)

    await expect(withdrawAdminEnquiryDietaryHealthInformation('contact', '42'))
      .resolves.toEqual({
        status: 'already-withdrawn',
        withdrawnAt: '2026-07-31T10:00:00.000Z'
      })
  })

  it('fails safely without logging database details or health content', async () => {
    const readQuery = createReadQuery({ data: activeRow })
    const updateQuery = createUpdateQuery({
      data: null,
      error: {
        code: 'PGRST500',
        message: 'SENTINEL-HEALTH-INFORMATION',
        details: 'SENTINEL-DATABASE-DETAIL'
      }
    })
    mockFrom
      .mockReturnValueOnce(readQuery)
      .mockReturnValueOnce(updateQuery)

    await expect(withdrawAdminEnquiryDietaryHealthInformation('contact', '42'))
      .rejects.toThrow('Failed to withdraw dietary-health consent')

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to withdraw enquiry dietary-health consent',
      {
        operation: 'enquiries.health-withdrawal.contact',
        recordReference: '42',
        code: 'PGRST500'
      }
    )
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain(
      'SENTINEL-HEALTH-INFORMATION'
    )
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain(
      'SENTINEL-DATABASE-DETAIL'
    )
  })
})
