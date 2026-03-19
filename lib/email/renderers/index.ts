import type {
  EmailRenderInputMap,
  EmailTemplateId,
  RenderedEmail
} from '../types'
import { emailTemplateIds } from '../types'
import { buildTemplateScenarioInput } from '../scenarios'
import { getTemplateDefinition } from '../templates/registry'

export function isEmailTemplateId(value: string): value is EmailTemplateId {
  return emailTemplateIds.some((templateId) => templateId === value)
}

export function parseTemplateInput<T extends EmailTemplateId>(
  templateId: T,
  input: unknown
): EmailRenderInputMap[T] {
  const definition = getTemplateDefinition(templateId)
  return definition.schema.parse(input) as EmailRenderInputMap[T]
}

export function renderEmailTemplate<T extends EmailTemplateId>(
  templateId: T,
  input: EmailRenderInputMap[T]
): RenderedEmail {
  const definition = getTemplateDefinition(templateId)
  const rendered = definition.build(input)

  return {
    ...rendered,
    metadata: {
      ...rendered.metadata,
      templateId,
      generatedAt: new Date().toISOString()
    }
  }
}

export function buildTemplateExampleInput(templateId: EmailTemplateId) {
  return buildTemplateScenarioInput(templateId)
}

export function listTemplateScenarios(templateId: EmailTemplateId) {
  const definition = getTemplateDefinition(templateId)
  return definition.scenarios.map((scenario) => ({
    id: scenario.id,
    label: scenario.label
  }))
}