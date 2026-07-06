"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { trackEvent } from "@/lib/api";

/** Fire-and-forget page view tracking to the backend analytics API. */
export function PageAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    trackEvent("page_view");
  }, [pathname]);
  return null;
}
