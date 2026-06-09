import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { buildCakesByPostAdminContent } from './cakes-by-post-admin'
import { buildCakesByPostCustomerContent } from './cakes-by-post-customer'
import {
  createDefaultScenarioInput,
  createTemplateDefinition,
  EMAIL_FONT_SANS,
  escapeHtml,
  formatLongDate,
  renderCustomerCard,
  type CustomerEmailContent,
  type CustomerRow
} from './shared'

const cakesByPostBaseInput = createDefaultScenarioInput({
  customerName: 'Igor Ieromenko',
  customerEmail: 'igor@example.com',
  customerPhone: '+44 7867 218241',
  address: '15 Allerton Grange Avenue',
  city: 'Leeds',
  postcode: 'LS17 6PR',
  orderNumber: '26051220022842',
  orderType: 'gift-hamper',
  productName: 'Personalised Congratulations Cake Card',
  productId: 'personalised-congratulations-cake-card',
  productType: 'gift-hamper',
  quantity: 1,
  unitPrice: 8.95,
  totalPrice: 8.95,
  dateNeeded: '2026-05-26',
  occasion: undefined,
  designType: undefined,
  filling: undefined,
  servings: undefined,
  customerMessage: 'test message',
  deliveryMethod: 'postal',
  deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
  paymentMethod: 'card',
  referrer: 'cakes-by-post',
  status: 'new',
  message: 'test message',
  note: undefined,
  giftNote: 'test gift note',
  attachmentNames: [],
  approximateSubmittedFrom: 'Leeds, ENG, GB',
  adminUrl: 'https://olgishcakes.co.uk/admin/orders/26051220022842'
})

const cakeProductBaseInput = createDefaultScenarioInput({
  customerName: 'Olena Shevchenko',
  customerEmail: 'olena@example.com',
  customerPhone: '+44 7123 456789',
  address: '25 Roundhay Road',
  city: 'Leeds',
  postcode: 'LS8 4HS',
  orderNumber: '26051220100501',
  orderType: 'browse-catalog',
  productName: 'Traditional Honey Cake',
  productId: 'traditional-honey-cake',
  productType: 'cake',
  quantity: 1,
  unitPrice: 45,
  totalPrice: 45,
  dateNeeded: '2026-06-20',
  occasion: 'Birthday',
  designType: 'Standard design',
  filling: 'Sour cream',
  servings: 'Serves 8-12 people',
  customerMessage: 'Please add a short birthday message on top.',
  deliveryMethod: 'collection',
  deliveryAddress: '25 Roundhay Road, Leeds, LS8 4HS',
  paymentMethod: 'cash-collection',
  referrer: '/cakes/traditional-honey-cake',
  status: 'new',
  message: [
    'Product: Traditional Honey Cake',
    'Product type: cake',
    'Design type: standard',
    'Filling: Sour cream',
    'Serves 8-12 people',
    'Price: \u00A345',
    'Message: Please add a short birthday message on top.'
  ].join('\n'),
  note: undefined,
  giftNote: 'Happy birthday, Mum!',
  attachmentNames: [],
  approximateSubmittedFrom: 'Leeds, ENG, GB',
  adminUrl: 'https://olgishcakes.co.uk/admin/orders/26051220100501'
})

const cakeProductCustomDesignInput = createDefaultScenarioInput({
  ...cakeProductBaseInput,
  orderNumber: '26051220100944',
  orderType: 'custom-design',
  designType: 'Individual design',
  totalPrice: 59,
  unitPrice: 59,
  customerMessage: 'Can you make it with blue and white flowers and a small sunflower detail?',
  message: [
    'Product: Traditional Honey Cake',
    'Product type: cake',
    'Design type: individual',
    'Filling: Sour cream',
    'Serves 8-12 people',
    'Price: \u00A359',
    'Requirements: Can you make it with blue and white flowers and a small sunflower detail?'
  ].join('\n'),
  giftNote: undefined,
  attachmentNames: ['flower-cake-reference.jpg'],
  adminUrl: 'https://olgishcakes.co.uk/admin/orders/26051220100944'
})

const cakeRequestNextSteps = [
  'We\'ll review your requested date, cake details, and any design notes within 24 hours.',
  'We\'ll confirm availability, final price, and any design details before you need to pay.',
  'Nothing is booked or payable until we agree the design, price, and collection or delivery details.'
]

const cakeProductCustomerInput = {
  ...cakeProductBaseInput,
  status: undefined,
  priceLabel: 'Estimated price',
  intro: 'Thank you. We\'ve received your cake request and will review the details within 24 hours.',
  nextSteps: cakeRequestNextSteps
}

