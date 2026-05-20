import { z } from 'zod'
import type {
  EmailFieldRow,
  EmailSection,
  EmailTemplateCommonInput,
  EmailTemplateScenario,
  RenderedEmail,
  TemplateDefinition
} from '../types'

interface TemplateMeta {
  subject: string
  heading: string
  intro: string
  admin: boolean
}

export function toTrimmed(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function formatDate(value: string | null | undefined): string {
  const raw = toTrimmed(value)
  if (raw.length === 0) {
    return ''
  }

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return raw
  }

  return parsed.toLocaleDateString('en-GB')
}

export function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return ''
  }

  return `\u00A3${value}`
}

export function formatPhoneDisplay(value: string | null | undefined): string {
  const raw = toTrimmed(value)
  if (raw.length === 0) {
    return ''
  }

  const digits = raw.replace(/\D/g, '')
  const ukMobileDigits = digits.startsWith('4407')
    ? `44${digits.slice(3)}`
    : digits

  if (ukMobileDigits.startsWith('44') && ukMobileDigits.length === 12) {
    return `+44 ${ukMobileDigits.slice(2, 6)} ${ukMobileDigits.slice(6)}`
  }

  if (digits.startsWith('07') && digits.length === 11) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`
  }

  return raw
}

function appendRow(rows: EmailFieldRow[], label: string, value: string | null | undefined, multiline = false) {
  const trimmedValue = toTrimmed(value)
  if (trimmedValue.length === 0) {
    return
  }

  rows.push({
    label,
    value: trimmedValue,
    multiline
  })
}

function appendNumericRow(rows: EmailFieldRow[], label: string, value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return
  }

  rows.push({
    label,
    value: String(value)
  })
}

function nonEmptySections(sections: EmailSection[]): EmailSection[] {
  return sections.filter((section) => section.rows.length > 0)
}

function renderReferenceImageGalleryHtml(imageUrls?: string[]) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return ''
  }

  const uniqueImageUrls = Array.from(new Set(imageUrls.map(toTrimmed).filter((url) => url.length > 0)))
  if (uniqueImageUrls.length === 0) {
    return ''
  }

  const imageCards = uniqueImageUrls
    .map((imageUrl, index) => `<div style="border: 2px solid #22c55e; border-radius: 8px; overflow: hidden; max-width: 200px;"><img src="${escapeHtml(imageUrl)}" alt="Reference image ${index + 1}" style="width: 100%; height: auto; display: block;" /></div>`)
    .join('')

  return `<div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;"><h3 style="margin: 0 0 12px 0; color: #15803d; font-size: 18px; font-weight: 600;">Reference images</h3><p style="margin: 0 0 16px 0; color: #15803d; font-size: 14px; line-height: 1.6;">The customer included design reference images for this order.</p><div style="display: flex; flex-wrap: wrap; gap: 12px;">${imageCards}</div></div>`
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function renderFieldValueHtml(row: EmailFieldRow): string {
  const escaped = escapeHtml(row.value)

  if (row.multiline) {
    return escaped.replace(/\n/g, '<br>')
  }

  if (isHttpUrl(row.value)) {
    return `<a href="${escaped}" style="color: #2E3192; text-decoration: none;">${escaped}</a>`
  }

  return escaped
}

interface NormalizedOrderItem {
  productName: string
  productId: string
  productType: string
  quantity: number
  unitPrice: number
  totalPrice: number
  designType: string
  filling: string
  servings: string
  specialInstructions: string
}

export function normalizeOrderItems(input: EmailTemplateCommonInput): NormalizedOrderItem[] {
  if (!Array.isArray(input.orderItems)) {
    return []
  }

  return input.orderItems.map((item) => {
    const quantity = typeof item.quantity === 'number' && Number.isFinite(item.quantity)
      ? item.quantity
      : 1
    const unitPrice = typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice)
      ? item.unitPrice
      : 0
    const totalPrice = typeof item.totalPrice === 'number' && Number.isFinite(item.totalPrice)
      ? item.totalPrice
      : 0

    return {
      productName: toTrimmed(item.productName) || 'Custom Order',
      productId: toTrimmed(item.productId),
      productType: toTrimmed(item.productType),
      quantity,
      unitPrice,
      totalPrice,
      designType: toTrimmed(item.designType),
      filling: toTrimmed(item.filling),
      servings: toTrimmed(item.servings),
      specialInstructions: toTrimmed(item.specialInstructions)
    }
  })
}

