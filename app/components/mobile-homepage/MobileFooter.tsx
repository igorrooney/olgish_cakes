"use client";

import Link from "next/link";
import Image from "next/image";

export function MobileFooter() {
  return (
    <footer className="bg-base-100 border-t border-base-300">
      <div className="flex flex-col gap-8 px-10 py-6 lg:px-20 lg:py-6">
        {/* Mobile: Vertical layout, Tablet: Horizontal multi-column */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10 lg:flex-wrap">
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-sm lg:text-xl text-[color:var(--color-navigation)] uppercase">
              NAVIGATION
            </h3>
            <ul className="menu menu-vertical gap-2">
              <li>
                <Link href="/cakes" className="font-sans text-sm lg:text-base text-base-content">
                  Cakes by post
                </Link>
              </li>
              <li>
                <Link href="/custom-cakes" className="font-sans text-sm lg:text-base text-base-content">
                  Custom cakes
                </Link>
              </li>
              <li>
                <Link href="/farmers-markets" className="font-sans text-sm lg:text-base text-base-content">
                  Farmers Markets
                </Link>
              </li>
              <li>
                <Link href="/learn" className="font-sans text-sm lg:text-base text-base-content">
                  Learn hub
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="font-sans text-sm lg:text-base text-base-content">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="font-sans text-sm lg:text-base text-base-content">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-sm lg:text-xl text-[color:var(--color-navigation)] uppercase">
              CONTACT
            </h3>
            <ul className="menu menu-vertical gap-2">
              <li>
                <a
                  href="tel:+447867218194"
                  className="link font-sans text-sm lg:text-base text-base-content"
                >
                  +44 786 721 8194
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@olgishcakes.co.uk"
                  className="link font-sans text-sm lg:text-base text-base-content"
                >
                  hello@olgishcakes.co.uk
                </a>
              </li>
              <li className="font-sans text-sm lg:text-base text-base-content">
                Allerton Grange
              </li>
              <li className="font-sans text-sm lg:text-base text-base-content">
                Leeds, LS17
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-sm lg:text-xl text-[color:var(--color-navigation)] uppercase">
              FOOTER
            </h3>
            <ul className="menu menu-vertical gap-2">
              <li>
                <Link href="/delivery" className="font-sans text-sm lg:text-base text-base-content">
                  Delivery & returns
                </Link>
              </li>
              <li>
                <Link href="/allergens" className="font-sans text-sm lg:text-base text-base-content">
                  Allergens
                </Link>
              </li>
              <li>
                <Link href="/ingredients" className="font-sans text-sm lg:text-base text-base-content">
                  Ingredients
                </Link>
              </li>
              <li>
                <Link href="/terms" className="font-sans text-sm lg:text-base text-base-content">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="font-sans text-sm lg:text-base text-base-content">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="font-sans text-sm lg:text-base text-base-content">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 items-center py-4 lg:justify-between lg:items-center">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 relative">
              <Image
                src="/images/olgish-cakes-logo-bakery-brand.png"
                alt="Olgish Cakes Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-display text-base lg:text-2xl text-primary-500">
                Olgish Cakes
              </p>
              <p className="font-body text-sm lg:text-base text-base-content">
                Made with Ukrainian heart
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center justify-center">
            <a
              href="#"
              className="w-6 h-6 lg:w-6 lg:h-6"
              aria-label="Facebook"
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
              href="#"
              className="w-6 h-6 lg:w-6 lg:h-6"
              aria-label="YouTube"
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
              href="#"
              className="w-6 h-6 lg:w-6 lg:h-6"
              aria-label="Twitter"
            >
              <svg
                className="w-6 h-6 text-primary-200"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

