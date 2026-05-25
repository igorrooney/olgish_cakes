import { NextResponse } from 'next/server'

export function jsonError(message: string, status = 400): NextResponse<{ error: string }> {
  return NextResponse.json({ error: message }, { status })
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json() as unknown
  } catch {
    return null
  }
}
