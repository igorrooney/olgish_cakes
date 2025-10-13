"use client";

import { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  SettingsIcon,
  CloseIcon,
  RefreshIcon,
  ClearIcon,
  Chip,
  Divider,
} from "@/lib/mui-optimization";
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

      {/* Dev Tools Panel */}
      {isVisible && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
            backgroundColor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            boxShadow: 3,
            minWidth: 280,
            maxWidth: 320,
            animation: "slideIn 0.3s ease-out",
            "@keyframes slideIn": {
              from: {
                opacity: 0,
                transform: "translateX(100%)",
              },
              to: {
                opacity: 1,
                transform: "translateX(0)",
              },
            },
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}
            >
              <SettingsIcon sx={{ fontSize: 16 }} />
              Dev Tools
            </Typography>
            <Box component="span" sx={{ display: "inline-flex" }}>
              <AccessibleIconButton
                onClick={toggleVisibility}
                ariaLabel="Close developer tools"
                sx={{ p: 0.5 }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </AccessibleIconButton>
            </Box>
          </Box>

          {/* Cache Status */}
          {cacheStatus.isAutoClearing && (
            <Chip
              label="Auto-clearing every 30s"
              color="info"
              size="small"
              sx={{ mb: 1, width: "100%" }}
            />
          )}

          {message && (
            <Alert
              severity={message.includes("✅") ? "success" : "error"}
              sx={{ mb: 1, fontSize: "0.75rem" }}
              onClose={() => setMessage(null)}
            >
              {message}
            </Alert>
          )}

          {/* Cache Control Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Cache Management
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleClearCache}
                disabled={isClearing}
                startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
                sx={{ fontSize: "0.75rem", justifyContent: "flex-start" }}
                fullWidth
              >
                {isClearing ? "Clearing..." : "Clear All Cache"}
              </Button>

              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleClearPattern("cakes")}
                  disabled={isClearing}
                  sx={{ flex: 1, fontSize: "0.7rem" }}
                >
                  Cakes
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleClearPattern("testimonials")}
                  disabled={isClearing}
                  sx={{ flex: 1, fontSize: "0.7rem" }}
                >
                  Testimonials
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleClearPattern("faqs")}
                  disabled={isClearing}
                  sx={{ flex: 1, fontSize: "0.7rem" }}
                >
                  FAQs
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Other Dev Tools */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Development Tools
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleForceRefresh}
                startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                sx={{ fontSize: "0.75rem", justifyContent: "flex-start" }}
                fullWidth
              >
                Force Refresh
              </Button>
            </Box>
          </Box>

          {/* Last Cleared Info */}
          {lastCleared && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Last cleared: {lastCleared.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      )}
    </>
  );
}
