'use client'

import { useEffect, useMemo, useState } from 'react'

interface EarningsData {
  currentMonth: number
  lastMonth: number
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  currentMonthOrdersCount: number
  lastMonthOrdersCount: number
  historicalMonthlyData: MonthlyData[]
}

interface MonthlyData {
  month: string
  year: number
  earnings: number
  ordersCount: number
  averageOrderValue: number
}

interface MonthOption {
  value: string
  label: string
}

interface SelectedMonthData {
  earnings: number
  ordersCount: number
  averageOrderValue: number
  monthName: string
}

const initialEarnings: EarningsData = {
  currentMonth: 0,
  lastMonth: 0,
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  currentMonthOrdersCount: 0,
  lastMonthOrdersCount: 0,
  historicalMonthlyData: []
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount)

function generateMonthOptions(): MonthOption[] {
  const options: MonthOption[] = [
    { value: 'all', label: 'All months' },
    { value: 'current', label: 'Current month' },
    { value: 'last', label: 'Last month' }
  ]

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  for (let monthIndex = currentMonth; monthIndex >= 0; monthIndex -= 1) {
    const date = new Date(currentYear, monthIndex)
    options.push({
      value: `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    })
  }

  if (currentMonth < 11) {
    for (let monthIndex = 11; monthIndex >= currentMonth + 1; monthIndex -= 1) {
      const date = new Date(currentYear - 1, monthIndex)
      options.push({
        value: `${currentYear - 1}-${String(monthIndex + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      })
    }
  }

  return options
}

function getMonthName(value: string): string {
  const [year, month] = value.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  })
}

function getSelectedMonthData(
  selectedMonth: string,
  earnings: EarningsData,
  monthlyData: MonthlyData[]
): SelectedMonthData {
  if (selectedMonth === 'all') {
    return {
      earnings: earnings.totalRevenue,
      ordersCount: earnings.totalOrders,
      averageOrderValue: earnings.averageOrderValue,
      monthName: 'All months'
    }
  }

  if (selectedMonth === 'current') {
    return {
      earnings: earnings.currentMonth,
      ordersCount: earnings.currentMonthOrdersCount,
      averageOrderValue: earnings.currentMonthOrdersCount > 0
        ? earnings.currentMonth / earnings.currentMonthOrdersCount
        : 0,
      monthName: 'Current month'
    }
  }

  if (selectedMonth === 'last') {
    return {
      earnings: earnings.lastMonth,
      ordersCount: earnings.lastMonthOrdersCount,
      averageOrderValue: earnings.lastMonthOrdersCount > 0
        ? earnings.lastMonth / earnings.lastMonthOrdersCount
        : 0,
      monthName: 'Last month'
    }
  }

  const monthName = getMonthName(selectedMonth)
  const currentDate = new Date()
  const currentMonthValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date()
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
  const lastMonthValue = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  if (selectedMonth === currentMonthValue) {
    return {
      earnings: earnings.currentMonth,
      ordersCount: earnings.currentMonthOrdersCount,
      averageOrderValue: earnings.currentMonthOrdersCount > 0
        ? earnings.currentMonth / earnings.currentMonthOrdersCount
        : 0,
      monthName
    }
  }

  if (selectedMonth === lastMonthValue) {
    return {
      earnings: earnings.lastMonth,
      ordersCount: earnings.lastMonthOrdersCount,
      averageOrderValue: earnings.lastMonthOrdersCount > 0
        ? earnings.lastMonth / earnings.lastMonthOrdersCount
        : 0,
      monthName
    }
  }

  const monthData = monthlyData.find((item) => `${item.year}-${item.month}` === selectedMonth)

  return monthData
    ? {
        earnings: monthData.earnings,
        ordersCount: monthData.ordersCount,
        averageOrderValue: monthData.averageOrderValue,
        monthName
      }
    : {
        earnings: 0,
        ordersCount: 0,
        averageOrderValue: 0,
        monthName
      }
}