const cakeProductCustomDesignCustomerInput = {
  ...cakeProductCustomDesignInput,
  status: undefined,
  priceLabel: 'Estimated price',
  intro: 'Thank you. We\'ve received your cake request and will review the details within 24 hours.',
  nextSteps: cakeRequestNextSteps
}

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

const customerConfirmationScenarios = [
  {
    id: 'default',
    label: 'General contact customer confirmation',
    input: createDefaultScenarioInput({
      orderNumber: undefined,
      orderType: 'custom-cake-enquiry',
      productName: undefined,
      productId: undefined,
      productType: undefined,
      quantity: undefined,
      unitPrice: undefined,
      totalPrice: undefined,
      status: undefined,
      customerMessage: 'Can you help with a cake order?',
      nextSteps: [
        'We\'ll read your message and check the details you sent.',
        'We\'ll reply with the next practical step as soon as we can.'
      ]
    })
  },
  {
    id: 'minimal',
    label: 'General contact customer confirmation - minimal',
    input: {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerMessage: 'Can you help with a cake order?'
    }
  }
]

function withColon(label: string) {
  return `${label}:`
}

function addCustomerContactRow(rows: CustomerRow[], label: string, value: string | null | undefined) {
  const trimmedValue = value?.trim()
  if (!trimmedValue) {
    return
  }

  rows.push({ label: withColon(label), value: trimmedValue })
}

function renderContactCustomerRowsText(rows: CustomerRow[]) {
  return rows
    .map((entry) => `- ${entry.label.replace(/:$/, '')}: ${entry.value}`)
    .join('\n')
}

function renderContactCustomerFooterHtml() {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #D8D9F3;"><tr><td align="center" style="padding: 20px 0 0 0; text-align: center;"><p style="margin: 0 0 10px 0; color: #1F2937; font-family: ${EMAIL_FONT_SANS}; font-size: 14px; line-height: 22px;">Questions about your enquiry? We're here to help.</p><p style="margin: 0; color: #2E3192; font-family: ${EMAIL_FONT_SANS}; font-size: 14px; font-weight: 700; line-height: 24px;">${escapeHtml('hello@olgishcakes.co.uk')}<br>${escapeHtml('+44 7867 218194')}</p></td></tr></table>`
}

function renderContactCustomerConfirmation(input: EmailTemplateCommonInput): CustomerEmailContent {
  const contactRows: CustomerRow[] = []
  const enquiryRows: CustomerRow[] = []
  const nextSteps = input.nextSteps && input.nextSteps.length > 0
    ? input.nextSteps
    : [
        'We\'ll read your message and check the details you sent.',
        'We\'ll reply with the next practical step as soon as we can.'
      ]

  addCustomerContactRow(contactRows, 'Name', input.customerName)
  addCustomerContactRow(contactRows, 'Email', input.customerEmail)
  addCustomerContactRow(contactRows, 'Phone', input.customerPhone)
  addCustomerContactRow(enquiryRows, 'Address', input.address)
  addCustomerContactRow(enquiryRows, 'City', input.city)
  addCustomerContactRow(enquiryRows, 'Postcode', input.postcode)
  addCustomerContactRow(enquiryRows, 'Topic', input.cakeInterest)
  addCustomerContactRow(enquiryRows, 'Date', formatLongDate(input.dateNeeded))
  addCustomerContactRow(enquiryRows, 'Message', input.customerMessage || input.message)
  addCustomerContactRow(enquiryRows, 'Additional note', input.note)
  addCustomerContactRow(enquiryRows, 'Gift note', input.giftNote)
  addCustomerContactRow(enquiryRows, 'Attachments', input.attachmentNames?.join(', '))

  const nextStepsText = `What happens next\n${nextSteps.map((step) => `- ${step}`).join('\n')}`
  const nextStepsHtml = renderCustomerCard(
    'What happens next',
    nextSteps.map((step, index) => ({ label: `Step ${index + 1}:`, value: step }))
  )

  return {
    bodyText: [
      contactRows.length > 0
        ? `Contact details\n${renderContactCustomerRowsText(contactRows)}`
        : '',
      enquiryRows.length > 0
        ? `Your message\n${renderContactCustomerRowsText(enquiryRows)}`
        : '',
      nextStepsText,
    ].filter((section) => section.length > 0).join('\n\n'),
    bodyHtml: [
      renderCustomerCard('Contact details', contactRows),
      renderCustomerCard('Your message', enquiryRows),
      nextStepsHtml,
      renderContactCustomerFooterHtml()
    ].join('')
  }
}

