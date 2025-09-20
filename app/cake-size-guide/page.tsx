import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cake Size Guide | Ukrainian Cake Sizing Chart",
  description:
    "Find the perfect cake size for your celebration. Our Ukrainian cake size guide helps you choose the right cake for any occasion, from small gatherings to large parties.",
  keywords:
    "cake size guide, Ukrainian cake sizing, cake portions, cake serving chart, birthday cake size, wedding cake size",
  openGraph: {
    title: "Cake Size Guide | Ukrainian Cake Sizing Chart",
    description:
      "Find the perfect cake size for your celebration. Our Ukrainian cake size guide helps you choose the right cake for any occasion, from small gatherings to large parties.",
    url: "https://olgishcakes.co.uk/cake-size-guide",
    images: ["https://olgishcakes.co.uk/images/cake-size-guide.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Size Guide | Ukrainian Cake Sizing Chart",
    description:
      "Find the perfect cake size for your celebration. Our Ukrainian cake size guide helps you choose the right cake for any occasion, from small gatherings to large parties.",
    images: ["https://olgishcakes.co.uk/images/cake-size-guide.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-size-guide",
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

export default function CakeSizeGuidePage() {
  const sizes = [
    { size: "6-inch", servings: "6-8", bestFor: "Small gatherings, couples", icon: "👫" },
    { size: "8-inch", servings: "10-12", bestFor: "Family celebrations", icon: "👨‍👩‍👧‍👦" },
    { size: "10-inch", servings: "15-20", bestFor: "Medium parties", icon: "🎉" },
    { size: "12-inch", servings: "25-30", bestFor: "Large events", icon: "🎊" },
    { size: "2-tier", servings: "30-40", bestFor: "Weddings, big birthdays", icon: "💍" },
    { size: "3-tier", servings: "50+", bestFor: "Weddings, corporate", icon: "🏢" },
  ];

  return (
    <>
      <Script
        id="cake-size-guide-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Choose the Right Cake Size",
            description:
              "Find the perfect cake size for your celebration. Our Ukrainian cake size guide helps you choose the right cake for any occasion, from small gatherings to large parties.",
            image: "https://olgishcakes.co.uk/images/cake-size-guide.jpg",
            totalTime: "PT5M",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "GBP",
              value: "0",
            },
            step: [
              {
                "@type": "HowToStep",
                name: "Determine Guest Count",
                text: "Count the number of guests who will be eating cake at your event.",
              },
              {
                "@type": "HowToStep",
                name: "Choose Cake Size",
                text: "6-inch serves 6-8 people, 8-inch serves 10-12, 10-inch serves 15-20, 12-inch serves 25-30, 2-tier serves 30-40, 3-tier serves 50+.",
              },
              {
                "@type": "HowToStep",
                name: "Consider Event Type",
                text: "Small gatherings need 6-8 inch, family celebrations need 8-10 inch, large events need 12-inch or tiered cakes.",
              },
              {
                "@type": "HowToStep",
                name: "Order with Buffer",
                text: "Order slightly larger than needed to ensure everyone gets a piece and for leftovers.",
              },
            ],
            url: "https://olgishcakes.co.uk/cake-size-guide",
          }),
        }}
      />
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
            Cake Size Guide
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
            Find the perfect cake size for your celebration. Use our guide to choose the right cake
            for your event.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Serving Chart" color="primary" />
            <Chip label="Wedding Cakes" color="secondary" />
            <Chip label="Birthday Cakes" color="primary" />
            <Chip label="Portion Guide" color="secondary" />
          </Box>
        </Box>
        <Grid container spacing={3}>
          {sizes.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
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
                  {item.icon}
                </Typography>
                <Typography
                  variant="h3"
                  component="h3"
                  sx={{ mb: 1, color: "#005BBB", fontWeight: "bold" }}
                >
                  {item.size}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Servings:</strong> {item.servings}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.bestFor}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {/* Introduction */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            mb: 6,
            mt: 6,
          }}
        >
          <Typography
            variant="body1"
            sx={{ mb: 4, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}
          >
            Choosing the right cake size is one of the most important decisions when planning your celebration. 
            You want to make sure everyone gets a delicious piece, but you also do not want to waste money on 
            cake that goes uneaten. This comprehensive guide will help you understand portion sizes, serving 
            recommendations, and special considerations for different types of celebrations.
          </Typography>
        </Paper>

        {/* Portion Guidelines */}
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
            Understanding Portion Sizes
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, textAlign: "center", maxWidth: "800px", mx: "auto", lineHeight: 1.7 }}
          >
            When I talk about serving sizes, I mean generous portions that will satisfy your guests. 
            Ukrainian cakes are rich and flavorful, so people often eat smaller portions than with regular cakes. 
            Here is what you need to know about portion planning:
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Standard Portion Size
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  A standard portion is about 2 inches by 2 inches (5cm x 5cm) - roughly the size of a small slice 
                  of bread. This is perfect for most celebrations where people want to enjoy the cake without feeling too full. 
                  It allows everyone to try the cake and leaves room for other food.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Generous Portion Size
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  A generous portion is about 2.5 inches by 2.5 inches (6cm x 6cm) - perfect for cake-focused events 
                  or when the cake is the main dessert. This size is ideal for birthdays, anniversaries, and special 
                  occasions where people really want to enjoy the Ukrainian flavors.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Ukrainian Cake Specific Tips */}
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
            Special Tips for Ukrainian Cakes
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Medovik (Honey Cake) Portions
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Honey cake is rich and sweet, so people often eat smaller portions. The honey flavor is very 
                  satisfying, and guests usually want just enough to enjoy the authentic taste. Plan for slightly 
                  smaller portions than you might for other cakes.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Kyiv Cake Portions
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Kyiv cake has a unique texture with crispy meringue and rich filling. People often want to 
                  try a good-sized portion to really experience the different textures and flavors. Plan for 
                  standard to generous portions for this popular cake.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography
            variant="h3"
            component="h3"
            sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
          >
            Need Help Choosing the Right Size?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
          >
            Contact me for personalized advice on cake sizing, portions, and custom orders. I'm here to help you choose the perfect cake for your celebration.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/contact"
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              Get Size Advice
            </Button>
            <Button
              component={Link}
              href="/cakes"
              variant="outlined"
              color="primary"
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              Browse All Cakes
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
