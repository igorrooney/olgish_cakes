"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { colors } from "@/lib/design-system";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isMenuOpen) return;

      const target = event.target as Node;
      
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

  return (
    <header className="bg-base-100 sticky top-0 z-50 relative">
      <div className="navbar px-4 py-4 lg:px-10 lg:py-4">
        <div className="navbar-start">
          <Link href="/" className="flex items-center gap-2 p-2">
            <div className="w-12 h-12 relative">
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
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="#1F2937"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ stroke: '#1F2937' }}
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
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="#1F2937"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ stroke: '#1F2937' }}
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div ref={menuRef} className="absolute top-full left-0 right-0 bg-base-100 rounded-b-box shadow-xl z-[60] overflow-visible">
          <div className="grid grid-cols-2 gap-2 p-2">
            <div className="flex flex-col items-start">
              <div className="w-full px-4 py-0 h-9 flex items-center rounded-btn">
                <p 
                  className="font-moreSugar text-sm leading-5" 
                  style={{ 
                    color: colors.navigation.main,
                    fontFamily: "var(--font-more-sugar), cursive, fantasy"
                  }}
                >
                  MENU
                </p>
              </div>
              <Link
                href="/cakes"
                className="w-full px-4 py-0 h-9 flex items-center rounded-btn text-base-content font-sans text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Cakes by post
              </Link>
              <Link
                href="/custom-cakes"
                className="w-full px-4 py-0 h-9 flex items-center rounded-btn text-base-content font-sans text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Custom cakes
              </Link>
              <Link
                href="/farmers-markets"
                className="w-full px-4 py-0 h-9 flex items-center rounded-btn text-base-content font-sans text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Farmers markets
              </Link>
              <Link
                href="/faqs"
                className="w-full px-4 py-0 h-9 flex items-center rounded-btn text-base-content font-sans text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link
                href="/contact"
                className="w-full px-4 py-0 h-9 flex items-center rounded-btn text-base-content font-sans text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
            <div className="flex flex-col items-start">
              <div className="w-full px-4 py-0 h-9 flex items-center rounded-btn">
                <p 
                  className="font-moreSugar text-sm leading-5" 
                  style={{ 
                    color: colors.navigation.main,
                    fontFamily: "var(--font-more-sugar), cursive, fantasy"
                  }}
                >
                  LEARN HUB
                </p>
              </div>
              <Link
                href="/learn/articles"
                className="w-full px-4 py-0 h-9 flex items-center rounded-btn text-base-content font-sans text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Articles
              </Link>
              <Link
                href="/learn/guides"
                className="w-full px-4 py-0 h-9 flex items-center rounded-btn text-base-content font-sans text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Guides
              </Link>
              <Link
                href="/learn/workshops"
                className="w-full px-4 py-0 h-9 flex items-center rounded-btn text-base-content font-sans text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Workshops
              </Link>
              <Link
                href="/learn/customer-stories"
                className="w-full px-4 py-0 h-9 flex items-center rounded-btn text-base-content font-sans text-sm"
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

