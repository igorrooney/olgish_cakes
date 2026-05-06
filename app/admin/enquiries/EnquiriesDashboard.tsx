'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { AdminEnquirySummary, AdminEnquiryType } from '@/lib/enquiries/supabase-enquiries'

interface EnquiriesDashboardProps {
  enquiries: AdminEnquirySummary[]
}

type TypeFilter = AdminEnquiryType | 'all'

interface StatCard {
  label: string
  value: string
  hint: string
  tone: 'primary' | 'warning' | 'success' | 'info'
}

const typeFilters: Array<{ value: TypeFilter, label: string }> = [
  { value: 'all', label: 'All enquiries' },
  { value: 'custom-cake', label: 'Custom cakes' },
  { value: 'contact', label: 'Contact' },
  { value: 'workshop', label: 'Workshops' }
]

const getTypeBadgeClass = (type: AdminEnquiryType) => {
  if (type === 'custom-cake') {
    return 'badge-primary'
  }

  if (type === 'workshop') {
    return 'badge-info'
  }

  return 'badge-secondary'
}

const getStatToneClass = (tone: StatCard['tone']) => {
  if (tone === 'warning') {
    return 'text-warning'
  }

  if (tone === 'success') {
    return 'text-success'
  }

  if (tone === 'info') {
    return 'text-info'
  }

  return 'text-primary'
}

const matchesSearch = (enquiry: AdminEnquirySummary, query: string) => {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return [
    enquiry.id,
    enquiry.typeLabel,
    enquiry.customerName,
    enquiry.customerEmail,
    enquiry.customerPhone,
    enquiry.topic,
    enquiry.messagePreview,
    enquiry.dateLabel
  ]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedQuery))
}

export function EnquiriesDashboard({ enquiries }: EnquiriesDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const filteredEnquiries = useMemo(() => enquiries.filter((enquiry) => {
    const matchesType = typeFilter === 'all' || enquiry.type === typeFilter
    return matchesType && matchesSearch(enquiry, searchTerm)
  }), [enquiries, searchTerm, typeFilter])

  const latestEnquiry = enquiries[0] ?? null
  const statCards = useMemo<StatCard[]>(() => [
    {
      label: 'Total enquiries',
      value: String(enquiries.length),
      hint: 'Latest records across enquiry forms',
      tone: 'primary'
    },
    {
      label: 'Custom cakes',
      value: String(enquiries.filter((enquiry) => enquiry.type === 'custom-cake').length),
      hint: 'Homepage custom cake form',
      tone: 'warning'
    },
    {
      label: 'Workshops',
      value: String(enquiries.filter((enquiry) => enquiry.type === 'workshop').length),
      hint: 'Workshop page enquiries',
      tone: 'info'
    },
    {
      label: 'With attachments',
      value: String(enquiries.filter((enquiry) => enquiry.hasAttachment).length),
      hint: 'Requests with reference files',
      tone: 'success'
    }
  ], [enquiries])

  return (
    <div className='flex flex-col gap-6'>
      <header className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm lg:p-6'>
        <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='badge badge-primary badge-outline'>Manager queue</span>
              <span className='badge badge-success'>Live</span>
            </div>
            <h1 className='mt-3 text-3xl font-semibold text-base-content'>Enquiries</h1>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-base-content/70'>
              New customer requests from the custom cake, contact and workshop forms in one practical queue.
            </p>
          </div>

          <div className='rounded-box border border-base-300 bg-base-200 p-4 xl:w-[22rem]'>
            <p className='text-xs font-semibold uppercase tracking-wide text-base-content/60'>Latest enquiry</p>
            {latestEnquiry ? (
              <div className='mt-2'>
                <p className='truncate font-semibold text-base-content'>{latestEnquiry.customerName}</p>
                <p className='mt-1 truncate text-sm text-base-content/70'>
                  {latestEnquiry.typeLabel} - {latestEnquiry.createdAtLabel}
                </p>
              </div>
            ) : (
              <p className='mt-2 text-sm text-base-content/70'>No enquiries found.</p>
            )}
          </div>
        </div>
      </header>

      <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4' aria-label='Enquiry summary'>
        {statCards.map((card) => (
          <article key={card.label} className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm'>
            <p className='text-xs uppercase tracking-wide text-base-content/60'>{card.label}</p>
            <p className={`mt-2 text-3xl font-semibold leading-tight ${getStatToneClass(card.tone)}`}>{card.value}</p>
            <p className='mt-2 text-sm text-base-content/60'>{card.hint}</p>
          </article>
        ))}
      </section>

      <section className='rounded-box border border-base-300 bg-base-100 shadow-sm' aria-labelledby='enquiry-list-heading'>
        <div className='border-b border-base-300 p-4 lg:p-5'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <h2 id='enquiry-list-heading' className='text-xl font-semibold text-base-content'>Customer requests</h2>
              <p className='mt-1 text-sm text-base-content/60'>
                {filteredEnquiries.length} of {enquiries.length} enquiries shown
              </p>
            </div>
            <div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem] lg:w-[34rem]'>
              <label className='form-control w-full'>
                <span className='label-text mb-2'>Search</span>
                <input
                  type='search'
                  className='input input-bordered w-full'
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder='Name, email, phone, topic'
                />
              </label>
              <label className='form-control w-full'>
                <span className='label-text mb-2'>Type</span>
                <select
                  className='select select-bordered w-full'
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                >
                  {typeFilters.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {filteredEnquiries.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='table'>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Needed</th>
                  <th>Message</th>
                  <th className='text-right'>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enquiry) => (
                  <tr key={`${enquiry.type}-${enquiry.id}`} className='align-top'>
                    <td className='min-w-56'>
                      <p className='font-semibold text-base-content'>{enquiry.customerName}</p>
                      <p className='mt-1 text-xs text-base-content/60'>{enquiry.createdAtLabel}</p>
                      <div className='mt-2 flex flex-wrap gap-2 text-xs'>
                        {enquiry.customerEmail ? (
                          <a className='link link-primary break-all' href={`mailto:${enquiry.customerEmail}`}>
                            Email
                          </a>
                        ) : null}
                        {enquiry.customerPhone ? (
                          <a className='link link-primary' href={`tel:${enquiry.customerPhone.replace(/\s+/g, '')}`}>
                            Call
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getTypeBadgeClass(enquiry.type)}`}>{enquiry.typeLabel}</span>
                      <p className='mt-2 max-w-40 text-sm text-base-content/70'>{enquiry.topic}</p>
                    </td>
                    <td className='whitespace-nowrap'>{enquiry.dateLabel}</td>
                    <td className='min-w-72'>
                      <p className='line-clamp-3 text-sm leading-6 text-base-content/75'>{enquiry.messagePreview}</p>
                      {enquiry.hasAttachment ? (
                        <span className='badge badge-outline badge-sm mt-2'>Attachment</span>
                      ) : null}
                    </td>
                    <td className='text-right'>
                      <Link href={enquiry.href} className='btn btn-primary btn-sm min-h-10'>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='p-8 text-center'>
            <p className='font-semibold text-base-content'>No enquiries match these filters</p>
            <p className='mt-1 text-sm text-base-content/60'>Clear the search or choose another enquiry type.</p>
          </div>
        )}
      </section>
    </div>
  )
}
