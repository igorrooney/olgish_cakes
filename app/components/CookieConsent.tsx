"use client";

import { useState, useEffect, memo, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  Stack,
  IconButton,
  CloseIcon,
} from "@/lib/mui-optimization";
import Link from "next/link";
import { designTokens } from "@/lib/design-system";
import {
  PrimaryButton,
  OutlineButton,
  BodyText,
  TouchTargetWrapper,
  AccessibleIconButton,
} from "@/lib/ui-components";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

const CookieConsent = memo(function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = useCallback(async () => {
    setIsLoading(true);
    try {
      localStorage.setItem("cookieConsent", "accepted");
      setIsVisible(false);
    } catch (error) {
      console.error("Error saving cookie consent:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDecline = useCallback(async () => {
    setIsLoading(true);
    try {
      localStorage.setItem("cookieConsent", "declined");
      setIsVisible(false);
    } catch (error) {
      console.error("Error saving cookie consent:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        p: { xs: 2, md: 3 },
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: "600px",
          mx: "auto",
          p: { xs: 3, md: 4 },
          borderRadius: borderRadius.lg,
          backgroundColor: colors.background.paper,
          border: `1px solid ${colors.border.light}`,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <AccessibleIconButton
            onClick={handleClose}
            ariaLabel="Close cookie consent"
            title="Close cookie consent"
            sx={{
              position: "absolute",
              top: -spacing.sm,
              right: -spacing.sm,
              backgroundColor: colors.background.paper,
              border: `1px solid ${colors.border.light}`,
              "&:hover": {
                backgroundColor: colors.background.subtle,
              },
            }}
          >
            <CloseIcon />
          </AccessibleIconButton>

          <Typography
            variant="h6"
            sx={{
              mb: spacing.md,
              color: colors.text.primary,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            🍪 Cookie Policy
          </Typography>

          <BodyText
            sx={{
              mb: spacing.lg,
              color: colors.text.secondary,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            We use cookies to enhance your browsing experience, serve personalized content, and
            analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
            <MuiLink 
              href="/cookies"
              sx={{
                color: colors.primary.main,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Learn more about our cookie policy
            </MuiLink>
          </BodyText>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "flex-end" }}
          >
            <OutlineButton
              onClick={handleDecline}
              disabled={isLoading}
              sx={{
                minWidth: "120px",
                fontWeight: typography.fontWeight.medium,
              }}
            >
              Decline
            </OutlineButton>
            <PrimaryButton
              onClick={handleAccept}
              disabled={isLoading}
              sx={{
                minWidth: "120px",
                fontWeight: typography.fontWeight.medium,
              }}
            >
              Accept All
            </PrimaryButton>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
});

export default CookieConsent;
