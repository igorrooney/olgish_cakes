"use client";

import { designTokens } from "@/lib/design-system";
import { Container as DesignContainer } from "@/lib/ui-components";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const { colors, typography, spacing, shadows } = designTokens;

const navigation = [
  { name: "Home", href: "/" },
  { name: "Cakes", href: "/cakes" },
  { name: "Testimonials", href: "/testimonials" },
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
        backgroundColor: colors.background.paper,
        borderBottom: `1px solid ${colors.border.light}`,
        boxShadow: shadows.sm,
      }}
    >
      <DesignContainer>
        <Toolbar
          disableGutters
          sx={{
            height: 80,
            minHeight: 80,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            px: { xs: 1, md: 3 },
          }}
        >
          {/* Logo on the far left */}
          <Box sx={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
            <Link
              href="/"
              passHref
              style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.md,
                  pl: { xs: 0, md: 2 },
                }}
              >
                <Typography
                  variant="h5"
                  component="span"
                  sx={{
                    fontFamily: typography.fontFamily.display,
                    color: colors.primary.main,
                    fontSize: { xs: typography.fontSize["2xl"], md: typography.fontSize["3xl"] },
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: 0.5,
                    lineHeight: 1.1,
                  }}
                >
                  Olgish Cakes
                </Typography>
              </Box>
            </Link>
          </Box>

          {/* Spacer to push nav to the right */}
          <Box sx={{ flex: 1, minWidth: { xs: 16, md: 48 } }} />

          {/* Navigation and Order Now button on the right */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: spacing.xl, alignItems: "center" }}>
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} passHref style={{ textDecoration: "none" }}>
                  <Button
                    sx={{
                      color: isActive ? colors.primary.main : colors.text.primary,
                      fontSize: typography.fontSize.lg,
                      fontWeight: isActive
                        ? typography.fontWeight.bold
                        : typography.fontWeight.medium,
                      position: "relative",
                      background: "none",
                      boxShadow: "none",
                      px: 2.5,
                      py: 1.5,
                      borderRadius: 2,
                      transition: "all 0.2s ease-in-out",
                      textTransform: "none",
                      letterSpacing: 0.2,
                      "&:hover": {
                        color: colors.primary.main,
                        backgroundColor: colors.background.subtle,
                        transform: "translateY(-1px)",
                      },
                      "&::after": isActive
                        ? {
                            content: '""',
                            position: "absolute",
                            left: 12,
                            right: 12,
                            bottom: 4,
                            height: "3px",
                            backgroundColor: colors.primary.main,
                            borderRadius: 2,
                            boxShadow: `0 2px 8px 0 ${colors.primary.main}22`,
                            transform: "scaleX(1)",
                            transition: "transform 0.2s ease-in-out",
                          }
                        : {
                            content: '""',
                            position: "absolute",
                            left: 12,
                            right: 12,
                            bottom: 4,
                            height: "3px",
                            backgroundColor: colors.primary.main,
                            borderRadius: 2,
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
            {/* Order Now Button (desktop) */}
            <Link href="/contact" passHref style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                sx={{
                  ml: 4,
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  backgroundColor: colors.primary.main,
                  color: colors.primary.contrast,
                  fontWeight: typography.fontWeight.bold,
                  fontSize: typography.fontSize.lg,
                  boxShadow: shadows.md,
                  textTransform: "none",
                  letterSpacing: 0.2,
                  transition: "all 0.2s cubic-bezier(.4,2,.6,1)",
                  "&:hover": {
                    backgroundColor: colors.primary.dark,
                    boxShadow: shadows.lg,
                  },
                }}
              >
                Order Now
              </Button>
            </Link>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="primary"
            aria-label="open menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { md: "none" },
              color: colors.primary.main,
              "&:hover": {
                backgroundColor: colors.background.subtle,
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </DesignContainer>

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
            backgroundColor: colors.background.paper,
            boxShadow: shadows.lg,
          },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: spacing.md,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                my: 0,
                fontFamily: typography.fontFamily.display,
                color: colors.primary.main,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              Olgish Cakes
            </Typography>
            <IconButton onClick={handleDrawerToggle} color="inherit" aria-label="close menu">
              <CloseIcon />
            </IconButton>
          </Box>
          {/* Order Now Button (mobile) */}
          <Link href="/contact" passHref style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                mb: 2,
                px: 0,
                py: 1.5,
                borderRadius: 3,
                backgroundColor: colors.primary.main,
                color: colors.primary.contrast,
                fontWeight: typography.fontWeight.bold,
                fontSize: typography.fontSize.lg,
                boxShadow: shadows.md,
                textTransform: "none",
                letterSpacing: 0.2,
                transition: "all 0.2s cubic-bezier(.4,2,.6,1)",
                "&:hover": {
                  backgroundColor: colors.primary.dark,
                  boxShadow: shadows.lg,
                },
              }}
            >
              Order Now
            </Button>
          </Link>
          <Divider sx={{ borderColor: colors.border.light }} />
          <List>
            {navigation.map(item => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    textAlign: "center",
                    color: pathname === item.href ? colors.primary.main : colors.text.primary,
                    fontWeight:
                      pathname === item.href
                        ? typography.fontWeight.semibold
                        : typography.fontWeight.normal,
                    "&:hover": {
                      backgroundColor: colors.background.subtle,
                      color: colors.primary.main,
                    },
                  }}
                >
                  <ListItemText
                    primary={item.name}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontSize: typography.fontSize.base,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
