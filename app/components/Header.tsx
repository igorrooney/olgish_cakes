"use client";

import { designTokens } from "@/lib/design-system";
import { Container as DesignContainer } from "@/lib/ui-components";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
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
  Menu,
  MenuItem,
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
  {
    name: "Cakes",
    href: "/cakes",
    megaMenu: {
      featured: [
        { name: "All Cakes", href: "/cakes", description: "Browse our complete collection" },
        {
          name: "Wedding Cakes",
          href: "/wedding-cakes",
          description: "Perfect for your special day",
        },
        { name: "Birthday Cakes", href: "/birthday-cakes", description: "Celebrate in style" },
        {
          name: "Traditional Ukrainian",
          href: "/traditional-ukrainian-cakes",
          description: "Authentic Ukrainian flavors",
        },
      ],
      categories: [
        {
          title: "By Location",
          items: [
            { name: "Cakes Leeds", href: "/cakes-leeds" },
            { name: "Cakes York", href: "/cakes-york" },
            { name: "Cakes Bradford", href: "/cakes-bradford" },
            { name: "View All Locations", href: "/delivery-areas" },
          ],
        },
        {
          title: "By Occasion",
          items: [
            { name: "Easter Cakes", href: "/easter-cakes-leeds" },
            { name: "Christmas Cakes", href: "/christmas-cakes-leeds" },
            { name: "Graduation Cakes", href: "/graduation-cakes-leeds" },
            { name: "Anniversary Cakes", href: "/anniversary-cakes-leeds" },
          ],
        },
        {
          title: "Dietary Options",
          items: [
            { name: "Vegan Cakes", href: "/vegan-cakes-leeds" },
            { name: "Gluten-Friendly Cakes", href: "/gluten-friendly-ukrainian-cakes" },
            { name: "Dairy-Free Cakes", href: "/dairy-free-cakes-leeds" },
            { name: "Nut-Free Cakes", href: "/nut-free-cakes-leeds" },
          ],
        },
      ],
    },
  },
  {
    name: "Services",
    href: "/custom-cake-design",
    dropdown: [
      { name: "Custom Cake Design", href: "/custom-cake-design" },
      { name: "Cake Delivery", href: "/cake-delivery" },
      { name: "Baking Classes", href: "/ukrainian-baking-classes" },
      { name: "Corporate Cakes", href: "/corporate-cakes-leeds" },
      { name: "Cake Tasting Sessions", href: "/cake-tasting-sessions" },
    ],
  },
  {
    name: "Learn",
    href: "/ukrainian-cake-recipes",
    dropdown: [
      { name: "Ukrainian Cake Recipes", href: "/ukrainian-cake-recipes" },
      { name: "Best Cakes for Weddings", href: "/best-cakes-for-weddings" },
      { name: "Cake Flavors", href: "/cake-flavors" },
      { name: "Cake Care Guide", href: "/cake-care-storage" },
      { name: "Ukrainian Traditions", href: "/ukrainian-culture-baking" },
    ],
  },
  { name: "Gallery", href: "/cake-gallery" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const theme = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cakesMenuAnchor, setCakesMenuAnchor] = useState<null | HTMLElement>(null);
  const [servicesMenuAnchor, setServicesMenuAnchor] = useState<null | HTMLElement>(null);
  const [learnMenuAnchor, setLearnMenuAnchor] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCakesMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCakesMenuAnchor(event.currentTarget);
  };

  const handleCakesMenuClose = () => {
    setCakesMenuAnchor(null);
  };

  const handleServicesMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setServicesMenuAnchor(event.currentTarget);
  };

  const handleServicesMenuClose = () => {
    setServicesMenuAnchor(null);
  };

  const handleLearnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLearnMenuAnchor(event.currentTarget);
  };

  const handleLearnMenuClose = () => {
    setLearnMenuAnchor(null);
  };

  const isCakesMenuOpen = Boolean(cakesMenuAnchor);
  const isServicesMenuOpen = Boolean(servicesMenuAnchor);
  const isLearnMenuOpen = Boolean(learnMenuAnchor);

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
            height: 70,
            minHeight: 70,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            px: { xs: 1, md: 2 },
            gap: 1,
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
                    fontSize: { xs: typography.fontSize.xl, md: typography.fontSize["2xl"] },
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: 0.3,
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
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
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
              alignItems: "center",
              flexWrap: "nowrap",
            }}
          >
            {navigation.map(item => {
              const isActive = pathname === item.href;

              if (item.megaMenu) {
                return (
                  <Box key={item.name}>
                    <Button
                      onClick={handleCakesMenuOpen}
                      sx={{
                        color: isActive ? colors.primary.main : colors.text.primary,
                        fontSize: typography.fontSize.base,
                        fontWeight: isActive
                          ? typography.fontWeight.bold
                          : typography.fontWeight.medium,
                        position: "relative",
                        background: "none",
                        boxShadow: "none",
                        px: 2,
                        py: 1.25,
                        borderRadius: 2,
                        transition: "all 0.2s ease-in-out",
                        textTransform: "none",
                        letterSpacing: 0.1,
                        whiteSpace: "nowrap",
                        minWidth: "auto",
                        "&:hover": {
                          color: colors.primary.main,
                          backgroundColor: colors.background.subtle,
                          transform: "translateY(-1px)",
                        },
                        "&::after": isActive
                          ? {
                              content: '""',
                              position: "absolute",
                              left: 8,
                              right: 8,
                              bottom: 2,
                              height: "2px",
                              backgroundColor: colors.primary.main,
                              borderRadius: 1,
                              boxShadow: `0 1px 4px 0 ${colors.primary.main}22`,
                              transform: "scaleX(1)",
                              transition: "transform 0.2s ease-in-out",
                            }
                          : {
                              content: '""',
                              position: "absolute",
                              left: 8,
                              right: 8,
                              bottom: 2,
                              height: "2px",
                              backgroundColor: colors.primary.main,
                              borderRadius: 1,
                              transform: "scaleX(0)",
                              transition: "transform 0.2s ease-in-out",
                            },
                        "&:hover::after": {
                          transform: "scaleX(1)",
                        },
                      }}
                      endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                    >
                      {item.name}
                    </Button>
                    <Menu
                      anchorEl={cakesMenuAnchor}
                      open={isCakesMenuOpen}
                      onClose={handleCakesMenuClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      PaperProps={{
                        sx: {
                          mt: 1,
                          minWidth: 600,
                          maxWidth: 800,
                          boxShadow: shadows.lg,
                          border: `1px solid ${colors.border.light}`,
                          borderRadius: 2,
                          p: 2,
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 3 }}>
                        {/* Featured Section */}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: colors.primary.main,
                              fontWeight: typography.fontWeight.bold,
                              mb: 2,
                              pb: 1,
                              borderBottom: `2px solid ${colors.primary.main}`,
                            }}
                          >
                            Featured
                          </Typography>
                          {item.megaMenu.featured.map(featuredItem => (
                            <Box
                              key={featuredItem.name}
                              component={Link}
                              href={featuredItem.href}
                              onClick={handleCakesMenuClose}
                              sx={{
                                display: "block",
                                p: 1.5,
                                borderRadius: 1,
                                textDecoration: "none",
                                color:
                                  pathname === featuredItem.href
                                    ? colors.primary.main
                                    : colors.text.primary,
                                fontWeight:
                                  pathname === featuredItem.href
                                    ? typography.fontWeight.semibold
                                    : typography.fontWeight.normal,
                                "&:hover": {
                                  backgroundColor: colors.background.subtle,
                                  color: colors.primary.main,
                                },
                              }}
                            >
                              <Typography variant="subtitle1" sx={{ fontWeight: "inherit" }}>
                                {featuredItem.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.text.secondary, mt: 0.5 }}
                              >
                                {featuredItem.description}
                              </Typography>
                            </Box>
                          ))}
                        </Box>

                        {/* Categories Section */}
                        <Box sx={{ flex: 1 }}>
                          {item.megaMenu.categories.map(category => (
                            <Box key={category.title} sx={{ mb: 3 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  color: colors.text.secondary,
                                  fontWeight: typography.fontWeight.semibold,
                                  mb: 1.5,
                                  textTransform: "uppercase",
                                  fontSize: typography.fontSize.sm,
                                  letterSpacing: 0.5,
                                }}
                              >
                                {category.title}
                              </Typography>
                              {category.items.map(categoryItem => (
                                <Box
                                  key={categoryItem.name}
                                  component={Link}
                                  href={categoryItem.href}
                                  onClick={handleCakesMenuClose}
                                  sx={{
                                    display: "block",
                                    p: 1,
                                    borderRadius: 1,
                                    textDecoration: "none",
                                    color:
                                      pathname === categoryItem.href
                                        ? colors.primary.main
                                        : colors.text.primary,
                                    fontWeight:
                                      pathname === categoryItem.href
                                        ? typography.fontWeight.semibold
                                        : typography.fontWeight.normal,
                                    "&:hover": {
                                      backgroundColor: colors.background.subtle,
                                      color: colors.primary.main,
                                    },
                                  }}
                                >
                                  {categoryItem.name}
                                </Box>
                              ))}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Menu>
                  </Box>
                );
              }

              if (item.dropdown) {
                const isServicesMenu = item.name === "Services";
                const isLearnMenu = item.name === "Learn";
                const menuAnchor = isServicesMenu ? servicesMenuAnchor : learnMenuAnchor;
                const isMenuOpen = isServicesMenu ? isServicesMenuOpen : isLearnMenuOpen;
                const handleMenuOpen = isServicesMenu
                  ? handleServicesMenuOpen
                  : handleLearnMenuOpen;
                const handleMenuClose = isServicesMenu
                  ? handleServicesMenuClose
                  : handleLearnMenuClose;

                return (
                  <Box key={item.name}>
                    <Button
                      onClick={handleMenuOpen}
                      sx={{
                        color: isActive ? colors.primary.main : colors.text.primary,
                        fontSize: typography.fontSize.base,
                        fontWeight: isActive
                          ? typography.fontWeight.bold
                          : typography.fontWeight.medium,
                        position: "relative",
                        background: "none",
                        boxShadow: "none",
                        px: 2,
                        py: 1.25,
                        borderRadius: 2,
                        transition: "all 0.2s ease-in-out",
                        textTransform: "none",
                        letterSpacing: 0.1,
                        whiteSpace: "nowrap",
                        minWidth: "auto",
                        "&:hover": {
                          color: colors.primary.main,
                          backgroundColor: colors.background.subtle,
                          transform: "translateY(-1px)",
                        },
                        "&::after": isActive
                          ? {
                              content: '""',
                              position: "absolute",
                              left: 8,
                              right: 8,
                              bottom: 2,
                              height: "2px",
                              backgroundColor: colors.primary.main,
                              borderRadius: 1,
                              boxShadow: `0 1px 4px 0 ${colors.primary.main}22`,
                              transform: "scaleX(1)",
                              transition: "transform 0.2s ease-in-out",
                            }
                          : {
                              content: '""',
                              position: "absolute",
                              left: 8,
                              right: 8,
                              bottom: 2,
                              height: "2px",
                              backgroundColor: colors.primary.main,
                              borderRadius: 1,
                              transform: "scaleX(0)",
                              transition: "transform 0.2s ease-in-out",
                            },
                        "&:hover::after": {
                          transform: "scaleX(1)",
                        },
                      }}
                      endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                    >
                      {item.name}
                    </Button>
                    <Menu
                      anchorEl={menuAnchor}
                      open={isMenuOpen}
                      onClose={handleMenuClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      PaperProps={{
                        sx: {
                          mt: 1,
                          minWidth: 220,
                          boxShadow: shadows.lg,
                          border: `1px solid ${colors.border.light}`,
                          borderRadius: 2,
                        },
                      }}
                    >
                      {item.dropdown.map(dropdownItem => (
                        <MenuItem
                          key={dropdownItem.name}
                          component={Link}
                          href={dropdownItem.href}
                          onClick={handleMenuClose}
                          sx={{
                            color:
                              pathname === dropdownItem.href
                                ? colors.primary.main
                                : colors.text.primary,
                            fontWeight:
                              pathname === dropdownItem.href
                                ? typography.fontWeight.semibold
                                : typography.fontWeight.normal,
                            "&:hover": {
                              backgroundColor: colors.background.subtle,
                              color: colors.primary.main,
                            },
                          }}
                        >
                          {dropdownItem.name}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                );
              }

              return (
                <Link key={item.name} href={item.href} passHref style={{ textDecoration: "none" }}>
                  <Button
                    sx={{
                      color: isActive ? colors.primary.main : colors.text.primary,
                      fontSize: typography.fontSize.base,
                      fontWeight: isActive
                        ? typography.fontWeight.bold
                        : typography.fontWeight.medium,
                      position: "relative",
                      background: "none",
                      boxShadow: "none",
                      px: 2,
                      py: 1.25,
                      borderRadius: 2,
                      transition: "all 0.2s ease-in-out",
                      textTransform: "none",
                      letterSpacing: 0.1,
                      whiteSpace: "nowrap",
                      minWidth: "auto",
                      "&:hover": {
                        color: colors.primary.main,
                        backgroundColor: colors.background.subtle,
                        transform: "translateY(-1px)",
                      },
                      "&::after": isActive
                        ? {
                            content: '""',
                            position: "absolute",
                            left: 8,
                            right: 8,
                            bottom: 2,
                            height: "2px",
                            backgroundColor: colors.primary.main,
                            borderRadius: 1,
                            boxShadow: `0 1px 4px 0 ${colors.primary.main}22`,
                            transform: "scaleX(1)",
                            transition: "transform 0.2s ease-in-out",
                          }
                        : {
                            content: '""',
                            position: "absolute",
                            left: 8,
                            right: 8,
                            bottom: 2,
                            height: "2px",
                            backgroundColor: colors.primary.main,
                            borderRadius: 1,
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
                  ml: 2,
                  px: 2.5,
                  py: 1.25,
                  borderRadius: 2,
                  backgroundColor: colors.primary.main,
                  color: colors.primary.contrast,
                  fontWeight: typography.fontWeight.bold,
                  fontSize: typography.fontSize.base,
                  boxShadow: shadows.md,
                  textTransform: "none",
                  letterSpacing: 0.1,
                  whiteSpace: "nowrap",
                  minWidth: "auto",
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
                px: 2,
                py: 1.25,
                borderRadius: 2,
                backgroundColor: colors.primary.main,
                color: colors.primary.contrast,
                fontWeight: typography.fontWeight.bold,
                fontSize: typography.fontSize.base,
                boxShadow: shadows.md,
                textTransform: "none",
                letterSpacing: 0.1,
                whiteSpace: "nowrap",
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
            {navigation.map(item => {
              if (item.megaMenu) {
                return (
                  <Box key={item.name}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={handleCakesMenuOpen}
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
                        <KeyboardArrowDownIcon />
                      </ListItemButton>
                    </ListItem>
                    {/* Featured items */}
                    {item.megaMenu.featured.map(featuredItem => (
                      <ListItem key={featuredItem.name} disablePadding sx={{ pl: 2 }}>
                        <ListItemButton
                          component={Link}
                          href={featuredItem.href}
                          sx={{
                            textAlign: "center",
                            color:
                              pathname === featuredItem.href
                                ? colors.primary.main
                                : colors.text.primary,
                            fontWeight:
                              pathname === featuredItem.href
                                ? typography.fontWeight.semibold
                                : typography.fontWeight.normal,
                            "&:hover": {
                              backgroundColor: colors.background.subtle,
                              color: colors.primary.main,
                            },
                          }}
                        >
                          <ListItemText
                            primary={featuredItem.name}
                            secondary={featuredItem.description}
                            sx={{
                              "& .MuiListItemText-primary": {
                                fontSize: typography.fontSize.sm,
                              },
                              "& .MuiListItemText-secondary": {
                                fontSize: typography.fontSize.xs,
                                color: colors.text.secondary,
                              },
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    {/* Category items */}
                    {item.megaMenu.categories.map(category => (
                      <Box key={category.title}>
                        <ListItem disablePadding sx={{ pl: 2 }}>
                          <ListItemText
                            primary={category.title}
                            sx={{
                              "& .MuiListItemText-primary": {
                                fontSize: typography.fontSize.xs,
                                color: colors.text.secondary,
                                fontWeight: typography.fontWeight.semibold,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                pt: 1,
                              },
                            }}
                          />
                        </ListItem>
                        {category.items.map(categoryItem => (
                          <ListItem key={categoryItem.name} disablePadding sx={{ pl: 4 }}>
                            <ListItemButton
                              component={Link}
                              href={categoryItem.href}
                              sx={{
                                textAlign: "center",
                                color:
                                  pathname === categoryItem.href
                                    ? colors.primary.main
                                    : colors.text.primary,
                                fontWeight:
                                  pathname === categoryItem.href
                                    ? typography.fontWeight.semibold
                                    : typography.fontWeight.normal,
                                "&:hover": {
                                  backgroundColor: colors.background.subtle,
                                  color: colors.primary.main,
                                },
                              }}
                            >
                              <ListItemText
                                primary={categoryItem.name}
                                sx={{
                                  "& .MuiListItemText-primary": {
                                    fontSize: typography.fontSize.sm,
                                  },
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </Box>
                    ))}
                  </Box>
                );
              }

              if (item.dropdown) {
                const isServicesMenu = item.name === "Services";
                const isLearnMenu = item.name === "Learn";
                const handleMenuOpen = isServicesMenu
                  ? handleServicesMenuOpen
                  : handleLearnMenuOpen;

                return (
                  <Box key={item.name}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={handleMenuOpen}
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
                        <KeyboardArrowDownIcon />
                      </ListItemButton>
                    </ListItem>
                    {item.dropdown.map(dropdownItem => (
                      <ListItem key={dropdownItem.name} disablePadding sx={{ pl: 2 }}>
                        <ListItemButton
                          component={Link}
                          href={dropdownItem.href}
                          sx={{
                            textAlign: "center",
                            color:
                              pathname === dropdownItem.href
                                ? colors.primary.main
                                : colors.text.primary,
                            fontWeight:
                              pathname === dropdownItem.href
                                ? typography.fontWeight.semibold
                                : typography.fontWeight.normal,
                            "&:hover": {
                              backgroundColor: colors.background.subtle,
                              color: colors.primary.main,
                            },
                          }}
                        >
                          <ListItemText
                            primary={dropdownItem.name}
                            sx={{
                              "& .MuiListItemText-primary": {
                                fontSize: typography.fontSize.sm,
                              },
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </Box>
                );
              }

              return (
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
              );
            })}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
