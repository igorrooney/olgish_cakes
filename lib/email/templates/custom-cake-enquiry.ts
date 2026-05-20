import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { createDefaultScenarioInput, createTemplateDefinition } from './shared'

const adminScenarios = [
  {
    id: 'homepage-default',
    label: 'Email to admin - homepage enquiry',
    input: createDefaultScenarioInput({
      titleOverride: 'Custom Cake Enquiry: Olena Shevchenko',
      customerName: 'Olena Shevchenko',
      customerEmail: 'olena@example.com',
      customerPhone: '+44 7123 456789',
      address: '25 Roundhay Road',
      city: 'Leeds',
      postcode: 'LS8 4HS',
      dateNeeded: '2026-06-20',
      occasion: 'Birthday',
      customerMessage: 'I would like a honey cake for 12 people with soft floral decoration and a short birthday message.',
      productName: undefined,
      productId: undefined,
      productType: undefined,
      orderNumber: undefined,
      orderType: undefined,
      quantity: undefined,
      unitPrice: undefined,
      totalPrice: undefined,
      designType: undefined,
      filling: undefined,
      servings: undefined,
      deliveryMethod: undefined,
      deliveryAddress: undefined,
      paymentMethod: undefined,
      status: undefined,
      message: undefined,
      note: undefined,
      giftNote: undefined,
      attachmentNames: ['floral-cake-reference.jpg'],
      adminUrl: 'https://olgishcakes.co.uk/admin/enquiries/custom-cake-26062026'
    })
  },
  {
    id: 'quote-default',
    label: 'Email to admin - get custom quote',
    input: createDefaultScenarioInput({
      titleOverride: 'Custom Cake Quote Request: Anna Brown',
      customerName: 'Anna Brown',
      customerEmail: 'anna@example.com',
      customerPhone: '+44 7988 123456',
      address: '14 King Street',
      city: 'York',
      postcode: 'YO1 9SP',
      dateNeeded: '2026-07-05',
      occasion: 'Wedding',
      customerMessage: 'Please quote for a two-tier Kyiv style cake for 30 guests. I prefer white and gold decoration.',
      productName: undefined,
      productId: undefined,
      productType: undefined,
      orderNumber: undefined,
      orderType: undefined,
      quantity: undefined,
      unitPrice: undefined,
      totalPrice: undefined,
      designType: undefined,
      filling: undefined,
      servings: undefined,
      deliveryMethod: undefined,
      deliveryAddress: undefined,
      paymentMethod: undefined,
      status: undefined,
      message: undefined,
      note: undefined,
      giftNote: undefined,
      attachmentNames: ['wedding-cake-reference.jpg'],
      adminUrl: 'https://olgishcakes.co.uk/admin/enquiries/quote-05072026'
    })
  }
]

