import Link from 'next/link'
import Image from 'next/image'
import { ManageCookiesLink } from './ManageCookiesLink'

export function SiteFooter() {
  const isConsentEnabled = Boolean(process.env.NEXT_PUBLIC_GTM_ID)

  return (
    <>
      <div className="relative w-full h-auto bg-base-100">
        <Image
          src="/design/mobile-home/footer-image.png"
          alt="Decorative yellow wavy divider with dots"
          width={430}
          height={100}
          className="w-full h-auto object-contain"
        />
      </div>
      <footer className="bg-base-100 text-base-content">
        <div className="footer w-full px-6 py-8 tablet:px-20 tablet:py-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 tablet:grid-cols-3 tablet:gap-x-10 tablet:items-start tablet:justify-items-start tablet:justify-start text-left">
            <nav className="flex flex-col gap-2">
              <h6 className="mb-2 font-moreSugar text-sm tablet:text-xl font-normal leading-5 tracking-normal text-left align-middle text-[color:var(--color-navigation)] uppercase">
                Navigation
              </h6>
              <Link href="/cakes" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Cakes by post
              </Link>
              <Link href="/custom-cakes" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Custom cakes
              </Link>
              <Link href="/farmers-markets" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Farmers Markets
              </Link>
              <Link href="/learn" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Learn hub
              </Link>
              <Link href="/faqs" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                FAQs
              </Link>
              <Link href="/contact" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Contact
              </Link>
            </nav>
            <nav className="flex flex-col gap-2">
              <h6 className="mb-2 font-moreSugar text-sm tablet:text-xl font-normal leading-5 tracking-normal text-left align-middle text-[color:var(--color-navigation)] uppercase">
                Contact
              </h6>
              <a
                href="tel:+447867218194"
                className="link link-hover font-sans text-sm tablet:text-base text-base-content"
              >
                +44 786 721 8194
              </a>
              <a
                href="mailto:hello@olgishcakes.co.uk"
                className="link link-hover font-sans text-sm tablet:text-base text-base-content"
              >
                hello@olgishcakes.co.uk
              </a>
              <span className="font-sans text-sm tablet:text-base text-base-content">
                Allerton Grange
              </span>
              <span className="font-sans text-sm tablet:text-base text-base-content">
                Leeds, LS17
              </span>
            </nav>
            <nav className="flex flex-col gap-2 col-span-2 tablet:col-span-1">
              <h6 className="mb-2 font-moreSugar text-sm tablet:text-xl font-normal leading-5 tracking-normal text-left align-middle text-[color:var(--color-navigation)] uppercase">
                Footer
              </h6>
              <Link href="/delivery" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Delivery & returns
              </Link>
              <Link href="/allergens" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Allergens
              </Link>
              <Link href="/ingredients" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Ingredients
              </Link>
              <Link href="/terms" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Terms
              </Link>
              <Link href="/privacy" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Privacy policy
              </Link>
              {isConsentEnabled ? (
                <ManageCookiesLink className="link link-hover font-sans text-sm tablet:text-base text-base-content text-left" />
              ) : null}
              <Link href="/sitemap" className="link link-hover font-sans text-sm tablet:text-base text-base-content">
                Sitemap
              </Link>
            </nav>
          </div>
        </div>
        <div className="border-base-300 border-t">
          <div className="footer grid-flow-row place-items-start text-left tablet:!grid-flow-col tablet:items-center tablet:flex-start px-6 py-6 lg:px-20 tablet:py-6">
            <aside className="flex items-center gap-3">
              <div className="w-12 h-12 tablet:w-16 tablet:h-16 relative">
                <Image
                  src="/images/olgish-cakes-logo-bakery-brand.png"
                  alt="Olgish Cakes Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-moreSugar text-base tablet:text-2xl text-primary-500">
                  Olgish Cakes
                </p>
                <p className="font-body text-sm tablet:text-base text-base-content">
                  Made with Ukrainian heart
                </p>
              </div>
            </aside>
            <nav className="mt-4 w-full tablet:mt-0 tablet:w-auto">
              <div className="mx-auto flex items-center justify-center gap-4">
                <a
                  href="https://www.facebook.com/p/Olgish-Cakes-61557043820222"
                  className="link link-hover w-6 h-6 tablet:w-6 tablet:h-6"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                >
                  <svg
                    className="w-6 h-6 text-primary-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/channel/UCxv3i6tL5v5KZNjT1z1Rx1Q?cbrd=1"
                  className="link link-hover w-6 h-6 tablet:w-6 tablet:h-6"
                  aria-label="YouTube"
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                >
                  <svg
                    className="w-6 h-6 text-primary-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/olgish_cakes"
                  className="link link-hover w-6 h-6 tablet:w-6 tablet:h-6"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <svg
                    className="w-6 h-6 text-primary-200"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                  </svg>
                </a>
              </div>
            </nav>
          </div>
          <div className="px-6 pb-6 lg:px-20 tablet:pb-6">
            <p className="text-center font-body text-sm tablet:text-base text-base-content">
              © {new Date().getFullYear()} Olgish Cakes. All rights reserved.
            </p>
            <div className="mt-2 flex flex-col items-center gap-1 text-center font-body text-xs text-base-content tablet:flex-row tablet:gap-3">
              <span>
                Design by{' '}
                <a
                  href="https://jamie-stanley.netlify.app/"
                  className="link link-hover"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Jamie Stanley
                </a>
              </span>
              <span className="hidden text-base-content opacity-70 tablet:inline" aria-hidden="true">
                •
              </span>
              <span>
                Website development by{' '}
                <a
                  href="https://www.linkedin.com/in/igor-ieromenko-b57b1ba4/"
                  className="link link-hover"
                  target="_blank"
                  rel="noreferrer noopener"
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
