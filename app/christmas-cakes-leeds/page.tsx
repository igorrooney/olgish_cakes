import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Christmas Cakes Leeds | Ukrainian Christmas Cakes | Traditional Christmas Honey Cake | Olgish Cakes",
  description:
    "Traditional Ukrainian Christmas cakes in Leeds. Christmas honey cake, festive Ukrainian desserts, and holiday celebration cakes. Authentic Ukrainian Christmas baking traditions for your festive table.",
  keywords:
    "Christmas cakes Leeds, Ukrainian Christmas cakes, Christmas honey cake, festive Ukrainian desserts, Christmas cake delivery Leeds, traditional Christmas cakes, holiday cakes Leeds",
  openGraph: {
    title: "Christmas Cakes Leeds | Ukrainian Christmas Cakes | Traditional Christmas Honey Cake",
    description:
      "Traditional Ukrainian Christmas cakes in Leeds. Christmas honey cake, festive Ukrainian desserts, and holiday celebration cakes. Authentic Ukrainian Christmas baking traditions.",
    url: "https://olgishcakes.com/christmas-cakes-leeds",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.com/images/christmas-cakes-leeds.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Christmas Cakes Leeds - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Christmas Cakes Leeds | Ukrainian Christmas Cakes | Traditional Christmas Honey Cake",
    description:
      "Traditional Ukrainian Christmas cakes in Leeds. Christmas honey cake, festive Ukrainian desserts, and holiday celebration cakes.",
    images: ["https://olgishcakes.com/images/christmas-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/christmas-cakes-leeds",
  },
};

export default function ChristmasCakesLeedsPage() {
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
              Ukrainian Christmas Cakes Leeds
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
              Celebrate Christmas with authentic Ukrainian Christmas cakes. Traditional Christmas
              honey cake, festive Ukrainian desserts, and holiday celebration cakes that bring the
              warmth and tradition of Ukrainian Christmas to your festive table.
            </Typography>
            <Chip
              label="Traditional Ukrainian Christmas Baking"
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

          {/* Christmas Cake Features */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Ukrainian Christmas Cake Traditions
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Christmas Honey Cake",
                  description:
                    "The traditional Ukrainian Christmas honey cake, made with layers of honey-infused sponge and creamy filling. A festive favorite.",
                  icon: "🍯",
                },
                {
                  title: "Festive Decorations",
                  description:
                    "Beautiful Christmas-themed decorations including snowflakes, holly, and traditional Ukrainian Christmas symbols.",
                  icon: "❄️",
                },
                {
                  title: "Family Celebrations",
                  description:
                    "Perfect for family Christmas gatherings, bringing authentic Ukrainian Christmas traditions to your home.",
                  icon: "👨‍👩‍👧‍👦",
                },
                {
                  title: "Christmas Delivery",
                  description:
                    "Special Christmas delivery service ensuring your festive cakes arrive fresh and beautiful for your celebrations.",
                  icon: "🎁",
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

          {/* Christmas Cake Collection */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Our Christmas Cake Collection
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Christmas Honey Cake",
                  description:
                    "Traditional Ukrainian Christmas honey cake with festive decorations. Layers of honey sponge with cream filling.",
                  price: "From £45",
                  image: "/images/christmas/christmas-honey-cake.jpg",
                },
                {
                  name: "Festive Kyiv Cake",
                  description:
                    "Christmas version of the classic Kyiv cake with holiday decorations and festive colors.",
                  price: "From £50",
                  image: "/images/christmas/festive-kyiv-cake.jpg",
                },
                {
                  name: "Christmas Napoleon",
                  description:
                    "Festive Napoleon cake with Christmas decorations and seasonal flavors.",
                  price: "From £48",
                  image: "/images/christmas/christmas-napoleon.jpg",
                },
                {
                  name: "Winter Wonderland Cake",
                  description:
                    "Beautiful winter-themed cake with snowflakes and Christmas decorations.",
                  price: "From £55",
                  image: "/images/christmas/winter-wonderland.jpg",
                },
                {
                  name: "Ukrainian Christmas Log",
                  description:
                    "Traditional Christmas log cake with Ukrainian flavors and festive decorations.",
                  price: "From £42",
                  image: "/images/christmas/ukrainian-christmas-log.jpg",
                },
                {
                  name: "Custom Christmas Cakes",
                  description:
                    "Personalized Christmas cakes designed to your specifications. Perfect for family celebrations.",
                  price: "From £60",
                  image: "/images/christmas/custom-christmas.jpg",
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

          {/* Christmas Ordering Information */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #D32F2F 0%, #FF5722 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
                Christmas Cake Ordering Information
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Christmas Order Deadlines:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Christmas Eve delivery: Order by December 20th
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Christmas Day delivery: Order by December 21st
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Boxing Day delivery: Order by December 22nd
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • New Year's Eve delivery: Order by December 27th
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Early orders recommended for custom designs
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Christmas Delivery Service:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Special Christmas delivery slots available
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Delivery to Leeds and surrounding areas
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Careful handling to preserve decorations
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Christmas Eve and Christmas Day delivery
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Festive packaging and presentation
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Christmas Customer Testimonials */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Christmas Cake Reviews
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Maria from Leeds",
                  text: "The Christmas honey cake was the highlight of our Ukrainian Christmas celebration. Beautiful decorations and authentic taste!",
                  rating: 5,
                },
                {
                  name: "Peter from Bradford",
                  text: "Ordered a custom Christmas cake for our family gathering. It was stunning and tasted amazing. Perfect for the holidays!",
                  rating: 5,
                },
                {
                  name: "Anna from Harrogate",
                  text: "The festive Kyiv cake brought back memories of Christmas in Ukraine. Delivered perfectly on Christmas Eve.",
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
              Order Your Christmas Ukrainian Cake Today
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Don't miss out on authentic Ukrainian Christmas cakes. Order early to secure your
              preferred delivery date and ensure your festive celebrations are complete with
              traditional Ukrainian flavors.
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
                Order Christmas Cake
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/seasonal-cakes"
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
                View All Seasonal Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
