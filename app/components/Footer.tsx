"use client";

import { Container, Grid, Typography, IconButton, Button, Box, Divider } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, WhatsApp, Email, Phone } from "@mui/icons-material";
import { designTokens } from "@/lib/design-system";
import {
  Container as DesignContainer,
  PrimaryButton,
  BodyText,
  SectionHeading,
  ContactInfo,
} from "@/lib/ui-components";

const { colors, typography, spacing, shadows } = designTokens;

const footerLinks = {
  cakes: [
    { name: "All Cakes", href: "/cakes" },
    { name: "Cakes Leeds", href: "/cakes-leeds" },
    { name: "Ukrainian Bakery Leeds", href: "/ukrainian-bakery-leeds" },
    { name: "Traditional Ukrainian", href: "/traditional-ukrainian-cakes" },
    { name: "Wedding Cakes", href: "/wedding-cakes" },
    { name: "Birthday Cakes", href: "/birthday-cakes" },
    { name: "Celebration Cakes", href: "/celebration-cakes" },
    { name: "Seasonal Cakes", href: "/seasonal-cakes" },
  ],
  services: [
    { name: "Custom Cake Design", href: "/custom-cake-design" },
    { name: "Cake Delivery", href: "/cake-delivery" },
    { name: "Delivery Areas", href: "/delivery-areas" },
    { name: "How to Order", href: "/how-to-order" },
  ],
  information: [
    { name: "Cake Flavors", href: "/cake-flavors" },
    { name: "Cake Sizes Guide", href: "/cake-sizes-guide" },
    { name: "Allergen Information", href: "/allergen-information" },
    { name: "Cake Care & Storage", href: "/cake-care-storage" },
    { name: "Cake Pricing", href: "/cake-pricing" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Testimonials", href: "/testimonials" },
    { name: "Cake Gallery", href: "/cake-gallery" },
    { name: "Ukrainian Culture", href: "/ukrainian-culture-baking" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const contactInfo = {
  email: "olgish.cakes@gmail.com",
  phone: "+447867218194",
  social: [
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com/olgish_cakes/",
      hoverColor: "#E1306C",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://www.facebook.com/profile.php?id=61557043820222",
      hoverColor: "#1877F2",
    },
    {
      name: "WhatsApp",
      icon: WhatsApp,
      href: `https://wa.me/447867218194`,
      hoverColor: "#25D366",
    },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.background.paper,
        borderTop: `1px solid ${colors.border.light}`,
      }}
    >
      <DesignContainer>
        {/* Main Footer Content */}
        <Box sx={{ py: spacing["4xl"] }}>
          <Grid container spacing={6}>
            {/* Brand Column */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
                <Link href="/" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: typography.fontSize["2xl"],
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.display,
                    }}
                  >
                    Olgish Cakes
                  </Typography>
                </Link>
                <BodyText
                  sx={{
                    color: colors.text.secondary,
                    maxWidth: "300px",
                    lineHeight: typography.lineHeight.relaxed,
                  }}
                >
                  Handcrafted Ukrainian cakes made with love in Leeds. Traditional recipes, premium
                  ingredients, and exceptional taste.
                </BodyText>
                <Box sx={{ display: "flex", gap: spacing.md }}>
                  {contactInfo.social.map(social => (
                    <IconButton
                      key={social.name}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: colors.text.secondary,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          color: social.hoverColor,
                          transform: "translateY(-2px)",
                        },
                      }}
                      size="small"
                    >
                      <social.icon />
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Cakes */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing.lg,
                  fontSize: typography.fontSize.base,
                }}
              >
                Our Cakes
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {footerLinks.cakes.map(link => (
                  <Link key={link.name} href={link.href} style={{ textDecoration: "none" }}>
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
                      {link.name}
                    </BodyText>
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Services */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing.lg,
                  fontSize: typography.fontSize.base,
                }}
              >
                Services
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {footerLinks.services.map(link => (
                  <Link key={link.name} href={link.href} style={{ textDecoration: "none" }}>
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
                      {link.name}
                    </BodyText>
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Information */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing.lg,
                  fontSize: typography.fontSize.base,
                }}
              >
                Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {footerLinks.information.map(link => (
                  <Link key={link.name} href={link.href} style={{ textDecoration: "none" }}>
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
                      {link.name}
                    </BodyText>
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Company */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing.lg,
                  fontSize: typography.fontSize.base,
                }}
              >
                Company
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {footerLinks.company.map(link => (
                  <Link key={link.name} href={link.href} style={{ textDecoration: "none" }}>
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
                      {link.name}
                    </BodyText>
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Contact Column */}
            <Grid item xs={12} md={1}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing.lg,
                  fontSize: typography.fontSize.base,
                }}
              >
                Legal
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {footerLinks.legal.map(link => (
                  <Link key={link.name} href={link.href} style={{ textDecoration: "none" }}>
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
                      {link.name}
                    </BodyText>
                  </Link>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Contact Section */}
        <Box sx={{ py: spacing["2xl"], borderTop: `1px solid ${colors.border.light}` }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing.md,
                }}
              >
                Get in Touch
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                  <Email sx={{ color: colors.text.secondary, fontSize: 20 }} />
                  <BodyText sx={{ color: colors.text.secondary }}>{contactInfo.email}</BodyText>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                  <Phone sx={{ color: colors.text.secondary, fontSize: 20 }} />
                  <BodyText sx={{ color: colors.text.secondary }}>{contactInfo.phone}</BodyText>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                  }}
                >
                  Ready to Order?
                </Typography>
                <BodyText sx={{ color: colors.text.secondary, mb: spacing.md }}>
                  Contact us today to discuss your cake requirements and get a personalized quote.
                </BodyText>
                <Box sx={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
                  <Link href="/contact" style={{ textDecoration: "none" }}>
                    <PrimaryButton
                      variant="contained"
                      sx={{
                        px: spacing.xl,
                        py: spacing.md,
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: typography.fontWeight.bold,
                      }}
                    >
                      Order Now
                    </PrimaryButton>
                  </Link>
                  <Link href="/how-to-order" style={{ textDecoration: "none" }}>
                    <Button
                      variant="outlined"
                      sx={{
                        px: spacing.xl,
                        py: spacing.md,
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: typography.fontWeight.bold,
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        "&:hover": {
                          borderColor: colors.primary.dark,
                          backgroundColor: colors.primary.main,
                          color: colors.primary.contrast,
                        },
                      }}
                    >
                      How to Order
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            py: spacing.lg,
            borderTop: `1px solid ${colors.border.light}`,
            textAlign: "center",
          }}
        >
          <BodyText sx={{ color: colors.text.secondary }}>
            © {currentYear} Olgish Cakes. All rights reserved. Handcrafted Ukrainian cakes in
            Leeds.
          </BodyText>
        </Box>
      </DesignContainer>
    </Box>
  );
}
