�import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";

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
    url: "https://olgishcakes.co.uk/cake-size-guide",
    images: ["https://olgishcakes.co.uk/images/cake-size-guide.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Size Guide | Ukrainian Cake Sizing Chart",
    description:
      "Find the perfect cake size for your celebration. Our Ukrainian cake size guide helps you choose the right cake for any occasion, from small gatherings to large parties.",
    images: ["https://olgishcakes.co.uk/images/cake-size-guide.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-size-guide",
  },
};

export default function CakeSizeGuidePage() {
  const sizes = [
    { size: "6-inch", servings: "6-8", bestFor: "Small gatherings, couples", icon: "�x�" },
    { size: "8-inch", servings: "10-12", bestFor: "Family celebrations", icon: "�x�⬍�x�⬍�x�⬍�x�" },
    { size: "10-inch", servings: "15-20", bestFor: "Medium parties", icon: "�x}0" },
    { size: "12-inch", servings: "25-30", bestFor: "Large events", icon: "�x}`" },
    { size: "2-tier", servings: "30-40", bestFor: "Weddings, big birthdays", icon: "�x�" },
    { size: "3-tier", servings: "50+", bestFor: "Weddings, corporate", icon: "�x��" },
  ];

  return (
    <>
      <Script
        id="cake-size-guide-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Choose the Right Cake Size",
            description:
              "Find the perfect cake size for your celebration. Our Ukrainian cake size guide helps you choose the right cake for any occasion, from small gatherings to large parties.",
            image: "https://olgishcakes.co.uk/images/cake-size-guide.jpg",
            totalTime: "PT5M",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "GBP",
              value: "0",
            },
            step: [
              {
                "@type": "HowToStep",
                name: "Determine Guest Count",
                text: "Count the number of guests who will be eating cake at your event.",
              },
              {
                "@type": "HowToStep",
                name: "Choose Cake Size",
                text: "6-inch serves 6-8 people, 8-inch serves 10-12, 10-inch serves 15-20, 12-inch serves 25-30, 2-tier serves 30-40, 3-tier serves 50+.",
              },
              {
                "@type": "HowToStep",
                name: "Consider Event Type",
                text: "Small gatherings need 6-8 inch, family celebrations need 8-10 inch, large events need 12-inch or tiered cakes.",
              },
              {
                "@type": "HowToStep",
                name: "Order with Buffer",
                text: "Order slightly larger than needed to ensure everyone gets a piece and for leftovers.",
              },
            ],
            url: "https://olgishcakes.co.uk/cake-size-guide",
          }),
        }}
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
              color: "#2E3192",
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
                <Typography
                  variant="h3"
                  component="h3"
                  sx={{ mb: 1, color: "#2E3192", fontWeight: "bold" }}
                >
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
            sx={{ bgcolor: "#FEF102", color: "#2E3192", "&:hover": { bgcolor: "#ffe066" } }}
          >
            Browse All Cakes
          </Button>
        </Box>
      </Container>
    </>
  );
}

