'use client'

import { useEffect, useRef, useState } from 'react'

export type DropdownId = 'custom-cakes' | 'learn-hub'

type DropdownLink = {
  href: string
  label: string
}

export type DropdownConfig = {
  id: DropdownId
  label: string
  alignmentClassName: string
  columns: DropdownLink[][]
}

const topNavButtonClassName =
  'rounded-btn px-3 py-2 text-lg font-body text-base-content transition-colors whitespace-nowrap flex items-center gap-2 hover:bg-transparent hover:text-navigation active:!bg-transparent marker:hidden [&::-webkit-details-marker]:hidden [&::after]:hidden'
const dropdownItemClassName =
  'flex h-7 items-center rounded-btn px-4 text-base leading-5 font-body text-base-content whitespace-nowrap transition-colors hover:bg-base-200 active:!bg-transparent shadow-none active:shadow-none focus:shadow-none focus-visible:shadow-none tablet:h-9'
const dropdownMenuListClassName =
  'menu menu-md !m-0 !p-0 items-start [&::before]:hidden [&>li]:w-full'

const getDesktopDropdownPanelId = (dropdownId: DropdownId) => `${dropdownId}-desktop-panel`

function ChevronIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      className='text-base-content transition-transform group-open/dropdown:rotate-180 group-open/dropdown:text-navigation'
    >
      <path
        d='M6 9l6 6 6-6'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function DesktopDropdown({ dropdown }: { dropdown: DropdownConfig }) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const closeDropdown = () => {
      const details = detailsRef.current

      if (!details?.open) {
        return
      }

      details.open = false
      setIsOpen(false)
    }

    const handlePointerDown = (event: PointerEvent) => {
      const details = detailsRef.current
      const target = event.target

      if (!details?.open || !(target instanceof Node) || details.contains(target)) {
        return
      }

      closeDropdown()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <li className='relative overflow-visible' data-nav-dropdown>
      <details
        ref={detailsRef}
        className='group/dropdown'
        onToggle={(event) => setIsOpen(event.currentTarget.open)}
      >
        <summary
          role='button'
          className={topNavButtonClassName}
          aria-controls={getDesktopDropdownPanelId(dropdown.id)}
          aria-expanded={isOpen}
          aria-haspopup='true'
        >
          <span className='group-open/dropdown:text-navigation group-open/dropdown:underline group-open/dropdown:decoration-dotted group-open/dropdown:decoration-2 group-open/dropdown:underline-offset-8'>
            {dropdown.label}
          </span>
          <ChevronIcon />
        </summary>
        <div
          id={getDesktopDropdownPanelId(dropdown.id)}
          className={`absolute top-full z-[10000] mt-3 rounded-box bg-[linear-gradient(180deg,_#FFFBEB_0%,_#FFFFFF_100%)] p-4 shadow-[0px_4px_6px_-1px_#0000001A] ${dropdown.alignmentClassName} block`}
        >
          {dropdown.columns.map((column, columnIndex) => (
            <ul
              key={`${dropdown.id}-${columnIndex}`}
              className={`${dropdownMenuListClassName} ${
                dropdown.columns.length > 1 ? 'flex-1' : ''
              } ${dropdown.id === 'custom-cakes' && columnIndex > 0 ? 'self-start' : ''}`}
            >
              {column.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={dropdownItemClassName}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </details>
    </li>
  )
}
