"use client";

import { designTokens } from "@/lib/design-system";
import {
  Container as DesignContainer,
  AccessibleIconButton,
} from "@/lib/ui-components";
import { CloseIcon, KeyboardArrowDownIcon, MenuIcon } from "@/lib/mui-optimization";
import { Box, Button, IconButton, Typography } from "@/lib/mui-optimization";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Skeleton,
} from "@/lib/mui-optimization";
// Import useTheme directly for better HMR support with Turbopack
import useTheme from "@mui/material/styles/useTheme";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLIENT_BUSINESS_INFO } from "@/lib/business-info";
import { useState, useMemo, useCallback, memo } from "react";
import { useAnalytics } from "@/app/hooks/useAnalytics";
import { useMobileGestures } from "@/app/hooks/useMobileGestures";
import { MobileBreadcrumbs } from "./MobileBreadcrumbs";
import { NavigationStructuredData } from "./NavigationStructuredData";
import { usePerformanceMonitor } from "./PerformanceMonitor";
import { MobileNavbar } from "./MobileNavbar";

const { colors, typography, spacing, shadows, borderRadius } = designTokens;

// Feature flag: control visibility of Gift Hampers in navigation (default enabled)
const isGiftHampersEnabled = process.env.NEXT_PUBLIC_FEATURE_GIFT_HAMPERS_ENABLED !== "false";

