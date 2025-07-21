import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import Script from "next/script";

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
    url: "https://olgishcakes.co.uk/cake-preservation",
    images: ["https://olgishcakes.co.uk/images/cake-preservation.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Preservation | How to Store Cakes",
    description:
      "Learn how to preserve and store your cakes for maximum freshness. Tips for storing wedding cakes, birthday cakes, and traditional Ukrainian cakes.",
    images: ["https://olgishcakes.co.uk/images/cake-preservation.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-preservation",
  },
};

export default function CakePreservationPage() {
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
      <Script
        id="cake-preservation-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Preserve and Store Cakes",
            description:
              "Learn how to preserve and store your cakes for maximum freshness. Tips for storing wedding cakes, birthday cakes, and traditional Ukrainian cakes.",
            image: "https://olgishcakes.co.uk/images/cake-preservation.jpg",
            totalTime: "PT5M",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "GBP",
              value: "0",
            },
            supply: [
              {
                "@type": "HowToSupply",
                name: "Airtight container",
              },
              {
                "@type": "HowToSupply",
                name: "Plastic wrap",
              },
              {
                "@type": "HowToSupply",
                name: "Cake dome",
              },
              {
                "@type": "HowToSupply",
                name: "Labels",
              },
            ],
            step: [
              {
                "@type": "HowToStep",
                name: "Choose Storage Method",
                text: "Decide between room temperature (2 days), refrigeration (3 days), or freezing (3 months) based on cake type and timeline.",
              },
              {
                "@type": "HowToStep",
                name: "Prepare for Storage",
                text: "Wrap cakes in plastic wrap or place in airtight container to prevent drying and odor absorption.",
              },
              {
                "@type": "HowToStep",
                name: "Store Properly",
                text: "Keep away from direct sunlight and store in appropriate temperature conditions.",
              },
              {
                "@type": "HowToStep",
                name: "Label and Monitor",
                text: "Label frozen cakes with date and type, and monitor freshness regularly.",
              },
            ],
            url: "https://olgishcakes.co.uk/cake-preservation",
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