function formatOrderItemSummary(item: NormalizedOrderItem): string {
  const total = formatCurrency(item.totalPrice) || '\u00A30'
  return `${item.productName} (Qty: ${item.quantity}) - ${total}`
}

function renderOrderItemText(item: NormalizedOrderItem): string {
  const lines = [formatOrderItemSummary(item)]

  if (item.productType.length > 0) {
    lines.push(`Type: ${item.productType}`)
  }

  if (item.productId.length > 0) {
    lines.push(`Product ID: ${item.productId}`)
  }

  if (item.designType.length > 0) {
    lines.push(`Design type: ${item.designType}`)
  }

  if (item.servings.length > 0) {
    lines.push(`Servings: ${item.servings}`)
  }

  if (item.filling.length > 0) {
    lines.push(`Filling: ${item.filling}`)
  }

  if (item.specialInstructions.length > 0) {
    lines.push(`Customer message / requirements: ${item.specialInstructions}`)
  }

  return lines.join('\n')
}

export function renderOrderItemsText(items: NormalizedOrderItem[]): string {
  return items
    .map((item, index) => {
      const lines = renderOrderItemText(item).split('\n')
      const [firstLine, ...extraLines] = lines
      return [
        `${index + 1}. ${firstLine}`,
        ...extraLines.map((line) => `   ${line}`)
      ].join('\n')
    })
    .join('\n')
}

export function renderOrderItemsHtml(items: NormalizedOrderItem[]): string {
  if (items.length === 0) {
    return ''
  }

  const itemRows = items.map((item) => {
    const details: string[] = []

    if (item.productType.length > 0) {
      details.push(`Type: ${item.productType}`)
    }

    if (item.productId.length > 0) {
      details.push(`Product ID: ${item.productId}`)
    }

    if (item.designType.length > 0) {
      details.push(`Design type: ${item.designType}`)
    }

    if (item.servings.length > 0) {
      details.push(`Servings: ${item.servings}`)
    }

    if (item.filling.length > 0) {
      details.push(`Filling: ${item.filling}`)
    }

    if (item.specialInstructions.length > 0) {
      details.push(`Customer message / requirements: ${item.specialInstructions}`)
    }

    const detailsHtml = details.length > 0
      ? `<ul style="margin: 8px 0 0 18px; padding: 0; color: #4B5563; font-family: ${EMAIL_FONT_SANS}; font-size: 14px; line-height: 21px;">${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>`
      : ''

    return `<li style="margin: 0 0 12px 0;"><p style="margin: 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 15px; line-height: 23px;">${escapeHtml(formatOrderItemSummary(item))}</p>${detailsHtml}</li>`
  }).join('')

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ffffff" style="background-color: #ffffff; border: 1px solid #D8D9F3; border-radius: 10px; border-collapse: separate;"><tr><td style="padding: 22px 24px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding: 0 0 14px 0; color: #2E3192; font-family: ${EMAIL_FONT_DISPLAY}; font-size: 16px; font-weight: 700; line-height: 22px; text-transform: uppercase;">Order items</td></tr></table><ol style="margin: 0; padding-left: 18px;">${itemRows}</ol></td></tr></table>${renderEmailSpacer(14)}`
}

