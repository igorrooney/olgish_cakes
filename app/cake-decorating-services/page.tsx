import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cake Decorating Services | Custom Cake Design | Olgish Cakes",
  description:
    "Professional cake decorating services in Leeds. Custom cake design, fondant work, sugar flowers, and more for weddings, birthdays, and special occasions.",
  keywords:
    "cake decorating services, custom cake design, cake decoration Leeds, wedding cake decoration, birthday cake decoration",
  openGraph: {
    title: "Cake Decorating Services | Custom Cake Design",
    description:
      "Professional cake decorating services in Leeds. Custom cake design, fondant work, sugar flowers, and more for weddings, birthdays, and special occasions.",
    url: "https://olgish-cakes.vercel.app/cake-decorating-services",
    images: ["https://olgish-cakes.vercel.app/images/cake-decorating-services.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Decorating Services | Custom Cake Design",
    description:
      "Professional cake decorating services in Leeds. Custom cake design, fondant work, sugar flowers, and more for weddings, birthdays, and special occasions.",
    images: ["https://olgish-cakes.vercel.app/images/cake-decorating-services.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/cake-decorating-services",
  },
};

export default function CakeDecoratingServicesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Cake Decorating Services",
    description: "Professional cake decorating and custom cake design in Leeds",
    provider: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
    serviceType: "Cake Decorating",
    url: "https://olgish-cakes.vercel.app/cake-decorating-services",
  };

  const services = [
    {
      name: "Custom Cake Design",
      description: "Personalized cake designs for any occasion.",
      icon: "🎨",
    },
    {
      name: "Fondant Work",
      description: "Smooth fondant finishes and creative shapes.",
      icon: "🍰",
    },
    {
      name: "Sugar Flowers",
      description: "Handcrafted sugar flowers for elegant cakes.",
      icon: "🌸",
    },
    { name: "Edible Prints", description: "Custom edible images and prints.", icon: "🖼️" },
    {
      name: "Sculpted Cakes",
      description: "3D sculpted cakes for unique celebrations.",
      icon: "🗿",
    },
    {
      name: "Themed Cakes",
      description: "Cakes for birthdays, weddings, and special events.",
      icon: "🎂",
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
            Cake Decorating Services
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
            Professional cake decorating and custom cake design for weddings, birthdays, and special
            occasions in Leeds.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Custom Design" color="primary" />
            <Chip label="Fondant Work" color="secondary" />
            <Chip label="Sugar Flowers" color="primary" />
            <Chip label="Edible Prints" color="secondary" />
          </Box>
        </Box>
        <Grid container spacing={3}>
          {services.map((item, idx) => (
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
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            component={Link}
            href="/custom-cake-design"
            variant="contained"
            size="large"
            sx={{ bgcolor: "#FFD700", color: "#005BBB", "&:hover": { bgcolor: "#ffe066" } }}
          >
            Start Your Custom Cake
          </Button>
        </Box>
      </Container>
    </>
  );
}
