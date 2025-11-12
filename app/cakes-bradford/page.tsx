import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Birthday Cakes Bradford from £25 | 5★ Rated",
  description:
    "Birthday cakes Bradford from £25 | Same-day delivery | Ukrainian honey cake | 127+ 5-star reviews | Children's & adult themes | Order today!",
  keywords:
    "birthday cakes Bradford, birthday cakes in Bradford, custom birthday cakes Bradford, children's birthday cakes Bradford, cakes Bradford, Ukrainian cakes Bradford, cake delivery Bradford, bakery Bradford, same-day cake delivery Bradford",
  openGraph: {
    title: "Birthday Cakes Bradford from £25 | 5★ Rated",
    description:
      "Birthday cakes Bradford from £25 | Same-day delivery | Ukrainian honey cake | 127+ 5-star reviews | Children's & adult themes | Order today!",
    url: "https://olgishcakes.co.uk/cakes-bradford",
    images: ["https://olgishcakes.co.uk/images/cakes-bradford.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Birthday Cakes Bradford from £25 | Same-Day Delivery",
    description:
      "Custom birthday cakes delivered same-day in Bradford from £25. Ukrainian honey cake, children's themes, adult celebrations. 127+ 5-star reviews. Order today!",
    images: ["https://olgishcakes.co.uk/images/cakes-bradford.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-bradford",
  },
};

export default async function CakesBradfordPage() {
  const allCakes = await getAllCakes();

  return (
    <>
      <Script
        id="cakes-bradford-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Bradford Ukrainian Bakery",
            description:
              "Fresh, handmade birthday cakes in Bradford. Ukrainian bakery offering custom birthday cakes, wedding cakes, and traditional Ukrainian desserts. Same-day cake delivery in Bradford and surrounding areas.",
            url: "https://olgishcakes.co.uk/cakes-bradford",
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
              latitude: "53.7950",
              longitude: "-1.7594",
            },
            openingHours: "Mo-Su 00:00-23:59",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            areaServed: {
              "@type": "City",
              name: "Bradford",
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
        id="cakes-bradford-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Do you deliver birthday cakes to Bradford?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, I deliver fresh birthday cakes to Bradford and surrounding areas including Shipley, Bingley, Keighley, and Ilkley. Same-day delivery is available when ordered before 10am.",
                },
              },
              {
                "@type": "Question",
                name: "How much do birthday cakes cost in Bradford?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Birthday cakes in Bradford start from £25 for a 6-inch cake serving 8-12 people. Prices vary based on size, design complexity, and customization. Delivery fee is £15-20 depending on location.",
                },
              },
              {
                "@type": "Question",
                name: "Can I get same-day birthday cake delivery in Bradford?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, same-day delivery is available in Bradford when you order before 10am. This is perfect for last-minute birthday celebrations. Standard delivery requires 3-5 days notice.",
                },
              },
              {
                "@type": "Question",
                name: "What types of birthday cakes do you make for Bradford?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "I create all types of birthday cakes for Bradford including children's themed cakes (unicorns, dinosaurs, superheroes), adult milestone cakes, Ukrainian honey cake, Kyiv cake, and custom-designed cakes to match any theme or preference.",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Birthday Cakes Bradford" }]} />
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
              Birthday Cakes Bradford from £25
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
              Custom birthday cakes delivered fresh to Bradford same-day. From traditional Ukrainian honey cake
              to themed children's birthday cakes and elegant adult milestones. Prices from £25.
            </Typography>
            <Chip
              label="Same-Day Birthday Cake Delivery Bradford"
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
            <Typography variant="h2" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Why Choose Our Birthday Cakes in Bradford?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Searching for birthday cakes in Bradford that stand out from the ordinary? Olgish Cakes brings authentic Ukrainian baking traditions to your celebrations. Every birthday cake is handcrafted using traditional recipes that have been in my family for generations. Whether it's a child's party or a milestone 40th or 50th birthday, I create each cake with the same love and attention to detail. Starting from just £25, my birthday cakes offer exceptional quality that Bradford families can afford.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              What makes my birthday cakes different from other Bradford bakeries? I use only premium, natural ingredients - real honey sourced from Yorkshire beekeepers, fresh cream, organic eggs, and time-honored Ukrainian recipes. For children's birthday cakes, I create exciting themes featuring unicorns, dinosaurs, superheroes, and favorite cartoon characters. For adult birthday celebrations, I offer sophisticated designs with authentic Ukrainian honey cake (Medovik) or rich Kyiv cake with hazelnuts and chocolate - flavors you won't find in supermarket cakes.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Bradford customers often tell me my birthday cakes bring back memories of special family celebrations. That's because I don't rush the baking process. Traditional honey cake is soaked overnight so the layers become perfectly soft and flavorful. Every cream filling is made fresh on the day of your celebration. I personally decorate each birthday cake with care, ensuring it's not only visually stunning but tastes absolutely incredible. Same-day delivery is available across Bradford when you order before 10am - perfect for last-minute birthday surprises.
            </Typography>
          </Box>

          {/* Types of Birthday Cakes */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Birthday Cakes for Every Bradford Celebration
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Children's Birthday Cakes",
                  description: "Fun themed birthday cakes for kids in Bradford. Popular themes: unicorns, dinosaurs, superheroes, princesses, and custom characters. From £25.",
                  icon: "🎂",
                },
                {
                  title: "Adult Milestone Birthdays",
                  description: "Elegant birthday cakes for special milestones. Traditional Ukrainian honey cake perfect for 30th, 40th, 50th birthdays in Bradford. From £25.",
                  icon: "🎉",
                },
                {
                  title: "Custom Design Cakes",
                  description: "Personalized birthday cakes designed to your exact specifications. Any theme, color, or flavor for your Bradford celebration. From £45.",
                  icon: "🎨",
                },
                {
                  title: "Same-Day Delivery",
                  description: "Last-minute birthday? Same-day delivery available across Bradford when ordered before 10am. Perfect for surprise parties.",
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
            <Typography variant="h2" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Most Requested Birthday Cakes in Bradford
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              The most popular birthday cake in Bradford is my traditional Ukrainian honey cake. This is no ordinary birthday cake - it features delicate layers of honey-soaked cake with silky cream filling that's been perfected over generations. Adults celebrating milestone birthdays absolutely love it because it's elegant, sophisticated, and utterly delicious. At £25 for a cake serving 8-10 people, it's an affordable luxury for birthday parties in Bradford. The honey cake can be beautifully decorated with fresh berries, edible flowers, or personalized birthday messages.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              For children's birthday parties in Bradford, themed character cakes are incredibly popular. Recent favorites include unicorn birthday cakes with colourful rainbow layers, dinosaur birthday cakes with chocolate frosting, superhero birthday cakes featuring favourite Marvel and DC characters, and princess cakes adorned with edible crowns and sparkles. What sets these apart from regular birthday cakes is that beneath the fun decorations, you get authentic Ukrainian cake flavours made with real, healthy ingredients. No artificial colours or preservatives - just natural ingredients that parents feel confident serving at their child's special birthday celebration.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              For teenage and adult birthday parties in Bradford, I offer elegant designs that don't sacrifice flavour. Popular recent requests include minimalist birthday cakes with fresh fruit arrangements, sophisticated floral birthday cakes with edible flowers, classic tiered birthday cakes for milestone 40th and 50th celebrations, and chocolate-lovers birthday cakes with rich ganache. Every birthday cake is fully customizable - you choose the flavours, colours, decorations, and personalized messages that make your Bradford celebration truly special.
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
                Birthday Cake Delivery in Bradford
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Coverage:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Bradford City Centre
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Shipley
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Bingley
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Keighley
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Ilkley
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • All Bradford districts
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
                    • Advance Orders: 3-5 days notice recommended
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Featured Cakes */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Featured Birthday Cakes
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

          {/* Cake Services in Bradford */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Cake Services Available in Bradford
            </Typography>
            <Grid container spacing={2}>
              {[
                { name: "Wedding Cakes", href: "/wedding-cakes" },
                { name: "Birthday Cakes", href: "/birthday-cakes" },
                { name: "Anniversary Cakes", href: "/anniversary-cakes-leeds" },
                { name: "Vegan Cakes", href: "/vegan-cakes-leeds" },
                { name: "Nut-Free Cakes", href: "/nut-free-cakes-leeds" },
                { name: "Custom Design", href: "/custom-cake-design" },
              ].map((service, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Link href={service.href} style={{ textDecoration: 'none', display: 'block' }}>
                    <Button variant="outlined" color="primary" fullWidth sx={{ py: 1.5 }}>
                      {service.name}
                    </Button>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Nearby Areas */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="body1" sx={{ mb: 2, textAlign: "center", color: "text.secondary" }}>
              Also delivering to: <Link href="/cakes-leeds" style={{ color: "inherit", textDecoration: "underline" }}>Leeds</Link>, <Link href="/cakes-huddersfield" style={{ color: "inherit", textDecoration: "underline" }}>Huddersfield</Link>, <Link href="/cakes-wakefield" style={{ color: "inherit", textDecoration: "underline" }}>Wakefield</Link>, <Link href="/cakes-halifax" style={{ color: "inherit", textDecoration: "underline" }}>Halifax</Link>, <Link href="/cakes-york" style={{ color: "inherit", textDecoration: "underline" }}>York</Link>
            </Typography>
          </Box>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Ready to Order Your Birthday Cake in Bradford?
            </Typography>
            <Typography variant="h4" component="h4" sx={{ mb: 4, color: "text.secondary" }}>
              Contact me today to create the perfect birthday cake for your celebration
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}>
                Order Birthday Cake Now
              </Button>
            </Link>
              <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}>
                Browse All Cakes
              </Button>
            </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
