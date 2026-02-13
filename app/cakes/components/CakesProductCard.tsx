import Image from 'next/image'
import Link from 'next/link'
import { TabletCake } from './types'

interface CakesProductCardProps {
  cake: TabletCake
}

export function CakesProductCard({ cake }: CakesProductCardProps) {
  const isByPostCake = cake.productType === 'giftHamper'

  return (
    <Link href={cake.href} aria-label={`View details for ${cake.name}`} className='block h-full'>
      <article className='flex h-full flex-col overflow-hidden rounded-[10px] border border-primary-50 bg-primary-50 shadow-none'>
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
        <div className='flex flex-1 flex-col gap-2 px-4 pb-3 pt-3'>
          <h3 className='text-[19px] leading-[28px] text-base-content'>{cake.name}</h3>
          <p className='line-clamp-2 text-[14px] leading-7 text-base-content/70' title={cake.description}>
            {cake.description}
          </p>
          <p className='mt-auto text-[20px] font-semibold leading-7 text-base-content'>
            {isByPostCake ? (
              <>&pound;{cake.price}</>
            ) : (
              <>from &pound;{cake.price}</>
            )}
          </p>
        </div>
      </article>
    </Link>
  )
}
