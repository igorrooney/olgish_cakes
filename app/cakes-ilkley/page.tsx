import type { Metadata } from "next";
import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";
export const metadata: Metadata = {
  title: "Cakes Ilkley £25+ | 5★ | Ukrainian Bakery Delivery",
  description:
    "★★★★★ Cakes Ilkley from £25 | Ukrainian honey cake & Kyiv cake | Wedding & birthday | Same-day delivery | 127+ reviews | Order fresh Ilkley cakes today!",
  keywords:
    "cakes Ilkley, Ukrainian cakes Ilkley, honey cake Ilkley, Kyiv cake Ilkley, traditional Ukrainian cakes Ilkley, cake delivery Ilkley",
  openGraph: {
    title: "Cakes Ilkley | Ukrainian Cakes",
    description:
      "Traditional Ukrainian cakes in Ilkley. Handcrafted honey cake, Kyiv cake, and real Ukrainian desserts delivered to Ilkley.",
    url: "https://olgishcakes.co.uk/cakes-ilkley",
    images: ["https://olgishcakes.co.uk/images/cakes-ilkley.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes Ilkley | Ukrainian Cakes",
    description:
      "Traditional Ukrainian cakes in Ilkley. Handcrafted honey cake, Kyiv cake, and real Ukrainian desserts delivered to Ilkley.",
    images: ["https://olgishcakes.co.uk/images/cakes-ilkley.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-ilkley",
  },
};

export default function CakesIlkleyPage() {
  return (
    <>
      <Script
        id="cakes-ilkley-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Ilkley Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in Ilkley. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Ilkley and surrounding areas.",
            url: "https://olgishcakes.co.uk/cakes-ilkley",
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
              latitude: "53.9235",
              longitude: "-1.8226",
            },
            openingHours: "Mo-Su 00:00-23:59",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            areaServed: {
              "@type": "City",
              name: "Ilkley",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes Ilkley" }]} />
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
              Cakes Ilkley
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
              Traditional Ukrainian cakes delivered to Ilkley. Handcrafted honey cake, Kyiv cake,
              and real Ukrainian desserts made with love in Leeds and delivered fresh to your
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
              variant="h3"
              component="h3"
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
              Experience real Ukrainian cakes in Ilkley. Contact me to place your order and
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
