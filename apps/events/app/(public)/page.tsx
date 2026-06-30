import Image from 'next/image'

import { EventPhotoForm } from '@/components/EventPhotoForm'

export default function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <EventPhotoForm />

      <aside className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
        <Image
          src="/images/olga.png"
          alt="Olgish Cakes handmade cake"
          width={440}
          height={550}
          priority
          className="mb-4 w-full rounded-lg object-cover"
        />
        <h2 className="text-xl font-bold">For your printed cake slice</h2>
        <p className="mt-2 text-sm leading-6 text-base-content/75">
          Send the image you want printed. The manager will receive it and prepare it for your cake slice.
        </p>
      </aside>
    </div>
  )
}
