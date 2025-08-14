�import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cake Flavor Guide | Ukrainian Cake Flavors | Olgish Cakes",
  description:
    "Explore our Ukrainian cake flavor guide. Discover the most popular flavors for birthdays, weddings, and celebrations. Find your favorite cake flavor!",
  keywords:
    "cake flavor guide, Ukrainian cake flavors, best cake flavors, birthday cake flavors, wedding cake flavors",
  openGraph: {
    title: "Cake Flavor Guide | Ukrainian Cake Flavors",
    description:
      "Explore our Ukrainian cake flavor guide. Discover the most popular flavors for birthdays, weddings, and celebrations. Find your favorite cake flavor!",
    url: "https://olgishcakes.co.uk/cake-flavor-guide",
    images: ["https://olgishcakes.co.uk/images/cake-flavor-guide.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Flavor Guide | Ukrainian Cake Flavors",
    description:
      "Explore our Ukrainian cake flavor guide. Discover the most popular flavors for birthdays, weddings, and celebrations. Find your favorite cake flavor!",
    images: ["https://olgishcakes.co.uk/images/cake-flavor-guide.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-flavor-guide",
  },
};

export default function CakeFlavorGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Cake Flavor Guide: Ukrainian Cake Flavors",
    description: "Guide to the most popular Ukrainian cake flavors for every occasion",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.co.uk/images/cake-flavor-guide.jpg",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
  };

  const flavors = [
    {
      name: "Honey Cake (Medovik)",
      description: "Classic Ukrainian honey cake with layers of honey and cream.",
      icon: "�x��",
    },
    {
      name: "Kyiv Cake",
      description: "Nutty meringue layers with chocolate and buttercream.",
      icon: "�x�S",
    },
    {
      name: "Chocolate Cake",
      description: "Rich chocolate sponge with decadent chocolate ganache.",
      icon: "�x��",
    },
    {
      name: "Vanilla Cream Cake",
      description: "Light vanilla sponge with creamy vanilla filling.",
      icon: "�x��",
    },
    {
      name: "Berry Cake",
      description: "Sponge cake with fresh berries and whipped cream.",
      icon: "�x�",
    },
    {
      name: "Caramel Cake",
      description: "Caramel sponge with salted caramel filling.",
      icon: "�x��",
    },
    {
      name: "Lemon Cake",
      description: "Zesty lemon sponge with lemon curd and cream.",
      icon: "�x�9",
    },
    {
      name: "Nut-Free Cake",
      description: "Delicious cakes made without nuts for allergy-friendly celebrations.",
      icon: "�xa��x�S",
    },
    { name: "Vegan Cake", description: "Plant-based cakes with a variety of flavors.", icon: "�xR�" },
    {
      name: "Gluten-Friendly Cake",
      description: "Cakes made with gluten-friendly ingredients.",
      icon: "�xR�",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cake Flavor Guide" }]} />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
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
              Cake Flavor Guide
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
              Explore our most popular Ukrainian cake flavors. Find the perfect flavor for your next
              celebration!
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip label="Popular Flavors" color="primary" />
              <Chip label="Birthday Cakes" color="secondary" />
              <Chip label="Wedding Cakes" color="primary" />
              <Chip label="Allergy-Friendly" color="secondary" />
            </Box>
          </Box>
          <Grid container spacing={3}>
            {flavors.map((item, idx) => (
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
                  <Typography variant="h3" component="h3" sx={{ mb: 1, color: "#2E3192", fontWeight: "bold" }}>
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
              href="/cakes"
              variant="contained"
              size="large"
              sx={{ bgcolor: "#FEF102", color: "#2E3192", "&:hover": { bgcolor: "#ffe066" } }}
            >
              Browse All Cakes
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}