export function buildAdminSections(input: EmailTemplateCommonInput): EmailSection[] {
  const identityRows: EmailFieldRow[] = []
  appendRow(identityRows, 'Name', input.customerName)
  appendRow(identityRows, 'Email', input.customerEmail)
  appendRow(identityRows, 'Phone', formatPhoneDisplay(input.customerPhone))

  const addressRows: EmailFieldRow[] = []
  appendRow(addressRows, 'Address', input.address)
  appendRow(addressRows, 'City', input.city)
  appendRow(addressRows, 'Postcode', input.postcode)

  const orderRows: EmailFieldRow[] = []
  appendRow(orderRows, 'Order number', input.orderNumber)
  appendRow(orderRows, 'Order type', input.orderType)
  appendRow(orderRows, 'Product name', input.productName)
  appendRow(orderRows, 'Product ID', input.productId)
  appendRow(orderRows, 'Product type', input.productType)
  appendRow(orderRows, 'Status', input.status)
  appendRow(orderRows, 'Admin link', input.adminUrl)

  const pricingRows: EmailFieldRow[] = []
  appendNumericRow(pricingRows, 'Quantity', input.quantity)
  appendRow(pricingRows, 'Unit price', formatCurrency(input.unitPrice))
  appendRow(pricingRows, 'Total price', formatCurrency(input.totalPrice))

  const normalizedOrderItems = normalizeOrderItems(input)
  const orderItemsRows: EmailFieldRow[] = normalizedOrderItems.map((item, index) => ({
    label: `Item ${index + 1}`,
    value: renderOrderItemText(item),
    multiline: true
  }))

  const scheduleRows: EmailFieldRow[] = []
  appendRow(scheduleRows, 'Date needed', formatDate(input.dateNeeded))

  const preferencesRows: EmailFieldRow[] = []
  appendRow(preferencesRows, 'Cake interest', input.cakeInterest)
  appendRow(preferencesRows, 'Occasion', input.occasion)
  appendRow(preferencesRows, 'Design type', input.designType)
  appendRow(preferencesRows, 'Filling', input.filling)
  appendRow(preferencesRows, 'Servings', input.servings)
  appendRow(preferencesRows, 'Customer message / requirements', input.customerMessage, true)

  const contextRows: EmailFieldRow[] = []
  appendRow(contextRows, 'Delivery method', input.deliveryMethod)
  appendRow(contextRows, 'Delivery address', input.deliveryAddress)
  appendRow(contextRows, 'Payment method', input.paymentMethod)
  appendRow(contextRows, 'Approx. submitted from', input.approximateSubmittedFrom)
  appendRow(contextRows, 'Referrer', input.referrer)

  const messageRows: EmailFieldRow[] = []
  appendRow(messageRows, 'Submitted message', input.message, true)
  appendRow(messageRows, 'Additional note', input.note, true)
  appendRow(messageRows, 'Gift note', input.giftNote, true)
  appendRow(messageRows, 'Tracking number', input.trackingNumber)
  if (Array.isArray(input.attachmentNames) && input.attachmentNames.length > 0) {
    appendRow(messageRows, 'Attachments', input.attachmentNames.join(', '))
  }

  return nonEmptySections([
    { title: 'Customer identity', rows: identityRows },
    { title: 'Customer address', rows: addressRows },
    { title: 'Order identification', rows: orderRows },
    { title: 'Pricing and quantity', rows: pricingRows },
    { title: 'Order items', rows: orderItemsRows },
    { title: 'Schedule', rows: scheduleRows },
    { title: 'Preferences and design', rows: preferencesRows },
    { title: 'Delivery, payment, and context', rows: contextRows },
    { title: 'Message and attachments', rows: messageRows }
  ])
}

export function renderRowsAsText(sections: EmailSection[]): string {
  return sections
    .map((section) => {
      const lines = section.rows
        .map((row) => `- ${row.label}: ${row.value}`)
        .join('\n')
      return `${section.title}\n${lines}`
    })
    .join('\n\n')
}

export function renderRowsAsHtml(sections: EmailSection[]): string {
  return sections
    .map((section) => {
      const rows = section.rows
        .map((row) => {
          return `<tr><td width="34%" valign="top" style="padding: 8px 16px 8px 0; color: #6467CE; font-family: ${EMAIL_FONT_SANS}; font-size: 14px; font-weight: 700; line-height: 21px; vertical-align: top;">${escapeHtml(row.label)}</td><td valign="top" style="padding: 8px 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 15px; line-height: 23px; vertical-align: top; overflow-wrap: break-word; word-break: break-word;">${renderFieldValueHtml(row)}</td></tr>`
        })
        .join('')

      return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ffffff" style="background-color: #ffffff; border: 1px solid #D8D9F3; border-radius: 10px; border-collapse: separate;"><tr><td style="padding: 22px 24px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding: 0 0 14px 0; color: #2E3192; font-family: ${EMAIL_FONT_DISPLAY}; font-size: 16px; font-weight: 700; line-height: 22px; text-transform: uppercase;">${escapeHtml(section.title)}</td></tr></table><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${rows}</table></td></tr></table>${renderEmailSpacer(14)}`
    })
    .join('')
}

