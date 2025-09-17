import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Christmas Cakes Leeds | Traditional Ukrainian Christmas Cakes | Olgish Cakes",
  description:
    "Celebrate Christmas with Traditional Ukrainian Christmas cakes in Leeds. Handcrafted honey cake, Kyiv cake, and festive Ukrainian Christmas desserts. Order now for Christmas delivery.",
  keywords:
    "Christmas cakes Leeds, Ukrainian Christmas cakes, honey cake, Kyiv cake, Christmas desserts, traditional Christmas cakes, Ukrainian bakery Leeds",
  openGraph: {
    title: "Christmas Cakes Leeds | Traditional Ukrainian Christmas Cakes",
    description:
      "Celebrate Christmas with traditional Ukrainian Christmas cakes in Leeds. Handcrafted honey cake and festive Christmas desserts.",
    url: "https://olgishcakes.co.uk/christmas-cakes-leeds",
    images: ["https://olgishcakes.co.uk/images/christmas-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Christmas Cakes Leeds | Traditional Ukrainian Christmas Cakes",
    description:
      "Celebrate Christmas with traditional Ukrainian Christmas cakes in Leeds. Handcrafted honey cake and festive Christmas desserts.",
    images: ["https://olgishcakes.co.uk/images/christmas-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/christmas-cakes-leeds",
  },
};

export default function ChristmasCakesLeedsPage() {
  return (
    <>
      <Script
        id="christmas-cakes-leeds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Christmas Cakes Leeds",
            description:
              "Traditional Ukrainian Christmas cakes in Leeds. Order festive cakes for the holidays.",
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
            serviceType: "Christmas Cake Design",
            areaServed: { "@type": "City", name: "Leeds" },
            url: "https://olgishcakes.co.uk/christmas-cakes-leeds",
          }),
        }}
      />

      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "primary.main",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Christmas Cakes Leeds
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Celebrate Christmas with traditional Ukrainian Christmas cakes and honey cake.
              Handcrafted with love in Leeds, my Christmas cakes bring the real taste of Ukrainian
              Christmas celebrations to your home.
            </Typography>
            <Chip
              label="Traditional Ukrainian Christmas Cakes"
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                fontSize: "1.1rem",
                px: 3,
                py: 1,
                mb: 4,
              }}
            />
          </Box>

          {/* Christmas Traditions Section */}
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
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Ukrainian Christmas Traditions
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  <strong>Honey Cake (Medovik)</strong> is the traditional Ukrainian Christmas cake,
                  made with layers of honey-infused sponge and rich sour cream frosting. This
                  beloved dessert symbolizes sweetness, prosperity, and the warmth of family
                  gatherings during Christmas.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  In Ukrainian tradition, Christmas cakes are shared with family and friends during
                  the festive season. The honey cake represents the sweetness of life and the hope
                  for a prosperous new year.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  My Christmas cakes are made using traditional Ukrainian recipes passed down through
                  generations. Each cake is handcrafted with premium ingredients, including
                  pure honey, farm-fresh eggs, and real butter.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  I also offer modern variations of Christmas cakes, including Kyiv cake, chocolate
                  Christmas cakes, and gluten-friendly Christmas cake options for those with dietary
                  restrictions.
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Christmas Cake Varieties */}
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
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              My Christmas Cake Collection
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                  >
                    Traditional Honey Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Classic Ukrainian honey cake with multiple layers of honey sponge and rich sour
                    cream frosting. Decorated with festive Christmas patterns.
                  </Typography>
                  <Chip
                    label="Traditional Recipe"
                    sx={{ backgroundColor: "primary.main", color: "white" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                  >
                    Kyiv Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Elegant Kyiv cake with hazelnut meringue layers and chocolate ganache. A
                    sophisticated choice for Christmas celebrations.
                  </Typography>
                  <Chip
                    label="Premium Choice"
                    sx={{ backgroundColor: "primary.main", color: "white" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                  >
                    Chocolate Christmas Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Rich chocolate Christmas cake with chocolate chips and festive decorations.
                    Perfect for chocolate lovers during the holiday season.
                  </Typography>
                  <Chip
                    label="Chocolate Lover's Choice"
                    sx={{ backgroundColor: "primary.main", color: "white" }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Ordering Information */}
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
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Order Your Christmas Cakes
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h4" component="h3" sx={{ mb: 3, color: "primary.main" }}>
                  Ordering Information
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  <strong>Advance Orders:</strong> Christmas cakes should be ordered at least 5-7
                  days in advance to ensure availability and proper preparation time.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  <strong>Delivery:</strong> I offer free delivery across Leeds and around areas.
                  Christmas cakes are delivered fresh on your chosen date.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  <strong>Customization:</strong> All Christmas cakes can be customized with your
                  preferred decorations, sizes, and dietary requirements.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h4" component="h3" sx={{ mb: 3, color: "primary.main" }}>
                  Christmas Cake Features
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      sx={{
                        backgroundColor: "success.main",
                        color: "white",
                        minHeight: "44px", // WCAG touch target requirement
                        padding: "8px 16px", // Ensure adequate padding
                      }}
                    />
                    <Typography variant="body1">Handcrafted with traditional recipes</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      sx={{
                        backgroundColor: "success.main",
                        color: "white",
                        minHeight: "44px", // WCAG touch target requirement
                        padding: "8px 16px", // Ensure adequate padding
                      }}
                    />
                    <Typography variant="body1">Premium ingredients and pure honey</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      sx={{
                        backgroundColor: "success.main",
                        color: "white",
                        minHeight: "44px", // WCAG touch target requirement
                        padding: "8px 16px", // Ensure adequate padding
                      }}
                    />
                    <Typography variant="body1">Beautiful festive decorations</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      sx={{
                        backgroundColor: "success.main",
                        color: "white",
                        minHeight: "44px", // WCAG touch target requirement
                        padding: "8px 16px", // Ensure adequate padding
                      }}
                    />
                    <Typography variant="body1">Gluten-friendly options available</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      sx={{
                        backgroundColor: "success.main",
                        color: "white",
                        minHeight: "44px", // WCAG touch target requirement
                        padding: "8px 16px", // Ensure adequate padding
                      }}
                    />
                    <Typography variant="body1">Free delivery in Leeds area</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Order Your Christmas Cakes Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Celebrate Christmas with real Ukrainian Christmas cakes. Contact me to place your order
              and make sure you have the perfect Christmas cakes for your celebration.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/contact"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Order Christmas Cakes
              </Button>
              <Button
                component={Link}
                href="/traditional-ukrainian-cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View All Ukrainian Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
