import {
  DEFAULT_EVENT_NAME,
  DEFAULT_MAX_IMAGES
} from '@/lib/constants'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { EventPhotoSettingsRow } from '@/lib/types/database'

export interface EventPhotoSettings {
  eventName: string
  maxImages: number
}

const DEFAULT_SETTINGS: EventPhotoSettings = {
  eventName: DEFAULT_EVENT_NAME,
  maxImages: DEFAULT_MAX_IMAGES
}

function mapSettings(row: EventPhotoSettingsRow): EventPhotoSettings {
  return {
    eventName: row.event_name,
    maxImages: row.max_images
  }
}

export async function getEventPhotoSettings(): Promise<EventPhotoSettings> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('event_photo_settings')
    .select('*')
    .eq('id', true)
    .maybeSingle()

  if (error) {
    throw new Error(`Could not load event settings: ${error.message}`)
  }

  if (data) {
    return mapSettings(data)
  }

  const { data: inserted, error: insertError } = await supabase
    .from('event_photo_settings')
    .insert({
      id: true,
      event_name: DEFAULT_SETTINGS.eventName,
      max_images: DEFAULT_SETTINGS.maxImages
    })
    .select('*')
    .single()

  if (insertError) {
    throw new Error(`Could not create default event settings: ${insertError.message}`)
  }

  return mapSettings(inserted)
}

export async function updateEventPhotoSettings(settings: EventPhotoSettings): Promise<EventPhotoSettings> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('event_photo_settings')
    .upsert({
      id: true,
      event_name: settings.eventName,
      max_images: settings.maxImages,
      updated_at: new Date().toISOString()
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`Could not save event settings: ${error.message}`)
  }

  return mapSettings(data)
}
