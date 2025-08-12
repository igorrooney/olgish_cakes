"use client";

import { designTokens } from "@/lib/design-system";
import { Box, Typography, Breadcrumbs, Link } from "@/lib/mui-optimization";
import { memo } from "react";

const { colors, typography } = designTokens;

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MobileBreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

export const MobileBreadcrumbs = memo(({ items, onNavigate }: MobileBreadcrumbsProps) => {
  if (items.length <= 1) return null;

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        backgroundColor: colors.background.warm,
        borderBottom: `1px solid ${colors.border.light}`,
      }}
    >
      <Breadcrumbs
        separator={
          <Typography
            sx={{
              color: colors.text.secondary,
              fontSize: typography.fontSize.sm,
            }}
          >
            ›
          </Typography>
        }
        aria-label="breadcrumb navigation"
      >
        {items.map((item, index) => (
          <Box key={index}>
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                onClick={e => {
                  e.preventDefault();
                  onNavigate?.(item.href!);
                }}
                aria-label={`Navigate to ${item.label}`}
                sx={{
                  color: colors.primary.main,
                  textDecoration: "none",
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {item.label}
              </Link>
            ) : (
              <Typography
                sx={{
                  color: colors.text.secondary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.normal,
                }}
              >
                {item.label}
              </Typography>
            )}
          </Box>
        ))}
      </Breadcrumbs>
    </Box>
  );
});
