import { DeferredManageCookiesLink } from './DeferredManageCookiesLink'

const footerSectionHeadingClassName = 'mb-2 font-moreSugar text-sm font-normal uppercase leading-5 tracking-normal text-left text-[color:var(--color-navigation)] tablet:text-xl'
const footerLinkClassName = 'link link-hover text-sm text-base-content tablet:text-base'
const deferredFooterStyle = {
  contentVisibility: 'auto',
  containIntrinsicSize: '520px'
} as const

export function SiteFooter() {
  const isConsentEnabled = Boolean(process.env.NEXT_PUBLIC_GTM_ID)
  const currentYear = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date())

  return (
    <>
      <div aria-hidden='true' className='footer-divider-art relative hidden w-full bg-base-100 tablet:block' />
      <footer className='bg-base-100 text-base-content' style={deferredFooterStyle}>
        <div className='footer w-full px-6 py-6 tablet:px-20 tablet:py-8'>
          <div className='grid grid-cols-2 gap-x-6 gap-y-6 text-left tablet:grid-cols-3 tablet:items-start tablet:justify-items-start tablet:justify-start tablet:gap-x-10 tablet:gap-y-8'>
            <nav className='flex flex-col gap-2'>
              <p className={footerSectionHeadingClassName}>
                Navigation
              </p>
              <a href='/cakes-by-post' className={footerLinkClassName}>
                Cakes by post
              </a>
              <a href='/custom-cakes' className={footerLinkClassName}>
                Custom cakes
              </a>
              <a href='/blog' className={footerLinkClassName}>
                Articles
              </a>
              <a href='/faqs' className={footerLinkClassName}>
                FAQs
              </a>
              <a href='/contact' className={footerLinkClassName}>
                Contact
              </a>
            </nav>
            <nav className='flex flex-col gap-2'>
              <p className={footerSectionHeadingClassName}>
                Contact
              </p>
              <a href='tel:+447867218194' className={footerLinkClassName}>
                +44 786 721 8194
              </a>
              <a href='mailto:hello@olgishcakes.co.uk' className={footerLinkClassName}>
                hello@olgishcakes.co.uk
              </a>
              <span className='text-sm text-base-content tablet:text-base'>
                Allerton Grange
              </span>
              <span className='text-sm text-base-content tablet:text-base'>
                Leeds, LS17
              </span>
            </nav>
            <nav className='col-span-2 flex flex-col gap-2 tablet:col-span-1'>
              <p className={footerSectionHeadingClassName}>
                Footer
              </p>
              <a href='/delivery' className={footerLinkClassName}>
                Delivery & returns
              </a>
              <a href='/allergens' className={footerLinkClassName}>
                Allergens
              </a>
              <a href='/terms' className={footerLinkClassName}>
                Terms
              </a>
              <a href='/privacy' className={footerLinkClassName}>
                Privacy policy
              </a>
              {isConsentEnabled ? (
                <DeferredManageCookiesLink className='link link-hover text-left text-sm text-base-content tablet:text-base' />
              ) : null}
              <a href='/sitemap.xml' className={footerLinkClassName}>
                Sitemap
              </a>
            </nav>
          </div>
        </div>
        <div className='border-t border-base-300'>
          <div className='footer place-items-start px-6 py-5 text-left tablet:!grid-flow-col tablet:flex-start tablet:items-center tablet:py-6 lg:px-20'>
            <aside className='flex items-center gap-3'>
              <div className='relative h-12 w-12 tablet:h-16 tablet:w-16'>
                <img
                  src='/images/olgish-cakes-logo-bakery-brand-128.webp'
                  alt='Olgish Cakes Logo'
                  width={128}
                  height={128}
                  decoding='async'
                  loading='lazy'
                  fetchPriority='low'
                  className='h-full w-full object-contain'
                />
              </div>
              <div>
                <p className='font-moreSugar text-base text-primary-500 tablet:text-2xl'>
                  Olgish Cakes
                </p>
                <p className='text-sm text-base-content tablet:text-base'>
                  Made with Ukrainian heart
                </p>
              </div>
            </aside>
            <nav className='mt-3 w-full tablet:mt-0 tablet:w-auto'>
              <div className='mx-auto flex items-center justify-center gap-4'>
                <a
                  href='https://www.facebook.com/p/Olgish-Cakes-61557043820222'
                  className='link link-hover h-6 w-6 tablet:h-6 tablet:w-6'
                  aria-label='Facebook'
                  target='_blank'
                  rel='noreferrer noopener nofollow'
                >
                  <svg className='h-6 w-6 text-primary-200' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                  </svg>
                </a>
                <a
                  href='https://www.youtube.com/channel/UCxv3i6tL5v5KZNjT1z1Rx1Q?cbrd=1'
                  className='link link-hover h-6 w-6 tablet:h-6 tablet:w-6'
                  aria-label='YouTube'
                  target='_blank'
                  rel='noreferrer noopener nofollow'
                >
                  <svg className='h-6 w-6 text-primary-200' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
                  </svg>
                </a>
                <a
                  href='https://www.instagram.com/olgish_cakes'
                  className='link link-hover h-6 w-6 tablet:h-6 tablet:w-6'
                  aria-label='Instagram'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <svg className='h-6 w-6 text-primary-200' fill='currentColor' viewBox='0 0 16 16'>
                    <path d='M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334' />
                  </svg>
                </a>
              </div>
            </nav>
          </div>
          <div className='px-6 pb-5 tablet:pb-6 lg:px-20'>
            <p className='text-center text-sm text-base-content tablet:text-base'>
              &copy; {currentYear} Olgish Cakes. All rights reserved.
            </p>
            <div className='mt-2 flex flex-col items-center gap-1 text-center text-xs text-base-content tablet:flex-row tablet:gap-3'>
              <span>
                Design by{' '}
                <a
                  href='https://jamie-stanley.netlify.app/'
                  className='link link-hover'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  Jamie Stanley
                </a>
              </span>
              <span className='hidden text-base-content/70 tablet:inline' aria-hidden='true'>
                |
              </span>
              <span>
                Website development by{' '}
                <a
                  href='https://www.linkedin.com/in/igor-ieromenko-b57b1ba4/'
                  className='link link-hover'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  Igor Ieromenko
                </a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
