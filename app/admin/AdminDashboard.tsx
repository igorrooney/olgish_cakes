'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AdminAuthGuard } from '@/components/AdminAuthGuard'
import type { Order } from '@/types/order'

interface OrdersResponse {
  orders?: Order[]
}

interface EarningsResponse {
  totalRevenue?: number
  currentMonth?: number
  averageOrderValue?: number
}

interface QuickStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  currentMonthRevenue: number
  averageOrderValue: number
  recentOrders: Order[]
  nextDueOrder: Order | null
  systemStatus: 'healthy' | 'warning' | 'error'
}

interface AdminResource {
  title: string
  description: string
  href: string
  label: string
  eyebrow: string
  metric: string
  external?: boolean
}

interface StatCard {
  label: string
  value: string
  hint: string
  tone: 'primary' | 'warning' | 'success' | 'info'
}

const activeStatuses = ['new', 'pending', 'confirmed', 'in-progress', 'ready-pickup', 'out-delivery']
const completedStatuses = ['completed', 'delivered']

const adminResources: AdminResource[] = [
  {
    title: 'Orders',
    description: 'Review new enquiries, update statuses, payment details and delivery notes.',
    href: '/admin/orders',
    label: 'Open orders',
    eyebrow: 'Daily work',
    metric: 'Customer queue'
  },
  {
    title: 'Earnings',
    description: 'Track revenue, average order value and monthly order performance.',
    href: '/admin/earnings',
    label: 'View earnings',
    eyebrow: 'Finance',
    metric: 'Revenue view'
  },
  {
    title: 'Email test',
    description: 'Preview customer emails and send controlled transactional test messages.',
    href: '/admin/email-test',
    label: 'Test emails',
    eyebrow: 'Quality',
    metric: 'Message checks'
  },
  {
    title: 'Content Studio',
    description: 'Maintain products, collections, articles and merchandising content.',
    href: '/studio',
    label: 'Open Studio',
    eyebrow: 'Catalogue',
    metric: 'Sanity CMS',
    external: true
  }
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: value >= 1000 ? 0 : 2
  }).format(value)

const formatDate = (value?: string) => {
  if (!value) {
    return 'No date set'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short'
  }).format(new Date(value))
}

const getOrderTotal = (order: Order) => {
  const total = order.pricing?.total
  return typeof total === 'number' && Number.isFinite(total) ? total : 0
}

const normaliseStatus = (status: string) =>
  status
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')

const getStatusBadgeClass = (status: string) => {
  if (completedStatuses.includes(status)) {
    return 'badge-success'
  }

  if (status === 'new' || status === 'pending') {
    return 'badge-warning'
  }

  if (status === 'cancelled' || status === 'refunded') {
    return 'badge-error'
  }

  return 'badge-info'
}

const getStatToneClass = (tone: StatCard['tone']) => {
  if (tone === 'warning') {
    return 'text-warning'
  }

  if (tone === 'success') {
    return 'text-success'
  }

  if (tone === 'info') {
    return 'text-info'
  }

  return 'text-primary'
}

const getCustomerName = (order: Order) => order.customer?.name || 'Unknown customer'

const getOrderReference = (order: Order) => order.orderNumber || order._id

const getNextDueOrder = (orders: Order[]) => {
  const withDates = orders
    .filter((order) => activeStatuses.includes(order.status) && order.delivery?.dateNeeded)
    .sort((first, second) => {
      const firstDate = new Date(first.delivery.dateNeeded || '').getTime()
      const secondDate = new Date(second.delivery.dateNeeded || '').getTime()
      return firstDate - secondDate
    })

  return withDates[0] ?? null
}

