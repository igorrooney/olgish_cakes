import { NextResponse } from 'next/server'

import { getEventPhotoSettings } from '@/lib/settings'

export async function GET(): Promise<NextResponse> {
  const settings = await getEventPhotoSettings()

  return NextResponse.json(settings)
}
