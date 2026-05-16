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

const cakesByPostStatusScenarioMap: Record<string, string> = {
  confirmed: 'cakes-by-post-confirmed',
  'in-progress': 'cakes-by-post-in-progress',
  ready: 'cakes-by-post-ready',
  'out-for-delivery': 'cakes-by-post-out-for-delivery',
  'out-delivery': 'cakes-by-post-out-for-delivery',
  delivered: 'cakes-by-post-delivered',
  completed: 'cakes-by-post-completed',
  cancelled: 'cakes-by-post-cancelled',
  canceled: 'cakes-by-post-cancelled'
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

function resolveCakesByPostStatusScenarioId(rawInput: unknown): string | undefined {
  if (!isObjectRecord(rawInput)) {
    return undefined
  }

  const rawStatus = rawInput.status
  if (typeof rawStatus !== 'string') {
    return undefined
  }

  const normalized = rawStatus.trim().toLowerCase()
  return cakesByPostStatusScenarioMap[normalized]
}

function resolveBaseScenarioId<T extends EmailTemplateId>(
  templateId: T,
  scenarioId: string | undefined,
  rawInput: unknown
): string | undefined {
  if (templateId === 'orders-status-update') {
    if (scenarioId?.startsWith('cakes-by-post')) {
      return resolveCakesByPostStatusScenarioId(rawInput) ?? scenarioId
    }

    return resolveStatusScenarioId(rawInput) ?? scenarioId
  }

  return scenarioId
}

function resolveCourierLabel(value: unknown): string {
  return value === 'evri' ? 'Evri' : 'Royal Mail'
}

function withDerivedCakesByPostCourierMessage(input: UnknownRecord): UnknownRecord {
  const productType = typeof input.productType === 'string' ? input.productType : ''
  const status = typeof input.status === 'string' ? input.status.trim().toLowerCase() : ''

  if (productType !== 'gift-hamper' || status !== 'out-for-delivery') {
    return input
  }

  const courierLabel = resolveCourierLabel(input.deliveryCourier)

  return {
    ...input,
    statusMessage: input.trackingNumber
      ? `Great news, your cakes by post order has been dispatched with ${courierLabel}.`
      : `Great news, your cakes by post order has been dispatched with ${courierLabel} and is on the way.`
  }
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

  return parseTemplateInput(params.templateId, withDerivedCakesByPostCourierMessage(mergedInput))
}
