import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cakes Leeds | Bakery Leeds | Custom Cakes Leeds | Ukrainian Cakes | Olgish Cakes",
  description:
    "Fresh, handmade cakes in Leeds. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Leeds and surrounding areas.",
  keywords:
    "cakes Leeds, bakery Leeds, custom cakes Leeds, wedding cakes Leeds, birthday cakes Leeds, cake delivery Leeds, Ukrainian cakes Leeds, local bakery Leeds, fresh cakes Leeds",
  openGraph: {
    title: "Cakes Leeds | Bakery Leeds | Custom Cakes Leeds | Ukrainian Cakes",
    description:
      "Fresh, handmade cakes in Leeds. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Leeds and surrounding areas.",
    url: "https://olgishcakes.co.uk/cakes-leeds",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cakes-leeds.jpg",
        width: 1200,
        height: 630,
        alt: "Fresh Cakes Leeds - Olgish Cakes Ukrainian Bakery",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes Leeds | Bakery Leeds | Custom Cakes Leeds | Ukrainian Cakes",
    description:
      "Fresh, handmade cakes in Leeds. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts.",
    images: ["https://olgishcakes.co.uk/images/cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-leeds",
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

export default async function CakesLeedsPage() {
  const allCakes = await getAllCakes();

  return (
    <>
      <Script
        id="cakes-leeds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Leeds Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in Leeds. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Leeds and surrounding areas.",
            url: "https://olgishcakes.co.uk/cakes-leeds",
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
            geo: {
              "@type": "GeoCoordinates",
              latitude: "53.8008",
              longitude: "-1.5491",
            },
            openingHours: "Mo-Su 00:00-23:59",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Ukrainian Cakes",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Ukrainian Honey Cake",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Kyiv Cake",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Custom Wedding Cakes",
                  },
                },
              ],
            },
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
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
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes Leeds" }]} />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
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
              Fresh Cakes Leeds
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
              Handcrafted Ukrainian cakes made fresh in Leeds. From traditional Ukrainian desserts
              to custom celebration cakes, we bring authentic flavors and beautiful designs to our
              local community.
            </Typography>
            <Chip
              label="Local Leeds Bakery"
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

          {/* Local Bakery Features */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Made in Leeds",
                description:
                  "All our cakes are freshly baked in our Leeds kitchen using traditional Ukrainian recipes",
                icon: "🏠",
              },
              {
                title: "Local Delivery",
                description:
                  "Fast delivery service across Leeds and surrounding areas, ensuring your cake arrives fresh",
                icon: "🚚",
              },
              {
                title: "Ukrainian Traditions",
                description:
                  "Authentic Ukrainian baking techniques and flavors brought to the Leeds community",
                icon: "🇺🇦",
              },
              {
                title: "Personal Service",
                description:
                  "Local, personal service with consultations and custom cake design for Leeds customers",
                icon: "👥",
              },
            ].map((feature, index) => (
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
                    {feature.icon}
                  </Typography>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Cake Categories */}
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
              Our Cake Collection
            </Typography>

            <Grid container spacing={4}>
              {allCakes.slice(0, 6).map(cake => (
                <Grid item xs={12} sm={6} md={4} key={cake._id}>
                  <CakeCard cake={cake} />
                </Grid>
              ))}
            </Grid>

            {allCakes.length > 6 && (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Button
                  component={Link}
                  href="/cakes"
                  variant="outlined"
                  color="primary"
                  size="large"
                >
                  View All Cakes
                </Button>
              </Box>
            )}
          </Box>

          {/* Local Service Areas */}
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
              Serving Leeds and Surrounding Areas
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              We're proud to serve the Leeds community and surrounding areas with our authentic
              Ukrainian cakes. Our local delivery service ensures that your fresh, handmade cakes
              arrive at your doorstep or venue in perfect condition.
            </Typography>
            <Grid container spacing={3}>
              {[
                "Leeds City Centre",
                "Harehills",
                "Chapeltown",
                "Roundhay",
                "Moortown",
                "Alwoodley",
                "Headingley",
                "Hyde Park",
                "Woodhouse",
                "Burley",
                "Kirkstall",
                "Meanwood",
                "And surrounding areas",
              ].map((area, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
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
                    <Typography variant="body1">{area}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Why Choose Local */}
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
              Why Choose a Local Leeds Bakery?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Fresh & Local",
                  description:
                    "All cakes are made fresh in our Leeds kitchen, ensuring the highest quality and freshness for local customers.",
                },
                {
                  title: "Personal Touch",
                  description:
                    "As a local business, we provide personalized service and build lasting relationships with our Leeds community.",
                },
                {
                  title: "Support Local",
                  description:
                    "By choosing Olgish Cakes, you're supporting a local Leeds business and contributing to our vibrant community.",
                },
                {
                  title: "Quick Delivery",
                  description:
                    "Local delivery means faster service and fresher cakes, with same-day delivery available for urgent orders.",
                },
              ].map((benefit, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Local Testimonials */}
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
              What Leeds Customers Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  quote: "The best cakes in Leeds! The Ukrainian honey cake was absolutely divine.",
                  author: "Sarah M., Leeds City Centre",
                },
                {
                  quote:
                    "Amazing service and the wedding cake was perfect. Highly recommend for any celebration!",
                  author: "Emma & Tom, Roundhay",
                },
                {
                  quote:
                    "Fresh, delicious, and beautiful cakes. Great local bakery with authentic Ukrainian flavors.",
                  author: "David P., Headingley",
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="body1"
                      sx={{ mb: 3, fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      {testimonial.author}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Order Your Fresh Cake Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Experience the taste of authentic Ukrainian baking right here in Leeds. Contact us to
              order your fresh, handmade cake or schedule a consultation.
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
                Order Cake
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
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
