#!/usr/bin/env tsx
/**
 * Script to find orders by email address
 * Usage: pnpm tsx scripts/find-order-by-email.ts <email>
 */

import { serverClient } from '../sanity/lib/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

async function findOrdersByEmail(email: string) {
  try {
    console.log(`🔍 Searching for orders with email: ${email}`)

    // Find orders by email (case-insensitive search)
    const orders = await serverClient.fetch(
      `*[_type == "order" && customer.email match "*${email.toLowerCase()}*"] | order(_createdAt desc)[0...10]{
        _id,
        orderNumber,
        _createdAt,
        status,
        customer{
          name,
          email,
          phone
        },
        pricing{
          total
        },
        items[]{
          productName,
          quantity,
          totalPrice
        }
      }`
    )

    if (!orders || orders.length === 0) {
      console.log(`❌ No orders found for email: ${email}`)
      console.log(`\n💡 Try checking:`)
      console.log(`   - Check for typos in the email address`)
      console.log(`   - Check if the order was created with a different email`)
      console.log(`   - Check the admin dashboard at /admin/orders`)
      process.exit(1)
    }

    console.log(`\n✅ Found ${orders.length} order(s):\n`)

    orders.forEach((order: any, index: number) => {
      console.log(`${index + 1}. Order #${order.orderNumber}`)
      console.log(`   Created: ${new Date(order._createdAt).toLocaleString('en-GB')}`)
      console.log(`   Status: ${order.status || 'new'}`)
      console.log(`   Customer: ${order.customer.name} (${order.customer.email})`)
      console.log(`   Total: £${order.pricing?.total || 0}`)
      console.log(`   Items: ${order.items?.length || 0} item(s)`)
      if (order.items && order.items.length > 0) {
        order.items.forEach((item: any) => {
          console.log(`      - ${item.productName || 'Custom'} x${item.quantity || 1} - £${item.totalPrice || 0}`)
        })
      }
      console.log(`   Order ID: ${order._id}`)
      console.log(`\n   To resend confirmation email, run:`)
      console.log(`   pnpm tsx scripts/resend-order-email.ts ${order.orderNumber}\n`)
      console.log('─'.repeat(60))
    })

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Get command line arguments
const email = process.argv[2]

if (!email) {
  console.error('Usage: pnpm tsx scripts/find-order-by-email.ts <email>')
  console.error('Example: pnpm tsx scripts/find-order-by-email.ts customer@example.com')
  process.exit(1)
}

findOrdersByEmail(email)

