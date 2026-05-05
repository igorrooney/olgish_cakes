import { NextResponse } from 'next/server'

export function POST() {
  return NextResponse.json(
    {
      error: 'This quote endpoint is retired. Use /api/custom-cake-enquiry.'
    },
    {
      status: 410,
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  )
}
