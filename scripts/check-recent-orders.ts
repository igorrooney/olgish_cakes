#!/usr/bin/env tsx
/**
 * Script to check recent orders and their email status
 * Usage: pnpm tsx scripts/check-recent-orders.ts [limit]
 */

import { serverClient } from '../sanity/lib/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

async function checkRecentOrders(limit: number = 5) {
  try {
    console.log(`🔍 Checking last ${limit} orders...\n`)

    const orders = await serverClient.fetch(
      `*[_type == "order"] | order(_createdAt desc)[0...${limit}]{
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
        metadata{
          emailSent,
          emailError,
          emailAttemptedAt,
          source
        },
        items[]{
          productName,
          quantity
        }
      }`
    )

    if (!orders || orders.length === 0) {
      console.log('❌ No orders found')
      return
    }

    console.log(`✅ Found ${orders.length} order(s):\n`)
    console.log('='.repeat(80))

    orders.forEach((order: any, index: number) => {
      const createdDate = new Date(order._createdAt)
      const timeAgo = getTimeAgo(createdDate)
      
      console.log(`\n${index + 1}. Order #${order.orderNumber}`)
      console.log(`   Created: ${createdDate.toLocaleString('en-GB')} (${timeAgo})`)
      console.log(`   Status: ${order.status || 'new'}`)
      console.log(`   Customer: ${order.customer.name}`)
      console.log(`   Email: ${order.customer.email}`)
      console.log(`   Total: £${order.pricing?.total || 0}`)
      
      // Email status
      if (order.metadata?.emailSent === true) {
        console.log(`   ✅ Email Status: SENT`)
        if (order.metadata?.emailAttemptedAt) {
          console.log(`   📧 Sent at: ${new Date(order.metadata.emailAttemptedAt).toLocaleString('en-GB')}`)
        }
      } else if (order.metadata?.emailSent === false) {
        console.log(`   ❌ Email Status: FAILED`)
        if (order.metadata?.emailError) {
          console.log(`   ⚠️  Error: ${order.metadata.emailError}`)
        }
        if (order.metadata?.emailAttemptedAt) {
          console.log(`   📧 Attempted at: ${new Date(order.metadata.emailAttemptedAt).toLocaleString('en-GB')}`)
        }
        console.log(`\n   💡 To resend email, run:`)
        console.log(`   pnpm tsx scripts/resend-order-email.ts ${order.orderNumber}`)
      } else {
        console.log(`   ⚠️  Email Status: UNKNOWN (metadata not set)`)
        console.log(`   💡 This might be an older order before email tracking was added`)
        console.log(`\n   💡 To send email, run:`)
        console.log(`   pnpm tsx scripts/resend-order-email.ts ${order.orderNumber}`)
      }
      
      if (order.items && order.items.length > 0) {
        console.log(`   Items:`)
        order.items.forEach((item: any) => {
          console.log(`      - ${item.productName || 'Custom'} x${item.quantity || 1}`)
        })
      }
      
      console.log('\n' + '─'.repeat(80))
    })

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

// Get command line arguments
const limit = parseInt(process.argv[2]) || 5

checkRecentOrders(limit)

