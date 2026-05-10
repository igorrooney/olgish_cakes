import type { EmailRenderInputMap, EmailTemplateId, TemplateDefinition } from '../types'
import { contactTemplateDefinitions } from './contact'
import { customCakeTemplateDefinitions } from './custom-cake-enquiry'
import { ordersTemplateDefinitions } from './orders'
import { quoteTemplateDefinitions } from './quote'
import { workshopTemplateDefinitions } from './workshop-enquiry'
import { instagramTokenTemplateDefinitions } from './instagram-token'

const definitions = {
  ...contactTemplateDefinitions,
  ...ordersTemplateDefinitions,
  ...quoteTemplateDefinitions,
  ...customCakeTemplateDefinitions,
  ...workshopTemplateDefinitions,
  ...instagramTokenTemplateDefinitions
}

export type EmailTemplateRegistry = {
  [K in EmailTemplateId]: TemplateDefinition<EmailRenderInputMap[K]>
}

export const templateRegistry = definitions as EmailTemplateRegistry

export function getTemplateDefinition<T extends EmailTemplateId>(templateId: T): TemplateDefinition<EmailRenderInputMap[T]> {
  return templateRegistry[templateId]
}

export function getTemplateScenarioInput<T extends EmailTemplateId>(
  templateId: T,
  scenarioId?: string
): EmailRenderInputMap[T] {
  const definition = getTemplateDefinition(templateId)
  const matchedScenario = definition.scenarios.find((scenario) => scenario.id === scenarioId)
  const defaultScenario = matchedScenario ?? definition.scenarios[0]

  if (!defaultScenario) {
    return {} as EmailRenderInputMap[T]
  }

  return {
    ...defaultScenario.input
  } as EmailRenderInputMap[T]
}
