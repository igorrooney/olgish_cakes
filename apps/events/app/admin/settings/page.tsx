import { Save } from 'lucide-react'

import { AdminNav } from '@/components/AdminNav'
import { requireAdmin } from '@/lib/admin-auth'
import { getEventPhotoSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

interface SettingsPageProps {
  searchParams: Promise<{
    saved?: string
    error?: string
  }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  await requireAdmin()

  const [settings, params] = await Promise.all([
    getEventPhotoSettings(),
    searchParams
  ])

  return (
    <>
      <AdminNav />
      <main className="event-shell py-6">
        <section className="max-w-2xl rounded-lg border border-base-300 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              Active event
            </p>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          {params.saved ? (
            <div className="alert alert-success mb-5 text-sm">Settings saved.</div>
          ) : null}
          {params.error ? (
            <div className="alert alert-error mb-5 text-sm">
              Please check the event name and image limit.
            </div>
          ) : null}

          <form className="grid gap-4" action="/api/admin/settings" method="post">
            <label className="form-control">
              <span className="label pb-1">
                <span className="label-text font-semibold">Event name</span>
              </span>
              <input
                className="input input-bordered bg-white"
                name="eventName"
                defaultValue={settings.eventName}
                maxLength={120}
                required
              />
            </label>
            <label className="form-control">
              <span className="label pb-1">
                <span className="label-text font-semibold">Max images</span>
              </span>
              <input
                className="input input-bordered max-w-40 bg-white"
                name="maxImages"
                type="number"
                min={1}
                max={10}
                defaultValue={settings.maxImages}
                required
              />
            </label>
            <button className="btn btn-primary w-fit gap-2" type="submit">
              <Save aria-hidden="true" size={18} />
              Save settings
            </button>
          </form>
        </section>
      </main>
    </>
  )
}
