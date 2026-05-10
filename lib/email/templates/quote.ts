import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { createDefaultScenarioInput, createTemplateDefinition } from './shared'

const quoteScenarios = [
  {
    id: 'default',
    label: 'Quote request (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'Quote Request: Test Customer - Birthday Kyiv Cake'
    })
  },
  {
    id: 'minimal',
    label: 'Quote request (minimal)',
    input: {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+44 7123 456789',
      productName: 'Custom Cake',
      occasion: 'Birthday',
      dateNeeded: '2026-03-15',
      customerMessage: 'Simple design required.'
    }
  }
]

export const quoteTemplateDefinitions: Record<string, TemplateDefinition<EmailTemplateCommonInput>> = {
  'quote-admin-request': createTemplateDefinition(
    {
      subject: 'New custom cake quote request',
      heading: 'New custom cake quote request',
      intro: 'A customer submitted a quote request.',
      admin: true
    },
    quoteScenarios
  )
}