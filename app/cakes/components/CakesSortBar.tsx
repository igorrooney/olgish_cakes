'use client'

import { CakesSortOption } from './types'

interface CakesSortBarProps {
  selectedSort: CakesSortOption
  onSelectSort: (option: CakesSortOption) => void
}

const sortOptions: Array<{ id: CakesSortOption, label: string }> = [
  { id: 'new', label: 'New' },
  { id: 'popular', label: 'Most popular' },
  { id: 'priceHighToLow', label: 'Price: High to low' },
  { id: 'priceLowToHigh', label: 'Price: Low to high' }
]

function isActive(option: CakesSortOption, selectedSort: CakesSortOption) {
  return option === selectedSort
}

export function CakesSortBar({ selectedSort, onSelectSort }: CakesSortBarProps) {
  return (
    <div className='flex flex-wrap justify-start gap-2 tablet:justify-end'>
      {sortOptions.map((option) => {
        const active = isActive(option.id, selectedSort)

        return (
          <button
            key={option.id}
            type='button'
            onClick={() => onSelectSort(option.id)}
            className={`btn btn-sm h-11 min-h-11 rounded-btn border px-4 normal-case whitespace-nowrap ${
              active
                ? 'border-primary bg-primary text-primary-content'
                : 'border-transparent bg-primary-50 text-base-content/55'
            }`}
          >
            {active ? (
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
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
