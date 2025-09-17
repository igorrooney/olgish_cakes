import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Ukrainian Culture & Baking | Ukrainian Baking Traditions | Traditional Ukrainian Desserts | Olgish Cakes",
  description:
    "Discover the rich cultural heritage of Ukrainian baking. Traditional Ukrainian desserts, baking traditions, and the cultural meaning of Ukrainian cakes. Real Ukrainian baking culture.",
  keywords:
    "Ukrainian culture baking, Ukrainian baking traditions, Traditional Ukrainian desserts, Ukrainian dessert culture, Ukrainian cake history, Ukrainian baking heritage, authentic Ukrainian baking",
  openGraph: {
    title:
      "Ukrainian Culture & Baking | Ukrainian Baking Traditions | Traditional Ukrainian Desserts",
    description:
      "Discover the rich cultural heritage of Ukrainian baking. Traditional Ukrainian desserts, baking traditions, and the cultural meaning of Ukrainian cakes. Real Ukrainian baking culture.",
    url: "https://olgishcakes.co.uk/ukrainian-culture-baking",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/ukrainian-culture-baking.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Culture and Baking - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Ukrainian Culture & Baking | Ukrainian Baking Traditions | Traditional Ukrainian Desserts",
    description:
      "Discover the rich cultural heritage of Ukrainian baking. Traditional Ukrainian desserts, baking traditions, and the cultural meaning of Ukrainian cakes.",
    images: ["https://olgishcakes.co.uk/images/ukrainian-culture-baking.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/ukrainian-culture-baking",
  },
};