const customerScenarios = [
  {
    id: 'homepage-default',
    label: 'Email to customer - homepage enquiry',
    input: createDefaultScenarioInput({
      titleOverride: 'Thank you for your custom cake enquiry',
      customerName: 'Olena Shevchenko',
      customerEmail: 'olena@example.com',
      customerPhone: '+44 7123 456789',
      address: '25 Roundhay Road',
      city: 'Leeds',
      postcode: 'LS8 4HS',
      orderType: 'custom-cake-enquiry',
      dateNeeded: '2026-06-20',
      occasion: 'Birthday',
      customerMessage: 'I would like a honey cake for 12 people with soft floral decoration and a short birthday message.',
      productName: undefined,
      productId: undefined,
      productType: undefined,
      orderNumber: undefined,
      quantity: undefined,
      unitPrice: undefined,
      totalPrice: undefined,
      designType: undefined,
      filling: undefined,
      servings: undefined,
      deliveryMethod: undefined,
      deliveryAddress: undefined,
      paymentMethod: undefined,
      status: undefined,
      message: 'Date needed: 20/06/2026',
      note: undefined,
      giftNote: undefined,
      attachmentNames: ['floral-cake-reference.jpg'],
      nextSteps: [
        'I\'ll check the date, your notes and the delivery details.',
        'I\'ll reply with availability, any questions, and a quote if I can make it for that date.',
        'Nothing is booked or payable until we agree the design, price and collection or delivery details.'
      ]
    })
  },
  {
    id: 'homepage-minimal',
    label: 'Email to customer - minimal homepage enquiry',
    input: {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      orderType: 'custom-cake-enquiry',
      occasion: 'Birthday',
      dateNeeded: '2026-06-20',
      customerMessage: 'Need a custom cake with floral style.',
      message: 'Date needed: 20/06/2026',
      nextSteps: [
        'I\'ll check the date, your notes and the delivery details.',
        'I\'ll reply with availability, any questions, and a quote if I can make it for that date.',
        'Nothing is booked or payable until we agree the design, price and collection or delivery details.'
      ]
    }
  },
  {
    id: 'quote-default',
    label: 'Email to customer - get custom quote',
    input: createDefaultScenarioInput({
      titleOverride: 'Thank you for your custom cake enquiry',
      customerName: 'Anna Brown',
      customerEmail: 'anna@example.com',
      customerPhone: '+44 7988 123456',
      address: '14 King Street',
      city: 'York',
      postcode: 'YO1 9SP',
      orderType: 'custom-cake-enquiry',
      dateNeeded: '2026-07-05',
      occasion: 'Wedding',
      customerMessage: 'Please quote for a two-tier Kyiv style cake for 30 guests. I prefer white and gold decoration.',
      productName: undefined,
      productId: undefined,
      productType: undefined,
      orderNumber: undefined,
      quantity: undefined,
      unitPrice: undefined,
      totalPrice: undefined,
      designType: undefined,
      filling: undefined,
      servings: undefined,
      deliveryMethod: undefined,
      deliveryAddress: undefined,
      paymentMethod: undefined,
      status: undefined,
      message: 'Date needed: 05/07/2026',
      note: undefined,
      giftNote: undefined,
      attachmentNames: ['wedding-cake-reference.jpg'],
      nextSteps: [
        'I\'ll check the date, your notes and the delivery details.',
        'I\'ll reply with availability, any questions, and a quote if I can make it for that date.',
        'Nothing is booked or payable until we agree the design, price and collection or delivery details.'
      ]
    })
  },
  {
    id: 'quote-minimal',
    label: 'Email to customer - minimal quote enquiry',
    input: {
      customerName: 'Anna Brown',
      customerEmail: 'anna@example.com',
      orderType: 'custom-cake-enquiry',
      occasion: 'Wedding',
      dateNeeded: '2026-07-05',
      customerMessage: 'Please quote for a two-tier cake.',
      message: 'Date needed: 05/07/2026',
      nextSteps: [
        'I\'ll check the date, your notes and the delivery details.',
        'I\'ll reply with availability, any questions, and a quote if I can make it for that date.',
        'Nothing is booked or payable until we agree the design, price and collection or delivery details.'
      ]
    }
  }
]

const failureAlertScenarios = [
  {
    id: 'default',
    label: 'Internal failure alert',
    input: createDefaultScenarioInput({
      titleOverride: 'Custom Cake Enquiry Alert: Test Customer',
      productName: 'Custom Cake Enquiry Failure Alert',
      intro: 'A custom cake enquiry was saved, but one or more follow-up notifications failed.',
      message: 'Failed notifications: admin email',
      note: 'Enquiry saved in the database. Provider error: Transport did not accept admin email.'
    })
  }
]

export const customCakeTemplateDefinitions: Record<string, TemplateDefinition<EmailTemplateCommonInput>> = {
  'custom-cake-enquiry-admin': createTemplateDefinition(
    {
      subject: 'New custom cake enquiry',
      heading: 'New custom cake enquiry',
      intro: 'A customer submitted a custom cake enquiry.',
      admin: true
    },
    adminScenarios
  ),
  'custom-cake-enquiry-customer': createTemplateDefinition(
    {
      subject: 'Custom cake enquiry received',
      heading: 'Custom cake enquiry received',
      intro: 'Thank you for your custom cake enquiry. We\'ve received your details and will check availability before getting back to you.',
      admin: false
    },
    customerScenarios
  ),
  'custom-cake-enquiry-failure-alert': createTemplateDefinition(
    {
      subject: 'Custom cake enquiry notification failure',
      heading: 'Custom cake enquiry notification failure',
      intro: 'A custom cake enquiry was saved, but one or more notification steps failed.',
      admin: true
    },
    failureAlertScenarios
  )
}
