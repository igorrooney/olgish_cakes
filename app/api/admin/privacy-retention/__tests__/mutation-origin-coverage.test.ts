/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const mutationRoutes = [
  ['app/api/admin/privacy-retention/runs/route.ts', 1],
  ['app/api/admin/privacy-retention/runs/[runReference]/resume/route.ts', 1],
  ['app/api/admin/privacy-retention/review/route.ts', 1],
  ['app/api/admin/privacy-retention/holds/route.ts', 2],
  ['app/api/admin/privacy-retention/holds/recover-expired-claim/route.ts', 1],
  ['app/api/admin/privacy-retention/lifecycle-issues/event-photo/[id]/close/route.ts', 1],
  ['app/api/admin/enquiries/[type]/[id]/retention-lifecycle/route.ts', 1],
  ['app/api/admin/orders/[id]/retention-lifecycle/route.ts', 1],
  ['app/api/admin/enquiries/[type]/[id]/schedule-health-retention/route.ts', 1],
  ['app/api/admin/orders/[id]/schedule-health-retention/route.ts', 1],
  ['app/api/admin/enquiries/[type]/[id]/withdraw-health-consent/route.ts', 1],
  ['app/api/admin/orders/[id]/withdraw-health-consent/route.ts', 1]
] as const

describe('retention-related admin mutation origin coverage', () => {
  it.each(mutationRoutes)(
    'guards every exported mutation in %s',
    (relativePath, expectedGuardCount) => {
      const source = readFileSync(join(process.cwd(), relativePath), 'utf8')
      const guardCalls = source.match(/requireSameOriginMutation\(request\)/g) || []

      expect(guardCalls).toHaveLength(expectedGuardCount)
    }
  )
})
