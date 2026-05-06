import type { AdminEnquiryAttachment } from '@/lib/enquiries/supabase-enquiries'

interface AttachmentPreviewProps {
  attachment: AdminEnquiryAttachment
}

export function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  return (
    <div className='rounded-box border border-base-300 bg-base-200 p-3'>
      {attachment.previewHref ? (
        <a
          href={attachment.href || attachment.previewHref}
          target='_blank'
          rel='noopener noreferrer'
          className='block overflow-hidden rounded-box border border-base-300 bg-base-100'
          aria-label={`Open ${attachment.label}`}
        >
          <img
            src={attachment.previewHref}
            alt={`Reference attachment: ${attachment.label}`}
            className='aspect-[4/3] h-auto w-full object-cover'
            loading='lazy'
            decoding='async'
          />
        </a>
      ) : (
        <div className='flex aspect-[4/3] items-center justify-center rounded-box border border-dashed border-base-300 bg-base-100 p-4 text-center'>
          <p className='text-sm font-semibold text-base-content/70'>Preview unavailable</p>
        </div>
      )}

      <div className='mt-3'>
        <p className='break-words text-sm font-semibold text-base-content'>{attachment.label}</p>
        {attachment.detail ? (
          <p className='mt-1 text-xs text-base-content/60'>{attachment.detail}</p>
        ) : null}
        <div className='mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1'>
          {attachment.href ? (
            <a
              href={attachment.href}
              target='_blank'
              rel='noopener noreferrer'
              className='btn btn-primary btn-sm min-h-10'
            >
              Open full size
            </a>
          ) : null}
          {attachment.downloadHref || attachment.href ? (
            <a
              href={attachment.downloadHref || attachment.href}
              download={attachment.label}
              className='btn btn-outline btn-sm min-h-10'
            >
              Download
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
