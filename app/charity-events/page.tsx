import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Charity Events | Ukrainian Cake Fundraisers | Olgish Cakes",
  description:
    "Learn about charity events and fundraisers supported by Olgish Cakes. Join our Ukrainian cake charity events and help support good causes in Leeds.",
  keywords:
    "charity events, cake fundraisers, Ukrainian charity Leeds, cake charity events, Olgish Cakes charity",
  openGraph: {
    title: "Charity Events | Ukrainian Cake Fundraisers",
    description:
      "Learn about charity events and fundraisers supported by Olgish Cakes. Join our Ukrainian cake charity events and help support good causes in Leeds.",
    url: "https://olgishcakes.co.uk/charity-events",
    images: ["https://olgishcakes.co.uk/images/charity-events.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Charity Events | Ukrainian Cake Fundraisers",
    description:
      "Learn about charity events and fundraisers supported by Olgish Cakes. Join our Ukrainian cake charity events and help support good causes in Leeds.",
    images: ["https://olgishcakes.co.uk/images/charity-events.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/charity-events",
  },
};

export default function CharityEventsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Charity Events",
    description: "Supporting local charities and community events in Leeds",
    url: "https://olgishcakes.co.uk/charity-events",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Charity Events" }]} />
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
              Charity Events
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
              Join our Ukrainian cake charity events and help support good causes in Leeds and West
              Yorkshire.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip label="Charity" color="primary" />
              <Chip label="Fundraisers" color="secondary" />
              <Chip label="Community" color="primary" />
              <Chip label="Events" color="secondary" />
            </Box>
          </Box>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
              Upcoming Charity Events
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - Ukrainian Cake Bake Sale for Refugee Support
              <br />- Charity Cake Auction
              <br />- Community Fundraiser for Ukraine
              <br />- Holiday Cake Drive
            </Typography>
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
              How to Get Involved
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - Volunteer at our charity events
              <br />- Donate cakes or ingredients
              <br />- Spread the word on social media
              <br />- Attend our fundraisers and support good causes
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
