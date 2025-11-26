"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { useAnalytics } from "@/app/hooks/useAnalytics";
import { usePerformanceMonitor } from "./PerformanceMonitor";

interface MobileNavbarProps {
  navigation: Array<{
    name: string;
    href: string;
    megaMenu?: {
      featured: Array<{ name: string; href: string; description?: string }>;
      categories: Array<{
        title: string;
        items: Array<{ name: string; href: string }>;
      }>;
    };
    dropdown?: Array<{ name: string; href: string }>;
  }>;
  onDrawerToggle: () => void;
  drawerOpen: boolean;
}

export function MobileNavbar({ navigation, onDrawerToggle, drawerOpen }: MobileNavbarProps) {
  const { trackMobileMenuInteraction } = useAnalytics();
  const { startTimer } = usePerformanceMonitor();

  const handleMenuClick = useCallback(() => {
    const endTimer = startTimer(drawerOpen ? "menuCloseTime" : "menuOpenTime");
    onDrawerToggle();
    trackMobileMenuInteraction(drawerOpen ? "close" : "open", "drawer");
    setTimeout(endTimer, 0);
  }, [drawerOpen, onDrawerToggle, trackMobileMenuInteraction, startTimer]);

  return (
    <div
      className="navbar sticky top-0 z-50 w-full h-[72px] bg-[#FFFBEB] flex flex-row justify-between items-center pt-4 pr-4 pb-2 pl-4"
      style={{ width: "390px", maxWidth: "100%" }}
    >
      <div className="flex-none">
        <Link
          href="/"
          className="btn btn-ghost normal-case p-0"
          aria-label="Olgish Cakes - Home"
        >
          <Image
            src="/images/olgish-cakes-logo-bakery-brand.png"
            alt="Olgish Cakes - #1 Ukrainian Bakery Leeds"
            width={100}
            height={48}
            priority
            className="h-auto max-h-[48px] w-auto"
          />
        </Link>
      </div>
      <div className="flex-none">
        <button
          className="flex flex-row justify-center items-center rounded-lg"
          aria-label={drawerOpen ? "Close mobile menu" : "Open mobile menu"}
          onClick={handleMenuClick}
          type="button"
          style={{
            padding: "0px 16px",
            gap: "8px",
            margin: "0 auto",
            width: "48px",
            height: "48px",
            filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))",
            borderRadius: "8px",
            flex: "none",
            order: 1,
            flexGrow: 0,
            color: "#2D2D2D",
          }}
        >
          {drawerOpen ? (
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
          ) : (
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

