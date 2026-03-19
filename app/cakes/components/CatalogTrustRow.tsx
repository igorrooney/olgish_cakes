import type { CatalogTrustItem } from '../categoryLandingConfig'

interface CatalogTrustRowProps {
  items: CatalogTrustItem[]
  eyebrow?: string
}

export function CatalogTrustRow({ items, eyebrow }: CatalogTrustRowProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className='mx-auto w-full max-w-[952px] px-4 pb-4 pt-2 tablet:px-0 tablet:pb-5 small-laptop:max-w-[1200px] large-laptop:max-w-[1432px]'>
      <div className='rounded-[24px] border border-base-300/90 bg-base-100 px-5 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.03)] tablet:px-6 tablet:py-5'>
        {eyebrow ? (
          <p className='text-[11px] font-semibold uppercase tracking-[0.26em] text-primary-700/80 tablet:text-xs'>
            {eyebrow}
          </p>
        ) : null}
        <ul className='mt-4 m-0 list-none grid divide-y divide-base-200/80 p-0 text-left tablet:mt-5 tablet:grid-cols-2 tablet:divide-y-0 small-laptop:grid-cols-4 small-laptop:divide-x'>
          {items.map((item) => (
            <li key={item.title} className='py-4 first:pt-0 last:pb-0 tablet:px-5 tablet:py-0 tablet:first:pt-0 tablet:last:pb-0 small-laptop:first:pl-0 small-laptop:last:pr-0'>
              <p className='text-[15px] font-semibold leading-6 text-base-content'>
                {item.title}
              </p>
              <p className='mt-1.5 text-sm leading-6 text-base-content/72'>
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
