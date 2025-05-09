"use client";

import { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, Link as MuiLink, Stack, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (consent: "accepted" | "declined") => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem("cookieConsent", consent);
      localStorage.setItem("cookieConsentTimestamp", new Date().toISOString());

      // Handle cookies based on consent
      if (consent === "accepted") {
        // Enable analytics and other cookies
        if (typeof window !== "undefined" && "gtag" in window) {
          window.gtag("consent", "update", {
            analytics_storage: "granted",
            functionality_storage: "granted",
            personalization_storage: "granted",
          });
        }
      } else {
        // Disable analytics and other cookies
        if (typeof window !== "undefined" && "gtag" in window) {
          window.gtag("consent", "update", {
            analytics_storage: "denied",
            functionality_storage: "denied",
            personalization_storage: "denied",
          });
        }
        // Clear existing cookies
        document.cookie.split(";").forEach(cookie => {
          const [name] = cookie.split("=");
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }

      setIsVisible(false);
    } catch (error) {
      console.error("Error handling cookie consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: "8px 8px 0 0",
        p: { xs: 2, md: 3 },
        m: { xs: 2, md: 3 },
        maxWidth: { md: "600px" },
        mx: { md: "auto" },
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={() => handleConsent("declined")}
          disabled={isLoading}
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          Cookie Preferences
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          We use cookies to enhance your browsing experience, serve personalized content, and
          analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
          <MuiLink
            component={Link}
            href="/cookies"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Learn more
          </MuiLink>
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleConsent("accepted")}
            disabled={isLoading}
            sx={{
              flex: { sm: 1 },
              py: 1,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            {isLoading ? "Processing..." : "Accept All"}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleConsent("declined")}
            disabled={isLoading}
            sx={{
              flex: { sm: 1 },
              py: 1,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            {isLoading ? "Processing..." : "Decline"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
