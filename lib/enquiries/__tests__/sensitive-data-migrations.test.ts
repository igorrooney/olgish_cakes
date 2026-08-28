/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const migrationsDirectory = join(process.cwd(), 'supabase', 'migrations')

const consentMigration = readFileSync(
  join(migrationsDirectory, '20260729120000_add_sensitive_data_consent_evidence.sql'),
  'utf8'
)
const withdrawalMigration = readFileSync(
  join(migrationsDirectory, '20260730120000_add_sensitive_data_withdrawal_evidence.sql'),
  'utf8'
)

const enquiryTables = [
  'contact_enquiries',
  'custom_cake_enquiries',
  'workshop_enquiries'
]

describe('sensitive-data enquiry migrations', () => {
  it('applies consent evidence before withdrawal evidence', () => {
    expect(20260729120000).toBeLessThan(20260730120000)

    for (const table of enquiryTables) {
      expect(consentMigration).toContain(`alter table public.${table}`)
      expect(consentMigration).toContain(`add column if not exists dietary_health_consent boolean not null default false`)
    }
  })

  it('defines never-supplied, active-consent and withdrawn states for every enquiry table', () => {
    for (const table of enquiryTables) {
      expect(withdrawalMigration).toContain(`alter table public.${table}`)
      expect(withdrawalMigration).toContain('add column if not exists dietary_health_withdrawn_at timestamptz')
      expect(withdrawalMigration).toContain(`${table}_sensitive_data_consent_check`)
    }

    expect(withdrawalMigration).toContain('dietary_health_information is null')
    expect(withdrawalMigration).toContain('dietary_health_consent = false')
    expect(withdrawalMigration).toContain('dietary_health_information is not null')
    expect(withdrawalMigration).toContain('dietary_health_consent = true')
    expect(withdrawalMigration).toContain('dietary_health_withdrawn_at is null')
    expect(withdrawalMigration).toContain('dietary_health_withdrawn_at is not null')
    expect(withdrawalMigration).toContain('dietary_health_withdrawn_at >= dietary_health_consented_at')
  })
})
