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
  products: [{ name: "All Cakes", href: "/cakes" }],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Testimonials", href: "/testimonials" },
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
          <Grid container spacing={8}>
            {/* Brand Column */}
            <Grid item xs={12} md={4}>
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

            {/* Quick Links */}
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
                Products
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {footerLinks.products.map(link => (
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
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing.lg,
                  fontSize: typography.fontSize.base,
                }}
              >
                Contact Us
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                  <ContactInfo icon={<Phone />} text={contactInfo.phone} />
                  <IconButton
                    component="a"
                    href={`https://wa.me/${contactInfo.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: "#25D366",
                      "&:hover": {
                        backgroundColor: colors.background.subtle,
                      },
                    }}
                  >
                    <WhatsApp />
                  </IconButton>
                </Box>
                <ContactInfo icon={<Email />} text={contactInfo.email} />
                <PrimaryButton
                  component={Link}
                  href="/contact"
                  sx={{ mt: spacing.sm, alignSelf: "flex-start" }}
                >
                  Get in Touch
                </PrimaryButton>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: colors.border.light }} />

        {/* Bottom Bar */}
        <Box sx={{ py: spacing.xl }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md="auto">
              <BodyText
                sx={{
                  color: colors.text.secondary,
                  textAlign: { xs: "center", md: "left" },
                  fontSize: typography.fontSize.sm,
                }}
              >
                © {currentYear} Olgish Cakes. All rights reserved.
              </BodyText>
            </Grid>
            <Grid item xs={12} md="auto">
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", md: "flex-end" },
                  gap: { xs: spacing.sm, md: spacing.lg },
                }}
              >
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
      </DesignContainer>
    </Box>
  );
}
