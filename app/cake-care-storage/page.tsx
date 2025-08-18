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
  ListItemIcon,
  Alert,
} from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cake Care & Storage | How to Store Cake | Cake Preservation Tips | Olgish Cakes",
  description:
    "Complete guide to cake care and storage. Learn how to store Ukrainian cakes properly, cake preservation tips, and how to keep your cake fresh. Professional cake storage advice.",
  keywords:
    "cake care storage, how to store cake, cake preservation tips, cake freshness, Ukrainian cake storage, cake handling, cake serving tips, cake maintenance",
  openGraph: {
    title: "Cake Care & Storage | How to Store Cake | Cake Preservation Tips",
    description:
      "Complete guide to cake care and storage. Learn how to store Ukrainian cakes properly, cake preservation tips, and how to keep your cake fresh. Professional cake storage advice.",
    url: "https://olgishcakes.co.uk/cake-care-storage",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cake-care-storage.jpg",
        width: 1200,
        height: 630,
        alt: "Cake Care and Storage - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Care & Storage | How to Store Cake | Cake Preservation Tips",
    description:
      "Complete guide to cake care and storage. Learn how to store Ukrainian cakes properly, cake preservation tips, and how to keep your cake fresh.",
    images: ["https://olgishcakes.co.uk/images/cake-care-storage.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-care-storage",
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

export default function CakeCareStoragePage() {
  return (
    <>
      <Script
        id="cake-care-storage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Care for and Store Ukrainian Cakes",
            description:
              "Complete guide to cake care and storage. Learn how to store Ukrainian cakes properly, cake preservation tips, and how to keep your cake fresh. Professional cake storage advice.",
            image: "https://olgishcakes.co.uk/images/cake-care-storage.jpg",
            totalTime: "PT10M",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "GBP",
              value: "0",
            },
            supply: [
              {
                "@type": "HowToSupply",
                name: "Airtight container or cake box",
              },
              {
                "@type": "HowToSupply",
                name: "Plastic wrap",
              },
              {
                "@type": "HowToSupply",
                name: "Aluminum foil",
              },
              {
                "@type": "HowToSupply",
                name: "Refrigerator",
              },
            ],
            tool: [
              {
                "@type": "HowToTool",
                name: "Cake dome",
              },
            ],
            step: [
              {
                "@type": "HowToStep",
                name: "Choose Storage Method",
                text: "Decide whether to store at room temperature (24 hours), refrigerated (5-7 days), or frozen (2-3 months) based on your needs.",
              },
              {
                "@type": "HowToStep",
                name: "Prepare for Storage",
                text: "Wrap the cake in plastic wrap or place in an airtight container to prevent drying out and absorbing odors.",
              },
              {
                "@type": "HowToStep",
                name: "Store Appropriately",
                text: "Place in refrigerator at 2-4°C, freezer at -18°C, or cool room temperature location away from direct sunlight.",
              },
              {
                "@type": "HowToStep",
                name: "Serve Properly",
                text: "Bring to room temperature before serving for best flavor and texture.",
              },
            ],
            url: "https://olgishcakes.co.uk/cake-care-storage",
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
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cake Care & Storage" }]} />
          </Box>

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
              Cake Care & Storage
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
              Learn how to properly store and care for your Ukrainian cakes to maintain their
              freshness, flavor, and beautiful appearance. Our expert tips ensure your cake stays
              perfect until serving.
            </Typography>
            <Chip
              label="Professional Cake Care Guide"
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

          {/* Important Notice */}
          <Alert severity="info" sx={{ mb: 6 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Important:
            </Typography>
            <Typography variant="body2">
              Ukrainian cakes are best enjoyed fresh, but with proper care, they can maintain their
              quality for several days. Always follow these guidelines to ensure the best
              experience.
            </Typography>
          </Alert>

          {/* Storage Guidelines */}
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
              Storage Guidelines
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  method: "Refrigerated Storage",
                  icon: "❄️",
                  description:
                    "Store in the refrigerator at 2-4°C (36-40°F) for up to 5-7 days. Keep in an airtight container or cake box.",
                  tips: [
                    "Wrap in plastic wrap or place in airtight container",
                    "Keep away from strong-smelling foods",
                    "Bring to room temperature before serving",
                    "Store on a flat surface to prevent damage",
                  ],
                  duration: "5-7 days",
                },
                {
                  method: "Freezer Storage",
                  icon: "🧊",
                  description:
                    "For longer storage, freeze individual slices or whole cakes. Wrap tightly in plastic wrap and aluminum foil.",
                  tips: [
                    "Freeze in individual portions for easy serving",
                    "Double-wrap to prevent freezer burn",
                    "Thaw in refrigerator overnight",
                    "Best consumed within 2-3 months",
                  ],
                  duration: "2-3 months",
                },
                {
                  method: "Room Temperature",
                  icon: "🌡️",
                  description:
                    "For immediate consumption (within 24 hours), store at room temperature in a cool, dry place.",
                  tips: [
                    "Keep away from direct sunlight and heat",
                    "Store in a cool, dry location",
                    "Cover with a cake dome or plastic wrap",
                    "Avoid humid environments",
                  ],
                  duration: "24 hours",
                },
                {
                  method: "Special Storage",
                  icon: "🎂",
                  description:
                    "For decorated cakes with fresh flowers or delicate decorations, special care is required.",
                  tips: [
                    "Remove fresh flowers before storage",
                    "Store decorations separately if possible",
                    "Handle with extra care to preserve design",
                    "Consider professional storage for complex designs",
                  ],
                  duration: "Varies by decoration",
                },
              ].map((method, index) => (
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
                      <Typography variant="h2" sx={{ fontSize: "2.5rem", mb: 2 }}>
                        {method.icon}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {method.method}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {method.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {method.tips.map((tip, idx) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 1, fontSize: "0.9rem" }}>
                          • {tip}
                        </Typography>
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                      Duration: {method.duration}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Ukrainian Cake Specific Care */}
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
              Ukrainian Cake Specific Care
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Each traditional Ukrainian cake has unique characteristics that require specific care
              methods to maintain their authentic taste and texture.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  cake: "Medovik (Honey Cake)",
                  icon: "🍯",
                  care: [
                    "Store in refrigerator to maintain honey flavor",
                    "Allow to rest for 24 hours after delivery for best texture",
                    "Serve at room temperature for optimal taste",
                    "Can be frozen for up to 3 months",
                  ],
                  serving: "Best served at room temperature with tea or coffee",
                },
                {
                  cake: "Kyiv Cake",
                  icon: "🏛️",
                  care: [
                    "Store in refrigerator to preserve meringue crispness",
                    "Handle carefully to maintain meringue layers",
                    "Avoid humid environments",
                    "Best consumed within 3-5 days",
                  ],
                  serving: "Serve chilled to maintain meringue texture",
                },
                {
                  cake: "Napoleon Cake",
                  icon: "🥐",
                  care: [
                    "Store in refrigerator to maintain pastry crispness",
                    "Keep in airtight container to prevent sogginess",
                    "Can be frozen for up to 2 months",
                    "Thaw slowly in refrigerator",
                  ],
                  serving: "Serve at room temperature for best pastry texture",
                },
                {
                  cake: "Poppy Seed Roll",
                  icon: "🌱",
                  care: [
                    "Store in refrigerator for up to 1 week",
                    "Wrap tightly to prevent drying out",
                    "Can be frozen for up to 2 months",
                    "Slice while cold for clean cuts",
                  ],
                  serving: "Serve at room temperature or slightly warmed",
                },
              ].map((cake, index) => (
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
                      <Typography variant="h2" sx={{ fontSize: "2.5rem", mb: 2 }}>
                        {cake.icon}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {cake.cake}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {cake.care.map((tip, idx) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 1, fontSize: "0.9rem" }}>
                          • {tip}
                        </Typography>
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {cake.serving}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Serving Tips */}
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
              Serving Tips
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  tip: "Temperature",
                  icon: "🌡️",
                  description:
                    "Most Ukrainian cakes are best served at room temperature. Remove from refrigerator 1-2 hours before serving.",
                  details: [
                    "Medovik: Room temperature for best honey flavor",
                    "Kyiv Cake: Slightly chilled to maintain meringue",
                    "Napoleon: Room temperature for crisp pastry",
                    "Poppy Seed Roll: Room temperature or slightly warmed",
                  ],
                },
                {
                  tip: "Cutting",
                  icon: "🔪",
                  description:
                    "Use a sharp, clean knife for clean cuts. For layered cakes, cut with a gentle sawing motion.",
                  details: [
                    "Warm knife in hot water for cleaner cuts",
                    "Wipe knife between cuts for neat slices",
                    "Cut from center outward for even portions",
                    "Use cake server for elegant presentation",
                  ],
                },
                {
                  tip: "Presentation",
                  icon: "🎨",
                  description:
                    "Ukrainian cakes are beautiful centerpieces. Present them on elegant serving plates with traditional accompaniments.",
                  details: [
                    "Serve on decorative cake stands",
                    "Accompany with traditional Ukrainian tea",
                    "Add fresh berries or edible flowers",
                    "Consider traditional Ukrainian servingware",
                  ],
                },
                {
                  tip: "Portions",
                  icon: "🍰",
                  description:
                    "Ukrainian hospitality calls for generous portions. Consider serving slightly larger slices than standard cake portions.",
                  details: [
                    'Standard portion: 1" x 2" slice',
                    'Ukrainian portion: 1.5" x 2.5" slice',
                    "Allow for seconds - Ukrainian tradition",
                    "Consider guest preferences and appetites",
                  ],
                },
              ].map((tip, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: "2.5rem" }}>
                      {tip.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {tip.tip}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {tip.description}
                    </Typography>
                    <Box>
                      {tip.details.map((detail, idx) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 1, fontSize: "0.9rem" }}>
                          • {detail}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Troubleshooting */}
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
              Common Issues & Solutions
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  issue: "Cake is too cold",
                  solution: "Let cake come to room temperature for 1-2 hours before serving",
                  prevention: "Remove from refrigerator early",
                  icon: "❄️",
                },
                {
                  issue: "Cake is dry",
                  solution: "Store in airtight container and consume within recommended time",
                  prevention: "Proper storage and timely consumption",
                  icon: "🏜️",
                },
                {
                  issue: "Frosting is soft",
                  solution: "Refrigerate for 30 minutes to firm up frosting",
                  prevention: "Keep refrigerated until serving",
                  icon: "🍦",
                },
                {
                  issue: "Decorations damaged",
                  solution: "Handle carefully and store decorations separately if possible",
                  prevention: "Gentle handling and proper storage",
                  icon: "🎨",
                },
                {
                  issue: "Cake stuck to container",
                  solution: "Run warm water around container or use parchment paper",
                  prevention: "Use proper storage containers",
                  icon: "🔒",
                },
                {
                  issue: "Flavor has changed",
                  solution: "Store away from strong-smelling foods and consume within timeframe",
                  prevention: "Proper storage and timely consumption",
                  icon: "👃",
                },
              ].map((problem, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography variant="h2" sx={{ fontSize: "2rem", mr: 2 }}>
                        {problem.icon}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {problem.issue}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Solution:</strong> {problem.solution}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "success.main" }}>
                      <strong>Prevention:</strong> {problem.prevention}
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
              Need More Cake Care Advice?
            </Typography>
            <Typography variant="h3" component="h3" sx={{ mb: 4, color: "text.secondary" }}>
              Contact us for personalized cake care advice and professional storage recommendations
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
                Get Cake Care Advice
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                Order Fresh Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
