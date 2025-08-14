import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button, Alert } from "@mui/material";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Vegan Cakes Leeds | Dairy-Free Ukrainian Cakes | Vegan Honey Cake (Medovik) | Plant-Based Cakes | Olgish Cakes",
  description:
    "Delicious vegan Ukrainian cakes in Leeds. Dairy-free, egg-free cakes made with plant-based ingredients. Traditional Ukrainian flavors like honey cake (Medovik) adapted for vegan diets. Custom vegan cake design available.",
  keywords:
    "vegan cakes Leeds, dairy-free Ukrainian cakes, vegan honey cake, vegan Medovik, plant-based cakes Leeds, vegan birthday cakes, vegan wedding cakes, dairy-free cakes Leeds, vegan cake delivery Leeds, Ukrainian vegan desserts",
  openGraph: {
    title:
      "Vegan Cakes Leeds | Dairy-Free Ukrainian Cakes | Vegan Honey Cake (Medovik) | Plant-Based Cakes",
    description:
      "Delicious vegan Ukrainian cakes in Leeds. Dairy-free, egg-free cakes made with plant-based ingredients. Traditional Ukrainian flavors like honey cake (Medovik) adapted for vegan diets.",
    url: "https://olgishcakes.co.uk/vegan-cakes-leeds",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/vegan-cakes-leeds.jpg",
        width: 1200,
        height: 630,
        alt: "Vegan Ukrainian Cakes Leeds - Honey Cake (Medovik) - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Vegan Cakes Leeds | Dairy-Free Ukrainian Cakes | Vegan Honey Cake (Medovik) | Plant-Based Cakes",
    description:
      "Delicious vegan Ukrainian cakes in Leeds. Dairy-free, egg-free cakes made with plant-based ingredients. Traditional Ukrainian flavors like honey cake (Medovik) adapted for vegan diets.",
    images: ["https://olgishcakes.co.uk/images/vegan-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/vegan-cakes-leeds",
  },
};

