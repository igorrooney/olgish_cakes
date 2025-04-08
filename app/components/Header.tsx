"use client";

import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Box,
  Button,
  Drawer,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Cakes", href: "/cakes" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const theme = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} passHref style={{ textDecoration: "none" }}>
                  <Button
                    sx={{
                      color: isActive ? "primary.main" : "text.primary",
                      fontSize: "1rem",
                      fontWeight: isActive ? 600 : 400,
                      position: "relative",
                      "&:hover": {
                        color: "primary.main",
                      },
                      "&::after": isActive
                        ? {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "2px",
                            backgroundColor: "primary.main",
                            transform: "scaleX(1)",
                            transition: "transform 0.2s ease-in-out",
                          }
                        : {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "2px",
                            backgroundColor: "primary.main",
                            transform: "scaleX(0)",
                            transition: "transform 0.2s ease-in-out",
                          },
                      "&:hover::after": {
                        transform: "scaleX(1)",
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="primary"
            aria-label="open menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            backgroundColor: "background.paper",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={handleDrawerToggle} color="primary">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: 2, py: 4 }}>
          {navigation.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                passHref
                style={{ textDecoration: "none" }}
                onClick={handleDrawerToggle}
              >
                <Button
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    color: isActive ? "primary.main" : "text.primary",
                    fontSize: "1.1rem",
                    fontWeight: isActive ? 600 : 400,
                    py: 1.5,
                    "&:hover": {
                      color: "primary.main",
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </Box>
      </Drawer>
    </AppBar>
  );
}
