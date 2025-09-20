import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";


import { colors } from "@/lib/design-system";
export const metadata: Metadata = {
  title: "Retirement Cakes Leeds | Ukrainian Cakes",
  description:
    "Special Ukrainian retirement cakes in Leeds. Handcrafted honey cake, Kyiv cake, and unique retirement celebration designs. Perfect for retirement parties.",
  keywords:
    "retirement cakes Leeds, Ukrainian retirement cakes, retirement party cakes, celebration cakes Leeds, retirement delivery Leeds",
  openGraph: {
    title: "Retirement Cakes Leeds | Ukrainian Cakes",
    description:
      "Special Ukrainian retirement cakes in Leeds. Handcrafted honey cake, Kyiv cake, and unique retirement celebration designs.",
    url: "https://olgishcakes.co.uk/retirement-cakes-leeds",
    images: ["https://olgishcakes.co.uk/images/retirement-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retirement Cakes Leeds | Ukrainian Cakes",
    description:
      "Special Ukrainian retirement cakes in Leeds. Handcrafted honey cake, Kyiv cake, and unique retirement celebration designs.",
    images: ["https://olgishcakes.co.uk/images/retirement-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/retirement-cakes-leeds",
  },
};

export default async function RetirementCakesPage() {
  const cakes = await getAllCakes();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Olgish Cakes - Retirement Cakes in Leeds",
    description: "Traditional Ukrainian retirement cakes in Leeds",
    url: "https://olgishcakes.co.uk/retirement-cakes-leeds",
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
            Retirement Cakes in Leeds
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
            Celebrate this special milestone with our beautiful Ukrainian retirement cakes. Perfect
            for retirement parties and celebrations.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Milestone Celebration" color="primary" />
            <Chip label="Traditional Recipes" color="secondary" />
            <Chip label="Custom Designs" color="primary" />
            <Chip label="Party Ready" color="secondary" />
          </Box>
        </Box>

        {/* Special Retirement Offer */}
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
            🎉 Special Retirement Celebration Offer 🎉
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Free Personalization on Retirement Cakes
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Order 3 days in advance for custom retirement cake designs and decorations
          </Typography>
          <Button
            component={Link}
            href="/cakes"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "white",
              color: colors.primary.main,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            Order Now
          </Button>
        </Paper>

        {/* Popular Retirement Cakes */}
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
            Perfect Retirement Celebration Cakes
          </Typography>
          <Grid container spacing={3}>
            {cakes.slice(0, 6).map(cake => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <CakeCard cake={cake} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Retirement Special Features */}
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
            Why Choose Our Retirement Cakes?
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Milestone Celebration",
                description: "Special designs perfect for retirement celebrations",
                icon: "🎊",
              },
              {
                title: "Custom Personalization",
                description: "Add names, dates, and personal messages",
                icon: "✏️",
              },
              {
                title: "Traditional Flavors",
                description: "Authentic Ukrainian honey cake and Kyiv cake",
                icon: "🏺",
              },
              {
                title: "Party Sizes",
                description: "Available in sizes perfect for retirement parties",
                icon: "🎂",
              },
              {
                title: "Professional Delivery",
                description: "Reliable delivery to your retirement party venue",
                icon: "🚚",
              },
              {
                title: "Beautiful Presentation",
                description: "Stunning presentation for this special occasion",
                icon: "✨",
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
            📅 Retirement Cake Ordering Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
                Order Deadlines:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                • Standard Delivery: Order 3 days in advance
                <br />
                • Express Delivery: Order 2 days in advance
                <br />
                • Custom Designs: Order 5 days in advance
                <br />• Large Orders: Order 1 week in advance
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
                Special Services:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                • Custom retirement cake toppers
                <br />
                • Special celebration packaging
                <br />
                • Venue delivery and setup
                <br />• Personalized messages and designs
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
            Celebrate Retirement with Tradition
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Order your special Ukrainian retirement cake today and make this milestone celebration
            unforgettable
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/cakes"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: colors.primary.main,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              Browse Retirement Cakes
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
