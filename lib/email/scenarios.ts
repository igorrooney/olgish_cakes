import type { EmailRenderInputMap, EmailTemplateId } from './types'
import { getTemplateDefinition, getTemplateScenarioInput } from './templates/registry'

export interface EmailScenarioOption {
  id: string
  label: string
}

export function listTemplateScenarioOptions(templateId: EmailTemplateId): EmailScenarioOption[] {
  const definition = getTemplateDefinition(templateId)
  return definition.scenarios.map((scenario) => ({
    id: scenario.id,
    label: scenario.label
  }))
}

export function buildTemplateScenarioInput<T extends EmailTemplateId>(templateId: T, scenarioId?: string): EmailRenderInputMap[T] {
  return getTemplateScenarioInput(templateId, scenarioId)
}
