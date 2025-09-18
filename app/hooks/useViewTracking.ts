import { useEffect, useRef } from 'react';

interface UseViewTrackingOptions {
  postId: string;
  enabled?: boolean;
}

export function useViewTracking({ postId, enabled = true }: UseViewTrackingOptions) {
  const hasTracked = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !postId || hasTracked.current) {
      return;
    }

    // Track view after 2 seconds to ensure user is actually reading
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/blog-posts/${postId}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          hasTracked.current = true;
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [postId, enabled]);

  return { hasTracked: hasTracked.current };
}
