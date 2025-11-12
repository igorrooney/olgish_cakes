import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";
export const metadata: Metadata = {
  title: "Anniversary Cakes Leeds £40+ | 5★ | Custom Designs",
  description:
    "Anniversary cakes Leeds from £40 | Ukrainian honey cake | Personalized designs | Same-day delivery | 5★ rated (127+ reviews) | Celebrate in style!",
  keywords:
    "anniversary cakes Leeds, Ukrainian anniversary cakes, anniversary celebration cakes, personalized anniversary cakes, anniversary cake delivery Leeds",
  openGraph: {
    title: "Anniversary Cakes Leeds | Ukrainian Cakes",
    description:
      "Celebrate your anniversary with traditional Ukrainian anniversary cakes in Leeds. Handcrafted anniversary cakes with personalized designs.",
    url: "https://olgishcakes.co.uk/anniversary-cakes-leeds",
    images: ["https://olgishcakes.co.uk/images/anniversary-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anniversary Cakes Leeds | Ukrainian Cakes",
    description:
      "Celebrate your anniversary with traditional Ukrainian anniversary cakes in Leeds. Handcrafted anniversary cakes with personalized designs.",
    images: ["https://olgishcakes.co.uk/images/anniversary-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/anniversary-cakes-leeds",
  },
};

export default function AnniversaryCakesLeedsPage() {
  return (
    <>
      <Script
        id="anniversary-cakes-leeds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Anniversary Cakes Leeds",
            description:
              "Celebrate your anniversary with traditional Ukrainian anniversary cakes in Leeds. Handcrafted anniversary cakes with personalized designs. Order now for anniversary celebrations.",
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
            serviceType: "Anniversary Cake Design",
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Anniversary Cake Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Ukrainian Anniversary Cakes",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Personalized Anniversary Cakes",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Anniversary Cake Delivery",
                  },
                },
              ],
            },
            url: "https://olgishcakes.co.uk/anniversary-cakes-leeds",
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
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Anniversary Cakes Leeds" }]}
            />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "primary.main",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Anniversary Cakes Leeds
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
              Celebrate your anniversary with traditional Ukrainian anniversary cakes. Handcrafted
              with love in Leeds, my anniversary cakes bring the real taste of Ukrainian
              celebrations to your special day.
            </Typography>
            <Chip
              label="Traditional Ukrainian Anniversary Cakes"
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

          {/* Content Section */}
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="body1"
              sx={{ mb: 4, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}
            >
              Every anniversary is special, and your cake should be too. Whether you are celebrating your first year together
              or your golden anniversary, I will create a beautiful cake that reflects your love story and makes your day even more memorable.
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Popular Anniversary Cake Flavours
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Honey Cake (Medovik)
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    My most popular anniversary cake! The sweet honey layers symbolise the sweetness of your relationship,
                    and the traditional Ukrainian recipe brings warmth and comfort to your celebration. Perfect for couples who love classic flavours.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Kyiv Cake
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Elegant and sophisticated, just like your love story. The nutty meringue layers with chocolate
                    create a rich, luxurious taste that is perfect for milestone anniversaries. Always impresses guests!
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Chocolate Raspberry
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    A romantic combination that never goes out of style. Rich chocolate sponge with fresh raspberry filling
                    creates a perfect balance of sweet and tart. Great for couples who love indulgent flavours.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Vanilla Berry
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Light and fresh, perfect for spring or summer anniversaries. Delicate vanilla sponge with mixed berry filling
                    creates a beautiful, refreshing taste that everyone will enjoy. Great for outdoor celebrations.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Anniversary Cake Decoration Ideas
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>💕</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Heart Decorations
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Beautiful heart-shaped decorations made from fondant or chocolate. Perfect for expressing your love
                    and creating romantic anniversary cake designs.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🌹</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Sugar Flowers
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Handcrafted sugar flowers in your favourite colours. Roses, peonies, or any flower that has special meaning
                    for your relationship. Beautiful and romantic.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>✨</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Personal Messages
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Personalised messages, names, or anniversary dates beautifully written on your cake.
                    Make your anniversary cake truly special with your own words of love.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Why Choose My Anniversary Cakes?
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Made with Love
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Every anniversary cake I make is crafted with love and attention to detail. I understand how important
                    your anniversary is, and I want your cake to be as special as your relationship. Every decoration, every flavour choice matters to me.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Personal Service
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    I love hearing your love story and helping you choose the perfect cake for your celebration.
                    Whether you want something traditional or completely unique, I will work with you to create exactly what you have in mind.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Traditional Ukrainian Touch
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Bring a taste of Ukrainian tradition to your anniversary celebration. My honey cake and Kyiv cake recipes
                    have been passed down through generations, and they bring warmth and tradition to your special day.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Fresh and Delicious
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Your anniversary cake will be made fresh just for you, using the best ingredients.
                    No preservatives, no shortcuts - just pure, delicious cake that will make your celebration even more memorable.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Order Your Anniversary Cake Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "700px", mx: "auto", lineHeight: 1.7 }}
            >
              Your anniversary is a special day that deserves a special cake. Contact me today to discuss your dream anniversary cake.
              I will help you choose the perfect flavour and design to make your celebration unforgettable.
              Let me create something beautiful for your love story.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}>
                Order Anniversary Cake
              </Button>
            </Link>
              <Link href="/custom-cake-design" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}>
                Custom Design
              </Button>
            </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
