import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
export const metadata: Metadata = {
  title: "Graduation Cakes Leeds | Ukrainian Graduation Cakes | Olgish Cakes",
  description:
    "Celebrate graduation with traditional Ukrainian graduation cakes in Leeds. Handcrafted graduation cakes with personalized designs. Order now for graduation celebrations.",
  keywords:
    "graduation cakes Leeds, Ukrainian graduation cakes, graduation celebration cakes, personalized graduation cakes, graduation cake delivery Leeds",
  openGraph: {
    title: "Graduation Cakes Leeds | Ukrainian Graduation Cakes",
    description:
      "Celebrate graduation with traditional Ukrainian graduation cakes in Leeds. Handcrafted graduation cakes with personalized designs.",
    url: "https://olgishcakes.co.uk/graduation-cakes-leeds",
    images: ["https://olgishcakes.co.uk/images/graduation-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Graduation Cakes Leeds | Ukrainian Graduation Cakes",
    description:
      "Celebrate graduation with traditional Ukrainian graduation cakes in Leeds. Handcrafted graduation cakes with personalized designs.",
    images: ["https://olgishcakes.co.uk/images/graduation-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/graduation-cakes-leeds",
  },
};

export default function GraduationCakesLeedsPage() {
  return (
    <>
      <Script
        id="graduation-cakes-leeds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Graduation Cakes Leeds",
            description:
              "Order custom graduation cakes in Leeds. Celebrate academic achievements with Ukrainian cakes.",
            provider: {
              "@type": "Bakery",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
              telephone: "+44 786 721 8194",
              email: "hello@olgishcakes.co.uk",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Allerton Grange",
                addressLocality: "Leeds",
                postalCode: "LS17",
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
            },
            serviceType: "Graduation Cake Design",
            areaServed: { "@type": "City", name: "Leeds" },
            url: "https://olgishcakes.co.uk/graduation-cakes-leeds",
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
              Graduation Cakes Leeds
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Celebrate your graduation with traditional Ukrainian graduation cakes. Handcrafted
              with love in Leeds, our graduation cakes bring the authentic taste of Ukrainian
              celebrations to your special day.
            </Typography>
            <Chip
              label="Traditional Ukrainian Graduation Cakes"
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

          {/* Graduation Cake Varieties */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Our Graduation Cake Collection
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 2,
                    }}
                  >
                    Traditional Honey Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Classic Ukrainian honey cake with graduation-themed decorations. Perfect for
                    celebrating academic achievements with traditional flavors.
                  </Typography>
                  <Chip
                    label="Traditional Recipe"
                    sx={{ backgroundColor: "primary.main", color: "white" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 2,
                    }}
                  >
                    Kyiv Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Elegant Kyiv cake with hazelnut meringue layers and chocolate ganache. A
                    sophisticated choice for graduation celebrations.
                  </Typography>
                  <Chip
                    label="Premium Choice"
                    sx={{ backgroundColor: "primary.main", color: "white" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 2,
                    }}
                  >
                    Custom Graduation Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Personalized graduation cake with your name, degree, and custom decorations.
                    Made to your specifications and preferences.
                  </Typography>
                  <Chip
                    label="Personalized Design"
                    sx={{ backgroundColor: "primary.main", color: "white" }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Order Your Graduation Cake Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Celebrate your graduation with authentic Ukrainian graduation cakes. Contact us to
              place your order and ensure you have the perfect graduation cake for your celebration.
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
                Order Graduation Cake
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
