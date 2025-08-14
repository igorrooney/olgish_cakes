import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ukrainian Wedding Traditions | Traditional Ukrainian Wedding Cakes | Olgish Cakes",
  description:
    "Discover traditional Ukrainian wedding customs and the special cakes served at Ukrainian weddings. Learn about wedding traditions and celebration cakes.",
  keywords:
    "Ukrainian wedding traditions, Ukrainian wedding cakes, traditional Ukrainian weddings, wedding customs Ukraine, Ukrainian celebration cakes",
  openGraph: {
    title: "Ukrainian Wedding Traditions | Traditional Ukrainian Wedding Cakes",
    description:
      "Discover traditional Ukrainian wedding customs and the special cakes served at Ukrainian weddings. Learn about wedding traditions and celebration cakes.",
    url: "https://olgishcakes.co.uk/ukrainian-wedding-traditions",
    images: ["https://olgishcakes.co.uk/images/ukrainian-wedding-traditions.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ukrainian Wedding Traditions | Traditional Ukrainian Wedding Cakes",
    description:
      "Discover traditional Ukrainian wedding customs and the special cakes served at Ukrainian weddings. Learn about wedding traditions and celebration cakes.",
    images: ["https://olgishcakes.co.uk/images/ukrainian-wedding-traditions.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/ukrainian-wedding-traditions",
  },
};

export default function UkrainianWeddingTraditionsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Ukrainian Wedding Traditions: Customs and Celebration Cakes",
    description:
      "Explore traditional Ukrainian wedding customs and the special cakes served during these celebrations",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.co.uk/images/ukrainian-wedding-traditions.jpg",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
              color: theme => theme.palette.primary.main,
            }}
          >
            Ukrainian Wedding Traditions
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
            Discover the beautiful customs and traditions of Ukrainian weddings. Learn about the
            special cakes and celebrations that make these events unique.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Wedding Customs" color="primary" />
            <Chip label="Traditional Cakes" color="secondary" />
            <Chip label="Cultural Heritage" color="primary" />
            <Chip label="Celebration Traditions" color="secondary" />
          </Box>
        </Box>

        {/* Wedding Traditions Overview */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: theme =>
              `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            💒 Ukrainian Wedding Traditions
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
            Ukrainian weddings are rich in tradition and symbolism, combining ancient pagan customs
            with Christian ceremonies. These celebrations can last for several days and involve the
            entire community.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            Central to these celebrations are traditional cakes and desserts that symbolize
            prosperity, fertility, and the sweetness of married life.
          </Typography>
        </Paper>

        {/* Pre-Wedding Traditions */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: theme => theme.palette.primary.main,
            }}
          >
            💝 Pre-Wedding Traditions
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Matchmaking (Svatanie)",
                description: "Traditional matchmaking ceremony with sweet breads and honey",
                icon: "🤝",
                cakes: "Sweet Bread, Honey Cake, Traditional Pastries",
              },
              {
                title: "Engagement (Zaruchyny)",
                description: "Official engagement celebration with family and friends",
                icon: "💍",
                cakes: "Engagement Cake, Honey Cake, Sweet Treats",
              },
              {
                title: "Bachelorette Party (Divych-vechir)",
                description: "Traditional pre-wedding celebration for the bride",
                icon: "👰",
                cakes: "Bridal Cakes, Honey Pastries, Sweet Breads",
              },
            ].map((tradition, index) => (
              <Grid item xs={12} md={4} key={index}>
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
                    {tradition.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {tradition.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tradition.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Traditional Cakes:</strong> {tradition.cakes}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Wedding Day Traditions */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: theme => theme.palette.primary.main,
            }}
          >
            🎊 Wedding Day Traditions
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Wedding Ceremony",
                description: "Traditional church ceremony with blessing of bread",
                icon: "⛪",
                cakes: "Blessed Bread, Honey Cake, Wedding Cake",
              },
              {
                title: "Wedding Feast (Vesillia)",
                description: "Grand celebration with multiple courses and desserts",
                icon: "🍽️",
                cakes: "Wedding Cake, Honey Cake, Kyiv Cake, Pastries",
              },
              {
                title: "Bread and Salt Ceremony",
                description: "Traditional welcome with bread, salt, and honey",
                icon: "🍞",
                cakes: "Traditional Bread, Honey, Sweet Treats",
              },
            ].map((tradition, index) => (
              <Grid item xs={12} md={4} key={index}>
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
                    {tradition.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {tradition.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tradition.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Traditional Cakes:</strong> {tradition.cakes}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Traditional Wedding Cakes */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: theme => theme.palette.primary.main,
            }}
          >
            🎂 Traditional Ukrainian Wedding Cakes
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Honey Cake (Medovik)",
                description: "Symbolizes the sweetness of married life and prosperity",
                icon: "🍯",
                significance: "Sweetness and prosperity in marriage",
              },
              {
                title: "Kyiv Cake",
                description: "Elegant layered cake perfect for wedding celebrations",
                icon: "🏛️",
                significance: "Elegance and sophistication",
              },
              {
                title: "Wedding Bread (Korovai)",
                description: "Traditional decorated bread symbolizing fertility and abundance",
                icon: "🌾",
                significance: "Fertility and abundance",
              },
              {
                title: "Sweet Pastries",
                description: "Various traditional pastries served throughout the celebration",
                icon: "🥐",
                significance: "Joy and celebration",
              },
            ].map((cake, index) => (
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
                    {cake.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {cake.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {cake.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Symbolism:</strong> {cake.significance}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Post-Wedding Traditions */}
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
            🏠 Post-Wedding Traditions
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Bread Breaking",
                description: "Couple breaks bread together to symbolize unity",
                icon: "🥖",
                cakes: "Traditional Bread, Honey Cake",
              },
              {
                title: "Honeymoon (Medovyi misiats)",
                description: "Traditional honeymoon period with sweet treats",
                icon: "🍯",
                cakes: "Honey Cake, Sweet Pastries, Traditional Desserts",
              },
              {
                title: "First Visit Home",
                description: "Newlyweds visit parents with traditional gifts",
                icon: "🏡",
                cakes: "Gift Cakes, Honey Cake, Traditional Bread",
              },
            ].map((tradition, index) => (
              <Grid item xs={12} md={4} key={index}>
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
                    {tradition.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {tradition.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tradition.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Traditional Cakes:</strong> {tradition.cakes}
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
            background: theme =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            🏛️ Cultural Significance of Ukrainian Wedding Traditions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
                Community and Family:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Ukrainian weddings involve the entire community, strengthening family bonds and
                preserving cultural traditions. Each tradition has deep symbolic meaning and
                connects couples to their heritage.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
                Symbolism and Meaning:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Every cake and tradition carries symbolic meaning - from honey representing
                sweetness to bread symbolizing abundance. These traditions create lasting memories
                and cultural connections.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 4, md: 6 },
            background: theme =>
              `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            Celebrate Your Wedding with Ukrainian Traditions
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Order traditional Ukrainian wedding cakes and make your special day truly memorable
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/wedding-cakes"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: theme => theme.palette.primary.main,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              Browse Wedding Cakes
            </Button>
            <Button
              component={Link}
              href="/contact"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Plan Your Wedding Cake
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
