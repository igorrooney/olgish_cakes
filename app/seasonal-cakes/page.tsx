import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Seasonal Cakes Leeds | Christmas Cakes | Easter Cakes | Holiday Ukrainian Cakes | Olgish Cakes",
  description:
    "Seasonal Ukrainian cakes for every holiday. Christmas cakes, Easter cakes, and holiday-specific Ukrainian desserts. Traditional seasonal flavors and celebrations.",
  keywords:
    "seasonal cakes Leeds, Christmas cakes, Easter cakes, holiday Ukrainian cakes, seasonal Ukrainian desserts, Christmas Medovik, Easter cake traditions, holiday cake delivery Leeds",
  openGraph: {
    title: "Seasonal Cakes Leeds | Christmas Cakes | Easter Cakes | Holiday Ukrainian Cakes",
    description:
      "Seasonal Ukrainian cakes for every holiday. Christmas cakes, Easter cakes, and holiday-specific Ukrainian desserts. Traditional seasonal flavors and celebrations.",
    url: "https://olgish-cakes.vercel.app/seasonal-cakes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/seasonal-cakes.jpg",
        width: 1200,
        height: 630,
        alt: "Seasonal Ukrainian Cakes - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seasonal Cakes Leeds | Christmas Cakes | Easter Cakes | Holiday Ukrainian Cakes",
    description:
      "Seasonal Ukrainian cakes for every holiday. Christmas cakes, Easter cakes, and holiday-specific Ukrainian desserts.",
    images: ["https://olgish-cakes.vercel.app/images/seasonal-cakes.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/seasonal-cakes",
  },
};

