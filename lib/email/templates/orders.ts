import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { buildCakesByPostStatusUpdateContent } from './cakes-by-post-customer'
import { createDefaultScenarioInput, createTemplateDefinition } from './shared'

const cakesByPostConfirmedInput = createDefaultScenarioInput({
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
  paymentStatus: 'pending',
  referrer: 'cakes-by-post',
  status: 'confirmed',
  message: 'test message',
  note: undefined,
  giftNote: 'test gift note',
  attachmentNames: [],
  titleOverride: 'Order Request Confirmed #26051220022842 - Olgish Cakes',
  headingOverride: 'Order request confirmed',
  statusMessage: 'Great news, we\'ve confirmed your cakes by post request.'
})

const customerConfirmationScenarios = [
  {
    id: 'default',
    label: 'Customer confirmation (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'Order Confirmation #OC-2026-1001 - Olgish Cakes'
    })
  }
]

const adminNotificationScenarios = [
  {
    id: 'default',
    label: 'Admin notification (default)',
    input: createDefaultScenarioInput({
      titleOverride: 'New inline order #OC-2026-1001 from Test Customer'
    })
  }
]

const statusUpdateScenarios = [
  {
    id: 'confirmed',
    label: 'Status: confirmed',
    input: createDefaultScenarioInput({
      status: 'confirmed',
      titleOverride: 'Order Confirmed #OC-2026-1001 - Olgish Cakes',
      statusMessage: 'Great news! Your order has been confirmed and we are now preparing your delicious cake.'
    })
  },
  {
    id: 'cakes-by-post-confirmed',
    label: 'Cakes by post: confirmed',
    input: cakesByPostConfirmedInput
  },
  {
    id: 'cakes-by-post-in-progress',
    label: 'Cakes by post: in progress',
    input: {
      ...cakesByPostConfirmedInput,
      status: 'in-progress',
      titleOverride: 'Order in Progress #26051220022842 - Olgish Cakes',
      headingOverride: 'Order in progress',
      statusMessage: 'Your cakes by post order is now being prepared.'
    }
  },
  {
    id: 'cakes-by-post-ready',
    label: 'Cakes by post: ready',
    input: {
      ...cakesByPostConfirmedInput,
      status: 'ready',
      titleOverride: 'Order Ready #26051220022842 - Olgish Cakes',
      headingOverride: 'Order ready',
      statusMessage: 'Your cakes by post order is ready for dispatch.'
    }
  },
  {
    id: 'cakes-by-post-out-for-delivery',
    label: 'Cakes by post: dispatched',
    input: {
      ...cakesByPostConfirmedInput,
      status: 'out-for-delivery',
      titleOverride: 'Order Dispatched #26051220022842 - Olgish Cakes',
      headingOverride: 'Order dispatched',
      statusMessage: 'Great news, your cakes by post order has been dispatched with Evri.',
      deliveryCourier: 'evri',
      trackingNumber: 'TRACK-123456'
    }
  },
  {
    id: 'cakes-by-post-delivered',
    label: 'Cakes by post: delivered',
    input: {
      ...cakesByPostConfirmedInput,
      status: 'delivered',
      titleOverride: 'Order Delivered #26051220022842 - Olgish Cakes',
      headingOverride: 'Order delivered',
      statusMessage: 'Your cakes by post order has been delivered. We hope it arrived safely and is enjoyed.'
    }
  },
  {
    id: 'cakes-by-post-completed',
    label: 'Cakes by post: completed',
    input: {
      ...cakesByPostConfirmedInput,
      status: 'completed',
      titleOverride: 'Order Completed #26051220022842 - Olgish Cakes',
      headingOverride: 'Order completed',
      statusMessage: 'Thank you for choosing Olgish Cakes. Your cakes by post order has been completed.'
    }
  },
  {
    id: 'cakes-by-post-cancelled',
    label: 'Cakes by post: cancelled',
    input: {
      ...cakesByPostConfirmedInput,
      status: 'cancelled',
      titleOverride: 'Order Cancelled #26051220022842 - Olgish Cakes',
      headingOverride: 'Order cancelled',
      statusMessage: 'Your cakes by post order has been cancelled. If you have any questions, please contact us and we\'ll help.'
    }
  },
  {
    id: 'in-progress',
    label: 'Status: in-progress',
    input: createDefaultScenarioInput({
      status: 'in-progress',
      titleOverride: 'Order in Progress #OC-2026-1001 - Olgish Cakes',
      statusMessage: 'Your order is now being prepared in our kitchen.'
    })
  },
  {
    id: 'ready',
    label: 'Status: ready',
    input: createDefaultScenarioInput({
      status: 'ready',
      titleOverride: 'Order Ready #OC-2026-1001 - Olgish Cakes',
      statusMessage: 'Your order is ready for collection or dispatch.'
    })
  },
  {
    id: 'out-for-delivery',
    label: 'Status: out for delivery',
    input: createDefaultScenarioInput({
      status: 'out-for-delivery',
      titleOverride: 'Order Out for Delivery #OC-2026-1001 - Olgish Cakes',
      statusMessage: 'Your order is out for delivery and will arrive soon.',
      trackingNumber: 'TRACK-123456'
    })
  },
  {
    id: 'delivered',
    label: 'Status: delivered',
    input: createDefaultScenarioInput({
      status: 'delivered',
      titleOverride: 'Order Delivered #OC-2026-1001 - Olgish Cakes',
      statusMessage: 'Your order has been delivered. We hope you enjoy it.'
    })
  },
  {
    id: 'completed',
    label: 'Status: completed',
    input: createDefaultScenarioInput({
      status: 'completed',
      titleOverride: 'Order Completed #OC-2026-1001 - Olgish Cakes',
      statusMessage: 'Thank you for choosing Olgish Cakes. Your order has been completed.'
    })
  },
  {
    id: 'cancelled',
    label: 'Status: cancelled',
    input: createDefaultScenarioInput({
      status: 'cancelled',
      titleOverride: 'Order Cancelled #OC-2026-1001 - Olgish Cakes',
      statusMessage: 'We\'re sorry, your order has been cancelled.'
    })
  }
]

export const ordersTemplateDefinitions: Record<string, TemplateDefinition<EmailTemplateCommonInput>> = {
  'orders-customer-confirmation': createTemplateDefinition(
    {
      subject: 'Order confirmation',
      heading: 'Order confirmed',
      intro: 'Thank you for your order with Olgish Cakes.',
      admin: false
    },
    customerConfirmationScenarios
  ),
  'orders-admin-notification': createTemplateDefinition(
    {
      subject: 'New order created',
      heading: 'New order created',
      intro: 'A new order has been created in the system.',
      admin: true
    },
    adminNotificationScenarios
  ),
  'orders-status-update': createTemplateDefinition(
    {
      subject: 'Order status update',
      heading: 'Order status update',
      intro: 'The order status has been updated.',
      admin: false
    },
    statusUpdateScenarios,
    {
      customerContentBuilder: buildCakesByPostStatusUpdateContent
    }
  )
}
