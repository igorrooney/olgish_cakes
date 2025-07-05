import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Easter Cakes Leeds | Traditional Ukrainian Easter Cakes | Olgish Cakes",
  description:
    "Celebrate Easter with traditional Ukrainian Easter cakes in Leeds. Handcrafted Paska bread, sweet Easter cakes, and festive Ukrainian Easter desserts. Order now for Easter delivery.",
  keywords:
    "Easter cakes Leeds, Ukrainian Easter cakes, Paska bread, Easter desserts, traditional Easter cakes, Ukrainian bakery Leeds",
  openGraph: {
    title: "Easter Cakes Leeds | Traditional Ukrainian Easter Cakes",
    description:
      "Celebrate Easter with traditional Ukrainian Easter cakes in Leeds. Handcrafted Paska bread and festive Easter desserts.",
    url: "https://olgishcakes.com/easter-cakes-leeds",
    images: ["https://olgishcakes.com/images/easter-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Easter Cakes Leeds | Traditional Ukrainian Easter Cakes",
    description:
      "Celebrate Easter with traditional Ukrainian Easter cakes in Leeds. Handcrafted Paska bread and festive Easter desserts.",
    images: ["https://olgishcakes.com/images/easter-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/easter-cakes-leeds",
  },
};

export default async function EasterCakesLeedsPage() {
  const allCakes = await getAllCakes();
  const traditionalCakes = allCakes.filter(cake => cake.category === "traditional");

  return (
    <>
      <StructuredData />
      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
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
              Easter Cakes Leeds
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Celebrate Easter with traditional Ukrainian Easter cakes and Paska bread. Handcrafted
              with love in Leeds, our Easter cakes bring the authentic taste of Ukrainian Easter
              celebrations to your home.
            </Typography>
            <Chip
              label="Traditional Ukrainian Easter Cakes"
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
              Ukrainian Easter Traditions
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  <strong>Paska</strong> is the traditional Ukrainian Easter bread, rich with eggs,
                  butter, and sweetened with honey. This golden, dome-shaped bread is decorated with
                  intricate patterns and religious symbols, representing the resurrection and new
                  life.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  In Ukrainian tradition, Easter cakes are blessed in church on Easter Sunday and
                  shared with family and friends. The sweet, rich bread symbolizes the sweetness of
                  life and the joy of resurrection.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  Our Easter cakes are made using traditional Ukrainian recipes passed down through
                  generations. Each cake is handcrafted with premium ingredients, including
                  farm-fresh eggs, real butter, and pure honey.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  We also offer modern variations of Easter cakes, including chocolate Easter cakes,
                  fruit-filled Easter bread, and gluten-friendly Easter cake options for those with
                  dietary restrictions.
                </Typography>
              </Grid>
            </Grid>
          </Paper>

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
              Our Easter Cake Collection
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 2,
                    }}
                  >
                    Traditional Paska
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Classic Ukrainian Easter bread with rich, sweet dough, decorated with
                    traditional patterns and symbols. Made with honey, eggs, and butter.
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
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 2,
                    }}
                  >
                    Chocolate Easter Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Rich chocolate Easter cake with chocolate chips and cocoa. A modern twist on
                    traditional Easter bread, perfect for chocolate lovers.
                  </Typography>
                  <Chip
                    label="Chocolate Lover's Choice"
                    sx={{ backgroundColor: "primary.main", color: "white" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 2,
                    }}
                  >
                    Fruit Easter Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Sweet Easter bread filled with dried fruits, nuts, and citrus zest. A festive
                    and colorful addition to your Easter celebration.
                  </Typography>
                  <Chip
                    label="Fruit & Nut Blend"
                    sx={{ backgroundColor: "primary.main", color: "white" }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

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
              Order Your Easter Cakes
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
                  Ordering Information
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  <strong>Advance Orders:</strong> Easter cakes should be ordered at least 3-5 days
                  in advance to ensure availability and proper preparation time.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  <strong>Delivery:</strong> We offer free delivery across Leeds and surrounding
                  areas. Easter cakes are delivered fresh on your chosen date.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  <strong>Customization:</strong> All Easter cakes can be customized with your
                  preferred decorations, sizes, and dietary requirements.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
                  Easter Cake Features
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      size="small"
                      sx={{ backgroundColor: "success.main", color: "white" }}
                    />
                    <Typography variant="body1">Handcrafted with traditional recipes</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      size="small"
                      sx={{ backgroundColor: "success.main", color: "white" }}
                    />
                    <Typography variant="body1">Premium ingredients and fresh eggs</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      size="small"
                      sx={{ backgroundColor: "success.main", color: "white" }}
                    />
                    <Typography variant="body1">Beautiful traditional decorations</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      size="small"
                      sx={{ backgroundColor: "success.main", color: "white" }}
                    />
                    <Typography variant="body1">Gluten-friendly options available</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="✓"
                      size="small"
                      sx={{ backgroundColor: "success.main", color: "white" }}
                    />
                    <Typography variant="body1">Free delivery in Leeds area</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Order Your Easter Cakes Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Celebrate Easter with authentic Ukrainian Easter cakes. Contact us to place your order
              and ensure you have the perfect Easter cakes for your celebration.
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
                Order Easter Cakes
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
