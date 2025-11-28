"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { colors } from "@/lib/design-system"

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isMenuOpen) return;

      const target = event.target;
      
      // Type guard instead of assertion
      if (!(target instanceof Node)) {
        return;
      }
      
      // Don't close if clicking on the menu button
      if (buttonRef.current?.contains(target)) {
        return;
      }

      // Close if clicking outside the menu
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-base-100 sticky top-0 z-50 relative">
      <div className="navbar px-4 py-4 lg:px-10 lg:py-4">
        <div className="navbar-start">
          <Link href="/" className="flex items-center gap-2 p-2">
            <div className="w-12 h-12 lg:w-16 lg:h-16 relative">
              <Image
                src="/images/olgish-cakes-logo-bakery-brand.png"
                alt="Olgish Cakes Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>
        <div className="navbar-end">
          <button
            ref={buttonRef}
            type="button"
            className="h-12 w-12 rounded-btn shadow-btn bg-base-100 hover:bg-base-200 flex items-center justify-center p-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="true"
            style={{ minWidth: '48px', minHeight: '48px' }}
          >
            {isMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block', flexShrink: 0, width: '24px', height: '24px' }}
                aria-hidden="true"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  className="stroke-base-content"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block', flexShrink: 0, width: '24px', height: '24px' }}
                aria-hidden="true"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  className="stroke-base-content"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          role="menu"
          className="absolute top-full left-0 right-0 bg-base-100 rounded-b-box shadow-xl z-[60] overflow-visible"
          aria-label="Main navigation"
        >
          <div className="grid grid-cols-2 gap-2 p-2">
            <div className="flex flex-col items-start">
              <div className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn" style={{ minHeight: '36px' }}>
                <p
                  className="font-moreSugar text-sm leading-none"
                  style={{ color: colors.navigation.main }}
                >
                  MENU
                </p>
              </div>
              <Link
                href="/cakes"
                role="menuitem"
                className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn text-base-content text-sm leading-none"
                style={{ minHeight: '36px', fontFamily: 'Inter' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Cakes by post
              </Link>
              <Link
                href="/custom-cakes"
                role="menuitem"
                className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn text-base-content text-sm leading-none"
                style={{ minHeight: '36px', fontFamily: 'Inter' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Custom cakes
              </Link>
              <Link
                href="/farmers-markets"
                role="menuitem"
                className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn text-base-content text-sm leading-none"
                style={{ minHeight: '36px', fontFamily: 'Inter' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Farmers markets
              </Link>
              <Link
                href="/faqs"
                role="menuitem"
                className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn text-base-content text-sm leading-none"
                style={{ minHeight: '36px', fontFamily: 'Inter' }}
                onClick={() => setIsMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link
                href="/contact"
                role="menuitem"
                className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn text-base-content text-sm leading-none"
                style={{ minHeight: '36px', fontFamily: 'Inter' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
            <div className="flex flex-col items-start">
              <div className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn" style={{ minHeight: '36px' }}>
                <p
                  className="font-moreSugar text-sm leading-none"
                  style={{ color: colors.navigation.main }}
                >
                  LEARN HUB
                </p>
              </div>
              <Link
                href="/learn/articles"
                role="menuitem"
                className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn text-base-content text-sm leading-none"
                style={{ minHeight: '36px', fontFamily: 'Inter' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Articles
              </Link>
              <Link
                href="/learn/guides"
                role="menuitem"
                className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn text-base-content text-sm leading-none"
                style={{ minHeight: '36px', fontFamily: 'Inter' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Guides
              </Link>
              <Link
                href="/learn/workshops"
                role="menuitem"
                className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn text-base-content text-sm leading-none"
                style={{ minHeight: '36px', fontFamily: 'Inter' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Workshops
              </Link>
              <Link
                href="/learn/customer-stories"
                role="menuitem"
                className="w-full h-9 min-h-0 max-h-9 px-4 flex items-center rounded-btn text-base-content text-sm leading-none"
                style={{ minHeight: '36px', fontFamily: 'Inter' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Customer stories
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

