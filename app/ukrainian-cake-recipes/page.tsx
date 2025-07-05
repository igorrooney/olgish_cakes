import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Ukrainian Cake Recipes | Traditional Ukrainian Baking | Honey Cake Recipe | Kyiv Cake Recipe | Olgish Cakes",
  description:
    "Discover authentic Ukrainian cake recipes including honey cake, Kyiv cake, and traditional Ukrainian desserts. Learn the secrets of Ukrainian baking with professional recipes and techniques.",
  keywords:
    "Ukrainian cake recipes, traditional Ukrainian baking, honey cake recipe, Kyiv cake recipe, Ukrainian dessert recipes, authentic Ukrainian cakes, Ukrainian baking techniques",
  openGraph: {
    title:
      "Ukrainian Cake Recipes | Traditional Ukrainian Baking | Honey Cake Recipe | Kyiv Cake Recipe",
    description:
      "Discover authentic Ukrainian cake recipes including honey cake, Kyiv cake, and traditional Ukrainian desserts. Learn the secrets of Ukrainian baking with professional recipes and techniques.",
    url: "https://olgishcakes.com/ukrainian-cake-recipes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.com/images/ukrainian-cake-recipes.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Cake Recipes - Traditional Ukrainian Baking",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Ukrainian Cake Recipes | Traditional Ukrainian Baking | Honey Cake Recipe | Kyiv Cake Recipe",
    description:
      "Discover authentic Ukrainian cake recipes including honey cake, Kyiv cake, and traditional Ukrainian desserts.",
    images: ["https://olgishcakes.com/images/ukrainian-cake-recipes.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/ukrainian-cake-recipes",
  },
};

export default function UkrainianCakeRecipesPage() {
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
              Traditional Ukrainian Cake Recipes
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
              Discover the authentic recipes and techniques behind traditional Ukrainian cakes. From
              honey cake to Kyiv cake, learn the secrets of Ukrainian baking that have been passed
              down through generations.
            </Typography>
            <Chip
              label="Authentic Ukrainian Baking Recipes"
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

          <Box sx={{ mb: 6 }}>
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
              Classic Ukrainian Cake Recipes
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Honey Cake (Medovik)",
                  description:
                    "The most beloved Ukrainian cake with delicate honey-infused layers and smooth sour cream filling",
                  ingredients: [
                    "Honey",
                    "Flour",
                    "Sour Cream",
                    "Butter",
                    "Eggs",
                    "Sugar",
                    "Baking Soda",
                  ],
                  difficulty: "Advanced",
                  time: "3-4 hours",
                  tips: "The key to perfect honey cake is thin, crispy layers and well-rested sour cream filling",
                },
                {
                  name: "Kyiv Cake",
                  description:
                    "Legendary Ukrainian dessert with crispy meringue layers and hazelnut-chocolate filling",
                  ingredients: [
                    "Egg Whites",
                    "Sugar",
                    "Hazelnuts",
                    "Chocolate",
                    "Butter",
                    "Vanilla",
                  ],
                  difficulty: "Expert",
                  time: "4-5 hours",
                  tips: "Perfect meringue layers require precise temperature control and careful handling",
                },
                {
                  name: "Napoleon Cake",
                  description:
                    "Ukrainian version of the classic Napoleon with flaky pastry and vanilla custard",
                  ingredients: [
                    "Puff Pastry",
                    "Milk",
                    "Vanilla",
                    "Eggs",
                    "Butter",
                    "Flour",
                    "Sugar",
                  ],
                  difficulty: "Intermediate",
                  time: "2-3 hours",
                  tips: "Allow the cake to rest overnight for the best texture and flavor development",
                },
                {
                  name: "Poppy Seed Roll (Makivnyk)",
                  description:
                    "Traditional Ukrainian poppy seed roll with soft yeast dough and sweet filling",
                  ingredients: [
                    "Poppy Seeds",
                    "Yeast Dough",
                    "Milk",
                    "Butter",
                    "Eggs",
                    "Sugar",
                    "Vanilla",
                  ],
                  difficulty: "Intermediate",
                  time: "3-4 hours",
                  tips: "Grind poppy seeds finely and soak them in milk for the best texture",
                },
              ].map((recipe, index) => (
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
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {recipe.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {recipe.description}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Key Ingredients:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                      {recipe.ingredients.map((ingredient, idx) => (
                        <Chip
                          key={idx}
                          label={ingredient}
                          size="small"
                          sx={{ backgroundColor: "primary.light", color: "primary.contrastText" }}
                        />
                      ))}
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Difficulty:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {recipe.difficulty}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Time:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {recipe.time}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Pro Tip:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {recipe.tips}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
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
                Ukrainian Baking Techniques
              </Typography>
              <Grid container spacing={4}>
                {[
                  {
                    technique: "Layered Baking",
                    description:
                      "Ukrainian cakes often feature multiple thin layers that are baked separately and then assembled with filling",
                    icon: "🥞",
                  },
                  {
                    technique: "Honey Processing",
                    description:
                      "Proper honey processing is crucial for honey cake - it must be heated to the right temperature for the best flavor",
                    icon: "🍯",
                  },
                  {
                    technique: "Meringue Making",
                    description:
                      "Perfect meringue layers require precise egg white beating and careful temperature control during baking",
                    icon: "🥚",
                  },
                  {
                    technique: "Sour Cream Filling",
                    description:
                      "Traditional Ukrainian sour cream filling requires proper straining and resting for the perfect consistency",
                    icon: "🥛",
                  },
                ].map((technique, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ textAlign: "center", p: 3 }}>
                      <Typography variant="h2" sx={{ mb: 2, fontSize: "3rem" }}>
                        {technique.icon}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                      >
                        {technique.technique}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {technique.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>

          <Box sx={{ mb: 6 }}>
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
              Essential Ukrainian Baking Tips
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Grid container spacing={3}>
                {[
                  "Always use room temperature ingredients for the best results",
                  "Honey should be heated to 110°C for optimal flavor development",
                  "Allow cakes to rest overnight for the best texture and flavor",
                  "Use high-quality sour cream with at least 20% fat content",
                  "Grind nuts finely and toast them for enhanced flavor",
                  "Don't rush the layering process - patience is key to perfect Ukrainian cakes",
                ].map((tip, index) => (
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
                      <Typography variant="body1">{tip}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>

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
              Ready to Try Ukrainian Baking?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
              Order our authentic Ukrainian cakes or join our baking classes to learn these
              traditional techniques
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
                Order Ukrainian Cakes
              </Button>
              <Button
                component={Link}
                href="/ukrainian-baking-classes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                Join Baking Classes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
