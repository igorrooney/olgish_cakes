"use client"

import { MobileHeader } from "./mobile-homepage/MobileHeader"
import { TabletHeader } from "./tablet/TabletHeader"
import { Header } from "./Header"
import { useIsDesktop } from "@/app/hooks/useIsDesktop"
import { useIsTablet } from "@/app/hooks/useIsTablet"

export function ConditionalHeader() {
  const isDesktop = useIsDesktop()
  const isTablet = useIsTablet()

  // Use Header for desktop (>= 1280px / small-laptop breakpoint)
  // Use TabletHeader for tablet (>= 1024px and < 1280px)
  // Use MobileHeader for mobile (< 1024px)
  if (isDesktop) {
    return <Header />
  }

  if (isTablet) {
    return <TabletHeader />
  }

  return <MobileHeader />
}

