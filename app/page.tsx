import { Container, Typography, Button, Grid } from "@mui/material";
import Link from "next/link";
import CakeCard from "./components/CakeCard";
import { getFeaturedCakes } from "./utils/fetchCakes";
import { AnimatedSection, AnimatedDiv } from "./components/AnimatedSection";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default async function Home() {
  const featuredCakes = await getFeaturedCakes();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative h-[90vh] flex items-center overflow-hidden mb-24"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        </div>
        <Container className="relative z-10 text-white px-6 md:px-8">
          <AnimatedDiv
            variants={staggerContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <AnimatedDiv variants={fadeInUp} className="mb-8">
              <Typography
                variant="h1"
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              >
                Artisanal Cakes Crafted with Passion
              </Typography>
            </AnimatedDiv>
            <AnimatedDiv variants={fadeInUp} className="mb-12">
              <Typography variant="h2" className="text-xl md:text-2xl mb-8 text-gray-200">
                Where every cake tells a story of craftsmanship and creativity
              </Typography>
            </AnimatedDiv>
            <AnimatedDiv variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                href="/cakes"
                className="bg-primary hover:bg-primary-dark px-8 py-3 text-lg"
              >
                Explore Our Collection
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={Link}
                href="/about"
                className="px-8 py-3 text-lg"
              >
                Our Story
              </Button>
            </AnimatedDiv>
          </AnimatedDiv>
        </Container>
      </AnimatedSection>

      {/* Featured Cakes Section */}
      <AnimatedSection
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-32 bg-gradient-to-b from-gray-50/50 to-white/50 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.gray.200)_1px,transparent_0)] bg-[size:40px_40px] opacity-50" />

        <Container className="relative">
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-20 text-center max-w-3xl mx-auto px-6"
          >
            <Typography component="span" className="text-primary font-medium mb-4 block">
              Our Signature Collection
            </Typography>
            <Typography
              variant="h2"
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
            >
              Featured Creations
            </Typography>
            <Typography variant="subtitle1" className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most celebrated cakes, where artistry meets flavor in perfect harmony.
              Each creation tells a unique story of craftsmanship and creativity.
            </Typography>
          </AnimatedDiv>

          <Grid container spacing={6} className="mb-16">
            {featuredCakes.map((cake, index) => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <AnimatedDiv
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <CakeCard cake={cake} variant="featured" />
                </AnimatedDiv>
              </Grid>
            ))}
          </Grid>

          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={Link}
              href="/cakes"
              className="px-12 py-3 text-lg border-2 hover:bg-primary hover:text-white transition-colors duration-300"
            >
              Explore All Creations
            </Button>
          </AnimatedDiv>
        </Container>
      </AnimatedSection>

      {/* About Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 mb-24"
      >
        <Container className="px-6 md:px-8">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <AnimatedDiv
                variants={staggerContainer}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <AnimatedDiv variants={fadeInUp} className="mb-8">
                  <Typography variant="h2" className="text-4xl font-bold mb-6">
                    Our Craftsmanship
                  </Typography>
                </AnimatedDiv>
                <AnimatedDiv variants={fadeInUp} className="mb-8">
                  <Typography variant="body1" className="text-lg text-gray-600 mb-6">
                    At Olgish Cakes, we blend traditional techniques with innovative designs to
                    create unforgettable experiences. Each cake is a testament to our dedication to
                    quality and artistry.
                  </Typography>
                </AnimatedDiv>
                <AnimatedDiv variants={fadeInUp}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    href="/about"
                    className="mt-4 px-8 py-3 text-lg"
                  >
                    Discover Our Journey
                  </Button>
                </AnimatedDiv>
              </AnimatedDiv>
            </Grid>
            <Grid item xs={12} md={6}>
              <AnimatedDiv
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
              </AnimatedDiv>
            </Grid>
          </Grid>
        </Container>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gray-50"
      >
        <Container className="px-6 md:px-8">
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <Typography variant="h2" className="text-4xl font-bold text-center mb-4">
              Customer Experiences
            </Typography>
            <Typography
              variant="subtitle1"
              className="text-center text-gray-600 mb-16 max-w-2xl mx-auto"
            >
              Hear what our customers have to say about their experiences with our cakes
            </Typography>
          </AnimatedDiv>
          <Grid container spacing={6}>
            {[1, 2, 3].map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedDiv
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg h-full"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-4" />
                    <div>
                      <Typography variant="h6" className="font-bold">
                        Customer Name
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Verified Buyer
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="body1" className="text-gray-600">
                    "The cake was absolutely stunning and tasted even better than it looked. The
                    attention to detail was incredible!"
                  </Typography>
                </AnimatedDiv>
              </Grid>
            ))}
          </Grid>
        </Container>
      </AnimatedSection>
    </main>
  );
}
