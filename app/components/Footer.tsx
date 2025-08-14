"use client";

import { useState } from "react";
import { Divider, Chip, TextField } from "@mui/material";
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
import { Box, Grid, Stack, Typography, Button } from "@/lib/mui-optimization";

const { colors, typography, spacing, shadows } = designTokens;

// Feature flag: control visibility of Gift Hampers links (default enabled)
const isGiftHampersEnabled = process.env.NEXT_PUBLIC_FEATURE_GIFT_HAMPERS_ENABLED !== "false";

const footerLinksBase = {
  cakes: [
    { name: "All Cakes", href: "/cakes" },
    { name: "Wedding Cakes", href: "/wedding-cakes" },
    { name: "Birthday Cakes", href: "/birthday-cakes" },
    { name: "Traditional Ukrainian", href: "/traditional-ukrainian-cakes" },
    { name: "Easter Cakes", href: "/easter-cakes-leeds" },
    { name: "Christmas Cakes", href: "/christmas-cakes-leeds" },
    { name: "Valentine's Cakes", href: "/valentines-cakes-leeds" },
    { name: "Halloween Cakes", href: "/halloween-cakes-leeds" },
    { name: "Vegan Cakes", href: "/vegan-cakes-leeds" },
    { name: "Gluten-Friendly Cakes", href: "/gluten-friendly-ukrainian-cakes" },
    { name: "Dairy-Free Cakes", href: "/dairy-free-cakes-leeds" },
    { name: "Nut-Free Cakes", href: "/nut-free-cakes-leeds" },
  ],
  services: [
    { name: "Custom Cake Design", href: "/custom-cake-design" },
    { name: "Cake Delivery", href: "/cake-delivery" },
    { name: "Cake Decorating Services", href: "/cake-decorating-services" },
    { name: "Cake Photography", href: "/cake-photography" },
    { name: "Cake Preservation", href: "/cake-preservation" },
    { name: "Cake Shipping", href: "/cake-shipping" },
    { name: "Baking Classes", href: "/ukrainian-baking-classes" },
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
    { name: "Best Cakes Leeds", href: "/best-cakes-leeds" },
    { name: "View All Areas", href: "/delivery-areas" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Reviews & Awards", href: "/reviews-awards" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Gallery", href: "/cake-gallery" },
    { name: "Customer Stories", href: "/customer-stories" },
    { name: "Ukrainian Community", href: "/ukrainian-community-leeds" },
    { name: "Charity Events", href: "/charity-events" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Allergen Info", href: "/allergen-information" },
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
  address: "Based in Allerton Grange, Leeds LS17",
  social: [
    {
      name: "Instagram",
      icon: InstagramIcon,
      href: "https://www.instagram.com/olgish_cakes/",
      hoverColor: "#E1306C",
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      href: "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
      hoverColor: "#1877F2",
    },
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      href: `https://wa.me/447867218194`,
      hoverColor: "#25D366",
    },
  ],
};

const trustSignals = [
  { icon: StarIcon, text: "5-Star Rated", color: (theme: any) => theme.palette.secondary.main },
  { icon: VerifiedIcon, text: "Verified Business", color: "#4CAF50" },
  { icon: LocalShippingIcon, text: "Free Delivery", color: "#2196F3" },
  { icon: SecurityIcon, text: "Secure Orders", color: "#9C27B0" },
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
      role="contentinfo"
      aria-label="Site footer"
      sx={{
        backgroundColor: colors.background.paper,
        borderTop: `1px solid ${colors.border.light}`,
      }}
    >
      <DesignContainer>
        {/* Main Footer Content */}
        <Box sx={{ py: spacing["4xl"] }}>
          <Grid container spacing={6} aria-label="Footer links">
            {/* Brand Column */}
            <Grid item xs={12} md={4} aria-label="Footer brand info">
              <Box sx={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
                <Link href="/" style={{ textDecoration: "none" }} aria-label="Olgish Cakes - Home">
                  <Image
                    src="/images/olgish-cakes-logo-bakery-brand.png"
                    alt="Olgish Cakes - #1 Ukrainian Bakery Leeds | Traditional Honey Cake (Medovik), Kyiv Cake, Wedding Cakes, Birthday Cakes, Custom Cakes | Authentic Ukrainian Desserts Yorkshire"
                    width={200}
                    height={85}
                    style={{
                      height: "auto",
                      maxHeight: "85px",
                      width: "auto",
                      maxWidth: "200px",
                      marginBottom: spacing.md,
                    }}
                  />
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
                    <EmailIcon sx={{ color: colors.text.secondary, fontSize: 18 }} />
                    <BodyText
                      sx={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}
                    >
                      <Link
                        href="mailto:hello@olgishcakes.co.uk"
                        style={{ textDecoration: "none" }}
                        aria-label={`Email us at ${contactInfo.email}`}
                      >
                        {contactInfo.email}
                      </Link>
                    </BodyText>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                    <PhoneIcon sx={{ color: colors.text.secondary, fontSize: 18 }} />
                    <BodyText
                      sx={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}
                    >
                      <Link
                        href="tel:+447867218194"
                        aria-label={`Call us at ${contactInfo.phone}`}
                        title={`Call us at ${contactInfo.phone}`}
                      >
                        {contactInfo.phone}
                      </Link>
                    </BodyText>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                    <LocationOnIcon sx={{ color: colors.text.secondary, fontSize: 18 }} />
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
                      <AccessibleIconButton
                        key={social.name}
                        component="a"
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        ariaLabel={`Follow us on ${social.name}`}
                        title={`Follow us on ${social.name}`}
                        sx={{
                          color: colors.text.secondary,
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            color: social.hoverColor,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <social.icon />
                      </AccessibleIconButton>
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
                      <Link
                        key={link.name}
                        href={link.href}
                        style={{ textDecoration: "none" }}
                        aria-label={`Navigate to ${link.name} page`}
                      >
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
                      <Link
                        key={link.name}
                        href={link.href}
                        style={{ textDecoration: "none" }}
                        aria-label={`Navigate to ${link.name} page`}
                      >
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
                      <Link
                        key={link.name}
                        href={link.href}
                        style={{ textDecoration: "none" }}
                        aria-label={`Navigate to ${link.name} page`}
                      >
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
                      <Link
                        key={link.name}
                        href={link.href}
                        style={{ textDecoration: "none" }}
                        aria-label={`Navigate to ${link.name} page`}
                      >
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

        {/* Trust Signals & Social Proof Section */}
        <Box
          sx={{
            py: spacing["2xl"],
            borderTop: `1px solid ${colors.border.light}`,
            background: `linear-gradient(135deg, ${colors.primary.main}04 0%, ${colors.primary.main}02 100%)`,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  mb: spacing.sm,
                  fontSize: { xs: typography.fontSize.lg, md: typography.fontSize.xl },
                }}
              >
                Trusted by 127+ Happy Customers
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: colors.text.secondary,
                  mb: spacing.md,
                  fontSize: typography.fontSize.base,
                  lineHeight: 1.6,
                }}
              >
                Join our community of satisfied customers who choose Olgish Cakes for their special
                occasions. Authentic Ukrainian baking with 5★ rating and same-day delivery across
                Yorkshire.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                <Chip
                  label="⭐ 5★ Rating"
                  sx={{
                    backgroundColor: colors.secondary.main,
                    color: "white",
                    fontWeight: typography.fontWeight.bold,
                    fontSize: typography.fontSize.sm,
                  }}
                />
                <Chip
                  label="🏆 #1 Ukrainian Bakery Leeds"
                  sx={{
                    backgroundColor: colors.primary.main,
                    color: "white",
                    fontWeight: typography.fontWeight.bold,
                    fontSize: typography.fontSize.sm,
                  }}
                />
                <Chip
                  label="🚚 Same-Day Delivery"
                  sx={{
                    backgroundColor: colors.primary.dark,
                    color: "white",
                    fontWeight: typography.fontWeight.bold,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: colors.text.primary,
                    mb: spacing.sm,
                    fontWeight: typography.fontWeight.bold,
                  }}
                >
                  Quick Contact
                </Typography>
                <Link
                  href="tel:+447867218194"
                  style={{ textDecoration: "none" }}
                  aria-label="Call us at +44 786 721 8194"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text.secondary,
                      mb: spacing.sm,
                      fontSize: typography.fontSize.sm,
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      display: "block",
                      "&:hover": {
                        color: colors.primary.main,
                        textDecoration: "underline",
                      },
                    }}
                  >
                    📞 +44 786 721 8194
                  </Typography>
                </Link>
                <Link
                  href="mailto:hello@olgishcakes.co.uk"
                  style={{ textDecoration: "none" }}
                  aria-label="Email us at hello@olgishcakes.co.uk"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text.secondary,
                      mb: spacing.md,
                      fontSize: typography.fontSize.sm,
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      display: "block",
                      "&:hover": {
                        color: colors.primary.main,
                        textDecoration: "underline",
                      },
                    }}
                  >
                    📧 hello@olgishcakes.co.uk
                  </Typography>
                </Link>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.sm,
                    fontStyle: "italic",
                  }}
                >
                  Serving Leeds, York, Bradford, Halifax & surrounding areas
                </Typography>
              </Box>
            </Grid>
          </Grid>
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
                  <Link
                    key={link.name}
                    href={link.href}
                    style={{ textDecoration: "none" }}
                    aria-label={`Navigate to ${link.name}`}
                  >
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
