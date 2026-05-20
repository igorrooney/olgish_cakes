import { CakesSortOption } from './types'

interface CakesSortBarProps {
  selectedSort: CakesSortOption
  onSelectSort: (option: CakesSortOption) => void
  layout?: 'default' | 'inline-compact'
}

const sortOptions: Array<{
  id: CakesSortOption
  label: string
  compactLabel?: string
}> = [
  { id: 'new', label: 'New', compactLabel: 'Newest' },
  { id: 'priceHighToLow', label: 'Price: High to low', compactLabel: 'Price high' },
  { id: 'priceLowToHigh', label: 'Price: Low to high', compactLabel: 'Price low' }
]

const baseButtonClassName = [
  'btn',
  'btn-sm',
  'h-11',
  'min-h-11',
  'px-4',
  'border',
  'focus:outline-none',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-primary',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-base-100',
  'rounded-btn',
  'normal-case',
  'whitespace-nowrap',
  'tablet:h-8',
  'tablet:min-h-8',
  'tablet:px-2',
  'tablet:text-base',
  'tablet:gap-2',
  'tablet:rounded-btn'
].join(' ')

const compactInlineButtonClassName = [
  'h-auto',
  'min-h-11',
  'w-full',
  'min-w-0',
  'px-2',
  'py-2',
  'text-center',
  'text-[13px]',
  'leading-5',
  'tablet:text-sm'
].join(' ')

const activeButtonClassName = 'btn-primary border-primary bg-primary text-primary-content'
const inactiveButtonClassName = 'border-primary-100 bg-primary-50 text-primary-800'

function isActive(option: CakesSortOption, selectedSort: CakesSortOption) {
  return option === selectedSort
}

export function CakesSortBar({
  selectedSort,
  onSelectSort,
  layout = 'default'
}: CakesSortBarProps) {
  const isInlineCompactLayout = layout === 'inline-compact'
  const containerClassName = isInlineCompactLayout
    ? 'grid grid-cols-3 gap-2'
    : 'flex flex-wrap justify-start gap-2 tablet:justify-end'

  return (
    <div className={containerClassName}>
      {sortOptions.map((option) => {
        const active = isActive(option.id, selectedSort)
        const buttonLabel = isInlineCompactLayout ? option.compactLabel ?? option.label : option.label

        return (
          <button
            key={option.id}
            type='button'
            onClick={() => onSelectSort(option.id)}
            className={`${baseButtonClassName} ${
              isInlineCompactLayout
                ? compactInlineButtonClassName
                : ''
            } ${
              isInlineCompactLayout
                ? 'whitespace-normal'
                : ''
            } ${
              active
                ? activeButtonClassName
                : inactiveButtonClassName
            }`}
          >
            {active && !isInlineCompactLayout ? (
              <svg
                width='12'
                height='10'
                viewBox='0 0 12 10'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
              >
                <path
                  d='M10.5 1.25L4.25 8.75L1.5 6'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : null}
            {buttonLabel}
          </button>
        )
      })}
    </div>
  )
}
