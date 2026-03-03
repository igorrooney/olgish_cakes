import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { createDefaultScenarioInput, createTemplateDefinition } from './shared'

const adminScenarios = [
  {
    id: 'default',
    label: 'Custom enquiry admin (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'Custom Cake Enquiry: Test Customer',
      productName: 'Custom Cake Enquiry',
      attachmentNames: ['reference.jpg']
    })
  }
]

const customerScenarios = [
  {
    id: 'default',
    label: 'Custom enquiry customer (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'Thank you for your custom cake enquiry',
      productName: 'Custom Cake Enquiry',
      attachmentNames: ['reference.jpg']
    })
  },
  {
    id: 'minimal',
    label: 'Custom enquiry customer (minimal)',
    input: {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      occasion: 'Birthday',
      customerMessage: 'Need a custom cake with floral style.'
    }
  }
]

export const customCakeTemplateDefinitions: Record<string, TemplateDefinition<EmailTemplateCommonInput>> = {
  'custom-cake-enquiry-admin': createTemplateDefinition(
    {
      subject: 'New custom cake enquiry',
      heading: 'New custom cake enquiry',
      intro: 'A customer submitted a custom cake enquiry.',
      admin: true
    },
    adminScenarios
  ),
  'custom-cake-enquiry-customer': createTemplateDefinition(
    {
      subject: 'Custom cake enquiry received',
      heading: 'Enquiry received',
      intro: 'Thank you for your custom cake enquiry.',
      admin: false
    },
    customerScenarios
  )
}