export const commonInputSchema = z.object({
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  orderNumber: z.string().optional(),
  orderType: z.string().optional(),
  productName: z.string().optional(),
  productId: z.string().optional(),
  productType: z.string().optional(),
  quantity: z.number().optional(),
  unitPrice: z.number().optional(),
  totalPrice: z.number().optional(),
  dateNeeded: z.string().optional(),
  cakeInterest: z.string().optional(),
  occasion: z.string().optional(),
  designType: z.string().optional(),
  filling: z.string().optional(),
  servings: z.string().optional(),
  customerMessage: z.string().optional(),
  deliveryMethod: z.string().optional(),
  deliveryCourier: z.string().optional(),
  deliveryRecipientName: z.string().optional(),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.string().optional(),
  referrer: z.string().optional(),
  status: z.string().optional(),
  message: z.string().optional(),
  note: z.string().optional(),
  giftNote: z.string().optional(),
  attachmentNames: z.array(z.string()).optional(),
  referenceImageUrls: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
  intro: z.string().optional(),
  titleOverride: z.string().optional(),
  headingOverride: z.string().optional(),
  statusMessage: z.string().optional(),
  paymentStatus: z.string().optional(),
  trackingNumber: z.string().optional(),
  adminUrl: z.string().optional(),
  approximateSubmittedFrom: z.string().optional(),
  orderItems: z.array(z.object({
    productName: z.string().optional(),
    productId: z.string().optional(),
    productType: z.string().optional(),
    quantity: z.number().optional(),
    unitPrice: z.number().optional(),
    totalPrice: z.number().optional(),
    designType: z.string().optional(),
    filling: z.string().optional(),
    servings: z.string().optional(),
    specialInstructions: z.string().optional()
  })).optional()
})

export interface CustomerEmailContent {
  bodyText: string
  bodyHtml: string
}

export type CustomerEmailContentBuilder = (input: EmailTemplateCommonInput) => CustomerEmailContent | null
export type AdminEmailContentBuilder = (input: EmailTemplateCommonInput) => CustomerEmailContent | null

interface TemplateOptions {
  customerContentBuilder?: CustomerEmailContentBuilder
  adminContentBuilder?: AdminEmailContentBuilder
}

function buildSubject(meta: TemplateMeta, input: EmailTemplateCommonInput): string {
  if (input.titleOverride && input.titleOverride.trim().length > 0) {
    return input.titleOverride.trim()
  }

  if (input.orderNumber && input.orderNumber.trim().length > 0) {
    return `${meta.subject} #${input.orderNumber.trim()}`
  }

  if (input.customerName && input.customerName.trim().length > 0 && meta.admin) {
    return `${meta.subject}: ${input.customerName.trim()}`
  }

  return meta.subject
}

function defaultNextSteps(): string[] {
  return [
    'We\'ll review your order and confirm all details within 24 hours',
    'We\'ll contact you with a quote and final design details',
    'We\'ll confirm delivery or collection once you approve'
  ]
}

function resolveNextSteps(input: EmailTemplateCommonInput): string[] {
  if (Array.isArray(input.nextSteps)) {
    return input.nextSteps
  }

  if (toTrimmed(input.status).length > 0) {
    return []
  }

  return defaultNextSteps()
}

export interface CustomerRow {
  label: string
  value: string
  href?: string
}

interface CustomerRows {
  contact: CustomerRow[]
  summary: CustomerRow[]
  preferences: CustomerRow[]
}

const TRUSTPILOT_REVIEW_URL = 'https://uk.trustpilot.com/review/olgishcakes.co.uk'
const EMAIL_LOGO_CID = 'olgish-cakes-email-logo'
const EMAIL_LOGO_SRC = `cid:${EMAIL_LOGO_CID}`
export const EMAIL_FONT_SANS = 'Inter, Arial, Helvetica, sans-serif'
export const EMAIL_FONT_DISPLAY = '\'More Sugar\', \'Trebuchet MS\', Arial, Helvetica, sans-serif'

function isCustomCakeEnquiry(input: EmailTemplateCommonInput): boolean {
  return input.orderType === 'custom-cake-enquiry'
}

