import type { Metadata } from "next";
import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";
export const metadata: Metadata = {
  title: "Cakes Otley £25+ | 5★ | Ukrainian Bakery Delivery",
  description:
    "Cakes Otley from £25 | Traditional Ukrainian honey cake | Wedding & birthday cakes | 5★ rated (127+ reviews) | Same-day delivery | Order fresh Otley cakes!",
  keywords:
    "cakes Otley, Ukrainian cakes Otley, honey cake Otley, Kyiv cake Otley, traditional Ukrainian cakes Otley, cake delivery Otley",
  openGraph: {
    title: "Cakes Otley | Ukrainian Cakes",
    description:
      "Traditional Ukrainian cakes in Otley. Handcrafted honey cake, Kyiv cake, and real Ukrainian desserts delivered to Otley.",
    url: "https://olgishcakes.co.uk/cakes-otley",
    images: ["https://olgishcakes.co.uk/images/cakes-otley.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes Otley | Ukrainian Cakes",
    description:
      "Traditional Ukrainian cakes in Otley. Handcrafted honey cake, Kyiv cake, and real Ukrainian desserts delivered to Otley.",
    images: ["https://olgishcakes.co.uk/images/cakes-otley.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-otley",
  },
};

export default function CakesOtleyPage() {
  return (
    <>
      <Script
        id="cakes-otley-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Otley Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in Otley. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Otley and surrounding areas.",
            url: "https://olgishcakes.co.uk/cakes-otley",
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
              latitude: "53.9050",
              longitude: "-1.6936",
            },
            openingHours: "Mo-Su 00:00-23:59",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            areaServed: {
              "@type": "City",
              name: "Otley",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes Otley" }]} />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "primary.main",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Cakes Otley
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
              Traditional Ukrainian cakes delivered to Otley. Handcrafted honey cake, Kyiv cake, and
              real Ukrainian desserts made with love in Leeds and delivered fresh to your door
              in Otley.
            </Typography>
            <Chip
              label="Traditional Ukrainian Cakes Otley"
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
                fontFamily: "var(--font-alice)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Order Your Ukrainian Cakes in Otley Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Experience real Ukrainian cakes in Otley. Contact me to place your order and
              enjoy traditional Ukrainian flavors delivered to your door.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}>
                Order Cakes Otley
              </Button>
            </Link>
              <Link href="/delivery-areas" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}>
                View All Delivery Areas
              </Button>
            </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