// Memoized navigation data
const navigationBase = [
  { name: "Home", href: "/" },
  {
    name: "Cakes",
    href: "/cakes",
    megaMenu: {
      featured: [
        { name: "All Cakes", href: "/cakes", description: "Browse my complete collection" },
        {
          name: "Wedding Cakes",
          href: "/wedding-cakes",
          description: "Perfect for your special day",
        },
        { name: "Birthday Cakes", href: "/birthday-cakes", description: "Celebrate in style" },
        {
          name: "Traditional Ukrainian",
          href: "/traditional-ukrainian-cakes",
          description: "Real Ukrainian flavors",
        },
        { name: "Honey Cake Near Me", href: "/honey-cake-near-me", description: "Find authentic Medovik near you" },
      ],
      categories: [
        {
          title: "By Location",
          items: [
            { name: "Cakes Leeds", href: "/cakes-leeds" },
            { name: "Cakes York", href: "/cakes-york" },
            { name: "Cakes Bradford", href: "/cakes-bradford" },
            { name: "Cakes Huddersfield", href: "/cakes-huddersfield" },
            { name: "Cakes Wakefield", href: "/cakes-wakefield" },
            { name: "Wakefield Wedding Cakes", href: "/wakefield-wedding-cakes" },
            { name: "Cakes Pudsey", href: "/cakes-pudsey" },
            { name: "View All Locations", href: "/delivery-areas" },
          ],
        },
        {
          title: "By Occasion",
          items: [
            { name: "Wedding Cakes", href: "/wedding-cakes" },
            { name: "Birthday Cakes", href: "/birthday-cakes" },
            { name: "Easter Cakes", href: "/easter-cakes-leeds" },
            { name: "Christmas Cakes", href: "/christmas-cakes-leeds" },
            { name: "Valentine's Cakes", href: "/valentines-cakes-leeds" },
            { name: "Halloween Cakes", href: "/halloween-cakes-leeds" },
            { name: "Graduation Cakes", href: "/graduation-cakes-leeds" },
            { name: "Anniversary Cakes", href: "/anniversary-cakes-leeds" },
            { name: "Mother's Day Cakes", href: "/mother-day-cakes-leeds" },
            { name: "Father's Day Cakes", href: "/father-day-cakes-leeds" },
            { name: "Retirement Cakes", href: "/retirement-cakes-leeds" },
          ],
        },
        {
          title: "Dietary Options",
          items: [
            // { name: "Vegan Cakes", href: "/vegan-cakes-leeds" },
            { name: "Vegan Wedding Cakes", href: "/vegan-wedding-cakes-leeds" },
            // { name: "Gluten-Friendly Cakes", href: "/gluten-friendly-ukrainian-cakes" },
            { name: "Gluten-Friendly Wedding Cakes", href: "/gluten-friendly-wedding-cakes-leeds" },
            // { name: "Dairy-Free Cakes", href: "/dairy-free-cakes-leeds" },
            { name: "Nut-Free Cakes", href: "/nut-free-cakes-leeds" },
            { name: "Egg-Free Cakes", href: "/egg-free-cakes-leeds" },
          ],
        },
      ],
    },
  },
  {
    name: "Gift Hampers",
    href: "/gift-hampers",
    dropdown: [
      { name: "All Gift Hampers", href: "/gift-hampers" },
      { name: "Cake by Post", href: "/gift-hampers/cake-by-post" },
    ],
  },
  {
    name: "Get a Quote",
    href: "/get-custom-quote",
  },
  {
    name: "Services",
    href: "/custom-cake-design",
    dropdown: [
      { name: "Custom Cake Design", href: "/custom-cake-design" },
      { name: "Cake Delivery", href: "/cake-delivery" },
      { name: "Cake by Post Service", href: "/cake-by-post-service" },
      { name: "Cake Postal Delivery", href: "/cake-postal-delivery" },
      { name: "Buy Cake Online", href: "/buy-cake" },
      { name: "Leeds Bakery", href: "/leeds-bakery" },
      { name: "Cake Decorating Services", href: "/cake-decorating-services" },
      { name: "Cake Photography", href: "/cake-photography" },
      { name: "Cake Preservation", href: "/cake-preservation" },
      { name: "Cake Shipping", href: "/cake-shipping" },
      // { name: "Baking Classes", href: "/ukrainian-baking-classes" },
      { name: "Corporate Cakes", href: "/corporate-cakes-leeds" },
      { name: "Cake Tasting Sessions", href: "/cake-tasting-sessions" },
      { name: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    name: "Learn",
    href: "/ukrainian-cake-recipes",
    dropdown: [
      { name: "Cake by Post UK Guide", href: "/blog/cake-by-post-uk-complete-guide" },
      { name: "Ukrainian Cake Recipes", href: "/ukrainian-cake-recipes" },
      { name: "Best Cakes for Weddings", href: "/best-cakes-for-weddings" },
      { name: "Best Cakes for Birthdays", href: "/best-cakes-for-birthdays" },
      { name: "Cake Flavors", href: "/cake-flavors" },
      { name: "Cake Size Guide", href: "/cake-size-guide" },
      { name: "Cake Flavor Guide", href: "/cake-flavor-guide" },
      { name: "Cake Care Guide", href: "/cake-care-storage" },
      { name: "How to Make Honey Cake", href: "/how-to-make-honey-cake" },
      { name: "Ukrainian Traditions", href: "/ukrainian-culture-baking" },
      { name: "Ukrainian vs British Cakes", href: "/ukrainian-cake-vs-british-cake" },
    ],
  },
  { name: "Gallery", href: "/cake-gallery" },
  { name: "Local Market", href: "/market-schedule" },
  { name: "Blog", href: "/blog" },
  {
    name: "Company",
    href: "/about",
    dropdown: [
      { name: "About Us", href: "/about" },
      // { name: "Reviews & Awards", href: "/reviews-awards" },
      { name: "FAQ", href: "/faq" },
      { name: "Customer Stories", href: "/customer-stories" },
      // { name: "Ukrainian Community", href: "/ukrainian-community-leeds" },
      { name: "Local Market", href: "/market-schedule" },
      // { name: "Charity Events", href: "/charity-events" },
      { name: "Delivery Areas", href: "/delivery-areas" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

const navigation = isGiftHampersEnabled
  ? navigationBase
  : navigationBase.filter(item => item.name !== "Gift Hampers");

// Memoized components for better performance
const MobileMenuItem = memo(
  function MobileMenuItem({
    item,
    isActive,
    pathname,
    onToggle,
    isOpen,
    onNavigate,
    hasSubmenu,
  }: {
    item: any;
    isActive: boolean;
    pathname: string;
    onToggle: () => void;
    isOpen: boolean;
    onNavigate: () => void;
    hasSubmenu: boolean;
  }) {
    const menuStyles = useMemo(
      () => ({
        minHeight: "48px", // WCAG touch target requirement with extra padding
        py: 2.5, // Increased vertical padding for better touch targets
        px: 3,
        borderBottom: `1px solid ${colors.border.light}`,
        backgroundColor: isActive ? colors.background.subtle : "transparent",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: colors.background.subtle,
        },
        "&:active": {
          transform: "scale(0.98)",
          transition: "transform 0.1s ease",
        },
        "&:focus": {
          outline: `2px solid ${colors.primary.main}`,
          outlineOffset: "2px",
        },
      }),
      [isActive]
    );

    const textStyles = useMemo(
      () => ({
        fontSize: typography.fontSize.lg,
        fontWeight: isActive ? typography.fontWeight.bold : typography.fontWeight.semibold,
        color: isActive ? colors.primary.main : colors.text.primary,
      }),
      [isActive]
    );

    const handleClick = (e: React.MouseEvent) => {
      if (hasSubmenu) {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      } else {
        // Allow default Link navigation; just close drawer/track
        onNavigate();
      }
    };

    return (
      <ListItem disablePadding>
        {hasSubmenu ? (
          <ListItemButton onClick={handleClick} sx={menuStyles}>
            <ListItemText primary={<Typography sx={textStyles}>{item.name}</Typography>} />
            <KeyboardArrowDownIcon
              sx={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
                color: colors.text.secondary,
              }}
            />
          </ListItemButton>
        ) : (
          <Link href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
            <ListItemButton onClick={handleClick} sx={menuStyles}>
              <ListItemText primary={<Typography sx={textStyles}>{item.name}</Typography>} />
            </ListItemButton>
          </Link>
        )}
      </ListItem>
    );
  }
);

const MobileSubmenuItem = memo(
  function MobileSubmenuItem({
    item,
    pathname,
    onNavigate,
    isFeatured = false,
  }: {
    item: any;
    pathname: string;
    onNavigate: () => void;
    isFeatured?: boolean;
  }) {
    const buttonStyles = useMemo(
      () => ({
        minHeight: "44px", // WCAG touch target requirement
        py: isFeatured ? 2 : 1.5, // Increased padding for better touch targets
        px: isFeatured ? 2.5 : 2,
        borderRadius: isFeatured ? 2 : 1.5,
        backgroundColor: pathname === item.href ? colors.primary.main : "transparent",
        color: pathname === item.href ? colors.primary.contrast : colors.text.primary,
        fontWeight:
          pathname === item.href ? typography.fontWeight.semibold : typography.fontWeight.normal,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: pathname === item.href ? colors.primary.dark : colors.background.paper,
        },
        "&:active": {
          transform: "scale(0.98)",
          transition: "transform 0.1s ease",
        },
        "&:focus": {
          outline: `2px solid ${colors.primary.main}`,
          outlineOffset: "2px",
        },
      }),
      [pathname, item.href, isFeatured]
    );

    return (
      <ListItem disablePadding sx={{ mb: isFeatured ? 1 : 0.5 }}>
        <Link href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
          <ListItemButton onClick={onNavigate} sx={buttonStyles}>
          <ListItemText
            primary={
              <Typography
                sx={{ fontSize: isFeatured ? typography.fontSize.base : typography.fontSize.sm }}
              >
                {item.name}
              </Typography>
            }
            secondary={
              isFeatured &&
              item.description && (
                <Typography
                  sx={{
                    fontSize: typography.fontSize.sm,
                    color: pathname === item.href ? colors.primary.contrast : colors.text.secondary,
                    mt: 0.5,
                  }}
                >
                  {item.description}
                </Typography>
              )
            }
          />
        </ListItemButton>
        </Link>
      </ListItem>
    );
  }
);

export function Header() {
  const theme = useTheme();
  const pathname = usePathname();
  const { trackMobileMenuInteraction, trackNavigation } = useAnalytics();
  const { startTimer } = usePerformanceMonitor();

  // Optimized state management
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuState, setMobileMenuState] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Desktop menu states
  const [cakesMenuAnchor, setCakesMenuAnchor] = useState<null | HTMLElement>(null);
  const [servicesMenuAnchor, setServicesMenuAnchor] = useState<null | HTMLElement>(null);
  const [learnMenuAnchor, setLearnMenuAnchor] = useState<null | HTMLElement>(null);
  const [companyMenuAnchor, setCompanyMenuAnchor] = useState<null | HTMLElement>(null);
  const [giftHampersMenuAnchor, setGiftHampersMenuAnchor] = useState<null | HTMLElement>(null);

  // Mobile gestures hook
  const { triggerHapticFeedback } = useMobileGestures({
    onSwipeClose: () => {
      if (mobileOpen) {
        handleDrawerToggle();
      }
    },
    enabled: mobileOpen,
  });

  // Memoized handlers for better performance
  const handleDrawerToggle = useCallback(() => {
    const endTimer = startTimer(mobileOpen ? "menuCloseTime" : "menuOpenTime");

    setMobileOpen(prev => !prev);
    // Reset mobile submenu states when closing
    if (mobileOpen) {
      setMobileMenuState({});
      trackMobileMenuInteraction("close", "drawer");
    } else {
      trackMobileMenuInteraction("open", "drawer");
    }

    // End performance timer
    setTimeout(endTimer, 0);
  }, [mobileOpen, trackMobileMenuInteraction, startTimer]);

  const toggleMobileSubmenu = useCallback(
    (menuKey: string) => {
      const endTimer = startTimer("submenuToggleTime");

      setMobileMenuState(prev => {
        const newState = {
          ...prev,
          [menuKey]: !prev[menuKey],
        };

        // Track submenu interaction
        trackMobileMenuInteraction(
          newState[menuKey] ? "open" : "close",
          `submenu_${menuKey.toLowerCase()}`
        );

        // Trigger haptic feedback
        triggerHapticFeedback();

        return newState;
      });

      // End performance timer
      setTimeout(endTimer, 0);
    },
    [trackMobileMenuInteraction, triggerHapticFeedback, startTimer]
  );

  const handleMobileNavigation = useCallback(() => {
    const endTimer = startTimer("navigationTime");

    setIsLoading(true);
    handleDrawerToggle();
    // Track navigation
    trackNavigation("mobile_menu", pathname);
    // Simulate loading state for better UX
    setTimeout(() => {
      setIsLoading(false);
      endTimer();
    }, 300);
  }, [handleDrawerToggle, trackNavigation, pathname, startTimer]);

  // Memoized desktop menu handlers
  const handleCakesMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setCakesMenuAnchor(event.currentTarget);
  }, []);

  const handleCakesMenuClose = useCallback(() => {
    setCakesMenuAnchor(null);
  }, []);

  const handleServicesMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setServicesMenuAnchor(event.currentTarget);
  }, []);

  const handleServicesMenuClose = useCallback(() => {
    setServicesMenuAnchor(null);
  }, []);

  const handleLearnMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setLearnMenuAnchor(event.currentTarget);
  }, []);

  const handleLearnMenuClose = useCallback(() => {
    setLearnMenuAnchor(null);
  }, []);

  const handleCompanyMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setCompanyMenuAnchor(event.currentTarget);
  }, []);

  const handleCompanyMenuClose = useCallback(() => {
    setCompanyMenuAnchor(null);
  }, []);

  const handleGiftHampersMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setGiftHampersMenuAnchor(event.currentTarget);
  }, []);

  const handleGiftHampersMenuClose = useCallback(() => {
    setGiftHampersMenuAnchor(null);
  }, []);

  // Memoized computed values
  const isCakesMenuOpen = Boolean(cakesMenuAnchor);
  const isServicesMenuOpen = Boolean(servicesMenuAnchor);
  const isLearnMenuOpen = Boolean(learnMenuAnchor);
  const isCompanyMenuOpen = Boolean(companyMenuAnchor);
  const isGiftHampersMenuOpen = Boolean(giftHampersMenuAnchor);

  // Memoized mobile menu styles
  const mobileDrawerStyles = useMemo(
    () => ({
      display: { xs: "block", md: "none" },
      "& .MuiDrawer-paper": {
        boxSizing: "border-box",
        width: "100%",
        maxWidth: { xs: "100%", sm: 320 },
        backgroundColor: colors.background.paper,
        boxShadow: shadows.xl,
        border: "none",
        // Enhanced mobile UX
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-track": {
          background: colors.background.subtle,
        },
        "&::-webkit-scrollbar-thumb": {
          background: colors.border.medium,
          borderRadius: "2px",
        },
      },
    }),
    []
  );

  const mobileHeaderStyles = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
      color: colors.primary.contrast,
      p: 3,
      position: "relative" as const,
      overflow: "hidden" as const,
      "&::before": {
        content: '""',
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
        opacity: 0.3,
      },
    }),
    []
  );

  return (
    <>
      <NavigationStructuredData navigation={navigation} />
      
      {/* Mobile Navbar - shown only on mobile */}
      <div className="md:hidden">
        <MobileNavbar
          navigation={navigation}
          onDrawerToggle={handleDrawerToggle}
          drawerOpen={mobileOpen}
        />
      </div>

      {/* Desktop Header - shown only on desktop */}
      <AppBar
        position="sticky"
        elevation={0}
        role="banner"
        aria-label="Main navigation"
        sx={{
          backgroundColor: colors.background.paper,
          borderBottom: `1px solid ${colors.border.light}`,
          boxShadow: shadows.sm,
          display: { xs: "none", md: "block" },
        }}
      >
        <DesignContainer
          sx={{
            marginInline: { xs: "1rem", md: "auto" },
          }}
        >
          <Toolbar
            disableGutters
            role="navigation"
            aria-label="Primary navigation"
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
                aria-label="Olgish Cakes - Home"
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
                  <Image
                    src="/images/olgish-cakes-logo-bakery-brand.png"
                    alt="Olgish Cakes - #1 Ukrainian Bakery Leeds | Traditional Honey Cake (Medovik), Kyiv Cake, Wedding Cakes, Birthday Cakes, Custom Cakes | Real Ukrainian Desserts Yorkshire"
                    width={120}
                    height={85}
                    priority
                    style={{
                      height: "auto",
                      maxWidth: "120px",
                    }}
                  />
                </Box>
              </Link>
            </Box>

            {/* Spacer to push nav to the right */}
            <Box sx={{ flex: 1, minWidth: { xs: 16, md: 48 } }} />

            {/* Navigation and Order Now button on the right */}
            <Box
              sx={{
                display: "flex",
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
                              <Link 
                                key={featuredItem.name}
                                href={featuredItem.href}
                                style={{ textDecoration: 'none', display: 'block' }}
                              >
                              <Box
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
                              </Link>
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
                                  <Link
                                    key={categoryItem.name}
                                    href={categoryItem.href}
                                    style={{ textDecoration: 'none', display: 'block' }}
                                  >
                                  <Box
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
                                  </Link>
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
                  const isCompanyMenu = item.name === "Company";
                  const isGiftHampersMenu = item.name === "Gift Hampers";

                  let menuAnchor: null | HTMLElement = null;
                  let isMenuOpen = false;
                  let handleMenuOpen: (event: React.MouseEvent<HTMLElement>) => void = () => {};
                  let handleMenuClose: () => void = () => {};

                  if (isServicesMenu) {
                    menuAnchor = servicesMenuAnchor;
                    isMenuOpen = isServicesMenuOpen;
                    handleMenuOpen = handleServicesMenuOpen;
                    handleMenuClose = handleServicesMenuClose;
                  } else if (isLearnMenu) {
                    menuAnchor = learnMenuAnchor;
                    isMenuOpen = isLearnMenuOpen;
                    handleMenuOpen = handleLearnMenuOpen;
                    handleMenuClose = handleLearnMenuClose;
                  } else if (isGiftHampersMenu) {
                    menuAnchor = giftHampersMenuAnchor;
                    isMenuOpen = isGiftHampersMenuOpen;
                    handleMenuOpen = handleGiftHampersMenuOpen;
                    handleMenuClose = handleGiftHampersMenuClose;
                  } else if (isCompanyMenu) {
                    menuAnchor = companyMenuAnchor;
                    isMenuOpen = isCompanyMenuOpen;
                    handleMenuOpen = handleCompanyMenuOpen;
                    handleMenuClose = handleCompanyMenuClose;
                  }

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
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            style={{ textDecoration: 'none', display: 'block' }}
                          >
                          <MenuItem
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
                          </Link>
                        ))}
                      </Menu>
                    </Box>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    passHref
                    style={{ textDecoration: "none" }}
                  >
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
                      size="large"
                    >
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              {/* Professional desktop search - aligned right */}
              <Box
                component="form"
                role="search"
                method="GET"
                action="/search"
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  ml: 1,
                  width: { md: 200, lg: 240 },
                }}
              >
                <TextField
                  name="q"
                  size="small"
                  placeholder="Search cakes, pages"
                  fullWidth
                  inputProps={{ "aria-label": "Search site" }}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: borderRadius.lg,
                      backgroundColor: "#fff",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="submit" aria-label="Submit search">
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Order Now Button (desktop) */}
              <Link
                href="/order"
                passHref
                style={{ textDecoration: "none" }}
                aria-label="Order your custom cake now"
              >
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
                  size="large"
                >
                  Order Now
                </Button>
              </Link>
            </Box>

          </Toolbar>
        </DesignContainer>
      </AppBar>
    </>
  );
}
