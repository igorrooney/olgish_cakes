import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ukrainian Baking Traditions | Traditional Ukrainian Baking | Olgish Cakes",
  description:
    "Discover the rich history and traditions of Ukrainian baking. Learn about traditional techniques, ingredients, and cultural significance of Ukrainian desserts.",
  keywords:
    "Ukrainian baking traditions, traditional Ukrainian baking, Ukrainian dessert history, Ukrainian cake traditions, Ukrainian baking culture",
  openGraph: {
    title: "Ukrainian Baking Traditions | Traditional Ukrainian Baking",
    description:
      "Discover the rich history and traditions of Ukrainian baking. Learn about traditional techniques, ingredients, and cultural significance of Ukrainian desserts.",
    url: "https://olgishcakes.co.uk/ukrainian-baking-traditions",
    images: ["https://olgishcakes.co.uk/images/ukrainian-baking-traditions.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ukrainian Baking Traditions | Traditional Ukrainian Baking",
    description:
      "Discover the rich history and traditions of Ukrainian baking. Learn about traditional techniques, ingredients, and cultural significance of Ukrainian desserts.",
    images: ["https://olgishcakes.co.uk/images/ukrainian-baking-traditions.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/ukrainian-baking-traditions",
  },
};

export default function UkrainianBakingTraditionsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Ukrainian Baking Traditions: A Rich Cultural Heritage",
    description:
      "Explore the traditional baking methods and cultural significance of Ukrainian desserts",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.co.uk/images/ukrainian-baking-traditions.jpg",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
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
            Ukrainian Baking Traditions
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
            Discover the rich history and cultural significance of traditional Ukrainian baking.
            From ancient techniques to modern interpretations.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Cultural Heritage" color="primary" />
            <Chip label="Traditional Techniques" color="secondary" />
            <Chip label="Family Recipes" color="primary" />
            <Chip label="Modern Revival" color="secondary" />
          </Box>
        </Box>

        {/* Historical Overview */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            🏺 Historical Roots of Ukrainian Baking
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
            Ukrainian baking traditions date back centuries, with roots in ancient Slavic culture.
            The fertile soil of Ukraine, known as the "breadbasket of Europe," provided abundant
            wheat, honey, and dairy products that became the foundation of traditional baking.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            These traditions were passed down through generations, with each family developing their
            own variations of classic recipes. Today, these time-honored techniques continue to
            inspire modern Ukrainian bakers around the world.
          </Typography>
        </Paper>

        {/* Traditional Ingredients */}
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
            🌾 Traditional Ukrainian Baking Ingredients
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Honey",
                description:
                  "The golden nectar of Ukrainian baking, used in everything from honey cake to traditional pastries",
                icon: "🍯",
                details: "Ukrainian honey is prized for its rich flavor and medicinal properties",
              },
              {
                title: "Wheat Flour",
                description:
                  "High-quality wheat flour forms the foundation of most Ukrainian baked goods",
                icon: "🌾",
                details: "Traditionally stone-ground for the best texture and flavor",
              },
              {
                title: "Sour Cream",
                description: "Essential for rich, creamy fillings and tender cake layers",
                icon: "🥛",
                details: "Full-fat sour cream adds moisture and authentic flavor",
              },
              {
                title: "Butter",
                description: "Used generously in traditional recipes for rich, flaky textures",
                icon: "🧈",
                details: "High-quality butter is crucial for authentic taste",
              },
              {
                title: "Eggs",
                description: "Fresh farm eggs provide structure and richness to Ukrainian desserts",
                icon: "🥚",
                details: "Traditionally from free-range chickens for the best quality",
              },
              {
                title: "Vanilla",
                description: "Natural vanilla adds warmth and depth to traditional recipes",
                icon: "🌿",
                details: "Often used in combination with other natural flavorings",
              },
            ].map((ingredient, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {ingredient.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, color: "#005BBB" }}>
                    {ingredient.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {ingredient.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ingredient.details}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Traditional Techniques */}
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
            👩‍🍳 Traditional Ukrainian Baking Techniques
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Layered Baking",
                description:
                  "Creating thin, delicate layers that are baked separately and assembled with cream fillings",
                icon: "🥞",
                technique: "Each layer is rolled thin and baked individually for perfect texture",
              },
              {
                title: "Slow Fermentation",
                description:
                  "Allowing dough to develop flavor through natural fermentation processes",
                icon: "⏰",
                technique:
                  "Traditional recipes often require overnight resting for optimal results",
              },
              {
                title: "Hand Kneading",
                description: "Using hands to develop gluten and create the perfect dough texture",
                icon: "🤲",
                technique: "Manual kneading ensures proper gluten development and texture",
              },
              {
                title: "Precise Temperature Control",
                description: "Maintaining exact temperatures for consistent baking results",
                icon: "🌡️",
                technique: "Traditional ovens required careful temperature monitoring",
              },
              {
                title: "Natural Sweeteners",
                description: "Using honey and natural sugars instead of refined sweeteners",
                icon: "🍯",
                technique: "Honey provides both sweetness and moisture to baked goods",
              },
              {
                title: "Cream Assembly",
                description:
                  "Carefully layering cream fillings between cake layers for perfect balance",
                icon: "🥄",
                technique: "Each layer is carefully spread with cream for even distribution",
              },
            ].map((technique, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {technique.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, color: "#005BBB" }}>
                    {technique.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {technique.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {technique.technique}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Cultural Significance */}
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
            🏛️ Cultural Significance of Ukrainian Baking
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Family Traditions:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Ukrainian baking is deeply rooted in family traditions. Recipes are passed down from
                generation to generation, with each family adding their own unique touches. Baking
                together strengthens family bonds and preserves cultural heritage.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Celebrations and Holidays:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Special cakes and pastries are central to Ukrainian celebrations. From weddings to
                religious holidays, traditional baked goods symbolize joy, prosperity, and the
                sweetness of life.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Modern Revival */}
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
            🌟 Modern Revival of Ukrainian Baking
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: "1.1rem", textAlign: "center" }}>
            Today, Ukrainian baking traditions are experiencing a renaissance, with modern bakers
            combining traditional techniques with contemporary approaches. This revival ensures that
            these precious cultural traditions continue to thrive and evolve.
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Traditional Recipes",
                description: "Preserving authentic recipes and techniques for future generations",
                icon: "📜",
              },
              {
                title: "Modern Adaptations",
                description:
                  "Adapting traditional recipes for contemporary tastes and dietary needs",
                icon: "✨",
              },
              {
                title: "Global Influence",
                description: "Sharing Ukrainian baking traditions with the world",
                icon: "🌍",
              },
              {
                title: "Cultural Preservation",
                description: "Ensuring Ukrainian baking heritage continues to thrive",
                icon: "🏺",
              },
            ].map((aspect, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {aspect.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, color: "#005BBB" }}>
                    {aspect.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {aspect.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
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
            Experience Ukrainian Baking Traditions
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Taste the authentic flavors of traditional Ukrainian baking with our handcrafted cakes
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
              Browse Traditional Cakes
            </Button>
            <Button
              component={Link}
              href="/ukrainian-baking-classes"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Learn to Bake
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
