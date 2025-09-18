"use client";

import { useViewTracking } from "@/app/hooks/useViewTracking";

interface ViewTrackerProps {
  postId: string;
  enabled?: boolean;
}

export function ViewTracker({ postId, enabled = true }: ViewTrackerProps) {
  useViewTracking({ postId, enabled });
  
  // This component doesn't render anything, it just tracks views
  return null;
}
