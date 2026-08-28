import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationPath = resolve(
  process.cwd(),
  '../../supabase/migrations/20260825160000_bound_event_photo_cleanup.sql'
)
const migration = readFileSync(migrationPath, 'utf8')

const tableDefinition = (tableName: string): string => {
  const match = migration.match(new RegExp(
    `create table if not exists public\\.${tableName} \\(\\s*([\\s\\S]*?)\\n\\);`,
    'i'
  ))

  if (!match?.[1]) {
    throw new Error(`Missing ${tableName} table definition`)
  }

  return match[1]
}

describe('bounded event-photo cleanup migration', () => {
  it('schedules a small fair ID-only candidate batch before returning it', () => {
    expect(migration).toMatch(/returns table \(id uuid\)/i)
    expect(migration).toMatch(/p_limit not between 1 and 50/i)
    expect(migration).toMatch(/pg_advisory_xact_lock[\s\S]*event-photo-cleanup-candidate-scheduler/i)
    expect(migration).toMatch(/order by[\s\S]*schedule\.next_attempt_at[\s\S]*request\.created_at[\s\S]*request\.id/i)
    expect(migration).toMatch(/limit p_limit[\s\S]*for update of request skip locked/i)
    expect(migration).toMatch(/selection_time \+ interval '15 minutes'/i)
    expect(migration).toMatch(/request\.legal_hold = false/i)
    expect(migration).toMatch(/request\.files_deleted_at is null/i)

    const schedule = tableDefinition('event_photo_cleanup_candidate_schedule')
    expect(schedule).toContain('request_id uuid primary key')
    expect(schedule).not.toMatch(/email|health|message|filename|temp_image_path/i)
  })

  it('persists bounded opaque Storage V2 cursors rather than mutable offsets', () => {
    const cursor = tableDefinition('event_photo_orphan_cleanup_cursor')

    expect(cursor).toContain('object_cursor text')
    expect(cursor).toContain('char_length(object_cursor) between 1 and 4096')
    expect(cursor).not.toMatch(/top_level_offset|file_offset|current_prefix/i)
    expect(cursor).not.toMatch(/email|health|message|filename|temp_image_path/i)
    expect(migration).toMatch(/where singleton = true\s+and lease_token = p_cursor_token/i)
  })

  it('filters only the supplied bounded path page before deletion', () => {
    expect(migration).toMatch(/array_length\(p_paths, 1\), 0\) not between 1 and 100/i)
    expect(migration).toMatch(/referenced\.path = any\(p_paths\)/i)
    expect(migration).toMatch(/char_length\(supplied\.path\) not between 1 and 1024/i)
    expect(migration).toMatch(/supplied\.path !~ '\^incoming\/\[\^\/\]\.\*\$'/i)
  })

  it('keeps tables and operations service-role-only behind RLS', () => {
    expect(migration).toMatch(/alter table public\.event_photo_cleanup_candidate_schedule enable row level security/i)
    expect(migration).toMatch(/alter table public\.event_photo_orphan_cleanup_cursor enable row level security/i)
    expect(migration).toMatch(/revoke all on table public\.event_photo_cleanup_candidate_schedule\s+from public, anon, authenticated/i)
    expect(migration).toMatch(/revoke all on table public\.event_photo_orphan_cleanup_cursor\s+from public, anon, authenticated/i)

    for (const signature of [
      'list_event_photo_cleanup_candidates\\(timestamptz, integer\\)',
      'claim_event_photo_orphan_cleanup_cursor\\(\\)',
      'finalize_event_photo_orphan_cleanup_cursor\\(uuid, text\\)',
      'release_event_photo_orphan_cleanup_cursor\\(uuid\\)',
      'filter_referenced_event_photo_temp_paths\\(text\\[\\]\\)'
    ]) {
      expect(migration).toMatch(new RegExp(
        `revoke all on function public\\.${signature}\\s+from public, anon, authenticated`,
        'i'
      ))
      expect(migration).toMatch(new RegExp(
        `grant execute on function public\\.${signature}\\s+to service_role`,
        'i'
      ))
    }
  })
})
