import { isAdminAuthenticated } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import {
  listSupabaseOrderEarningsSummaries,
  type OrderEarningsSummary
} from '@/lib/orders/supabase-orders'
import { NextRequest, NextResponse } from 'next/server'

interface HistoricalMonthlyData {
  year: number
  month: string
  earnings: number
  ordersCount: number
  averageOrderValue: number
}

const monthOrder = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function isRevenueOrder(order: OrderEarningsSummary): boolean {
  return order.status !== 'cancelled' &&
    order.paymentStatus !== 'cancelled' &&
    (
      order.status === 'completed' ||
      order.status === 'delivered' ||
      order.paymentStatus === 'paid' ||
      ['delivered', 'completed'].includes(order.paymentStatus)
    )
}

function getOrderTotal(order: OrderEarningsSummary): number {
  return typeof order.total === 'number' && Number.isFinite(order.total) ? order.total : 0
}

function sumRevenue(orders: OrderEarningsSummary[]): number {
  return orders
    .filter(isRevenueOrder)
    .reduce((sum, order) => sum + getOrderTotal(order), 0)
}

function getNonCancelledOrders(orders: OrderEarningsSummary[]): OrderEarningsSummary[] {
  return orders.filter((order) => order.status !== 'cancelled')
}

export async function GET(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated(request)
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1)
    const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1)
    const allOrders = await listSupabaseOrderEarningsSummaries()

    const currentMonthOrders = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= firstDayCurrentMonth
    })

    const lastMonthOrders = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= firstDayLastMonth && orderDate < firstDayCurrentMonth
    })

    const nonCancelledOrders = getNonCancelledOrders(allOrders)
    const totalOrders = nonCancelledOrders.length
    const averageOrderValue = totalOrders > 0
      ? nonCancelledOrders.reduce((sum, order) => sum + getOrderTotal(order), 0) / totalOrders
      : 0

    const monthlyGroups = allOrders.reduce<Record<string, OrderEarningsSummary[]>>((groups, order) => {
      const orderDate = new Date(order.createdAt)
      const year = orderDate.getFullYear()
      const month = orderDate.toLocaleString('default', { month: 'long' })
      const key = `${year}-${month}`

      return {
        ...groups,
        [key]: [...(groups[key] || []), order]
      }
    }, {})

    const currentMonthName = now.toLocaleString('default', { month: 'long' })
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthName = lastMonth.toLocaleString('default', { month: 'long' })
    const lastYear = lastMonth.getFullYear()

    const historicalMonthlyData: HistoricalMonthlyData[] = Object.entries(monthlyGroups)
      .filter(([key]) => {
        const [year, month] = key.split('-')
        const orderYear = parseInt(year, 10)

        return !(orderYear === currentYear && month === currentMonthName) &&
          !(orderYear === lastYear && month === lastMonthName)
      })
      .map(([key, orders]) => {
        const [year, month] = key.split('-')
        const nonCancelledMonthlyOrders = getNonCancelledOrders(orders)
        const ordersCount = nonCancelledMonthlyOrders.length
        const totalValue = nonCancelledMonthlyOrders.reduce((sum, order) => sum + getOrderTotal(order), 0)

        return {
          year: parseInt(year, 10),
          month,
          earnings: sumRevenue(orders),
          ordersCount,
          averageOrderValue: ordersCount > 0 ? totalValue / ordersCount : 0
        }
      })
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year
        }

        return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month)
      })

    return NextResponse.json({
      currentMonth: sumRevenue(currentMonthOrders),
      lastMonth: sumRevenue(lastMonthOrders),
      totalRevenue: sumRevenue(allOrders),
      totalOrders,
      averageOrderValue,
      currentMonthOrdersCount: getNonCancelledOrders(currentMonthOrders).length,
      lastMonthOrdersCount: getNonCancelledOrders(lastMonthOrders).length,
      historicalMonthlyData
    })
  } catch (error) {
    logger.error('Failed to fetch earnings', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    )
  }
}
