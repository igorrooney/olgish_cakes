import { Download, Eye, Filter } from 'lucide-react'
import Link from 'next/link'

import { AdminNav } from '@/components/AdminNav'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateTime } from '@/lib/format'
import { requireAdmin } from '@/lib/admin-auth'
import {
  listEventNames,
  listEventPhotoRequests
} from '@/lib/requests'

export const dynamic = 'force-dynamic'

interface AdminPageProps {
  searchParams: Promise<{
    eventName?: string
  }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin()

  const params = await searchParams
  const eventName = params.eventName?.trim() || undefined
  const [rows, eventNames] = await Promise.all([
    listEventPhotoRequests({ eventName }),
    listEventNames()
  ])
  const exportHref = eventName
    ? `/api/admin/export?eventName=${encodeURIComponent(eventName)}`
    : '/api/admin/export'

  return (
    <>
      <AdminNav />
      <main className="event-shell py-6">
        <section className="mb-5 rounded-lg border border-base-300 bg-white p-4 shadow-sm">
          <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]" action="/admin">
            <label className="form-control">
              <span className="label pb-1">
                <span className="label-text font-semibold">Filter by event name</span>
              </span>
              <select
                className="select select-bordered bg-white"
                name="eventName"
                defaultValue={eventName ?? ''}
              >
                <option value="">All events</option>
                {eventNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-outline mt-auto gap-2" type="submit">
              <Filter aria-hidden="true" size={16} />
              Filter
            </button>
            <a className="btn btn-primary mt-auto gap-2" href={exportHref}>
              <Download aria-hidden="true" size={16} />
              Export CSV
            </a>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-base-300 bg-white shadow-sm">
          <div className="border-b border-base-300 px-4 py-3">
            <h1 className="text-xl font-bold">Requests</h1>
            <p className="text-sm text-base-content/70">{rows.length} records</p>
          </div>
          {rows.length === 0 ? (
            <div className="p-6 text-sm text-base-content/70">No requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Images</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap">{formatDateTime(row.created_at)}</td>
                      <td>{row.full_name}</td>
                      <td>{row.email}</td>
                      <td>{row.event_name}</td>
                      <td>{row.image_count}</td>
                      <td><StatusBadge status={row.telegram_status} /></td>
                      <td className="text-right">
                        <Link className="btn btn-xs btn-outline gap-1" href={`/admin/${row.id}`}>
                          <Eye aria-hidden="true" size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
