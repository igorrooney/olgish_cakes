import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
export const metadata: Metadata = {
  title: "Cake Tasting Sessions Leeds | Ukrainian Tasting",
  description:
    "Book a cake tasting session in Leeds. Sample traditional Ukrainian cakes including honey cake and Kyiv cake. Perfect for wedding cake selection and special occasions.",
  keywords:
    "cake tasting sessions Leeds, Ukrainian cake tasting, wedding cake tasting, honey cake tasting, cake sampling Leeds",
  openGraph: {
    title: "Cake Tasting Sessions Leeds | Ukrainian Tasting",
    description:
      "Book a cake tasting session in Leeds. Sample traditional Ukrainian cakes including honey cake and Kyiv cake.",
    url: "https://olgishcakes.co.uk/cake-tasting-sessions",
    images: ["https://olgishcakes.co.uk/images/cake-tasting-sessions.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Tasting Sessions Leeds | Ukrainian Tasting",
    description:
      "Book a cake tasting session in Leeds. Sample traditional Ukrainian cakes including honey cake and Kyiv cake.",
    images: ["https://olgishcakes.co.uk/images/cake-tasting-sessions.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-tasting-sessions",
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

export default function CakeTastingSessionsPage() {
  return (
    <>
      <Script
        id="cake-tasting-sessions-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Cake Tasting Sessions Leeds",
            description:
              "Book a cake tasting session in Leeds. Sample traditional Ukrainian cakes including honey cake and Kyiv cake. Perfect for wedding cake selection and special occasions.",
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
            serviceType: "Cake Tasting Service",
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Tasting Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Ukrainian Cake Tasting",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Wedding Cake Tasting",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Honey Cake Tasting",
                  },
                },
              ],
            },
            url: "https://olgishcakes.co.uk/cake-tasting-sessions",
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
              Cake Tasting Sessions Leeds
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
              Experience the authentic taste of Ukrainian cakes before you order. Our cake tasting
              sessions let you sample our traditional honey cake, Kyiv cake, and other Ukrainian
              specialties in a relaxed, informative setting.
            </Typography>
            <Chip
              label="Traditional Ukrainian Cake Tasting"
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

          {/* What to Expect */}
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
              What to Expect at Your Cake Tasting Session
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}
            >
              When you book a cake tasting session with me, you are not just trying cakes - you are experiencing 
              the real taste of Ukrainian tradition and culture. Each session is personal and relaxed, giving you 
              time to discover which flavors speak to your heart and make your celebration special.
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🍯</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Traditional Ukrainian Cakes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Start with my signature Honey Cake (Medovik) and Kyiv Cake. These traditional Ukrainian 
                    cakes have been made in my family for generations, and I want you to taste the authentic 
                    flavors that make these cakes so special.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🎂</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Popular Celebration Flavors
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Try my Vanilla Delicia, Chocolate Delicia, Napoleon Cake, and Sacher Torte. Each cake 
                    has its own personality and perfect occasion. I will help you understand which flavors 
                    work best for your celebration and guests.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>💬</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Personal Consultation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    During your tasting, we will discuss your celebration, guest preferences, dietary needs, 
                    and design ideas. This helps me create the perfect cake that reflects your vision and 
                    makes your special day unforgettable.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Tasting Process */}
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
              How the Tasting Process Works
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Step 1: Book Your Session
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Contact me to arrange your tasting session. I prefer to do tastings in person at my kitchen 
                    in Leeds, but I can also arrange tastings at your location for larger events. Sessions usually 
                    last about 45-60 minutes, giving us plenty of time to taste and discuss your perfect cake.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Step 2: Taste and Discover
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    I will prepare small portions of different cakes for you to taste. Take your time with each one, 
                    notice the textures, flavors, and how they make you feel. Some people love the traditional honey 
                    taste of Medovik, while others prefer the rich chocolate of Sacher Torte.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Step 3: Discuss Your Vision
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    While we taste, I will ask about your celebration - the occasion, number of guests, any special 
                    dietary requirements, and your design preferences. This helps me understand what will make your 
                    cake perfect for your special moment.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Step 4: Plan Your Perfect Cake
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Based on your preferences and the tasting, I will suggest the perfect cake combination for your 
                    celebration. We will discuss size, design, delivery, and any special requirements. By the end 
                    of the session, you will have a clear plan for your perfect cake.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Perfect For Section */}
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
              Cake Tasting Sessions Are Perfect For
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>💒</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Wedding Planning
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Your wedding cake is one of the most important decisions you will make. A tasting session 
                    helps you choose the perfect flavors and design that reflect your love story and delight your guests.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🎂</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Special Birthdays
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Milestone birthdays deserve something extra special. Whether it is a 50th birthday or 
                    sweet 16, a tasting session helps you find the perfect cake for this important celebration.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🏢</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Corporate Events
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Impress your clients and colleagues with authentic Ukrainian cakes. A tasting session 
                    helps you choose flavors that everyone will love and remember long after the event.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🎉</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Any Celebration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    From anniversaries to graduations, any celebration is better with the perfect cake. 
                    A tasting session ensures you choose something that makes your special moment even more memorable.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Pricing and Booking */}
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
              Tasting Session Pricing & Booking
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Standard Tasting Session
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                    <strong>Price:</strong> £25 per person (deducted from your final cake order)
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Includes tasting of 4-5 different cake flavors, personal consultation, design discussion, 
                    and recommendations for your perfect cake. Session lasts 45-60 minutes.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Wedding Tasting Session
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                    <strong>Price:</strong> £40 per couple (deducted from your wedding cake order)
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Extended session with 6-8 cake flavors, detailed design consultation, size recommendations, 
                    and delivery planning. Session lasts 75-90 minutes.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, p: 3, backgroundColor: "rgba(0, 91, 187, 0.1)", borderRadius: 2 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                <strong>Important:</strong> The tasting fee is deducted from your final cake order when you book with me. 
                This means if you order a £100 cake and paid £25 for tasting, you only pay £75 for the cake. 
                I believe in making cake selection accessible and affordable for everyone.
              </Typography>
            </Box>
          </Paper>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
            >
              Book Your Cake Tasting Session Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Experience the authentic taste of Ukrainian cakes. Contact me to book your
              personalized cake tasting session.
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
                Book Tasting Session
              </Button>
              <Button
                component={Link}
                href="/wedding-cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View Wedding Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
