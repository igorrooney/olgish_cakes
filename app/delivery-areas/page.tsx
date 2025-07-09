import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cake Delivery Leeds | Cake Delivery Areas | Local Cake Delivery | Olgish Cakes",
  description:
    "Fresh cake delivery across Leeds and surrounding areas. Local cake delivery service covering West Yorkshire. Same-day and next-day cake delivery available.",
  keywords:
    "cake delivery Leeds, cake delivery areas, local cake delivery, cake delivery West Yorkshire, same day cake delivery Leeds, next day cake delivery, Ukrainian cake delivery",
  openGraph: {
    title: "Cake Delivery Leeds | Cake Delivery Areas | Local Cake Delivery",
    description:
      "Fresh cake delivery across Leeds and surrounding areas. Local cake delivery service covering West Yorkshire. Same-day and next-day cake delivery available.",
    url: "https://olgish-cakes.vercel.app/delivery-areas",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/cake-delivery.jpg",
        width: 1200,
        height: 630,
        alt: "Cake Delivery Leeds - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Delivery Leeds | Cake Delivery Areas | Local Cake Delivery",
    description:
      "Fresh cake delivery across Leeds and surrounding areas. Local cake delivery service covering West Yorkshire.",
    images: ["https://olgish-cakes.vercel.app/images/cake-delivery.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/delivery-areas",
  },
};

export default function DeliveryAreasPage() {
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
              Fresh, beautiful cakes delivered right to your doorstep across Leeds and surrounding
              areas. Our local delivery service ensures your Ukrainian cakes arrive in perfect
              condition for your special occasions.
            </Typography>
            <Chip
              label="Local Cake Delivery Service"
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

          {/* Delivery Service Features */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Fresh Delivery",
                description:
                  "All cakes are delivered fresh on the day of your celebration, ensuring maximum freshness and taste",
                icon: "🚚",
              },
              {
                title: "Local Service",
                description:
                  "Local delivery service covering Leeds and surrounding areas with personal attention to detail",
                icon: "📍",
              },
              {
                title: "Careful Handling",
                description:
                  "Professional cake delivery with special care to ensure your cake arrives in perfect condition",
                icon: "🎂",
              },
              {
                title: "Flexible Timing",
                description:
                  "Flexible delivery times to accommodate your schedule and celebration timing",
                icon: "⏰",
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
              Our Delivery Areas
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              We deliver fresh Ukrainian cakes across Leeds and surrounding areas in West Yorkshire.
              Our local delivery service ensures your cake arrives fresh and beautiful for your
              special occasion.
            </Typography>

            {/* Leeds Areas */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
                Leeds City & Surrounding Areas
              </Typography>
              <Grid container spacing={3}>
                {[
                  "Leeds City Centre",
                  "Headingley",
                  "Chapel Allerton",
                  "Roundhay",
                  "Moortown",
                  "Alwoodley",
                  "Harehills",
                  "Chapeltown",
                  "Meanwood",
                  "Woodhouse",
                  "Hyde Park",
                  "Burley",
                  "Kirkstall",
                  "Armley",
                  "Pudsey",
                  "Farsley",
                  "Calverley",
                  "Guiseley",
                  "Yeadon",
                  "Rawdon",
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
            </Box>

            {/* West Yorkshire Areas */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
                West Yorkshire Areas
              </Typography>
              <Grid container spacing={3}>
                {[
                  "Bradford",
                  "Huddersfield",
                  "Wakefield",
                  "Halifax",
                  "Dewsbury",
                  "Batley",
                  "Morley",
                  "Otley",
                  "Ilkley",
                  "Keighley",
                  "Shipley",
                  "Bingley",
                  "Skipton",
                  "Wetherby",
                  "Tadcaster",
                  "Garforth",
                  "Rothwell",
                  "Kippax",
                  "Castleford",
                  "Pontefract",
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
            </Box>

            {/* Delivery Fees */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h4" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
                Delivery Fees
              </Typography>
              <Grid container spacing={4}>
                {[
                  {
                    zone: "Zone 1 - Leeds City Centre",
                    fee: "£5",
                    description:
                      "Central Leeds areas including City Centre, Headingley, Chapel Allerton",
                  },
                  {
                    zone: "Zone 2 - Leeds Suburbs",
                    fee: "£8",
                    description: "Leeds suburbs including Roundhay, Moortown, Alwoodley, Harehills",
                  },
                  {
                    zone: "Zone 3 - Leeds Outskirts",
                    fee: "£12",
                    description: "Outer Leeds areas including Pudsey, Farsley, Calverley, Guiseley",
                  },
                  {
                    zone: "Zone 4 - West Yorkshire",
                    fee: "£15-25",
                    description: "West Yorkshire areas including Bradford, Huddersfield, Wakefield",
                  },
                ].map((zone, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}
                      >
                        {zone.zone}
                      </Typography>
                      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                        {zone.fee}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {zone.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>

          {/* Delivery Times */}
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
              Delivery Times & Options
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Same Day Delivery",
                  description:
                    "Available for orders placed before 10 AM for delivery within Leeds City Centre on the same day",
                  time: "10 AM - 6 PM",
                  icon: "⚡",
                },
                {
                  title: "Next Day Delivery",
                  description:
                    "Standard delivery service for orders placed before 6 PM for delivery the following day",
                  time: "9 AM - 6 PM",
                  icon: "📅",
                },
                {
                  title: "Scheduled Delivery",
                  description:
                    "Pre-arranged delivery times to ensure your cake arrives exactly when you need it",
                  time: "Flexible",
                  icon: "⏰",
                },
                {
                  title: "Weekend Delivery",
                  description:
                    "Saturday and Sunday delivery available for weekend celebrations and events",
                  time: "10 AM - 4 PM",
                  icon: "🌅",
                },
              ].map((option, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: "2.5rem" }}>
                      {option.icon}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {option.description}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {option.time}
                    </Typography>
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
                  title: "Order Confirmation",
                  description:
                    "We confirm your order and delivery details, including address, date, and preferred time slot",
                },
                {
                  step: "2",
                  title: "Cake Preparation",
                  description:
                    "Your cake is carefully prepared and packaged for safe delivery, ensuring it stays fresh and beautiful",
                },
                {
                  step: "3",
                  title: "Delivery Day",
                  description:
                    "On delivery day, we contact you to confirm timing and ensure someone is available to receive the cake",
                },
                {
                  step: "4",
                  title: "Safe Delivery",
                  description:
                    "Your cake is delivered with care, and we ensure it's properly placed and ready for your celebration",
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
              Ready to Order Your Cake?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
              Contact us to check delivery availability in your area
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
                Check Delivery Availability
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
