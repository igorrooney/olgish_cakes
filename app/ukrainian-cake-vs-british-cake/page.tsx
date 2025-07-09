import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
export const metadata: Metadata = {
  title: "Ukrainian Cake vs British Cake | Cake Comparison | Olgish Cakes",
  description:
    "Compare Ukrainian cakes and British cakes. Discover the differences in ingredients, flavors, and traditions between these two cake cultures.",
  keywords:
    "Ukrainian cake vs British cake, cake comparison, Ukrainian cakes, British cakes, cake culture, cake traditions",
  openGraph: {
    title: "Ukrainian Cake vs British Cake | Cake Comparison",
    description:
      "Compare Ukrainian cakes and British cakes. Discover the differences in ingredients, flavors, and traditions between these two cake cultures.",
    url: "https://olgishcakes.com/ukrainian-cake-vs-british-cake",
    images: ["https://olgishcakes.com/images/ukrainian-cake-vs-british-cake.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ukrainian Cake vs British Cake | Cake Comparison",
    description:
      "Compare Ukrainian cakes and British cakes. Discover the differences in ingredients, flavors, and traditions between these two cake cultures.",
    images: ["https://olgishcakes.com/images/ukrainian-cake-vs-british-cake.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/ukrainian-cake-vs-british-cake",
  },
};

export default function UkrainianVsBritishCakePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Ukrainian Cake vs British Cake: A Cultural and Culinary Comparison",
    description:
      "Explore the differences between Ukrainian and British cakes in ingredients, flavors, and traditions.",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.com/images/ukrainian-cake-vs-british-cake.jpg",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
  };

  const comparison = [
    {
      aspect: "Ingredients",
      ukrainian: "Honey, sour cream, nuts, natural flavors",
      british: "Butter, sugar, dried fruits, marzipan, fondant",
    },
    {
      aspect: "Texture",
      ukrainian: "Moist, layered, creamy",
      british: "Dense, crumbly, sometimes fruit-laden",
    },
    {
      aspect: "Flavors",
      ukrainian: "Honey, caramel, nuts, berries",
      british: "Fruit, spice, marzipan, chocolate",
    },
    {
      aspect: "Traditions",
      ukrainian: "Family recipes, holiday cakes, symbolic breads",
      british: "Afternoon tea, Christmas cake, wedding fruitcake",
    },
    {
      aspect: "Popular Cakes",
      ukrainian: "Honey Cake (Medovik), Kyiv Cake, Paska, Babka",
      british: "Victoria Sponge, Battenberg, Christmas Cake, Carrot Cake",
    },
    {
      aspect: "Occasions",
      ukrainian: "Weddings, holidays, birthdays, religious feasts",
      british: "Tea time, birthdays, Christmas, weddings",
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
            Ukrainian Cake vs British Cake
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
            Explore the differences in ingredients, flavors, and traditions between Ukrainian and
            British cakes.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Cake Comparison" color="primary" />
            <Chip label="Cultural Guide" color="secondary" />
            <Chip label="Traditions" color="primary" />
            <Chip label="Flavors" color="secondary" />
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={4} sx={{ fontWeight: "bold", color: "#005BBB" }}>
                  Aspect
                </Grid>
                <Grid item xs={4} sx={{ fontWeight: "bold", color: "#005BBB" }}>
                  Ukrainian Cake
                </Grid>
                <Grid item xs={4} sx={{ fontWeight: "bold", color: "#005BBB" }}>
                  British Cake
                </Grid>
                {comparison.map((row, idx) => (
                  <>
                    <Grid item xs={4} key={"aspect-" + idx}>
                      {row.aspect}
                    </Grid>
                    <Grid item xs={4} key={"ukr-" + idx}>
                      {row.ukrainian}
                    </Grid>
                    <Grid item xs={4} key={"brit-" + idx}>
                      {row.british}
                    </Grid>
                  </>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
