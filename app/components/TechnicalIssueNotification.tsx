"use client";

import { useState } from "react";
import { Box, Alert, AlertTitle, IconButton, Typography, Button } from "@/lib/mui-optimization";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import InfoIcon from "@mui/icons-material/Info";
import { colors, spacing, borderRadius } from "@/lib/design-system";
import { BUSINESS_CONSTANTS, PHONE_UTILS } from "@/lib/constants";
import Link from "next/link";

export function TechnicalIssueNotification() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: "#FFF9E6",
        borderBottom: `2px solid ${colors.warning.main}`,
        py: spacing.lg,
        position: "relative",
      }}
      role="alert"
      aria-live="polite"
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: spacing.md, md: spacing.xl },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: spacing.md,
          }}
        >
          {/* Info Icon */}
          <InfoIcon
            sx={{
              color: colors.warning.main,
              fontSize: "2rem",
              flexShrink: 0,
              mt: 0.5,
            }}
          />

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#7A5C00",
                mb: spacing.sm,
                fontSize: { xs: "1rem", md: "1.125rem" },
              }}
            >
              Important Notice: Order Confirmation System Update
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#5C4700",
                mb: spacing.md,
                lineHeight: 1.6,
                fontSize: { xs: "0.9rem", md: "1rem" },
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
                mb: spacing.lg,
                lineHeight: 1.6,
                fontSize: { xs: "0.9rem", md: "1rem" },
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
                gap: spacing.md,
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
                  px: spacing.lg,
                  py: spacing.sm,
                  borderRadius: borderRadius.md,
                  "&:hover": {
                    backgroundColor: colors.primary.dark,
                  },
                  fontSize: { xs: "0.875rem", md: "1rem" },
                }}
              >
                Place New Order
              </Button>

              <Button
                component="a"
                href={`mailto:${BUSINESS_CONSTANTS.EMAIL}`}
                variant="outlined"
                startIcon={<EmailIcon />}
                sx={{
                  borderColor: colors.primary.main,
                  color: colors.primary.main,
                  textTransform: "none",
                  fontWeight: 600,
                  px: spacing.lg,
                  py: spacing.sm,
                  borderRadius: borderRadius.md,
                  "&:hover": {
                    borderColor: colors.primary.dark,
                    backgroundColor: "rgba(46, 49, 146, 0.04)",
                  },
                  fontSize: { xs: "0.875rem", md: "1rem" },
                }}
              >
                Email Us
              </Button>

              <Button
                component="a"
                href={PHONE_UTILS.telLink}
                variant="outlined"
                startIcon={<PhoneIcon />}
                sx={{
                  borderColor: colors.primary.main,
                  color: colors.primary.main,
                  textTransform: "none",
                  fontWeight: 600,
                  px: spacing.lg,
                  py: spacing.sm,
                  borderRadius: borderRadius.md,
                  "&:hover": {
                    borderColor: colors.primary.dark,
                    backgroundColor: "rgba(46, 49, 146, 0.04)",
                  },
                  fontSize: { xs: "0.875rem", md: "1rem" },
                }}
              >
                Call {PHONE_UTILS.displayPhone}
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "#6B5500",
                mt: spacing.md,
                fontStyle: "italic",
                fontSize: { xs: "0.8rem", md: "0.875rem" },
              }}
            >
              We apologize for any inconvenience and are committed to ensuring your orders are fulfilled
              perfectly. All systems are now operating normally.
            </Typography>
          </Box>

          {/* Close Button */}
          <IconButton
            onClick={() => setIsVisible(false)}
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