export default function UkrainianCultureBakingPage() {
  return (
    <>
      <Script
        id="ukrainian-culture-baking-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Ukrainian Culture Baking",
            description: "Discover the role of baking in Ukrainian culture and traditions.",
            url: "https://olgishcakes.co.uk/ukrainian-culture-baking",
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
              Ukrainian Culture & Baking
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
              Discover the rich cultural heritage of Ukrainian baking traditions. From traditional
              recipes passed down through generations to the cultural meaning of every
              ingredient, explore the real world of Ukrainian dessert culture.
            </Typography>
            <Chip
              label="Authentic Ukrainian Heritage"
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

          {/* Ukrainian Baking Heritage */}
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
              Ukrainian Baking Heritage
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Ukrainian baking traditions date back centuries, with recipes and techniques passed
              down through generations. Each cake tells a story of Ukrainian culture, family, and
              the deep connection between food and celebration.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  era: "Ancient Traditions",
                  icon: "🏺",
                  description:
                    "Ukrainian baking traditions began with ancient Slavic customs, using honey, grains, and wild berries to create simple but meaningful desserts.",
                  significance: "Rooted in agricultural celebrations and harvest festivals",
                },
                {
                  era: "Medieval Period",
                  icon: "⚔️",
                  description:
                    "During medieval times, Ukrainian baking evolved with the introduction of new ingredients and techniques from trade routes.",
                  significance: "Influenced by Byzantine and European baking traditions",
                },
                {
                  era: "Cossack Era",
                  icon: "🛡️",
                  description:
                    "The Cossack period brought hearty, substantial cakes that could sustain travelers and warriors on long journeys.",
                  significance: "Emphasized durability and rich, satisfying flavors",
                },
                {
                  era: "Modern Era",
                  icon: "🏛️",
                  description:
                    "Today's Ukrainian baking combines traditional techniques with modern innovations while preserving authentic flavors.",
                  significance: "Maintains cultural identity while embracing contemporary tastes",
                },
              ].map((era, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Typography variant="h3" sx={{ fontSize: "2.5rem", mb: 2 }}>
                        {era.icon}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {era.era}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {era.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {era.significance}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Cultural Significance of Ingredients */}
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
              Cultural Significance of Ingredients
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Every ingredient in Ukrainian baking carries deep cultural meaning and symbolism,
              reflecting the values, beliefs, and traditions of Ukrainian culture.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  ingredient: "Honey",
                  icon: "🍯",
                  meaning: "Symbolizes sweetness of life, prosperity, and good fortune",
                  cultural: "Used in traditional celebrations and believed to bring good luck",
                  tradition: "Honey cake represents the sweetness of marriage and family life",
                },
                {
                  ingredient: "Poppy Seeds",
                  icon: "🌱",
                  meaning: "Represents fertility, abundance, and the cycle of life",
                  cultural: "Associated with harvest celebrations and family prosperity",
                  tradition: "Poppy seed rolls are served at weddings and family gatherings",
                },
                {
                  ingredient: "Sour Cream",
                  icon: "🥛",
                  meaning: "Symbolizes hospitality, generosity, and family care",
                  cultural: "Represents the nurturing aspect of Ukrainian family life",
                  tradition: "Used in many traditional cakes to show care and attention",
                },
                {
                  ingredient: "Nuts",
                  icon: "🥜",
                  meaning: "Represents wisdom, strength, and family unity",
                  cultural: "Associated with intellectual pursuits and family bonds",
                  tradition: "Kyiv cake with hazelnuts symbolizes wisdom and tradition",
                },
                {
                  ingredient: "Berries",
                  icon: "🫐",
                  meaning: "Symbolizes the bounty of nature and seasonal celebrations",
                  cultural: "Connected to harvest festivals and seasonal traditions",
                  tradition: "Fresh berries represent the natural abundance of Ukraine",
                },
                {
                  ingredient: "Flour",
                  icon: "🌾",
                  meaning: "Represents the foundation of life, sustenance, and family",
                  cultural: "Symbolizes the agricultural heritage and hard work",
                  tradition: "Every cake begins with flour, representing family foundation",
                },
              ].map((ingredient, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Typography variant="h4" sx={{ fontSize: "2.5rem", mb: 2 }}>
                        {ingredient.icon}
                      </Typography>
                      <Typography
                        variant="h4"
                        component="h3"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {ingredient.ingredient}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      <strong>Meaning:</strong> {ingredient.meaning}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      <strong>Cultural:</strong> {ingredient.cultural}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {ingredient.tradition}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Traditional Celebrations */}
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
              Traditional Ukrainian Celebrations
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Ukrainian celebrations are deeply intertwined with traditional baking. Each holiday
              and celebration has its own special cakes and desserts that carry cultural
              significance and family traditions.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  celebration: "Christmas (Rizdvo)",
                  icon: "🎄",
                  cakes: ["Honey Cake", "Kyiv Cake", "Christmas Roll"],
                  significance: "Celebrates the birth of Christ and family unity",
                  tradition: "Cakes are blessed in church and shared with family and guests",
                },
                {
                  celebration: "Easter (Velykden)",
                  icon: "🐰",
                  cakes: ["Paska", "Easter Honey Cake", "Spring Cakes"],
                  significance: "Celebrates resurrection and new life",
                  tradition: "Cakes are decorated with religious symbols and blessed",
                },
                {
                  celebration: "Weddings (Vesillia)",
                  icon: "💒",
                  cakes: ["Wedding Honey Cake", "Kyiv Cake", "Traditional Wedding Cakes"],
                  significance: "Symbolizes the sweetness of marriage and family life",
                  tradition: "Cakes are shared with all guests as a symbol of hospitality",
                },
                {
                  celebration: "Harvest Festival",
                  icon: "🌾",
                  cakes: ["Apple Cakes", "Berry Cakes", "Honey Cakes"],
                  significance: "Thanksgiving for the harvest and abundance",
                  tradition: "Cakes made with seasonal ingredients celebrate nature's bounty",
                },
                {
                  celebration: "Name Days",
                  icon: "👤",
                  cakes: ["Personalized Cakes", "Traditional Favorites"],
                  significance: "Celebrates individual saints and personal identity",
                  tradition: "Family members receive special cakes on their name day",
                },
                {
                  celebration: "Family Gatherings",
                  icon: "👨‍👩‍👧‍👦",
                  cakes: ["All Traditional Cakes", "Family Favorites"],
                  significance: "Strengthens family bonds and preserves traditions",
                  tradition: "Cakes are always present at family celebrations",
                },
              ].map((celebration, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Typography variant="h2" sx={{ fontSize: "2.5rem", mb: 2 }}>
                        {celebration.icon}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {celebration.celebration}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {celebration.cakes.map((cake, idx) => (
                        <Chip
                          key={idx}
                          label={cake}
                          sx={{
                            m: 0.5,
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                            minHeight: "44px", // WCAG touch target requirement
                            padding: "8px 16px", // Ensure adequate padding
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      <strong>Significance:</strong> {celebration.significance}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {celebration.tradition}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Ukrainian Hospitality */}
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
              Ukrainian Hospitality & Baking
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Ukrainian hospitality is legendary, and baking plays a central role in welcoming
              guests and showing care for family and friends. Every cake is an expression of love
              and hospitality.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  principle: "Generosity",
                  icon: "🤲",
                  description:
                    "Ukrainian hospitality calls for generous portions and abundance. Guests should never leave hungry.",
                  tradition: "Always prepare more than needed to show generosity",
                },
                {
                  principle: "Care & Attention",
                  icon: "💝",
                  description:
                    "Every cake is made with love and attention to detail, reflecting care for family and guests.",
                  tradition: "Time and effort in baking shows love and respect",
                },
                {
                  principle: "Sharing",
                  icon: "🍰",
                  description:
                    "Cakes are meant to be shared with everyone present, symbolizing unity and community.",
                  tradition: "No guest should be excluded from the sharing of cake",
                },
                {
                  principle: "Tradition",
                  icon: "🏛️",
                  description:
                    "Traditional recipes are preserved and passed down, maintaining cultural identity.",
                  tradition: "Each generation learns and preserves family baking traditions",
                },
              ].map((principle, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h4" sx={{ mb: 2, fontSize: "2.5rem" }}>
                      {principle.icon}
                    </Typography>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {principle.principle}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {principle.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {principle.tradition}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Modern Ukrainian Baking */}
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
              Modern Ukrainian Baking
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              While I honor traditional Ukrainian recipes and techniques, modern Ukrainian baking
              also embraces contemporary innovations while keeping real flavors and
              cultural meaning.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  aspect: "Traditional Techniques",
                  description:
                    "I keep traditional Ukrainian baking methods while adding modern quality standards and food safety practices.",
                  innovation: "Keeps real taste with modern safety standards",
                },
                {
                  aspect: "Ingredient Quality",
                  description:
                    "I use the finest ingredients available while staying true to traditional Ukrainian flavor profiles and recipes.",
                  innovation: "Premium ingredients make traditional flavors better",
                },
                {
                  aspect: "Cultural Preservation",
                  description:
                    "Every cake I make keeps Ukrainian cultural heritage and traditions for future generations.",
                  innovation: "Keeps Ukrainian culture alive through baking",
                },
                {
                  aspect: "Modern Accessibility",
                  description:
                    "I make traditional Ukrainian cakes accessible to modern audiences while keeping real cultural meaning.",
                  innovation: "Bridges traditional culture with modern lifestyles",
                },
              ].map((aspect, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {aspect.aspect}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {aspect.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {aspect.innovation}
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
              Experience Ukrainian Culture Through Baking
            </Typography>
            <Typography variant="h4" component="h3" sx={{ mb: 4, color: "text.secondary" }}>
              Order real Ukrainian cakes and experience the rich cultural heritage of Ukrainian
              baking
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
                href="/contact"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
