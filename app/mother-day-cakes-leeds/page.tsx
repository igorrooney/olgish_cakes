import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mother's Day Cakes Leeds | Ukrainian Mother's Day Cakes | Olgish Cakes",
  description:
    "Beautiful Ukrainian Mother's Day cakes in Leeds. Handcrafted honey cake, Kyiv cake, and special Mother's Day designs. Order now for the perfect celebration.",
  keywords:
    "Mother's Day cakes Leeds, Ukrainian Mother's Day cakes, honey cake Mother's Day, special occasion cakes Leeds, Mother's Day delivery Leeds",
  openGraph: {
    title: "Mother's Day Cakes Leeds | Ukrainian Mother's Day Cakes",
    description:
      "Beautiful Ukrainian Mother's Day cakes in Leeds. Handcrafted honey cake, Kyiv cake, and special Mother's Day designs.",
    url: "https://olgishcakes.co.uk/mother-day-cakes-leeds",
    images: ["https://olgishcakes.co.uk/images/mothers-day-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mother's Day Cakes Leeds | Ukrainian Mother's Day Cakes",
    description:
      "Beautiful Ukrainian Mother's Day cakes in Leeds. Handcrafted honey cake, Kyiv cake, and special Mother's Day designs.",
    images: ["https://olgishcakes.co.uk/images/mothers-day-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/mother-day-cakes-leeds",
  },
};

export default async function MothersDayCakesPage() {
  const cakes = await getAllCakes();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Olgish Cakes - Mother's Day Cakes in Leeds",
    description: "Traditional Ukrainian Mother's Day cakes in Leeds",
    url: "https://olgishcakes.co.uk/mother-day-cakes-leeds",
    telephone: "+44 786 721 8194",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Leeds",
      addressRegion: "West Yorkshire",
      addressCountry: "GB",
    },
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
    servesCuisine: "Ukrainian",
    priceRange: "££",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: "bold",
              mb: 2,
              color: "#005BBB",
            }}
          >
            Mother's Day Cakes in Leeds
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "text.secondary",
              mb: 3,
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            Show your love with our beautiful Ukrainian Mother's Day cakes. Handcrafted with love
            and traditional recipes.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Special Designs" color="primary" />
            <Chip label="Traditional Recipes" color="secondary" />
            <Chip label="Same Day Delivery" color="primary" />
            <Chip label="Personalized" color="secondary" />
          </Box>
        </Box>

        {/* Special Mother's Day Offer */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #FFD700 0%, #FF69B4 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            🌸 Special Mother's Day Offer 🌸
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: "1.5rem", md: "2rem" } }}>
            15% Off All Mother's Day Cakes
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Order by March 8th for guaranteed delivery on Mother's Day weekend
          </Typography>
          <Button
            component={Link}
            href="/cakes"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "white",
              color: "#FF69B4",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            Order Now
          </Button>
        </Paper>

        {/* Popular Mother's Day Cakes */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: "#005BBB",
            }}
          >
            Perfect Mother's Day Cakes
          </Typography>
          <Grid container spacing={3}>
            {cakes.slice(0, 6).map(cake => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <CakeCard cake={cake} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mother's Day Special Features */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: "#005BBB",
            }}
          >
            Why Choose Our Mother's Day Cakes?
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Beautiful Designs",
                description: "Special Mother's Day decorations and floral designs",
                icon: "🌺",
              },
              {
                title: "Personalized Messages",
                description: "Add a special message or name to your cake",
                icon: "💝",
              },
              {
                title: "Traditional Flavors",
                description: "Authentic Ukrainian honey cake and Kyiv cake",
                icon: "🍯",
              },
              {
                title: "Fresh Ingredients",
                description: "Made with the finest ingredients and lots of love",
                icon: "❤️",
              },
              {
                title: "Reliable Delivery",
                description: "On-time delivery to make Mother's Day special",
                icon: "🎁",
              },
              {
                title: "Special Packaging",
                description: "Beautiful presentation for the perfect gift",
                icon: "🎀",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {feature.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, color: "#005BBB" }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Ordering Information */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            📅 Mother's Day Ordering Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Order Deadlines:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                • Standard Delivery: Order by March 8th
                <br />
                • Express Delivery: Order by March 9th
                <br />• Same Day Delivery: Available until 2 PM on Mother's Day
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Special Services:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                • Personalized cake toppers
                <br />
                • Special Mother's Day packaging
                <br />
                • Gift cards available
                <br />• Surprise delivery options
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #FF69B4 0%, #FFD700 100%)",
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            Make Mother's Day Special
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Order your beautiful Ukrainian Mother's Day cake today and show your love with tradition
            and taste
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/cakes"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#FF69B4",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              Browse Mother's Day Cakes
            </Button>
            <Button
              component={Link}
              href="/contact"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Contact Us
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
