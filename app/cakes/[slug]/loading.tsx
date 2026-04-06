const thumbnailSkeletonIds = ['thumb-1', 'thumb-2', 'thumb-3'] as const
const ingredientChipSkeletonIds = ['ingredient-1', 'ingredient-2', 'ingredient-3', 'ingredient-4', 'ingredient-5'] as const
const allergenChipSkeletonIds = ['allergen-1', 'allergen-2', 'allergen-3'] as const
const descriptionLineSkeletonIds = ['line-1', 'line-2', 'line-3'] as const

export default function Loading() {
  return (
    <section
      aria-busy='true'
      aria-live='polite'
      aria-label='Loading cake details'
      className='mx-auto w-full max-w-[1180px] px-4 py-6 tablet:px-6 tablet:py-10'
      data-testid='cake-loading-skeleton'
    >
      <div className='grid gap-8 large-laptop:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]'>
        <div className='space-y-4' data-testid='cake-loading-gallery'>
          <div
            className='h-[400px] animate-pulse rounded-[32px] bg-base-200 tablet:h-[600px]'
            data-testid='cake-loading-main-image'
          />
          <div className='grid h-[200px] grid-cols-3 gap-3'>
            {thumbnailSkeletonIds.map((thumbnailId) => (
              <div
                key={thumbnailId}
                className='h-full animate-pulse rounded-[24px] bg-base-200'
                data-testid='cake-loading-thumbnail'
              />
            ))}
          </div>
        </div>

        <div className='space-y-6' data-testid='cake-loading-details'>
          <div
            className='h-14 w-4/5 animate-pulse rounded-box bg-base-200 tablet:h-16'
            data-testid='cake-loading-title'
          />

          <div className='flex flex-wrap gap-3' data-testid='cake-loading-meta'>
            <div className='h-8 w-24 animate-pulse rounded-full bg-base-200' />
            <div className='h-8 w-24 animate-pulse rounded-full bg-base-200' />
          </div>

          <div className='space-y-3' data-testid='cake-loading-description'>
            {descriptionLineSkeletonIds.map((lineId) => (
              <div
                key={lineId}
                className='h-5 animate-pulse rounded bg-base-200'
              />
            ))}
          </div>

          <div
            className='rounded-[28px] border border-base-300 bg-base-100 p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
            data-testid='cake-loading-ingredients'
          >
            <div className='h-8 w-28 animate-pulse rounded bg-base-200' />
            <div className='mt-4 flex flex-wrap gap-2'>
              {ingredientChipSkeletonIds.map((chipId) => (
                <div
                  key={chipId}
                  className='h-8 w-20 animate-pulse rounded-full bg-base-200'
                />
              ))}
            </div>

            <div className='mt-6 h-8 w-28 animate-pulse rounded bg-base-200' />
            <div className='mt-4 flex flex-wrap gap-2'>
              {allergenChipSkeletonIds.map((chipId) => (
                <div
                  key={chipId}
                  className='h-8 w-20 animate-pulse rounded-full bg-base-200'
                />
              ))}
            </div>
          </div>

          <div
            className='flex items-center justify-between border-t border-base-300 pt-6'
            data-testid='cake-loading-price'
          >
            <div className='h-12 w-32 animate-pulse rounded-box bg-base-200' />
          </div>
        </div>
      </div>
    </section>
  )
}
