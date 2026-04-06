'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HoverPrefetchLink } from '../HoverPrefetchLink'

type DropdownId = 'custom-cakes' | 'learn-hub'

type DropdownLink = {
  href: string
  label: string
}

type DropdownConfig = {
  id: DropdownId
  label: string
  alignmentClassName: string
  columns: DropdownLink[][]
}

const topNavItemClassName =
  'rounded-btn px-3 py-2 text-lg font-body text-base-content transition-colors whitespace-nowrap hover:bg-transparent hover:text-navigation active:!bg-transparent'
const topNavButtonClassName =
  'rounded-btn px-3 py-2 text-lg font-body text-base-content transition-colors whitespace-nowrap flex items-center gap-2 hover:bg-transparent hover:text-navigation active:!bg-transparent'
const topNavButtonOpenClassName = 'text-navigation'
const dropdownItemClassName =
  'flex h-7 items-center rounded-btn px-4 text-base leading-5 font-body text-base-content whitespace-nowrap transition-colors hover:bg-base-200 active:!bg-transparent shadow-none active:shadow-none focus:shadow-none focus-visible:shadow-none tablet:h-9'
const dropdownMenuListClassName =
  'menu menu-md !m-0 !p-0 items-start [&::before]:hidden [&>li]:w-full'
const mobileMenuItemClassName =
  'w-full min-h-[36px] px-4 flex items-center rounded-btn text-base-content text-sm leading-none font-sans active:!bg-transparent'
const quotePageHref = '/get-custom-quote#quote-form'

const desktopDropdowns: DropdownConfig[] = [
  {
    id: 'custom-cakes',
    label: 'Custom cakes',
    alignmentClassName: 'left-0 flex w-[378px] gap-3',
    columns: [
      [
        { href: '/cakes', label: 'All cakes' },
        { href: '/wedding-cakes', label: 'Wedding cakes' },
        { href: '/birthday-cakes', label: 'Birthday cakes' },
        { href: '/anniversary-cakes-leeds', label: 'Anniversary cakes' },
        { href: '/baby-shower-cakes', label: 'Baby shower cakes' }
      ],
      [{ href: quotePageHref, label: 'Get a quote' }]
    ]
  },
  {
    id: 'learn-hub',
    label: 'Learn',
    alignmentClassName: 'left-1/2 -translate-x-1/2',
    columns: [[
      { href: '/blog', label: 'Articles' },
      { href: '/learn/workshops', label: 'Workshops' }
    ]]
  }
]

const getDesktopDropdownButtonId = (dropdownId: DropdownId) => `${dropdownId}-desktop-button`
const getDesktopDropdownPanelId = (dropdownId: DropdownId) => `${dropdownId}-desktop-panel`

