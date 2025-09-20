import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cake Shipping | Cake Delivery & Shipping",
  description:
    "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
  keywords: "cake shipping, cake delivery, cake shipping UK, cake delivery Leeds, cake packaging",
  openGraph: {
    title: "Cake Shipping | Cake Delivery & Shipping",
    description:
      "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
    url: "https://olgishcakes.co.uk/cake-shipping",
    images: ["https://olgishcakes.co.uk/images/cake-shipping.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Shipping | Cake Delivery & Shipping",
    description:
      "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
    images: ["https://olgishcakes.co.uk/images/cake-shipping.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-shipping",
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

export default function CakeShippingPage() {
  return (
    <>
      <Script
        id="cake-shipping-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Cake Shipping",
            description:
              "Learn about cake shipping and delivery options from Olgish Cakes. Nationwide cake shipping, local delivery, and safe packaging for your cakes.",
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
            serviceType: "Cake Shipping and Delivery",
            areaServed: [
              {
                "@type": "City",
                name: "Leeds",
              },
              {
                "@type": "Country",
                name: "United Kingdom",
              },
            ],
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Shipping Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Nationwide Shipping",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Local Delivery",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Safe Packaging",
                  },
                },
              ],
            },
            url: "https://olgishcakes.co.uk/cake-shipping",
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
            Cake Shipping
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
            Learn about my cake shipping and delivery options. Nationwide shipping, local delivery,
            and safe packaging for your cakes.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Nationwide Shipping" color="primary" />
            <Chip label="Local Delivery" color="secondary" />
            <Chip label="Safe Packaging" color="primary" />
            <Chip label="Cake Delivery" color="secondary" />
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mb: 6, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}>
          Getting your cake safely to you is just as important as making it delicious. I take great care in packaging and shipping 
          your cakes so they arrive in perfect condition, whether you are in Leeds or anywhere else in the UK. 
          Your cake deserves the best journey from my kitchen to your celebration.
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: "center", height: "100%" }}>
              <Typography variant="h4" component="h3" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
                Nationwide Shipping
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                I ship my cakes across the entire UK with secure packaging and reliable delivery services. 
                Whether you are in London, Manchester, or anywhere else, I will make sure your cake arrives safely and on time. 
                Perfect for surprising loved ones who live far away.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: "center", height: "100%" }}>
              <Typography variant="h4" component="h3" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
                Local Delivery
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                For customers in and around Leeds, I offer same-day and next-day delivery services. 
                I personally deliver many of the local orders to make sure your cake arrives in perfect condition. 
                Perfect for last-minute celebrations or when you want that personal touch.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: "center", height: "100%" }}>
              <Typography variant="h4" component="h3" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
                Safe Packaging
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Every cake is packaged with special care using professional cake boxes, secure packaging materials, 
                and protective wrapping. I use techniques that keep your cake fresh and beautiful during transit. 
                Your cake will look as good as when it left my kitchen.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            Shipping Options & Delivery Times
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Standard Delivery (3-5 Working Days)
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Perfect for planning ahead! Standard delivery takes 3-5 working days and is available across the UK. 
                  Your cake will be carefully packaged and shipped using reliable courier services. 
                  Great for birthday celebrations, anniversaries, or any occasion where you can plan in advance.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Express Delivery (1-2 Working Days)
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  For when you need your cake quickly! Express delivery gets your cake to you in 1-2 working days. 
                  This service uses premium shipping options to ensure fast and safe delivery. 
                  Perfect for last-minute surprises or when you forgot about an important celebration.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Same-Day Delivery (Leeds Area)
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Available for customers in Leeds and surrounding areas! Same-day delivery is perfect for when you need 
                  a cake today. I personally deliver many same-day orders to ensure your cake arrives fresh and on time. 
                  Orders must be placed before 2 PM for same-day delivery.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Next-Day Delivery (Local Area)
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Next-day delivery is available for Leeds and nearby areas. This gives you flexibility while ensuring 
                  your cake arrives fresh and beautiful. Perfect for when you want to plan ahead but not too far in advance. 
                  Orders placed before 6 PM are eligible for next-day delivery.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            How I Package Your Cakes for Shipping
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>📦</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Professional Cake Boxes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  I use high-quality cake boxes that are specifically designed for shipping cakes. These boxes provide 
                  excellent protection and maintain the shape of your cake during transit. Every box is the perfect size for the cake.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🛡️</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Protective Materials
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Each cake is wrapped in protective materials including bubble wrap, foam padding, and secure ties. 
                  I make sure your cake cannot move around inside the box, preventing any damage to decorations or structure.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🌡️</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Temperature Control
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  For longer shipping distances, I use special packaging materials that help maintain the right temperature. 
                  This ensures your cake stays fresh and maintains its beautiful texture throughout the journey.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            Shipping Tips & What to Expect
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  When Your Cake Arrives
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  When your cake arrives, carefully open the packaging and check that everything looks perfect. 
                  If there are any issues, contact me immediately. Your cake should look just as beautiful as when it left my kitchen. 
                  Let it come to room temperature before serving for the best taste.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Tracking Your Order
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  I will provide you with tracking information so you can follow your cake's journey. 
                  This helps you plan for delivery and makes sure someone is available to receive your cake. 
                  I will also send you delivery confirmation when your cake arrives safely.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Delivery Instructions
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  When you place your order, please provide clear delivery instructions including any special requirements. 
                  If you are not available to receive the cake, let me know where it should be left or if there is a safe place for delivery. 
                  This helps ensure your cake arrives safely.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Insurance & Guarantee
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  All cakes are fully insured during shipping. If your cake arrives damaged or not as expected, 
                  I will replace it immediately at no cost to you. I stand behind the quality of my cakes and want you to be completely satisfied.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
}
