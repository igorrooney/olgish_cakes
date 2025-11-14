#!/usr/bin/env tsx
/**
 * Script to resend order confirmation email
 * Usage: pnpm tsx scripts/resend-order-email.ts <orderNumber> [email]
 */

import { Resend } from 'resend'
import { serverClient } from '../sanity/lib/client'
import { urlFor } from '../sanity/lib/image'
import { PHONE_UTILS } from '../lib/constants'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const resend = new Resend(process.env.RESEND_API_KEY)

async function resendOrderEmail(orderNumber: string, targetEmail?: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured')
      process.exit(1)
    }

    // Find order by order number
    const order = await serverClient.fetch(
      `*[_type == "order" && orderNumber == "${orderNumber}"][0]{
        _id,
        orderNumber,
        status,
        customer,
        items,
        delivery,
        pricing,
        messages,
        metadata
      }`
    )

    if (!order) {
      console.error(`❌ Order #${orderNumber} not found`)
      process.exit(1)
    }

    console.log(`✅ Found order #${order.orderNumber} for ${order.customer.email}`)

    const emailTo = targetEmail || order.customer.email
    console.log(`📧 Sending confirmation email to: ${emailTo}`)

    // Generate order summary HTML (simplified version)
    const itemsHtml = order.items?.map((item: any) => `
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${item.productName || 'Custom Product'}</h4>
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
                      Dear <strong>${order.customer.name}</strong>,
                    </p>
                    <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      Thank you for your order! We've received your request and will get back to you within 24 hours with confirmation and next steps.
                    </p>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Order Summary</h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Order Number</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">#${order.orderNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Status</td>
                          <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">${order.status || 'New Order'}</td>
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
      html: emailHtml,
    })

    if (result.error) {
      console.error('❌ Email error:', result.error)
      process.exit(1)
    }

    console.log('✅ Confirmation email sent successfully!')
    console.log(`   Email ID: ${result.data?.id}`)
    console.log(`   Sent to: ${emailTo}`)

  } catch (error) {
    console.error('❌ Error:', error)
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

