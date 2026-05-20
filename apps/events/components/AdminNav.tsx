import { LogOut, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function AdminNav() {
  return (
    <header className="border-b border-base-300 bg-white">
      <div className="event-shell flex flex-wrap items-center justify-between gap-3 py-4">
        <Link className="flex items-center gap-3" href="/admin">
          <Image
            src="/images/olgish-cakes-logo-bakery-brand.png"
            alt="Olgish Cakes"
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-contain"
          />
          <span>
            <span className="block text-sm font-semibold uppercase tracking-normal text-primary">
              Events admin
            </span>
            <span className="block text-lg font-bold leading-tight">Photo requests</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link className="btn btn-sm btn-outline gap-2" href="/admin/settings">
            <Settings aria-hidden="true" size={16} />
            Settings
          </Link>
          <form action="/api/admin/logout" method="post">
            <button className="btn btn-sm btn-ghost gap-2" type="submit">
              <LogOut aria-hidden="true" size={16} />
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}
