import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Make Honey Cake | Traditional Ukrainian Honey Cake Recipe | Olgish Cakes",
  description:
    "Learn how to make authentic Ukrainian honey cake (Medovik) with our traditional recipe. Step-by-step instructions for the perfect honey cake layers and cream filling.",
  keywords:
    "how to make honey cake, Ukrainian honey cake recipe, Medovik recipe, traditional honey cake, honey cake layers, Ukrainian baking",
  openGraph: {
    title: "How to Make Honey Cake | Traditional Ukrainian Honey Cake Recipe",
    description:
      "Learn how to make authentic Ukrainian honey cake (Medovik) with our traditional recipe. Step-by-step instructions for the perfect honey cake.",
    url: "https://olgish-cakes.vercel.app/how-to-make-honey-cake",
    images: ["https://olgish-cakes.vercel.app/images/honey-cake-recipe.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Make Honey Cake | Traditional Ukrainian Honey Cake Recipe",
    description:
      "Learn how to make authentic Ukrainian honey cake (Medovik) with our traditional recipe. Step-by-step instructions for the perfect honey cake.",
    images: ["https://olgish-cakes.vercel.app/images/honey-cake-recipe.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/how-to-make-honey-cake",
  },
};

export default function HowToMakeHoneyCakePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "Traditional Ukrainian Honey Cake (Medovik)",
    description: "Authentic Ukrainian honey cake recipe with step-by-step instructions",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    prepTime: "PT30M",
    cookTime: "PT45M",
    totalTime: "PT4H",
    recipeYield: "1 cake (8-10 servings)",
    recipeCategory: "Dessert",
    recipeCuisine: "Ukrainian",
    image: "https://olgish-cakes.vercel.app/images/honey-cake-recipe.jpg",
    ingredients: [
      "3 cups all-purpose flour",
      "1 cup honey",
      "3 large eggs",
      "1 cup sugar",
      "1/2 cup butter",
      "1 tsp baking soda",
      "1 tsp vanilla extract",
      "2 cups sour cream",
      "1 cup heavy cream",
      "1/2 cup powdered sugar",
    ],
    instructions: [
      "Mix honey, eggs, sugar, and butter in a large bowl",
      "Add flour and baking soda, mix until smooth",
      "Divide dough into 8-10 portions and roll out thin layers",
      "Bake each layer at 350°F for 8-10 minutes",
      "Mix sour cream, heavy cream, and powdered sugar for filling",
      "Layer cake with cream filling between each layer",
      "Refrigerate for at least 3 hours before serving",
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Hero Section */}
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
            How to Make Traditional Ukrainian Honey Cake
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
            Learn the authentic recipe for Medovik, Ukraine's beloved honey cake. Step-by-step
            instructions for perfect layers and creamy filling.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Traditional Recipe" color="primary" />
            <Chip label="Step-by-Step" color="secondary" />
            <Chip label="8-10 Servings" color="primary" />
            <Chip label="4 Hours Total" color="secondary" />
          </Box>
        </Box>

        {/* Recipe Overview */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #FFD700 0%, #005BBB 100%)",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            🍯 Recipe Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Preparation Time:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                • Prep Time: 30 minutes
                <br />
                • Cook Time: 45 minutes
                <br />
                • Total Time: 4 hours (including chilling)
                <br />• Servings: 8-10 people
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Difficulty Level:
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                • Skill Level: Intermediate
                <br />
                • Equipment: Rolling pin, baking sheets
                <br />
                • Special Techniques: Layering, cream filling
                <br />• Storage: Refrigerate up to 5 days
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Ingredients */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: "#005BBB",
            }}
          >
            📝 Ingredients
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, color: "#005BBB" }}>
                  For the Cake Layers:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="3 cups all-purpose flour" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="1 cup honey (preferably Ukrainian honey)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="3 large eggs" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="1 cup granulated sugar" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="1/2 cup unsalted butter, softened" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="1 teaspoon baking soda" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="1 teaspoon vanilla extract" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, color: "#005BBB" }}>
                  For the Cream Filling:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="2 cups sour cream (full fat)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="1 cup heavy cream" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="1/2 cup powdered sugar" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="1 teaspoon vanilla extract" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Instructions */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: "#005BBB",
            }}
          >
            👩‍🍳 Step-by-Step Instructions
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                step: "1",
                title: "Prepare the Dough",
                description:
                  "In a large bowl, mix honey, eggs, sugar, and softened butter until well combined. Add flour and baking soda, mix until you have a smooth, slightly sticky dough.",
                icon: "🥣",
              },
              {
                step: "2",
                title: "Divide and Rest",
                description:
                  "Divide the dough into 8-10 equal portions. Wrap each portion in plastic wrap and refrigerate for 30 minutes to make rolling easier.",
                icon: "⏰",
              },
              {
                step: "3",
                title: "Roll Out Layers",
                description:
                  "On a floured surface, roll each portion into a thin circle (about 8-9 inches in diameter). Use a plate as a template to cut perfect circles.",
                icon: "🔄",
              },
              {
                step: "4",
                title: "Bake the Layers",
                description:
                  "Bake each layer at 350°F (175°C) for 8-10 minutes until golden brown. Let cool completely on a wire rack.",
                icon: "🔥",
              },
              {
                step: "5",
                title: "Prepare the Filling",
                description:
                  "Mix sour cream, heavy cream, powdered sugar, and vanilla extract until smooth and creamy. Refrigerate until ready to use.",
                icon: "🥄",
              },
              {
                step: "6",
                title: "Assemble the Cake",
                description:
                  "Place one layer on a serving plate, spread with cream filling, and repeat with remaining layers. Cover the top and sides with remaining cream.",
                icon: "🎂",
              },
              {
                step: "7",
                title: "Chill and Serve",
                description:
                  "Refrigerate the cake for at least 3 hours (preferably overnight) to allow the flavors to meld and the cream to set properly.",
                icon: "❄️",
              },
            ].map((instruction, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    mb: 2,
                    borderLeft: "4px solid #005BBB",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h3" sx={{ mr: 2, fontSize: "2rem" }}>
                      {instruction.icon}
                    </Typography>
                    <Box>
                      <Typography variant="h5" sx={{ color: "#005BBB", fontWeight: "bold" }}>
                        Step {instruction.step}: {instruction.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {instruction.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Tips and Variations */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: "#005BBB",
            }}
          >
            💡 Tips and Variations
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, color: "#005BBB" }}>
                  Pro Tips:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="• Use high-quality honey for the best flavor" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Don't overbake the layers - they should be golden, not dark" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Let the cake chill overnight for the best texture" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Use full-fat sour cream for the richest filling" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, color: "#005BBB" }}>
                  Variations:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="• Add chopped walnuts to the cream filling" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Use different types of honey for unique flavors" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Add a layer of fresh berries between cream layers" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Decorate with honey drizzle and edible flowers" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            Prefer to Order Instead?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Don't have time to bake? Order our authentic Ukrainian honey cake made with traditional
            recipes
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/cakes"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#005BBB",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              Order Honey Cake
            </Button>
            <Button
              component={Link}
              href="/ukrainian-cake-recipes"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              More Recipes
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
