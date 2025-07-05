"use client";

import { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, Link as MuiLink, Stack, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { designTokens } from "@/lib/design-system";
import { PrimaryButton, OutlineButton, BodyText } from "@/lib/ui-components";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

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
        borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
        p: { xs: spacing.md, md: spacing.lg },
        m: { xs: spacing.md, md: spacing.lg },
        maxWidth: { md: "600px" },
        mx: { md: "auto" },
        backgroundColor: colors.background.paper,
        boxShadow: shadows.lg,
        border: `1px solid ${colors.border.light}`,
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
            color: colors.text.secondary,
            "&:hover": {
              backgroundColor: colors.background.subtle,
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            mb: spacing.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.primary.main,
            fontFamily: typography.fontFamily.display,
          }}
        >
          Cookie Preferences
        </Typography>

        <BodyText
          sx={{
            mb: spacing.md,
            color: colors.text.secondary,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          We use cookies to enhance your browsing experience, serve personalized content, and
          analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
          <MuiLink
            component={Link}
            href="/cookies"
            sx={{
              color: colors.primary.main,
              textDecoration: "none",
              fontWeight: typography.fontWeight.medium,
              "&:hover": {
                textDecoration: "underline",
                color: colors.primary.dark,
              },
            }}
          >
            Learn more
          </MuiLink>
        </BodyText>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={spacing.md} sx={{ mt: spacing.md }}>
          <PrimaryButton
            onClick={() => handleConsent("accepted")}
            disabled={isLoading}
            sx={{
              flex: { sm: 1 },
              py: spacing.sm,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            {isLoading ? "Processing..." : "Accept All"}
          </PrimaryButton>
          <OutlineButton
            onClick={() => handleConsent("declined")}
            disabled={isLoading}
            sx={{
              flex: { sm: 1 },
              py: spacing.sm,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            {isLoading ? "Processing..." : "Decline"}
          </OutlineButton>
        </Stack>
      </Box>
    </Paper>
  );
}
