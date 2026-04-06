import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { createDefaultScenarioInput, createTemplateDefinition } from './shared'

const adminScenarios = [
  {
    id: 'default',
    label: 'Workshop enquiry admin (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'Workshop Enquiry: Test Customer',
      productName: 'Cake Decorating Workshop',
      productType: 'workshop',
      orderType: 'workshop-enquiry',
      occasion: 'Corporate event',
      servings: '18 guests',
      customerMessage: 'Office team social in central London. We would like a relaxed floral theme.'
    })
  }
]

const customerScenarios = [
  {
    id: 'default',
    label: 'Workshop enquiry customer (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'Cake decorating workshop enquiry received',
      productName: 'Cake Decorating Workshop',
      productType: 'workshop',
      orderType: 'workshop-enquiry',
      occasion: 'Hen party',
      servings: '12 guests',
      customerMessage: 'Private event in London with a simple, elegant decoration style.'
    })
  }
]

const failureAlertScenarios = [
  {
    id: 'default',
    label: 'Workshop enquiry failure alert (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'Workshop Enquiry Alert: Test Customer',
      productName: 'Cake Decorating Workshop',
      productType: 'workshop',
      orderType: 'workshop-enquiry',
      occasion: 'Corporate event',
      servings: '18 guests',
      customerMessage: 'Office team social in central London. We would like a relaxed floral theme.',
      message: 'Failed notifications:\nadmin-email: Transport did not accept admin email',
      note: 'The enquiry was saved in the database successfully. Review notification logs and follow up manually if needed.'
    })
  }
]

export const workshopTemplateDefinitions: Record<string, TemplateDefinition<EmailTemplateCommonInput>> = {
  'workshop-enquiry-admin': createTemplateDefinition(
    {
      subject: 'New workshop enquiry',
      heading: 'New workshop enquiry',
      intro: 'A customer submitted a cake decorating workshop enquiry.',
      admin: true
    },
    adminScenarios
  ),
  'workshop-enquiry-customer': createTemplateDefinition(
    {
      subject: 'Workshop enquiry received',
      heading: 'Workshop enquiry received',
      intro: 'Thank you for your workshop enquiry. I will review the details and come back to you shortly.',
      admin: false
    },
    customerScenarios
  ),
  'workshop-enquiry-failure-alert': createTemplateDefinition(
    {
      subject: 'Workshop enquiry notification failure',
      heading: 'Workshop enquiry notification failure',
      intro: 'A workshop enquiry was saved, but one or more notification steps failed.',
      admin: true
    },
    failureAlertScenarios
  )
}