export function SiteHeaderClient() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<DropdownId | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const customCakesDropdownRef = useRef<HTMLLIElement>(null)
  const learnHubDropdownRef = useRef<HTMLLIElement>(null)

  const getDropdownRef = (dropdownId: DropdownId) => (
    dropdownId === 'custom-cakes' ? customCakesDropdownRef : learnHubDropdownRef
  )

  const toggleDropdown = (dropdownId: DropdownId) => {
    setOpenDropdownId((current) => (current === dropdownId ? null : dropdownId))
  }

  const closeDesktopDropdown = () => {
    setOpenDropdownId(null)
  }

  const handleDesktopDropdownNavigation = () => {
    closeDesktopDropdown()
  }

  const handleDesktopDropdownKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    dropdownId: DropdownId
  ) => {
    const isToggleKey =
      event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown'

    if (!isToggleKey) {
      return
    }

    event.preventDefault()

    if (event.key === 'ArrowDown') {
      setOpenDropdownId(dropdownId)
      return
    }

    toggleDropdown(dropdownId)
  }

  useEffect(() => {
    setOpenDropdownId(null)
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (openDropdownId === null) {
      return
    }

    const handleDesktopPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      const openDropdown = getDropdownRef(openDropdownId).current

      if (!openDropdown) {
        return
      }

      if (openDropdown.contains(target)) {
        return
      }

      closeDesktopDropdown()
    }

    const handleDesktopEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      closeDesktopDropdown()
      const trigger = document.getElementById(getDesktopDropdownButtonId(openDropdownId))

      if (trigger instanceof HTMLButtonElement) {
        trigger.focus()
      }
    }

    document.addEventListener('mousedown', handleDesktopPointerDown)
    document.addEventListener('touchstart', handleDesktopPointerDown)
    document.addEventListener('keydown', handleDesktopEscape)

    return () => {
      document.removeEventListener('mousedown', handleDesktopPointerDown)
      document.removeEventListener('touchstart', handleDesktopPointerDown)
      document.removeEventListener('keydown', handleDesktopEscape)
    }
  }, [openDropdownId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isMenuOpen) {
        return
      }

      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (buttonRef.current?.contains(target)) {
        return
      }

      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

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
          className='absolute left-0 right-0 top-full z-0 hidden h-screen bg-transparent tablet:block'
          onPointerDown={closeDesktopDropdown}
        />
      )}
      <div className='navbar relative z-[9999] bg-base-100 px-4 py-3 tablet:px-10 tablet:py-5 small-laptop:px-12 large-laptop:px-16'>
        <div className='navbar-start'>
          <Link
            href='/'
            className='btn btn-ghost normal-case px-2 hover:bg-transparent hover:text-inherit hover:border-transparent focus:bg-transparent focus:text-inherit focus:border-transparent focus:!outline-none focus-visible:bg-transparent focus-visible:text-inherit focus-visible:border-transparent focus-visible:outline-none'
          >
            <div className='relative h-12 w-12 tablet:h-16 tablet:w-16'>
              <Image
                src='/design/mobile-home/navbar-logo.png'
                alt='Olgish Cakes logo'
                fill
                sizes='(min-width: 768px) 64px, 48px'
                className='object-contain'
              />
            </div>
          </Link>
        </div>
        <div className='navbar-center absolute left-1/2 hidden -translate-x-1/2 tablet:flex'>
          <nav aria-label='Main navigation'>
            <ul className='menu menu-horizontal px-1 !list-none gap-6 large-laptop:gap-8 flex-nowrap whitespace-nowrap overflow-visible [&>li]:list-none [&>li]:marker:text-transparent [&>li]:before:hidden [&>li]:after:hidden'>
              <li>
                <HoverPrefetchLink href='/cakes-by-post' className={topNavItemClassName}>
                  Cakes by post
                </HoverPrefetchLink>
              </li>
              {desktopDropdowns.map((dropdown) => {
                const isOpen = openDropdownId === dropdown.id

                return (
                  <li
                    key={dropdown.id}
                    className='relative overflow-visible'
                    data-nav-dropdown
                    ref={getDropdownRef(dropdown.id)}
                  >
                    <button
                      id={getDesktopDropdownButtonId(dropdown.id)}
                      type='button'
                      className={`${topNavButtonClassName} ${isOpen ? topNavButtonOpenClassName : ''}`}
                      onClick={() => toggleDropdown(dropdown.id)}
                      onKeyDown={(event) => handleDesktopDropdownKeyDown(event, dropdown.id)}
                      aria-expanded={isOpen}
                      aria-controls={getDesktopDropdownPanelId(dropdown.id)}
                      aria-haspopup='true'
                    >
                      <span
                        className={`${isOpen ? 'text-navigation underline decoration-dotted decoration-2 underline-offset-8' : ''}`}
                      >
                        {dropdown.label}
                      </span>
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        aria-hidden='true'
                        className={`transition-transform ${isOpen ? 'rotate-180 text-navigation' : 'text-base-content'}`}
                      >
                        <path
                          d='M6 9l6 6 6-6'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </button>
                    <div
                      id={getDesktopDropdownPanelId(dropdown.id)}
                      hidden={!isOpen}
                      className={`absolute top-full z-[10000] mt-3 rounded-box bg-[linear-gradient(180deg,_#FFFBEB_0%,_#FFFFFF_100%)] p-4 shadow-[0px_4px_6px_-1px_#0000001A] ${dropdown.alignmentClassName} ${
                        isOpen ? 'block' : 'hidden'
                      }`}
                      aria-labelledby={getDesktopDropdownButtonId(dropdown.id)}
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
                              <HoverPrefetchLink
                                href={item.href}
                                className={dropdownItemClassName}
                                onClick={handleDesktopDropdownNavigation}
                              >
                                {item.label}
                              </HoverPrefetchLink>
                            </li>
                          ))}
                        </ul>
                      ))}
                    </div>
                  </li>
                )
              })}
              <li>
                <HoverPrefetchLink href='/contact' className={topNavItemClassName}>
                  Contact
                </HoverPrefetchLink>
              </li>
            </ul>
          </nav>
        </div>
        <div className='navbar-end tablet:hidden'>
          <button
            ref={buttonRef}
            type='button'
            className='flex h-12 w-12 items-center justify-center rounded-btn bg-base-100 p-0 shadow-btn hover:bg-base-200'
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
      </div>
      {isMenuOpen && (
        <div
          ref={menuRef}
          id='mobile-menu'
          role='menu'
          className='absolute left-0 right-0 top-full z-[60] overflow-visible rounded-b-box bg-base-100 shadow-xl tablet:hidden'
          aria-label='Main navigation'
        >
          <div className='grid grid-cols-2 gap-2 p-2'>
            <div className='flex flex-col items-start'>
              <div className='flex min-h-[36px] w-full items-center rounded-btn px-4'>
                <p className='font-moreSugar text-sm leading-none text-[color:var(--color-navigation)]'>
                  MENU
                </p>
              </div>
              <HoverPrefetchLink
                href='/cakes-by-post'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Cakes by post
              </HoverPrefetchLink>
              <HoverPrefetchLink
                href='/cakes'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Custom cakes
              </HoverPrefetchLink>
              <HoverPrefetchLink
                href='/faqs'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                FAQs
              </HoverPrefetchLink>
              <HoverPrefetchLink
                href='/contact'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </HoverPrefetchLink>
            </div>
            <div className='flex flex-col items-start'>
              <div className='flex min-h-[36px] w-full items-center rounded-btn px-4'>
                <p className='font-moreSugar text-sm leading-none text-[color:var(--color-navigation)]'>
                  LEARN
                </p>
              </div>
              <HoverPrefetchLink
                href='/blog'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Articles
              </HoverPrefetchLink>
              <HoverPrefetchLink
                href='/learn/workshops'
                role='menuitem'
                className={mobileMenuItemClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Workshops
              </HoverPrefetchLink>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
