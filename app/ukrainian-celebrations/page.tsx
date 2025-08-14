import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ukrainian Celebrations | Traditional Ukrainian Festivals and Cakes | Olgish Cakes",
  description:
    "Discover Ukrainian celebrations and festivals throughout the year. Learn about traditional cakes and desserts served during these special occasions.",
  keywords:
    "Ukrainian celebrations, Ukrainian festivals, traditional Ukrainian cakes, Ukrainian holidays, Ukrainian cultural events",
  openGraph: {
    title: "Ukrainian Celebrations | Traditional Ukrainian Festivals and Cakes",
    description:
      "Discover Ukrainian celebrations and festivals throughout the year. Learn about traditional cakes and desserts served during these special occasions.",
    url: "https://olgishcakes.co.uk/ukrainian-celebrations",
    images: ["https://olgishcakes.co.uk/images/ukrainian-celebrations.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ukrainian Celebrations | Traditional Ukrainian Festivals and Cakes",
    description:
      "Discover Ukrainian celebrations and festivals throughout the year. Learn about traditional cakes and desserts served during these special occasions.",
    images: ["https://olgishcakes.co.uk/images/ukrainian-celebrations.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/ukrainian-celebrations",
  },
};

export default function UkrainianCelebrationsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Ukrainian Celebrations: Traditional Festivals and Their Cakes",
    description:
      "Explore Ukrainian celebrations throughout the year and the traditional cakes served during these special occasions",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    datePublished: "2024-01-15",
    image: "https://olgishcakes.co.uk/images/ukrainian-celebrations.jpg",
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
              color: "#005BBB",
            }}
          >
            Ukrainian Celebrations
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
            Discover the rich tapestry of Ukrainian celebrations throughout the year. Each festival
            has its own traditional cakes and desserts.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Traditional Festivals" color="primary" />
            <Chip label="Seasonal Celebrations" color="secondary" />
            <Chip label="Cultural Heritage" color="primary" />
            <Chip label="Traditional Cakes" color="secondary" />
          </Box>
        </Box>

        {/* Celebrations Overview */}
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
            🎉 Ukrainian Celebrations Throughout the Year
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
            Ukrainian celebrations are deeply rooted in both Christian traditions and ancient pagan
            customs. Each celebration has its own unique cakes and desserts that reflect the season,
            religious significance, and cultural heritage.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            From the winter solstice to harvest festivals, these celebrations bring families
            together and preserve the rich culinary traditions of Ukraine.
          </Typography>
        </Paper>

        {/* Winter Celebrations */}
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
            ❄️ Winter Celebrations
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Christmas (Rizdvo)",
                date: "January 7th",
                description: "Traditional Christmas celebration with honey cake and kutia",
                icon: "🎄",
                cakes: "Honey Cake, Kutia, Pampushky",
              },
              {
                title: "New Year (Novyi Rik)",
                date: "January 1st",
                description: "Celebrating the new year with festive cakes and pastries",
                icon: "🎊",
                cakes: "Honey Cake, Kyiv Cake, Festive Pastries",
              },
              {
                title: "Epiphany (Vodokhreshche)",
                date: "January 19th",
                description: "Blessing of water and traditional sweet breads",
                icon: "💧",
                cakes: "Sweet Bread, Honey Cookies",
              },
            ].map((celebration, index) => (
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
                    {celebration.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {celebration.title}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: "#FFD700", fontWeight: "bold" }}
                  >
                    {celebration.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {celebration.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Traditional Cakes:</strong> {celebration.cakes}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Spring Celebrations */}
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
            🌸 Spring Celebrations
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Easter (Velykden)",
                date: "Variable",
                description: "The most important Christian holiday with traditional Easter bread",
                icon: "🥚",
                cakes: "Paska, Babka, Honey Cake",
              },
              {
                title: "Maslenitsa",
                date: "February/March",
                description: "Butter week celebration with pancakes and sweet treats",
                icon: "🥞",
                cakes: "Blini, Sweet Pancakes, Honey Cake",
              },
              {
                title: "Annunciation",
                date: "April 7th",
                description: "Celebration of spring with light, sweet pastries",
                icon: "🌺",
                cakes: "Light Pastries, Honey Cookies",
              },
            ].map((celebration, index) => (
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
                    {celebration.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {celebration.title}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: "#FFD700", fontWeight: "bold" }}
                  >
                    {celebration.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {celebration.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Traditional Cakes:</strong> {celebration.cakes}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Summer Celebrations */}
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
            ☀️ Summer Celebrations
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Ivan Kupala",
                date: "July 7th",
                description: "Ancient summer solstice celebration with wildflower decorations",
                icon: "🌻",
                cakes: "Flower-decorated Cakes, Honey Cake",
              },
              {
                title: "Harvest Festival",
                date: "August",
                description: "Celebrating the harvest with grain-based desserts",
                icon: "🌾",
                cakes: "Grain Cakes, Honey Cake, Fruit Pastries",
              },
              {
                title: "Assumption (Uspennya)",
                date: "August 28th",
                description: "Religious celebration with blessed bread and cakes",
                icon: "🙏",
                cakes: "Blessed Bread, Honey Cake, Sweet Pastries",
              },
            ].map((celebration, index) => (
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
                    {celebration.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {celebration.title}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: "#FFD700", fontWeight: "bold" }}
                  >
                    {celebration.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {celebration.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Traditional Cakes:</strong> {celebration.cakes}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Autumn Celebrations */}
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
            🍂 Autumn Celebrations
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Intercession (Pokrova)",
                date: "October 14th",
                description: "Celebration of protection with traditional cakes",
                icon: "🛡️",
                cakes: "Protection Cakes, Honey Cake, Kyiv Cake",
              },
              {
                title: "St. Michael's Day",
                date: "November 21st",
                description: "Honoring the archangel with special pastries",
                icon: "⚔️",
                cakes: "Michael's Cakes, Honey Pastries",
              },
              {
                title: "St. Andrew's Day",
                date: "December 13th",
                description: "Winter preparation with hearty cakes",
                icon: "❄️",
                cakes: "Winter Cakes, Honey Cake, Nuts and Dried Fruits",
              },
            ].map((celebration, index) => (
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
                    {celebration.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {celebration.title}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: "#FFD700", fontWeight: "bold" }}
                  >
                    {celebration.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {celebration.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Traditional Cakes:</strong> {celebration.cakes}
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
            background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>
            🏛️ Cultural Significance of Ukrainian Celebrations
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
                Family and Community:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Ukrainian celebrations bring families and communities together, strengthening bonds
                and preserving cultural traditions. Each celebration has its own unique customs and
                traditional foods.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h4" sx={{ mb: 2 }}>
                Religious and Cultural Heritage:
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
            background: "linear-gradient(135deg, #FFD700 0%, #005BBB 100%)",
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            Celebrate Ukrainian Traditions
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Order traditional Ukrainian cakes for your celebrations and keep these precious cultural
            traditions alive
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
              Order Traditional Cakes
            </Button>
            <Button
              component={Link}
              href="/ukrainian-culture-baking"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Learn More About Culture
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