export default function SeasonalCakesPage() {
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
              Seasonal Ukrainian Cakes
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
              Celebrate every season with traditional Ukrainian cakes. From Christmas Medovik to
              Easter celebrations, our seasonal cakes honor Ukrainian traditions and bring the
              authentic taste of Ukraine to your holiday table.
            </Typography>
            <Chip
              label="Traditional Seasonal Flavors"
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

          {/* Christmas Cakes */}
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
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h2" sx={{ fontSize: "3rem", mb: 2 }}>
                🎄
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  fontWeight: 600,
                  color: "primary.main",
                  mb: 2,
                }}
              >
                Christmas Ukrainian Cakes
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", maxWidth: "600px", mx: "auto" }}
              >
                Christmas in Ukraine is a time of rich traditions and special cakes. Our Christmas
                collection features traditional flavors and designs that honor Ukrainian Christmas
                celebrations.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {[
                {
                  name: "Christmas Medovik",
                  description:
                    "Traditional honey cake with festive spices, decorated with Christmas motifs and served during Ukrainian Christmas celebrations",
                  flavors: ["Honey", "Cinnamon", "Nutmeg", "Cloves", "Sour Cream"],
                  tradition: "Served on Christmas Eve and throughout the holiday season",
                },
                {
                  name: "Kyiv Christmas Cake",
                  description:
                    "Special Christmas version of the legendary Kyiv cake with festive decorations and holiday spices",
                  flavors: ["Chocolate", "Hazelnuts", "Christmas Spices", "Meringue"],
                  tradition: "A luxurious centerpiece for Christmas dinner tables",
                },
                {
                  name: "Ukrainian Christmas Roll",
                  description:
                    "Traditional Christmas roll with dried fruits, nuts, and warm spices, symbolizing abundance and prosperity",
                  flavors: ["Dried Fruits", "Nuts", "Cinnamon", "Honey", "Yeast Dough"],
                  tradition: "Shared with family and guests during Christmas gatherings",
                },
                {
                  name: "Winter Berry Cake",
                  description:
                    "Festive cake featuring seasonal berries and traditional Ukrainian cream, perfect for Christmas celebrations",
                  flavors: ["Cranberries", "Raspberries", "Vanilla", "Ukrainian Cream"],
                  tradition: "Celebrates the winter harvest and seasonal abundance",
                },
              ].map((cake, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {cake.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {cake.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {cake.flavors.map((flavor, idx) => (
                        <Chip
                          key={idx}
                          label={flavor}
                          size="small"
                          sx={{
                            m: 0.5,
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                      {cake.tradition}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Easter Cakes */}
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
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h2" sx={{ fontSize: "3rem", mb: 2 }}>
                🐰
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  fontWeight: 600,
                  color: "primary.main",
                  mb: 2,
                }}
              >
                Easter Ukrainian Cakes
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", maxWidth: "600px", mx: "auto" }}
              >
                Easter is one of the most important celebrations in Ukrainian culture. Our Easter
                cakes feature traditional symbols and flavors that honor this sacred holiday.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {[
                {
                  name: "Paska (Easter Bread)",
                  description:
                    "Traditional Ukrainian Easter bread decorated with religious symbols and served during Easter celebrations",
                  flavors: ["Yeast Dough", "Raisins", "Candied Fruits", "Eggs", "Butter"],
                  tradition: "Blessed in church and shared with family on Easter Sunday",
                },
                {
                  name: "Easter Medovik",
                  description:
                    "Spring version of honey cake with lighter flavors and Easter decorations",
                  flavors: ["Honey", "Spring Herbs", "Light Cream", "Fresh Flowers"],
                  tradition: "Celebrates the sweetness of new life and spring renewal",
                },
                {
                  name: "Ukrainian Easter Roll",
                  description:
                    "Sweet Easter roll with traditional Ukrainian fillings and Easter egg decorations",
                  flavors: ["Sweet Dough", "Poppy Seeds", "Honey", "Nuts"],
                  tradition: "Served during Easter breakfast and family gatherings",
                },
                {
                  name: "Spring Flower Cake",
                  description:
                    "Light spring cake decorated with edible flowers and fresh seasonal ingredients",
                  flavors: ["Vanilla", "Fresh Berries", "Light Cream", "Edible Flowers"],
                  tradition: "Welcomes spring and celebrates new beginnings",
                },
              ].map((cake, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {cake.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {cake.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {cake.flavors.map((flavor, idx) => (
                        <Chip
                          key={idx}
                          label={flavor}
                          size="small"
                          sx={{
                            m: 0.5,
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                      {cake.tradition}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Other Seasonal Celebrations */}
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
              Other Seasonal Celebrations
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  season: "Spring",
                  icon: "🌸",
                  cakes: [
                    "Cherry Blossom Cake - Celebrating spring with fresh cherries",
                    "Lemon Lavender Cake - Light spring flavors with Ukrainian honey",
                    "Rhubarb Vanilla Cake - Traditional spring ingredients",
                  ],
                  traditions: "Spring cakes celebrate renewal and the end of winter",
                },
                {
                  season: "Summer",
                  icon: "☀️",
                  cakes: [
                    "Berry Medley Cake - Fresh summer berries with Ukrainian cream",
                    "Peach Honey Cake - Summer peaches with traditional honey",
                    "Lemon Poppy Seed Cake - Refreshing summer flavors",
                  ],
                  traditions: "Summer cakes feature fresh fruits and light, refreshing flavors",
                },
                {
                  season: "Autumn",
                  icon: "🍂",
                  cakes: [
                    "Apple Cinnamon Cake - Traditional autumn flavors",
                    "Pumpkin Honey Cake - Ukrainian twist on autumn classics",
                    "Walnut Maple Cake - Rich autumn ingredients",
                  ],
                  traditions: "Autumn cakes celebrate harvest and abundance",
                },
                {
                  season: "Winter",
                  icon: "❄️",
                  cakes: [
                    "Chestnut Chocolate Cake - Rich winter flavors",
                    "Cranberry Orange Cake - Festive winter ingredients",
                    "Spiced Winter Cake - Traditional winter spices",
                  ],
                  traditions: "Winter cakes feature warm spices and rich flavors",
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
                    {season.cakes.map((cake, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                        {cake}
                      </Typography>
                    ))}
                    <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
                      {season.traditions}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Ukrainian Seasonal Traditions */}
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
              Ukrainian Seasonal Traditions
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Ukrainian seasonal celebrations are deeply rooted in tradition and cultural heritage.
              Each season brings unique flavors, ingredients, and baking traditions that have been
              passed down through generations.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Christmas Traditions",
                  description:
                    "Ukrainian Christmas celebrations feature special cakes like Medovik and Kyiv cake, often blessed in church and shared with family and guests. The Christmas season is marked by rich, spiced flavors and elaborate decorations.",
                },
                {
                  title: "Easter Celebrations",
                  description:
                    "Easter is the most important holiday in Ukrainian culture, featuring traditional Paska bread and special Easter cakes. These cakes are often decorated with religious symbols and blessed in church.",
                },
                {
                  title: "Harvest Festivals",
                  description:
                    "Autumn harvest celebrations feature cakes made with seasonal ingredients like apples, pumpkins, and nuts. These cakes celebrate abundance and give thanks for the harvest.",
                },
                {
                  title: "Spring Renewal",
                  description:
                    "Spring celebrations feature light, fresh flavors and edible flowers. These cakes symbolize renewal, new beginnings, and the end of winter.",
                },
              ].map((tradition, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {tradition.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tradition.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Seasonal Ordering Information */}
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
              Ordering Seasonal Cakes
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Seasonal cakes are popular and require advance ordering, especially during peak
              holiday periods. We recommend placing your order at least 2-3 weeks in advance for
              holiday cakes to ensure availability.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  period: "Christmas Season",
                  timing: "Order by December 1st",
                  description: "Christmas cakes available from December 1st to January 6th",
                },
                {
                  period: "Easter Season",
                  timing: "Order by March 15th",
                  description: "Easter cakes available from Palm Sunday to Easter Sunday",
                },
                {
                  period: "Spring Season",
                  timing: "Order 1 week in advance",
                  description: "Spring cakes available from March to May",
                },
                {
                  period: "Autumn Season",
                  timing: "Order 1 week in advance",
                  description: "Autumn cakes available from September to November",
                },
              ].map((period, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {period.period}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                      {period.timing}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {period.description}
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
              Celebrate the Seasons with Ukrainian Tradition
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
              Order your seasonal Ukrainian cake today and bring authentic Ukrainian traditions to
              your celebrations
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/contact"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                Order Seasonal Cake
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View All Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
