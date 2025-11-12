"use client";

import { useState, useEffect } from "react";
import { Box, Alert, AlertTitle, IconButton, Typography, Button } from "@/lib/mui-optimization";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import InfoIcon from "@mui/icons-material/Info";
import { colors, spacing, borderRadius } from "@/lib/design-system";
import { BUSINESS_CONSTANTS, PHONE_UTILS } from "@/lib/constants";
import Link from "next/link";

const STORAGE_KEY = "olgish-technical-notification-dismissed";

export function TechnicalIssueNotification() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const isDismissed = sessionStorage.getItem(STORAGE_KEY);
    if (isDismissed === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    // Save dismissal to sessionStorage (persists for current session only)
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: "#FFF9E6",
        borderBottom: `2px solid ${colors.warning.main}`,
        py: { xs: spacing.sm, md: spacing.lg },
        position: "relative",
      }}
      role="alert"
      aria-live="polite"
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: spacing.sm, md: spacing.xl },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: { xs: spacing.sm, md: spacing.md },
          }}
        >
          {/* Info Icon */}
          <InfoIcon
            sx={{
              color: colors.warning.main,
              fontSize: { xs: "1.25rem", md: "2rem" },
              flexShrink: 0,
              mt: { xs: 0.25, md: 0.5 },
            }}
          />

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#7A5C00",
                mb: { xs: "4px", md: spacing.sm },
                fontSize: { xs: "0.875rem", md: "1.125rem" },
                lineHeight: { xs: 1.3, md: 1.4 },
              }}
            >
              Important Notice: Order Confirmation System Update
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#5C4700",
                mb: { xs: "6px", md: spacing.md },
                lineHeight: { xs: 1.4, md: 1.6 },
                fontSize: { xs: "0.75rem", md: "1rem" },
              }}
            >
              We recently resolved a technical issue with our order confirmation email system that may
              have affected orders placed between{" "}
              <strong>1st November and 12th November, 2025</strong>.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#5C4700",
                mb: { xs: spacing.sm, md: spacing.lg },
                lineHeight: { xs: 1.4, md: 1.6 },
                fontSize: { xs: "0.75rem", md: "1rem" },
              }}
            >
              If you submitted an order during this period and <strong>did not receive a confirmation email</strong>, 
              please contact us to ensure your order is processed.
            </Typography>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: "6px", md: spacing.md },
                alignItems: "center",
              }}
            >
              <Button
                component={Link}
                href="/order"
                variant="contained"
                sx={{
                  backgroundColor: colors.primary.main,
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  px: { xs: spacing.sm, md: spacing.lg },
                  py: { xs: "4px", md: spacing.sm },
                  borderRadius: borderRadius.md,
                  "&:hover": {
                    backgroundColor: colors.primary.dark,
                  },
                  fontSize: { xs: "0.75rem", md: "1rem" },
                  minHeight: { xs: "32px", md: "auto" },
                }}
              >
                Place New Order
              </Button>

              <Button
                component="a"
                href={`mailto:${BUSINESS_CONSTANTS.EMAIL}`}
                variant="outlined"
                startIcon={<EmailIcon sx={{ fontSize: { xs: "0.875rem", md: "1.25rem" } }} />}
                sx={{
                  borderColor: colors.primary.main,
                  color: colors.primary.main,
                  textTransform: "none",
                  fontWeight: 600,
                  px: { xs: spacing.sm, md: spacing.lg },
                  py: { xs: "4px", md: spacing.sm },
                  borderRadius: borderRadius.md,
                  "&:hover": {
                    borderColor: colors.primary.dark,
                    backgroundColor: "rgba(46, 49, 146, 0.04)",
                  },
                  fontSize: { xs: "0.75rem", md: "1rem" },
                  minHeight: { xs: "32px", md: "auto" },
                }}
              >
                Email Us
              </Button>

              <Button
                component="a"
                href={PHONE_UTILS.telLink}
                variant="outlined"
                startIcon={<PhoneIcon sx={{ fontSize: { xs: "0.875rem", md: "1.25rem" } }} />}
                sx={{
                  borderColor: colors.primary.main,
                  color: colors.primary.main,
                  textTransform: "none",
                  fontWeight: 600,
                  px: { xs: spacing.sm, md: spacing.lg },
                  py: { xs: "4px", md: spacing.sm },
                  borderRadius: borderRadius.md,
                  "&:hover": {
                    borderColor: colors.primary.dark,
                    backgroundColor: "rgba(46, 49, 146, 0.04)",
                  },
                  fontSize: { xs: "0.75rem", md: "1rem" },
                  minHeight: { xs: "32px", md: "auto" },
                  display: { xs: "none", sm: "inline-flex" }, // Hide on mobile to save space
                }}
              >
                Call {PHONE_UTILS.displayPhone}
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "#6B5500",
                mt: { xs: "6px", md: spacing.md },
                fontStyle: "italic",
                fontSize: { xs: "0.7rem", md: "0.875rem" },
                lineHeight: { xs: 1.3, md: 1.4 },
              }}
            >
              We apologize for any inconvenience. All systems are now operating normally.
            </Typography>
          </Box>

          {/* Close Button */}
          <IconButton
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            sx={{
              color: "#7A5C00",
              flexShrink: 0,
              "&:hover": {
                backgroundColor: "rgba(122, 92, 0, 0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}


