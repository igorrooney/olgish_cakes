import type { Metadata } from "next";
import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";
export const metadata: Metadata = {
  title: "Cakes Skipton | Ukrainian Cakes Skipton | Traditional Ukrainian Cakes | Olgish Cakes",
  description:
    "Traditional Ukrainian cakes in Skipton. Handcrafted honey cake, Kyiv cake, and real Ukrainian desserts delivered to Skipton. Order now for special occasions.",
  keywords:
    "cakes Skipton, Ukrainian cakes Skipton, honey cake Skipton, Kyiv cake Skipton, traditional Ukrainian cakes Skipton, cake delivery Skipton",
  openGraph: {
    title: "Cakes Skipton | Ukrainian Cakes Skipton",
    description:
      "Traditional Ukrainian cakes in Skipton. Handcrafted honey cake, Kyiv cake, and real Ukrainian desserts delivered to Skipton.",
    url: "https://olgishcakes.co.uk/cakes-skipton",
    images: ["https://olgishcakes.co.uk/images/cakes-skipton.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes Skipton | Ukrainian Cakes Skipton",
    description:
      "Traditional Ukrainian cakes in Skipton. Handcrafted honey cake, Kyiv cake, and real Ukrainian desserts delivered to Skipton.",
    images: ["https://olgishcakes.co.uk/images/cakes-skipton.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-skipton",
  },
};

export default function CakesSkiptonPage() {
  return (
    <>
      <Script
        id="cakes-skipton-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Skipton Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in Skipton. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Skipton and surrounding areas.",
            url: "https://olgishcakes.co.uk/cakes-skipton",
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
            geo: {
              "@type": "GeoCoordinates",
              latitude: "53.9621",
              longitude: "-2.0177",
            },
            openingHours: "Mo-Su 00:00-23:59",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            areaServed: {
              "@type": "City",
              name: "Skipton",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes Skipton" }]} />
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
              Cakes Skipton
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
              Traditional Ukrainian cakes delivered to Skipton. Handcrafted honey cake, Kyiv cake,
              and real Ukrainian desserts made with love in Leeds and delivered fresh to your
              door in Skipton.
            </Typography>
            <Chip
              label="Traditional Ukrainian Cakes Skipton"
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
              variant="h3"
              component="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Order Your Ukrainian Cakes in Skipton Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Experience real Ukrainian cakes in Skipton. Contact me to place your order and
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
                Order Cakes Skipton
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
