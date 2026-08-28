import { NextRequest } from 'next/server'
import { handleBackupRequest } from '@/lib/security/backup-route'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  return handleBackupRequest(request, 'daily')
}

export async function POST(request: NextRequest) {
  return handleBackupRequest(request, 'daily')
}
