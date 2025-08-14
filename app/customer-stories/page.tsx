import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  Avatar,
  Rating,
} from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { TestimonialsList } from "../testimonials/TestimonialsList";
import { getFeaturedTestimonials } from "../utils/fetchTestimonials";

export const metadata: Metadata = {
  title: "Customer Stories | Cake Testimonials | Olgish Cakes",
  description:
    "Read real customer stories and testimonials about Olgish Cakes. Discover why our customers love our Ukrainian cakes and service.",
  keywords:
    "customer stories, cake testimonials, Olgish Cakes reviews, Ukrainian cake reviews, customer feedback",
  openGraph: {
    title: "Customer Stories | Cake Testimonials",
    description:
      "Read real customer stories and testimonials about Olgish Cakes. Discover why our customers love our Ukrainian cakes and service.",
    url: "https://olgishcakes.co.uk/customer-stories",
    images: ["https://olgishcakes.co.uk/images/customer-stories.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Stories | Cake Testimonials",
    description:
      "Read real customer stories and testimonials about Olgish Cakes. Discover why our customers love our Ukrainian cakes and service.",
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
              Read real stories and testimonials from our happy customers. Discover why Olgish Cakes
              is the top choice for Ukrainian cakes in Leeds.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip label="Real Reviews" color="primary" />
              <Chip label="Customer Stories" color="secondary" />
              <Chip label="Testimonials" color="primary" />
              <Chip label="Happy Customers" color="secondary" />
            </Box>
          </Box>
          <TestimonialsList testimonials={testimonials} currentPage={1} totalPages={1} />
        </Container>
      </Box>
    </>
  );
}
