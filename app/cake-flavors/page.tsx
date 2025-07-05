import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Ukrainian Cake Flavors | Medovik Cake | Kyiv Cake | Traditional Ukrainian Desserts | Olgish Cakes",
  description:
    "Discover authentic Ukrainian cake flavors including Medovik, Kyiv cake, Napoleon, and more. Learn about traditional Ukrainian desserts and their cultural significance.",
  keywords:
    "Ukrainian cake flavors, Medovik cake, Kyiv cake, traditional Ukrainian desserts, Ukrainian honey cake, Ukrainian cake recipes, authentic Ukrainian sweets, Ukrainian dessert flavors",
  openGraph: {
    title: "Ukrainian Cake Flavors | Medovik Cake | Kyiv Cake | Traditional Ukrainian Desserts",
    description:
      "Discover authentic Ukrainian cake flavors including Medovik, Kyiv cake, Napoleon, and more. Learn about traditional Ukrainian desserts and their cultural significance.",
    url: "https://olgish-cakes.vercel.app/cake-flavors",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/ukrainian-cake-flavors.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Cake Flavors - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ukrainian Cake Flavors | Medovik Cake | Kyiv Cake | Traditional Ukrainian Desserts",
    description:
      "Discover authentic Ukrainian cake flavors including Medovik, Kyiv cake, Napoleon, and more.",
    images: ["https://olgish-cakes.vercel.app/images/ukrainian-cake-flavors.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/cake-flavors",
  },
};

