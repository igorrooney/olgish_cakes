import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import {
  buildCustomerFooterHtml,
  createDefaultScenarioInput,
  createTemplateDefinition,
  EMAIL_FONT_DISPLAY,
  EMAIL_FONT_SANS,
  escapeHtml,
  formatLongDate,
  renderCustomerCard,
  renderEmailSpacer,
  toTrimmed,
  type CustomerEmailContent,
  type CustomerRow
} from './shared'

const addWorkshopCustomerRow = (
  rows: CustomerRow[],
  label: string,
  value: string | null | undefined
) => {
  const trimmedValue = toTrimmed(value)
  if (trimmedValue.length === 0) {
    return
  }

  rows.push({
    label,
    value: trimmedValue
  })
}

const resolveWorkshopNextSteps = (input: EmailTemplateCommonInput): string[] => {
  if (Array.isArray(input.nextSteps)) {
    return input.nextSteps
  }

  return [
    'We will review the date and location details first.',
    'If the workshop format is a fit, we will come back with the next practical steps.'
  ]
}

const renderWorkshopNextStepsHtml = (steps: string[]) => {
  if (steps.length === 0) {
    return ''
  }

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ECECF9" style="background-color: #ECECF9; border: 1px solid #B1B3E7; border-radius: 10px; border-collapse: separate;"><tr><td style="padding: 22px 24px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding: 0 0 14px 0; color: #2E3192; font-family: ${EMAIL_FONT_DISPLAY}; font-size: 16px; font-weight: 700; line-height: 22px; text-transform: uppercase;">What happens next?</td></tr>${steps.map((step) => `<tr><td style="padding: 0 0 9px 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 15px; line-height: 23px;">&bull;&nbsp;${escapeHtml(step)}</td></tr>`).join('')}</table></td></tr></table>${renderEmailSpacer(20)}`
}

const buildWorkshopCustomerContent = (input: EmailTemplateCommonInput): CustomerEmailContent => {
  const summaryRows: CustomerRow[] = []
  const detailRows: CustomerRow[] = []
  const nextSteps = resolveWorkshopNextSteps(input)

  addWorkshopCustomerRow(summaryRows, 'Product', input.productName)
  addWorkshopCustomerRow(summaryRows, 'Preferred date', formatLongDate(input.dateNeeded))
  addWorkshopCustomerRow(detailRows, 'Occasion', input.occasion)
  addWorkshopCustomerRow(detailRows, 'Design type', input.designType)
  addWorkshopCustomerRow(detailRows, 'Group size', input.servings)
  addWorkshopCustomerRow(detailRows, 'Location', input.deliveryAddress)
  addWorkshopCustomerRow(detailRows, 'Event brief', input.customerMessage)

  const summaryText = summaryRows.length > 0
    ? `Workshop enquiry summary\n${summaryRows.map((row) => `- ${row.label}: ${row.value}`).join('\n')}`
    : ''
  const detailsText = detailRows.length > 0
    ? `Workshop details\n${detailRows.map((row) => `- ${row.label}: ${row.value}`).join('\n')}`
    : ''
  const nextStepsText = nextSteps.length > 0
    ? `What happens next?\n${nextSteps.map((step) => `- ${step}`).join('\n')}`
    : ''

  return {
    bodyText: [summaryText, detailsText, nextStepsText]
      .filter((section) => section.length > 0)
      .join('\n\n'),
    bodyHtml: [
      renderCustomerCard('Workshop enquiry summary', summaryRows),
      renderCustomerCard('Workshop details', detailRows),
      renderWorkshopNextStepsHtml(nextSteps),
      buildCustomerFooterHtml(input)
    ].join('')
  }
}

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
      intro: 'Thank you for your workshop enquiry. We will review the details and come back to you shortly.',
      admin: false
    },
    customerScenarios,
    {
      customerContentBuilder: buildWorkshopCustomerContent
    }
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
