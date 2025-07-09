import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
export const metadata = {
  title: "Cake Tasting Sessions Leeds | Ukrainian Cake Tasting | Olgish Cakes",
  description:
    "Book a cake tasting session in Leeds. Sample traditional Ukrainian cakes including honey cake and Kyiv cake. Perfect for wedding cake selection and special occasions.",
  keywords:
    "cake tasting sessions Leeds, Ukrainian cake tasting, wedding cake tasting, honey cake tasting, cake sampling Leeds",
  openGraph: {
    title: "Cake Tasting Sessions Leeds | Ukrainian Cake Tasting",
    description:
      "Book a cake tasting session in Leeds. Sample traditional Ukrainian cakes including honey cake and Kyiv cake.",
    url: "https://olgishcakes.com/cake-tasting-sessions",
    images: ["https://olgishcakes.com/images/cake-tasting-sessions.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Tasting Sessions Leeds | Ukrainian Cake Tasting",
    description:
      "Book a cake tasting session in Leeds. Sample traditional Ukrainian cakes including honey cake and Kyiv cake.",
    images: ["https://olgishcakes.com/images/cake-tasting-sessions.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/cake-tasting-sessions",
  },
};

export default function CakeTastingSessionsPage() {
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
              Cake Tasting Sessions Leeds
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
              Experience the authentic taste of Ukrainian cakes with our cake tasting sessions.
              Sample traditional honey cake, Kyiv cake, and other Ukrainian desserts in a relaxed,
              personalized setting.
            </Typography>
            <Chip
              label="Traditional Ukrainian Cake Tasting"
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
              Book Your Cake Tasting Session Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Experience the authentic taste of Ukrainian cakes. Contact us to book your
              personalized cake tasting session.
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
                Book Tasting Session
              </Button>
              <Button
                component={Link}
                href="/wedding-cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View Wedding Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
