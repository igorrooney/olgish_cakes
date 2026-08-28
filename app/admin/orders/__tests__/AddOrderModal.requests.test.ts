/**
 * @jest-environment jsdom
 */

import {
  createAdminOrder,
  fetchAdminOrderProducts
} from '../AddOrderModal'

describe('AddOrderModal requests', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('loads products with the caller-owned abort signal', async () => {
    const signal = new AbortController().signal
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [{ id: 'cake-1', displayName: 'Kyiv cake' }]
      })
    })

    await expect(fetchAdminOrderProducts(signal)).resolves.toEqual([
      { id: 'cake-1', displayName: 'Kyiv cake' }
    ])
    expect(global.fetch).toHaveBeenCalledWith('/api/products', { signal })
  })

  it('rejects unsuccessful product responses', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({})
    })

    await expect(
      fetchAdminOrderProducts(new AbortController().signal)
    ).rejects.toThrow('Failed to fetch products')
  })

  it('creates an order with the caller-owned abort signal', async () => {
    const signal = new AbortController().signal
    const payload = {
      name: 'Admin customer',
      total: 75
    }
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ orderNumber: 'OC-1002' })
    })

    await expect(createAdminOrder({ payload, signal })).resolves.toBe('OC-1002')
    expect(global.fetch).toHaveBeenCalledWith('/api/orders', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  })

  it('surfaces the safe API error for an unsuccessful order request', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Order could not be created' })
    })

    await expect(createAdminOrder({
      payload: {},
      signal: new AbortController().signal
    })).rejects.toThrow('Order could not be created')
  })
})
