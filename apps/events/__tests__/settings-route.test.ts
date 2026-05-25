import { describe, expect, it, vi } from 'vitest'

const getEventPhotoSettingsMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/settings', () => ({
  getEventPhotoSettings: getEventPhotoSettingsMock
}))

import { GET } from '@/app/api/event-photo/settings/route'

describe('public event photo settings API', () => {
  it('returns the active public settings', async () => {
    getEventPhotoSettingsMock.mockResolvedValue({
      eventName: 'Leeds Market',
      maxImages: 3
    })

    const response = await GET()

    await expect(response.json()).resolves.toEqual({
      eventName: 'Leeds Market',
      maxImages: 3
    })
  })
})
