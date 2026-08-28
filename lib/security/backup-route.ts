import 'server-only'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminOrCronRequestAuthorized } from './internal-route-auth'
import { privateJsonResponse } from './internal-route'
import { toSafeOperationalError } from './safe-operational-error'

export type BackupFrequency = 'daily' | 'weekly' | 'monthly'

const backupTimeoutMs = 10 * 60 * 1000

function runBackup(frequency: BackupFrequency): void {
  const schedulerPath = path.join(
    process.cwd(),
    'scripts',
    'backup-scheduler-simple.js'
  )

  execFileSync(
    process.execPath,
    [schedulerPath, '--run', frequency],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: backupTimeoutMs,
      windowsHide: true
    }
  )
}

export async function handleBackupRequest(
  request: NextRequest,
  frequency: BackupFrequency
): Promise<NextResponse> {
  if (!(await isAdminOrCronRequestAuthorized(request))) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    runBackup(frequency)

    return privateJsonResponse({
      success: true,
      type: frequency,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const safeError = toSafeOperationalError(error)

    console.error('Backup operation failed', {
      operation: `backup-${frequency}`,
      ...safeError
    })

    return privateJsonResponse({
      success: false,
      error: 'Backup operation failed',
      code: safeError.code
    }, 500)
  }
}
