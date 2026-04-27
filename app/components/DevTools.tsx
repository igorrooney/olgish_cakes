"use client";

import { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  Tooltip,
  SettingsIcon,
  CloseIcon,
  RefreshIcon,
  ClearIcon,
  Chip,
  Divider,
} from "@/lib/daisy-ui";
import { AccessibleIconButton, TouchTargetWrapper } from "@/lib/ui-components";
import { clearCache, invalidateCache } from "@/app/utils/fetchCakes";
import { cacheManager } from "@/app/utils/cacheManager";

export function DevTools() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [lastCleared, setLastCleared] = useState<Date | null>(null);

  const handleClearCache = async () => {
    setIsClearing(true);
    setMessage(null);

    try {
      await cacheManager.clearAllCache();
      setLastCleared(new Date());
      setMessage("✅ Cache cleared successfully!");
    } catch (error) {
      setMessage("❌ Failed to clear cache");
      console.error("Cache clear error:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearPattern = async (pattern: string) => {
    setIsClearing(true);
    setMessage(null);

    try {
      await cacheManager.clearCachePattern(pattern);
      setLastCleared(new Date());
      setMessage(`✅ Cache cleared for pattern: ${pattern}`);
    } catch (error) {
      setMessage("❌ Failed to clear cache pattern");
      console.error("Cache clear error:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleForceRefresh = () => {
    clearCache();
    // Force a hard refresh by adding cache-busting parameter
    const url = new URL(window.location.href);
    url.searchParams.set('_t', Date.now().toString());
    window.location.href = url.toString();
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const cacheStatus = cacheManager.getCacheStatus();

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      {/* Toggle Icon */}
      <Tooltip title="Developer Tools" placement="left">
        <Box component="span" sx={{ display: "inline-flex" }}>
          <AccessibleIconButton
            onClick={toggleVisibility}
            ariaLabel="Toggle developer tools"
            sx={{
              position: "fixed",
              bottom: 16,
              right: isVisible ? 220 : 16,
              zIndex: 1001,
              backgroundColor: "primary.main",
              color: "white",
              width: 48,
              height: 48,
              boxShadow: 3,
              "&:hover": {
                backgroundColor: "primary.dark",
                transform: "scale(1.1)",
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            {isVisible ? <CloseIcon /> : <SettingsIcon />}
          </AccessibleIconButton>
        </Box>
      </Tooltip>
    </>
  );
}