function buildCustomerRows(input: EmailTemplateCommonInput): CustomerRows {
  const contactRows: CustomerRow[] = []
  const summaryRows: CustomerRow[] = []
  const preferencesRows: CustomerRow[] = []

  const row = (rows: CustomerRow[], label: string, value: string | null | undefined) => {
    const trimmed = toTrimmed(value)
    if (trimmed.length === 0) {
      return
    }

    rows.push({ label, value: trimmed })
  }

  const customCakeEnquiry = isCustomCakeEnquiry(input)

  if (customCakeEnquiry) {
    row(contactRows, 'Name', input.customerName)
    row(contactRows, 'Email', input.customerEmail)
    row(contactRows, 'Phone', formatPhoneDisplay(input.customerPhone))
    row(contactRows, 'Address', input.address)
    row(contactRows, 'City', input.city)
    row(contactRows, 'Postcode', input.postcode)
  }

  row(summaryRows, 'Order Number', input.orderNumber)
  row(summaryRows, 'Product', input.productName)
  row(summaryRows, 'Date needed', formatDate(input.dateNeeded))
  row(summaryRows, 'Total Amount', formatCurrency(input.totalPrice))

  const normalizedStatus = toTrimmed(input.status).toLowerCase()
  if (normalizedStatus === 'out-for-delivery' || normalizedStatus === 'out-delivery') {
    row(summaryRows, 'Tracking number', input.trackingNumber)
  }

  row(preferencesRows, 'Occasion', input.occasion)
  row(preferencesRows, 'Design type', input.designType)
  row(preferencesRows, 'Filling', input.filling)
  row(preferencesRows, 'Servings', input.servings)
  row(preferencesRows, 'Customer message', input.customerMessage)
  row(preferencesRows, 'Gift note', input.giftNote)
  if (customCakeEnquiry && Array.isArray(input.attachmentNames)) {
    row(preferencesRows, 'Reference image uploaded', input.attachmentNames.join(', '))
  }

  return {
    contact: contactRows,
    summary: summaryRows,
    preferences: preferencesRows
  }
}

function isCompletedStatus(value: string | null | undefined): boolean {
  return toTrimmed(value).toLowerCase() === 'completed'
}

export function buildCompletedReviewText(): string {
  return [
    'We\'d love your feedback',
    'Thank you for choosing Olgish Cakes. If you enjoyed your order, we\'d really appreciate your review.',
    `- Leave a review on Trustpilot: ${TRUSTPILOT_REVIEW_URL}`
  ].join('\n')
}

export function buildCompletedReviewHtml(): string {
  return `<div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-top: 16px;"><h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">We'd love your feedback</h3><p style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">Thank you for choosing Olgish Cakes. If you enjoyed your order, we'd really appreciate your review.</p><a href="${TRUSTPILOT_REVIEW_URL}" style="display: inline-block; background: #0ea5e9; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Leave a review on Trustpilot</a></div>`
}

function buildCustomerTextBody(input: EmailTemplateCommonInput, nextSteps: string[]): string {
  const rows = buildCustomerRows(input)
  const normalizedOrderItems = normalizeOrderItems(input)
  const customCakeEnquiry = isCustomCakeEnquiry(input)
  const summaryTitle = customCakeEnquiry ? 'Enquiry Summary' : 'Order Summary'
  const preferencesTitle = customCakeEnquiry ? 'Cake Details' : 'Order Preferences'
  const contact = rows.contact.length > 0
    ? `Contact Details\n${rows.contact.map((entry) => `- ${entry.label}: ${entry.value}`).join('\n')}`
    : ''
  const summary = rows.summary.length > 0
    ? `${summaryTitle}\n${rows.summary.map((entry) => `- ${entry.label}: ${entry.value}`).join('\n')}`
    : ''
  const orderItemsSection = normalizedOrderItems.length > 0
    ? `Order items\n${renderOrderItemsText(normalizedOrderItems)}`
    : ''
  const preferences = rows.preferences.length > 0
    ? `${preferencesTitle}\n${rows.preferences.map((entry) => `- ${entry.label}: ${entry.value}`).join('\n')}`
    : ''

  const nextStepsText = nextSteps.map((step) => `- ${step}`).join('\n')
  const nextSection = nextStepsText.length > 0
    ? `What happens next?\n${nextStepsText}`
    : ''

  const completedReviewSection = isCompletedStatus(input.status)
    ? buildCompletedReviewText()
    : ''

  return [contact, summary, orderItemsSection, preferences, nextSection, completedReviewSection]
    .filter((section) => section.length > 0)
    .join('\n\n')
}
export function buildCustomerFooterText(): string {
  return [
    'Questions about your order? We\'re here to help.',
    'hello@olgishcakes.co.uk',
    '+44 7867 218194'
  ].join('\n')
}

