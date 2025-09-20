import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Birthday Cake Gallery | Ukrainian Cakes",
  description:
    "Browse my birthday cake gallery. See beautiful Ukrainian birthday cakes, custom designs, and inspiration for your next celebration.",
  keywords:
    "birthday cake gallery, Ukrainian birthday cakes, birthday cake designs, birthday cake inspiration, birthday cake photos",
  openGraph: {
    title: "Birthday Cake Gallery | Ukrainian Cakes",
    description:
      "Browse my birthday cake gallery. See beautiful Ukrainian birthday cakes, custom designs, and inspiration for your next celebration.",
    url: "https://olgishcakes.co.uk/birthday-cake-gallery",
    images: ["https://olgishcakes.co.uk/images/birthday-cake-gallery.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Birthday Cake Gallery | Ukrainian Cakes",
    description:
      "Browse my birthday cake gallery. See beautiful Ukrainian birthday cakes, custom designs, and inspiration for your next celebration.",
    images: ["https://olgishcakes.co.uk/images/birthday-cake-gallery.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/birthday-cake-gallery",
  },
};

export default async function BirthdayCakeGalleryPage() {
  const allCakes = await getAllCakes();
  // Filter for birthday cakes if possible, otherwise show all
  const birthdayCakes = allCakes.filter(cake => cake.category?.toLowerCase().includes("birthday"));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Birthday Cake Gallery",
    description:
      "Browse my birthday cake gallery. See beautiful Ukrainian birthday cakes, custom designs, and inspiration for your next celebration.",
    url: "https://olgishcakes.co.uk/birthday-cake-gallery",
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
            { label: "Birthday Cakes", href: "/birthday-cakes" },
            { label: "Gallery", href: "/birthday-cake-gallery" },
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
              color: "#005BBB",
            }}
          >
            Birthday Cake Gallery
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
            Explore my gallery of beautiful Ukrainian birthday cakes and custom designs. Get
            inspired for your next celebration!
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Birthday Cakes" color="primary" />
            <Chip label="Gallery" color="secondary" />
            <Chip label="Custom Designs" color="primary" />
            <Chip label="Inspiration" color="secondary" />
          </Box>
        </Box>
        <Grid container spacing={3}>
          {(birthdayCakes.length > 0 ? birthdayCakes : allCakes).map(cake => (
            <Grid item xs={12} sm={6} md={4} key={cake._id}>
              <CakeCard cake={cake} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
