import Image from 'next/image'

import { EventPhotoForm } from '@/components/EventPhotoForm'

export default function HomePage() {
  return (
    <main className="min-h-screen py-6 sm:py-10">
      <div className="event-shell">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
                Cake slice photo request
              </h1>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <EventPhotoForm />

          <aside className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
            <Image
              src="/images/placeholder-cake.jpg"
              alt="Olgish Cakes handmade cake"
              width={720}
              height={480}
              priority
              className="mb-4 aspect-[4/3] w-full rounded-lg object-cover"
            />
            <h2 className="text-xl font-bold">For your printed cake slice</h2>
            <p className="mt-2 text-sm leading-6 text-base-content/75">
              Send the image you want printed. The manager will receive it and prepare it for your cake slice.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
