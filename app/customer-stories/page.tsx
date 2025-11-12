import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Rating,
} from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { TestimonialsList } from "../testimonials/TestimonialsList";
import { getFeaturedTestimonials } from "../utils/fetchTestimonials";

export const metadata: Metadata = {
  title: "Customer Stories | Cake Testimonials",
  description:
    "Read real customer stories and testimonials about Olgish Cakes. Discover why my customers love my Ukrainian cakes and service.",
  keywords:
    "customer stories, cake testimonials, Olgish Cakes reviews, Ukrainian cake reviews, customer feedback",
  openGraph: {
    title: "Customer Stories | Cake Testimonials",
    description:
      "Read real customer stories and testimonials about Olgish Cakes. Discover why my customers love my Ukrainian cakes and service.",
    url: "https://olgishcakes.co.uk/customer-stories",
    images: ["https://olgishcakes.co.uk/images/customer-stories.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Stories | Cake Testimonials",
    description:
      "Read real customer stories and testimonials about Olgish Cakes. Discover why my customers love my Ukrainian cakes and service.",
    images: ["https://olgishcakes.co.uk/images/customer-stories.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/customer-stories",
  },
};

export default async function CustomerStoriesPage() {
  const testimonials = await getFeaturedTestimonials(100); // Fetch up to 100 testimonials

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Customer Stories",
    description: "Read real customer stories and testimonials about Olgish Cakes.",
    url: "https://olgishcakes.co.uk/customer-stories",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Customer Stories" }]} />
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
                color: "#005BBB",
              }}
            >
              Customer Stories
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
              Read real stories and testimonials from my happy customers. Discover why Olgish Cakes
              is the top choice for Ukrainian cakes in Leeds.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip label="Real Reviews" color="primary" />
              <Chip label="Customer Stories" color="secondary" />
              <Chip label="Testimonials" color="primary" />
              <Chip label="Happy Customers" color="secondary" />
            </Box>
          </Box>
          {/* Introduction */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="body1"
              sx={{ mb: 4, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}
            >
              Every cake I make tells a story, and every customer who orders from me becomes part of my extended Ukrainian family.
              These customer stories are not just about cakes - they are about love, celebration, tradition, and the joy that
              comes from sharing something special with the people you care about most. Reading these stories always reminds me
              why I love what I do.
            </Typography>
          </Paper>

          {/* Why Customer Stories Matter */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Why Customer Stories Matter
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>❤️</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Real Experiences
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    These are real stories from real customers who have trusted me with their special celebrations.
                    Every story represents a moment of joy, love, and tradition that I was honored to be part of.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🎂</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Ukrainian Traditions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Many of these stories show how Ukrainian cake traditions are being passed down to new generations
                    and shared with friends and family in the UK. It makes me proud to be part of this cultural bridge.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🌟</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Quality & Service
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    These stories reflect not just the quality of my cakes, but the personal service and attention
                    to detail that I bring to every order. Every customer deserves to feel special and cared for.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Types of Celebrations */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Celebrations We Have Been Part Of
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Weddings & Anniversaries
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    From intimate ceremonies to grand celebrations, my Ukrainian cakes have been part of many
                    love stories. Couples often choose traditional flavors like Medovik for their wedding cakes,
                    bringing a taste of heritage to their special day.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Birthdays & Milestones
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Whether it is a child's first birthday or a grandparent's 80th celebration, every milestone
                    deserves a special cake. My customers love how traditional Ukrainian flavors make their
                    celebrations even more memorable.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Cultural Events
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Many Ukrainian families in Leeds order my cakes for cultural celebrations, Independence Day
                    events, and community gatherings. It brings comfort and connection to families far from home.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Corporate & Special Events
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Businesses and organizations often choose my cakes for special events, team celebrations,
                    and client appreciation. The unique flavors and beautiful presentation always impress guests.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* What Makes Our Service Special */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              What Makes Our Service Special
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>👨‍🍳</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Personal Touch
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Every cake is made by me personally, with attention to detail and care that comes from
                    years of experience and love for Ukrainian baking traditions.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🇺🇦</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Authentic Recipes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    I use traditional Ukrainian recipes passed down through generations, ensuring every cake
                    tastes exactly like it would in Ukraine, with authentic flavors and techniques.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>💬</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Open Communication
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    I work closely with every customer to understand their vision and make sure their cake
                    is perfect for their celebration. Communication is key to creating something special.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <TestimonialsList testimonials={testimonials} currentPage={1} totalPages={1} />
        </Container>
      </Box>
    </>
  );
}
