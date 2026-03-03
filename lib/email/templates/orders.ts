import type { EmailTemplateCommonInput, TemplateDefinition } from '../types'
import { createDefaultScenarioInput, createTemplateDefinition } from './shared'

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
    statusUpdateScenarios
  )
}