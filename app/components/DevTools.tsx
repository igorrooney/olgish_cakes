"use client";

import { useState } from "react";
import { Button, Box, Typography, Alert, IconButton, Tooltip, SettingsIcon, CloseIcon, RefreshIcon, ClearIcon } from "@/lib/mui-optimization";
import { clearCache } from "@/app/utils/fetchCakes";

export function DevTools() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClearCache = () => {
    clearCache();
    setMessage("Cache cleared! Content will refresh on next request.");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleForceRefresh = () => {
    clearCache();
    window.location.reload();
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      {/* Toggle Icon */}
      <Tooltip title="Developer Tools" placement="left">
        <IconButton
          onClick={toggleVisibility}
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
          aria-label="Toggle developer tools"
        >
          {isVisible ? <CloseIcon /> : <SettingsIcon />}
        </IconButton>
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
            minWidth: 200,
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
            <IconButton
              size="small"
              onClick={toggleVisibility}
              sx={{ p: 0.5 }}
              aria-label="Close developer tools"
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {message && (
            <Alert severity="success" sx={{ mb: 1, fontSize: "0.75rem" }}>
              {message}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleClearCache}
              startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
              sx={{ fontSize: "0.75rem", justifyContent: "flex-start" }}
            >
              Clear Cache
            </Button>

            <Button
              size="small"
              variant="contained"
              onClick={handleForceRefresh}
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              sx={{ fontSize: "0.75rem", justifyContent: "flex-start" }}
            >
              Force Refresh
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}
