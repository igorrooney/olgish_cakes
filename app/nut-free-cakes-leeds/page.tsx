import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
export const metadata = {
  title: "Nut-Free Cakes Leeds | Ukrainian Nut-Free Cakes | Olgish Cakes",
  description:
    "Delicious nut-free Ukrainian cakes in Leeds. Handcrafted nut-free honey cake, Kyiv cake, and traditional Ukrainian desserts. Perfect for nut allergies.",
  keywords:
    "nut-free cakes Leeds, Ukrainian nut-free cakes, nut-free honey cake, nut-free desserts, nut allergy cakes, allergy-friendly cakes Leeds",
  openGraph: {
    title: "Nut-Free Cakes Leeds | Ukrainian Nut-Free Cakes",
    description:
      "Delicious nut-free Ukrainian cakes in Leeds. Handcrafted nut-free honey cake and traditional Ukrainian desserts.",
    url: "https://olgishcakes.com/nut-free-cakes-leeds",
    images: ["https://olgishcakes.com/images/nut-free-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nut-Free Cakes Leeds | Ukrainian Nut-Free Cakes",
    description:
      "Delicious nut-free Ukrainian cakes in Leeds. Handcrafted nut-free honey cake and traditional Ukrainian desserts.",
    images: ["https://olgishcakes.com/images/nut-free-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/nut-free-cakes-leeds",
  },
};

export default function NutFreeCakesLeedsPage() {
  return (
    <>
      

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
              Nut-Free Cakes Leeds
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
              Delicious nut-free Ukrainian cakes made with love in Leeds. Our nut-free honey cake,
              Kyiv cake, and traditional Ukrainian desserts are perfect for those with nut allergies
              or following a nut-free diet.
            </Typography>
            <Chip
              label="Traditional Ukrainian Nut-Free Cakes"
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
              Order Your Nut-Free Cake Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Enjoy delicious nut-free Ukrainian cakes. Contact us to place your order and ensure
              you have the perfect nut-free cake for your celebration.
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
                Order Nut-Free Cake
              </Button>
              <Button
                component={Link}
                href="/allergen-information"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Allergen Information
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
