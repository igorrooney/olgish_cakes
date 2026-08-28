import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextRequest } from 'next/server'
import { isAdminOrCronRequestAuthorized } from '@/lib/security/internal-route-auth'
import { privateJsonResponse } from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

interface LatestBackupStatus {
  sizeKilobytes: number
  createdAt: string
}

interface BackupDirectoryStatus {
  available: boolean
  totalBackups: number
  totalReports: number
  latestBackup: LatestBackupStatus | null
}

const backupDirectories = ['daily', 'weekly', 'monthly', 'manual'] as const

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function getDirectoryStatus(
  directory: typeof backupDirectories[number]
): Promise<BackupDirectoryStatus> {
  const directoryPath = path.join(process.cwd(), 'backups', directory)

  try {
    const files = await fs.readdir(directoryPath)
    const backupFiles = files.filter((file) => file.includes('sanity-backup-'))
    const reportFiles = files.filter((file) => file.includes('backup-report-'))
    const backupStats = await Promise.all(
      backupFiles.map(async (file) => {
        const fileStats = await fs.stat(path.join(directoryPath, file))

        return {
          sizeKilobytes: Math.round(fileStats.size / 1024),
          createdAt: fileStats.mtime.toISOString(),
          modifiedAtMs: fileStats.mtimeMs
        }
      })
    )
    const latestBackup = backupStats
      .sort((left, right) => right.modifiedAtMs - left.modifiedAtMs)[0]

    return {
      available: true,
      totalBackups: backupFiles.length,
      totalReports: reportFiles.length,
      latestBackup: latestBackup
        ? {
            sizeKilobytes: latestBackup.sizeKilobytes,
            createdAt: latestBackup.createdAt
          }
        : null
    }
  } catch {
    return {
      available: false,
      totalBackups: 0,
      totalReports: 0,
      latestBackup: null
    }
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdminOrCronRequestAuthorized(request))) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    const directoryStatuses = await Promise.all(
      backupDirectories.map(async (directory) => [
        directory,
        await getDirectoryStatus(directory)
      ] as const)
    )

    return privateJsonResponse({
      timestamp: new Date().toISOString(),
      backups: Object.fromEntries(directoryStatuses)
    })
  } catch (error) {
    const safeError = toSafeOperationalError(error)

    console.error('Backup status operation failed', {
      operation: 'backup-status',
      ...safeError
    })

    return privateJsonResponse({
      success: false,
      error: 'Backup status unavailable',
      code: safeError.code
    }, 500)
  }
}