const inlineOrderCustomerScenarios = [
  {
    id: 'default',
    label: 'Cake product customer email',
    input: cakeProductCustomerInput
  },
  {
    id: 'cakes-by-post',
    label: 'Cakes by post customer',
    input: cakesByPostBaseInput
  },
  {
    id: 'custom-design',
    label: 'Cake product customer email - custom design',
    input: cakeProductCustomDesignCustomerInput
  },
  {
    id: 'minimal',
    label: 'Cake product customer email - minimal details',
    input: {
      customerName: 'Olena Shevchenko',
      customerEmail: 'olena@example.com',
      orderType: 'browse-catalog',
      productName: 'Traditional Honey Cake',
      productId: 'traditional-honey-cake',
      productType: 'cake',
      quantity: 1,
      unitPrice: 45,
      totalPrice: 45,
      priceLabel: 'Estimated price',
      intro: 'Thank you. We\'ve received your cake request and will review the details within 24 hours.',
      nextSteps: cakeRequestNextSteps
    }
  }
]

const inlineOrderAdminScenarios = [
  {
    id: 'default',
    label: 'Cake product admin email',
    input: cakeProductBaseInput
  },
  {
    id: 'cakes-by-post',
    label: 'Cakes by post admin',
    input: cakesByPostBaseInput
  },
  {
    id: 'with-attachment',
    label: 'Cake product admin email - custom design image',
    input: cakeProductCustomDesignInput
  }
]

const fallbackCustomerScenarios = [
  {
    id: 'default',
    label: 'Email to customer if order save fails',
    input: {
      ...cakeProductBaseInput,
      status: undefined,
      priceLabel: 'Estimated price',
      intro: 'Thank you. We\'ve received your cake request and will review the details within 24 hours.',
      nextSteps: cakeRequestNextSteps,
      titleOverride: 'Order request received - Olgish Cakes'
    }
  },
  {
    id: 'cakes-by-post',
    label: 'Cakes by post customer email if order save fails',
    input: {
      ...cakesByPostBaseInput,
      titleOverride: 'Order Inquiry Received - Olgish Cakes'
    }
  }
]

const fallbackAdminScenarios = [
  {
    id: 'default',
    label: 'Email to admin if order save fails',
    input: {
      ...cakeProductBaseInput,
      titleOverride: 'New Order Inquiry'
    }
  },
  {
    id: 'cakes-by-post',
    label: 'Cakes by post admin email if order save fails',
    input: {
      ...cakesByPostBaseInput,
      titleOverride: 'New Order Inquiry'
    }
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
  'contact-customer-confirmation': createTemplateDefinition(
    {
      subject: 'We have received your message',
      heading: 'Thank you for contacting Olgish Cakes',
      intro: 'Thank you, we\'ve received your message and we\'ll get back to you as soon as we can.',
      admin: false
    },
    customerConfirmationScenarios,
    {
      customerContentBuilder: renderContactCustomerConfirmation
    }
  ),
  'contact-inline-order-customer': createTemplateDefinition(
    {
      subject: 'Order request received',
      heading: 'Thank you for choosing Olgish Cakes',
      intro: 'Thank you for your order! We\'ve received your request and will get back to you within 24 hours with confirmation and next steps.',
      admin: false
    },
    inlineOrderCustomerScenarios,
    {
      customerContentBuilder: buildCakesByPostCustomerContent
    }
  ),
  'contact-inline-order-admin': createTemplateDefinition(
    {
      subject: 'New inline order received',
      heading: 'New inline order received',
      intro: 'A new inline order was submitted.',
      admin: true
    },
    inlineOrderAdminScenarios,
    {
      adminContentBuilder: buildCakesByPostAdminContent
    }
  ),
  'contact-inline-order-fallback-customer': createTemplateDefinition(
    {
      subject: 'Order request received',
      heading: 'Thank you for choosing Olgish Cakes',
      intro: 'Thank you for your order! We\'ve received your request and will get back to you within 24 hours with confirmation and next steps.',
      admin: false
    },
    fallbackCustomerScenarios,
    {
      customerContentBuilder: buildCakesByPostCustomerContent
    }
  ),
  'contact-inline-order-fallback-admin': createTemplateDefinition(
    {
      subject: 'New order inquiry received',
      heading: 'New order inquiry received',
      intro: 'Order creation fallback email was triggered.',
      admin: true
    },
    fallbackAdminScenarios,
    {
      adminContentBuilder: buildCakesByPostAdminContent
    }
  )
}
