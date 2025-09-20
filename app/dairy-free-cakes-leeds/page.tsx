import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Dairy-Free Cakes Leeds | Ukrainian Cakes",
  description:
    "Delicious dairy-free Ukrainian cakes in Leeds. Handcrafted dairy-free honey cake, Kyiv cake, and traditional Ukrainian desserts. Perfect for dairy allergies and vegan diets.",
  keywords:
    "dairy-free cakes Leeds, Ukrainian dairy-free cakes, dairy-free honey cake, dairy-free desserts, dairy allergy cakes, vegan cakes Leeds",
  openGraph: {
    title: "Dairy-Free Cakes Leeds | Ukrainian Cakes",
    description:
      "Delicious dairy-free Ukrainian cakes in Leeds. Handcrafted dairy-free honey cake and traditional Ukrainian desserts.",
    url: "https://olgishcakes.co.uk/dairy-free-cakes-leeds",
    images: ["https://olgishcakes.co.uk/images/dairy-free-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dairy-Free Cakes Leeds | Ukrainian Cakes",
    description:
      "Delicious dairy-free Ukrainian cakes in Leeds. Handcrafted dairy-free honey cake and traditional Ukrainian desserts.",
    images: ["https://olgishcakes.co.uk/images/dairy-free-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/dairy-free-cakes-leeds",
  },
};

export default async function DairyFreeCakesLeedsPage() {
  const allCakes = await getAllCakes();

  return (
    <>
      <Script
        id="dairy-free-cakes-leeds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Dairy-Free Cakes Leeds",
            description:
              "Order dairy-free Ukrainian cakes in Leeds. Custom cakes for dietary needs.",
            provider: {
              "@type": "Bakery",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
            },
            serviceType: "Dairy-Free Cake Design",
            areaServed: { "@type": "City", name: "Leeds" },
            url: "https://olgishcakes.co.uk/dairy-free-cakes-leeds",
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
              Dairy-Free Cakes Leeds
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
              Delicious dairy-free Ukrainian cakes made with love in Leeds. Our dairy-free honey
              cake, Kyiv cake, and traditional Ukrainian desserts are perfect for those with dairy
              allergies or following a dairy-free diet.
            </Typography>
            <Chip
              label="Traditional Ukrainian Dairy-Free Cakes"
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
                  title: "Dairy-Free Honey Cake",
                  description:
                    "Traditional honey cake made without dairy, using plant-based alternatives for the same authentic taste",
                  icon: "🍯",
                },
                {
                  title: "Vegan Kyiv Cake",
                  description:
                    "Dairy-free version of the legendary Kyiv cake with plant-based cream and chocolate",
                  icon: "🇺🇦",
                },
                {
                  title: "Lactose-Free Options",
                  description:
                    "Perfect for those with lactose intolerance, using lactose-free alternatives",
                  icon: "🥛",
                },
                {
                  title: "Custom Dairy-Free Cakes",
                  description:
                    "Personalized dairy-free cakes for weddings, birthdays, and special celebrations",
                  icon: "🎨",
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
                    <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                      {service.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
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
              Our Dairy-Free Cake Collection
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
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  fontWeight: 600,
                  color: "primary.main",
                  mb: 4,
                  textAlign: "center",
                }}
              >
                Dairy-Free Alternatives We Use
              </Typography>
              <Grid container spacing={4}>
                {[
                  {
                    alternative: "Plant-Based Milk",
                    description:
                      "Almond milk, oat milk, and coconut milk for rich, creamy textures",
                    benefits: "Naturally dairy-free and often more nutritious",
                  },
                  {
                    alternative: "Coconut Cream",
                    description: "Perfect replacement for heavy cream in frostings and fillings",
                    benefits: "Rich, creamy texture with natural sweetness",
                  },
                  {
                    alternative: "Vegan Butter",
                    description: "Plant-based butter alternatives for baking and frosting",
                    benefits: "Same functionality as dairy butter",
                  },
                  {
                    alternative: "Cashew Cream",
                    description: "Blended cashews create smooth, creamy fillings",
                    benefits: "High in protein and naturally dairy-free",
                  },
                ].map((alt, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        component="h3"
                        sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                      >
                        {alt.alternative}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                        {alt.description}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                        {alt.benefits}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Why Choose Our Dairy-Free Cakes?
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Grid container spacing={3}>
                {[
                  "Authentic Ukrainian flavors without dairy ingredients",
                  "Suitable for lactose intolerance and dairy allergies",
                  "Perfect for vegan and plant-based diets",
                  "Same beautiful designs and quality as our regular cakes",
                  "Custom dairy-free cakes for any special occasion",
                  "Professional consultation for dietary requirements",
                ].map((benefit, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "primary.main",
                          mr: 2,
                        }}
                      />
                      <Typography variant="body1">{benefit}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
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
              Order Your Dairy-Free Cake Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Enjoy delicious dairy-free Ukrainian cakes. Contact us to place your order and ensure
              you have the perfect dairy-free cake for your celebration.
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
                Order Dairy-Free Cake
              </Button>
              <Button
                component={Link}
                href="/vegan-cakes-leeds"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View Vegan Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
