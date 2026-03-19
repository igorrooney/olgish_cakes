import Image from 'next/image'

interface CatalogLogoLoaderProps {
  srLabel: string
  testId?: string
}

export function CatalogLogoLoader({
  srLabel,
  testId
}: CatalogLogoLoaderProps) {
  return (
    <div
      role='status'
      aria-live='polite'
      aria-label={srLabel}
      data-testid={testId}
      className='mx-auto flex w-full max-w-[220px] items-center justify-center py-2'
    >
      <span className='sr-only'>{srLabel}</span>
      <Image
        src='/images/olgish-cakes-logo-bakery-brand.png'
        alt=''
        aria-hidden='true'
        width={84}
        height={59}
        className='catalog-logo-loader-spin h-[59px] w-[84px] object-contain'
        loading='eager'
      />
    </div>
  )
}
