import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Wedding Cake Gallery | Ukrainian Wedding Cakes | Olgish Cakes",
  description:
    "Browse our wedding cake gallery. See beautiful Ukrainian wedding cakes, custom designs, and inspiration for your special day.",
  keywords:
    "wedding cake gallery, Ukrainian wedding cakes, wedding cake designs, wedding cake inspiration, wedding cake photos",
  openGraph: {
    title: "Wedding Cake Gallery | Ukrainian Wedding Cakes",
    description:
      "Browse our wedding cake gallery. See beautiful Ukrainian wedding cakes, custom designs, and inspiration for your special day.",
    url: "https://olgishcakes.co.uk/wedding-cake-gallery",
    images: ["https://olgishcakes.co.uk/images/wedding-cake-gallery.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Cake Gallery | Ukrainian Wedding Cakes",
    description:
      "Browse our wedding cake gallery. See beautiful Ukrainian wedding cakes, custom designs, and inspiration for your special day.",
    images: ["https://olgishcakes.co.uk/images/wedding-cake-gallery.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/wedding-cake-gallery",
  },
};

export default async function WeddingCakeGalleryPage() {
  const allCakes = await getAllCakes();
  // Filter for wedding cakes if possible, otherwise show all
  const weddingCakes = allCakes.filter(cake => cake.category?.toLowerCase().includes("wedding"));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Wedding Cake Gallery",
    description:
      "Browse our wedding cake gallery. See beautiful Ukrainian wedding cakes, custom designs, and inspiration for your special day.",
    url: "https://olgishcakes.co.uk/wedding-cake-gallery",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Wedding Cakes", href: "/wedding-cakes" },
            { label: "Gallery", href: "/wedding-cake-gallery" },
          ]}
        />

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
            Wedding Cake Gallery
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
            Explore our gallery of beautiful Ukrainian wedding cakes and custom designs. Get
            inspired for your special day!
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Wedding Cakes" color="primary" />
            <Chip label="Gallery" color="secondary" />
            <Chip label="Custom Designs" color="primary" />
            <Chip label="Inspiration" color="secondary" />
          </Box>
        </Box>
        <Grid container spacing={3}>
          {(weddingCakes.length > 0 ? weddingCakes : allCakes).map(cake => (
            <Grid item xs={12} sm={6} md={4} key={cake._id}>
              <CakeCard cake={cake} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

