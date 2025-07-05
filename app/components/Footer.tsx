"use client";

import { useState } from "react";
import {
  Container,
  Grid,
  Typography,
  IconButton,
  Button,
  Box,
  Divider,
  TextField,
  Chip,
  Stack,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  WhatsApp,
  Email,
  Phone,
  LocationOn,
  Star,
  Verified,
  LocalShipping,
  Favorite,
  Security,
} from "@mui/icons-material";
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
    { name: "Wedding Cakes", href: "/wedding-cakes" },
    { name: "Birthday Cakes", href: "/birthday-cakes" },
    { name: "Traditional Ukrainian", href: "/traditional-ukrainian-cakes" },
    { name: "Vegan Cakes", href: "/vegan-cakes-leeds" },
    { name: "Gluten-Free Cakes", href: "/gluten-free-ukrainian-cakes" },
  ],
  services: [
    { name: "Custom Cake Design", href: "/custom-cake-design" },
    { name: "Cake Delivery", href: "/cake-delivery" },
    { name: "Baking Classes", href: "/ukrainian-baking-classes" },
    { name: "Corporate Cakes", href: "/corporate-cakes-leeds" },
    { name: "Gift Cards", href: "/gift-cards" },
    { name: "Cake Tasting", href: "/cake-tasting-sessions" },
  ],
  locations: [
    { name: "Cakes Leeds", href: "/cakes-leeds" },
    { name: "Cakes York", href: "/cakes-york" },
    { name: "Cakes Bradford", href: "/cakes-bradford" },
    { name: "Cakes Huddersfield", href: "/cakes-huddersfield" },
    { name: "Cakes Wakefield", href: "/cakes-wakefield" },
    { name: "View All Areas", href: "/delivery-areas" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Reviews & Awards", href: "/reviews-awards" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Gallery", href: "/cake-gallery" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Allergen Info", href: "/allergen-information" },
  ],
};

const contactInfo = {
  email: "olgish.cakes@gmail.com",
  phone: "+447867218194",
  address: "Leeds, West Yorkshire, UK",
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

const trustSignals = [
  { icon: Star, text: "5-Star Rated", color: "#FFD700" },
  { icon: Verified, text: "Verified Business", color: "#4CAF50" },
  { icon: LocalShipping, text: "Free Delivery", color: "#2196F3" },
  { icon: Security, text: "Secure Orders", color: "#9C27B0" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

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
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
                <Link href="/" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: typography.fontSize["2xl"],
                      fontWeight: typography.fontWeight.bold,
                      color: colors.primary.main,
                      fontFamily: typography.fontFamily.display,
                      mb: spacing.md,
                    }}
                  >
                    Olgish Cakes
                  </Typography>
                </Link>
                <BodyText
                  sx={{
                    color: colors.text.secondary,
                    lineHeight: typography.lineHeight.relaxed,
                    mb: spacing.md,
                  }}
                >
                  Handcrafted Ukrainian cakes made with love in Leeds. Traditional recipes, premium
                  ingredients, and exceptional taste for your special occasions.
                </BodyText>

                {/* Contact Info */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                    <Email sx={{ color: colors.text.secondary, fontSize: 18 }} />
                    <BodyText
                      sx={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}
                    >
                      {contactInfo.email}
                    </BodyText>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                    <Phone sx={{ color: colors.text.secondary, fontSize: 18 }} />
                    <BodyText
                      sx={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}
                    >
                      {contactInfo.phone}
                    </BodyText>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                    <LocationOn sx={{ color: colors.text.secondary, fontSize: 18 }} />
                    <BodyText
                      sx={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}
                    >
                      {contactInfo.address}
                    </BodyText>
                  </Box>
                </Box>

                {/* Social Links */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      mb: spacing.sm,
                    }}
                  >
                    Follow Us
                  </Typography>
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
              </Box>
            </Grid>

            {/* Footer Links */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      mb: spacing.md,
                      fontSize: typography.fontSize.base,
                    }}
                  >
                    Our Cakes
                  </Typography>
                  <Stack spacing={1}>
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
                  </Stack>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      mb: spacing.md,
                      fontSize: typography.fontSize.base,
                    }}
                  >
                    Services
                  </Typography>
                  <Stack spacing={1}>
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
                  </Stack>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      mb: spacing.md,
                      fontSize: typography.fontSize.base,
                    }}
                  >
                    Locations
                  </Typography>
                  <Stack spacing={1}>
                    {footerLinks.locations.map(link => (
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
                  </Stack>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      mb: spacing.md,
                      fontSize: typography.fontSize.base,
                    }}
                  >
                    Company
                  </Typography>
                  <Stack spacing={1}>
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
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: spacing["3xl"],
            borderTop: `1px solid ${colors.border.light}`,
            background: `linear-gradient(135deg, ${colors.primary.main}08 0%, ${colors.primary.main}04 100%)`,
            borderRadius: 3,
            mb: spacing["2xl"],
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                mb: spacing.md,
                fontFamily: typography.fontFamily.display,
              }}
            >
              Ready to Order Your Perfect Cake?
            </Typography>
            <BodyText
              sx={{
                color: colors.text.secondary,
                mb: spacing.xl,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Contact us today to discuss your cake requirements and get a personalized quote. We're
              here to make your special occasion even more memorable.
            </BodyText>
            <Box
              sx={{ display: "flex", gap: spacing.md, justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/contact" style={{ textDecoration: "none" }}>
                <PrimaryButton
                  variant="contained"
                  size="large"
                  sx={{
                    px: spacing.xl,
                    py: spacing.md,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: typography.fontWeight.bold,
                    fontSize: typography.fontSize.lg,
                  }}
                >
                  Order Now
                </PrimaryButton>
              </Link>
              <Link href="/how-to-order" style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: spacing.xl,
                    py: spacing.md,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: typography.fontWeight.bold,
                    fontSize: typography.fontSize.lg,
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
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            py: spacing.lg,
            borderTop: `1px solid ${colors.border.light}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <BodyText sx={{ color: colors.text.secondary }}>
                © {currentYear} Olgish Cakes. All rights reserved. Handcrafted Ukrainian cakes in
                Leeds.
              </BodyText>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: spacing.md,
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  flexWrap: "wrap",
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
