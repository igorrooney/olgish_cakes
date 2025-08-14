import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";


import { colors } from "@/lib/design-system";
export const metadata: Metadata = {
  title:
    "Gluten-Friendly Wedding Cakes Leeds | Ukrainian Gluten-Friendly Wedding Cakes | Olgish Cakes",
  description:
    "Beautiful gluten-friendly Ukrainian wedding cakes in Leeds. Handcrafted gluten-friendly honey cake, Kyiv cake, and traditional Ukrainian wedding desserts.",
  keywords:
    "gluten-friendly wedding cakes Leeds, Ukrainian gluten-friendly wedding cakes, gluten-friendly honey cake, gluten-friendly wedding desserts",
  openGraph: {
    title: "Gluten-Friendly Wedding Cakes Leeds | Ukrainian Gluten-Friendly Wedding Cakes",
    description:
      "Beautiful gluten-friendly Ukrainian wedding cakes in Leeds. Handcrafted gluten-friendly honey cake and traditional Ukrainian wedding desserts.",
    url: "https://olgishcakes.co.uk/gluten-friendly-wedding-cakes-leeds",
    images: ["https://olgishcakes.co.uk/images/gluten-friendly-wedding-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gluten-Friendly Wedding Cakes Leeds | Ukrainian Gluten-Friendly Wedding Cakes",
    description:
      "Beautiful gluten-friendly Ukrainian wedding cakes in Leeds. Handcrafted gluten-friendly honey cake and traditional Ukrainian wedding desserts.",
    images: ["https://olgishcakes.co.uk/images/gluten-friendly-wedding-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/gluten-friendly-wedding-cakes-leeds",
  },
};

export default async function GlutenFriendlyWeddingCakesPage() {
  const cakes = await getAllCakes();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Olgish Cakes - Gluten-Friendly Wedding Cakes in Leeds",
    description: "Traditional Ukrainian gluten-friendly wedding cakes in Leeds",
    url: "https://olgishcakes.co.uk/gluten-friendly-wedding-cakes-leeds",
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
            Gluten-Friendly Wedding Cakes in Leeds
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
            Beautiful gluten-friendly Ukrainian wedding cakes that everyone can enjoy. Perfect for
            your special day without compromising on taste or tradition.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Gluten-Friendly" color="primary" />
            <Chip label="Wedding Perfect" color="secondary" />
            <Chip label="Traditional Recipes" color="primary" />
            <Chip label="Beautiful Designs" color="secondary" />
          </Box>
        </Box>

        {/* Gluten-Friendly Special */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.primary.main} 100%)`,
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            🌾 Special Gluten-Friendly Wedding Package
          </Typography>
          <Typography
            variant="h3"
            component="h3"
            sx={{ mb: 2, fontSize: { xs: "1.5rem", md: "2rem" } }}
          >
            Free Gluten-Friendly Cake Tasting Session
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Book your gluten-friendly wedding cake consultation and sample our delicious Ukrainian
            cakes
          </Typography>
          <Button
            component={Link}
            href="/cake-tasting-sessions"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "white",
              color: colors.primary.main,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            Book Tasting Session
          </Button>
        </Paper>

        {/* Popular Gluten-Friendly Wedding Cakes */}
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
            Beautiful Gluten-Friendly Wedding Cakes
          </Typography>
          <Grid container spacing={3}>
            {cakes.slice(0, 6).map(cake => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <CakeCard cake={cake} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Why Choose Our Gluten-Friendly Wedding Cakes */}
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
            Why Choose Our Gluten-Friendly Wedding Cakes?
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Gluten-Friendly",
                description: "Made with gluten-friendly ingredients and careful preparation",
                icon: "🌾",
              },
              {
                title: "Wedding Perfect",
                description: "Stunning designs perfect for your special day",
                icon: "💒",
              },
              {
                title: "Traditional Taste",
                description: "Authentic Ukrainian flavors adapted for gluten-friendly diets",
                icon: "🏺",
              },
              {
                title: "Quality Ingredients",
                description: "Only the finest gluten-friendly ingredients",
                icon: "⭐",
              },
              {
                title: "Custom Designs",
                description: "Personalized to match your wedding theme",
                icon: "🎨",
              },
              {
                title: "Expert Baking",
                description: "Years of experience in gluten-friendly Ukrainian baking",
                icon: "👩‍🍳",
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
                    variant="h3"
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

        {/* Gluten-Friendly Ingredients */}
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
            🌾 Our Gluten-Friendly Ingredients
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
                Gluten-Friendly Flours:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                • Almond flour and coconut flour
                <br />
                • Rice flour and tapioca flour
                <br />
                • Gluten-free oat flour
                <br />
                • Buckwheat flour
                <br />• Certified gluten-free flour blends
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
                Quality Guarantee:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                • Certified gluten-friendly ingredients
                <br />
                • Dedicated gluten-friendly preparation area
                <br />
                • Cross-contamination prevention
                <br />
                • Same great taste and texture
                <br />• Safe for gluten sensitivities
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Ordering Information */}
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
            📋 Gluten-Friendly Wedding Cake Ordering
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography
                  variant="h3"
                  component="h3"
                  sx={{ mb: 2, color: colors.primary.main }}
                >
                  Order Deadlines:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Standard Orders: 4 weeks in advance
                  <br />
                  • Custom Designs: 6 weeks in advance
                  <br />
                  • Large Wedding Cakes: 8 weeks in advance
                  <br />• Last-minute Orders: Call for availability
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography
                  variant="h3"
                  component="h3"
                  sx={{ mb: 2, color: colors.primary.main }}
                >
                  Special Services:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Free gluten-friendly cake tasting session
                  <br />
                  • Custom gluten-friendly cake designs
                  <br />
                  • Wedding venue delivery and setup
                  <br />• Gluten-friendly ingredient lists provided
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

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
            Make Your Gluten-Friendly Wedding Special
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Order your beautiful gluten-friendly Ukrainian wedding cake and celebrate your special
            day with tradition and taste
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/wedding-cakes"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: colors.primary.main,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              Browse Wedding Cakes
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
              Plan Your Wedding Cake
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
