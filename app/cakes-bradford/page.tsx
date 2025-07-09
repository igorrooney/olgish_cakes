import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cakes Bradford | Ukrainian Cakes Bradford | Traditional Ukrainian Cakes | Olgish Cakes",
  description:
    "Traditional Ukrainian cakes in Bradford. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Bradford. Order now for special occasions.",
  keywords:
    "cakes Bradford, Ukrainian cakes Bradford, honey cake Bradford, Kyiv cake Bradford, traditional Ukrainian cakes Bradford, cake delivery Bradford",
  openGraph: {
    title: "Cakes Bradford | Ukrainian Cakes Bradford",
    description:
      "Traditional Ukrainian cakes in Bradford. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Bradford.",
    url: "https://olgishcakes.com/cakes-bradford",
    images: ["https://olgishcakes.com/images/cakes-bradford.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes Bradford | Ukrainian Cakes Bradford",
    description:
      "Traditional Ukrainian cakes in Bradford. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Bradford.",
    images: ["https://olgishcakes.com/images/cakes-bradford.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/cakes-bradford",
  },
};

export default async function CakesBradfordPage() {
  const allCakes = await getAllCakes();

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
              Cakes Bradford
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
              Traditional Ukrainian cakes delivered to Bradford. Handcrafted honey cake, Kyiv cake,
              and authentic Ukrainian desserts made with love in Leeds and delivered fresh to your
              door in Bradford.
            </Typography>
            <Chip
              label="Traditional Ukrainian Cakes Bradford"
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
              Order Your Ukrainian Cakes in Bradford Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Experience authentic Ukrainian cakes in Bradford. Contact us to place your order and
              enjoy traditional Ukrainian flavors delivered to your door.
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
                Order Cakes Bradford
              </Button>
              <Button
                component={Link}
                href="/delivery-areas"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View All Delivery Areas
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
