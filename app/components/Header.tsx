"use client";

import { AppBar, Toolbar, Container, Typography, Box, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import Image from "next/image";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Cakes", href: "/cakes" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{ height: 80, display: "flex", justifyContent: "space-between" }}
        >
          <Link
            href="/"
            passHref
            style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Image
                src="/logo.png"
                alt="Olgish Cakes"
                width={50}
                height={50}
                style={{
                  objectFit: "contain",
                  width: "auto",
                  height: "auto",
                }}
                priority
              />
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  color: "primary.main",
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
                  fontWeight: 600,
                }}
              >
                Olgish Cakes
              </Typography>
            </Box>
          </Link>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            {navigation.map(item => (
              <Link key={item.name} href={item.href} passHref style={{ textDecoration: "none" }}>
                <Button
                  sx={{
                    color: "text.primary",
                    fontSize: "1rem",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
