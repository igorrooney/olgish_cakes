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
  legal_hold?: boolean
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

export interface AdminLoginAttemptRow extends Record<string, unknown> {
  id: number
  key_hash: string
  failed_at: string
  cleared_at: string | null
}

export interface AdminLoginAttemptInsert extends Record<string, unknown> {
  id?: number
  key_hash: string
  failed_at?: string
  cleared_at?: string | null
}

export interface AdminLoginAttemptUpdate extends Record<string, unknown> {
  key_hash?: string
  failed_at?: string
  cleared_at?: string | null
}

export type EventPhotoRateLimitAction =
  | 'event-photo-upload-ip'
  | 'event-photo-request-ip'
  | 'event-photo-request-email'

export interface EventPhotoRateLimitAttemptRow extends Record<string, unknown> {
  id: number
  action: EventPhotoRateLimitAction
  key_hash: string
  attempted_at: string
}

export interface EventPhotoRateLimitAttemptInsert extends Record<string, unknown> {
  id?: number
  action: EventPhotoRateLimitAction
  key_hash: string
  attempted_at?: string
}

export interface EventPhotoRateLimitAttemptUpdate extends Record<string, unknown> {
  action?: EventPhotoRateLimitAction
  key_hash?: string
  attempted_at?: string
}

export interface Database {
  public: {
    Tables: {
      admin_login_attempts: {
        Row: AdminLoginAttemptRow
        Insert: AdminLoginAttemptInsert
        Update: AdminLoginAttemptUpdate
        Relationships: []
      }
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
      event_photo_rate_limit_attempts: {
        Row: EventPhotoRateLimitAttemptRow
        Insert: EventPhotoRateLimitAttemptInsert
        Update: EventPhotoRateLimitAttemptUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      claim_event_photo_temp_cleanup: {
        Args: {
          p_request_id: string
          p_cutoff: string
        }
        Returns: Array<{
          status: 'claimed' | 'busy' | 'skipped'
          claim_token: string | null
          temp_image_bucket: string | null
          temp_image_paths: string[]
        }>
      }
      begin_privacy_retention_external_deletion: {
        Args: {
          p_candidate_id: string
          p_claim_token: string
          p_bucket: string
          p_paths: string[]
        }
        Returns: boolean
      }
      release_privacy_retention_deletion_claim: {
        Args: {
          p_candidate_id: string
          p_claim_token: string
          p_error_code: string
        }
        Returns: boolean
      }
      finalize_event_photo_temp_cleanup: {
        Args: {
          p_request_id: string
          p_claim_token: string
        }
        Returns: Array<{
          status: 'deleted' | 'skipped'
          affected_count: number
          finalized_at: string
        }>
      }
      list_event_photo_cleanup_candidates: {
        Args: {
          p_cutoff: string
          p_limit: number
        }
        Returns: Array<{ id: string }>
      }
      claim_event_photo_orphan_cleanup_cursor: {
        Args: Record<string, never>
        Returns: Array<{
          status: 'claimed' | 'busy'
          cursor_token: string | null
          object_cursor: string | null
          lease_expires_at: string
        }>
      }
      finalize_event_photo_orphan_cleanup_cursor: {
        Args: {
          p_cursor_token: string
          p_object_cursor: string | null
        }
        Returns: boolean
      }
      release_event_photo_orphan_cleanup_cursor: {
        Args: { p_cursor_token: string }
        Returns: boolean
      }
      filter_referenced_event_photo_temp_paths: {
        Args: { p_paths: string[] }
        Returns: Array<{ temp_image_path: string }>
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
