import type { EmailTemplateCommonInput } from '../types'
import {
  formatCurrency,
  formatDate,
  formatPhoneDisplay,
  renderCustomerCard,
  toTrimmed,
  type AdminEmailContentBuilder,
  type CustomerRow
} from './shared'

function isCakesByPostAdminEmail(input: EmailTemplateCommonInput): boolean {
  return input.productType === 'gift-hamper'
}

function row(rows: CustomerRow[], label: string, value: string | null | undefined) {
  const trimmed = toTrimmed(value)
  if (trimmed.length === 0) {
    return
  }

  rows.push({ label, value: trimmed })
}

function rowsText(title: string, rows: CustomerRow[]): string {
  if (rows.length === 0) {
    return ''
  }

  return `${title}\n${rows.map((entry) => `- ${entry.label}: ${entry.value}`).join('\n')}`
}

function buildCustomerRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []

  row(rows, 'Name', input.customerName)
  row(rows, 'Email', input.customerEmail)
  row(rows, 'Phone', formatPhoneDisplay(input.customerPhone))

  return rows
}

function buildDeliveryRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []

  row(rows, 'Address', input.address)
  row(rows, 'City', input.city)
  row(rows, 'Postcode', input.postcode)
  row(rows, 'Delivery method', input.deliveryMethod)
  row(rows, 'Delivery address', input.deliveryAddress)
  row(rows, 'Date needed', formatDate(input.dateNeeded))

  return rows
}

function buildSummaryRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []

  row(rows, 'Order number', input.orderNumber)
  row(rows, 'Product', input.productName)
  row(rows, 'Product ID', input.productId)
  row(rows, 'Quantity', input.quantity ? String(input.quantity) : undefined)
  row(rows, 'Unit price', formatCurrency(input.unitPrice))
  row(rows, 'Total price', formatCurrency(input.totalPrice))
  row(rows, 'Payment method', input.paymentMethod)
  row(rows, 'Admin link', input.adminUrl)

  return rows
}

function buildNotesRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []

  row(rows, 'Notes', input.customerMessage)
  row(rows, 'Gift note', input.giftNote)
  row(rows, 'Additional note', input.note)
  if (Array.isArray(input.attachmentNames) && input.attachmentNames.length > 0) {
    row(rows, 'Attachments', input.attachmentNames.join(', '))
  }

  return rows
}

function buildContextRows(input: EmailTemplateCommonInput): CustomerRow[] {
  const rows: CustomerRow[] = []

  row(rows, 'Approx. submitted from', input.approximateSubmittedFrom)
  row(rows, 'Referrer', input.referrer)

  return rows
}

export const buildCakesByPostAdminContent: AdminEmailContentBuilder = (input) => {
  if (!isCakesByPostAdminEmail(input)) {
    return null
  }

  const customerRows = buildCustomerRows(input)
  const deliveryRows = buildDeliveryRows(input)
  const summaryRows = buildSummaryRows(input)
  const notesRows = buildNotesRows(input)
  const contextRows = buildContextRows(input)

  return {
    bodyText: [
      rowsText('Customer details', customerRows),
      rowsText('Delivery details', deliveryRows),
      rowsText('Order summary', summaryRows),
      rowsText('Customer notes', notesRows),
      rowsText('Request context', contextRows)
    ].filter((section) => section.length > 0).join('\n\n'),
    bodyHtml: [
      renderCustomerCard('Customer details', customerRows),
      renderCustomerCard('Delivery details', deliveryRows),
      renderCustomerCard('Order summary', summaryRows),
      renderCustomerCard('Customer notes', notesRows),
      renderCustomerCard('Request context', contextRows)
    ].join('')
  }
}
