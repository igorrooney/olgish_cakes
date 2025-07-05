import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";
import { Button } from "@mui/material";

export const metadata: Metadata = {
  title: "Traditional Ukrainian Cakes Leeds | Authentic Ukrainian Desserts | Olgish Cakes",
  description:
    "Discover authentic traditional Ukrainian cakes in Leeds. Handcrafted honey cake, Kyiv cake, Napoleon, and more using time-honored Ukrainian recipes. Order authentic Ukrainian desserts.",
  keywords:
    "traditional Ukrainian cakes Leeds, authentic Ukrainian desserts, honey cake Leeds, Kyiv cake Leeds, Ukrainian honey cake, traditional Ukrainian baking, Ukrainian cake recipes, authentic Ukrainian sweets",
  openGraph: {
    title: "Traditional Ukrainian Cakes Leeds | Authentic Ukrainian Desserts",
    description:
      "Discover authentic traditional Ukrainian cakes in Leeds. Handcrafted honey cake, Kyiv cake, Napoleon, and more using time-honored Ukrainian recipes.",
    url: "https://olgish-cakes.vercel.app/traditional-ukrainian-cakes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/traditional-ukrainian-cakes.jpg",
        width: 1200,
        height: 630,
        alt: "Traditional Ukrainian Cakes Collection - Olgish Cakes Leeds",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traditional Ukrainian Cakes Leeds | Authentic Ukrainian Desserts",
    description:
      "Discover authentic traditional Ukrainian cakes in Leeds. Handcrafted honey cake, Kyiv cake, Napoleon, and more using time-honored Ukrainian recipes.",
    images: ["https://olgish-cakes.vercel.app/images/traditional-ukrainian-cakes.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/traditional-ukrainian-cakes",
  },
};

export default async function TraditionalUkrainianCakesPage() {
  const allCakes = await getAllCakes();
  const traditionalCakes = allCakes.filter(cake => cake.category === "traditional");

  return (
    <>
      <StructuredData />

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
              Traditional Ukrainian Cakes
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
              Experience the authentic taste of Ukraine with our handcrafted traditional cakes. Each
              recipe has been passed down through generations, bringing the warmth and tradition of
              Ukrainian baking to Leeds.
            </Typography>
            <Chip
              label="Authentic Ukrainian Recipes"
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

          {/* Traditional Cake Features */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Time-Honored Recipes",
                description:
                  "Each cake follows authentic Ukrainian recipes passed down through generations",
                icon: "🏺",
              },
              {
                title: "Premium Ingredients",
                description:
                  "We use only the finest ingredients, including traditional Ukrainian honey and poppy seeds",
                icon: "🌟",
              },
              {
                title: "Handcrafted with Love",
                description:
                  "Every cake is meticulously crafted by our expert Ukrainian baker Olga",
                icon: "💝",
              },
              {
                title: "Traditional Techniques",
                description:
                  "Authentic Ukrainian baking methods ensure the genuine taste and texture",
                icon: "👩‍🍳",
              },
            ].map((feature, index) => (
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
                    {feature.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Traditional Cakes Grid */}
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
              Our Traditional Ukrainian Collection
            </Typography>

            {traditionalCakes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                  Our Traditional Ukrainian Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  We are currently preparing our traditional Ukrainian cake collection. Please check
                  back soon for authentic Ukrainian desserts!
                </Typography>
                <Button
                  component={Link}
                  href="/cakes"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  View All Cakes
                </Button>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {traditionalCakes.map(cake => (
                  <Grid item xs={12} sm={6} md={4} key={cake._id}>
                    <CakeCard cake={cake} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Ukrainian Traditions Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
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
              The Tradition of Ukrainian Baking
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              Ukrainian baking traditions date back centuries, with each region of Ukraine having
              its own unique recipes and techniques. Our traditional cakes represent the heart of
              Ukrainian culinary heritage, bringing together the finest ingredients and time-honored
              methods.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              From the delicate layers of honey cake to the rich flavors of Kyiv cake, each
              traditional Ukrainian dessert tells a story of family, celebration, and the warmth of
              Ukrainian hospitality. These recipes have been cherished and preserved through
              generations, ensuring that the authentic taste of Ukraine continues to delight people
              around the world.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              At Olgish Cakes, we honor these traditions by using authentic Ukrainian recipes and
              techniques, bringing the genuine taste of Ukrainian baking to our community in Leeds.
              Every cake is crafted with the same love and attention to detail that Ukrainian bakers
              have practiced for generations.
            </Typography>
          </Paper>

          {/* Call to Action */}
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
              Experience Authentic Ukrainian Flavors
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Order your traditional Ukrainian cake today and taste the authentic flavors that have
              been cherished for generations. Perfect for celebrations, special occasions, or simply
              to experience the warmth of Ukrainian hospitality.
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
                Order Traditional Cake
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View All Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
