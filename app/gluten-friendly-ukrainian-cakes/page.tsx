import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button, Alert } from "@mui/material";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Gluten-Friendly Ukrainian Cakes Leeds | Celiac-Friendly Cakes | Wheat-Free Cakes | Olgish Cakes",
  description:
    "Delicious gluten-friendly Ukrainian cakes in Leeds. Celiac-friendly cakes made with certified gluten-friendly ingredients. Traditional Ukrainian flavors adapted for gluten-friendly diets. Safe for celiac disease.",
  keywords:
    "gluten-friendly Ukrainian cakes Leeds, celiac-friendly cakes, wheat-free cakes Leeds, gluten-friendly birthday cakes, gluten-friendly wedding cakes, celiac disease cakes, Ukrainian gluten-friendly desserts",
  openGraph: {
    title: "Gluten-Friendly Ukrainian Cakes Leeds | Celiac-Friendly Cakes | Wheat-Free Cakes",
    description:
      "Delicious gluten-friendly Ukrainian cakes in Leeds. Celiac-friendly cakes made with certified gluten-friendly ingredients. Traditional Ukrainian flavors adapted for gluten-friendly diets.",
    url: "https://olgishcakes.co.uk/gluten-friendly-ukrainian-cakes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/gluten-friendly-ukrainian-cakes.jpg",
        width: 1200,
        height: 630,
        alt: "Gluten-Friendly Ukrainian Cakes Leeds - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gluten-Friendly Ukrainian Cakes Leeds | Celiac-Friendly Cakes | Wheat-Free Cakes",
    description:
      "Delicious gluten-friendly Ukrainian cakes in Leeds. Celiac-friendly cakes made with certified gluten-friendly ingredients. Traditional Ukrainian flavors adapted for gluten-friendly diets.",
    images: ["https://olgishcakes.co.uk/images/gluten-friendly-ukrainian-cakes.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/gluten-friendly-ukrainian-cakes",
  },
};

