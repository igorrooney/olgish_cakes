import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AdminAuthGuard } from '@/components/AdminAuthGuard'
import { isAdminAuthenticated } from '@/lib/admin/auth.server'
import {
  getAdminEnquiryDetail,
  isAdminEnquiryType,
  type AdminEnquiryDetail,
  type AdminEnquiryType
} from '@/lib/enquiries/supabase-enquiries'
import { AttachmentPreview } from './AttachmentPreview'
import { CopyEnquirySummaryButton } from './CopyEnquirySummaryButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Enquiry Details | Olgish Cakes Admin',
  description: 'Review a customer enquiry in the Olgish Cakes admin.',
  robots: {
    index: false,
    follow: false
  }
}

const getTypeBadgeClass = (type: AdminEnquiryType) => {
  if (type === 'custom-cake') {
    return 'badge-primary'
  }

  if (type === 'workshop') {
    return 'badge-info'
  }

  return 'badge-secondary'
}

function DetailField({
  label,
  value,
  href,
  multiline
}: {
  label: string
  value: string
  href?: string
  multiline?: boolean
}) {
  return (
    <div>
      <dt className='text-xs font-semibold uppercase tracking-wide text-base-content/50'>{label}</dt>
      <dd className={`mt-1 text-sm leading-6 text-base-content ${multiline ? 'whitespace-pre-wrap' : 'break-words'}`}>
        {href ? (
          <a className='link link-primary break-all' href={href}>{value}</a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function EnquiryDetails({ enquiry }: { enquiry: AdminEnquiryDetail }) {
  const phoneHref = enquiry.customerPhone
    ? `tel:${enquiry.customerPhone.replace(/\s+/g, '')}`
    : undefined
  const emailHref = enquiry.customerEmail ? `mailto:${enquiry.customerEmail}` : undefined

  return (
    <div className='flex flex-col gap-6'>
      <header className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm lg:p-6'>
        <div className='flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className={`badge ${getTypeBadgeClass(enquiry.type)}`}>{enquiry.typeLabel}</span>
              {enquiry.hasAttachment ? <span className='badge badge-outline'>Attachment</span> : null}
            </div>
            <h1 className='mt-3 break-words text-3xl font-semibold text-base-content'>{enquiry.customerName}</h1>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-base-content/70'>
              {enquiry.topic} - submitted {enquiry.createdAtLabel}
            </p>
          </div>

          <div className='grid gap-2 sm:grid-cols-2 xl:w-[28rem]'>
            {phoneHref ? (
              <a href={phoneHref} className='btn btn-primary min-h-12'>Call customer</a>
            ) : null}
            {emailHref ? (
              <a href={emailHref} className='btn btn-outline min-h-12'>Email customer</a>
            ) : null}
            <CopyEnquirySummaryButton summaryText={enquiry.summaryText} />
            <Link href='/admin/enquiries' className='btn btn-ghost min-h-12'>Back to enquiries</Link>
          </div>
        </div>
      </header>

      <div className='grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]'>
        <aside className='order-1 flex flex-col gap-4 xl:order-2'>
          <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='attachments-heading'>
            <h2 id='attachments-heading' className='text-lg font-semibold text-base-content'>Attachments</h2>
            {enquiry.attachments.length > 0 ? (
              <div className='mt-4 grid gap-3'>
                {enquiry.attachments.map((attachment) => (
                  <AttachmentPreview key={attachment.label} attachment={attachment} />
                ))}
              </div>
            ) : (
              <p className='mt-3 text-sm text-base-content/60'>No attachments saved for this enquiry.</p>
            )}
          </section>

          <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='manager-summary-heading'>
            <h2 id='manager-summary-heading' className='text-lg font-semibold text-base-content'>Manager summary</h2>
            <dl className='mt-4 grid gap-3 text-sm'>
              <div className='flex items-center justify-between gap-3'>
                <dt className='text-base-content/60'>Reference</dt>
                <dd className='font-semibold'>#{enquiry.id}</dd>
              </div>
              <div className='flex items-center justify-between gap-3'>
                <dt className='text-base-content/60'>Needed</dt>
                <dd className='font-semibold'>{enquiry.dateLabel}</dd>
              </div>
              <div className='flex items-center justify-between gap-3'>
                <dt className='text-base-content/60'>Type</dt>
                <dd className='font-semibold'>{enquiry.typeLabel}</dd>
              </div>
            </dl>
            <div className='divider my-4' />
            <Link href='/admin/orders' className='btn btn-outline w-full min-h-12'>
              Open orders
            </Link>
          </section>
        </aside>

        <div className='order-2 grid gap-4 xl:order-1'>
          {enquiry.sections.map((section) => (
            <section
              key={section.title}
              className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm'
              aria-labelledby={`${section.title.toLowerCase().replace(/\s+/g, '-')}-heading`}
            >
              <h2 id={`${section.title.toLowerCase().replace(/\s+/g, '-')}-heading`} className='text-lg font-semibold text-base-content'>
                {section.title}
              </h2>
              <dl className='mt-4 grid gap-4 sm:grid-cols-2'>
                {section.fields.map((field) => (
                  <DetailField
                    key={`${section.title}-${field.label}`}
                    label={field.label}
                    value={field.value}
                    href={field.href}
                    multiline={field.multiline}
                  />
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function AdminEnquiryDetailsPage({
  params
}: {
  params: Promise<{ type: string, id: string }>
}) {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect('/admin/auth')
  }

  const { type, id } = await params

  if (!isAdminEnquiryType(type)) {
    notFound()
  }

  const enquiry = await getAdminEnquiryDetail(type, id)

  if (!enquiry) {
    notFound()
  }

  return (
    <AdminAuthGuard>
      <EnquiryDetails enquiry={enquiry} />
    </AdminAuthGuard>
  )
}
