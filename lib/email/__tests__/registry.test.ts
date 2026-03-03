/**
 * @jest-environment node
 */
import { emailTemplateIds } from '../types'
import { parseTemplateInput, renderEmailTemplate } from '../renderers'
import { buildTemplateScenarioInput } from '../scenarios'
import { templateRegistry } from '../templates/registry'

describe('email template registry', () => {
  it('registers every template id with schema, builder, and scenarios', () => {
    emailTemplateIds.forEach((templateId) => {
      const definition = templateRegistry[templateId]

      expect(definition).toBeDefined()
      expect(typeof definition.build).toBe('function')
      expect(definition.schema).toBeDefined()
      expect(definition.scenarios.length).toBeGreaterThan(0)
    })
  })

  it('renders each template from its default scenario input', () => {
    emailTemplateIds.forEach((templateId) => {
      const scenarioInput = buildTemplateScenarioInput(templateId)
      const parsedInput = parseTemplateInput(templateId, scenarioInput)
      const rendered = renderEmailTemplate(templateId, parsedInput)

      expect(rendered.subject.length).toBeGreaterThan(0)
      expect(rendered.text.length).toBeGreaterThan(0)
      expect(rendered.html.length).toBeGreaterThan(0)
      expect(rendered.metadata?.templateId).toBe(templateId)
    })
  })
})
