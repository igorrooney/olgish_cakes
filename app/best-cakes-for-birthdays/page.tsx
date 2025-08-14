�import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Best Cakes for Birthdays | Ukrainian Birthday Cake Guide | Olgish Cakes",
  description:
    "Discover the best Ukrainian cakes for birthdays. Our guide helps you choose the perfect birthday cake from traditional honey cake to modern designs.",
  keywords:
    "best cakes for birthdays, Ukrainian birthday cakes, birthday cake guide, honey cake birthday, traditional birthday cakes",
  openGraph: {
    title: "Best Cakes for Birthdays | Ukrainian Birthday Cake Guide",
    description:
      "Discover the best Ukrainian cakes for birthdays. Our guide helps you choose the perfect birthday cake from traditional honey cake to modern designs.",
    url: "https://olgishcakes.co.uk/best-cakes-for-birthdays",
    images: ["https://olgishcakes.co.uk/images/best-cakes-for-birthdays.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cakes for Birthdays | Ukrainian Birthday Cake Guide",
    description:
      "Discover the best Ukrainian cakes for birthdays. Our guide helps you choose the perfect birthday cake from traditional honey cake to modern designs.",
    images: ["https://olgishcakes.co.uk/images/best-cakes-for-birthdays.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/best-cakes-for-birthdays",
  },
};

export default async function BestCakesForBirthdaysPage() {
  const cakes = await getAllCakes();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Best Cakes for Birthdays: Ukrainian Birthday Cake Guide",
    description: "Guide to choosing the perfect Ukrainian birthday cake",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.co.uk/images/best-cakes-for-birthdays.jpg",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Best Cakes for Birthdays" }]}
          />
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
            Best Cakes for Birthdays
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
            Discover the perfect Ukrainian birthday cake for your celebration. From traditional
            honey cake to modern designs, find the cake that makes your day special.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Birthday Guide" color="primary" />
            <Chip label="Traditional Cakes" color="secondary" />
            <Chip label="Modern Designs" color="primary" />
            <Chip label="Perfect Celebrations" color="secondary" />
          </Box>
        </Box>

        {/* Birthday Cake Guide Overview */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #FEF102 0%, #2E3192 100%)",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            �x} Choosing the Perfect Birthday Cake
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
            A birthday cake is more than just dessert - it's the centerpiece of your celebration.
            Ukrainian birthday cakes combine traditional flavors with modern presentation to create
            unforgettable birthday memories.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            Whether you prefer classic honey cake or contemporary designs, our guide will help you
            choose the perfect cake for your special day.
          </Typography>
        </Paper>

        {/* Popular Birthday Cakes */}
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
            Popular Birthday Cake Choices
          </Typography>
          <Grid container spacing={3}>
            {cakes.slice(0, 6).map(cake => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <CakeCard cake={cake} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Birthday Cake Categories */}
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
            Birthday Cake Categories
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Traditional Honey Cake",
                description: "Classic Ukrainian honey cake with rich layers and creamy filling",
                icon: "�x��",
                bestFor: "Traditional celebrations, honey lovers",
                size: "6-8 inches",
              },
              {
                title: "Kyiv Cake",
                description: "Elegant layered cake with nuts and chocolate decoration",
                icon: "�x�:️",
                bestFor: "Sophisticated celebrations, nut lovers",
                size: "8-10 inches",
              },
              {
                title: "Custom Birthday Cakes",
                description: "Personalized designs with your favorite themes and flavors",
                icon: "�x}�",
                bestFor: "Personal celebrations, themed parties",
                size: "Custom sizes",
              },
              {
                title: "Mini Birthday Cakes",
                description: "Perfect individual portions for intimate celebrations",
                icon: "�x��",
                bestFor: "Small gatherings, individual treats",
                size: "Individual portions",
              },
              {
                title: "Celebration Cakes",
                description: "Festive designs perfect for milestone birthdays",
                icon: "�x}0",
                bestFor: "Milestone celebrations, large parties",
                size: "10-12 inches",
              },
              {
                title: "Seasonal Birthday Cakes",
                description: "Cakes featuring seasonal flavors and decorations",
                icon: "�xR�",
                bestFor: "Seasonal celebrations, fresh ingredients",
                size: "8-10 inches",
              },
            ].map((category, index) => (
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
                    {category.icon}
                  </Typography>
                  <Typography variant="h3" component="h3" sx={{ mb: 1, color: "#2E3192", fontWeight: "bold" }}>
                    {category.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {category.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    <strong>Best for:</strong> {category.bestFor}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Size:</strong> {category.size}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Birthday Cake Selection Guide */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #2E3192 0%, #FEF102 100%)",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            �x}� Birthday Cake Selection Guide
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h3" sx={{ mb: 2 }}>
                Consider These Factors:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ⬢ Number of guests (portion size)
                <br />
                ⬢ Birthday person's favorite flavors
                <br />
                ⬢ Party theme and decorations
                <br />
                ⬢ Dietary restrictions
                <br />⬢ Budget and timeline
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h3" sx={{ mb: 2 }}>
                Popular Birthday Flavors:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ⬢ Traditional honey cake
                <br />
                ⬢ Chocolate and vanilla combinations
                <br />
                ⬢ Fruit-flavored cakes
                <br />
                ⬢ Nut and caramel flavors
                <br />⬢ Seasonal specialties
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Birthday Cake Sizing Guide */}
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
            �x� Birthday Cake Sizing Guide
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                size: "6-inch",
                servings: "6-8 people",
                bestFor: "Intimate celebrations, couples",
                icon: "�x�",
              },
              {
                size: "8-inch",
                servings: "10-12 people",
                bestFor: "Small family gatherings",
                icon: "�x�⬍�x�⬍�x�⬍�x�",
              },
              {
                size: "10-inch",
                servings: "15-20 people",
                bestFor: "Medium-sized parties",
                icon: "�x}0",
              },
              {
                size: "12-inch",
                servings: "25-30 people",
                bestFor: "Large celebrations",
                icon: "�x}`",
              },
            ].map((size, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
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
                    {size.icon}
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 1, color: "#2E3192", fontWeight: "bold" }}>
                    {size.size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>Servings:</strong> {size.servings}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {size.bestFor}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Ordering Tips */}
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
            �x� Birthday Cake Ordering Tips
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h3" component="h3" sx={{ mb: 2, color: "#2E3192" }}>
                  Planning Your Order:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  ⬢ Order 3-5 days in advance for standard cakes
                  <br />
                  ⬢ Order 1-2 weeks for custom designs
                  <br />
                  ⬢ Consider delivery timing for your party
                  <br />⬢ Plan for cake storage and serving
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h3" component="h3" sx={{ mb: 2, color: "#2E3192" }}>
                  Special Requests:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  ⬢ Personalization with names or messages
                  <br />
                  ⬢ Dietary restrictions (vegan, gluten-free)
                  <br />
                  ⬢ Special decorations or themes
                  <br />⬢ Delivery to party venue
                </Typography>
              </Paper>
            </Grid>
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
            Order Your Perfect Birthday Cake
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Make your birthday celebration special with a traditional Ukrainian birthday cake
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/birthday-cakes"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#2E3192",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              Browse Birthday Cakes
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
              Order Birthday Cake
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}

