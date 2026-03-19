import { parseTemplateInput } from './renderers'
import { buildTemplateScenarioInput } from './scenarios'
import type { EmailRenderInputMap, EmailTemplateId } from './types'

const statusScenarioMap: Record<string, string> = {
  confirmed: 'confirmed',
  'in-progress': 'in-progress',
  ready: 'ready',
  'ready-pickup': 'ready',
  'out-for-delivery': 'out-for-delivery',
  'out-delivery': 'out-for-delivery',
  delivered: 'delivered',
  completed: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled'
}

type UnknownRecord = Record<string, unknown>

function isObjectRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function resolveStatusScenarioId(rawInput: unknown): string | undefined {
  if (!isObjectRecord(rawInput)) {
    return undefined
  }

  const rawStatus = rawInput.status
  if (typeof rawStatus !== 'string') {
    return undefined
  }

  const normalized = rawStatus.trim().toLowerCase()
  return statusScenarioMap[normalized]
}

function resolveBaseScenarioId<T extends EmailTemplateId>(
  templateId: T,
  scenarioId: string | undefined,
  rawInput: unknown
): string | undefined {
  if (templateId === 'orders-status-update') {
    return resolveStatusScenarioId(rawInput) ?? scenarioId
  }

  return scenarioId
}

interface BuildEffectiveTemplateInputParams<T extends EmailTemplateId> {
  templateId: T
  scenarioId?: string
  rawInput?: unknown
}

export function buildEffectiveTemplateInput<T extends EmailTemplateId>(
  params: BuildEffectiveTemplateInputParams<T>
): EmailRenderInputMap[T] {
  const baseScenarioId = resolveBaseScenarioId(params.templateId, params.scenarioId, params.rawInput)
  const baseInput = buildTemplateScenarioInput(params.templateId, baseScenarioId)

  if (params.rawInput === undefined) {
    return parseTemplateInput(params.templateId, baseInput)
  }

  if (!isObjectRecord(params.rawInput)) {
    return parseTemplateInput(params.templateId, params.rawInput)
  }

  const mergedInput: UnknownRecord = {
    ...(baseInput as UnknownRecord),
    ...params.rawInput
  }

  return parseTemplateInput(params.templateId, mergedInput)
}
