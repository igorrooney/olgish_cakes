import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ukrainian Christmas Traditions | Traditional Ukrainian Christmas Cakes | Olgish Cakes",
  description:
    "Discover traditional Ukrainian Christmas customs and the special cakes served during the holiday season. Learn about Christmas traditions and celebration cakes.",
  keywords:
    "Ukrainian Christmas traditions, Ukrainian Christmas cakes, traditional Ukrainian Christmas, Christmas customs Ukraine, Ukrainian holiday cakes",
  openGraph: {
    title: "Ukrainian Christmas Traditions | Traditional Ukrainian Christmas Cakes",
    description:
      "Discover traditional Ukrainian Christmas customs and the special cakes served during the holiday season. Learn about Christmas traditions and celebration cakes.",
    url: "https://olgishcakes.co.uk/ukrainian-christmas-traditions",
    images: ["https://olgishcakes.co.uk/images/ukrainian-christmas-traditions.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ukrainian Christmas Traditions | Traditional Ukrainian Christmas Cakes",
    description:
      "Discover traditional Ukrainian Christmas customs and the special cakes served during the holiday season. Learn about Christmas traditions and celebration cakes.",
    images: ["https://olgishcakes.co.uk/images/ukrainian-christmas-traditions.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/ukrainian-christmas-traditions",
  },
};

export default function UkrainianChristmasTraditionsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Ukrainian Christmas Traditions: Customs and Celebration Cakes",
    description:
      "Explore traditional Ukrainian Christmas customs and the special cakes served during the holiday season",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.co.uk/images/ukrainian-christmas-traditions.jpg",
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
              color: "#2E3192",
            }}
          >
            Ukrainian Christmas Traditions
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
            Discover the magical customs and traditions of Ukrainian Christmas. Learn about the
            special cakes and celebrations that make this holiday unique.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Christmas Customs" color="primary" />
            <Chip label="Traditional Cakes" color="secondary" />
            <Chip label="Holiday Celebrations" color="primary" />
            <Chip label="Cultural Heritage" color="secondary" />
          </Box>
        </Box>

        {/* Christmas Traditions Overview */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #FEF102 0%, #2E3192 100%)",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            ðŸŽ„ Ukrainian Christmas Traditions
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
            Ukrainian Christmas is celebrated on January 7th according to the Julian calendar. This
            beautiful holiday combines Christian traditions with ancient pagan customs, creating a
            unique celebration that lasts for several days.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            Central to these celebrations are traditional cakes and desserts that symbolize
            prosperity, family unity, and the sweetness of the holiday season.
          </Typography>
        </Paper>

        {/* Pre-Christmas Traditions */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: "#2E3192",
            }}
          >
            ðŸ•¯ï¸ Pre-Christmas Traditions
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Advent Fast",
                description: "40-day fasting period preparing for Christmas celebration",
                icon: "â°",
                cakes: "Simple Breads, Honey Cookies, Fasting Cakes",
              },
              {
                title: "Christmas Eve (Sviata Vecheria)",
                description: "Traditional 12-dish meatless dinner on Christmas Eve",
                icon: "ðŸ½ï¸",
                cakes: "Kutia, Honey Cake, Traditional Breads",
              },
              {
                title: "Didukh Preparation",
                description: "Preparing traditional wheat sheaf for Christmas decoration",
                icon: "ðŸŒ¾",
                cakes: "Wheat-based Cakes, Honey Bread",
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
                  <Typography variant="h4" component="h4" sx={{ mb: 1, color: "#2E3192", fontWeight: "bold" }}>
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

        {/* Christmas Day Traditions */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: "#2E3192",
            }}
          >
            ðŸŽŠ Christmas Day Traditions
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Christmas Service",
                description: "Traditional church service with blessing of food",
                icon: "â›ª",
                cakes: "Blessed Bread, Honey Cake, Christmas Cake",
              },
              {
                title: "Christmas Feast",
                description: "Grand celebration with traditional Ukrainian dishes",
                icon: "ðŸ–",
                cakes: "Christmas Cake, Honey Cake, Kyiv Cake, Pastries",
              },
              {
                title: "Caroling (Kolyadky)",
                description: "Traditional caroling with sweet treats and gifts",
                icon: "ðŸŽµ",
                cakes: "Honey Cookies, Sweet Breads, Traditional Cakes",
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
                  <Typography variant="h4" component="h4" sx={{ mb: 1, color: "#2E3192", fontWeight: "bold" }}>
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

        {/* Traditional Christmas Cakes */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: "#2E3192",
            }}
          >
            ðŸŽ‚ Traditional Ukrainian Christmas Cakes
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Kutia",
                description: "Traditional wheat berry pudding with honey and poppy seeds",
                icon: "ðŸŒ¾",
                significance: "Prosperity and family unity",
              },
              {
                title: "Honey Cake (Medovik)",
                description: "Layered honey cake symbolizing the sweetness of life",
                icon: "ðŸ¯",
                significance: "Sweetness and prosperity",
              },
              {
                title: "Christmas Bread (Korovai)",
                description: "Decorated bread symbolizing abundance and family",
                icon: "ðŸž",
                significance: "Abundance and family unity",
              },
              {
                title: "Kyiv Cake",
                description: "Elegant layered cake perfect for Christmas celebrations",
                icon: "ðŸ›ï¸",
                significance: "Elegance and celebration",
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
                  <Typography variant="h4" component="h4" sx={{ mb: 1, color: "#2E3192", fontWeight: "bold" }}>
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

        {/* Post-Christmas Traditions */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 4,
              color: "#2E3192",
            }}
          >
            ðŸŽ Post-Christmas Traditions
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Epiphany (Vodokhreshche)",
                date: "January 19th",
                description: "Blessing of water and traditional sweet breads",
                icon: "ðŸ’§",
                cakes: "Blessed Bread, Honey Cake, Sweet Pastries",
              },
              {
                title: "Old New Year",
                date: "January 14th",
                description: "Celebration of the old calendar new year",
                icon: "ðŸŽŠ",
                cakes: "New Year Cake, Honey Cake, Traditional Desserts",
              },
              {
                title: "Malanka",
                date: "January 13th",
                description: "Traditional folk celebration with sweet treats",
                icon: "ðŸŽ­",
                cakes: "Traditional Cakes, Honey Pastries, Sweet Breads",
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
                  <Typography variant="h4" component="h4" sx={{ mb: 1, color: "#2E3192", fontWeight: "bold" }}>
                    {tradition.title}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: "#FEF102", fontWeight: "bold" }}
                  >
                    {tradition.date}
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
            background: "linear-gradient(135deg, #2E3192 0%, #FEF102 100%)",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            ðŸ›ï¸ Cultural Significance of Ukrainian Christmas
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
                Family and Community:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Ukrainian Christmas brings families and communities together, strengthening bonds
                and preserving cultural traditions. Each tradition has deep symbolic meaning and
                connects people to their heritage.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
                Spiritual and Cultural Heritage:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                These celebrations reflect both Christian traditions and ancient pagan customs,
                creating a rich tapestry of cultural heritage that continues to thrive today.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #FEF102 0%, #2E3192 100%)",
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            Celebrate Ukrainian Christmas Traditions
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Order traditional Ukrainian Christmas cakes and make your holiday celebration truly
            special
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/christmas-cakes-leeds"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#2E3192",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              Browse Christmas Cakes
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
              Order Christmas Cakes
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}

