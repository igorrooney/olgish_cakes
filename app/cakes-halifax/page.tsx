import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cakes Halifax | Ukrainian Cakes Halifax | Traditional Ukrainian Cakes | Olgish Cakes",
  description:
    "Traditional Ukrainian cakes in Halifax. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Halifax. Order now for special occasions.",
  keywords:
    "cakes Halifax, Ukrainian cakes Halifax, honey cake Halifax, Kyiv cake Halifax, traditional Ukrainian cakes Halifax, cake delivery Halifax",
  openGraph: {
    title: "Cakes Halifax | Ukrainian Cakes Halifax",
    description:
      "Traditional Ukrainian cakes in Halifax. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Halifax.",
    url: "https://olgishcakes.co.uk/cakes-halifax",
    images: ["https://olgishcakes.co.uk/images/cakes-halifax.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes Halifax | Ukrainian Cakes Halifax",
    description:
      "Traditional Ukrainian cakes in Halifax. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Halifax.",
    images: ["https://olgishcakes.co.uk/images/cakes-halifax.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-halifax",
  },
};

export default async function CakesHalifaxPage() {
  const allCakes = await getAllCakes();

  return (
    <>
      <Script
        id="cakes-halifax-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Halifax Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in Halifax. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Halifax and surrounding areas.",
            url: "https://olgishcakes.co.uk/cakes-halifax",
            telephone: "+44 786 721 8194",
            email: "olgish.cakes@gmail.com",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Allerton Grange",
              addressLocality: "Leeds",
              postalCode: "LS17",
              addressRegion: "West Yorkshire",
              addressCountry: "GB",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: "53.7224",
              longitude: "-1.8577",
            },
            openingHours: "Mo-Su 09:00-18:00",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            areaServed: {
              "@type": "City",
              name: "Halifax",
            },
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes Halifax" }]} />
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
              Cakes Halifax
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
              Traditional Ukrainian cakes delivered to Halifax. Handcrafted honey cake, Kyiv cake,
              and authentic Ukrainian desserts made with love in Leeds and delivered fresh to your
              door in Halifax.
            </Typography>
            <Chip
              label="Traditional Ukrainian Cakes Halifax"
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
              Order Your Ukrainian Cakes in Halifax Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Experience authentic Ukrainian cakes in Halifax. Contact us to place your order and
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
                Order Cakes Halifax
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

          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Our Ukrainian Cake Collection
            </Typography>
            <Grid container spacing={4}>
              {allCakes.slice(0, 6).map(cake => (
                <Grid item xs={12} sm={6} md={4} key={cake._id}>
                  <CakeCard cake={cake} />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
              >
                View All Cakes
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
                Cake Delivery to Halifax
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Areas in Halifax:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Halifax Town Centre
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Sowerby Bridge
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Elland
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Brighouse
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Hebden Bridge
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • And surrounding areas
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Information:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Delivery Fee: £15-20
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Delivery Time: 1-2 hours
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Order Lead Time: 3-5 days
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Fresh delivery on celebration day
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  );
}