function getGrowthPercentage(earnings: EarningsData): number {
  if (earnings.lastMonth === 0) {
    return earnings.currentMonth > 0 ? 100 : 0
  }

  return ((earnings.currentMonth - earnings.lastMonth) / earnings.lastMonth) * 100
}

export function EarningsDashboard() {
  const [earnings, setEarnings] = useState<EarningsData>(initialEarnings)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const monthOptions = useMemo(() => generateMonthOptions(), [])
  const selectedData = useMemo(() => {
    return getSelectedMonthData(selectedMonth, earnings, monthlyData)
  }, [earnings, monthlyData, selectedMonth])
  const growthPercentage = useMemo(() => getGrowthPercentage(earnings), [earnings])
  const trendClass = growthPercentage >= 0 ? 'text-success' : 'text-error'

  const fetchEarnings = async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/admin/earnings', {
        credentials: 'include',
        signal
      })
      const data = await response.json() as Partial<EarningsData> & { error?: string }

      if (!response.ok) {
        setError(data.error || 'Failed to fetch earnings data')
        return
      }

      const nextEarnings: EarningsData = {
        ...initialEarnings,
        ...data,
        historicalMonthlyData: data.historicalMonthlyData || []
      }

      setEarnings(nextEarnings)
      setMonthlyData(nextEarnings.historicalMonthlyData)
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        return
      }

      console.error('Error fetching earnings:', fetchError)
      setError('Failed to fetch earnings data')
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    void fetchEarnings(controller.signal)

    return () => {
      controller.abort()
    }
  }, [])

  const exportCsv = () => {
    const csvData: Array<Array<string | number>> = [
      ['Month', 'Orders', 'Total Earnings', 'Average Order Value'],
      [
        'Current month',
        earnings.currentMonthOrdersCount,
        earnings.currentMonth,
        earnings.currentMonthOrdersCount > 0 ? earnings.currentMonth / earnings.currentMonthOrdersCount : 0
      ],
      [
        'Last month',
        earnings.lastMonthOrdersCount,
        earnings.lastMonth,
        earnings.lastMonthOrdersCount > 0 ? earnings.lastMonth / earnings.lastMonthOrdersCount : 0
      ],
      ...monthlyData.map((month) => [
        `${month.month} ${month.year}`,
        month.ordersCount,
        month.earnings,
        month.averageOrderValue
      ])
    ]

    const csvContent = csvData.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `olgish-cakes-earnings-${new Date().toISOString().split('T')[0]}.csv`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className='grid min-h-72 place-items-center rounded-md border border-base-300 bg-base-100'>
        <span className='loading loading-spinner text-primary' aria-label='Loading earnings' />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='text-sm font-medium uppercase tracking-wide text-base-content/60'>Finance</p>
          <h1 className='mt-1 text-3xl font-semibold text-base-content'>Earnings</h1>
          <p className='mt-2 max-w-2xl text-sm text-base-content/70'>
            Revenue, average order value and monthly order performance.
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <button
            type='button'
            className='btn btn-outline btn-sm'
            onClick={() => {
              void fetchEarnings()
            }}
          >
            Refresh
          </button>
          <button type='button' className='btn btn-primary btn-sm' onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </header>

      {error ? (
        <div className='alert alert-error' role='alert'>
          <span>{error}</span>
        </div>
      ) : null}

      <section className='rounded-md border border-base-300 bg-base-100 p-4 shadow-sm' aria-label='Earnings filters'>
        <label className='form-control max-w-sm'>
          <span className='label'>
            <span className='label-text font-medium'>Month</span>
          </span>
          <select
            className='select select-bordered'
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4' aria-label='Selected month performance'>
        <div className='stat rounded-md border border-base-300 bg-base-100 shadow-sm'>
          <div className='stat-title'>{selectedData.monthName} earnings</div>
          <div className='stat-value text-2xl text-success'>{formatCurrency(selectedData.earnings)}</div>
        </div>
        <div className='stat rounded-md border border-base-300 bg-base-100 shadow-sm'>
          <div className='stat-title'>Orders</div>
          <div className='stat-value text-2xl'>{selectedData.ordersCount}</div>
        </div>
        <div className='stat rounded-md border border-base-300 bg-base-100 shadow-sm'>
          <div className='stat-title'>Average order value</div>
          <div className='stat-value text-2xl'>{formatCurrency(selectedData.averageOrderValue)}</div>
        </div>
        <div className='stat rounded-md border border-base-300 bg-base-100 shadow-sm'>
          <div className='stat-title'>Growth vs last month</div>
          <div className={`stat-value text-2xl ${trendClass}`}>
            {growthPercentage >= 0 ? '+' : '-'}{Math.abs(growthPercentage).toFixed(1)}%
          </div>
        </div>
      </section>

      <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4' aria-label='Overall earnings statistics'>
        <div className='stat rounded-md border border-base-300 bg-base-100 shadow-sm'>
          <div className='stat-title'>Total orders</div>
          <div className='stat-value text-2xl'>{earnings.totalOrders}</div>
        </div>
        <div className='stat rounded-md border border-base-300 bg-base-100 shadow-sm'>
          <div className='stat-title'>Current month</div>
          <div className='stat-value text-2xl'>{formatCurrency(earnings.currentMonth)}</div>
        </div>
        <div className='stat rounded-md border border-base-300 bg-base-100 shadow-sm'>
          <div className='stat-title'>Last month</div>
          <div className='stat-value text-2xl'>{formatCurrency(earnings.lastMonth)}</div>
        </div>
        <div className='stat rounded-md border border-base-300 bg-base-100 shadow-sm'>
          <div className='stat-title'>All-time AOV</div>
          <div className='stat-value text-2xl'>{formatCurrency(earnings.averageOrderValue)}</div>
        </div>
      </section>

      <section className='rounded-md border border-base-300 bg-base-100 shadow-sm'>
        <div className='border-b border-base-300 p-4'>
          <h2 className='text-lg font-semibold'>Monthly breakdown</h2>
          <p className='mt-1 text-sm text-base-content/60'>Current, previous and historical monthly revenue.</p>
        </div>
        <div className='overflow-x-auto'>
          <table className='table table-zebra'>
            <thead>
              <tr>
                <th>Month</th>
                <th className='text-right'>Orders</th>
                <th className='text-right'>Total earnings</th>
                <th className='text-right'>Average order value</th>
              </tr>
            </thead>
            <tbody>
              <tr className={selectedMonth === 'current' ? 'bg-primary/10' : undefined}>
                <td>
                  <span className='font-medium'>Current month</span>
                  <span className='badge badge-success badge-sm ml-2'>Current</span>
                </td>
                <td className='text-right'>{earnings.currentMonthOrdersCount}</td>
                <td className='text-right'>{formatCurrency(earnings.currentMonth)}</td>
                <td className='text-right'>
                  {formatCurrency(earnings.currentMonthOrdersCount > 0
                    ? earnings.currentMonth / earnings.currentMonthOrdersCount
                    : 0)}
                </td>
              </tr>
              <tr className={selectedMonth === 'last' ? 'bg-primary/10' : undefined}>
                <td>
                  <span className='font-medium'>Last month</span>
                  <span className='badge badge-info badge-sm ml-2'>Previous</span>
                </td>
                <td className='text-right'>{earnings.lastMonthOrdersCount}</td>
                <td className='text-right'>{formatCurrency(earnings.lastMonth)}</td>
                <td className='text-right'>
                  {formatCurrency(earnings.lastMonthOrdersCount > 0
                    ? earnings.lastMonth / earnings.lastMonthOrdersCount
                    : 0)}
                </td>
              </tr>
              {monthlyData.map((month) => (
                <tr
                  key={`${month.year}-${month.month}`}
                  className={selectedMonth === `${month.year}-${month.month}` ? 'bg-primary/10' : undefined}
                >
                  <td className='font-medium'>{month.month} {month.year}</td>
                  <td className='text-right'>{month.ordersCount}</td>
                  <td className='text-right'>{formatCurrency(month.earnings)}</td>
                  <td className='text-right'>{formatCurrency(month.averageOrderValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