export function renderEmailSpacer(height: number): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td height="${height}" style="height: ${height}px; font-size: ${height}px; line-height: ${height}px;">&nbsp;</td></tr></table>`
}

export function renderCustomerCard(title: string, rows: CustomerRow[]): string {
  if (rows.length === 0) {
    return ''
  }

  const tableRows = rows
    .map((entry) => {
      const valueHtml = escapeHtml(entry.value).replace(/\n/g, '<br>')
      const linkedValueHtml = entry.href
        ? `<a href="${escapeHtml(entry.href)}" style="color: #2E3192; text-decoration: underline; font-weight: 700;">${valueHtml}</a>`
        : valueHtml

      return `<tr><td width="34%" valign="top" style="padding: 8px 16px 8px 0; color: #6467CE; font-family: ${EMAIL_FONT_SANS}; font-size: 14px; font-weight: 700; line-height: 21px; vertical-align: top;">${escapeHtml(entry.label)}</td><td valign="top" style="padding: 8px 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 15px; line-height: 23px; vertical-align: top; overflow-wrap: break-word; word-break: break-word;">${linkedValueHtml}</td></tr>`
    })
    .join('')

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ffffff" style="background-color: #ffffff; border: 1px solid #D8D9F3; border-radius: 10px; border-collapse: separate;"><tr><td style="padding: 22px 24px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding: 0 0 14px 0; color: #2E3192; font-family: ${EMAIL_FONT_DISPLAY}; font-size: 16px; font-weight: 700; line-height: 22px; text-transform: uppercase;">${escapeHtml(title)}</td></tr></table><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${tableRows}</table></td></tr></table>${renderEmailSpacer(14)}`
}

export function buildCustomerFooterHtml(): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #D8D9F3;"><tr><td align="center" style="padding: 20px 0 0 0; text-align: center;"><p style="margin: 0 0 10px 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 14px; line-height: 22px;">Questions about your order? We're here to help.</p><p style="margin: 0; font-family: ${EMAIL_FONT_SANS}; font-size: 14px; line-height: 24px;"><a href="mailto:hello@olgishcakes.co.uk" style="color: #2E3192; text-decoration: none; font-weight: 700;">hello@olgishcakes.co.uk</a><br><a href="tel:+447867218194" style="color: #2E3192; text-decoration: none; font-weight: 700;">+44 7867 218194</a></p></td></tr></table>`
}

