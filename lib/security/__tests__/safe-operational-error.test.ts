import { toSafeOperationalError } from '../safe-operational-error'

describe('toSafeOperationalError', () => {
  it('keeps only an allowlisted code and valid failure status', () => {
    expect(toSafeOperationalError({
      code: 'PGRST500',
      status: 503,
      message: 'SENTINEL-HEALTH-TEXT',
      details: 'private database details',
      hint: 'private hint'
    })).toEqual({
      code: 'PGRST500',
      status: 503
    })
  })

  it('rejects unsafe codes and arbitrary fields', () => {
    const result = toSafeOperationalError({
      code: 'unsafe code containing customer text',
      status: 200,
      raw: 'SENTINEL-HEALTH-TEXT'
    })

    expect(result).toEqual({ code: 'OPERATION_FAILED' })
    expect(JSON.stringify(result)).not.toContain('SENTINEL-HEALTH-TEXT')
  })

  it('maps common safe runtime categories without exposing messages', () => {
    expect(toSafeOperationalError(new TypeError('private value'))).toEqual({
      code: 'TYPE_ERROR'
    })
    expect(toSafeOperationalError(new DOMException('private value', 'AbortError'))).toEqual({
      code: 'REQUEST_ABORTED'
    })
  })
})
