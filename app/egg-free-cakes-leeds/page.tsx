import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";

import { colors } from "@/lib/design-system";
export const metadata: Metadata = {
  title: "Egg-Free Cakes Leeds £25+ | 5★ | Safe & Delicious",
  description:
    "Egg-free cakes Leeds from £25 | Safe for egg allergies | Ukrainian honey cake | Wedding & birthday cakes | 5★ rated (127+ reviews) | Same-day delivery!",
  keywords:
    "egg-free cakes Leeds, Ukrainian egg-free cakes, egg-free honey cake, egg-free desserts, egg allergy cakes, allergy-friendly cakes Leeds",
  openGraph: {
    title: "Egg-Free Cakes Leeds | Ukrainian Cakes",
    description:
      "Delicious egg-free Ukrainian cakes in Leeds. Handcrafted egg-free honey cake and traditional Ukrainian desserts.",
    url: "https://olgishcakes.co.uk/egg-free-cakes-leeds",
    images: ["https://olgishcakes.co.uk/images/egg-free-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Egg-Free Cakes Leeds | Ukrainian Cakes",
    description:
      "Delicious egg-free Ukrainian cakes in Leeds. Handcrafted egg-free honey cake and traditional Ukrainian desserts.",
    images: ["https://olgishcakes.co.uk/images/egg-free-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/egg-free-cakes-leeds",
  },
};

export default async function EggFreeCakesPage() {
  const cakes = await getAllCakes();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Olgish Cakes - Egg-Free Cakes in Leeds",
    description: "Traditional Ukrainian egg-free cakes in Leeds",
    url: "https://olgishcakes.co.uk/egg-free-cakes-leeds",
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
              color: colors.primary.main,
            }}
          >
            Egg-Free Cakes in Leeds
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
            Delicious Ukrainian cakes made without eggs. Perfect for those with egg allergies or
            dietary preferences. Same great taste, no eggs needed.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Egg-Free" color="primary" />
            <Chip label="Allergy-Friendly" color="secondary" />
            <Chip label="Traditional Recipes" color="primary" />
            <Chip label="Same Great Taste" color="secondary" />
          </Box>
        </Box>

        {/* Allergy Information */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.primary.main} 100%)`,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            🥚 Egg-Free Baking Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
                Our Egg-Free Promise:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                • All egg-free cakes are made in a dedicated egg-free environment
                <br />
                • We use traditional Ukrainian recipes adapted for egg-free baking
                <br />
                • All ingredients are carefully selected and verified egg-free
                <br />• Cross-contamination prevention protocols in place
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
                Egg Substitutes We Use:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                • Flaxseed meal and water
                <br />
                • Applesauce
                <br />
                • Mashed bananas
                <br />
                • Commercial egg replacers
                <br />• Aquafaba (chickpea water)
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Popular Egg-Free Cakes */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: colors.primary.main,
            }}
          >
            Popular Egg-Free Ukrainian Cakes
          </Typography>
          <Grid container spacing={3}>
            {cakes.slice(0, 6).map(cake => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <CakeCard cake={cake} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Why Choose Our Egg-Free Cakes */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: colors.primary.main,
            }}
          >
            Why Choose Our Egg-Free Cakes?
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Traditional Taste",
                description: "Authentic Ukrainian flavours without compromising on taste",
                icon: "🏺",
              },
              {
                title: "Safe for Allergies",
                description: "Dedicated egg-free baking environment and protocols",
                icon: "🛡️",
              },
              {
                title: "Quality Ingredients",
                description: "Only the finest egg-free ingredients and substitutes",
                icon: "⭐",
              },
              {
                title: "Expert Baking",
                description: "Years of experience in egg-free Ukrainian baking",
                icon: "👩‍🍳",
              },
              {
                title: "Same Texture",
                description: "Achieving the perfect texture without eggs",
                icon: "🥄",
              },
              {
                title: "All Occasions",
                description: "Perfect for birthdays, weddings, and celebrations",
                icon: "🎉",
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
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ mb: 1, color: colors.primary.main }}
                  >
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
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            📋 Egg-Free Cake Ordering Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
                Order Deadlines:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                • Standard Orders: 3 days in advance
                <br />
                • Custom Designs: 5 days in advance
                <br />
                • Large Orders: 1 week in advance
                <br />• Emergency Orders: Call for availability
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
                Special Services:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                • Allergen information provided
                <br />
                • Ingredient lists available
                <br />
                • Cross-contamination prevention
                <br />• Special dietary consultations
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 4, md: 6 },
            background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.primary.main} 100%)`,
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            Order Your Egg-Free Ukrainian Cake Today
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Enjoy the authentic taste of Ukrainian baking without eggs. Perfect for everyone!
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: colors.primary.main,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}>
              Browse Egg-Free Cakes
            </Button>
            </Link>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}>
              Contact Us
            </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </>
  );
}
