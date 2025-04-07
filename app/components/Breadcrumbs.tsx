import Link from "next/link";
import { usePathname } from "next/navigation";
import { Typography, Box, Breadcrumbs as MuiBreadcrumbs } from "@mui/material";

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
    <Box sx={{ py: 2 }}>
      <MuiBreadcrumbs aria-label="breadcrumb">
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          Home
        </Link>
        {breadcrumbs.map(breadcrumb => (
          <Box key={breadcrumb.href}>
            {breadcrumb.isLast ? (
              <Typography color="text.primary">{breadcrumb.label}</Typography>
            ) : (
              <Link href={breadcrumb.href} style={{ textDecoration: "none", color: "inherit" }}>
                {breadcrumb.label}
              </Link>
            )}
          </Box>
        ))}
      </MuiBreadcrumbs>
    </Box>
  );
}
