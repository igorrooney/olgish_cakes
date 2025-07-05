import { CakeOutlined, Favorite, LocalShipping, Verified } from "@mui/icons-material";
import { Box, Button, Chip, Container, Grid, Paper, Rating, Typography } from "@mui/material";
import Link from "next/link";
import { AnimatedDiv, AnimatedSection } from "./components/AnimatedSection";
import CakeCard from "./components/CakeCard";
import { Testimonial } from "./types/testimonial";
import { getFeaturedCakes } from "./utils/fetchCakes";
import { getFeaturedTestimonials } from "./utils/fetchTestimonials";

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

const sourceIcons = {
  instagram: "📸",
  facebook: "📘",
  google: "🔍",
  direct: "💬",
} as const;

export default async function Home() {
  const [featuredCakes, testimonials] = await Promise.all([
    getFeaturedCakes(),
    getFeaturedTestimonials(3),
  ]);

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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50" />
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        </div>
        <Container className="relative z-10 text-white px-6 md:px-8">
          <AnimatedDiv
            variants={staggerContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <AnimatedDiv variants={fadeInUp} className="mb-6">
              <Chip
                label="Artisanal Ukrainian Cakes"
                className="bg-primary/20 text-primary-light border-primary/30 mb-6"
              />
            </AnimatedDiv>
            <AnimatedDiv variants={fadeInUp} className="mb-8">
              <Typography
                variant="h1"
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                sx={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #FFD700 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 4px 8px rgba(0,0,0,0.3)",
                }}
              >
                Crafted with Love
              </Typography>
            </AnimatedDiv>
            <AnimatedDiv variants={fadeInUp} className="mb-12">
              <Typography
                variant="h2"
                className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto"
              >
                Experience the authentic taste of Ukrainian tradition, where every cake tells a
                story of heritage, craftsmanship, and unforgettable moments
              </Typography>
            </AnimatedDiv>
            <AnimatedDiv
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                href="/cakes"
                className="bg-primary hover:bg-primary-dark px-8 py-4 text-lg font-semibold shadow-lg"
              >
                Explore Our Collection
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={Link}
                href="/about"
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-white hover:text-gray-900"
              >
                Our Story
              </Button>
            </AnimatedDiv>
          </AnimatedDiv>
        </Container>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-gradient-to-b from-gray-50 to-white"
      >
        <Container className="px-6 md:px-8">
          <Grid container spacing={4}>
            {[
              {
                icon: <CakeOutlined sx={{ fontSize: 40, color: "#005BBB" }} />,
                title: "Handcrafted Excellence",
                description:
                  "Every cake is meticulously crafted by our expert bakers using traditional Ukrainian techniques",
              },
              {
                icon: <LocalShipping sx={{ fontSize: 40, color: "#005BBB" }} />,
                title: "Fresh Delivery",
                description:
                  "We deliver fresh, beautiful cakes right to your doorstep across Leeds and surrounding areas",
              },
              {
                icon: <Verified sx={{ fontSize: 40, color: "#005BBB" }} />,
                title: "Premium Quality",
                description:
                  "Only the finest ingredients are used, ensuring exceptional taste and quality in every bite",
              },
              {
                icon: <Favorite sx={{ fontSize: 40, color: "#005BBB" }} />,
                title: "Made with Love",
                description:
                  "Each creation is infused with the warmth and passion of Ukrainian hospitality",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <AnimatedDiv
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <Paper
                    elevation={0}
                    className="p-6 h-full bg-white border border-gray-100 hover:shadow-lg transition-all duration-300"
                    sx={{ borderRadius: 3 }}
                  >
                    <Box className="mb-4 flex justify-center">{feature.icon}</Box>
                    <Typography variant="h6" className="font-bold mb-3 text-gray-900">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {feature.description}
                    </Typography>
                  </Paper>
                </AnimatedDiv>
              </Grid>
            ))}
          </Grid>
        </Container>
      </AnimatedSection>

      {/* Featured Cakes Section */}
      <AnimatedSection
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-32 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden"
      >
        <Container className="relative">
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-20 text-center max-w-4xl mx-auto px-6"
          >
            <Typography component="span" className="text-primary font-medium mb-4 block text-lg">
              Our Signature Collection
            </Typography>
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6">
              Featured Creations
            </Typography>
            <Typography
              variant="subtitle1"
              className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Discover our most celebrated cakes, where Ukrainian tradition meets contemporary
              artistry. Each creation is a masterpiece of flavor and design, crafted to make your
              special moments unforgettable.
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
              className="px-12 py-4 text-lg font-semibold border-2"
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
        className="py-24 mb-24 bg-gradient-to-r from-gray-50 to-white"
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
                <AnimatedDiv variants={fadeInUp} className="mb-6">
                  <Typography
                    component="span"
                    className="text-primary font-medium mb-4 block text-lg"
                  >
                    Our Heritage
                  </Typography>
                  <Typography variant="h2" className="text-4xl font-bold mb-6">
                    Ukrainian Tradition Meets Modern Artistry
                  </Typography>
                </AnimatedDiv>
                <AnimatedDiv variants={fadeInUp} className="mb-8">
                  <Typography
                    variant="body1"
                    className="text-lg text-gray-600 mb-6 leading-relaxed"
                  >
                    At Olgish Cakes, we honor the rich culinary heritage of Ukraine while embracing
                    contemporary design trends. Our master bakers combine traditional recipes passed
                    down through generations with innovative techniques to create cakes that are
                    both visually stunning and incredibly delicious.
                  </Typography>
                  <Typography
                    variant="body1"
                    className="text-lg text-gray-600 mb-6 leading-relaxed"
                  >
                    From our signature honey cake layers to our intricate floral decorations, every
                    element reflects our commitment to authenticity and excellence. We believe that
                    every celebration deserves a cake that tells a story.
                  </Typography>
                </AnimatedDiv>
                <AnimatedDiv variants={fadeInUp}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    href="/about"
                    className="mt-4 px-8 py-4 text-lg font-semibold"
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
                className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CakeOutlined sx={{ fontSize: 120, color: "#005BBB", opacity: 0.3 }} />
                </div>
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
        className="py-24 bg-gradient-to-b from-gray-50 to-white"
      >
        <Container className="px-6 md:px-8">
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-16 text-center"
          >
            <Typography component="span" className="text-primary font-medium mb-4 block text-lg">
              Customer Stories
            </Typography>
            <Typography variant="h2" className="text-4xl font-bold text-center mb-6">
              What Our Customers Say
            </Typography>
            <Typography
              variant="subtitle1"
              className="text-center text-gray-600 mb-16 max-w-3xl mx-auto text-lg leading-relaxed"
            >
              Real experiences from our valued customers who have celebrated their special moments
              with our cakes
            </Typography>
          </AnimatedDiv>

          <Grid container spacing={6}>
            {testimonials.length > 0
              ? testimonials.map((testimonial: Testimonial, index: number) => (
                  <Grid item xs={12} md={4} key={testimonial._id}>
                    <AnimatedDiv
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Paper
                        elevation={0}
                        className="p-8 h-full bg-white border border-gray-100 hover:shadow-lg transition-all duration-300"
                        sx={{ borderRadius: 3 }}
                      >
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark mr-4 flex items-center justify-center">
                            <Typography className="text-white font-bold text-lg">
                              {testimonial.customerName.charAt(0)}
                            </Typography>
                          </div>
                          <div className="flex-1">
                            <Typography variant="h6" className="font-bold text-gray-900">
                              {testimonial.customerName}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                              {testimonial.cakeType}
                            </Typography>
                          </div>
                          {testimonial.source && (
                            <Chip
                              label={
                                sourceIcons[testimonial.source as keyof typeof sourceIcons] ||
                                testimonial.source
                              }
                              size="small"
                              className="capitalize"
                              sx={{
                                backgroundColor: "rgba(0, 91, 187, 0.1)",
                                color: "#005BBB",
                                fontSize: "0.75rem",
                              }}
                            />
                          )}
                        </div>

                        <div className="flex items-center mb-4">
                          <Rating
                            value={testimonial.rating}
                            readOnly
                            precision={0.5}
                            sx={{
                              "& .MuiRating-iconFilled": {
                                color: "#FFD700",
                              },
                            }}
                          />
                          <Typography variant="body2" color="text.secondary" className="ml-2">
                            {new Date(testimonial.date).toLocaleDateString()}
                          </Typography>
                        </div>

                        <Typography
                          variant="body1"
                          className="italic text-gray-700 leading-relaxed"
                          sx={{ lineHeight: 1.7 }}
                        >
                          "{testimonial.text}"
                        </Typography>
                      </Paper>
                    </AnimatedDiv>
                  </Grid>
                ))
              : // Fallback testimonials if none are available
                [1, 2, 3].map((_, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <AnimatedDiv
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Paper
                        elevation={0}
                        className="p-8 h-full bg-white border border-gray-100 hover:shadow-lg transition-all duration-300"
                        sx={{ borderRadius: 3 }}
                      >
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark mr-4 flex items-center justify-center">
                            <Typography className="text-white font-bold text-lg">
                              {["E", "M", "S"][index]}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="h6" className="font-bold text-gray-900">
                              {["Emma W.", "Michael R.", "Sarah L."][index]}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                              Verified Customer
                            </Typography>
                          </div>
                        </div>

                        <div className="flex items-center mb-4">
                          <Rating
                            value={5}
                            readOnly
                            sx={{
                              "& .MuiRating-iconFilled": {
                                color: "#FFD700",
                              },
                            }}
                          />
                        </div>

                        <Typography
                          variant="body1"
                          className="italic text-gray-700 leading-relaxed"
                          sx={{ lineHeight: 1.7 }}
                        >
                          "The cake was absolutely stunning and tasted even better than it looked.
                          The attention to detail was incredible and the Ukrainian flavors were
                          unique and delicious!"
                        </Typography>
                      </Paper>
                    </AnimatedDiv>
                  </Grid>
                ))}
          </Grid>

          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              href="/testimonials"
              className="px-8 py-3 text-lg font-semibold"
            >
              Read More Reviews
            </Button>
          </AnimatedDiv>
        </Container>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gradient-to-r from-primary to-primary-dark text-white"
      >
        <Container className="px-6 md:px-8 text-center">
          <AnimatedDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Create Something Special?
            </Typography>
            <Typography
              variant="h6"
              className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto leading-relaxed"
            >
              Let us help you celebrate your most important moments with a cake that's as unique and
              beautiful as your occasion
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                href="/cakes"
                className="px-8 py-4 text-lg font-semibold"
              >
                Order Your Cake
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={Link}
                href="/contact"
                className="px-8 py-4 text-lg font-semibold border-2"
              >
                Get in Touch
              </Button>
            </div>
          </AnimatedDiv>
        </Container>
      </AnimatedSection>
    </main>
  );
}
