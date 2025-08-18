import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cake Shipping | Cake Delivery & Shipping | Olgish Cakes",
  description:
    "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
  keywords: "cake shipping, cake delivery, cake shipping UK, cake delivery Leeds, cake packaging",
  openGraph: {
    title: "Cake Shipping | Cake Delivery & Shipping",
    description:
      "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
    url: "https://olgishcakes.co.uk/cake-shipping",
    images: ["https://olgishcakes.co.uk/images/cake-shipping.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Shipping | Cake Delivery & Shipping",
    description:
      "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
    images: ["https://olgishcakes.co.uk/images/cake-shipping.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-shipping",
  },
  authors: [{ name: "Olgish Cakes", url: "https://olgishcakes.co.uk" }],
  creator: "Olgish Cakes",
  publisher: "Olgish Cakes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://olgishcakes.co.uk"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "ggHjlSwV1aM_lVT4IcRSlUIk6Vn98ZbJ_FGCepoVi64",
  },
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
  },
};

export default function CakeShippingPage() {
  return (
    <>
      <Script
        id="cake-shipping-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Cake Shipping",
            description:
              "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
            provider: {
              "@type": "Bakery",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
              telephone: "+44 786 721 8194",
              email: "hello@olgishcakes.co.uk",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Allerton Grange",
                addressLocality: "Leeds",
                postalCode: "LS17",
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
            },
            serviceType: "Cake Shipping and Delivery",
            areaServed: [
              {
                "@type": "City",
                name: "Leeds",
              },
              {
                "@type": "Country",
                name: "United Kingdom",
              },
            ],
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Shipping Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Nationwide Shipping",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Local Delivery",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Safe Packaging",
                  },
                },
              ],
            },
            url: "https://olgishcakes.co.uk/cake-shipping",
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
              <Typography variant="h3" component="h3" sx={{ color: "#005BBB", fontWeight: "bold" }}>
                Nationwide Shipping
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We ship cakes across the UK with secure packaging and fast delivery.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h3" component="h3" sx={{ color: "#005BBB", fontWeight: "bold" }}>
                Local Delivery
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Same-day and next-day delivery available in Leeds and surrounding areas.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h3" component="h3" sx={{ color: "#005BBB", fontWeight: "bold" }}>
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
