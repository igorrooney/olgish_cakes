import { Container, Typography, Box, Grid, Paper, useTheme } from "@mui/material";
import Image from "next/image";
import { Header } from "../components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Olgish Cakes | Ukrainian Artisan Bakery in Leeds",
  description:
    "Learn about Olgish Cakes, a Ukrainian artisan bakery in Leeds specializing in traditional Ukrainian cakes and pastries. Meet Olga, our professionally-trained baker.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
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
              variant="h4"
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
                    className="text-3xl font-bold mb-6"
                    sx={{ color: "primary.main" }}
                  >
                    Hello, I'm Olga
                  </Typography>
                  <Typography variant="body1" className="text-lg leading-relaxed mb-6">
                    I'm a professionally-trained Ukrainian baker who moved to Leeds in 2022. I
                    specialise in traditional Ukrainian cakes - like honey cake, Kyev cake or King's
                    cake - which are an important part of our culture.
                  </Typography>
                  <Typography variant="body1" className="text-lg leading-relaxed">
                    My wish is to be able to share my love of baking with my new friends in England.
                    Get ready to taste something amazing! 🍰✨
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
                    className="text-3xl font-bold mb-6"
                    sx={{ color: "primary.main" }}
                  >
                    Our Story
                  </Typography>
                  <Typography variant="body1" className="text-lg leading-relaxed mb-4">
                    Born and raised in Ukraine, I developed a passion for baking at a young age,
                    learning traditional recipes from my grandmother. After completing professional
                    training in pastry arts, I worked in several prestigious bakeries in Ukraine
                    before bringing my expertise to Leeds.
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
                  description: "Our cakes follow authentic Ukrainian recipes with a modern twist.",
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
                      variant="h5"
                      className="font-bold mb-2"
                      sx={{ color: "primary.main" }}
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
    </>
  );
}