function buildCustomerHtmlBody(input: EmailTemplateCommonInput, nextSteps: string[]): string {
  const rows = buildCustomerRows(input)
  const customCakeEnquiry = isCustomCakeEnquiry(input)
  const contactCard = renderCustomerCard('Contact details', rows.contact)
  const summaryCard = renderCustomerCard(customCakeEnquiry ? 'Enquiry summary' : 'Order Summary', rows.summary)
  const orderItemsCard = renderOrderItemsHtml(normalizeOrderItems(input))
  const preferencesCard = renderCustomerCard(customCakeEnquiry ? 'Cake details' : 'Order Preferences', rows.preferences)

  const steps = nextSteps.length > 0
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#ECECF9" style="background-color: #ECECF9; border: 1px solid #B1B3E7; border-radius: 10px; border-collapse: separate;"><tr><td style="padding: 22px 24px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="padding: 0 0 14px 0; color: #2E3192; font-family: ${EMAIL_FONT_DISPLAY}; font-size: 16px; font-weight: 700; line-height: 22px; text-transform: uppercase;">What happens next?</td></tr>${nextSteps.map((step) => `<tr><td style="padding: 0 0 9px 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 15px; line-height: 23px;">&bull;&nbsp;${escapeHtml(step)}</td></tr>`).join('')}</table></td></tr></table>${renderEmailSpacer(20)}`
    : ''

  const completedReviewCard = isCompletedStatus(input.status)
    ? buildCompletedReviewHtml()
    : ''

  return `${contactCard}${summaryCard}${orderItemsCard}${preferencesCard}${steps}${completedReviewCard}${buildCustomerFooterHtml()}`
}
function buildTemplateEmail(meta: TemplateMeta, input: EmailTemplateCommonInput, options: TemplateOptions = {}): RenderedEmail {
  const subject = buildSubject(meta, input)
  const heading = input.headingOverride?.trim() || meta.heading
  const intro = input.intro?.trim() || input.statusMessage?.trim() || meta.intro
  const nextSteps = resolveNextSteps(input)
  const customerContent = meta.admin ? null : options.customerContentBuilder?.(input) ?? null
  const adminContent = meta.admin ? options.adminContentBuilder?.(input) ?? null : null

  const sections = buildAdminSections(input)
  const bodyText = meta.admin
    ? adminContent?.bodyText ?? renderRowsAsText(sections)
    : customerContent?.bodyText ?? buildCustomerTextBody(input, nextSteps)
  const bodyHtml = meta.admin
    ? adminContent?.bodyHtml ?? `${renderReferenceImageGalleryHtml(input.referenceImageUrls)}${renderRowsAsHtml(sections)}`
    : customerContent?.bodyHtml ?? buildCustomerHtmlBody(input, nextSteps)

  const greetingName = input.customerName?.trim() || 'there'
  const greetingPrefix = meta.admin ? 'Hello' : 'Dear'
  const signature = meta.admin ? 'Olgish Cakes' : buildCustomerFooterText()

  const text = [
    heading,
    '',
    `${greetingPrefix} ${greetingName},`,
    '',
    intro,
    '',
    bodyText,
    '',
    signature
  ].join('\n').trim()

  const htmlSignature = meta.admin
    ? '<p style="margin: 24px 0 0 0; color: #374151; font-size: 14px;">Olgish Cakes</p>'
    : ''
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head><body bgcolor="#FFF5E6" style="margin: 0; padding: 0; background-color: #FFF5E6; font-family: ${EMAIL_FONT_SANS};"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#FFF5E6" style="background-color: #FFF5E6; border-collapse: collapse;"><tr><td align="center" style="padding: 28px 14px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#FFFBEB" style="width: 100%; max-width: 600px; background-color: #FFFBEB; border: 1px solid #D8D9F3; border-radius: 10px; border-collapse: separate;"><tr><td align="center" bgcolor="#2E3192" style="background-color: #2E3192; padding: 24px 24px 22px 24px; text-align: center;"><img src="${EMAIL_LOGO_SRC}" alt="Olgish Cakes" width="112" height="112" style="display: block; width: 112px; height: 112px; margin: 0 auto 16px auto; border: 0; outline: none; text-decoration: none;"><h1 style="margin: 0; color: #ffffff; font-family: ${EMAIL_FONT_DISPLAY}; font-size: 25px; font-weight: 700; line-height: 32px; letter-spacing: 0;">${escapeHtml(heading)}</h1></td></tr><tr><td bgcolor="#FFFBEB" style="background-color: #FFFBEB; padding: 30px 28px;"><p style="margin: 0 0 16px 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 16px; line-height: 26px;">${greetingPrefix} <strong>${escapeHtml(greetingName)}</strong>,</p><p style="margin: 0 0 24px 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 16px; line-height: 27px;">${escapeHtml(intro)}</p>${bodyHtml}${htmlSignature}</td></tr></table></td></tr></table></body></html>`

  return {
    subject,
    text,
    html,
    metadata: {
      generatedAt: new Date().toISOString()
    }
  }
}

export function createTemplateDefinition(
  meta: TemplateMeta,
  scenarios: EmailTemplateScenario<EmailTemplateCommonInput>[],
  options: TemplateOptions = {}
): TemplateDefinition<EmailTemplateCommonInput> {
  return {
    schema: commonInputSchema,
    scenarios,
    build: (input) => buildTemplateEmail(meta, input, options)
  }
}

export function createDefaultScenarioInput(overrides?: Partial<EmailTemplateCommonInput>): EmailTemplateCommonInput {
  return {
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '+44 7123 456789',
    address: '123 Example Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    orderNumber: 'OC-2026-1001',
    orderType: 'browse-catalog',
    productName: 'Kyiv Cake',
    productId: 'kyiv-cake',
    productType: 'cake',
    quantity: 1,
    unitPrice: 45,
    totalPrice: 45,
    dateNeeded: '2026-03-15',
    occasion: 'Birthday',
    designType: 'Individual design',
    filling: 'Sour cream',
    servings: 'Serves 8-12 people',
    customerMessage: 'Please keep it less sweet and no nuts.',
    deliveryMethod: 'collection',
    deliveryRecipientName: 'Test Customer',
    deliveryAddress: '123 Example Street, London, SW1A 1AA',
    paymentMethod: 'cash-collection',
    referrer: 'instagram',
    status: 'confirmed',
    message: 'Please call before delivery.',
    note: 'Customer prefers afternoon slot.',
    giftNote: 'Happy Birthday!',
    attachmentNames: ['design-reference.jpg'],
    ...overrides
  }
}

