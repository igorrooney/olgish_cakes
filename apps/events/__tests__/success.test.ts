import { describe, expect, it } from 'vitest'

import {
  buildSuccessPath,
  parseSuccessRequestId,
  SUCCESS_REQUEST_ID_PARAM
} from '@/lib/success'

const VALID_REQUEST_ID = '2a1024bc-5b7e-4d6e-a602-2c84d9c678f0'

describe('success page guard helpers', () => {
  it('builds a success URL with the request id', () => {
    expect(buildSuccessPath(VALID_REQUEST_ID)).toBe(
      `/success?${SUCCESS_REQUEST_ID_PARAM}=${VALID_REQUEST_ID}`
    )
  })

  it('accepts only a single UUID request id', () => {
    expect(parseSuccessRequestId(VALID_REQUEST_ID)).toBe(VALID_REQUEST_ID)
    expect(parseSuccessRequestId('not-a-request-id')).toBeNull()
    expect(parseSuccessRequestId([VALID_REQUEST_ID])).toBeNull()
    expect(parseSuccessRequestId(undefined)).toBeNull()
  })
})
