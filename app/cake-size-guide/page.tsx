import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cake Size Guide | Ukrainian Cake Sizing Chart | Olgish Cakes",
  description:
    "Find the perfect cake size for your celebration. Our Ukrainian cake size guide helps you choose the right cake for any occasion, from small gatherings to large parties.",
  keywords:
    "cake size guide, Ukrainian cake sizing, cake portions, cake serving chart, birthday cake size, wedding cake size",
  openGraph: {
    title: "Cake Size Guide | Ukrainian Cake Sizing Chart",
    description:
      "Find the perfect cake size for your celebration. Our Ukrainian cake size guide helps you choose the right cake for any occasion, from small gatherings to large parties.",
    url: "https://olgishcakes.com/cake-size-guide",
    images: ["https://olgishcakes.com/images/cake-size-guide.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Size Guide | Ukrainian Cake Sizing Chart",
    description:
      "Find the perfect cake size for your celebration. Our Ukrainian cake size guide helps you choose the right cake for any occasion, from small gatherings to large parties.",
    images: ["https://olgishcakes.com/images/cake-size-guide.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/cake-size-guide",
  },
};

export default function CakeSizeGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Cake Size Guide: How to Choose the Right Cake Size",
    description: "Guide to choosing the perfect cake size for your celebration",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.com/images/cake-size-guide.jpg",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
  };

  const sizes = [
    { size: "6-inch", servings: "6-8", bestFor: "Small gatherings, couples", icon: "👫" },
    { size: "8-inch", servings: "10-12", bestFor: "Family celebrations", icon: "👨‍👩‍👧‍👦" },
    { size: "10-inch", servings: "15-20", bestFor: "Medium parties", icon: "🎉" },
    { size: "12-inch", servings: "25-30", bestFor: "Large events", icon: "🎊" },
    { size: "2-tier", servings: "30-40", bestFor: "Weddings, big birthdays", icon: "💍" },
    { size: "3-tier", servings: "50+", bestFor: "Weddings, corporate", icon: "🏢" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
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
            Cake Size Guide
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
            Find the perfect cake size for your celebration. Use our guide to choose the right cake
            for your event.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Serving Chart" color="primary" />
            <Chip label="Wedding Cakes" color="secondary" />
            <Chip label="Birthday Cakes" color="primary" />
            <Chip label="Portion Guide" color="secondary" />
          </Box>
        </Box>
        <Grid container spacing={3}>
          {sizes.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
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
                  {item.icon}
                </Typography>
                <Typography variant="h5" sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}>
                  {item.size}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Servings:</strong> {item.servings}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.bestFor}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            component={Link}
            href="/cakes"
            variant="contained"
            size="large"
            sx={{ bgcolor: "#FFD700", color: "#005BBB", "&:hover": { bgcolor: "#ffe066" } }}
          >
            Browse All Cakes
          </Button>
        </Box>
      </Container>
    </>
  );
}
