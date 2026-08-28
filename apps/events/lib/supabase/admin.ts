import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { DEFAULT_BUCKET } from '@/lib/constants'
import { getOptionalEnv, getRequiredEnv } from '@/lib/env'
import type { Database } from '@/lib/types/database'

let adminClient: SupabaseClient<Database> | null = null

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!adminClient) {
    const supabaseUrl = getOptionalEnv('SUPABASE_URL') || getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')

    adminClient = createClient<Database>(
      supabaseUrl,
      getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )
  }

  return adminClient
}

export function getEventPhotoBucket(): string {
  const configuredBucket = getOptionalEnv(
    'EVENT_PHOTO_TEMP_BUCKET',
    DEFAULT_BUCKET
  )

  if (configuredBucket !== DEFAULT_BUCKET) {
    throw new Error('EVENT_PHOTO_TEMP_BUCKET must use the canonical bucket')
  }

  return DEFAULT_BUCKET
}
