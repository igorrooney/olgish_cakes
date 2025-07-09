import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";

export const metadata: Metadata = {
  title: "Cake Preservation | How to Store Cakes | Olgish Cakes",
  description:
    "Learn how to preserve and store your cakes for maximum freshness. Tips for storing wedding cakes, birthday cakes, and traditional Ukrainian cakes.",
  keywords:
    "cake preservation, how to store cakes, cake storage tips, wedding cake storage, birthday cake storage",
  openGraph: {
    title: "Cake Preservation | How to Store Cakes",
    description:
      "Learn how to preserve and store your cakes for maximum freshness. Tips for storing wedding cakes, birthday cakes, and traditional Ukrainian cakes.",
    url: "https://olgishcakes.com/cake-preservation",
    images: ["https://olgishcakes.com/images/cake-preservation.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Preservation | How to Store Cakes",
    description:
      "Learn how to preserve and store your cakes for maximum freshness. Tips for storing wedding cakes, birthday cakes, and traditional Ukrainian cakes.",
    images: ["https://olgishcakes.com/images/cake-preservation.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/cake-preservation",
  },
};

export default function CakePreservationPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Cake Preservation Guide: How to Keep Your Cake Fresh",
    description: "Guide to preserving and storing cakes for maximum freshness",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.com/images/cake-preservation.jpg",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
  };

  const tips = [
    {
      title: "Room Temperature Storage",
      description:
        "Most cakes can be stored at room temperature for up to 2 days in an airtight container.",
      icon: "🏠",
    },
    {
      title: "Refrigeration",
      description:
        "Cakes with cream or fresh fruit should be refrigerated and consumed within 3 days.",
      icon: "❄️",
    },
    {
      title: "Freezing Cakes",
      description:
        "Wrap cakes tightly and freeze for up to 3 months. Thaw in the fridge overnight.",
      icon: "🧊",
    },
    {
      title: "Avoid Sunlight",
      description: "Keep cakes away from direct sunlight to prevent melting and drying.",
      icon: "☀️",
    },
    {
      title: "Use Cake Domes",
      description: "Cake domes help maintain moisture and protect from air exposure.",
      icon: "🎂",
    },
    {
      title: "Label and Date",
      description: "Label cakes before freezing to keep track of freshness.",
      icon: "🏷️",
    },
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
            Cake Preservation
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
            Learn how to preserve and store your cakes for maximum freshness. Tips for weddings,
            birthdays, and traditional Ukrainian cakes.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Storage Tips" color="primary" />
            <Chip label="Wedding Cakes" color="secondary" />
            <Chip label="Birthday Cakes" color="primary" />
            <Chip label="Traditional Cakes" color="secondary" />
          </Box>
        </Box>
        <Grid container spacing={3}>
          {tips.map((item, idx) => (
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
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
