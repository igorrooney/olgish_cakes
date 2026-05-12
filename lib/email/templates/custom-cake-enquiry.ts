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

const failureAlertScenarios = [
  {
    id: 'default',
    label: 'Custom enquiry failure alert (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'Custom Cake Enquiry Alert: Test Customer',
      productName: 'Custom Cake Enquiry Failure Alert',
      intro: 'A custom cake enquiry was saved, but one or more follow-up notifications failed.',
      message: 'Failed notifications: admin email',
      note: 'Enquiry saved in the database. Provider error: Transport did not accept admin email.'
    })
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
      heading: 'Custom cake enquiry received',
      intro: 'Thank you for your custom cake enquiry. I\'ve received your details and will check availability before getting back to you.',
      admin: false
    },
    customerScenarios
  ),
  'custom-cake-enquiry-failure-alert': createTemplateDefinition(
    {
      subject: 'Custom cake enquiry notification failure',
      heading: 'Custom cake enquiry notification failure',
      intro: 'A custom cake enquiry was saved, but one or more notification steps failed.',
      admin: true
    },
    failureAlertScenarios
  )
}
