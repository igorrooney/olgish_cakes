import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Best Cakes for Weddings | Wedding Cake Guide | Ukrainian Wedding Cakes | Olgish Cakes",
  description:
    "Discover the best cakes for weddings with our comprehensive wedding cake guide. Traditional Ukrainian wedding cakes, modern designs, and expert advice for choosing your perfect wedding cake.",
  keywords:
    "best cakes for weddings, wedding cake guide, Ukrainian wedding cakes, traditional wedding cakes, wedding cake flavors, wedding cake designs, wedding cake advice",
  openGraph: {
    title: "Best Cakes for Weddings | Wedding Cake Guide | Ukrainian Wedding Cakes",
    description:
      "Discover the best cakes for weddings with our comprehensive wedding cake guide. Traditional Ukrainian wedding cakes, modern designs, and expert advice for choosing your perfect wedding cake.",
    url: "https://olgish-cakes.vercel.app/best-cakes-for-weddings",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/best-cakes-for-weddings.jpg",
        width: 1200,
        height: 630,
        alt: "Best Cakes for Weddings - Wedding Cake Guide",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cakes for Weddings | Wedding Cake Guide | Ukrainian Wedding Cakes",
    description:
      "Discover the best cakes for weddings with our comprehensive wedding cake guide. Traditional Ukrainian wedding cakes, modern designs, and expert advice.",
    images: ["https://olgish-cakes.vercel.app/images/best-cakes-for-weddings.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/best-cakes-for-weddings",
  },
};

export default async function BestCakesForWeddingsPage() {
  const allCakes = await getAllCakes();
  const weddingCakes = allCakes.filter(
    cake => cake.category === "wedding" || cake.category === "traditional"
  );

  return (
    <>
      <Script
        id="best-cakes-for-weddings-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Choose the Best Wedding Cake",
            description:
              "Discover the best cakes for weddings with our comprehensive wedding cake guide. Traditional Ukrainian wedding cakes, modern designs, and expert advice for choosing your perfect wedding cake.",
            image: "https://olgish-cakes.vercel.app/images/best-cakes-for-weddings.jpg",
            totalTime: "PT15M",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "GBP",
              value: "180",
            },
            step: [
              {
                "@type": "HowToStep",
                name: "Consider Your Wedding Style",
                text: "Think about your wedding theme, venue, and overall style to choose a cake that complements your celebration.",
              },
              {
                "@type": "HowToStep",
                name: "Choose Cake Type",
                text: "Select from traditional Ukrainian honey cake, elegant Kyiv cake, classic wedding cake, or modern naked cake.",
              },
              {
                "@type": "HowToStep",
                name: "Determine Serving Size",
                text: "Calculate the number of guests and choose appropriate serving sizes ranging from 60-120 guests.",
              },
              {
                "@type": "HowToStep",
                name: "Set Your Budget",
                text: "Wedding cakes range from £180-£250+ depending on size, design complexity, and ingredients.",
              },
              {
                "@type": "HowToStep",
                name: "Book Early",
                text: "Order your wedding cake 2-3 months in advance to ensure availability and allow time for custom design.",
              },
            ],
            url: "https://olgish-cakes.vercel.app/best-cakes-for-weddings",
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
              Best Cakes for Weddings
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
              Your comprehensive guide to choosing the perfect wedding cake. From traditional
              Ukrainian wedding cakes to modern designs, discover the best options for your special
              day.
            </Typography>
            <Chip
              label="Wedding Cake Expert Guide"
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
              Top Wedding Cake Recommendations
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Traditional Ukrainian Honey Cake",
                  description:
                    "Perfect for couples who want to honor Ukrainian heritage with a traditional honey cake featuring delicate layers and rich honey flavor",
                  bestFor: "Ukrainian heritage weddings, traditional celebrations",
                  servingSize: "Serves 80-100 guests",
                  price: "From £200",
                  icon: "🍯",
                },
                {
                  name: "Elegant Kyiv Cake",
                  description:
                    "Sophisticated choice with crispy meringue layers and hazelnut-chocolate filling, perfect for elegant wedding receptions",
                  bestFor: "Elegant weddings, chocolate lovers",
                  servingSize: "Serves 60-80 guests",
                  price: "From £180",
                  icon: "🏛️",
                },
                {
                  name: "Classic Wedding Cake",
                  description:
                    "Timeless vanilla cake with buttercream frosting, decorated with fresh flowers and elegant piping",
                  bestFor: "Traditional weddings, classic elegance",
                  servingSize: "Serves 100-120 guests",
                  price: "From £250",
                  icon: "💒",
                },
                {
                  name: "Modern Naked Cake",
                  description:
                    "Contemporary naked cake with fresh berries and minimal decoration, perfect for rustic or modern weddings",
                  bestFor: "Rustic weddings, modern celebrations",
                  servingSize: "Serves 80-100 guests",
                  price: "From £220",
                  icon: "🌿",
                },
              ].map((cake, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Typography variant="h2" sx={{ mr: 2, fontSize: "2.5rem" }}>
                        {cake.icon}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: "primary.main" }}>
                        {cake.name}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {cake.description}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        Best For:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cake.bestFor}
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Serving Size:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cake.servingSize}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Starting Price:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cake.price}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
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
                Wedding Cake Selection Guide
              </Typography>
              <Grid container spacing={4}>
                {[
                  {
                    factor: "Guest Count",
                    advice:
                      "Plan for 1-2 slices per guest. For 100 guests, choose a cake that serves 100-120 people",
                    tips: [
                      "Small weddings (50 guests): 2-tier cake",
                      "Medium weddings (100 guests): 3-tier cake",
                      "Large weddings (150+ guests): 4+ tier cake",
                    ],
                  },
                  {
                    factor: "Wedding Style",
                    advice: "Match your cake style to your wedding theme and venue",
                    tips: [
                      "Traditional: Classic white wedding cake",
                      "Rustic: Naked cake with fresh flowers",
                      "Modern: Geometric designs and metallic accents",
                      "Ukrainian: Traditional honey cake or Kyiv cake",
                    ],
                  },
                  {
                    factor: "Season",
                    advice: "Consider seasonal flavors and decorations",
                    tips: [
                      "Spring: Light flavors, fresh flowers",
                      "Summer: Fruit-based cakes, bright colors",
                      "Autumn: Spiced flavors, warm tones",
                      "Winter: Rich flavors, elegant decorations",
                    ],
                  },
                  {
                    factor: "Budget",
                    advice: "Wedding cakes typically cost £3-8 per slice depending on complexity",
                    tips: [
                      "Simple designs: £3-5 per slice",
                      "Complex designs: £5-8 per slice",
                      "Custom decorations: Additional £50-200",
                    ],
                  },
                ].map((factor, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                      >
                        {factor.factor}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                        {factor.advice}
                      </Typography>
                      <Box>
                        {factor.tips.map((tip, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            sx={{ mb: 1, color: "text.secondary" }}
                          >
                            • {tip}
                          </Typography>
                        ))}
                      </Box>
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
              Our Wedding Cake Collection
            </Typography>
            <Grid container spacing={4}>
              {weddingCakes.slice(0, 6).map(cake => (
                <Grid item xs={12} sm={6} md={4} key={cake._id}>
                  <CakeCard cake={cake} />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                component={Link}
                href="/wedding-cakes"
                variant="outlined"
                color="primary"
                size="large"
              >
                View All Wedding Cakes
              </Button>
            </Box>
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
              Ready to Choose Your Wedding Cake?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
              Contact us for a personalized consultation and tasting session
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
                Book Consultation
              </Button>
              <Button
                component={Link}
                href="/wedding-cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View Wedding Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
