'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type MobileMenuDisclosureProps = {
  children: ReactNode
  trigger: ReactNode
}

export function MobileMenuDisclosure({
  children,
  trigger
}: MobileMenuDisclosureProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const triggerRef = useRef<HTMLElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      const details = detailsRef.current

      if (event.key !== 'Escape' || !details?.open) {
        return
      }

      event.preventDefault()
      details.open = false
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <details
      ref={detailsRef}
      className='group/mobile-menu'
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary
        ref={triggerRef}
        role='button'
        aria-label='Menu'
        aria-controls='mobile-menu'
        aria-expanded={isOpen}
        className='flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-btn bg-base-100 p-0 shadow-btn hover:bg-base-200 marker:hidden [&::-webkit-details-marker]:hidden'
        style={{ minWidth: '48px', minHeight: '48px' }}
      >
        {trigger}
      </summary>
      {children}
    </details>
  )
}
