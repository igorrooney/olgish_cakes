import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button, Alert } from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title:
    "Allergen Information | Gluten-Friendly Cakes Leeds | Dairy-Free Ukrainian Cakes | Olgish Cakes",
  description:
    "Complete allergen information for our Ukrainian cakes. Gluten-friendly, dairy-free, nut-free, and vegan cake options available. Safe cake options for all dietary requirements.",
  keywords:
    "allergen information, gluten-friendly cakes Leeds, dairy-free Ukrainian cakes, nut-free cakes, vegan cakes Leeds, food allergies, dietary requirements, safe cakes",
  openGraph: {
    title: "Allergen Information | Gluten-Friendly Cakes Leeds | Dairy-Free Ukrainian Cakes",
    description:
      "Complete allergen information for our Ukrainian cakes. Gluten-friendly, dairy-free, nut-free, and vegan cake options available. Safe cake options for all dietary requirements.",
    url: "https://olgishcakes.co.uk/allergen-information",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/allergen-information.jpg",
        width: 1200,
        height: 630,
        alt: "Allergen Information - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Allergen Information | Gluten-Friendly Cakes Leeds | Dairy-Free Ukrainian Cakes",
    description:
      "Complete allergen information for our Ukrainian cakes. Gluten-friendly, dairy-free, nut-free, and vegan cake options available.",
    images: ["https://olgishcakes.co.uk/images/allergen-information.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/allergen-information",
  },
};

