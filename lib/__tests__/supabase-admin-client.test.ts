/**
 * @jest-environment node
 */
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdminClient } from '../supabase-admin-client'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn() }))
}))

describe('getSupabaseAdminClient', () => {
  const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>
  const originalUrl = process.env.SUPABASE_URL
  const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })

  afterAll(() => {
    process.env.SUPABASE_URL = originalUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey
  })

  it('creates a service-role client with server-safe auth settings', () => {
    const client = getSupabaseAdminClient()

    expect(client).toEqual({ from: expect.any(Function) })
    expect(mockedCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'service-role-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )
  })

  it('throws when the Supabase admin credentials are missing', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    expect(() => getSupabaseAdminClient()).toThrow('Supabase admin client not configured')
    expect(mockedCreateClient).not.toHaveBeenCalled()
  })
})
