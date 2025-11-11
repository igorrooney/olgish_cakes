import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cake Flavor Guide | Ukrainian Cake Flavors",
  description:
    "Explore my Ukrainian cake flavor guide. Discover the most popular flavors for birthdays, weddings, and celebrations. Find your favorite cake flavor!",
  keywords:
    "cake flavor guide, Ukrainian cake flavors, best cake flavors, birthday cake flavors, wedding cake flavors",
  openGraph: {
    title: "Cake Flavor Guide | Ukrainian Cake Flavors",
    description:
      "Explore my Ukrainian cake flavor guide. Discover the most popular flavors for birthdays, weddings, and celebrations. Find your favorite cake flavor!",
    url: "https://olgishcakes.co.uk/cake-flavor-guide",
    images: ["https://olgishcakes.co.uk/images/cake-flavor-guide.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Flavor Guide | Ukrainian Cake Flavors",
    description:
      "Explore my Ukrainian cake flavor guide. Discover the most popular flavors for birthdays, weddings, and celebrations. Find your favorite cake flavor!",
    images: ["https://olgishcakes.co.uk/images/cake-flavor-guide.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-flavor-guide",
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

export default function CakeFlavorGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Cake Flavor Guide: Ukrainian Cake Flavors",
    description: "Guide to the most popular Ukrainian cake flavors for every occasion",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.co.uk/images/cake-flavor-guide.jpg",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
  };

  const flavors = [
    {
      name: "Honey Cake (Medovik)",
      description: "Traditional Ukrainian honey cake with 5 layers of soft honey sponge and light buttercream made with condensed milk. Handmade with real honey for authentic flavor.",
      icon: "🍯",
    },
    {
      name: "Kyiv Cake",
      description: "Premium handmade Ukrainian cake with meringue and cashew nuts, filled with custard cream between layers. A true masterpiece of Ukrainian baking.",
      icon: "🏛️",
    },
    {
      name: "Sacher Torte",
      description: "Rich chocolate and apricot cake expertly made in small batches. Deep chocolate sponge with apricot jam and ganache - a sophisticated European classic.",
      icon: "🍫",
    },
    {
      name: "Vanilla Delicia Birthday Cake",
      description: "Fluffy sponge with creamy butter and condensed milk filling. Perfect for custom designs and special celebrations, available in various sizes.",
      icon: "🍦",
    },
    {
      name: "Chocolate Delicia Sponge Cake",
      description: "Handmade chocolate sponge with creamy butter and condensed milk filling. Perfect for parties and chocolate lovers who want something special.",
      icon: "🍫",
    },
    {
      name: "Napoleon Cake",
      description: "Handmade with 7 layers of flaky puff pastry and smooth diplomat cream (custard mixed with fresh cream). Traditional Ukrainian recipe - crunchy and creamy in every bite.",
      icon: "🥐",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cake Flavor Guide" }]} />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
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
              Cake Flavor Guide
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
              Explore my most popular Ukrainian cake flavors. Find the perfect flavor for your next
              celebration!
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip label="Popular Flavors" color="primary" />
              <Chip label="Birthday Cakes" color="secondary" />
              <Chip label="Wedding Cakes" color="primary" />
              <Chip label="Allergy-Friendly" color="secondary" />
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 6, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}>
            Choosing the right cake flavour is one of the most important decisions when ordering your cake. I believe every celebration
            deserves a flavour that brings joy and creates memories. Here are my most popular flavours, each one carefully crafted
            to bring happiness to your special day.
          </Typography>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {flavors.map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {item.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ mb: 2, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Traditional Ukrainian Flavours
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Honey Cake (Medovik) - My Signature Flavour
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    This is my most requested cake and for good reason! Made with real honey and layers of delicate sponge,
                    this traditional Ukrainian cake brings warmth and comfort to any celebration. The honey flavour is not too sweet,
                    just perfect, and it reminds people of home and family. Perfect for weddings, anniversaries, and any special occasion.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Kyiv Cake - Elegant and Sophisticated
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    This beautiful cake combines crunchy meringue layers with rich chocolate and nutty flavours. It is elegant and sophisticated,
                    perfect for formal celebrations. The texture is amazing - crispy on the outside, soft inside, and the chocolate ganache
                    brings everything together beautifully. Always impresses guests!
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Popular Celebration Flavours
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Vanilla Delicia Birthday Cake
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    A perfect choice for any celebration! Our Vanilla Delicia features fluffy sponge with creamy butter and condensed milk filling.
                    This cake is perfect for custom designs and can be made in sizes from 6 to 12 inches. It is elegant, delicious,
                    and perfect for birthdays, anniversaries, and family gatherings.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Chocolate Delicia Sponge Cake
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    For chocolate lovers who want something special! Handmade chocolate sponge with creamy butter and condensed milk filling
                    creates an indulgent experience that satisfies every chocolate craving. Perfect for parties and celebrations
                    where you want to impress your guests with something truly delicious.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Sacher Torte
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    A sophisticated European classic! Rich chocolate and apricot cake expertly made in small batches. Deep chocolate sponge
                    with apricot jam and ganache creates a perfect balance of rich chocolate and fruity sweetness.
                    Perfect for those who appreciate refined European desserts with a Ukrainian touch.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Napoleon Cake
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Our traditional Ukrainian Napoleon! Handmade with 7 layers of flaky puff pastry and smooth diplomat cream
                    (custard mixed with fresh cream). This cake is crunchy and creamy in every bite, creating a beautiful contrast of textures.
                    Perfect for those who love traditional European desserts with authentic Ukrainian craftsmanship.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Allergen Information
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Nut Information
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Most of my cakes are nut-free! Vanilla Delicia, Chocolate Delicia, Honey Cake (Medovik), Napoleon Cake, and Sacher Torte
                    are all made without nuts. Only Kyiv Cake contains cashew nuts, so please let me know about any nut allergies when ordering.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Gluten-Friendly Options
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    I offer gluten-friendly options for several cakes! Vanilla Delicia, Chocolate Delicia, and Sacher Torte can be made
                    with gluten-friendly sponge (sponge without flour). Sacher Torte uses ground almonds in the gluten-friendly version.
                    Contact me to discuss your specific needs.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Dairy Information
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Most of my cakes contain dairy products including butter, condensed milk, and cream. However, Sacher Torte is also available
                    as a dairy-friendly recipe. If you have dairy sensitivities, please contact me to discuss the best options for you.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Custom Dietary Needs
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    I understand that everyone has different dietary needs and preferences. While my traditional recipes contain common allergens,
                    I offer various options including gluten-friendly and dairy-friendly alternatives. Contact me to discuss
                    how I can create something special that meets your specific requirements.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
              size="large"
              sx={{ bgcolor: "#FFD700", color: "#005BBB", "&:hover": { bgcolor: "#ffe066" } }}>
              Browse All Cakes
            </Button>
            </Link>
          </Box>
        </Container>
      </Box>
    </>
  );
}
