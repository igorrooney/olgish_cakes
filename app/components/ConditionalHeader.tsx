"use client";

import { MobileHeader } from "./mobile-homepage/MobileHeader";

export function ConditionalHeader() {
  // Use MobileHeader on all pages (homepage already includes it in page.tsx)
  return <MobileHeader />;
}

