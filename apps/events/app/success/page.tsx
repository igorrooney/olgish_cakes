import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { redirect } from 'next/navigation'

import {
  FEATURE_LINKS,
  SUCCESS_MESSAGE
} from '@/lib/constants'
import { getSentEventPhotoRequest } from '@/lib/requests'
import {
  parseSuccessRequestId,
  SUCCESS_REQUEST_ID_PARAM
} from '@/lib/success'

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const requestId = parseSuccessRequestId(params[SUCCESS_REQUEST_ID_PARAM])

  if (!requestId) {
    redirect('/')
  }

  const request = await getSentEventPhotoRequest(requestId)

  if (!request) {
    redirect('/')
  }

  return (
    <main className="min-h-screen py-6 sm:py-10">
      <div className="event-shell">
        <section className="mb-8 rounded-lg border border-success/25 bg-white p-6 shadow-sm sm:p-8">
          <div className="alert alert-success w-full items-start text-sm">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
            <div>
              <h1 className="text-xl font-bold">Image received</h1>
              <p className="mt-1">{SUCCESS_MESSAGE}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Explore Olgish Cakes</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURE_LINKS.map((item) => (
              <a
                key={item.href}
                className="group rounded-lg border border-base-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href={item.href}
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={720}
                  height={480}
                  priority
                  className="aspect-[4/3] w-full rounded-t-lg object-cover"
                />
                <span className="block p-4">
                  <span className="flex items-center justify-between gap-3 text-lg font-bold">
                    {item.title}
                    <ArrowRight
                      aria-hidden="true"
                      className="shrink-0 transition group-hover:translate-x-1"
                      size={18}
                    />
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-base-content/70">
                    {item.description}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
