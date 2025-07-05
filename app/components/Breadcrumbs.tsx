import Link from "next/link";
import { usePathname } from "next/navigation";
import { Typography, Box, Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import { designTokens } from "@/lib/design-system";
import { BodyText } from "@/lib/ui-components";

const { colors, typography, spacing } = designTokens;

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

    return {
      href,
      label,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <Box sx={{ py: spacing.md }}>
      <MuiBreadcrumbs
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color: colors.text.secondary,
          },
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <BodyText
            sx={{
              color: colors.text.secondary,
              fontSize: typography.fontSize.sm,
              transition: "color 0.2s ease-in-out",
              "&:hover": {
                color: colors.primary.main,
              },
            }}
          >
            Home
          </BodyText>
        </Link>
        {breadcrumbs.map(breadcrumb => (
          <Box key={breadcrumb.href}>
            {breadcrumb.isLast ? (
              <BodyText
                sx={{
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {breadcrumb.label}
              </BodyText>
            ) : (
              <Link href={breadcrumb.href} style={{ textDecoration: "none" }}>
                <BodyText
                  sx={{
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.sm,
                    transition: "color 0.2s ease-in-out",
                    "&:hover": {
                      color: colors.primary.main,
                    },
                  }}
                >
                  {breadcrumb.label}
                </BodyText>
              </Link>
            )}
          </Box>
        ))}
      </MuiBreadcrumbs>
    </Box>
  );
}
