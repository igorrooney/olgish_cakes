export const CUSTOM_CAKE_STORAGE_BUCKET = 'custom-cake-enquiries'

export const getCustomCakeStorageBucket = () => {
  const configured = process.env.SUPABASE_ENQUIRY_BUCKET?.trim()

  if (configured && configured !== CUSTOM_CAKE_STORAGE_BUCKET) {
    throw new Error('SUPABASE_ENQUIRY_BUCKET must use the canonical bucket')
  }

  return CUSTOM_CAKE_STORAGE_BUCKET
}