export default function CakeFlavorsPage() {
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
              Ukrainian Cake Flavors
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
              Discover the rich and diverse flavors of traditional Ukrainian cakes. Each flavor
              tells a story of Ukrainian culture, tradition, and the art of baking passed down
              through generations.
            </Typography>
            <Chip
              label="Authentic Ukrainian Flavors"
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

          {/* Traditional Ukrainian Flavors */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Traditional Ukrainian Cake Flavors
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Medovik (Honey Cake)",
                  description:
                    "The most beloved Ukrainian cake, featuring delicate honey-infused layers with smooth sour cream filling. Each layer is thin and crispy, creating a melt-in-your-mouth texture.",
                  ingredients: ["Honey", "Flour", "Sour Cream", "Butter", "Eggs", "Sugar"],
                  cultural:
                    "Traditionally served at weddings and celebrations, symbolizing sweetness and prosperity",
                  icon: "🍯",
                },
                {
                  name: "Kyiv Cake",
                  description:
                    "The legendary Kyiv cake features crispy meringue layers with hazelnuts, filled with rich chocolate-buttercream frosting. A perfect harmony of crunchy and creamy textures.",
                  ingredients: [
                    "Meringue",
                    "Hazelnuts",
                    "Chocolate",
                    "Buttercream",
                    "Eggs",
                    "Sugar",
                  ],
                  cultural:
                    "Named after Ukraine's capital, this cake represents Ukrainian culinary excellence",
                  icon: "🏛️",
                },
                {
                  name: "Napoleon Cake",
                  description:
                    "Ukrainian version of the classic Napoleon with multiple layers of flaky puff pastry and rich vanilla custard cream. Each slice reveals beautiful layers of culinary craftsmanship.",
                  ingredients: ["Puff Pastry", "Milk", "Vanilla", "Eggs", "Butter", "Flour"],
                  cultural:
                    "A sophisticated dessert often served at formal celebrations and family gatherings",
                  icon: "🥐",
                },
                {
                  name: "Poppy Seed Roll (Makivnyk)",
                  description:
                    "Traditional Ukrainian poppy seed roll with soft yeast dough filled with generous sweetened poppy seed filling. A perfect balance of soft bread and rich filling.",
                  ingredients: ["Poppy Seeds", "Yeast Dough", "Milk", "Butter", "Eggs", "Sugar"],
                  cultural: "Poppy seeds symbolize fertility and abundance in Ukrainian culture",
                  icon: "🌱",
                },
                {
                  name: "Cherry Cake (Vyshnevyi)",
                  description:
                    "A delightful Ukrainian cherry cake featuring layers of soft sponge cake filled with sweet-tart cherry filling and topped with vanilla cream.",
                  ingredients: [
                    "Cherries",
                    "Sponge Cake",
                    "Vanilla Cream",
                    "Eggs",
                    "Flour",
                    "Sugar",
                  ],
                  cultural:
                    "Cherries represent the sweetness of life and are often used in Ukrainian celebrations",
                  icon: "🍒",
                },
                {
                  name: "Apple Cake (Yabluchnyk)",
                  description:
                    "Traditional Ukrainian apple cake with layers of tender cake and spiced apple filling, often served during autumn celebrations.",
                  ingredients: ["Apples", "Cinnamon", "Flour", "Butter", "Eggs", "Sugar"],
                  cultural: "Apples symbolize health and wisdom in Ukrainian folklore",
                  icon: "🍎",
                },
              ].map((flavor, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Typography variant="h2" sx={{ mr: 2, fontSize: "2.5rem" }}>
                        {flavor.icon}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: "primary.main" }}>
                        {flavor.name}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {flavor.description}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Key Ingredients:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {flavor.ingredients.map((ingredient, idx) => (
                          <Chip
                            key={idx}
                            label={ingredient}
                            size="small"
                            sx={{
                              backgroundColor: "primary.light",
                              color: "primary.contrastText",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        Cultural Significance:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {flavor.cultural}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Modern Ukrainian Flavors */}
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
              Modern Ukrainian-Inspired Flavors
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              While we honor traditional Ukrainian recipes, we also create modern interpretations
              that blend Ukrainian techniques with contemporary flavors, appealing to today's
              diverse tastes.
            </Typography>
            <Grid container spacing={3}>
              {[
                "Vanilla Bean with Ukrainian Twist - Classic vanilla enhanced with traditional Ukrainian spices",
                "Chocolate Fudge Ukrainian Style - Rich chocolate layers with Ukrainian cream cheese frosting",
                "Lemon Poppy Seed - Light and refreshing with traditional Ukrainian poppy seeds",
                "Red Velvet Ukrainian - Classic red velvet with Ukrainian cream cheese and honey notes",
                "Strawberry Cream - Fresh strawberries with traditional Ukrainian sour cream filling",
                "Carrot Cake Ukrainian - Traditional carrot cake with Ukrainian spices and honey glaze",
                "Coffee Walnut - Rich coffee flavor with Ukrainian walnut filling",
                "Orange Almond - Citrus freshness with traditional Ukrainian almond paste",
              ].map((flavor, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        mr: 2,
                      }}
                    />
                    <Typography variant="body1">{flavor}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Seasonal Flavors */}
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
              Seasonal Ukrainian Flavors
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Ukrainian baking traditions are deeply connected to the seasons, with different
              flavors and ingredients celebrated throughout the year.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  season: "Spring",
                  flavors: [
                    "Cherry Blossom Cake with fresh spring cherries",
                    "Lemon Lavender with Ukrainian honey",
                    "Rhubarb and Vanilla with traditional spices",
                  ],
                  icon: "🌸",
                },
                {
                  season: "Summer",
                  flavors: [
                    "Berry Medley with Ukrainian sour cream",
                    "Peach and Honey with traditional herbs",
                    "Lemon Poppy Seed with fresh citrus",
                  ],
                  icon: "☀️",
                },
                {
                  season: "Autumn",
                  flavors: [
                    "Apple Cinnamon with Ukrainian spices",
                    "Pumpkin and Honey with traditional fall flavors",
                    "Walnut and Maple with Ukrainian cream",
                  ],
                  icon: "🍂",
                },
                {
                  season: "Winter",
                  flavors: [
                    "Christmas Medovik with festive spices",
                    "Chestnut and Chocolate with Ukrainian cream",
                    "Cranberry and Orange with traditional winter herbs",
                  ],
                  icon: "❄️",
                },
              ].map((season, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: "3rem" }}>
                      {season.icon}
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}>
                      {season.season}
                    </Typography>
                    {season.flavors.map((flavor, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                        {flavor}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Flavor Pairing Guide */}
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
              Ukrainian Flavor Pairing Guide
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Discover the perfect combinations of Ukrainian cake flavors with traditional beverages
              and accompaniments for an authentic Ukrainian experience.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  cake: "Medovik (Honey Cake)",
                  pairings: ["Ukrainian Tea", "Honey Wine", "Sour Cream", "Fresh Berries"],
                  description:
                    "The honey notes pair beautifully with traditional Ukrainian tea and honey wine",
                },
                {
                  cake: "Kyiv Cake",
                  pairings: ["Strong Coffee", "Dark Chocolate", "Hazelnuts", "Vanilla Ice Cream"],
                  description:
                    "Rich chocolate flavors complement strong coffee and dark chocolate accompaniments",
                },
                {
                  cake: "Napoleon Cake",
                  pairings: ["Light Tea", "Fresh Cream", "Strawberries", "Mint"],
                  description: "Delicate layers pair well with light beverages and fresh fruit",
                },
                {
                  cake: "Poppy Seed Roll",
                  pairings: ["Milk", "Honey", "Dried Fruits", "Nuts"],
                  description: "Traditional pairing with milk and honey for a wholesome experience",
                },
              ].map((pairing, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {pairing.cake}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {pairing.pairings.map((item, idx) => (
                        <Chip
                          key={idx}
                          label={item}
                          size="small"
                          sx={{
                            m: 0.5,
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {pairing.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Experience Ukrainian Flavors
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
              Order your favorite Ukrainian cake flavor today and taste the authentic flavors of
              Ukraine
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/cakes"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View Our Cakes
              </Button>
              <Button
                component={Link}
                href="/contact"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                Order Custom Cake
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
