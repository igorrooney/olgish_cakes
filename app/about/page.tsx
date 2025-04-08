import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "About Olgish Cakes | Traditional Ukrainian Bakery in Leeds",
  description:
    "Discover authentic Ukrainian cakes in Leeds at Olgish Cakes. Professional baker Olga creates traditional honey cakes, Kyiv cakes & custom celebration cakes using time-honored recipes.",
  keywords:
    "Ukrainian bakery Leeds, Ukrainian cakes Leeds, Olga baker Leeds, traditional Ukrainian cakes, honey cake Leeds, Kyiv cake Leeds, custom cakes Leeds, artisan bakery Leeds",
  openGraph: {
    title: "About Olgish Cakes | Traditional Ukrainian Bakery in Leeds",
    description:
      "Discover authentic Ukrainian cakes in Leeds at Olgish Cakes. Professional baker Olga creates traditional honey cakes, Kyiv cakes & custom celebration cakes using time-honored recipes.",
    url: "https://olgish-cakes.vercel.app/about",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/about-baker.jpg",
        width: 1200,
        height: 630,
        alt: "Olga from Olgish Cakes - Ukrainian Baker in Leeds",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Olgish Cakes | Traditional Ukrainian Bakery in Leeds",
    description:
      "Discover authentic Ukrainian cakes in Leeds at Olgish Cakes. Professional baker Olga creates traditional honey cakes, Kyiv cakes & custom celebration cakes using time-honored recipes.",
    images: ["https://olgish-cakes.vercel.app/images/about-baker.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Script id="about-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BakeryBusiness",
          name: "Olgish Cakes",
          image: "https://olgish-cakes.vercel.app/images/about-baker.jpg",
          "@id": "https://olgish-cakes.vercel.app",
          url: "https://olgish-cakes.vercel.app",
          telephone: "+447867218194",
          address: {
            "@type": "PostalAddress",
            streetAddress: "107 Harehills Lane",
            addressLocality: "Leeds",
            postalCode: "LS8 4DN",
            addressCountry: "GB",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "53.8080",
            longitude: "-1.5200",
          },
          description:
            "Olgish Cakes is an artisan Ukrainian bakery in Leeds, specializing in traditional cakes and pastries. Founded by professional baker Olga, who brings authentic Ukrainian recipes and techniques to create beautiful, delicious celebration cakes.",
          founder: {
            "@type": "Person",
            name: "Olga Ieromenko",
            jobTitle: "Professional Baker",
            description: "A professionally-trained Ukrainian baker who moved to Leeds in 2022",
          },
          sameAs: ["https://www.instagram.com/olgish_cakes/"],
          priceRange: "££",
          servesCuisine: "Ukrainian",
          offers: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Cherry Cake (Vyshnevyi)",
                description:
                  "A delightful Ukrainian Cherry Cake featuring layers of soft sponge cake filled with sweet-tart cherry filling and topped with vanilla cream.",
                price: "38.00",
                priceCurrency: "GBP",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Poppy Seed Roll (Makivnyk)",
                description:
                  "Traditional Ukrainian Poppy Seed Roll with a soft yeast dough filled with sweetened poppy seed filling.",
                price: "35.00",
                priceCurrency: "GBP",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Napoleon Cake",
                description:
                  "A Ukrainian take on the classic Napoleon cake with multiple layers of flaky puff pastry and rich vanilla custard cream.",
                price: "42.00",
                priceCurrency: "GBP",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Honey Cake (Medovik)",
                description:
                  "Traditional Ukrainian Honey Cake with delicate honey-infused layers and smooth sour cream filling.",
                price: "40.00",
                priceCurrency: "GBP",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "FoodService",
                name: "Kyiv Cake",
                description:
                  "The legendary Kyiv Cake featuring crispy meringue layers with hazelnuts, filled with chocolate-buttercream frosting.",
                price: "45.00",
                priceCurrency: "GBP",
              },
            },
          ],
        })}
      </Script>

      <main>
        <Box
          sx={{
            background: "linear-gradient(to bottom, #fff5f0 0%, #ffffff 100%)",
            minHeight: "100vh",
            py: 8,
          }}
        >
          <Container maxWidth="lg">
            {/* Hero Section */}
            <Box className="mb-16 text-center">
              <Typography
                variant="h1"
                component="h1"
                className="text-5xl font-bold mb-6"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  color: "primary.main",
                }}
              >
                About Olgish Cakes
              </Typography>
              <Typography
                variant="h2"
                component="h2"
                className="text-2xl mb-12"
                sx={{ color: "text.secondary" }}
              >
                Traditional Ukrainian Baking in the Heart of Leeds
              </Typography>
            </Box>

            {/* Main Content */}
            <Grid container spacing={8}>
              {/* Left Column - Image */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 400, md: 600 },
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: 3,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "primary.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "primary.contrastText",
                        textAlign: "center",
                        px: 4,
                      }}
                    >
                      Photo of Olga coming soon
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column - Text Content */}
              <Grid item xs={12} md={7}>
                <Box className="space-y-8">
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    <Typography
                      variant="h3"
                      component="h2"
                      className="text-3xl font-bold mb-6"
                      sx={{ color: "primary.main" }}
                    >
                      Hello, I'm Olga
                    </Typography>
                    <Typography variant="body1" className="text-lg leading-relaxed mb-6">
                      I'm a professionally-trained Ukrainian baker who moved to Leeds in 2022. I
                      specialise in traditional Ukrainian cakes - like honey cake, Kyev cake or
                      King's cake - which are an important part of our culture.
                    </Typography>
                    <Typography variant="body1" className="text-lg leading-relaxed">
                      My wish is to be able to share my love of baking with my new friends in
                      England. Get ready to taste something amazing! 🍰✨
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    <Typography
                      variant="h3"
                      component="h2"
                      className="text-3xl font-bold mb-6"
                      sx={{ color: "primary.main" }}
                    >
                      Our Story
                    </Typography>
                    <Typography variant="body1" className="text-lg leading-relaxed mb-4">
                      Born and raised in Ukraine, I developed a passion for baking at a young age,
                      learning traditional recipes from my grandmother. After completing
                      professional training in pastry arts, I worked in several prestigious bakeries
                      in Ukraine before bringing my expertise to Leeds.
                    </Typography>
                    <Typography variant="body1" className="text-lg leading-relaxed">
                      The name "Olgish" combines my name, Olga, with the word "delicious" -
                      representing my commitment to creating not just beautiful, but truly delicious
                      cakes that bring joy to every celebration.
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>

            {/* Commitment Section */}
            <Box className="mt-16">
              <Typography
                variant="h3"
                component="h2"
                className="text-3xl font-bold mb-8 text-center"
                sx={{ color: "primary.main" }}
              >
                Our Commitment to Excellence
              </Typography>
              <Grid container spacing={4}>
                {[
                  {
                    title: "Premium Ingredients",
                    description:
                      "We use only the finest, locally-sourced ingredients for our creations.",
                  },
                  {
                    title: "Traditional Recipes",
                    description:
                      "Our cakes follow authentic Ukrainian recipes with a modern twist.",
                  },
                  {
                    title: "Attention to Detail",
                    description: "Each cake is crafted with meticulous care and precision.",
                  },
                  {
                    title: "Personalized Service",
                    description: "We offer customized consultations for your special occasions.",
                  },
                  {
                    title: "Artistic Excellence",
                    description:
                      "Every creation is a masterpiece that delights both the eyes and taste buds.",
                  },
                  {
                    title: "Ukrainian Heritage",
                    description:
                      "We preserve and share the rich baking traditions of Ukraine with every creation.",
                  },
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        height: "100%",
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        component="h3"
                        className="font-bold mb-2"
                        sx={{ color: "primary.main", fontSize: "1.25rem" }}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body1" className="text-gray-600">
                        {item.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>
      </main>
    </>
  );
}
