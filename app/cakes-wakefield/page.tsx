import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title:
    "Cakes Wakefield from £35 | Fresh Ukrainian Cake Delivery",
  description:
    "★★★★★ Fresh Ukrainian cakes delivered to Wakefield same-day. Honey cake, birthday cakes, wedding cakes from £35. 127+ 5-star reviews. Order today!",
  keywords:
    "cakes Wakefield, Ukrainian cakes Wakefield, custom cakes Wakefield, wedding cakes Wakefield, birthday cakes Wakefield, cake delivery Wakefield, bakery Wakefield, traditional Ukrainian cakes Wakefield",
  openGraph: {
    title:
      "Cakes Wakefield | Ukrainian Cakes",
    description:
      "Fresh Ukrainian cakes delivered to Wakefield. Custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Professional cake delivery service covering Wakefield and around areas.",
    url: "https://olgishcakes.co.uk/cakes-wakefield",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cakes-wakefield.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Cakes Wakefield - Olgish Cakes Delivery Service",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Cakes Wakefield | Ukrainian Cakes",
    description:
      "Fresh Ukrainian cakes delivered to Wakefield. Custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts.",
    images: ["https://olgishcakes.co.uk/images/cakes-wakefield.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-wakefield",
  },
};

export default async function CakesWakefieldPage() {
  const allCakes = await getAllCakes();

  return (
    <>
      <Script
        id="cakes-wakefield-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Wakefield Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in Wakefield. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Wakefield and surrounding areas.",
            url: "https://olgishcakes.co.uk/cakes-wakefield",
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
              latitude: "53.6833",
              longitude: "-1.4977",
            },
            openingHours: "Mo-Su 00:00-23:59",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            areaServed: {
              "@type": "City",
              name: "Wakefield",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes Wakefield" }]} />
          </Box>

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
              Fresh Ukrainian Cakes Wakefield
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
              Real Ukrainian cakes delivered fresh to Wakefield. From traditional honey cake
              and Kyiv cake to custom celebration cakes, I bring the real taste of Ukraine to
              your special occasions in Wakefield.
            </Typography>
            <Chip
              label="Ukrainian Cakes Delivered to Wakefield"
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

          {/* Why Choose Olgish Cakes for Wakefield */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Why Choose Our Ukrainian Cakes in Wakefield?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              When you're looking for cakes in Wakefield, especially real Ukrainian cakes, Olgish Cakes is your best choice. I bake every cake by hand using traditional Ukrainian recipes that my family taught me. What makes my cakes different from other bakeries in Wakefield is that I use only the best ingredients and traditional methods. Every honey cake I make has layers that are soaked in real honey and filled with fresh cream, just like my grandmother used to make in Ukraine. The taste is something you won't find in regular British cakes.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Many customers in Wakefield tell me that my cakes remind them of their childhood or special occasions. That's because I don't take shortcuts. Each cake takes time to prepare properly. I let the honey layers soak overnight so they become soft and full of flavor. The cream is made fresh, and I decorate every cake with care. Whether you need a birthday cake for your family in Wakefield or a wedding cake for your special day, I make sure it looks beautiful and tastes even better.
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  title: "Fresh Delivery to Wakefield",
                  description:
                    "All cakes are delivered fresh to Wakefield on the day of your celebration. I personally make sure your cake arrives in perfect condition.",
                  icon: "🚚",
                },
                {
                  title: "Real Ukrainian Flavors",
                  description:
                    "Traditional Ukrainian recipes including honey cake, Kyiv cake, and other real Ukrainian desserts made with authentic techniques",
                  icon: "🇺🇦",
                },
                {
                  title: "Custom Cake Design",
                  description:
                    "Personalized cake design service for weddings, birthdays, and special celebrations in Wakefield tailored to your preferences",
                  icon: "🎨",
                },
                {
                  title: "Professional Service",
                  description:
                    "Professional cake delivery service with careful handling to make sure your cake arrives in perfect condition, on time",
                  icon: "⭐",
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
                    <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                      {service.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Popular Cakes in Wakefield */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Popular Cakes for Wakefield Customers
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              In Wakefield, people love my honey cake the most. It's the traditional Ukrainian Medovik that everyone asks for. The honey cake is perfect for birthdays, anniversaries, and family gatherings. I also make Kyiv cake, which is another Ukrainian favorite with hazelnut meringue and chocolate. Both cakes are made fresh to order, so you always get the best quality. Many Wakefield families order these cakes for special occasions because they know the taste is real and authentic.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              For weddings in Wakefield, I create custom wedding cakes that combine Ukrainian traditions with modern designs. You can choose from different flavors and decorations. I work with you to make sure your wedding cake is exactly what you want. And for children's birthdays, I can make fun themed cakes with Ukrainian flavors that kids love. Every cake is made with the same care and attention, no matter the size or occasion.
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Our Ukrainian Cake Collection
            </Typography>
            <Grid container spacing={4}>
              {allCakes.slice(0, 6).map(cake => (
                <Grid item xs={12} sm={6} md={4} key={cake._id}>
                  <CakeCard cake={cake} />
                </Grid>
              ))}
            </Grid>
            {allCakes.length > 6 && (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Button
                  component={Link}
                  href="/cakes"
                  variant="outlined"
                  color="primary"
                  size="large"
                >
                  View All Cakes
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 6 }}>
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
                Cake Delivery to Wakefield
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Areas in Wakefield:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Wakefield City Centre
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Castleford
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Pontefract
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Normanton
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Featherstone
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • And surrounding areas
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Information:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Delivery Fee: £15-20
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Delivery Time: 1-2 hours
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Order Lead Time: 3-5 days
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Fresh delivery on celebration day
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

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
              Ready to Order Your Ukrainian Cake in Wakefield?
            </Typography>
            <Typography variant="h4" component="h3" sx={{ mb: 4, color: "text.secondary" }}>
              Contact me to talk about your cake needs and delivery options
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
                Order Your Cake
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
