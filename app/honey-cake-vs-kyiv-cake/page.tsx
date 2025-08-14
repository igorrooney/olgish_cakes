�import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Honey Cake vs Kyiv Cake | Ukrainian Cake Comparison | Traditional Ukrainian Desserts | Olgish Cakes",
  description:
    "Compare honey cake vs Kyiv cake: two iconic Ukrainian desserts. Learn the differences in ingredients, taste, history, and preparation. Which Ukrainian cake is right for your celebration?",
  keywords:
    "honey cake vs Kyiv cake, Ukrainian cake comparison, traditional Ukrainian desserts, honey cake, Kyiv cake, Ukrainian honey cake, Ukrainian chocolate cake, Ukrainian dessert guide",
  openGraph: {
    title: "Honey Cake vs Kyiv Cake | Ukrainian Cake Comparison | Traditional Ukrainian Desserts",
    description:
      "Compare honey cake vs Kyiv cake: two iconic Ukrainian desserts. Learn the differences in ingredients, taste, history, and preparation.",
    url: "https://olgishcakes.co.uk/honey-cake-vs-kyiv-cake",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/honey-cake-vs-kyiv-cake.jpg",
        width: 1200,
        height: 630,
        alt: "Honey Cake vs Kyiv Cake Comparison - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Honey Cake vs Kyiv Cake | Ukrainian Cake Comparison | Traditional Ukrainian Desserts",
    description:
      "Compare honey cake vs Kyiv cake: two iconic Ukrainian desserts. Learn the differences in ingredients, taste, history, and preparation.",
    images: ["https://olgishcakes.co.uk/images/honey-cake-vs-kyiv-cake.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/honey-cake-vs-kyiv-cake",
  },
};

export default function HoneyCakeVsKyivCakePage() {
  return (
    <>
      <Script
        id="honey-cake-vs-kyiv-cake-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Honey Cake vs Kyiv Cake",
            description:
              "Compare Ukrainian honey cake (medovik) and Kyiv cake. Learn about their differences and traditions.",
            url: "https://olgishcakes.co.uk/honey-cake-vs-kyiv-cake",
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
              Honey Cake vs Kyiv Cake: Ukrainian Cake Comparison
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
              Discover the differences between two of Ukraine's most beloved cakes: honey cake and
              Kyiv cake. Learn about their unique ingredients, flavors, history, and which one might
              be perfect for your celebration.
            </Typography>
            <Chip
              label="Ukrainian Cake Guide & Comparison"
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

          {/* Cake Images Comparison */}
          <Box sx={{ mb: 8 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 300,
                      backgroundImage: "url(/images/cakes/honey-cake.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      Honey Cake
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                      The traditional Ukrainian honey cake with multiple layers of honey-infused
                      sponge and creamy filling.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 300,
                      backgroundImage: "url(/images/cakes/kyiv-cake.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      Kyiv Cake
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                      The elegant chocolate cake with meringue layers and hazelnut filling, named
                      after Ukraine's capital.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Detailed Comparison Table */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Detailed Comparison
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "primary.main" }}>
                    <TableCell sx={{ color: "white", fontWeight: 600, fontSize: "1.1rem" }}>
                      Feature
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600, fontSize: "1.1rem" }}>
                      Honey Cake
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600, fontSize: "1.1rem" }}>
                      Kyiv Cake
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      feature: "Main Ingredient",
                      honeyCake: "Honey",
                      kyiv: "Chocolate",
                    },
                    {
                      feature: "Texture",
                      honeyCake: "Soft, layered sponge",
                      kyiv: "Crispy meringue layers",
                    },
                    {
                      feature: "Filling",
                      honeyCake: "Creamy sour cream",
                      kyiv: "Hazelnut cream",
                    },
                    {
                      feature: "Flavor Profile",
                      honeyCake: "Sweet, honey, warm spices",
                      kyiv: "Rich chocolate, nutty",
                    },
                    {
                      feature: "Appearance",
                      honeyCake: "Golden brown layers",
                      kyiv: "Dark chocolate with nuts",
                    },
                    {
                      feature: "Difficulty Level",
                      honeyCake: "Moderate",
                      kyiv: "Advanced",
                    },
                    {
                      feature: "Preparation Time",
                      honeyCake: "2-3 hours",
                      kyiv: "4-5 hours",
                    },
                    {
                      feature: "Best For",
                      honeyCake: "Family gatherings, holidays",
                      kyiv: "Special occasions, celebrations",
                    },
                    {
                      feature: "Price Range",
                      honeyCake: "£35-£50",
                      kyiv: "£40-£60",
                    },
                  ].map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:nth-of-type(odd)": { backgroundColor: "rgba(0,0,0,.02)" } }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                        {row.feature}
                      </TableCell>
                      <TableCell>{row.honeyCake}</TableCell>
                      <TableCell>{row.kyiv}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* History and Origins */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              History & Origins
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
                  >
                    Honey Cake History
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Honey cake, meaning "honey cake" in Ukrainian, has ancient roots in Ukrainian
                    baking traditions. Originally made with honey as a natural sweetener, this cake
                    became popular during the 19th century.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    The cake's distinctive layered structure was developed to showcase the baker's
                    skill and create a beautiful presentation. Each layer is individually baked and
                    then assembled with cream filling.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    Today, honey cake is considered one of Ukraine's national desserts and is often
                    served during holidays, weddings, and special family celebrations.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
                  >
                    Kyiv Cake History
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Kyiv cake was created in 1956 at the Karl Marx Confectionery Factory in Kyiv
                    (now the Roshen factory). It was designed to be a sophisticated dessert that
                    would represent the capital city.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    The cake's unique combination of chocolate, meringue, and hazelnuts was inspired
                    by European confectionery traditions but adapted with Ukrainian ingredients and
                    techniques.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    Kyiv cake quickly became a symbol of Ukrainian confectionery excellence and is
                    now one of the country's most famous and beloved desserts, often given as gifts
                    and served at important events.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Which Cake to Choose */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
            >
              Which Cake Should You Choose?
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #FEF102 0%, #FFA000 100%)",
                    color: "white",
                  }}
                >
                  <Typography variant="h3" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                    Choose Honey Cake If:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    ⬢ You love honey and warm spices
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    ⬢ You prefer softer, more traditional textures
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    ⬢ You're celebrating family gatherings or holidays
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    ⬢ You want a cake with rich cultural history
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    ⬢ You're looking for a more affordable option
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #8D6E63 0%, #5D4037 100%)",
                    color: "white",
                  }}
                >
                  <Typography variant="h3" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                    Choose Kyiv Cake If:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    ⬢ You're a chocolate lover
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    ⬢ You prefer sophisticated, elegant desserts
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    ⬢ You're celebrating special occasions or events
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    ⬢ You want to impress guests with unique flavors
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    ⬢ You're looking for a premium dessert experience
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
              Try Both Ukrainian Classics
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Can't decide? Why not try both! Order honey cake and Kyiv cake for your next
              celebration and experience the best of Ukrainian baking traditions. Contact us to
              place your order or get a custom combination.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                component={Link}
                href="/contact"
                sx={{
                  backgroundColor: "primary.main",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Order Both Cakes
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/traditional-ukrainian-cakes"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
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

