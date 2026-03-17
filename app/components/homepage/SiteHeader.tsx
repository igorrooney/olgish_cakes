'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

type DropdownId = 'custom-cakes' | 'learn-hub'

export function SiteHeader() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<DropdownId | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const customCakesDropdownRef = useRef<HTMLDetailsElement>(null)
  const learnHubDropdownRef = useRef<HTMLDetailsElement>(null)
  const lastTouchToggleRef = useRef<number | null>(null)

  const topNavItemClassName =
    'rounded-btn px-3 py-2 text-lg font-body text-base-content hover:bg-transparent hover:text-navigation active:!bg-transparent transition-colors whitespace-nowrap'
  const topNavSummaryClassName =
    'rounded-btn px-3 py-2 text-lg font-body text-base-content hover:bg-transparent hover:text-navigation active:!bg-transparent active:text-navigation group-open:text-navigation transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer list-none before:hidden after:hidden [&::-webkit-details-marker]:hidden [&::marker]:content-[""]'
  const dropdownItemClassName =
    'flex items-center h-7 px-4 text-base leading-5 font-body text-base-content rounded-btn hover:bg-base-200 active:!bg-transparent transition-colors whitespace-nowrap shadow-none active:shadow-none focus:shadow-none focus-visible:shadow-none'
  const dropdownMenuListClassName =
    'menu menu-md [&::before]:hidden !m-0 !p-0 items-start [&>li]:w-full'
  const mobileMenuItemClassName =
    'w-full min-h-[36px] px-4 flex items-center rounded-btn text-base-content text-sm leading-none font-sans active:!bg-transparent'
  const orderFormHref = pathname === '/' ? '/#custom-cake-enquiry-heading' : '/get-custom-quote'

  const toggleDropdown = (dropdownId: DropdownId) => {
    setOpenDropdownId((current) => (current === dropdownId ? null : dropdownId))
  }

  const handleDesktopDropdownNavigation = () => {
    setOpenDropdownId(null)
    lastTouchToggleRef.current = null
  }

  const handleSummaryClick = (
    event: React.MouseEvent<HTMLElement>,
    dropdownId: DropdownId
  ) => {
    const lastTouchToggle = lastTouchToggleRef.current

    if (lastTouchToggle && Date.now() - lastTouchToggle < 500) {
      lastTouchToggleRef.current = null
      event.preventDefault()
      return
    }

    event.preventDefault()
    toggleDropdown(dropdownId)
  }

  const handleSummaryPointerDown = (
    event: React.PointerEvent<HTMLElement>,
    dropdownId: DropdownId
  ) => {
    if (event.pointerType !== 'touch') {
      return
    }

    event.preventDefault()
    lastTouchToggleRef.current = Date.now()
    toggleDropdown(dropdownId)
  }

  const handleSummaryKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    dropdownId: DropdownId
  ) => {
    const isToggleKey = event.key === 'Enter' || event.key === ' '

    if (!isToggleKey) {
      return
    }

    event.preventDefault()
    toggleDropdown(dropdownId)
  }

  const handleDropdownToggle =
    (dropdownId: DropdownId) => (event: React.SyntheticEvent<HTMLDetailsElement>) => {
      const { open } = event.currentTarget

      if (open) {
        setOpenDropdownId(dropdownId)
        return
      }

      setOpenDropdownId((current) => (current === dropdownId ? null : current))
    }

  useEffect(() => {
    setOpenDropdownId(null)
    setIsMenuOpen(false)
    lastTouchToggleRef.current = null
  }, [pathname])

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    if (openDropdownId === null) {
      return
    }

    const handleClickOutsideDropdown = (event: Event) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      const openDropdown =
        openDropdownId === 'custom-cakes'
          ? customCakesDropdownRef.current
          : openDropdownId === 'learn-hub'
            ? learnHubDropdownRef.current
            : null

      if (!openDropdown) {
        return
      }

      const eventPath =
        typeof event.composedPath === 'function' ? event.composedPath() : []

      if (eventPath.includes(openDropdown) || openDropdown.contains(target)) {
        return
      }

      setOpenDropdownId(null)
    }

    const captureOptions = { capture: true }
    const passiveCaptureOptions = { capture: true, passive: true }

    document.addEventListener('pointerdown', handleClickOutsideDropdown, passiveCaptureOptions)
    document.addEventListener('touchstart', handleClickOutsideDropdown, passiveCaptureOptions)
    document.addEventListener('click', handleClickOutsideDropdown, captureOptions)

    return () => {
      document.removeEventListener('pointerdown', handleClickOutsideDropdown, passiveCaptureOptions)
      document.removeEventListener('touchstart', handleClickOutsideDropdown, passiveCaptureOptions)
      document.removeEventListener('click', handleClickOutsideDropdown, captureOptions)
    }
  }, [openDropdownId])

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isMenuOpen) return

      const target = event.target

      // Type guard instead of assertion
      if (!(target instanceof Node)) {
        return
      }

      // Don't close if clicking on the menu button
      if (buttonRef.current?.contains(target)) {
        return
      }

      // Close if clicking outside the menu
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false)
      }
    }

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header className='relative z-[9999] tablet:sticky tablet:top-0'>
      {openDropdownId !== null && (
        <div
          data-nav-overlay
          aria-hidden='true'
          className='hidden tablet:block absolute top-full left-0 right-0 h-screen z-0 bg-transparent'
          onPointerDown={() => setOpenDropdownId(null)}
          onClick={() => setOpenDropdownId(null)}
        />
      )}
      <div className='navbar relative z-[9999] bg-base-100 px-4 py-3 tablet:px-10 tablet:py-5 small-laptop:px-12 large-laptop:px-16'>
        <div className='navbar-start'>
          <Link href='/' className='btn btn-ghost normal-case px-2 hover:bg-transparent hover:text-inherit hover:border-transparent focus:bg-transparent focus:text-inherit focus:border-transparent focus:!outline-none focus-visible:bg-transparent focus-visible:text-inherit focus-visible:border-transparent focus-visible:outline-none'>
            <div className='relative h-12 w-12 tablet:h-16 tablet:w-16'>
              <Image
                src='/design/mobile-home/navbar-logo.png'
                alt='Olgish Cakes logo'
                fill
                className='object-contain'
                priority
              />
            </div>
          </Link>
        </div>
        <div className='navbar-center hidden tablet:flex absolute left-1/2 -translate-x-1/2'>
          <nav aria-label='Main navigation'>
            <ul className='menu menu-horizontal px-1 !list-none gap-6 large-laptop:gap-8 flex-nowrap whitespace-nowrap overflow-visible [&>li]:list-none [&>li]:marker:text-transparent [&>li]:before:hidden [&>li]:after:hidden'>
              <li>
                <Link href='/cakes-by-post' className={topNavItemClassName}>
                  Cakes by post
                </Link>
              </li>
              <li className='overflow-visible'>
                <details
                  className='dropdown dropdown-bottom group overflow-visible'
                  data-nav-dropdown
                  ref={customCakesDropdownRef}
                  open={openDropdownId === 'custom-cakes'}
                  onToggle={handleDropdownToggle('custom-cakes')}
                >
                  <summary
                    className={topNavSummaryClassName}
                    onPointerDown={(event) => handleSummaryPointerDown(event, 'custom-cakes')}
                    onClick={(event) => handleSummaryClick(event, 'custom-cakes')}
                    onKeyDown={(event) => handleSummaryKeyDown(event, 'custom-cakes')}
                    aria-expanded={openDropdownId === 'custom-cakes'}
                  >
                    <span className='group-open:text-navigation group-open:underline group-open:decoration-dotted group-open:decoration-2 group-open:underline-offset-8'>
                      Custom cakes
                    </span>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                      aria-hidden='true'
                      className='text-base-content group-open:text-navigation'
                    >
                      <path
                        d='M6 9l6 6 6-6'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </summary>
                  <div
                    tabIndex={-1}
                    className='dropdown-content bg-[linear-gradient(180deg,_#FFFBEB_0%,_#FFFFFF_100%)] rounded-box z-1 mt-3 p-4 shadow-[0px_4px_6px_-1px_#0000001A] flex gap-3 w-[378px]'
                  >
                    <ul className={`${dropdownMenuListClassName} flex-1`}>
                      <li>
                        <Link href='/cakes' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          All cakes
                        </Link>
                      </li>
                      <li>
                        <Link href='/wedding-cakes' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Wedding cakes
                        </Link>
                      </li>
                      <li>
                        <Link href='/birthday-cakes' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Birthday cakes
                        </Link>
                      </li>
                      <li>
                        <Link href='/anniversary-cakes-leeds' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Anniversary cakes
                        </Link>
                      </li>
                      <li>
                        <Link href='/baby-shower-cakes' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Baby shower cakes
                        </Link>
                      </li>
                    </ul>
                    <ul className={`${dropdownMenuListClassName} flex-1`}>
                      <li>
                        <Link href={orderFormHref} className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Order form
                        </Link>
                      </li>
                    </ul>
                  </div>
                </details>
              </li>
              <li className='overflow-visible'>
                <details
                  className='dropdown dropdown-bottom dropdown-center group overflow-visible'
                  data-nav-dropdown
                  ref={learnHubDropdownRef}
                  open={openDropdownId === 'learn-hub'}
                  onToggle={handleDropdownToggle('learn-hub')}
                >
                  <summary
                    className={topNavSummaryClassName}
                    onPointerDown={(event) => handleSummaryPointerDown(event, 'learn-hub')}
                    onClick={(event) => handleSummaryClick(event, 'learn-hub')}
                    onKeyDown={(event) => handleSummaryKeyDown(event, 'learn-hub')}
                    aria-expanded={openDropdownId === 'learn-hub'}
                  >
                    <span className='group-open:text-navigation group-open:underline group-open:decoration-dotted group-open:decoration-2 group-open:underline-offset-8'>
                      Learn & visit
                    </span>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                      aria-hidden='true'
                      className='text-base-content group-open:text-navigation'
                    >
                      <path
                        d='M6 9l6 6 6-6'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </summary>
                  <div
                    tabIndex={-1}
                    className='dropdown-content bg-[linear-gradient(180deg,_#FFFBEB_0%,_#FFFFFF_100%)] rounded-box z-1 mt-3 p-4 shadow-[0px_4px_6px_-1px_#0000001A]'
                  >
                    <ul className={dropdownMenuListClassName}>
                      <li>
                        <Link href='/learn/articles' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Articles
                        </Link>
                      </li>
                      <li>
                        <Link href='/learn/guides' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Guides
                        </Link>
                      </li>
                      <li>
                        <Link href='/learn/workshops' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Workshops
                        </Link>
                      </li>
                      <li>
                        <Link href='/learn/customer-stories' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Customer stories
                        </Link>
                      </li>
                      <li>
                        <Link href='/farmers-markets' className={dropdownItemClassName} onClick={handleDesktopDropdownNavigation}>
                          Find us at farmers markets
                        </Link>
                      </li>
                    </ul>
                  </div>
                </details>
              </li>
              <li>
                <Link href='/contact' className={topNavItemClassName}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div >
        <div className='navbar-end tablet:hidden'>
          <button
            ref={buttonRef}
            type='button'
            className='h-12 w-12 rounded-btn shadow-btn bg-base-100 hover:bg-base-200 flex items-center justify-center p-0'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls='mobile-menu'
            aria-haspopup='true'
            style={{ minWidth: '48px', minHeight: '48px' }}
          >
            {isMenuOpen ? (
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
                className='text-primary-700'
              >
                <path
                  d='M6 18L18 6M6 6l12 12'
                  stroke='currentColor'
                  strokeWidth='3'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
                className='text-primary-700'
              >
                <path
                  d='M4 6h16M4 12h16M4 18h16'
                  stroke='currentColor'
                  strokeWidth='3'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            )}
          </button>
        </div>
      </div >
      {isMenuOpen && (
        <div
          ref={menuRef}
          id='mobile-menu'
          role='menu'
          className='absolute top-full left-0 right-0 bg-base-100 rounded-b-box shadow-xl z-[60] overflow-visible tablet:hidden'
          aria-label='Main navigation'
        >
          <div className='grid grid-cols-2 gap-2 p-2'>
            <div className='flex flex-col items-start'>
              <div className='w-full min-h-[36px] px-4 flex items-center rounded-btn'>
                <p className='font-moreSugar text-sm leading-none text-[color:var(--color-navigation)]'>
                  MENU
                </p>
              </div>
              <Link
                href='/cakes-by-post'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Cakes by post
              </Link>
              <Link
                href='/cakes'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Custom cakes
              </Link>
              <Link
                href='/faqs'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link
                href='/contact'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
            <div className='flex flex-col items-start'>
              <div className='w-full min-h-[36px] px-4 flex items-center rounded-btn'>
                <p className='font-moreSugar text-sm leading-none text-[color:var(--color-navigation)]'>
                  LEARN & VISIT
                </p>
              </div>
              <Link
                href='/learn/articles'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Articles
              </Link>
              <Link
                href='/learn/guides'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Guides
              </Link>
              <Link
                href='/learn/workshops'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Workshops
              </Link>
              <Link
                href='/learn/customer-stories'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Customer stories
              </Link>
              <Link
                href='/farmers-markets'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Find us at farmers markets
              </Link>
            </div>
          </div>
        </div>
      )
      }
    </header >
  )
}





