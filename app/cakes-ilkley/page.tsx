import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
export const metadata = {
  title: "Cakes Ilkley | Ukrainian Cakes Ilkley | Traditional Ukrainian Cakes | Olgish Cakes",
  description:
    "Traditional Ukrainian cakes in Ilkley. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Ilkley. Order now for special occasions.",
  keywords:
    "cakes Ilkley, Ukrainian cakes Ilkley, honey cake Ilkley, Kyiv cake Ilkley, traditional Ukrainian cakes Ilkley, cake delivery Ilkley",
  openGraph: {
    title: "Cakes Ilkley | Ukrainian Cakes Ilkley",
    description:
      "Traditional Ukrainian cakes in Ilkley. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Ilkley.",
    url: "https://olgishcakes.com/cakes-ilkley",
    images: ["https://olgishcakes.com/images/cakes-ilkley.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes Ilkley | Ukrainian Cakes Ilkley",
    description:
      "Traditional Ukrainian cakes in Ilkley. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Ilkley.",
    images: ["https://olgishcakes.com/images/cakes-ilkley.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/cakes-ilkley",
  },
};

export default function CakesIlkleyPage() {
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
              Cakes Ilkley
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
              Traditional Ukrainian cakes delivered to Ilkley. Handcrafted honey cake, Kyiv cake,
              and authentic Ukrainian desserts made with love in Leeds and delivered fresh to your
              door in Ilkley.
            </Typography>
            <Chip
              label="Traditional Ukrainian Cakes Ilkley"
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
              Order Your Ukrainian Cakes in Ilkley Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Experience authentic Ukrainian cakes in Ilkley. Contact us to place your order and
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
                Order Cakes Ilkley
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
