#!/usr/bin/env tsx
/**
 * Script to resend order confirmation email
 * Usage: pnpm tsx scripts/resend-order-email.ts <orderNumber> [email]
 */

import { Resend } from 'resend'
import { serverClient } from '../sanity/lib/client'
import { PHONE_UTILS } from '../lib/constants'
import { toSafeEmailProviderError } from '../lib/email/safe-error'
import { RESEND_ORDER_EMAIL_QUERY } from '../lib/queries/orderEmail.js'
import { toSafeOperationalError } from '../lib/security/safe-operational-error'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const resend = new Resend(process.env.RESEND_API_KEY)

type ResendOrderItem = {
  productName?: string
  totalPrice?: number
  unitPrice?: number
  quantity?: number
}

type ResendOrder = {
  _id: string
  orderNumber: string
  status?: string
  customer: {
    name: string
    email: string
  }
  items?: ResendOrderItem[]
  pricing?: {
    total?: number
  }
}

const orderReferencePattern = /^[A-Za-z0-9-]{1,64}$/

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function logOperationalError(
  operation: string,
  error: unknown,
  recordReference?: string,
  providerResponse = false
) {
  const safeError = providerResponse
    ? toSafeEmailProviderError(error)
    : toSafeOperationalError(error)

  console.error('Order email operation failed', {
    operation,
    ...safeError,
    ...(recordReference ? { recordReference } : {})
  })
}

async function resendOrderEmail(orderNumber: string, targetEmail?: string) {
  try {
    if (!orderReferencePattern.test(orderNumber)) {
      console.error('Order email operation failed', {
        operation: 'order-email.validate-reference',
        code: 'INVALID_RECORD_REFERENCE'
      })
      process.exit(1)
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('Order email operation failed', {
        operation: 'order-email.send',
        code: 'EMAIL_TRANSPORT_NOT_CONFIGURED',
        recordReference: orderNumber
      })
      process.exit(1)
    }

    // Find order by order number
    const order = await serverClient.fetch<ResendOrder | null>(
      RESEND_ORDER_EMAIL_QUERY,
      { orderNumber }
    )

    if (!order) {
      console.error('Order email operation failed', {
        operation: 'order-email.fetch',
        code: 'RECORD_NOT_FOUND',
        recordReference: orderNumber
      })
      process.exit(1)
    }

    console.log('Order found', {
      operation: 'order-email.fetch',
      recordReference: orderNumber
    })

    const emailTo = targetEmail || order.customer.email

    // Generate order summary HTML (simplified version)
    const itemsHtml = order.items?.map((item) => `
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${escapeHtml(item.productName || 'Custom Product')}</h4>
        <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 700;">£${item.totalPrice || item.unitPrice || 0}</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Quantity: ${item.quantity || 1}
        </p>
      </div>
    `).join('') || '<p>No items found</p>'

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Olgish Cakes</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #2E3192 0%, #1a237e 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      🎂 Order Confirmation
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #e3f2fd; font-size: 16px;">
                      Thank you for choosing Olgish Cakes
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Dear <strong>${escapeHtml(order.customer.name)}</strong>,
                    </p>
                    <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      Thank you for your order! We've received your request and will reply as soon as we can with confirmation and next steps.
                    </p>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Order Summary</h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Order Number</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">#${escapeHtml(order.orderNumber)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Status</td>
                          <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(order.status || 'New Order')}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Total Amount</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: 700; text-align: right;">£${order.pricing?.total || 0}</td>
                        </tr>
                      </table>
                    </div>
                    <div style="margin-bottom: 32px;">
                      <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Your Order</h3>
                      ${itemsHtml}
                    </div>
                    <div style="text-align: center; padding: 24px 0; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
                        Questions about your order? We're here to help!
                      </p>
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 14px;">
                        📧 <a href="mailto:hello@olgishcakes.co.uk" style="color: #2E3192; text-decoration: none; font-weight: 500;">hello@olgishcakes.co.uk</a><br>
                        📞 <a href="${PHONE_UTILS.telLink}" style="color: #2E3192; text-decoration: none; font-weight: 500;">${PHONE_UTILS.displayPhone}</a>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} Olgish Cakes. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const result = await resend.emails.send({
      from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
      to: emailTo,
      subject: `Order Confirmation #${order.orderNumber} - Olgish Cakes`,
      html: emailHtml
    })

    if (result.error) {
      logOperationalError('order-email.send', result.error, orderNumber, true)
      process.exit(1)
    }

    console.log('Confirmation email sent', {
      operation: 'order-email.send',
      recordReference: orderNumber
    })
  } catch (error) {
    logOperationalError(
      'order-email.run',
      error,
      orderReferencePattern.test(orderNumber) ? orderNumber : undefined
    )
    process.exit(1)
  }
}

// Get command line arguments
const orderNumber = process.argv[2]
const targetEmail = process.argv[3]

if (!orderNumber) {
  console.error('Usage: pnpm tsx scripts/resend-order-email.ts <orderNumber> [email]')
  console.error('Example: pnpm tsx scripts/resend-order-email.ts OC123456789')
  console.error('Example: pnpm tsx scripts/resend-order-email.ts OC123456789 customer@example.com')
  process.exit(1)
}

resendOrderEmail(orderNumber, targetEmail)

