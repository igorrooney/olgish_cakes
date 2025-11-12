import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cake Photography | Professional Cake Photos",
  description:
    "Professional cake photography services in Leeds. Capture your custom cakes, wedding cakes, and celebration cakes with stunning photos.",
  keywords:
    "cake photography, professional cake photos, cake photographer Leeds, wedding cake photography, cake photo services",
  openGraph: {
    title: "Cake Photography | Professional Cake Photos",
    description:
      "Professional cake photography services in Leeds. Capture your custom cakes, wedding cakes, and celebration cakes with stunning photos.",
    url: "https://olgishcakes.co.uk/cake-photography",
    images: ["https://olgishcakes.co.uk/images/cake-photography.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Photography | Professional Cake Photos",
    description:
      "Professional cake photography services in Leeds. Capture your custom cakes, wedding cakes, and celebration cakes with stunning photos.",
    images: ["https://olgishcakes.co.uk/images/cake-photography.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-photography",
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
    google: "your-google-verification-code",
  },
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
  },
};

export default function CakePhotographyPage() {
  return (
    <>
      <Script
        id="cake-photography-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Cake Photography",
            description:
              "Professional cake photography services in Leeds. Capture your custom cakes, wedding cakes, and celebration cakes with stunning photos.",
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
            serviceType: "Cake Photography",
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Photography Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Professional Cake Photography",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Wedding Cake Photography",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Celebration Cake Photography",
                  },
                },
              ],
            },
            url: "https://olgishcakes.co.uk/cake-photography",
          }),
        }}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: "bold",
              mb: 2,
              color: "#005BBB",
            }}
          >
            Cake Photography
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "text.secondary",
              mb: 3,
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            Professional cake photography for your custom cakes, wedding cakes, and celebration
            cakes in Leeds.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Professional Photos" color="primary" />
            <Chip label="Cake Gallery" color="secondary" />
            <Chip label="Wedding Cakes" color="primary" />
            <Chip label="Celebration Cakes" color="secondary" />
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mb: 6, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}>
          When I started making cakes, I quickly realised that beautiful cakes deserve beautiful photos.
          That is why I offer professional cake photography services - to capture the magic of your special cake
          so you can remember it forever and share it with others.
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: "center", height: "100%" }}>
              <Typography variant="h3" component="h3" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
                Professional Lighting
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                I use professional lighting equipment and natural light to make sure your cake looks absolutely perfect in photos.
                Every detail, every texture, every beautiful decoration will be captured beautifully.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: "center", height: "100%" }}>
              <Typography variant="h3" component="h3" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
                Creative Styling
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                I create beautiful backgrounds and styling that complement your cake perfectly.
                Whether you want elegant and simple or colourful and fun, I will make sure your cake is the star of the photo.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: "center", height: "100%" }}>
              <Typography variant="h3" component="h3" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
                High-Resolution Images
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                You will receive high-quality photos that look amazing on websites, social media, and even in print.
                Perfect for sharing with family and friends or for your business if you are a cake maker too.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            What Types of Cakes Do I Photograph?
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Wedding Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Your wedding cake is one of the most important parts of your special day. I will capture every beautiful detail
                  so you can remember it forever. Perfect for sharing with guests who could not attend or for your wedding album.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Birthday Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Whether it is for a child's birthday or an adult celebration, I will make sure your birthday cake photos
                  capture all the joy and excitement of the moment. Great for social media and sharing with family.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Celebration Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Anniversary cakes, graduation cakes, retirement cakes - any special celebration deserves beautiful photos.
                  I will capture the significance of your cake and the love that went into making it.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Custom Design Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  If you have a unique, custom-designed cake, professional photos are especially important.
                  I will showcase every creative detail and make sure your one-of-a-kind cake is captured perfectly.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            How It Works
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>📸</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Book Your Session
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Contact me to arrange your cake photography session. We can do it at my studio or at your location,
                  whatever works best for you and your cake.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🎨</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Professional Shoot
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  I will set up the perfect lighting and styling for your cake. I take multiple angles and shots
                  to make sure we capture your cake from every beautiful perspective.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>💝</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Receive Your Photos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  You will receive professionally edited, high-resolution photos within a few days.
                  Perfect for sharing, printing, or keeping as beautiful memories of your special cake.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
}
