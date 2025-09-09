"use client";

import Link from "next/link";
import { designTokens } from "@/lib/design-system";
import { Box, Typography, Tooltip } from "@/lib/mui-optimization";
import { Container as DesignContainer, AccessibleIconButton } from "@/lib/ui-components";
import {
  PhoneIcon,
  EmailIcon,
  StarIcon,
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
} from "@/lib/mui-optimization";

const { colors, typography, spacing } = designTokens;

export function UtilityBar() {
  return (
    <Box
      component="div"
      role="navigation"
      aria-label="Utility navigation"
      sx={{
        backgroundColor: colors.background.paper,
        borderBottom: `1px solid ${colors.border.light}`,
        py: 0.5,
      }}
    >
      <DesignContainer
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.md,
          px: { xs: 1, md: 2 },
        }}
      >
        {/* Left: Contact shortcuts */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
          <AccessibleIconButton
            component="a"
            href="tel:+447867218194"
            ariaLabel="Call Olgish Cakes"
            title="Call Olgish Cakes"
            sx={{ color: colors.primary.main, display: { xs: "inline-flex", md: "none" } }}
          >
            <PhoneIcon fontSize="small" />
          </AccessibleIconButton>
          <Typography
            variant="body2"
            sx={{
              display: { xs: "none", md: "inline-flex" },
              alignItems: "center",
              gap: 1,
              color: colors.text.secondary,
              fontSize: typography.fontSize.sm,
            }}
          >
            <PhoneIcon sx={{ fontSize: 16, color: colors.primary.main }} />
            <Link href="tel:+447867218194" aria-label="Call +44 786 721 8194">
              +44 786 721 8194
            </Link>
          </Typography>

          <Typography
            variant="body2"
            sx={{
              display: { xs: "none", md: "inline-flex" },
              alignItems: "center",
              gap: 1,
              color: colors.text.secondary,
              fontSize: typography.fontSize.sm,
            }}
          >
            <EmailIcon sx={{ fontSize: 16, color: colors.primary.main }} />
            <Link href="mailto:hello@olgishcakes.co.uk" aria-label="Email hello@olgishcakes.co.uk">
              hello@olgishcakes.co.uk
            </Link>
          </Typography>
        </Box>

        {/* Center: Hours and rating */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: spacing.md,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}
          >
            Order online 24/7
          </Typography>
          <Box sx={{ display: { xs: "none", md: "inline-flex" }, alignItems: "center", gap: 0.5 }}>
            <StarIcon sx={{ fontSize: 16, color: colors.secondary.main }} />
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}
            >
              5★ (127+)
            </Typography>
          </Box>
        </Box>

        {/* Right: Socials */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
          <Tooltip title="Instagram">
            <Box component="span" sx={{ display: "inline-flex" }}>
              <AccessibleIconButton
                component="a"
                href="https://www.instagram.com/olgish_cakes/"
                target="_blank"
                rel="noopener noreferrer"
                ariaLabel="Open Instagram"
                sx={{ color: colors.text.secondary, "&:hover": { color: "#E1306C" } }}
              >
                <InstagramIcon fontSize="small" />
              </AccessibleIconButton>
            </Box>
          </Tooltip>
          <Tooltip title="Facebook">
            <Box component="span" sx={{ display: "inline-flex" }}>
              <AccessibleIconButton
                component="a"
                href="https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB"
                target="_blank"
                rel="noopener noreferrer"
                ariaLabel="Open Facebook"
                sx={{ color: colors.text.secondary, "&:hover": { color: "#1877F2" } }}
              >
                <FacebookIcon fontSize="small" />
              </AccessibleIconButton>
            </Box>
          </Tooltip>
          <Tooltip title="WhatsApp">
            <Box component="span" sx={{ display: "inline-flex" }}>
              <AccessibleIconButton
                component="a"
                href={`https://wa.me/447867218194`}
                target="_blank"
                rel="noopener noreferrer"
                ariaLabel="Chat on WhatsApp"
                sx={{ color: colors.text.secondary, "&:hover": { color: "#25D366" } }}
              >
                <WhatsAppIcon fontSize="small" />
              </AccessibleIconButton>
            </Box>
          </Tooltip>
        </Box>
      </DesignContainer>
    </Box>
  );
}

export default UtilityBar;
