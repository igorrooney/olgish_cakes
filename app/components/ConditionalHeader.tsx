"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide Header on home page where MobileHeader is used
  if (pathname === "/") {
    return null;
  }
  
  return <Header />;
}

