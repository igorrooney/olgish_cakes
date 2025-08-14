�import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cakes Pudsey | Ukrainian Cakes Pudsey | Traditional Ukrainian Cakes | Olgish Cakes",
  description:
    "Traditional Ukrainian cakes in Pudsey. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Pudsey. Order now for special occasions.",
  keywords:
    "cakes Pudsey, Ukrainian cakes Pudsey, honey cake Pudsey, Kyiv cake Pudsey, traditional Ukrainian cakes Pudsey, cake delivery Pudsey",
  openGraph: {
    title: "Cakes Pudsey | Ukrainian Cakes Pudsey",
    description:
      "Traditional Ukrainian cakes in Pudsey. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Pudsey.",
    url: "https://olgishcakes.co.uk/cakes-pudsey",
    images: ["https://olgishcakes.co.uk/images/cakes-pudsey.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes Pudsey | Ukrainian Cakes Pudsey",
    description:
      "Traditional Ukrainian cakes in Pudsey. Handcrafted honey cake, Kyiv cake, and authentic Ukrainian desserts delivered to Pudsey.",
    images: ["https://olgishcakes.co.uk/images/cakes-pudsey.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-pudsey",
  },
};

export default async function CakesPudseyPage() {
  const cakes = await getAllCakes();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Ukrainian Cakes in Pudsey",
    description:
      "Authentic Ukrainian cakes available in Pudsey, Leeds. Traditional recipes and custom designs.",
    url: "https://olgishcakes.co.uk/cakes-pudsey",
  };

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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes Pudsey" }]} />
          </Box>

          {/* Hero Section */}
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
              Traditional Ukrainian Cakes in Pudsey
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
              Authentic Ukrainian honey cake, Kyiv cake, and traditional desserts delivered to your
              door in Pudsey
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip label="Free Delivery" color="primary" />
              <Chip label="Handcrafted" color="secondary" />
              <Chip label="Traditional Recipes" color="primary" />
              <Chip label="Fresh Daily" color="secondary" />
            </Box>
          </Box>

          {/* Delivery Info */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              mb: { xs: 4, md: 6 },
              background: "linear-gradient(135deg, #2E3192 0%, #FEF102 100%)",
              color: "white",
            }}
          >
            <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.5rem", md: "2rem" } }}>
              �xaa Fast Delivery to Pudsey
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              We deliver our traditional Ukrainian cakes to Pudsey and surrounding areas. Same-day
              delivery available for orders placed before 2 PM.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h4" component="h4" sx={{ mb: 1 }}>
                  Delivery Areas in Pudsey:
                </Typography>
                <Typography variant="body2">
                  ⬢ Pudsey Town Centre ⬢ Fartown ⬢ Greenside ⬢ Lowtown ⬢ ⬢ Pudsey Park ⬢ Robin Lane
                  ⬢ Richardshaw Lane ⬢ ⬢ Swinnow ⬢ Tyersal ⬢ Stanningley
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h4" component="h4" sx={{ mb: 1 }}>
                  Delivery Options:
                </Typography>
                <Typography variant="body2">
                  ⬢ Standard Delivery: £3.50 (2-3 hours)
                  <br />
                  ⬢ Express Delivery: £5.50 (1-2 hours)
                  <br />
                  ⬢ Same Day Delivery: £7.50 (available until 2 PM)
                  <br />⬢ Free delivery on orders over £30
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Popular Cakes */}
          <Box sx={{ mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                textAlign: "center",
                mb: 4,
                color: "#2E3192",
              }}
            >
              Popular Ukrainian Cakes in Pudsey
            </Typography>
            <Grid container spacing={3}>
              {cakes.slice(0, 6).map(cake => (
                <Grid item xs={12} sm={6} md={4} key={cake._id}>
                  <CakeCard cake={cake} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Why Choose Us */}
          <Box sx={{ mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                textAlign: "center",
                mb: 4,
                color: "#2E3192",
              }}
            >
              Why Pudsey Chooses Our Ukrainian Cakes
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  title: "Traditional Recipes",
                  description: "Authentic Ukrainian recipes passed down through generations",
                  icon: "�x��",
                },
                {
                  title: "Fresh Ingredients",
                  description: "Only the finest ingredients sourced locally when possible",
                  icon: "�xR�",
                },
                {
                  title: "Handcrafted",
                  description: "Each cake is lovingly made by hand with attention to detail",
                  icon: "�x�⬍�x��",
                },
                {
                  title: "Fast Delivery",
                  description: "Quick and reliable delivery service to Pudsey",
                  icon: "�a�",
                },
                {
                  title: "Special Occasions",
                  description: "Perfect for birthdays, weddings, and celebrations",
                  icon: "�x}0",
                },
                {
                  title: "Local Service",
                  description: "Supporting the local community with authentic Ukrainian baking",
                  icon: "�x��",
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
                    <Typography variant="h4" component="h4" sx={{ mb: 1, color: "#2E3192" }}>
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

          {/* CTA Section */}
          <Box
            sx={{
              textAlign: "center",
              p: { xs: 4, md: 6 },
              background: "linear-gradient(135deg, #FEF102 0%, #2E3192 100%)",
              borderRadius: 2,
              color: "white",
            }}
          >
            <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
              Ready to Order Your Ukrainian Cake?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
              Experience the authentic taste of Ukraine with our traditional cakes delivered to
              Pudsey
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/cakes"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "#2E3192",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                Browse All Cakes
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
      </Box>
    </>
  );
}

