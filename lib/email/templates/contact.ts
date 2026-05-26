import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { buildCakesByPostAdminContent } from './cakes-by-post-admin'
import { buildCakesByPostCustomerContent } from './cakes-by-post-customer'
import { createDefaultScenarioInput, createTemplateDefinition } from './shared'

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
  'I\'ll review your requested date, cake details, and any design notes within 24 hours.',
  'I\'ll confirm availability, final price, and any design details before you need to pay.',
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
