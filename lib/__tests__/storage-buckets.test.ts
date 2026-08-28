/**
 * @jest-environment node
 */

import {
  CUSTOM_CAKE_STORAGE_BUCKET,
  getCustomCakeStorageBucket
} from '@/lib/storage-buckets'

describe('canonical storage-bucket policy', () => {
  const originalBucket = process.env.SUPABASE_ENQUIRY_BUCKET

  afterEach(() => {
    if (originalBucket === undefined) {
      delete process.env.SUPABASE_ENQUIRY_BUCKET
    } else {
      process.env.SUPABASE_ENQUIRY_BUCKET = originalBucket
    }
  })

  it('uses the canonical bucket when unset or explicitly canonical', () => {
    delete process.env.SUPABASE_ENQUIRY_BUCKET
    expect(getCustomCakeStorageBucket()).toBe(CUSTOM_CAKE_STORAGE_BUCKET)

    process.env.SUPABASE_ENQUIRY_BUCKET = `  ${CUSTOM_CAKE_STORAGE_BUCKET}  `
    expect(getCustomCakeStorageBucket()).toBe(CUSTOM_CAKE_STORAGE_BUCKET)
  })

  it('fails closed without echoing a noncanonical bucket name', () => {
    const sentinel = 'private-legacy-bucket-sentinel'
    process.env.SUPABASE_ENQUIRY_BUCKET = sentinel

    expect(() => getCustomCakeStorageBucket()).toThrow(
      'SUPABASE_ENQUIRY_BUCKET must use the canonical bucket'
    )
    try {
      getCustomCakeStorageBucket()
    } catch (error) {
      expect(String(error)).not.toContain(sentinel)
    }
  })
})