export default function VeganCakesLeedsPage() {
  return (
    <>
      <Script
        id="vegan-cakes-leeds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Vegan Cakes Leeds",
            description:
              "Order vegan Ukrainian cakes in Leeds. 100% plant-based cakes for all occasions.",
            provider: {
              "@type": "Bakery",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
            },
            serviceType: "Vegan Cake Design",
            areaServed: { "@type": "City", name: "Leeds" },
            url: "https://olgishcakes.co.uk/vegan-cakes-leeds",
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
              Vegan Ukrainian Cakes Leeds
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
              Delicious vegan Ukrainian cakes made with plant-based ingredients. Dairy-free,
              egg-free cakes that maintain the authentic taste and beauty of traditional Ukrainian
              desserts. Perfect for vegan celebrations and dietary requirements.
            </Typography>
            <Chip
              label="100% Plant-Based Ukrainian Cakes"
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

          {/* Vegan Certification Alert */}
          <Box sx={{ mb: 6 }}>
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: "1.1rem" }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                ðŸŒ± All our vegan cakes are certified plant-based and made with premium vegan
                ingredients. No dairy, eggs, or animal products used.
              </Typography>
            </Alert>
          </Box>

          {/* Vegan Cake Features */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Why Choose Our Vegan Ukrainian Cakes?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Authentic Ukrainian Flavors",
                  description:
                    "Traditional Ukrainian cake recipes adapted for vegan diets without compromising on taste or texture.",
                  icon: "ðŸ‡ºðŸ‡¦",
                },
                {
                  title: "Premium Plant-Based Ingredients",
                  description:
                    "High-quality vegan ingredients including plant-based milk, vegan butter, and natural sweeteners.",
                  icon: "ðŸŒ¿",
                },
                {
                  title: "Dairy-Free & Egg-Free",
                  description:
                    "Completely free from dairy, eggs, and all animal products. Suitable for strict vegan diets.",
                  icon: "ðŸ¥›âŒ",
                },
                {
                  title: "Custom Vegan Designs",
                  description:
                    "Beautiful custom designs for all occasions. Wedding cakes, birthday cakes, and celebration cakes.",
                  icon: "ðŸŽ¨",
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
                    <Typography variant="h3" sx={{ mb: 2 }}>
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

          {/* Vegan Cake Varieties */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Our Vegan Ukrainian Cake Collection
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Vegan Honey Cake",
                  description:
                    "Traditional Ukrainian honey cake made with plant-based ingredients. Layers of honey-infused sponge with vegan cream filling.",
                  price: "From Â£35",
                  image: "/images/vegan-cakes/vegan-honey-cake.jpg",
                },
                {
                  name: "Vegan Kyiv Cake",
                  description:
                    "Dairy-free version of the classic Kyiv cake. Rich chocolate layers with vegan meringue and hazelnut filling.",
                  price: "From Â£40",
                  image: "/images/vegan-cakes/vegan-kyiv-cake.jpg",
                },
                {
                  name: "Vegan Napoleon",
                  description:
                    "Plant-based Napoleon cake with flaky vegan pastry layers and dairy-free custard cream.",
                  price: "From Â£38",
                  image: "/images/vegan-cakes/vegan-napoleon.jpg",
                },
                {
                  name: "Vegan Chocolate Cake",
                  description:
                    "Rich chocolate cake made with dark chocolate and plant-based milk. Perfect for chocolate lovers.",
                  price: "From Â£32",
                  image: "/images/vegan-cakes/vegan-chocolate.jpg",
                },
                {
                  name: "Vegan Fruit Cake",
                  description:
                    "Light and fresh fruit cake with seasonal berries and vegan cream. Refreshing and delicious.",
                  price: "From Â£30",
                  image: "/images/vegan-cakes/vegan-fruit.jpg",
                },
                {
                  name: "Custom Vegan Cakes",
                  description:
                    "Personalized vegan cakes for any occasion. Wedding cakes, birthday cakes, and celebration cakes.",
                  price: "From Â£45",
                  image: "/images/vegan-cakes/custom-vegan.jpg",
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
                        variant="h4"
                        component="h4"
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
                        <Typography
                          variant="h4"
                          component="h4"
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
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

          {/* Vegan Ingredients Information */}
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
                Our Vegan Ingredients
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    Plant-Based Alternatives We Use:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Oat milk, almond milk, and coconut milk
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Vegan butter and margarine
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Flax seeds and chia seeds for egg replacement
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Aquafaba (chickpea water) for meringue
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    â€¢ Natural sweeteners and organic ingredients
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    What We Never Use:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Dairy products (milk, cream, butter)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Eggs or egg products
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Honey (replaced with agave or maple syrup)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Gelatin or animal-based thickeners
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    â€¢ Any animal-derived ingredients
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Vegan Customer Testimonials */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              What Our Vegan Customers Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Emma from Leeds",
                  text: "As a vegan, I was worried I'd never taste authentic Ukrainian cakes again. Olgish Cakes proved me wrong! The vegan honey cake is incredible.",
                  rating: 5,
                },
                {
                  name: "David from Bradford",
                  text: "Ordered a vegan wedding cake and it was perfect. Beautiful design, delicious taste, and completely dairy-free. Highly recommend!",
                  rating: 5,
                },
                {
                  name: "Sophie from Harrogate",
                  text: "The vegan Kyiv cake is absolutely divine. You can't tell it's dairy-free at all. Perfect for my daughter's birthday party.",
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
                      component="h4"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {testimonial.name}
                    </Typography>
                    <Box sx={{ display: "flex", mt: 1 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Typography key={i} sx={{ color: "#FEF102" }}>
                          â­
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
              Ready to Order Your Vegan Ukrainian Cake?
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Contact us today to discuss your vegan cake requirements, get a quote, or place an
              order. We're here to make your vegan celebration special with authentic Ukrainian
              flavors.
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
                Order Vegan Cake
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

