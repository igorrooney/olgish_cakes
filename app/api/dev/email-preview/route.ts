import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  isEmailTemplateId,
  renderEmailTemplate
} from '@/lib/email/renderers'
import { buildEffectiveTemplateInput } from '@/lib/email/dev-input'
import { verifyAdminAuthToken } from '@/lib/admin/auth-token'

const previewRequestSchema = z.object({
  templateId: z.string(),
  input: z.unknown().optional(),
  scenarioId: z.string().optional()
})

function getAdminAuthToken(request: NextRequest): string {
  return request.cookies.get('admin_auth_token')?.value?.trim() || ''
}

export async function POST(request: NextRequest) {
  try {
    const token = getAdminAuthToken(request)
    const isAuthorized = await verifyAdminAuthToken(token)

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = previewRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const templateId = parsed.data.templateId
    if (!isEmailTemplateId(templateId)) {
      return NextResponse.json(
        { error: `Unsupported templateId: ${templateId}` },
        { status: 400 }
      )
    }

    const input = buildEffectiveTemplateInput({
      templateId,
      scenarioId: parsed.data.scenarioId,
      rawInput: parsed.data.input
    })

    const rendered = renderEmailTemplate(templateId, input)

    return NextResponse.json({
      templateId,
      scenarioId: parsed.data.scenarioId || null,
      input,
      rendered
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid template input',
          details: error.flatten()
        },
        { status: 400 }
      )
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON payload'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to render preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
