import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title:
    "Birthday Cakes Wakefield from £25 | 5★ Rated",
  description:
    "Birthday cakes Wakefield from £25 | Same-day delivery | Ukrainian honey cake | 127+ 5-star reviews | Children's & adult themes | Order today!",
  keywords:
    "birthday cakes Wakefield, birthday cakes in Wakefield, custom birthday cakes Wakefield, children's birthday cakes Wakefield, cakes Wakefield, Ukrainian cakes Wakefield, cake delivery Wakefield, bakery Wakefield, same-day cake delivery Wakefield",
  openGraph: {
    title:
      "Birthday Cakes Wakefield from £25 | 5★ Rated",
    description:
      "Birthday cakes Wakefield from £25 | Same-day delivery | Ukrainian honey cake | 127+ 5-star reviews | Children's & adult themes | Order today!",
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
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5",
              reviewCount: "127",
              bestRating: "5",
              worstRating: "1",
            },
          }),
        }}
      />
      <Script
        id="cakes-wakefield-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Do you deliver birthday cakes to Wakefield?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, I deliver fresh birthday cakes to Wakefield and surrounding areas including Castleford, Pontefract, Normanton, and Featherstone. Same-day delivery is available when ordered before 10am.",
                },
              },
              {
                "@type": "Question",
                name: "How much do birthday cakes cost in Wakefield?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Birthday cakes in Wakefield start from £25 for a 6-inch cake serving 8-12 people. Prices vary based on size, design complexity, and customization. Delivery fee is £15-20 depending on location.",
                },
              },
              {
                "@type": "Question",
                name: "Can I get same-day birthday cake delivery in Wakefield?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, same-day delivery is available in Wakefield when you order before 10am. This is perfect for last-minute birthday celebrations. Standard delivery requires 3-5 days notice.",
                },
              },
              {
                "@type": "Question",
                name: "What types of birthday cakes do you make for Wakefield?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "I create all types of birthday cakes for Wakefield including children's themed cakes (unicorns, dinosaurs, superheroes), adult milestone cakes, Ukrainian honey cake, Kyiv cake, and custom-designed cakes to match any theme or preference.",
                },
              },
            ],
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
              Birthday Cakes Wakefield from £25
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
              Custom birthday cakes delivered fresh to Wakefield same-day. From traditional Ukrainian honey cake
              to themed children's birthday cakes, I create special cakes that make your birthday celebrations
              unforgettable. Prices from £25.
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

          {/* Why Choose Olgish Cakes for Birthday Cakes in Wakefield */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Why Choose Our Birthday Cakes in Wakefield?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              When you're looking for birthday cakes in Wakefield, Olgish Cakes offers something special that you won't find anywhere else. I create custom birthday cakes using traditional Ukrainian recipes that have been in my family for generations. Whether it's a children's birthday party or an adult milestone celebration, every cake is handmade with care and decorated to match your vision. My birthday cakes start from just £25, making authentic, high-quality cakes accessible for everyone in Wakefield.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              What makes my birthday cakes different? I use only the finest ingredients - real honey, fresh cream, and natural flavors. For children's birthday cakes, I can create fun themes with characters, colors, and designs that kids love. For adult birthdays, I offer elegant designs with traditional Ukrainian flavors like honey cake (Medovik) or Kyiv cake with hazelnuts and chocolate. Many Wakefield families come back year after year because they know the taste is authentic and the quality is always excellent. Each birthday cake is delivered fresh on the day of your celebration, ensuring it arrives in perfect condition.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              I understand that birthday cakes need to be special. That's why I work with you to create exactly what you want - from flavor choices to decoration style. Whether you need a small cake for an intimate family gathering or a large celebration cake for a big party in Wakefield, I make sure every birthday cake looks beautiful and tastes even better. Same-day delivery is available in Wakefield when you order before 10am, perfect for last-minute celebrations.
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

          {/* Popular Birthday Cakes in Wakefield */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Popular Birthday Cakes in Wakefield
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              The most requested birthday cake in Wakefield is my traditional Ukrainian honey cake. This isn't your ordinary birthday cake - it features delicate honey-soaked layers with rich cream filling that melts in your mouth. Adults love it for milestone birthdays like 30th, 40th, and 50th celebrations because it's sophisticated yet comforting. Starting from £25, it's an affordable luxury that makes birthdays truly special. I also make Kyiv cake for birthdays, which combines hazelnut meringue with chocolate - perfect for chocolate lovers celebrating their special day in Wakefield.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              For children's birthday parties in Wakefield, I create custom themed birthday cakes that combine fun designs with authentic Ukrainian flavors. Popular themes include princess cakes, superhero cakes, dinosaur cakes, and unicorn cakes. What makes these different from supermarket birthday cakes is that I use real ingredients and traditional baking methods - no artificial flavors or preservatives. Parents in Wakefield appreciate that their children get both a beautiful cake and healthy, natural ingredients. Every children's birthday cake is customized to match your party theme and can serve anywhere from 10 to 50 guests.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              For teenage and adult birthday celebrations, I offer elegant designs that don't compromise on flavor. Recent popular requests in Wakefield include minimalist birthday cakes with fresh fruit, floral birthday cakes with edible flowers, and classic tiered birthday cakes for milestone celebrations. All birthday cakes can be customized with your choice of flavors, colors, and personalized messages. Order your birthday cake for Wakefield delivery today and experience why customers say my cakes make their celebrations unforgettable.
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
                <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                  color="primary"
                  size="large">
                  View All Cakes
                </Button>
            </Link>
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

          {/* Cake Services in Wakefield */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 3, textAlign: "center" }}>
              Cake Services in Wakefield
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: "center", lineHeight: 1.8 }}>
              Browse our full range of cakes: <Link href="/wedding-cakes" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>wedding cakes</Link>, <Link href="/birthday-cakes" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>birthday cakes</Link>, <Link href="/anniversary-cakes-leeds" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>anniversary cakes</Link>, <Link href="/vegan-cakes-leeds" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>vegan cakes</Link>, <Link href="/nut-free-cakes-leeds" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>nut-free cakes</Link>, and <Link href="/custom-cake-design" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>custom cake design</Link>.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, textAlign: "center", color: "text.secondary" }}>
              Also serving: <Link href="/cakes-leeds" style={{ color: "inherit", textDecoration: "underline" }}>Leeds</Link>, <Link href="/cakes-bradford" style={{ color: "inherit", textDecoration: "underline" }}>Bradford</Link>, <Link href="/cakes-huddersfield" style={{ color: "inherit", textDecoration: "underline" }}>Huddersfield</Link>, <Link href="/cakes-york" style={{ color: "inherit", textDecoration: "underline" }}>York</Link>, <Link href="/cakes-halifax" style={{ color: "inherit", textDecoration: "underline" }}>Halifax</Link>
            </Typography>
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
              <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}>
                Order Your Cake
              </Button>
            </Link>
              <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}>
                View Our Cakes
              </Button>
            </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
