import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title:
    "Birthday Cakes Huddersfield from £25 | Same-Day Delivery",
  description:
    "★★★★★ Custom birthday cakes delivered same-day in Huddersfield from £25. Ukrainian honey cake, children's themes, adult milestones. 127+ 5-star reviews. Order today!",
  keywords:
    "birthday cakes Huddersfield, birthday cakes in Huddersfield, custom birthday cakes Huddersfield, children's birthday cakes Huddersfield, cakes Huddersfield, Ukrainian cakes Huddersfield, honey cake Huddersfield, cake delivery Huddersfield, bakery Huddersfield",
  openGraph: {
    title: "Birthday Cakes Huddersfield from £25 | Same-Day Delivery",
    description:
      "★★★★★ Custom birthday cakes delivered same-day in Huddersfield from £25. Ukrainian honey cake, children's themes, adult milestones. 127+ 5-star reviews. Order today!",
    url: "https://olgishcakes.co.uk/cakes-huddersfield",
    images: ["https://olgishcakes.co.uk/images/cakes-huddersfield.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cakes Huddersfield | Ukrainian Cakes",
    description:
      "Traditional Ukrainian cakes in Huddersfield. Handcrafted honey cake, Kyiv cake, and real Ukrainian desserts delivered to Huddersfield.",
    images: ["https://olgishcakes.co.uk/images/cakes-huddersfield.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-huddersfield",
  },
};

export default async function CakesHuddersfieldPage() {
  const allCakes = await getAllCakes();

  return (
    <>
      <Script
        id="cakes-huddersfield-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Huddersfield Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in Huddersfield. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Huddersfield and around areas.",
            url: "https://olgishcakes.co.uk/cakes-huddersfield",
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
              latitude: "53.6458",
              longitude: "-1.7850",
            },
            openingHours: "Mo-Su 00:00-23:59",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            areaServed: {
              "@type": "City",
              name: "Huddersfield",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes Huddersfield" }]} />
          </Box>

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
              Birthday Cakes Huddersfield from £25
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
              Custom birthday cakes delivered fresh to Huddersfield same-day. From traditional Ukrainian honey cake
              to themed children's birthday cakes and elegant adult celebrations. Prices from £25. 
            </Typography>
            <Chip
              label="Same-Day Birthday Cake Delivery Huddersfield"
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

          {/* Why Choose Our Birthday Cakes Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Why Choose Our Birthday Cakes in Huddersfield?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Looking for birthday cakes in Huddersfield that are truly special? Olgish Cakes brings authentic Ukrainian baking traditions to your celebrations. Every birthday cake I create is handmade using traditional recipes passed down through my family. Whether you're celebrating a child's first birthday or a milestone 50th, I make each cake with the same attention to detail and love. My birthday cakes start from £25, offering exceptional quality at affordable prices for Huddersfield families.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              What sets my birthday cakes apart in Huddersfield? I use only premium, natural ingredients - real honey from local Yorkshire beekeepers, fresh cream, organic eggs, and authentic Ukrainian recipes. For children's birthday parties, I create fun themed cakes featuring their favorite characters, from unicorns and dinosaurs to superheroes and princesses. For adult birthday celebrations, I offer sophisticated designs with traditional Ukrainian flavors that you won't find in any supermarket or chain bakery in Huddersfield.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Many customers in Huddersfield tell me my birthday cakes remind them of special memories and family traditions. That's because I don't rush the process. Each honey cake is soaked overnight so the layers become incredibly soft and flavorful. The cream filling is made fresh the day of your celebration. I personally decorate every birthday cake with care, ensuring it not only looks beautiful but tastes extraordinary. Same-day delivery is available across Huddersfield when you order by 10am.
            </Typography>
          </Box>

          {/* Types of Birthday Cakes */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Birthday Cakes for Every Celebration in Huddersfield
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Children's Birthday Cakes",
                  description: "Fun themed birthday cakes for kids in Huddersfield. Popular themes: unicorns, dinosaurs, superheroes, princesses, and custom characters. From £25.",
                  icon: "🎂",
                },
                {
                  title: "Adult Birthday Cakes",
                  description: "Elegant birthday cakes for milestone celebrations. Traditional Ukrainian honey cake perfect for 30th, 40th, 50th birthdays in Huddersfield. From £40.",
                  icon: "🎉",
                },
                {
                  title: "Custom Design Birthday Cakes",
                  description: "Personalized birthday cakes designed exactly to your vision. Any theme, any color, any flavor for your Huddersfield celebration. From £45.",
                  icon: "🎨",
                },
                {
                  title: "Same-Day Birthday Delivery",
                  description: "Last-minute birthday cake? Same-day delivery available in Huddersfield when ordered before 10am. Perfect for surprise celebrations.",
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
                    <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                      {service.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main", fontSize: "1.3rem" }}
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

          {/* Popular Birthday Cake Flavors */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Most Popular Birthday Cakes in Huddersfield
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              The number one birthday cake request in Huddersfield is my traditional Ukrainian honey cake (Medovik). This isn't just any birthday cake - it's layers of delicate honey-soaked cake with rich cream that's been perfected over generations. Adults celebrating milestone birthdays love it because it's sophisticated, not too sweet, and absolutely delicious. At £25 for a cake serving 8-10 people, it's the perfect centerpiece for birthday parties in Huddersfield. The honey cake can be decorated with fresh berries, flowers, or personalized birthday messages.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              For children's birthday parties, themed character cakes are extremely popular. Recent favorites in Huddersfield include unicorn birthday cakes with rainbow layers, dinosaur birthday cakes with chocolate frosting, and superhero birthday cakes featuring Marvel and DC characters. What makes these special is that underneath the fun decorations, you get authentic Ukrainian cake flavors made with real ingredients. No artificial colors or flavors - just natural, healthy ingredients that parents feel good about serving at their child's birthday celebration.
            </Typography>
          </Box>

          {/* Delivery Information */}
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
                Birthday Cake Delivery in Huddersfield
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Coverage:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Huddersfield Town Centre
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Lindley
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Almondbury
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Lockwood
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Holmfirth
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • All Huddersfield areas
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Birthday Cake Delivery Details:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Starting Price: £25
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Delivery Fee: £15-20
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Same-Day Available (order by 10am)
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Advance Orders: 3-5 days notice preferred
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Ready to Order Your Birthday Cake in Huddersfield?
            </Typography>
            <Typography variant="h4" component="h4" sx={{ mb: 4, color: "text.secondary" }}>
              Contact me today to discuss your birthday celebration and cake design
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
                Order Birthday Cake Now
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View All Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
