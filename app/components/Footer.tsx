"use client";

import { Container, Grid, Typography, IconButton, Button, Box, Divider } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, WhatsApp, Email, Phone } from "@mui/icons-material";

const footerLinks = {
  products: [
    { name: "All Cakes", href: "/cakes" },
    { name: "Custom Orders", href: "/cakes/custom" },
    { name: "Wedding Cakes", href: "/cakes/wedding" },
    { name: "Birthday Cakes", href: "/cakes/birthday" },
  ],
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
    <footer className="bg-white border-t border-gray-100">
      <Container>
        {/* Main Footer Content */}
        <div className="py-16">
          <Grid container spacing={8}>
            {/* Brand Column */}
            <Grid item xs={12} md={4}>
              <div className="space-y-6">
                <Link href="/" className="inline-block">
                  <Typography variant="h6" className="text-2xl font-bold text-gray-900">
                    Olgish Cakes
                  </Typography>
                </Link>
                <Typography variant="body2" className="text-gray-600 max-w-sm">
                  Handcrafted Ukrainian cakes made with love in Leeds. Traditional recipes, premium
                  ingredients, and exceptional taste.
                </Typography>
                <div className="flex gap-4">
                  {contactInfo.social.map(social => (
                    <IconButton
                      key={social.name}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-primary transition-colors"
                      size="small"
                      sx={{ "&:hover": { color: social.hoverColor } }}
                    >
                      <social.icon />
                    </IconButton>
                  ))}
                </div>
              </div>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle2" className="font-bold text-gray-900 mb-6">
                Products
              </Typography>
              <ul className="space-y-4">
                {footerLinks.products.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle2" className="font-bold text-gray-900 mb-6">
                Company
              </Typography>
              <ul className="space-y-4">
                {footerLinks.company.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Grid>

            {/* Contact Column */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" className="font-bold text-gray-900 mb-6">
                Contact Us
              </Typography>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="text-gray-400" />
                  <Link
                    href={`tel:${contactInfo.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {contactInfo.phone}
                  </Link>
                  <IconButton
                    component="a"
                    href={`https://wa.me/${contactInfo.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{ color: "#25D366" }}
                  >
                    <WhatsApp />
                  </IconButton>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Email className="text-gray-400" />
                  <Link
                    href={`mailto:${contactInfo.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {contactInfo.email}
                  </Link>
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  href="/contact"
                  className="mt-4"
                >
                  Get in Touch
                </Button>
              </div>
            </Grid>
          </Grid>
        </div>

        <Divider />

        {/* Bottom Bar */}
        <div className="py-8">
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md="auto">
              <Typography variant="body2" className="text-gray-600 text-center md:text-left">
                © {currentYear} Olgish Cakes. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={12} md="auto">
              <ul className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-2">
                {footerLinks.legal.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Grid>
          </Grid>
        </div>
      </Container>
    </footer>
  );
}
