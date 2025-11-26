"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen || !mounted) return null;

  const menuContent = (
    <div 
      className="fixed inset-0" 
      style={{ 
        zIndex: 99999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "block",
        visibility: "visible",
        opacity: 1,
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ 
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          visibility: "visible",
          opacity: 1,
        }}
        onClick={onClose}
        aria-label="Close mobile menu"
      />
      
      {/* Menu Panel */}
      <div
        className="absolute right-0 top-0 bottom-0 p-4 overflow-y-auto shadow-lg"
        style={{
          backgroundColor: "#FFFBEB",
          width: "390px",
          maxWidth: "100%",
          maxHeight: "100vh",
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          visibility: "visible",
          opacity: 1,
          transform: "translateX(0)",
        }}
      >
        {/* Header with Logo and Close Button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center"
            aria-label="Olgish Cakes - Home"
          >
            <Image
              src="/images/olgish-cakes-logo-bakery-brand.png"
              alt="Olgish Cakes"
              width={120}
              height={48}
              priority
              className="h-auto max-h-[48px] w-auto"
            />
          </Link>
          <button
            onClick={onClose}
            className="btn btn-square btn-ghost"
            aria-label="Close mobile menu"
            type="button"
            style={{
              width: "48px",
              height: "48px",
              padding: "0px 16px",
              gap: "8px",
              filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))",
              borderRadius: "8px",
              color: "#2D2D2D",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Two Column Menu Layout */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* MENU Column */}
          <div>
            <h3 className="text-sm font-bold uppercase mb-3" style={{ color: "#2D2D2D" }}>
              MENU
            </h3>
            <ul className="menu menu-vertical p-0 gap-2">
              <li>
                <Link
                  href="/gift-hampers/cake-by-post"
                  onClick={handleLinkClick}
                  className="text-base hover:text-primary"
                  style={{ color: "#2D2D2D" }}
                >
                  Cakes by post
                </Link>
              </li>
              <li>
                <Link
                  href="/custom-cake-design"
                  onClick={handleLinkClick}
                  className="text-base hover:text-primary"
                  style={{ color: "#2D2D2D" }}
                >
                  Custom cakes
                </Link>
              </li>
              <li>
                <Link
                  href="/market-schedule"
                  onClick={handleLinkClick}
                  className="text-base hover:text-primary"
                  style={{ color: "#2D2D2D" }}
                >
                  Farmers markets
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  onClick={handleLinkClick}
                  className="text-base hover:text-primary"
                  style={{ color: "#2D2D2D" }}
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  onClick={handleLinkClick}
                  className="text-base hover:text-primary"
                  style={{ color: "#2D2D2D" }}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* LEARN HUB Column */}
          <div>
            <h3 className="text-sm font-bold uppercase mb-3" style={{ color: "#2D2D2D" }}>
              LEARN HUB
            </h3>
            <ul className="menu menu-vertical p-0 gap-2">
              <li>
                <Link
                  href="/blog"
                  onClick={handleLinkClick}
                  className="text-base hover:text-primary"
                  style={{ color: "#2D2D2D" }}
                >
                  Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/ukrainian-cake-recipes"
                  onClick={handleLinkClick}
                  className="text-base hover:text-primary"
                  style={{ color: "#2D2D2D" }}
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/ukrainian-baking-classes"
                  onClick={handleLinkClick}
                  className="text-base hover:text-primary"
                  style={{ color: "#2D2D2D" }}
                >
                  Workshops
                </Link>
              </li>
              <li>
                <Link
                  href="/customer-stories"
                  onClick={handleLinkClick}
                  className="text-base hover:text-primary"
                  style={{ color: "#2D2D2D" }}
                >
                  Customer stories
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Cake Images Carousel */}
        <div className="flex gap-2 overflow-x-auto">
          <div className="flex-shrink-0 w-[120px] h-[90px] bg-base-200 rounded-lg overflow-hidden">
            <Image
              src="https://picsum.photos/120/90?random=1"
              alt="Cake 1"
              width={120}
              height={90}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-shrink-0 w-[120px] h-[90px] bg-base-200 rounded-lg overflow-hidden">
            <Image
              src="https://picsum.photos/120/90?random=2"
              alt="Cake 2"
              width={120}
              height={90}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-shrink-0 w-[120px] h-[90px] bg-base-200 rounded-lg overflow-hidden">
            <Image
              src="https://picsum.photos/120/90?random=3"
              alt="Cake 3"
              width={120}
              height={90}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}
