import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";

export const metadata: Metadata = {
  title: "Cake Shipping | Cake Delivery & Shipping | Olgish Cakes",
  description:
    "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
  keywords: "cake shipping, cake delivery, cake shipping UK, cake delivery Leeds, cake packaging",
  openGraph: {
    title: "Cake Shipping | Cake Delivery & Shipping",
    description:
      "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
    url: "https://olgishcakes.com/cake-shipping",
    images: ["https://olgishcakes.com/images/cake-shipping.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Shipping | Cake Delivery & Shipping",
    description:
      "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
    images: ["https://olgishcakes.com/images/cake-shipping.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/cake-shipping",
  },
};

export default function CakeShippingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Cake Shipping",
    description: "Safe and secure cake shipping services in Leeds",
    provider: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
    serviceType: "Cake Shipping",
    url: "https://olgishcakes.com/cake-shipping",
  };

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
            Cake Shipping
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
            Learn about our cake shipping and delivery options. Nationwide shipping, local delivery,
            and safe packaging for your cakes.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Nationwide Shipping" color="primary" />
            <Chip label="Local Delivery" color="secondary" />
            <Chip label="Safe Packaging" color="primary" />
            <Chip label="Cake Delivery" color="secondary" />
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h5" sx={{ color: "#005BBB", fontWeight: "bold" }}>
                Nationwide Shipping
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We ship cakes across the UK with secure packaging and fast delivery.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h5" sx={{ color: "#005BBB", fontWeight: "bold" }}>
                Local Delivery
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Same-day and next-day delivery available in Leeds and surrounding areas.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h5" sx={{ color: "#005BBB", fontWeight: "bold" }}>
                Safe Packaging
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All cakes are packaged securely to ensure they arrive fresh and beautiful.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
