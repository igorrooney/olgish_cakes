import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { createDefaultScenarioInput, createTemplateDefinition } from './shared'

const adminInquiryScenarios = [
  {
    id: 'default',
    label: 'Default admin inquiry',
    input: createDefaultScenarioInput({
      orderNumber: undefined,
      orderType: undefined,
      productName: undefined,
      productId: undefined,
      productType: undefined,
      quantity: undefined,
      unitPrice: undefined,
      totalPrice: undefined,
      status: undefined
    })
  },
  {
    id: 'minimal',
    label: 'Minimal inquiry',
    input: {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      message: 'Can you help with a cake order?'
    }
  }
]

const inlineOrderCustomerScenarios = [
  {
    id: 'default',
    label: 'Inline order (full)',
    input: createDefaultScenarioInput()
  },
  {
    id: 'minimal',
    label: 'Inline order (minimal)',
    input: {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      productName: 'Kyiv Cake',
      totalPrice: 45
    }
  }
]

const inlineOrderAdminScenarios = [
  {
    id: 'default',
    label: 'Inline order admin (full)',
    input: createDefaultScenarioInput()
  },
  {
    id: 'with-attachment',
    label: 'Inline order admin (attachment)',
    input: createDefaultScenarioInput({
      attachmentNames: ['design-reference.jpg']
    })
  }
]

const fallbackCustomerScenarios = [
  {
    id: 'default',
    label: 'Fallback customer (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'Order Inquiry Received - Olgish Cakes'
    })
  }
]

const fallbackAdminScenarios = [
  {
    id: 'default',
    label: 'Fallback admin (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'New Order Inquiry'
    })
  }
]

export const contactTemplateDefinitions: Record<string, TemplateDefinition<EmailTemplateCommonInput>> = {
  'contact-admin-inquiry': createTemplateDefinition(
    {
      subject: 'New contact enquiry',
      heading: 'New contact enquiry',
      intro: 'A customer submitted a contact form enquiry.',
      admin: true
    },
    adminInquiryScenarios
  ),
  'contact-inline-order-customer': createTemplateDefinition(
    {
      subject: 'Order request received',
      heading: 'Thank you for choosing Olgish Cakes',
      intro: 'Thank you for your order! We\'ve received your request and will get back to you within 24 hours with confirmation and next steps.',
      admin: false
    },
    inlineOrderCustomerScenarios
  ),
  'contact-inline-order-admin': createTemplateDefinition(
    {
      subject: 'New inline order received',
      heading: 'New inline order received',
      intro: 'A new inline order was submitted.',
      admin: true
    },
    inlineOrderAdminScenarios
  ),
  'contact-inline-order-fallback-customer': createTemplateDefinition(
    {
      subject: 'Order request received',
      heading: 'Thank you for choosing Olgish Cakes',
      intro: 'Thank you for your order! We\'ve received your request and will get back to you within 24 hours with confirmation and next steps.',
      admin: false
    },
    fallbackCustomerScenarios
  ),
  'contact-inline-order-fallback-admin': createTemplateDefinition(
    {
      subject: 'New order inquiry received',
      heading: 'New order inquiry received',
      intro: 'Order creation fallback email was triggered.',
      admin: true
    },
    fallbackAdminScenarios
  )
}
