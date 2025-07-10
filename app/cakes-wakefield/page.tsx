import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Cakes Wakefield | Ukrainian Cakes Wakefield | Custom Cakes Wakefield | Cake Delivery Wakefield | Olgish Cakes",
  description:
    "Fresh Ukrainian cakes delivered to Wakefield. Custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Professional cake delivery service covering Wakefield and surrounding areas.",
  keywords:
    "cakes Wakefield, Ukrainian cakes Wakefield, custom cakes Wakefield, wedding cakes Wakefield, birthday cakes Wakefield, cake delivery Wakefield, bakery Wakefield, traditional Ukrainian cakes Wakefield",
  openGraph: {
    title:
      "Cakes Wakefield | Ukrainian Cakes Wakefield | Custom Cakes Wakefield | Cake Delivery Wakefield",
    description:
      "Fresh Ukrainian cakes delivered to Wakefield. Custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Professional cake delivery service covering Wakefield and surrounding areas.",
    url: "https://olgish-cakes.vercel.app/cakes-wakefield",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/cakes-wakefield.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Cakes Wakefield - Olgish Cakes Delivery Service",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Cakes Wakefield | Ukrainian Cakes Wakefield | Custom Cakes Wakefield | Cake Delivery Wakefield",
    description:
      "Fresh Ukrainian cakes delivered to Wakefield. Custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts.",
    images: ["https://olgish-cakes.vercel.app/images/cakes-wakefield.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/cakes-wakefield",
  },
};

export default async function CakesWakefieldPage() {
  const allCakes = await getAllCakes();

  return (
    <>
      <Script
        id="cakes-wakefield-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Wakefield Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in Wakefield. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Wakefield and surrounding areas.",
            url: "https://olgish-cakes.vercel.app/cakes-wakefield",
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
            geo: {
              "@type": "GeoCoordinates",
              latitude: "53.6833",
              longitude: "-1.4977",
            },
            openingHours: "Mo-Su 09:00-18:00",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            areaServed: {
              "@type": "City",
              name: "Wakefield",
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
              Fresh Ukrainian Cakes Wakefield
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
              Authentic Ukrainian cakes delivered fresh to Wakefield. From traditional honey cake
              and Kyiv cake to custom celebration cakes, we bring the authentic taste of Ukraine to
              your special occasions in Wakefield.
            </Typography>
            <Chip
              label="Ukrainian Cakes Delivered to Wakefield"
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

          <Box sx={{ mb: 6 }}>
            <Grid container spacing={4}>
              {[
                {
                  title: "Fresh Delivery to Wakefield",
                  description:
                    "All cakes are delivered fresh to Wakefield on the day of your celebration",
                  icon: "🚚",
                },
                {
                  title: "Authentic Ukrainian Flavors",
                  description:
                    "Traditional Ukrainian recipes including honey cake, Kyiv cake, and other authentic Ukrainian desserts",
                  icon: "🇺🇦",
                },
                {
                  title: "Custom Cake Design",
                  description:
                    "Personalized cake design service for weddings, birthdays, and special celebrations in Wakefield",
                  icon: "🎨",
                },
                {
                  title: "Professional Service",
                  description:
                    "Professional cake delivery service with careful handling to ensure your cake arrives in perfect condition",
                  icon: "⭐",
                },
              ].map((service, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="h2" sx={{ mb: 2, fontSize: "3rem" }}>
                      {service.icon}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
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
            {allCakes.length > 6 && (
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
            )}
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
                Cake Delivery to Wakefield
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Areas in Wakefield:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Wakefield City Centre
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Castleford
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Pontefract
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Normanton
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Featherstone
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

          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Ready to Order Your Ukrainian Cake in Wakefield?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
              Contact us to discuss your cake requirements and delivery options
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/contact"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                Order Your Cake
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View Our Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
