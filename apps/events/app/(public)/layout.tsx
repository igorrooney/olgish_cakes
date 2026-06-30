import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="min-h-screen py-6 sm:py-10">
      <div className="event-shell">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href="/">
            <Image
              src="/images/olgish-cakes-logo-bakery-brand.png"
              alt="Olgish Cakes"
              width={68}
              height={68}
              priority
              className="h-16 w-16 rounded-lg object-contain"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-primary">
                Olgish Cakes Events
              </p>
              <p className="text-2xl font-bold leading-tight sm:text-3xl">
                Cake slice photo request
              </p>
            </div>
          </Link>
        </header>

        {children}
      </div>
    </main>
  )
}
