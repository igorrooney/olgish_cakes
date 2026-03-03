/**
 * @jest-environment node
 */

import { fetchOccasionOptions } from '../occasionOptions'

describe('fetchOccasionOptions', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns only valid occasion options from API payload', async () => {
    const signal = new AbortController().signal
    const fetchMock = global.fetch as unknown as jest.Mock

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        occasionOptions: [
          { label: 'Wedding', value: 'Wedding' },
          { label: 'Other', value: 'other', disabled: false },
          { label: '' },
          { label: 'Invalid disabled', disabled: 'nope' }
        ]
      })
    })

    const result = await fetchOccasionOptions(signal)

    expect(result).toEqual([
      { label: 'Wedding', value: 'Wedding' },
      { label: 'Other', value: 'other', disabled: false }
    ])
    expect(fetchMock).toHaveBeenCalledWith('/api/form/occasion-options', {
      headers: {
        Accept: 'application/json'
      },
      signal
    })
  })

  it('throws when API response is not ok', async () => {
    const fetchMock = global.fetch as unknown as jest.Mock

    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({})
    })

    await expect(fetchOccasionOptions()).rejects.toThrow('Failed to fetch occasion options')
  })

  it('throws when payload shape is invalid', async () => {
    const fetchMock = global.fetch as unknown as jest.Mock

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ occasionOptions: null })
    })

    await expect(fetchOccasionOptions()).rejects.toThrow('Invalid occasion options response')
  })
})