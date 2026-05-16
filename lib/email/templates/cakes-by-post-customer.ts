import type { EmailTemplateCommonInput } from '../types'
import {
  buildCompletedReviewHtml,
  buildCompletedReviewText,
  buildCustomerFooterHtml,
  EMAIL_FONT_DISPLAY,
  EMAIL_FONT_SANS,
  escapeHtml,
  formatCurrency,
  formatDate,
  formatPhoneDisplay,
  renderCustomerCard,
  renderEmailSpacer,
  toTrimmed,
  type CustomerEmailContentBuilder,
  type CustomerRow
} from './shared'

type DeliveryCourier = 'royal-mail' | 'evri'

interface DeliveryCourierMeta {
  label: string
  trackingNextStep: string
  trackingUrl: (trackingNumber: string) => string
}

const deliveryCourierMeta: Record<DeliveryCourier, DeliveryCourierMeta> = {
  'royal-mail': {
    label: 'Royal Mail',
    trackingNextStep: 'Royal Mail will update the tracking as your parcel moves through their network.',
    trackingUrl: (trackingNumber) => `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(trackingNumber)}`
  },
  evri: {
    label: 'Evri',
    trackingNextStep: 'Evri will update the tracking as your parcel moves through their network.',
    trackingUrl: (trackingNumber) => `https://www.evri.com/track/parcel/${encodeURIComponent(trackingNumber)}/details`
  }
}

export function isCakesByPostCustomerEmail(input: EmailTemplateCommonInput): boolean {
  return input.productType === 'gift-hamper'
}

function cakesByPostNextSteps(): string[] {
  return [
    'We\'ll review your order and delivery details within 24 hours',
    'If everything is confirmed, we\'ll send you a secure payment link',
    'Once payment is received, we\'ll prepare, pack, and send your cake by post'
  ]
}

function row(rows: CustomerRow[], label: string, value: string | null | undefined) {
  const trimmed = toTrimmed(value)
  if (trimmed.length === 0) {
    return
  }

  rows.push({ label, value: trimmed })
}

function linkedRow(rows: CustomerRow[], label: string, value: string | null | undefined, href: string | undefined) {
  const trimmed = toTrimmed(value)
  if (trimmed.length === 0) {
    return
  }

  rows.push({ label, value: trimmed, href })
}

function getCourierMeta(value: string | null | undefined): DeliveryCourierMeta {
  const normalized = toTrimmed(value).toLowerCase()

  if (normalized === 'evri') {
    return deliveryCourierMeta.evri
  }

  return deliveryCourierMeta['royal-mail']
}

function formatLabel(value: string | null | undefined): string {
  const raw = toTrimmed(value)
  if (raw.length === 0) {
    return ''
  }

  return raw
    .split(/[-_\s]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ')
}

function formatDeliveryMethod(value: string | null | undefined): string {
  const raw = toTrimmed(value).toLowerCase()

  if (raw === 'postal' || raw === 'postal-delivery') {
    return 'By post'
  }

  return formatLabel(value)
}

function buildContactRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []

  row(rows, 'Name', input.customerName)
  row(rows, 'Email', input.customerEmail)
  row(rows, 'Phone', formatPhoneDisplay(input.customerPhone))
  row(rows, 'Address', input.address)
  row(rows, 'City', input.city)
  row(rows, 'Postcode', input.postcode)

  return rows
}

function buildSummaryRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []

  row(rows, 'Order Number', input.orderNumber)
  row(rows, 'Product', input.productName)
  row(rows, 'Quantity', input.quantity ? String(input.quantity) : undefined)
  row(rows, 'Date needed', formatDate(input.dateNeeded))
  row(rows, 'Total Amount', formatCurrency(input.totalPrice))

  return rows
}

function buildGiftRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []

  row(rows, 'Occasion', input.occasion)
  row(rows, 'Gift note', input.giftNote)

  return rows
}

function buildCustomerNotesRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []

  if (!isLegacyProductMetadata(input.customerMessage)) {
    row(rows, 'Notes', input.customerMessage)
  }

  return rows
}

function isLegacyProductMetadata(value: string | null | undefined): boolean {
  const raw = toTrimmed(value)
  if (raw.length === 0) {
    return false
  }

  const normalized = raw.toLowerCase()
  return normalized.includes('product type: gift-hamper') && normalized.includes('price:')
}

function renderRowsText(title: string, rows: CustomerRow[]): string {
  if (rows.length === 0) {
    return ''
  }

  const lines = rows.flatMap((entry) => {
    const rowLines = [`- ${entry.label}: ${entry.value}`]

    if (entry.href) {
      rowLines.push(`- Track your parcel: ${entry.href}`)
    }

    return rowLines
  })

  return `${title}\n${lines.join('\n')}`
}

function buildNextStepsText(): string {
  return `What happens next?\n${cakesByPostNextSteps().map((step) => `- ${step}`).join('\n')}`
}

function buildNextStepsHtml(): string {
  const rows = cakesByPostNextSteps()
    .map((step) => `<tr><td style="padding: 0 0 9px 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 15px; line-height: 23px;">&bull;&nbsp;${escapeHtml(step)}</td></tr>`)
    .join('')

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ECECF9" style="background-color: #ECECF9; border: 1px solid #B1B3E7; border-radius: 10px; border-collapse: separate;"><tr><td style="padding: 22px 24px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding: 0 0 14px 0; color: #2E3192; font-family: ${EMAIL_FONT_DISPLAY}; font-size: 16px; font-weight: 700; line-height: 22px; text-transform: uppercase;">What happens next?</td></tr>${rows}</table></td></tr></table>${renderEmailSpacer(20)}`
}

function buildStatusDeliveryRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []
  const courier = getCourierMeta(input.deliveryCourier)
  const normalizedStatus = toTrimmed(input.status).toLowerCase()
  const courierValue = toTrimmed(input.deliveryCourier)
  const trackingNumber = toTrimmed(input.trackingNumber)

  row(rows, 'Delivery method', formatDeliveryMethod(input.deliveryMethod))
  if (courierValue.length > 0 || trackingNumber.length > 0 || normalizedStatus === 'out-for-delivery') {
    row(rows, 'Courier', courier.label)
  }
  row(rows, 'Delivery address', input.deliveryAddress)
  linkedRow(
    rows,
    'Tracking number',
    trackingNumber,
    trackingNumber ? courier.trackingUrl(trackingNumber) : undefined
  )

  return rows
}

function buildStatusNextStep(input: EmailTemplateCommonInput): string {
  const normalizedStatus = toTrimmed(input.status).toLowerCase()
  const normalizedPaymentStatus = toTrimmed(input.paymentStatus).toLowerCase()

  if (normalizedStatus === 'confirmed' && normalizedPaymentStatus !== 'paid') {
    return 'We\'ll send your secure payment link next. Once payment is received, we\'ll prepare, pack, and send your cake by post.'
  }

  if (normalizedStatus === 'confirmed') {
    return 'We\'ll prepare, pack, and send your cake by post.'
  }

  if (normalizedStatus === 'in-progress') {
    return 'We\'ll prepare and pack your cake, then send another update when it is ready for dispatch.'
  }

  if (normalizedStatus === 'out-for-delivery') {
    const courier = getCourierMeta(input.deliveryCourier)

    return input.trackingNumber
      ? courier.trackingNextStep
      : `Your order has been posted with ${courier.label} and is on the way.`
  }

  if (normalizedStatus === 'delivered') {
    return 'If anything doesn\'t look right, please contact us today and we\'ll help.'
  }

  if (normalizedStatus === 'completed') {
    return ''
  }

  if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
    return 'If you have any questions, please reply to this email or call us.'
  }

  return toTrimmed(input.statusMessage)
}

function buildStatusNextStepText(input: EmailTemplateCommonInput): string {
  const nextStep = buildStatusNextStep(input)

  return nextStep.length > 0 ? `Next step\n- ${nextStep}` : ''
}

function buildStatusNextStepHtml(input: EmailTemplateCommonInput): string {
  const nextStep = buildStatusNextStep(input)

  if (nextStep.length === 0) {
    return ''
  }

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ECECF9" style="background-color: #ECECF9; border: 1px solid #B1B3E7; border-radius: 10px; border-collapse: separate;"><tr><td style="padding: 22px 24px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding: 0 0 14px 0; color: #2E3192; font-family: ${EMAIL_FONT_DISPLAY}; font-size: 16px; font-weight: 700; line-height: 22px; text-transform: uppercase;">Next step</td></tr><tr><td style="padding: 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 15px; line-height: 23px;">${escapeHtml(nextStep)}</td></tr></table></td></tr></table>${renderEmailSpacer(20)}`
}

export const buildCakesByPostCustomerContent: CustomerEmailContentBuilder = (input) => {
  if (!isCakesByPostCustomerEmail(input)) {
    return null
  }

  const contactRows = buildContactRows(input)
  const summaryRows = buildSummaryRows(input)
  const customerNotesRows = buildCustomerNotesRows(input)
  const giftRows = buildGiftRows(input)

  return {
    bodyText: [
      renderRowsText('Contact Details', contactRows),
      renderRowsText('Order Summary', summaryRows),
      renderRowsText('Customer Notes', customerNotesRows),
      renderRowsText('Gift Details', giftRows),
      buildNextStepsText()
    ].filter((section) => section.length > 0).join('\n\n'),
    bodyHtml: [
      renderCustomerCard('Contact details', contactRows),
      renderCustomerCard('Order Summary', summaryRows),
      renderCustomerCard('Customer Notes', customerNotesRows),
      renderCustomerCard('Gift Details', giftRows),
      buildNextStepsHtml(),
      buildCustomerFooterHtml()
    ].join('')
  }
}

export const buildCakesByPostStatusUpdateContent: CustomerEmailContentBuilder = (input) => {
  if (!isCakesByPostCustomerEmail(input)) {
    return null
  }

  const normalizedStatus = toTrimmed(input.status).toLowerCase()
  const showCustomerDetails = normalizedStatus === 'confirmed'
  const completedReviewText = normalizedStatus === 'completed' ? buildCompletedReviewText() : ''
  const completedReviewHtml = normalizedStatus === 'completed' ? buildCompletedReviewHtml() : ''
  const summaryRows = buildSummaryRows(input)
  const deliveryRows = normalizedStatus === 'cancelled' || normalizedStatus === 'canceled'
    ? []
    : buildStatusDeliveryRows(input)
  const customerNotesRows = showCustomerDetails ? buildCustomerNotesRows(input) : []
  const giftRows = showCustomerDetails ? buildGiftRows(input) : []

  return {
    bodyText: [
      renderRowsText('Order Summary', summaryRows),
      renderRowsText('Delivery Details', deliveryRows),
      renderRowsText('Customer Notes', customerNotesRows),
      renderRowsText('Gift Details', giftRows),
      buildStatusNextStepText(input),
      completedReviewText
    ].filter((section) => section.length > 0).join('\n\n'),
    bodyHtml: [
      renderCustomerCard('Order Summary', summaryRows),
      renderCustomerCard('Delivery Details', deliveryRows),
      renderCustomerCard('Customer Notes', customerNotesRows),
      renderCustomerCard('Gift Details', giftRows),
      buildStatusNextStepHtml(input),
      completedReviewHtml,
      buildCustomerFooterHtml()
    ].join('')
  }
}
