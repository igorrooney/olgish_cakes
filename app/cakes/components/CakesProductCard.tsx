import Image from 'next/image'
import Link from 'next/link'
import { TabletCake } from './types'

interface CakesProductCardProps {
  cake: TabletCake
}

export function CakesProductCard({ cake }: CakesProductCardProps) {
  return (
    <article className='overflow-hidden rounded-[10px] border border-primary-50 bg-base-100 shadow-none'>
      <div className='p-[8px] pb-0'>
        <div className='relative aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-base-200'>
          <Image
            src={cake.imageUrl}
            alt={cake.imageAlt}
            fill
            sizes='(max-width: 1023px) 100vw, 50vw'
            className='object-cover'
            loading='lazy'
          />
        </div>
      </div>
      <div className='space-y-2 px-4 pb-3 pt-3'>
        <h3 className='text-[19px] leading-[28px] text-base-content'>{cake.name}</h3>
        <p className='line-clamp-2 text-[14px] leading-7 text-base-content/70'>{cake.description}</p>
        <div className='flex items-end justify-between pt-1'>
          <span className='text-[12px] uppercase tracking-wide text-base-content/60'>
            {cake.isCustom ? 'Custom cakes' : 'Cakes by post'}
          </span>
          <span className='text-[20px] font-semibold leading-7 text-base-content'>£{cake.price}</span>
        </div>
        <Link
          href={`/cakes/${cake.slug}`}
          className='btn btn-outline btn-primary btn-sm mt-2 h-9 min-h-9 w-full rounded-field text-sm font-medium normal-case'
        >
          View {cake.name}
        </Link>
      </div>
    </article>
  )
}