export default function AllergenInformationPage() {
  const allergenData = [
    {
      name: "Gluten",
      description: "Found in wheat flour, present in most traditional Ukrainian cakes",
      commonIn: ["Medovik", "Kyiv Cake", "Napoleon", "Poppy Seed Roll"],
      alternatives: "Gluten-friendly flour options available",
    },
    {
      name: "Dairy",
      description: "Found in butter, milk, cream, and sour cream used in Ukrainian recipes",
      commonIn: ["All traditional cakes", "Cream fillings", "Buttercream"],
      alternatives: "Dairy-free alternatives available",
    },
    {
      name: "Eggs",
      description: "Used in most cake recipes for structure and richness",
      commonIn: ["All traditional cakes", "Meringue", "Custard"],
      alternatives: "Egg-free options available",
    },
    {
      name: "Nuts",
      description: "Hazelnuts in Kyiv cake, almonds in some traditional recipes",
      commonIn: ["Kyiv Cake", "Some specialty cakes"],
      alternatives: "Nut-free versions available",
    },
    {
      name: "Soy",
      description: "May be present in some ingredients and chocolate products",
      commonIn: ["Chocolate products", "Some fillings"],
      alternatives: "Soy-free options available",
    },
    {
      name: "Sulphites",
      description: "May be present in dried fruits and some preservatives",
      commonIn: ["Dried fruit fillings", "Some traditional recipes"],
      alternatives: "Sulphite-free options available",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Allergen Information - Olgish Cakes",
    description:
      "Complete allergen information for our Ukrainian cakes. Gluten-friendly, dairy-free, nut-free, and vegan cake options available.",
    url: "https://olgishcakes.co.uk/allergen-information",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/logo.png",
      },
    },
    mainEntity: {
      "@type": "Article",
      headline: "Allergen Information",
      description:
        "Complete allergen information for our Ukrainian cakes. Safe cake options for all dietary requirements.",
      author: {
        "@type": "Organization",
        name: "Olgish Cakes",
      },
      publisher: {
        "@type": "Organization",
        name: "Olgish Cakes",
      },
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split("T")[0],
      articleBody: allergenData
        .map(
          allergen =>
            `${allergen.name}: ${allergen.description}. Common in: ${allergen.commonIn.join(", ")}. Alternatives: ${allergen.alternatives}`
        )
        .join(" "),
    },
  };

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
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Allergen Information" }]}
            />
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
              Allergen Information
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
              Your safety and dietary needs are our priority. We provide comprehensive allergen
              information and accommodate various dietary requirements while maintaining the
              authentic taste of Ukrainian cakes.
            </Typography>
            <Chip
              label="Safe Cake Options for Everyone"
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
          <Alert severity="warning" sx={{ mb: 6 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Important Notice:
            </Typography>
            <Typography variant="body2">
              While we take every precaution to accommodate dietary requirements, our kitchen
              handles multiple allergens. Cross-contamination may occur. Please inform us of any
              allergies when ordering, and we'll take extra precautions for severe allergies.
            </Typography>
          </Alert>

          {/* Common Allergens */}
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
              Common Allergens in Our Cakes
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  allergen: "Gluten",
                  icon: "🌾",
                  description: "Found in wheat flour, present in most traditional Ukrainian cakes",
                  commonIn: ["Medovik", "Kyiv Cake", "Napoleon", "Poppy Seed Roll"],
                  alternatives: "Gluten-friendly flour options available",
                },
                {
                  allergen: "Dairy",
                  icon: "🥛",
                  description:
                    "Found in butter, milk, cream, and sour cream used in Ukrainian recipes",
                  commonIn: ["All traditional cakes", "Cream fillings", "Buttercream"],
                  alternatives: "Dairy-free alternatives available",
                },
                {
                  allergen: "Eggs",
                  icon: "🥚",
                  description: "Used in most cake recipes for structure and richness",
                  commonIn: ["All traditional cakes", "Meringue", "Custard"],
                  alternatives: "Egg-free options available",
                },
                {
                  allergen: "Nuts",
                  icon: "🥜",
                  description: "Hazelnuts in Kyiv cake, almonds in some traditional recipes",
                  commonIn: ["Kyiv Cake", "Some specialty cakes"],
                  alternatives: "Nut-free versions available",
                },
                {
                  allergen: "Soy",
                  icon: "🫘",
                  description: "May be present in some ingredients and chocolate products",
                  commonIn: ["Chocolate products", "Some fillings"],
                  alternatives: "Soy-free options available",
                },
                {
                  allergen: "Sulphites",
                  icon: "🍷",
                  description: "May be present in dried fruits and some preservatives",
                  commonIn: ["Dried fruit fillings", "Some traditional recipes"],
                  alternatives: "Sulphite-free options available",
                },
              ].map((allergen, index) => (
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
                        {allergen.icon}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                        {allergen.allergen}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {allergen.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Common in:</strong> {allergen.commonIn.join(", ")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600 }}>
                      {allergen.alternatives}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Dietary Accommodations */}
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
              Dietary Accommodations
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              We're committed to making our Ukrainian cakes accessible to everyone. We can adapt our
              traditional recipes to accommodate various dietary requirements while maintaining
              authentic flavors.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  diet: "Gluten-Friendly",
                  icon: "🌾❌",
                  description:
                    "Traditional Ukrainian cakes adapted with gluten-friendly flour blends that maintain authentic texture and taste",
                  options: [
                    "Gluten-friendly Medovik",
                    "Gluten-friendly Kyiv cake",
                    "Gluten-friendly Napoleon",
                  ],
                  notice: "Made in a kitchen that handles gluten",
                },
                {
                  diet: "Dairy-Free",
                  icon: "🥛❌",
                  description:
                    "Ukrainian cakes made with dairy alternatives like almond milk, coconut cream, and dairy-free butter",
                  options: [
                    "Dairy-free Medovik",
                    "Dairy-free cream fillings",
                    "Dairy-free frostings",
                  ],
                  notice: "Made in a kitchen that handles dairy",
                },
                {
                  diet: "Vegan",
                  icon: "🌱",
                  description:
                    "Completely plant-based Ukrainian cakes using traditional techniques with modern vegan ingredients",
                  options: ["Vegan Medovik", "Vegan Kyiv cake", "Vegan cream fillings"],
                  notice: "No animal products used",
                },
                {
                  diet: "Nut-Free",
                  icon: "🥜❌",
                  description:
                    "Traditional recipes adapted to exclude nuts while maintaining authentic Ukrainian flavors",
                  options: ["Nut-free Kyiv cake", "Nut-free fillings", "Alternative toppings"],
                  notice: "Made in a kitchen that handles nuts",
                },
                {
                  diet: "Egg-Free",
                  icon: "🥚❌",
                  description:
                    "Ukrainian cakes made without eggs using alternative binding agents and leavening",
                  options: ["Egg-free Medovik", "Egg-free sponge cakes", "Egg-free fillings"],
                  notice: "Made in a kitchen that handles eggs",
                },
                {
                  diet: "Low-Sugar",
                  icon: "🍯",
                  description:
                    "Traditional Ukrainian cakes with reduced sugar content using natural sweeteners",
                  options: ["Low-sugar Medovik", "Low-sugar fillings", "Natural sweeteners"],
                  notice: "Still contains some natural sugars",
                },
              ].map((diet, index) => (
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
                        {diet.icon}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                        {diet.diet}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {diet.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {diet.options.map((option, idx) => (
                        <Chip
                          key={idx}
                          label={option}
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
                      {diet.notice}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Allergen Chart */}
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
              Allergen Information Chart
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              This chart shows which allergens are present in our traditional Ukrainian cakes. We
              can adapt any cake to accommodate your dietary requirements.
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  cake: "Medovik (Honey Cake)",
                  allergens: ["Gluten", "Dairy", "Eggs"],
                  alternatives: "Gluten-friendly, dairy-free, and vegan versions available",
                },
                {
                  cake: "Kyiv Cake",
                  allergens: ["Gluten", "Dairy", "Eggs", "Nuts"],
                  alternatives: "Nut-free version available, can be adapted for other allergies",
                },
                {
                  cake: "Napoleon Cake",
                  allergens: ["Gluten", "Dairy", "Eggs"],
                  alternatives: "Gluten-friendly and dairy-free versions available",
                },
                {
                  cake: "Poppy Seed Roll",
                  allergens: ["Gluten", "Dairy", "Eggs"],
                  alternatives: "Gluten-friendly and dairy-free versions available",
                },
                {
                  cake: "Cherry Cake",
                  allergens: ["Gluten", "Dairy", "Eggs"],
                  alternatives: "Gluten-friendly and dairy-free versions available",
                },
                {
                  cake: "Apple Cake",
                  allergens: ["Gluten", "Dairy", "Eggs"],
                  alternatives: "Gluten-friendly and dairy-free versions available",
                },
              ].map((cake, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {cake.cake}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {cake.allergens.map((allergen, idx) => (
                        <Chip
                          key={idx}
                          label={allergen}
                          size="small"
                          sx={{
                            m: 0.5,
                            backgroundColor: "error.light",
                            color: "error.contrastText",
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600 }}>
                      {cake.alternatives}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Ordering with Allergies */}
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
              Ordering with Allergies
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Inform Us Early",
                  description:
                    "Please inform us of any allergies or dietary requirements when placing your order, preferably at least 1 week in advance",
                },
                {
                  step: "2",
                  title: "Detailed Consultation",
                  description:
                    "We'll discuss your specific requirements and recommend the best options for your dietary needs",
                },
                {
                  step: "3",
                  title: "Special Preparation",
                  description:
                    "We take extra precautions during preparation, including separate equipment and thorough cleaning",
                },
                {
                  step: "4",
                  title: "Clear Labeling",
                  description:
                    "Your cake will be clearly labeled with allergen information and preparation details",
                },
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {step.step}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
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
              Have Dietary Requirements?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
              Contact us to discuss your specific dietary needs and find the perfect Ukrainian cake
              for you
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
                Discuss Dietary Needs
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View Our Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
