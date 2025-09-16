"use client";

import { useMemo } from "react";
import { Divider, Chip } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import {
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
  EmailIcon,
  PhoneIcon,
  LocationOnIcon,
  StarIcon,
  VerifiedIcon,
  LocalShippingIcon,
  FavoriteIcon,
  SecurityIcon,
} from "@/lib/mui-optimization";
import { designTokens } from "@/lib/design-system";
import {
  BodyText,
  Container as DesignContainer,
  ContactInfo,
  AccessibleIconButton,
  TouchTargetWrapper,
} from "@/lib/ui-components";
import { Box, Grid, Stack, Typography } from "@/lib/mui-optimization";

const { colors, typography, spacing, shadows, borderRadius } = designTokens;

// Feature flag: control visibility of Gift Hampers links (default enabled)
const isGiftHampersEnabled = process.env.NEXT_PUBLIC_FEATURE_GIFT_HAMPERS_ENABLED !== "false";

const footerLinksBase = {
  cakes: [
    { name: "All Cakes", href: "/cakes" },
    { name: "Wedding Cakes", href: "/wedding-cakes" },
    { name: "Birthday Cakes", href: "/birthday-cakes" },
    { name: "Old Ukrainian", href: "/traditional-ukrainian-cakes" },
    { name: "Easter Cakes", href: "/easter-cakes-leeds" },
    { name: "Christmas Cakes", href: "/christmas-cakes-leeds" },
    { name: "Valentine's Cakes", href: "/valentines-cakes-leeds" },
    { name: "Halloween Cakes", href: "/halloween-cakes-leeds" },
    // { name: "Vegan Cakes", href: "/vegan-cakes-leeds" },
    // { name: "Gluten-Friendly Cakes", href: "/gluten-friendly-ukrainian-cakes" },
    // { name: "Dairy-Free Cakes", href: "/dairy-free-cakes-leeds" },
    { name: "Nut-Free Cakes", href: "/nut-free-cakes-leeds" },
  ],
  services: [
    { name: "Custom Cake Design", href: "/custom-cake-design" },
    { name: "Cake Delivery", href: "/cake-delivery" },
    { name: "Buy Cake Online", href: "/buy-cake" },
    { name: "Leeds Bakery", href: "/leeds-bakery" },
    { name: "Cake Decorating Services", href: "/cake-decorating-services" },
    { name: "Cake Photography", href: "/cake-photography" },
    { name: "Cake Preservation", href: "/cake-preservation" },
    { name: "Cake Shipping", href: "/cake-shipping" },
    // { name: "Baking Classes", href: "/ukrainian-baking-classes" },
    { name: "Corporate Cakes", href: "/corporate-cakes-leeds" },
    { name: "Gift Cards", href: "/gift-cards" },
    { name: "Cake Tasting", href: "/cake-tasting-sessions" },
    { name: "Gift Hampers", href: "/gift-hampers" },
  ],
  locations: [
    { name: "Cakes Leeds", href: "/cakes-leeds" },
    { name: "Cakes York", href: "/cakes-york" },
    { name: "Cakes Bradford", href: "/cakes-bradford" },
    { name: "Cakes Huddersfield", href: "/cakes-huddersfield" },
    { name: "Cakes Wakefield", href: "/cakes-wakefield" },
    { name: "Cakes Pudsey", href: "/cakes-pudsey" },
    // { name: "Best Cakes Leeds", href: "/best-cakes-leeds" },
    { name: "View All Areas", href: "/delivery-areas" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    // { name: "Reviews & Awards", href: "/reviews-awards" },
    // { name: "Blog", href: "/blog" },
    { name: "Local Market", href: "/market-schedule" },
    { name: "FAQ", href: "/faq" },
    { name: "Gallery", href: "/cake-gallery" },
    { name: "Customer Stories", href: "/customer-stories" },
    // { name: "Ukrainian Community", href: "/ukrainian-community-leeds" },
    // { name: "Charity Events", href: "/charity-events" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Return Policy", href: "/return-policy" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Allergen Info", href: "/allergen-information" },
    { name: "Accessibility", href: "/accessibility" },
  ],
};

const footerLinks = {
  ...footerLinksBase,
  services: isGiftHampersEnabled
    ? footerLinksBase.services
    : footerLinksBase.services.filter(link => link.name !== "Gift Hampers"),
};

const contactInfo = {
  email: "hello@olgishcakes.co.uk",
  phone: "+44 786 721 8194",
  address: "Allerton Grange, Leeds, LS17",
  socialMedia: {
    facebook: "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
    instagram: "https://www.instagram.com/olgish_cakes/",
    whatsapp: "https://wa.me/447867218194",
  },
};

// Enhanced Footer component with comprehensive SEO
export default function Footer() {
  // Generate comprehensive structured data for footer
  const footerStructuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Footer",
      name: "Olgish Cakes Footer",
      description:
        "Footer navigation and contact information for Olgish Cakes Ukrainian Bakery in Leeds",
      url: "https://olgishcakes.co.uk",
      mainEntity: [
        {
          "@type": "SiteNavigationElement",
          name: "Cake Categories",
          description: "Navigation to different types of Ukrainian cakes",
          url: "https://olgishcakes.co.uk/cakes",
          hasPart: footerLinks.cakes.map(link => ({
            "@type": "WebPage",
            name: link.name,
            url: `https://olgishcakes.co.uk${link.href}`,
            description: `${link.name} from Olgish Cakes in Leeds`,
          })),
        },
        {
          "@type": "SiteNavigationElement",
          name: "Services",
          description: "Cake services and additional offerings",
          url: "https://olgishcakes.co.uk/services",
          hasPart: footerLinks.services.map(link => ({
            "@type": "Service",
            name: link.name,
            url: `https://olgishcakes.co.uk${link.href}`,
            provider: {
              "@type": "Organization",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
            },
          })),
        },
        {
          "@type": "SiteNavigationElement",
          name: "Locations",
          description: "Cake delivery areas and locations served",
          url: "https://olgishcakes.co.uk/delivery-areas",
          hasPart: footerLinks.locations.map(link => ({
            "@type": "WebPage",
            name: link.name,
            url: `https://olgishcakes.co.uk${link.href}`,
            description: `${link.name} - Ukrainian cake delivery`,
          })),
        },
      ],
      // Contact information structured data
      contactPoint: {
        "@type": "ContactPoint",
        telephone: contactInfo.phone,
        email: contactInfo.email,
        contactType: "customer service",
        areaServed: {
          "@type": "City",
          name: "Leeds",
        },
        availableLanguage: "English",
      },
      // Organization information
      publisher: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
        logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        description: "Real Ukrainian honey cakes made with love in Leeds",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Allerton Grange",
          addressLocality: "Leeds",
          addressRegion: "West Yorkshire",
          postalCode: "LS17",
          addressCountry: "GB",
        },
        sameAs: [contactInfo.socialMedia.facebook, contactInfo.socialMedia.instagram],
      },
    }),
    []
  );

  return (
    <footer
      role="contentinfo"
      aria-label="Site footer with navigation and contact information"
      itemScope
      itemType="https://schema.org/Footer"
    >
      {/* Enhanced Structured Data for Footer */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(footerStructuredData),
        }}
      />

      {/* Main Footer Content */}
      <Box
        component="section"
        aria-labelledby="footer-navigation-heading"
        sx={{
          backgroundColor: colors.background.subtle,
          py: { xs: spacing.xl, md: spacing["4xl"] },
        }}
      >
        <DesignContainer maxWidth="lg">
          <Typography
            id="footer-navigation-heading"
            variant="h6"
            component="h2"
            sx={{ display: "none" }}
          >
            Footer Navigation
          </Typography>

          <Grid container spacing={4}>
            {/* Cakes Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  mb: spacing.md,
                }}
              >
                My Cakes
              </Typography>
              <Stack spacing={spacing.sm}>
                {footerLinks.cakes.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                    aria-label={`View ${link.name} page`}
                    title={`${link.name} - Olgish Cakes Leeds`}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        "&:hover": {
                          color: colors.primary.main,
                        },
                        transition: "color 0.2s ease-in-out",
                        cursor: "pointer",
                      }}
                    >
                      {link.name}
                    </Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Services Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  mb: spacing.md,
                }}
              >
                Services
              </Typography>
              <Stack spacing={spacing.sm}>
                {footerLinks.services.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                    aria-label={`View ${link.name} service page`}
                    title={`${link.name} - Olgish Cakes Leeds`}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        "&:hover": {
                          color: colors.primary.main,
                        },
                        transition: "color 0.2s ease-in-out",
                        cursor: "pointer",
                      }}
                    >
                      {link.name}
                    </Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Locations Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  mb: spacing.md,
                }}
              >
                Delivery Areas
              </Typography>
              <Stack spacing={spacing.sm}>
                {footerLinks.locations.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                    aria-label={`View ${link.name} delivery area`}
                    title={`${link.name} - Ukrainian Cake Delivery`}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        "&:hover": {
                          color: colors.primary.main,
                        },
                        transition: "color 0.2s ease-in-out",
                        cursor: "pointer",
                      }}
                    >
                      {link.name}
                    </Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Company Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  mb: spacing.md,
                }}
              >
                Company
              </Typography>
              <Stack spacing={spacing.sm}>
                {footerLinks.company.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                    aria-label={`View ${link.name} page`}
                    title={`${link.name} - Olgish Cakes Leeds`}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        "&:hover": {
                          color: colors.primary.main,
                        },
                        transition: "color 0.2s ease-in-out",
                        cursor: "pointer",
                      }}
                    >
                      {link.name}
                    </Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: spacing.xl, borderColor: colors.border.light }} />

          {/* Contact & Social Section */}
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  mb: spacing.md,
                }}
              >
                Contact Information
              </Typography>
              <Stack spacing={spacing.md}>
                <Box sx={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                  <PhoneIcon sx={{ color: colors.primary.main }} />
                  <Link
                    href={`tel:${contactInfo.phone}`}
                    style={{ textDecoration: "none" }}
                    aria-label={`Call us at ${contactInfo.phone}`}
                    title={`Call Olgish Cakes at ${contactInfo.phone}`}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        "&:hover": {
                          color: colors.primary.main,
                        },
                        transition: "color 0.2s ease-in-out",
                      }}
                    >
                      {contactInfo.phone}
                    </Typography>
                  </Link>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                  <EmailIcon sx={{ color: colors.primary.main }} />
                  <Link
                    href={`mailto:${contactInfo.email}`}
                    style={{ textDecoration: "none" }}
                    aria-label={`Send email to ${contactInfo.email}`}
                    title={`Email Olgish Cakes at ${contactInfo.email}`}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        "&:hover": {
                          color: colors.primary.main,
                        },
                        transition: "color 0.2s ease-in-out",
                      }}
                    >
                      {contactInfo.email}
                    </Typography>
                  </Link>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                  <LocationOnIcon sx={{ color: colors.primary.main }} />
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    {contactInfo.address}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  mb: spacing.md,
                }}
              >
                Follow Us
              </Typography>
              <Stack direction="row" spacing={spacing.md}>
                <Link
                  href={contactInfo.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit my Facebook page"
                  title="Olgish Cakes Facebook Page"
                >
                  <AccessibleIconButton
                    ariaLabel="Facebook"
                    title="Facebook"
                    sx={{
                      color: colors.text.secondary,
                      "&:hover": {
                        color: colors.primary.main,
                        backgroundColor: colors.background.warm,
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <FacebookIcon />
                  </AccessibleIconButton>
                </Link>
                <Link
                  href={contactInfo.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit my Instagram profile"
                  title="Olgish Cakes Instagram Profile"
                >
                  <AccessibleIconButton
                    ariaLabel="Instagram"
                    title="Instagram"
                    sx={{
                      color: colors.text.secondary,
                      "&:hover": {
                        color: colors.primary.main,
                        backgroundColor: colors.background.warm,
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <InstagramIcon />
                  </AccessibleIconButton>
                </Link>
                <Link
                  href={contactInfo.socialMedia.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact me on WhatsApp"
                  title="Contact Olgish Cakes on WhatsApp"
                >
                  <AccessibleIconButton
                    ariaLabel="WhatsApp"
                    title="WhatsApp"
                    sx={{
                      color: colors.text.secondary,
                      "&:hover": {
                        color: colors.primary.main,
                        backgroundColor: colors.background.warm,
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <WhatsAppIcon />
                  </AccessibleIconButton>
                </Link>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: spacing.xl, borderColor: colors.border.light }} />

          {/* Bottom Section */}
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                <Image
                  src="/images/olgish-cakes-logo-bakery-brand.png"
                  alt="Olgish Cakes - Ukrainian Bakery Leeds"
                  width={120}
                  height={40}
                  priority={false}
                  title="Olgish Cakes - Real Ukrainian Bakery in Leeds"
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.secondary,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  Real Ukrainian Cakes in Leeds
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={spacing.md} justifyContent="flex-end">
                {footerLinks.legal.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                    aria-label={`View ${link.name}`}
                    title={`${link.name} - Olgish Cakes`}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        "&:hover": {
                          color: colors.primary.main,
                        },
                        transition: "color 0.2s ease-in-out",
                        cursor: "pointer",
                      }}
                    >
                      {link.name}
                    </Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>
          </Grid>

          {/* Copyright */}
          <Box sx={{ mt: spacing.xl, textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color: colors.text.secondary,
                "& a": {
                  color: colors.primary.main,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                },
              }}
            >
              © {new Date().getFullYear()} Olgish Cakes. All rights reserved. | Made with ❤️ in
              Leeds, Yorkshire |
              <Link href="/privacy" aria-label="Privacy Policy">
                {" "}
                Privacy Policy
              </Link>{" "}
              |
              <Link href="/terms" aria-label="Terms of Service">
                {" "}
                Terms of Service
              </Link>{" "}
              |
              <Link href="/return-policy" aria-label="Return Policy">
                {" "}
                Return Policy
              </Link>
            </Typography>
          </Box>
        </DesignContainer>
      </Box>
    </footer>
  );
}
