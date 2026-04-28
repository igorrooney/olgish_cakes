import type { Metadata } from 'next'
import { Providers } from '@/app/providers'
import { AdminAuthGuard } from '@/components/AdminAuthGuard'
import { OrderDetailsPageClient } from './OrderDetailsPageClient'

export const metadata: Metadata = {
  title: 'Order Details | Olgish Cakes Admin',
  description: 'Review and update an order in the Olgish Cakes admin.',
  robots: {
    index: false,
    follow: false
  }
}

export default async function AdminOrderDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminAuthGuard>
      <Providers>
        <OrderDetailsPageClient orderId={id} />
      </Providers>
    </AdminAuthGuard>
  )
}
