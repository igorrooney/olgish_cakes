import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cake Photography | Professional Cake Photos | Olgish Cakes",
  description:
    "Professional cake photography services in Leeds. Capture your custom cakes, wedding cakes, and celebration cakes with stunning photos.",
  keywords:
    "cake photography, professional cake photos, cake photographer Leeds, wedding cake photography, cake photo services",
  openGraph: {
    title: "Cake Photography | Professional Cake Photos",
    description:
      "Professional cake photography services in Leeds. Capture your custom cakes, wedding cakes, and celebration cakes with stunning photos.",
    url: "https://olgish-cakes.vercel.app/cake-photography",
    images: ["https://olgish-cakes.vercel.app/images/cake-photography.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Photography | Professional Cake Photos",
    description:
      "Professional cake photography services in Leeds. Capture your custom cakes, wedding cakes, and celebration cakes with stunning photos.",
    images: ["https://olgish-cakes.vercel.app/images/cake-photography.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/cake-photography",
  },
};

export default function CakePhotographyPage() {
  return (
    <>
      <Script
        id="cake-photography-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Cake Photography",
            description:
              "Professional cake photography services in Leeds. Capture your custom cakes, wedding cakes, and celebration cakes with stunning photos.",
            provider: {
              "@type": "Bakery",
              name: "Olgish Cakes",
              url: "https://olgish-cakes.vercel.app",
              telephone: "+44 786 721 8194",
              email: "olgish.cakes@gmail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "107 Harehills Lane",
                addressLocality: "Leeds",
                postalCode: "LS8 4DN",
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
            },
            serviceType: "Cake Photography",
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Photography Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Professional Cake Photography",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Wedding Cake Photography",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Celebration Cake Photography",
                  },
                },
              ],
            },
            url: "https://olgish-cakes.vercel.app/cake-photography",
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
            Cake Photography
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
            Professional cake photography for your custom cakes, wedding cakes, and celebration
            cakes in Leeds.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Professional Photos" color="primary" />
            <Chip label="Cake Gallery" color="secondary" />
            <Chip label="Wedding Cakes" color="primary" />
            <Chip label="Celebration Cakes" color="secondary" />
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h5" sx={{ color: "#005BBB", fontWeight: "bold" }}>
                Professional Lighting
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Studio and natural light setups for stunning cake photos.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h5" sx={{ color: "#005BBB", fontWeight: "bold" }}>
                Creative Styling
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Artistic styling and backgrounds to highlight your cake's beauty.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h5" sx={{ color: "#005BBB", fontWeight: "bold" }}>
                High-Resolution Images
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Perfect for websites, social media, and print.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
