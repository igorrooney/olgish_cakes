import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";
export const metadata: Metadata = {
  title: "Anniversary Cakes Leeds | Ukrainian Anniversary Cakes | Olgish Cakes",
  description:
    "Celebrate your anniversary with traditional Ukrainian anniversary cakes in Leeds. Handcrafted anniversary cakes with personalized designs. Order now for anniversary celebrations.",
  keywords:
    "anniversary cakes Leeds, Ukrainian anniversary cakes, anniversary celebration cakes, personalized anniversary cakes, anniversary cake delivery Leeds",
  openGraph: {
    title: "Anniversary Cakes Leeds | Ukrainian Anniversary Cakes",
    description:
      "Celebrate your anniversary with traditional Ukrainian anniversary cakes in Leeds. Handcrafted anniversary cakes with personalized designs.",
    url: "https://olgish-cakes.vercel.app/anniversary-cakes-leeds",
    images: ["https://olgish-cakes.vercel.app/images/anniversary-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anniversary Cakes Leeds | Ukrainian Anniversary Cakes",
    description:
      "Celebrate your anniversary with traditional Ukrainian anniversary cakes in Leeds. Handcrafted anniversary cakes with personalized designs.",
    images: ["https://olgish-cakes.vercel.app/images/anniversary-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/anniversary-cakes-leeds",
  },
};

export default function AnniversaryCakesLeedsPage() {
  return (
    <>
      <Script
        id="anniversary-cakes-leeds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Anniversary Cakes Leeds",
            description:
              "Celebrate your anniversary with traditional Ukrainian anniversary cakes in Leeds. Handcrafted anniversary cakes with personalized designs. Order now for anniversary celebrations.",
            provider: {
              "@type": "Bakery",
              name: "Olgish Cakes",
              url: "https://olgish-cakes.vercel.app",
              telephone: "+44 786 721 8194",
              email: "olgish.cakes@gmail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "107 Harehills Lane",
                addressLocality: "Leeds",
                postalCode: "LS8 4DN",
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
            },
            serviceType: "Anniversary Cake Design",
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Anniversary Cake Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Ukrainian Anniversary Cakes",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Personalized Anniversary Cakes",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Anniversary Cake Delivery",
                  },
                },
              ],
            },
            url: "https://olgish-cakes.vercel.app/anniversary-cakes-leeds",
          }),
        }}
      />

      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Anniversary Cakes Leeds" }]}
            />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "primary.main",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Anniversary Cakes Leeds
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Celebrate your anniversary with traditional Ukrainian anniversary cakes. Handcrafted
              with love in Leeds, our anniversary cakes bring the authentic taste of Ukrainian
              celebrations to your special day.
            </Typography>
            <Chip
              label="Traditional Ukrainian Anniversary Cakes"
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                fontSize: "1.1rem",
                px: 3,
                py: 1,
                mb: 4,
              }}
            />
          </Box>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Order Your Anniversary Cake Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Celebrate your anniversary with authentic Ukrainian anniversary cakes. Contact us to
              place your order and ensure you have the perfect anniversary cake for your
              celebration.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/contact"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Order Anniversary Cake
              </Button>
              <Button
                component={Link}
                href="/custom-cake-design"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Custom Design
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
