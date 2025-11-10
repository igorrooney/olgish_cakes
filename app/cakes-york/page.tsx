import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title:
    "Cakes York £25+ | 5★ | Ukrainian Honey Cake Delivery",
  description:
    "★★★★★ Cakes York from £25 | Ukrainian honey cake & Kyiv cake | Wedding & birthday | Same-day delivery | 127+ reviews | Order fresh cakes in York today!",
  keywords:
    "cakes York, Ukrainian cakes York, custom cakes York, wedding cakes York, birthday cakes York, cake delivery York, bakery York, traditional Ukrainian cakes York",
  openGraph: {
    title: "Cakes York | Ukrainian Cakes",
    description:
      "Fresh Ukrainian cakes delivered to York. Custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Professional cake delivery service covering York and surrounding areas.",
    url: "https://olgishcakes.co.uk/cakes-york",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cakes-york.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Cakes York - Olgish Cakes Delivery Service",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes York | Ukrainian Cakes",
    description:
      "Fresh Ukrainian cakes delivered to York. Custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts.",
    images: ["https://olgishcakes.co.uk/images/cakes-york.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-york",
  },
};

export default async function CakesYorkPage() {
  const allCakes = await getAllCakes();
  const featuredCakes = allCakes.slice(0, 6);

  return (
    <>
      <Script
        id="cakes-york-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - York Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in York. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in York and surrounding areas.",
            url: "https://olgishcakes.co.uk/cakes-york",
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
              latitude: "53.9590",
              longitude: "-1.0815",
            },
            openingHours: "Mo-Su 00:00-23:59",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            areaServed: {
              "@type": "City",
              name: "York",
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
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes York" }]} />
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
              Ukrainian Cakes York
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
              Experience real Ukrainian cakes delivered fresh to York. From traditional honey
              cake to custom celebration cakes, I bring the taste of Ukraine to your doorstep in
              York and surrounding areas.
            </Typography>
            <Chip
              label="Fresh Delivery to York"
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

          {/* York-Specific Features */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Why Choose Olgish Cakes for York?
            </Typography>
            <Grid container spacing={4}>
              {[
              {
                title: "Fresh Delivery to York",
                description:
                  "Professional delivery service covering York city centre and surrounding areas. Same-day and next-day delivery available.",
                  icon: "🚚",
                },
                {
                  title: "Real Ukrainian Recipes",
                  description:
                    "Traditional Ukrainian cakes made with real recipes passed down through generations. Experience the real taste of Ukraine.",
                  icon: "🇺🇦",
                },
                {
                  title: "Custom Cake Design",
                  description:
                    "Personalized cakes for all occasions. Wedding cakes, birthday cakes, and celebration cakes designed to your specifications.",
                  icon: "🎨",
                },
                {
                  title: "Local York Community",
                  description:
                    "Serving the York community with love and care. Supporting local events and celebrations with beautiful Ukrainian cakes.",
                  icon: "🏰",
                },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      height: "100%",
                      borderRadius: 3,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      {feature.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                      {feature.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Featured Cakes */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Popular Cakes in York
            </Typography>
            <Grid container spacing={4}>
              {featuredCakes.map(cake => (
                <Grid item xs={12} sm={6} md={4} key={cake._id}>
                  <CakeCard cake={cake} />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="contained"
                component={Link}
                href="/cakes"
                sx={{
                  backgroundColor: "primary.main",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                View All Cakes
              </Button>
            </Box>
          </Box>

          {/* York Delivery Information */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
                Cake Delivery to York
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Areas in York:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • York City Centre
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Clifton
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Heworth
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Acomb
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Fulford
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • And surrounding areas
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Options:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Same-day delivery (orders before 2 PM)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Next-day delivery
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Scheduled delivery for special occasions
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Wedding cake delivery service
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Corporate delivery for office events
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Local York Testimonials */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              What York Customers Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Sarah from York City Centre",
                  text: "The honey cake was absolutely perfect for our Ukrainian-themed wedding. The delivery was on time and the cake was beautiful!",
                  rating: 5,
                },
                {
                  name: "Michael from Clifton",
                  text: "Ordered a birthday cake for my daughter and it was the highlight of her party. The Ukrainian design was stunning and tasted amazing.",
                  rating: 5,
                },
                {
                  name: "Emma from Heworth",
                  text: "Professional service and delicious cakes. The Kyiv cake was authentic and reminded me of my grandmother's baking.",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ mb: 3, fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {testimonial.name}
                    </Typography>
                    <Box sx={{ display: "flex", mt: 1 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Typography key={i} sx={{ color: "#FFD700" }}>
                          ⭐
                        </Typography>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
              Ready to Order Your Ukrainian Cake in York?
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Contact me today to talk about your cake needs, get a price, or place an order for
              delivery to York.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                component={Link}
                href="/contact"
                sx={{
                  backgroundColor: "primary.main",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Contact Us
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/how-to-order"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                How to Order
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