function DashboardSkeleton() {
  return (
    <div className='grid gap-6' aria-label='Loading dashboard'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {['orders', 'action', 'completed', 'revenue'].map((item) => (
          <div key={item} className='skeleton h-28 rounded-box' />
        ))}
      </div>
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]'>
        <div className='skeleton h-80 rounded-box' />
        <div className='skeleton h-80 rounded-box' />
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [cacheClearing, setCacheClearing] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [ordersResponse, earningsResponse] = await Promise.all([
          fetch('/api/orders', {
            credentials: 'include',
            signal: controller.signal
          }),
          fetch('/api/admin/earnings', {
            credentials: 'include',
            signal: controller.signal
          })
        ])

        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders')
        }

        if (!earningsResponse.ok) {
          throw new Error('Failed to fetch earnings')
        }

        const ordersData = await ordersResponse.json() as OrdersResponse
        const earningsData = await earningsResponse.json() as EarningsResponse
        const orders = ordersData.orders ?? []

        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((order) => activeStatuses.includes(order.status)).length,
          completedOrders: orders.filter((order) => completedStatuses.includes(order.status)).length,
          totalRevenue: earningsData.totalRevenue ?? 0,
          currentMonthRevenue: earningsData.currentMonth ?? 0,
          averageOrderValue: earningsData.averageOrderValue ?? 0,
          recentOrders: orders.slice(0, 5),
          nextDueOrder: getNextDueOrder(orders),
          systemStatus: 'healthy'
        })
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return
        }

        setError('Dashboard data could not be loaded. Try refreshing the page or open Orders directly.')
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          currentMonthRevenue: 0,
          averageOrderValue: 0,
          recentOrders: [],
          nextDueOrder: null,
          systemStatus: 'error'
        })
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void fetchDashboardData()

    return () => {
      controller.abort()
    }
  }, [])

  const nextDueOrder = stats?.nextDueOrder ?? null

  const statCards = useMemo<StatCard[]>(() => [
    {
      label: 'Total orders',
      value: stats?.totalOrders.toString() ?? '-',
      hint: 'All orders currently available',
      tone: 'primary'
    },
    {
      label: 'Needs action',
      value: stats?.pendingOrders.toString() ?? '-',
      hint: 'New, pending or in progress',
      tone: 'warning'
    },
    {
      label: 'Completed',
      value: stats?.completedOrders.toString() ?? '-',
      hint: 'Delivered or completed orders',
      tone: 'success'
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      hint: `${formatCurrency(stats?.currentMonthRevenue ?? 0)} this month`,
      tone: 'info'
    }
  ], [stats])

  const handleClearCache = async () => {
    const controller = new AbortController()

    setNotice(null)
    setCacheClearing(true)

    try {
      const response = await fetch('/api/admin/clear-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({ pattern: '*' })
      })

      setNotice(response.ok ? 'Cache cleared. Public pages can rebuild with fresh content.' : 'Cache could not be cleared.')
    } catch {
      setNotice('Cache could not be cleared.')
    } finally {
      setCacheClearing(false)
    }
  }

  return (
    <AdminAuthGuard>
      <div className='flex flex-col gap-6'>
        <header className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm lg:p-6'>
          <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='badge badge-primary badge-outline'>Admin workspace</span>
                <span className={`badge ${stats?.systemStatus === 'error' ? 'badge-error' : 'badge-success'}`}>
                  {stats?.systemStatus === 'error' ? 'Needs check' : 'Live'}
                </span>
              </div>
              <h1 className='mt-3 text-3xl font-semibold text-base-content'>Dashboard</h1>
              <p className='mt-2 max-w-3xl text-sm leading-6 text-base-content/70'>
                A focused view of today&apos;s orders, revenue and admin tools, built for quick checks between baking and customer messages.
              </p>
            </div>

            <div className='grid gap-2 sm:grid-cols-2 xl:w-[26rem]'>
              <Link href='/admin/orders' className='btn btn-primary min-h-12'>
                Open orders
              </Link>
              <button
                type='button'
                className='btn btn-outline min-h-12'
                onClick={handleClearCache}
                disabled={cacheClearing}
              >
                {cacheClearing ? 'Clearing...' : 'Clear cache'}
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className='alert alert-error' role='alert'>
            <span>{error}</span>
          </div>
        ) : null}

        {notice ? (
          <div className='alert alert-info' role='status' aria-live='polite'>
            <span>{notice}</span>
          </div>
        ) : null}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4' aria-label='Dashboard summary'>
              {statCards.map((card) => (
                <article key={card.label} className='list-none rounded-box border border-base-300 bg-base-100 p-5 shadow-sm before:hidden after:hidden marker:content-none'>
                  <p className='text-xs uppercase tracking-wide text-base-content/60'>{card.label}</p>
                  <p className={`mt-2 text-3xl font-semibold leading-tight ${getStatToneClass(card.tone)}`}>{card.value}</p>
                  <p className='mt-2 text-sm text-base-content/60'>{card.hint}</p>
                </article>
              ))}
            </section>

            <section className='grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]'>
              <div className='grid gap-4 md:grid-cols-2'>
                {adminResources.map((resource) => (
                  <article key={resource.title} className='card border border-base-300 bg-base-100 shadow-sm'>
                    <div className='card-body gap-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <p className='text-xs font-semibold uppercase tracking-wide text-primary'>{resource.eyebrow}</p>
                          <h2 className='card-title mt-1 text-xl'>{resource.title}</h2>
                        </div>
                        <span className='badge badge-outline whitespace-nowrap'>{resource.metric}</span>
                      </div>
                      <p className='min-h-12 text-sm leading-6 text-base-content/70'>{resource.description}</p>
                      <div className='card-actions justify-end'>
                        {resource.external ? (
                          <a
                            href={resource.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='btn btn-primary btn-sm min-h-11'
                          >
                            {resource.label}
                          </a>
                        ) : (
                          <Link href={resource.href} className='btn btn-primary btn-sm min-h-11'>
                            {resource.label}
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className='card border border-base-300 bg-base-100 shadow-sm'>
                <div className='card-body gap-5'>
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-wide text-primary'>Order desk</p>
                    <h2 className='card-title mt-1 text-xl'>Recent activity</h2>
                    <p className='text-sm text-base-content/60'>Latest orders and the next date that needs attention.</p>
                  </div>

                  <div className='rounded-box border border-base-300 bg-base-200 p-4'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-base-content/60'>Next due</p>
                    {nextDueOrder ? (
                      <div className='mt-2 flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p className='truncate font-semibold'>#{getOrderReference(nextDueOrder)}</p>
                          <p className='truncate text-sm text-base-content/70'>{getCustomerName(nextDueOrder)}</p>
                        </div>
                        <span className='badge badge-warning whitespace-nowrap'>{formatDate(nextDueOrder.delivery.dateNeeded)}</span>
                      </div>
                    ) : (
                      <p className='mt-2 text-sm text-base-content/70'>No active delivery dates in current orders.</p>
                    )}
                  </div>

                  {stats && stats.recentOrders.length > 0 ? (
                    <div className='divide-y divide-base-300 rounded-box border border-base-300'>
                      {stats.recentOrders.map((order) => (
                        <Link
                          key={order._id}
                          href='/admin/orders'
                          className='block p-4 transition-colors hover:bg-base-200 focus:bg-base-200'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0'>
                              <p className='truncate text-sm font-semibold'>#{getOrderReference(order)}</p>
                              <p className='truncate text-sm text-base-content/70'>{getCustomerName(order)}</p>
                              <p className='mt-1 text-xs text-base-content/60'>
                                {formatDate(order.delivery?.dateNeeded)} · {formatCurrency(getOrderTotal(order))}
                              </p>
                            </div>
                            <span className={`badge badge-sm whitespace-nowrap ${getStatusBadgeClass(order.status)}`}>
                              {normaliseStatus(order.status || 'unknown')}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className='rounded-box border border-dashed border-base-300 p-6 text-center'>
                      <p className='font-medium text-base-content'>No recent orders</p>
                      <p className='mt-1 text-sm text-base-content/60'>New website orders will appear here after they are submitted.</p>
                    </div>
                  )}

                  <div className='grid gap-3 rounded-box border border-base-300 bg-base-200 p-4 sm:grid-cols-2'>
                    <div>
                      <p className='text-xs uppercase tracking-wide text-base-content/60'>Average order</p>
                      <p className='mt-1 text-lg font-semibold'>{formatCurrency(stats?.averageOrderValue ?? 0)}</p>
                    </div>
                    <div>
                      <p className='text-xs uppercase tracking-wide text-base-content/60'>Action queue</p>
                      <p className='mt-1 text-lg font-semibold'>{stats?.pendingOrders ?? 0}</p>
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </AdminAuthGuard>
  )
}
