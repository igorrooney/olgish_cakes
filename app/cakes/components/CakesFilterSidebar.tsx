'use client'

import { CakesFilterState } from './types'

interface CakesFilterSidebarProps {
  filters: CakesFilterState
  priceMax: number
  onToggleByPost: () => void
  onToggleCustom: () => void
  onPriceChange: (price: number) => void
  onToggleFreeHoney: () => void
  onToggleChristmas: () => void
  onToggleBirthday: () => void
  onReset: () => void
}
function FilterCheckbox({
  checked,
  label,
  helperText,
  onChange
}: {
  checked: boolean
  label: string
  helperText?: string
  onChange: () => void
}) {
  return (
    <label className='label cursor-pointer justify-start gap-3 p-0 py-2'>
      <input
        type='checkbox'
        checked={checked}
        onChange={onChange}
        className='checkbox checkbox-primary checkbox-sm rounded-sm'
      />
      <span className='leading-tight text-base-content'>
        <span className='block text-[1.75rem] leading-none'>{label}</span>
        {helperText ? (
          <span className='mt-1 block text-base leading-6 text-base-content/60'>{helperText}</span>
        ) : null}
      </span>
    </label>
  )
}

export function CakesFilterSidebar({
  filters,
  priceMax,
  onToggleByPost,
  onToggleCustom,
  onPriceChange,
  onToggleFreeHoney,
  onToggleChristmas,
  onToggleBirthday,
  onReset
}: CakesFilterSidebarProps) {
  return (
    <aside className='h-fit rounded-box border border-base-300 bg-secondary/20 p-5 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-3xl font-medium text-base-content'>Filter by</h2>
        <button
          type='button'
          onClick={onReset}
          className='btn btn-ghost btn-sm h-auto min-h-0 px-0 text-2xl font-medium normal-case text-base-content/80 hover:bg-transparent'
        >
          Reset
        </button>
      </div>

      <div className='space-y-1'>
        <FilterCheckbox
          checked={filters.showByPost}
          label='Cakes by post'
          helperText='Delivered nationwide'
          onChange={onToggleByPost}
        />
        <FilterCheckbox
          checked={filters.showCustom}
          label='Custom cakes'
          helperText='Made to order'
          onChange={onToggleCustom}
        />
      </div>

      <div className='mt-6'>
        <div className='mb-2 flex items-center justify-between text-2xl leading-none text-base-content'>
          <span>Label</span>
          <span>{`\u00A30-${priceMax}`}</span>
        </div>
        <input
          type='range'
          min={0}
          max={priceMax}
          value={filters.maxPrice}
          onChange={(event) => onPriceChange(Number(event.target.value))}
          className='range range-primary range-xs h-2'
          aria-label='Price range'
        />
      </div>

      <div className='mt-8 space-y-1'>
        <p className='text-3xl leading-none text-base-content'>Featured</p>
        <FilterCheckbox
          checked={filters.features.onlyFreeHoney}
          label='Free honey cake offer'
          onChange={onToggleFreeHoney}
        />
        <FilterCheckbox
          checked={filters.features.onlyChristmas}
          label='Christmas designs'
          onChange={onToggleChristmas}
        />
        <FilterCheckbox
          checked={filters.features.onlyBirthday}
          label='Birthday cakes'
          onChange={onToggleBirthday}
        />
      </div>
    </aside>
  )
}

