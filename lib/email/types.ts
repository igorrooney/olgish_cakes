import type { z } from 'zod'

export const emailTemplateIds = [
  'contact-admin-inquiry',
  'contact-inline-order-customer',
  'contact-inline-order-admin',
  'contact-inline-order-fallback-customer',
  'contact-inline-order-fallback-admin',
  'orders-customer-confirmation',
  'orders-admin-notification',
  'orders-status-update',
  'quote-admin-request',
  'custom-cake-enquiry-admin',
  'custom-cake-enquiry-customer'
] as const

export type EmailTemplateId = (typeof emailTemplateIds)[number]

export interface EmailFieldRow {
  label: string
  value: string
  multiline?: boolean
}

export interface EmailSection {
  title: string
  rows: EmailFieldRow[]
}

export interface EmailTemplateCommonInput {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  address?: string
  city?: string
  postcode?: string
  orderNumber?: string
  orderType?: string
  productName?: string
  productId?: string
  productType?: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
  dateNeeded?: string
  cakeInterest?: string
  occasion?: string
  designType?: string
  filling?: string
  servings?: string
  customerMessage?: string
  deliveryMethod?: string
  deliveryAddress?: string
  paymentMethod?: string
  referrer?: string
  status?: string
  message?: string
  note?: string
  giftNote?: string
  attachmentNames?: string[]
  nextSteps?: string[]
  intro?: string
  titleOverride?: string
  statusMessage?: string
  orderItems?: Array<{
    productName?: string
    productId?: string
    productType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
    designType?: string
    filling?: string
    servings?: string
    specialInstructions?: string
  }>
  trackingNumber?: string
}

export interface ContactAdminInquiryInput extends EmailTemplateCommonInput {}
export interface ContactInlineOrderCustomerInput extends EmailTemplateCommonInput {}
export interface ContactInlineOrderAdminInput extends EmailTemplateCommonInput {}
export interface ContactInlineOrderFallbackCustomerInput extends EmailTemplateCommonInput {}
export interface ContactInlineOrderFallbackAdminInput extends EmailTemplateCommonInput {}
export interface OrdersCustomerConfirmationInput extends EmailTemplateCommonInput {}
export interface OrdersAdminNotificationInput extends EmailTemplateCommonInput {}
export interface OrdersStatusUpdateInput extends EmailTemplateCommonInput {}
export interface QuoteAdminRequestInput extends EmailTemplateCommonInput {}
export interface CustomCakeEnquiryAdminInput extends EmailTemplateCommonInput {}
export interface CustomCakeEnquiryCustomerInput extends EmailTemplateCommonInput {}

export type EmailRenderInputMap = {
  'contact-admin-inquiry': ContactAdminInquiryInput
  'contact-inline-order-customer': ContactInlineOrderCustomerInput
  'contact-inline-order-admin': ContactInlineOrderAdminInput
  'contact-inline-order-fallback-customer': ContactInlineOrderFallbackCustomerInput
  'contact-inline-order-fallback-admin': ContactInlineOrderFallbackAdminInput
  'orders-customer-confirmation': OrdersCustomerConfirmationInput
  'orders-admin-notification': OrdersAdminNotificationInput
  'orders-status-update': OrdersStatusUpdateInput
  'quote-admin-request': QuoteAdminRequestInput
  'custom-cake-enquiry-admin': CustomCakeEnquiryAdminInput
  'custom-cake-enquiry-customer': CustomCakeEnquiryCustomerInput
}

export interface RenderedEmail {
  subject: string
  text: string
  html: string
  metadata?: Record<string, string>
}

export interface EmailTemplateScenario<TInput> {
  id: string
  label: string
  input: TInput
}

export interface TemplateDefinition<TInput> {
  schema: z.ZodType<TInput>
  build: (input: TInput) => RenderedEmail
  scenarios: EmailTemplateScenario<TInput>[]
}

export type SendMode = 'capture' | 'live' | 'disabled'

export interface EmailMessage {
  from: string
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename?: string
    content?: string | Buffer
    path?: string
    contentType?: string
    contentId?: string
  }>
}

export interface CapturedEmail {
  id: string
  createdAt: string
  templateId: EmailTemplateId
  mode: SendMode
  message: EmailMessage
  metadata?: Record<string, string>
}

export interface EmailSendResult {
  mode: SendMode
  accepted: boolean
  id: string | null
  error: { message: string } | null
  rendered: RenderedEmail
}



