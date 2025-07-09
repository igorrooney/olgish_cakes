import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cake Delivery Leeds | Bakery Delivery Service | Wedding Cake Delivery | Olgish Cakes",
  description:
    "Professional cake delivery service in Leeds. Wedding cake delivery, birthday cake delivery, and celebration cake delivery. Safe and secure delivery to your venue or home.",
  keywords:
    "cake delivery Leeds, bakery delivery Leeds, wedding cake delivery, birthday cake delivery, celebration cake delivery, cake delivery service, secure cake delivery, local cake delivery",
  openGraph: {
    title: "Cake Delivery Leeds | Bakery Delivery Service | Wedding Cake Delivery",
    description:
      "Professional cake delivery service in Leeds. Wedding cake delivery, birthday cake delivery, and celebration cake delivery. Safe and secure delivery to your venue or home.",
    url: "https://olgish-cakes.vercel.app/cake-delivery",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/cake-delivery.jpg",
        width: 1200,
        height: 630,
        alt: "Cake Delivery Leeds - Professional Bakery Delivery Service",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Delivery Leeds | Bakery Delivery Service | Wedding Cake Delivery",
    description:
      "Professional cake delivery service in Leeds. Wedding cake delivery, birthday cake delivery, and celebration cake delivery. Safe and secure delivery to your venue or home.",
    images: ["https://olgish-cakes.vercel.app/images/cake-delivery.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/cake-delivery",
  },
};

export default function CakeDeliveryPage() {
  return (
    <>
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
              Cake Delivery Leeds
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
              Professional cake delivery service across Leeds and surrounding areas. From wedding
              cakes to birthday cakes, we ensure your cake arrives safely and beautifully presented
              at your venue or home.
            </Typography>
            <Chip
              label="Professional Delivery Service"
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

          {/* Delivery Services */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Wedding Cake Delivery",
                description:
                  "Professional delivery and setup service for wedding cakes at your venue",
                icon: "💍",
              },
              {
                title: "Birthday Cake Delivery",
                description:
                  "Safe and timely delivery of birthday cakes to your home or party venue",
                icon: "🎂",
              },
              {
                title: "Celebration Cake Delivery",
                description:
                  "Delivery service for all types of celebration cakes and special occasions",
                icon: "🎉",
              },
              {
                title: "Local Leeds Delivery",
                description: "Fast delivery service across Leeds and surrounding areas",
                icon: "🚚",
              },
            ].map((service, index) => (
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
                  <Typography variant="h2" sx={{ mb: 2, fontSize: "3rem" }}>
                    {service.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Delivery Areas */}
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
              Delivery Areas
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              We provide professional cake delivery service across Leeds and surrounding areas. Our
              delivery team ensures your cake arrives safely and on time, with careful handling and
              professional setup when required.
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
                "Beeston",
                "Hunslet",
                "Holbeck",
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

          {/* Delivery Process */}
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
              Our Delivery Process
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Careful Preparation",
                  description:
                    "Your cake is carefully packaged and secured in specialized cake boxes to ensure safe transportation.",
                },
                {
                  step: "2",
                  title: "Temperature Control",
                  description:
                    "Cakes are transported in temperature-controlled conditions to maintain freshness and quality.",
                },
                {
                  step: "3",
                  title: "Professional Transport",
                  description:
                    "Experienced delivery team handles your cake with the utmost care during transportation.",
                },
                {
                  step: "4",
                  title: "Safe Delivery",
                  description:
                    "Cake is delivered to your specified location with careful handling and professional setup if required.",
                },
                {
                  step: "5",
                  title: "Quality Check",
                  description:
                    "Final inspection ensures your cake arrives in perfect condition and ready for your celebration.",
                },
                {
                  step: "6",
                  title: "Setup Service",
                  description:
                    "For wedding cakes and special events, we provide professional setup and arrangement service.",
                },
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
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
                        fontWeight: "bold",
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

          {/* Delivery Options */}
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
              Delivery Options
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Standard Delivery",
                  description:
                    "Delivery to your home or venue within Leeds and surrounding areas. Includes careful handling and basic setup.",
                  price: "From £5",
                },
                {
                  title: "Wedding Cake Delivery",
                  description:
                    "Professional delivery and setup service for wedding cakes. Includes venue setup, arrangement, and coordination.",
                  price: "From £15",
                },
                {
                  title: "Same Day Delivery",
                  description:
                    "Urgent delivery service for last-minute orders. Subject to availability and location.",
                  price: "From £10",
                },
                {
                  title: "Collection Service",
                  description:
                    "Free collection from our Leeds bakery. Perfect for customers who prefer to collect their cakes.",
                  price: "Free",
                },
              ].map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 4,
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {option.description}
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={600}>
                      {option.price}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Delivery Tips */}
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
              Cake Delivery Tips
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              To ensure your cake arrives in perfect condition, we follow strict delivery protocols
              and provide helpful tips for receiving your cake.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Delivery Timing",
                  description:
                    "Schedule delivery 1-2 hours before your event to allow time for setup and temperature adjustment.",
                },
                {
                  title: "Storage Instructions",
                  description:
                    "Keep your cake in a cool, dry place away from direct sunlight and heat sources until serving.",
                },
                {
                  title: "Handling Care",
                  description:
                    "Avoid moving the cake once it's been delivered and set up to prevent damage to decorations.",
                },
                {
                  title: "Temperature Control",
                  description:
                    "Maintain room temperature for most cakes, or refrigerate if specified in your order details.",
                },
              ].map((tip, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {tip.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tip.description}
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
              Order Your Cake with Delivery
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Ready to order your cake with professional delivery service? Contact us to discuss
              your delivery requirements and get a quote for your area.
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
                Order with Delivery
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View Cake Collection
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
