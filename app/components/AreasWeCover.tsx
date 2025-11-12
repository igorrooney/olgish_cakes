"use client";
import { Box, Grid, Paper, Typography, Chip } from "@mui/material";
import Link from "next/link";

interface AreaLink {
  label: string;
  href: string;
}

interface AreasWeCoverProps {
  title?: string;
  subtitle?: string;
  areas?: AreaLink[];
}

export function AreasWeCover({
  title = "Areas We Cover",
  subtitle = "Cake delivery and wedding/birthday cake service across Leeds and around towns.",
  areas = [
    { label: "Leeds", href: "/cakes-leeds" },
    { label: "York", href: "/cakes-york" },
    { label: "Bradford", href: "/cakes-bradford" },
    { label: "Halifax", href: "/cakes-halifax" },
    { label: "Huddersfield", href: "/cakes-huddersfield" },
    { label: "Wakefield", href: "/cakes-wakefield" },
    { label: "Otley", href: "/cakes-otley" },
    { label: "Pudsey", href: "/cakes-pudsey" },
    { label: "Skipton", href: "/cakes-skipton" },
    { label: "Ilkley", href: "/cakes-ilkley" },
  ],
}: AreasWeCoverProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, md: 6 },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        mb: 6,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontFamily: "var(--font-alice)",
          fontSize: { xs: "1.8rem", md: "2.2rem" },
          fontWeight: 600,
          color: "primary.main",
          mb: 2,
          textAlign: "center",
        }}
      >
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
        {subtitle}
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {areas.map(area => (
          <Grid item key={area.href}>
            <Chip
              component={Link as any}
              href={area.href}
              clickable
              color="primary"
              label={area.label}
              sx={{ fontWeight: 600 }}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

