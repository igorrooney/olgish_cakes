/**
 * @jest-environment jsdom
 */

import {
  fetchAllAdminOrders,
  fetchAvailableCakes,
  updateAdminOrder
} from '../OrderManagementDashboard'

describe('OrderManagementDashboard requests', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('uses one query signal for every page in the order list', async () => {
    const signal = new AbortController().signal
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orders: [{ _id: 'order-1' }],
          hasMore: true
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orders: [{ _id: 'order-2' }],
          hasMore: false
        })
      })

    await expect(fetchAllAdminOrders(signal)).resolves.toEqual([
      { _id: 'order-1' },
      { _id: 'order-2' }
    ])
    expect(global.fetch).toHaveBeenCalledTimes(2)
    for (const call of (global.fetch as jest.Mock).mock.calls) {
      expect(call[1]).toEqual(expect.objectContaining({ signal }))
    }
  })

  it('loads the cake selector with its query signal', async () => {
    const signal = new AbortController().signal
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ cakes: [{ _id: 'cake-1' }] })
    })

    await expect(fetchAvailableCakes(signal)).resolves.toEqual([{ _id: 'cake-1' }])
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/cakes', {
      credentials: 'include',
      signal
    })
  })

  it('passes the caller-owned signal to update mutations', async () => {
    const updateSignal = new AbortController().signal
    const payload = new FormData()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })

    await updateAdminOrder({
      orderId: 'OC-1001',
      payload,
      signal: updateSignal
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/orders/OC-1001', expect.objectContaining({
      method: 'PATCH',
      body: payload,
      signal: updateSignal
    }))
  })
})
