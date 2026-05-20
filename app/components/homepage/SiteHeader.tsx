import { DesktopDropdown, type DropdownConfig } from './DesktopDropdown'

const topNavItemClassName =
  'rounded-btn px-3 py-2 text-lg font-body text-base-content transition-colors whitespace-nowrap hover:bg-transparent hover:text-navigation active:!bg-transparent'
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

function HeaderLogoLink() {
  return (
    <a
      href='/'
      className='btn btn-ghost normal-case px-2 hover:bg-transparent hover:text-inherit hover:border-transparent focus:bg-transparent focus:text-inherit focus:border-transparent focus:!outline-none focus-visible:bg-transparent focus-visible:text-inherit focus-visible:border-transparent focus-visible:outline-none'
    >
      <div className='relative h-12 w-12 tablet:h-16 tablet:w-16'>
        <img
          src='/images/navbar-logo-128.webp'
          alt='Olgish Cakes logo'
          width={128}
          height={128}
          decoding='async'
          fetchPriority='low'
          className='h-full w-full object-contain'
        />
      </div>
    </a>
  )
}

function MenuIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      className='text-primary-700 group-open/mobile-menu:hidden'
    >
      <path
        d='M4 6h16M4 12h16M4 18h16'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      className='hidden text-primary-700 group-open/mobile-menu:block'
    >
      <path
        d='M6 18L18 6M6 6l12 12'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function MobileMenu() {
  return (
    <details className='group/mobile-menu'>
      <summary
        role='button'
        aria-label='Menu'
        aria-controls='mobile-menu'
        aria-haspopup='true'
        className='flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-btn bg-base-100 p-0 shadow-btn hover:bg-base-200 marker:hidden [&::-webkit-details-marker]:hidden'
        style={{ minWidth: '48px', minHeight: '48px' }}
      >
        <MenuIcon />
        <CloseIcon />
      </summary>
      <div
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
            <a href='/cakes-by-post' role='menuitem' className={mobileMenuItemClassName}>
              Cakes by post
            </a>
            <a href='/cakes' role='menuitem' className={mobileMenuItemClassName}>
              Custom cakes
            </a>
            <a href={quotePageHref} role='menuitem' className={mobileMenuItemClassName}>
              Get a quote
            </a>
            <a href='/faqs' role='menuitem' className={mobileMenuItemClassName}>
              FAQs
            </a>
            <a href='/contact' role='menuitem' className={mobileMenuItemClassName}>
              Contact
            </a>
          </div>
          <div className='flex flex-col items-start'>
            <div className='flex min-h-[36px] w-full items-center rounded-btn px-4'>
              <p className='font-moreSugar text-sm leading-none text-[color:var(--color-navigation)]'>
                LEARN
              </p>
            </div>
            <a href='/blog' role='menuitem' className={mobileMenuItemClassName}>
              Articles
            </a>
            <a href='/learn/workshops' role='menuitem' className={mobileMenuItemClassName}>
              Workshops
            </a>
          </div>
        </div>
      </div>
    </details>
  )
}

export function SiteHeader() {
  return (
    <header className='relative z-[9999] tablet:sticky tablet:top-0'>
      <div className='navbar relative z-[9999] bg-base-100 px-4 py-3 tablet:px-10 tablet:py-5 small-laptop:px-12 large-laptop:px-16'>
        <div className='navbar-start'>
          <HeaderLogoLink />
        </div>
        <div className='navbar-center absolute left-1/2 hidden -translate-x-1/2 tablet:flex'>
          <nav aria-label='Main navigation'>
            <ul className='menu menu-horizontal px-1 !list-none gap-6 large-laptop:gap-8 flex-nowrap whitespace-nowrap overflow-visible [&>li]:list-none [&>li]:marker:text-transparent [&>li]:before:hidden [&>li]:after:hidden'>
              <li>
                <a href='/cakes-by-post' className={topNavItemClassName}>
                  Cakes by post
                </a>
              </li>
              {desktopDropdowns.map((dropdown) => (
                <DesktopDropdown key={dropdown.id} dropdown={dropdown} />
              ))}
              <li>
                <a href='/contact' className={topNavItemClassName}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className='navbar-end tablet:hidden'>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
