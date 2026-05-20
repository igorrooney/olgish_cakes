export type TelegramStatus = 'pending' | 'sent' | 'failed'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface EventPhotoSettingsRow extends Record<string, unknown> {
  id: boolean
  event_name: string
  max_images: number
  created_at: string
  updated_at: string
}

export interface EventPhotoSettingsInsert extends Record<string, unknown> {
  id?: boolean
  event_name?: string
  max_images?: number
  created_at?: string
  updated_at?: string
}

export interface EventPhotoSettingsUpdate extends Record<string, unknown> {
  event_name?: string
  max_images?: number
  updated_at?: string
}

export interface EventPhotoRequestRow extends Record<string, unknown> {
  id: string
  full_name: string
  email: string
  event_name: string
  image_count: number
  image_filenames: string[]
  image_mime_types: string[]
  image_sizes: number[]
  temp_image_bucket: string | null
  temp_image_paths: string[]
  telegram_status: TelegramStatus
  telegram_message_ids: number[]
  telegram_error: string | null
  files_deleted_at: string | null
  source: string
  created_at: string
  updated_at: string
}

export interface EventPhotoRequestInsert extends Record<string, unknown> {
  id?: string
  full_name: string
  email: string
  event_name: string
  image_count: number
  image_filenames: string[]
  image_mime_types: string[]
  image_sizes: number[]
  temp_image_bucket?: string | null
  temp_image_paths?: string[]
  telegram_status?: TelegramStatus
  telegram_message_ids?: number[]
  telegram_error?: string | null
  files_deleted_at?: string | null
  source?: string
  created_at?: string
  updated_at?: string
}

export interface EventPhotoRequestUpdate extends Record<string, unknown> {
  telegram_status?: TelegramStatus
  telegram_message_ids?: number[]
  telegram_error?: string | null
  temp_image_paths?: string[]
  files_deleted_at?: string | null
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      event_photo_settings: {
        Row: EventPhotoSettingsRow
        Insert: EventPhotoSettingsInsert
        Update: EventPhotoSettingsUpdate
        Relationships: []
      }
      event_photo_requests: {
        Row: EventPhotoRequestRow
        Insert: EventPhotoRequestInsert
        Update: EventPhotoRequestUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
