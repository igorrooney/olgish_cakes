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

function toTrimmed(value: string | null | undefined): string {
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

  const itemRows = items.map((item, index) => {
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
      ? `<ul style="margin: 8px 0 0 18px; padding: 0; color: #4b5563; font-size: 13px; line-height: 1.5;">${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>`
      : ''

    return `<li style="margin: 0 0 12px 0;"><p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">${escapeHtml(`${index + 1}. ${formatOrderItemSummary(item)}`)}</p>${detailsHtml}</li>`
  }).join('')

  return `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px;"><h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Order items</h3><ol style="margin: 0; padding-left: 18px;">${itemRows}</ol></div>`
}

export function buildAdminSections(input: EmailTemplateCommonInput): EmailSection[] {
  const identityRows: EmailFieldRow[] = []
  appendRow(identityRows, 'Name', input.customerName)
  appendRow(identityRows, 'Email', input.customerEmail)
  appendRow(identityRows, 'Phone', input.customerPhone)

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
          return `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px; vertical-align: top;">${escapeHtml(row.label)}</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; text-align: right; vertical-align: top;">${renderFieldValueHtml(row)}</td></tr>`
        })
        .join('')

      return `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;"><h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${escapeHtml(section.title)}</h3><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${rows}</table></div>`
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
  statusMessage: z.string().optional(),
  trackingNumber: z.string().optional(),
  adminUrl: z.string().optional(),
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

interface CustomerRow {
  label: string
  value: string
}

interface CustomerRows {
  summary: CustomerRow[]
  preferences: CustomerRow[]
}

const TRUSTPILOT_REVIEW_URL = 'https://uk.trustpilot.com/review/olgishcakes.co.uk'

function buildCustomerRows(input: EmailTemplateCommonInput): CustomerRows {
  const summaryRows: CustomerRow[] = []
  const preferencesRows: CustomerRow[] = []

  const row = (rows: CustomerRow[], label: string, value: string | null | undefined) => {
    const trimmed = toTrimmed(value)
    if (trimmed.length === 0) {
      return
    }

    rows.push({ label, value: trimmed })
  }

  row(summaryRows, 'Order Number', input.orderNumber)
  row(summaryRows, 'Product', input.productName)
  row(summaryRows, 'Date Needed', formatDate(input.dateNeeded))
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

  return {
    summary: summaryRows,
    preferences: preferencesRows
  }
}

function isCompletedStatus(value: string | null | undefined): boolean {
  return toTrimmed(value).toLowerCase() === 'completed'
}

function buildCompletedReviewText(): string {
  return [
    'We\'d love your feedback',
    'Thank you for choosing Olgish Cakes. If you enjoyed your order, we\'d really appreciate your review.',
    `- Leave a review on Trustpilot: ${TRUSTPILOT_REVIEW_URL}`
  ].join('\n')
}

function buildCompletedReviewHtml(): string {
  return `<div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-top: 16px;"><h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">We'd love your feedback</h3><p style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">Thank you for choosing Olgish Cakes. If you enjoyed your order, we'd really appreciate your review.</p><a href="${TRUSTPILOT_REVIEW_URL}" style="display: inline-block; background: #0ea5e9; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Leave a review on Trustpilot</a></div>`
}

function buildCustomerTextBody(input: EmailTemplateCommonInput, nextSteps: string[]): string {
  const rows = buildCustomerRows(input)
  const normalizedOrderItems = normalizeOrderItems(input)
  const summary = rows.summary.length > 0
    ? `Order Summary\n${rows.summary.map((entry) => `- ${entry.label}: ${entry.value}`).join('\n')}`
    : ''
  const orderItemsSection = normalizedOrderItems.length > 0
    ? `Order items\n${renderOrderItemsText(normalizedOrderItems)}`
    : ''
  const preferences = rows.preferences.length > 0
    ? `Order Preferences\n${rows.preferences.map((entry) => `- ${entry.label}: ${entry.value}`).join('\n')}`
    : ''

  const nextStepsText = nextSteps.map((step) => `- ${step}`).join('\n')
  const nextSection = nextStepsText.length > 0
    ? `What happens next?\n${nextStepsText}`
    : ''

  const completedReviewSection = isCompletedStatus(input.status)
    ? buildCompletedReviewText()
    : ''

  return [summary, orderItemsSection, preferences, nextSection, completedReviewSection]
    .filter((section) => section.length > 0)
    .join('\n\n')
}
function buildCustomerFooterText(): string {
  return [
    'Questions about your order? We\'re here to help.',
    'hello@olgishcakes.co.uk',
    '+44 786 721 8194'
  ].join('\n')
}