export default function GlutenFriendlyUkrainianCakesPage() {
  return (
    <>
      <Script
        id="gluten-friendly-ukrainian-cakes-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Gluten-Friendly Ukrainian Cakes",
            description:
              "Order gluten-friendly Ukrainian cakes in Leeds. Safe for gluten-sensitive diets.",
            provider: {
              "@type": "Bakery",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
            },
            serviceType: "Gluten-Friendly Cake Design",
            areaServed: { "@type": "City", name: "Leeds" },
            url: "https://olgishcakes.co.uk/gluten-friendly-ukrainian-cakes",
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
              Gluten-Friendly Ukrainian Cakes Leeds
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
              Delicious gluten-friendly Ukrainian cakes made with certified gluten-friendly
              ingredients. Celiac-friendly cakes that maintain the authentic taste and beauty of
              traditional Ukrainian desserts. Safe for celiac disease and gluten intolerance.
            </Typography>
            <Chip
              label="Certified Gluten-Friendly Ukrainian Cakes"
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

          {/* Celiac Safety Alert */}
          <Box sx={{ mb: 6 }}>
            <Alert severity="success" sx={{ borderRadius: 2, fontSize: "1.1rem" }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                🛡️ All our gluten-friendly cakes are prepared in a dedicated gluten-friendly
                environment with certified gluten-friendly ingredients. Safe for celiac disease and
                gluten intolerance.
              </Typography>
            </Alert>
          </Box>

          {/* Gluten-Friendly Cake Features */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Why Choose Our Gluten-Friendly Ukrainian Cakes?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Celiac-Safe Preparation",
                  description:
                    "Dedicated gluten-friendly kitchen area with strict cross-contamination protocols. Certified safe for celiac disease.",
                  icon: "🛡️",
                },
                {
                  title: "Certified Gluten-Friendly Ingredients",
                  description:
                    "All ingredients are certified gluten-friendly and sourced from trusted suppliers. No wheat, rye, or barley used.",
                  icon: "✅",
                },
                {
                  title: "Authentic Ukrainian Taste",
                  description:
                    "Traditional Ukrainian cake recipes adapted for gluten-friendly diets without compromising on taste or texture.",
                  icon: "🇺🇦",
                },
                {
                  title: "Custom Gluten-Friendly Designs",
                  description:
                    "Beautiful custom designs for all occasions. Wedding cakes, birthday cakes, and celebration cakes.",
                  icon: "🎨",
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
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
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

          {/* Gluten-Friendly Cake Varieties */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Our Gluten-Friendly Ukrainian Cake Collection
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Gluten-Friendly Honey Cake",
                  description:
                    "Traditional Ukrainian honey cake made with gluten-friendly flour. Layers of honey-infused sponge with cream filling.",
                  price: "From £38",
                  image: "/images/gluten-friendly/gluten-friendly-honey-cake.jpg",
                },
                {
                  name: "Gluten-Friendly Kyiv Cake",
                  description:
                    "Celiac-safe version of the classic Kyiv cake. Rich chocolate layers with meringue and hazelnut filling.",
                  price: "From £42",
                  image: "/images/gluten-friendly/gluten-friendly-kyiv-cake.jpg",
                },
                {
                  name: "Gluten-Friendly Napoleon",
                  description:
                    "Wheat-free Napoleon cake with flaky gluten-friendly pastry layers and custard cream.",
                  price: "From £40",
                  image: "/images/gluten-friendly/gluten-friendly-napoleon.jpg",
                },
                {
                  name: "Gluten-Friendly Chocolate Cake",
                  description:
                    "Rich chocolate cake made with gluten-friendly flour. Perfect for chocolate lovers with celiac disease.",
                  price: "From £35",
                  image: "/images/gluten-friendly/gluten-friendly-chocolate.jpg",
                },
                {
                  name: "Gluten-Friendly Vanilla Cake",
                  description:
                    "Light and fluffy vanilla cake with gluten-friendly flour. Classic flavor for any celebration.",
                  price: "From £32",
                  image: "/images/gluten-friendly/gluten-friendly-vanilla.jpg",
                },
                {
                  name: "Custom Gluten-Friendly Cakes",
                  description:
                    "Personalized gluten-friendly cakes for any occasion. Wedding cakes, birthday cakes, and celebration cakes.",
                  price: "From £45",
                  image: "/images/gluten-friendly/custom-gluten-friendly.jpg",
                },
              ].map((cake, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${cake.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <Box sx={{ p: 3 }}>
                      <Typography
                        variant="h5"
                        sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                      >
                        {cake.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mb: 2, color: "text.secondary", lineHeight: 1.5 }}
                      >
                        {cake.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                          {cake.price}
                        </Typography>
                        <Button
                          variant="outlined"
                          component={Link}
                          href="/contact"
                          sx={{
                            borderColor: "primary.main",
                            color: "primary.main",
                            "&:hover": {
                              backgroundColor: "primary.main",
                              color: "white",
                            },
                          }}
                        >
                          Order Now
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Gluten-Friendly Safety Information */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
                Our Gluten-Friendly Safety Standards
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Gluten-Friendly Ingredients We Use:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Certified gluten-friendly flour blends
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Almond flour and coconut flour
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Gluten-friendly baking powder and xanthan gum
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Certified gluten-friendly vanilla and extracts
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • All ingredients tested for gluten contamination
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Our Safety Protocols:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Dedicated gluten-friendly preparation area
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Separate utensils and equipment
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Staff trained in celiac safety
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Regular testing for gluten contamination
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Clear labeling and allergen information
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Celiac Customer Testimonials */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              What Our Celiac Customers Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Sarah from Leeds",
                  text: "As someone with celiac disease, I was so happy to find authentic Ukrainian cakes I can safely eat. The gluten-friendly honey cake is amazing!",
                  rating: 5,
                },
                {
                  name: "James from Bradford",
                  text: "Ordered a gluten-friendly wedding cake and it was perfect. No gluten symptoms and tasted exactly like the traditional version.",
                  rating: 5,
                },
                {
                  name: "Lisa from Harrogate",
                  text: "Finally found gluten-friendly Ukrainian cakes that are safe for my daughter. The Kyiv cake is her favorite and she can eat it worry-free.",
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
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
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
              Ready to Order Your Gluten-Friendly Ukrainian Cake?
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Contact us today to discuss your gluten-friendly cake requirements, get a quote, or
              place an order. We're here to make your celebration special with safe, delicious
              Ukrainian flavors.
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
                Order Gluten-Friendly Cake
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/allergen-information"
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
                Allergen Information
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
