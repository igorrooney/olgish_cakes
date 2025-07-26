"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseMobileGesturesProps {
  onSwipeClose?: () => void;
  enabled?: boolean;
}

export function useMobileGestures({ onSwipeClose, enabled = true }: UseMobileGesturesProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  // Haptic feedback for mobile devices
  const triggerHapticFeedback = useCallback(() => {
    if (typeof window !== "undefined" && "navigator" in window) {
      // iOS haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }

      // Android haptic feedback
      if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
        navigator.vibrate(10);
      }
    }
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return;

      touchEndRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !touchStartRef.current || !touchEndRef.current) return;

    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const endX = touchEndRef.current.x;
    const endY = touchEndRef.current.y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Minimum swipe distance (50px)
    if (distance < 50) return;

    // Check if it's a horizontal swipe (more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Right swipe (close menu)
      if (deltaX > 0 && onSwipeClose) {
        triggerHapticFeedback();
        onSwipeClose();
      }
    }

    // Reset touch state
    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [enabled, onSwipeClose, triggerHapticFeedback]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    const element = document.body;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    triggerHapticFeedback,
  };
}
