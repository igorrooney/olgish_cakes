"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "./mobile-homepage/MobileHeader"
import { TabletHeader } from "./tablet/TabletHeader"
import { Header } from "./Header"
import { breakpoints } from "@/lib/breakpoints"

export function ConditionalHeader() {
  const [headerType, setHeaderType] = useState<"mobile" | "tablet" | "desktop">("mobile")

  useEffect(() => {
    // Only check window size after component has mounted (client-side only)
    const checkHeaderType = () => {
      if (typeof window === "undefined") return

      const width = window.innerWidth
      if (width >= breakpoints["small-laptop"]) {
        setHeaderType("desktop")
      } else if (width >= breakpoints.tablet) {
        setHeaderType("tablet")
      } else {
        setHeaderType("mobile")
      }
    }

    // Check on mount
    checkHeaderType()

    // Add resize listener
    window.addEventListener("resize", checkHeaderType)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkHeaderType)
    }
  }, [])

  // Always render MobileHeader on initial render (server and first client render)
  // This ensures server and client HTML match exactly
  if (headerType === "mobile") {
    return <MobileHeader />
  }

  if (headerType === "desktop") {
    return <Header />
  }

  return <TabletHeader />
}

