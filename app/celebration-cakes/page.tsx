import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Link from "next/link";
import Script from "next/script";
import { blocksToText } from "@/types/cake";

export const metadata: Metadata = {
  title:
    "Celebration Cakes Leeds | Party Cakes | Anniversary Cakes | Special Occasion Cakes | Olgish Cakes",
  description:
    "Beautiful celebration cakes in Leeds for all special occasions. Anniversary cakes, party cakes, graduation cakes, and more. Ukrainian-inspired celebration cakes with old flavors.",
  keywords:
    "celebration cakes Leeds, party cakes, anniversary cakes, graduation cakes, special occasion cakes, Ukrainian celebration cakes, custom celebration cakes Leeds, event cakes",
  openGraph: {
    title: "Celebration Cakes Leeds | Party Cakes | Anniversary Cakes | Special Occasion Cakes",
    description:
      "Beautiful celebration cakes in Leeds for all special occasions. Anniversary cakes, party cakes, graduation cakes, and more. Ukrainian-inspired celebration cakes with old flavors.",
    url: "https://olgishcakes.co.uk/celebration-cakes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/celebration-cakes.jpg",
        width: 1200,
        height: 630,
        alt: "Beautiful Celebration Cakes Leeds - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Celebration Cakes Leeds | Party Cakes | Anniversary Cakes | Special Occasion Cakes",
    description:
      "Beautiful celebration cakes in Leeds for all special occasions. Anniversary cakes, party cakes, graduation cakes, and more.",
    images: ["https://olgishcakes.co.uk/images/celebration-cakes.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/celebration-cakes",
  },
};

export default async function CelebrationCakesPage() {
  const allCakes = await getAllCakes();
  const celebrationCakes = allCakes.filter(
    cake =>
      cake.category === "custom" ||
      cake.name.toLowerCase().includes("celebration") ||
      blocksToText(cake.description).toLowerCase().includes("celebration")
  );

  return (
    <>
      <Script
        id="celebration-cakes-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Celebration Cakes Leeds",
            description:
              "Beautiful celebration cakes in Leeds for all special occasions. Anniversary cakes, party cakes, graduation cakes, and more. Ukrainian-inspired celebration cakes with traditional flavors.",
            provider: {
              "@type": "Bakery",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
              telephone: "+44 786 721 8194",
              email: "hello@olgishcakes.co.uk",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Allerton Grange",
                addressLocality: "Leeds",
                postalCode: "LS17",
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
            },
            serviceType: "Celebration Cake Design",
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Celebration Cake Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Anniversary Cakes",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Graduation Cakes",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Retirement Cakes",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Baby Shower Cakes",
                  },
                },
              ],
            },
            url: "https://olgishcakes.co.uk/celebration-cakes",
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
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Celebration Cakes", href: "/celebration-cakes" },
              ]}
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
              Celebration Cakes Leeds
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
              Celebrate every special moment with my beautiful Ukrainian celebration cakes. From
              birthdays to anniversaries, I create cakes that make your celebrations unforgettable.
            </Typography>
            <Chip
              label="Custom Celebration Cake Design"
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

          {/* Celebration Types */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
                {
                  title: "Anniversary Cakes",
                  description:
                    "Nice anniversary cakes celebrating love and commitment with romantic designs and Ukrainian flavors",
                  icon: "💕",
                },
                {
                  title: "Graduation Cakes",
                  description:
                    "Achievement celebration cakes perfect for graduations, promotions, and academic milestones",
                  icon: "🎓",
                },
                {
                  title: "Retirement Cakes",
                  description:
                    "Special retirement cakes honoring years of hard work and new beginnings",
                  icon: "🌅",
                },
                {
                  title: "Housewarming Cakes",
                  description:
                    "Warm welcome cakes for new homes, featuring cozy designs and old Ukrainian hospitality",
                  icon: "🏠",
                },
            ].map((celebration, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    height: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {celebration.icon}
                  </Typography>
                  <Typography variant="h3" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    {celebration.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {celebration.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* More Celebration Types */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Baby Shower Cakes",
                description:
                  "Sweet baby shower cakes celebrating new life with delicate designs and gentle flavors",
                icon: "👶",
              },
              {
                title: "Engagement Cakes",
                description:
                  "Romantic engagement cakes marking the beginning of a beautiful journey together",
                icon: "💍",
              },
              {
                title: "Corporate Cakes",
                description:
                  "Professional corporate celebration cakes for business milestones and team achievements",
                icon: "🏢",
              },
                {
                  title: "Cultural Cakes",
                  description:
                    "Old Ukrainian celebration cakes honoring cultural heritage and family traditions",
                  icon: "🇺🇦",
                },
            ].map((celebration, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    height: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {celebration.icon}
                  </Typography>
                  <Typography variant="h3" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    {celebration.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {celebration.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Celebration Cake Gallery */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Celebration Cake Inspiration
            </Typography>

            {celebrationCakes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h3" component="h3" color="text.secondary" sx={{ mb: 2 }}>
                  Custom Celebration Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Every celebration cake is custom-designed to match your special occasion. Contact
                  me to talk about your celebration cake needs and view my portfolio.
                </Typography>
                <Button
                  component={Link}
                  href="/contact"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Celebration Cake Consultation
                </Button>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {celebrationCakes.map(cake => (
                  <Grid item xs={12} sm={6} md={4} key={cake._id}>
                    <CakeCard cake={cake} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Ukrainian Celebration Traditions */}
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
              Ukrainian Celebration Traditions
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Ukrainian celebrations are rich with tradition and meaning. My celebration cakes
              include these cultural elements while creating modern, beautiful designs for your
              special occasions.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Symbolic Designs",
                  description:
                    "Traditional Ukrainian symbols like wheat, flowers, and geometric patterns that represent prosperity and good fortune",
                },
                {
                  title: "Seasonal Celebrations",
                  description:
                    "Cakes designed around Ukrainian seasonal celebrations like Kupala Night, Harvest Festival, and Christmas traditions",
                },
                {
                  title: "Family Traditions",
                  description:
                    "Cakes that honor family heritage and traditional Ukrainian family celebration customs",
                },
                {
                  title: "Modern Ukrainian",
                  description:
                    "Contemporary interpretations of Ukrainian traditions, blending old and new for today's celebrations",
                },
              ].map((tradition, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h3" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
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

          {/* Celebration Cake Flavors */}
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
              Celebration Cake Flavors
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              My celebration cakes feature a selection of flavors perfect for special occasions.
              From old Ukrainian favorites to classic celebration flavors, I have something
              for every taste and occasion.
            </Typography>
            <Grid container spacing={3}>
              {[
                "Medovik (Honey Cake) - Traditional Ukrainian honey layers for prosperity",
                "Kyiv Cake - Rich chocolate and hazelnut meringue for luxury celebrations",
                "Vanilla Bean - Classic celebration cake with Ukrainian twist",
                "Chocolate Fudge - Decadent chocolate layers for indulgent celebrations",
                "Lemon Poppy Seed - Light and refreshing option for summer celebrations",
                "Red Velvet - Classic with Ukrainian cream cheese frosting",
                "Strawberry Cream - Fresh strawberry filling for romantic celebrations",
                "Carrot Cake - Traditional with Ukrainian spices for wholesome celebrations",
              ].map((flavor, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        mr: 2,
                      }}
                    />
                    <Typography variant="body1">{flavor}</Typography>
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
              Ready to Celebrate?
            </Typography>
            <Typography variant="h3" component="h3" sx={{ mb: 4, color: "text.secondary" }}>
              Contact me today to start planning your perfect celebration cake
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
                Order Celebration Cake
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
