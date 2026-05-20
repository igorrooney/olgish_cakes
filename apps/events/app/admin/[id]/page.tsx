import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminNav } from '@/components/AdminNav'
import { StatusBadge } from '@/components/StatusBadge'
import { requireAdmin } from '@/lib/admin-auth'
import {
  formatBytes,
  formatDateTime
} from '@/lib/format'
import { getEventPhotoRequest } from '@/lib/requests'

export const dynamic = 'force-dynamic'

interface AdminRequestPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminRequestPage({ params }: AdminRequestPageProps) {
  await requireAdmin()

  const { id } = await params
  const row = await getEventPhotoRequest(id)

  if (!row) {
    notFound()
  }

  return (
    <>
      <AdminNav />
      <main className="event-shell py-6">
        <Link className="btn btn-sm btn-ghost mb-4 gap-2" href="/admin">
          <ArrowLeft aria-hidden="true" size={16} />
          Back
        </Link>

        <section className="rounded-lg border border-base-300 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-base-content/70">{formatDateTime(row.created_at)}</p>
              <h1 className="break-all text-2xl font-bold">{row.id}</h1>
            </div>
            <StatusBadge status={row.telegram_status} />
          </div>

          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-base-content/70">Name</dt>
              <dd className="mt-1">{row.full_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-base-content/70">Email</dt>
              <dd className="mt-1">{row.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-base-content/70">Event name</dt>
              <dd className="mt-1">{row.event_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-base-content/70">Telegram status</dt>
              <dd className="mt-1">{row.telegram_status}</dd>
            </div>
          </dl>

          {row.telegram_error ? (
            <div className="alert alert-error mt-5 items-start text-sm">
              <div>
                <p className="font-semibold">Telegram error</p>
                <p>{row.telegram_error}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold">Images</h2>
            <div className="overflow-x-auto rounded-lg border border-base-300">
              <table className="table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Temp path</th>
                  </tr>
                </thead>
                <tbody>
                  {row.image_filenames.map((fileName, index) => (
                    <tr key={`${fileName}-${index}`}>
                      <td>{fileName}</td>
                      <td>{row.image_mime_types[index] ?? 'Unknown'}</td>
                      <td>{formatBytes(row.image_sizes[index] ?? 0)}</td>
                      <td className="max-w-xs break-all text-xs">
                        {row.temp_image_paths[index] ?? 'Deleted after Telegram delivery'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
