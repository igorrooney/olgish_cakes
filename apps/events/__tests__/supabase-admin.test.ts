import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.hoisted(() => vi.fn(() => ({ client: 'supabase-admin' })))

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock
}))

describe('Supabase admin client configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    createClientMock.mockClear()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://public.supabase.co'
    process.env.SUPABASE_URL = ''
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
    process.env.EVENT_PHOTO_TEMP_BUCKET = ''
  })

  it('creates one non-persistent service-role client from required env vars', async () => {
    const { getSupabaseAdmin } = await import('@/lib/supabase/admin')

    const firstClient = getSupabaseAdmin()
    const secondClient = getSupabaseAdmin()

    expect(firstClient).toBe(secondClient)
    expect(createClientMock).toHaveBeenCalledTimes(1)
    expect(createClientMock).toHaveBeenCalledWith(
      'https://public.supabase.co',
      'service-role-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )
  })

  it('prefers the private Supabase URL and supports custom temp bucket names', async () => {
    process.env.SUPABASE_URL = 'https://private.supabase.co'
    process.env.EVENT_PHOTO_TEMP_BUCKET = 'custom-event-bucket'
    const { getEventPhotoBucket, getSupabaseAdmin } = await import('@/lib/supabase/admin')

    getSupabaseAdmin()

    expect(createClientMock).toHaveBeenCalledWith(
      'https://private.supabase.co',
      'service-role-key',
      expect.any(Object)
    )
    expect(getEventPhotoBucket()).toBe('custom-event-bucket')
  })

  it('uses the default temp bucket when no override is configured', async () => {
    const { getEventPhotoBucket } = await import('@/lib/supabase/admin')

    expect(getEventPhotoBucket()).toBe('event-photo-temp-uploads')
  })
})
