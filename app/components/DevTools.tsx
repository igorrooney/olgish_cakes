"use client";

import { useState } from "react";
import {
  Box,
  Tooltip,
  SettingsIcon,
  CloseIcon,
} from "@/lib/daisy-ui";
import { AccessibleIconButton } from "@/lib/ui-components";

export function DevTools() {
  const [isVisible, setIsVisible] = useState(false);

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