function renderCustomerCard(title: string, rows: CustomerRow[]): string {
  if (rows.length === 0) {
    return ''
  }

  const tableRows = rows
    .map((entry) => `<tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">${escapeHtml(entry.label)}</td><td style="padding: 6px 0; color: #1f2937; font-size: 14px; text-align: right;">${escapeHtml(entry.value).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')

  return `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px;"><h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${escapeHtml(title)}</h3><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${tableRows}</table></div>`
}

function buildCustomerFooterHtml(): string {
  return `<div style="border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 20px; text-align: center;"><p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">Questions about your order? We're here to help.</p><p style="margin: 0; font-size: 14px; line-height: 1.7;"><a href="mailto:hello@olgishcakes.co.uk" style="color: #2E3192; text-decoration: none;">hello@olgishcakes.co.uk</a><br><a href="tel:+447867218194" style="color: #2E3192; text-decoration: none;">+44 786 721 8194</a></p></div>`
}

function buildCustomerHtmlBody(input: EmailTemplateCommonInput, nextSteps: string[]): string {
  const rows = buildCustomerRows(input)
  const summaryCard = renderCustomerCard('Order Summary', rows.summary)
  const orderItemsCard = renderOrderItemsHtml(normalizeOrderItems(input))
  const preferencesCard = renderCustomerCard('Order Preferences', rows.preferences)

  const steps = nextSteps.length > 0
    ? `<div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px;"><h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">What happens next?</h3><ul style="margin: 0; padding-left: 18px; color: #1e40af; font-size: 14px; line-height: 1.6;">${nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ul></div>`
    : ''

  const completedReviewCard = isCompletedStatus(input.status)
    ? buildCompletedReviewHtml()
    : ''

  return `${summaryCard}${orderItemsCard}${preferencesCard}${steps}${completedReviewCard}${buildCustomerFooterHtml()}`
}
function buildTemplateEmail(meta: TemplateMeta, input: EmailTemplateCommonInput): RenderedEmail {
  const subject = buildSubject(meta, input)
  const intro = input.intro?.trim() || input.statusMessage?.trim() || meta.intro
  const nextSteps = resolveNextSteps(input)

  const sections = buildAdminSections(input)
  const bodyText = meta.admin
    ? renderRowsAsText(sections)
    : buildCustomerTextBody(input, nextSteps)
  const bodyHtml = meta.admin
    ? `${renderReferenceImageGalleryHtml(input.referenceImageUrls)}${renderRowsAsHtml(sections)}`
    : buildCustomerHtmlBody(input, nextSteps)

  const greetingName = input.customerName?.trim() || 'there'
  const greetingPrefix = meta.admin ? 'Hello' : 'Dear'
  const signature = meta.admin ? 'Olgish Cakes' : buildCustomerFooterText()

  const text = [
    meta.heading,
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
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head><body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;"><tr><td align="center" style="padding: 24px 16px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;"><tr><td style="background: linear-gradient(135deg, #2E3192 0%, #1a237e 100%); padding: 28px 24px; text-align: center;"><h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.4px;">${escapeHtml(meta.heading)}</h1></td></tr><tr><td style="padding: 28px 24px;"><p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">${greetingPrefix} <strong>${escapeHtml(greetingName)}</strong>,</p><p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">${escapeHtml(intro)}</p>${bodyHtml}${htmlSignature}</td></tr></table></td></tr></table></body></html>`

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
  scenarios: EmailTemplateScenario<EmailTemplateCommonInput>[]
): TemplateDefinition<EmailTemplateCommonInput> {
  return {
    schema: commonInputSchema,
    scenarios,
    build: (input) => buildTemplateEmail(meta, input)
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

