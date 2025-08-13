"use client";

import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography } from "@/lib/mui-optimization";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { designTokens } from "@/lib/design-system";
import { useMemo } from "react";

const { colors, typography } = designTokens;

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({ label: "Home", href: "/" });
    }

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Convert segment to readable label
      const label = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Don't make the last item a link
      const isLast = index === pathSegments.length - 1;
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  const jsonLd = useMemo(() => {
    const itemListElement = breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `https://olgishcakes.co.uk${item.href}` : undefined,
    }));
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    };
  }, [breadcrumbItems]);

  // Hide breadcrumbs on home page
  if (pathname === "/") return null;

  return (
    <MuiBreadcrumbs
      aria-label="breadcrumb"
      sx={{
        mb: 3,
        "& .MuiBreadcrumbs-ol": {
          flexWrap: "wrap",
        },
        "& .MuiBreadcrumbs-li": {
          fontSize: typography.fontSize.sm,
        },
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        if (isLast || !item.href) {
          return (
            <Typography
              key={item.label}
              color={isLast ? colors.text.primary : colors.text.secondary}
              sx={{
                fontWeight: isLast ? typography.fontWeight.semibold : typography.fontWeight.normal,
              }}
            >
              {item.label}
            </Typography>
          );
        }

        return (
          <MuiLink
            key={item.label}
            component={Link}
            href={item.href}
            color="inherit"
            underline="hover"
            sx={{
              color: colors.text.secondary,
              "&:hover": {
                color: colors.primary.main,
              },
            }}
          >
            {item.label}
          </MuiLink>
        );
      })}
    </MuiBreadcrumbs>
  );
}
