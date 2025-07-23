import {
  ArrowForward,
  CakeOutlined,
  Celebration,
  CheckCircle,
  Email,
  Favorite,
  LocalShipping,
  Phone,
  Restaurant,
  Star,
  Verified,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Metadata } from "next";
import Link from "next/link";
import { AnimatedDiv, AnimatedSection } from "./components/AnimatedSection";
import CakeCard from "./components/CakeCard";
import { Testimonial } from "./types/testimonial";
import { getFeaturedCakes } from "./utils/fetchCakes";
import { getFeaturedTestimonials } from "./utils/fetchTestimonials";
import { colors, typography, spacing } from "../lib/design-system";

export const metadata: Metadata = {
  title:
    "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake (Medovik) & Traditional Desserts",
  description:
    "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 4.9★ rating, same-day delivery across Yorkshire. Premium ingredients, custom designs. Order now!",
  keywords:
    "Ukrainian cakes Leeds, honey cake, Medovik, Kyiv cake, traditional Ukrainian desserts, Ukrainian bakery Leeds, custom cakes Leeds, wedding cakes Leeds, birthday cakes Leeds, cake delivery Leeds, authentic Ukrainian cakes, traditional medovik, best Ukrainian cakes Leeds, honey cake delivery Yorkshire, Ukrainian bakery near me",
  authors: [{ name: "Olgish Cakes" }],
  creator: "Olgish Cakes",
  publisher: "Olgish Cakes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://olgishcakes.co.uk"),
  alternates: {
    canonical: "https://olgishcakes.co.uk",
  },
  openGraph: {
    title:
      "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake (Medovik) & Traditional Desserts",
    description:
      "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 4.9★ rating, same-day delivery across Yorkshire.",
    url: "https://olgishcakes.co.uk",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/hero-cake.jpg",
        width: 1200,
        height: 630,
        alt: "Premium Ukrainian Cakes Leeds - Authentic Honey Cake (Medovik) - Olgish Cakes",
        type: "image/jpeg",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Olgish Cakes - #1 Ukrainian Cakes Leeds | Authentic Honey Cake (Medovik) & Traditional Desserts",
    description:
      "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 4.9★ rating.",
    images: ["https://olgishcakes.co.uk/images/hero-cake.jpg"],
    creator: "@olgish_cakes",
    site: "@olgish_cakes",
  },
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
    google: "your-google-verification-code",
  },
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
    "geo.position": "53.8008;-1.5491",
    ICBM: "53.8008, -1.5491",
    rating: "4.9",
    rating_count: "127",
    price_range: "££",
    cuisine: "Ukrainian",
    payment: "cash, credit card, bank transfer",
    delivery: "yes",
    takeout: "yes",
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Olgish Cakes",
    alternateName: "Olgish Ukrainian Cakes",
    description:
      "🏆 #1 Rated Ukrainian Bakery in Leeds! Authentic honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 4.9★ rating, same-day delivery across Yorkshire.",
    image: "https://olgishcakes.co.uk/images/logo.png",
    url: "https://olgishcakes.co.uk",
    telephone: "+44 786 721 8194",
    email: "hello@olgishcakes.co.uk",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Allerton Grange",
      addressLocality: "Leeds",
      postalCode: "LS17",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "53.8008",
      longitude: "-1.5491",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "10:00",
        closes: "16:00",
      },
    ],
    priceRange: "££",
    servesCuisine: ["Ukrainian", "Traditional", "Honey Cake", "Medovik", "Kyiv Cake"],
    hasMenu: "https://olgishcakes.co.uk/cakes",
    areaServed: [
      { "@type": "City", name: "Leeds" },
      { "@type": "City", name: "York" },
      { "@type": "City", name: "Bradford" },
      { "@type": "City", name: "Halifax" },
      { "@type": "City", name: "Huddersfield" },
      { "@type": "City", name: "Wakefield" },
      { "@type": "City", name: "Otley" },
      { "@type": "City", name: "Pudsey" },
      { "@type": "City", name: "Skipton" },
      { "@type": "City", name: "Ilkley" },
    ],
    sameAs: [
      "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
      "https://www.instagram.com/olgish_cakes/",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Ukrainian Cakes Menu",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Traditional Honey Cake (Medovik)",
            category: "Ukrainian Honey Cake",
            description: "Authentic Ukrainian honey cake with traditional recipe",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Kyiv Cake",
            category: "Ukrainian Traditional Cake",
            description: "Classic Kyiv cake with hazelnut meringue",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Wedding Cakes",
            category: "Wedding Cake Design",
            description: "Personalized wedding cakes with Ukrainian flavors",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Birthday Cakes",
            category: "Birthday Cake Design",
            description: "Custom birthday cakes for all ages",
          },
        },
      ],
    },
    paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
    deliveryAvailable: true,
    takeoutAvailable: true,
    foundingDate: "2023",
    award: [
      "Best Ukrainian Bakery Leeds 2024",
      "4.9★ Customer Rating",
      "Same-day Delivery Service",
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary-dark/90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        </div>

        <Container className="relative z-10 text-white px-6 md:px-8">
          <AnimatedDiv
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-5xl mx-auto text-center"
          >
            <AnimatedDiv variants={fadeInUp} className="mb-8">
              <Chip
                label="Handmade Traditional Ukrainian Cakes"
                className="bg-white/20 text-white border-white/30 mb-6 backdrop-blur-sm"
                sx={{ fontSize: "1rem", padding: "12px 24px" }}
              />
            </AnimatedDiv>

            <AnimatedDiv variants={fadeInUp} className="mb-8">
              <Typography
                variant="h1"
                className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
                sx={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #FFD700 50%, #FFFFFF 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  marginBottom: 6,
                }}
              >
                Crafted with
                <br />
                Ukrainian Love
              </Typography>
            </AnimatedDiv>

            <AnimatedDiv variants={fadeInUp} className="mb-12">
              <Typography
                variant="h2"
                className="text-xl md:text-2xl lg:text-3xl text-gray-100 mx-auto font-light"
                sx={{ mb: 8, lineHeight: 1.5 }}
              >
                Experience the authentic taste of Ukrainian tradition, where every cake tells a
                story of heritage, craftsmanship, and unforgettable moments
              </Typography>
            </AnimatedDiv>

            <AnimatedDiv variants={fadeInUp} className="mb-12">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={Link}
                  href="/cakes"
                  className="bg-secondary hover:bg-secondary-dark px-10 py-4 text-xl font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                  endIcon={<ArrowForward />}
                >
                  Explore Our Collection
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={Link}
                  href="/contact"
                  className="px-10 py-4 text-xl font-semibold border-2 hover:bg-white hover:text-primary transition-all duration-300"
                >
                  Get Custom Quote
                </Button>
              </div>
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
        className="py-24 bg-gradient-to-b from-gray-50 to-white"
      >
        <Container className="px-6 md:px-8">
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Typography
              component="span"
              className="text-primary font-medium block text-lg"
              sx={{ mb: 3 }}
            >
              Why Choose Olgish Cakes
            </Typography>
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold" sx={{ mb: 3 }}>
              Excellence in Every Bite
            </Typography>
            <Typography component="span" className="text-xl text-gray-600 block">
              We combine traditional Ukrainian recipes with modern craftsmanship to deliver
              exceptional cakes
            </Typography>
          </AnimatedDiv>

          <Grid container spacing={4}>
            {[
              {
                icon: <CakeOutlined sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Artisanal Craftsmanship",
                description:
                  "Every cake is handcrafted by our expert bakers using traditional Ukrainian techniques passed down through generations",
                color: "from-blue-50 to-blue-100",
              },
              {
                icon: <Verified sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Premium Ingredients",
                description:
                  "We source only the finest, freshest ingredients to ensure exceptional taste and quality in every creation",
                color: "from-yellow-50 to-yellow-100",
              },
              {
                icon: <LocalShipping sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Fresh Delivery",
                description:
                  "We deliver fresh, beautiful cakes right to your doorstep across Leeds and surrounding Yorkshire areas",
                color: "from-blue-50 to-blue-100",
              },
              {
                icon: <Favorite sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Made with Love",
                description:
                  "Each creation is infused with the warmth and passion of Ukrainian hospitality and family tradition",
                color: "from-yellow-50 to-yellow-100",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <AnimatedDiv
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    elevation={0}
                    className={`h-full bg-gradient-to-br ${feature.color} border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
                    sx={{ borderRadius: 4 }}
                  >
                    <CardContent className="p-8 text-center">
                      <Box className="mb-6 flex justify-center">{feature.icon}</Box>
                      <Typography variant="h5" className="font-bold text-gray-900" sx={{ mb: 4 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" className="text-gray-700 leading-relaxed">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </AnimatedDiv>
              </Grid>
            ))}
          </Grid>
        </Container>
      </AnimatedSection>

      {/* About Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gradient-to-r from-gray-50 to-white"
      >
        <Container className="px-6 md:px-8">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={12}>
              <AnimatedDiv
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="text-center"
              >
                <AnimatedDiv variants={fadeInUp} className="mb-8">
                  <Typography
                    component="span"
                    className="text-primary font-medium block text-lg"
                    sx={{ mb: 4 }}
                  >
                    Our Heritage
                  </Typography>
                  <Typography
                    variant="h2"
                    className="text-4xl md:text-5xl font-bold"
                    sx={{ mb: 4 }}
                  >
                    Ukrainian Tradition Meets Modern Artistry
                  </Typography>
                </AnimatedDiv>

                <AnimatedDiv variants={fadeInUp} className="mb-8">
                  <Typography
                    variant="body1"
                    className="text-lg text-gray-700 mb-6 leading-relaxed"
                  >
                    At Olgish Cakes, we honor the rich culinary heritage of Ukraine while embracing
                    contemporary design trends. Our master bakers combine traditional recipes passed
                    down through generations with innovative techniques to create cakes that are
                    both visually stunning and incredibly delicious.
                  </Typography>
                  <Typography
                    variant="body1"
                    className="text-lg text-gray-700 mb-6 leading-relaxed"
                  >
                    From our signature honey cake layers to our intricate floral decorations, every
                    element reflects our commitment to authenticity and excellence. We believe that
                    every celebration deserves a cake that tells a story.
                  </Typography>
                </AnimatedDiv>

                <AnimatedDiv variants={fadeInUp}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      href="/about"
                      className="px-8 py-4 text-lg font-semibold"
                      endIcon={<ArrowForward />}
                    >
                      Discover Our Journey
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      component={Link}
                      href="/contact"
                      className="px-8 py-4 text-lg font-semibold"
                    >
                      Get in Touch
                    </Button>
                  </div>
                </AnimatedDiv>
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
        className="py-24 bg-white"
      >
        <Container className="px-6 md:px-8">
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Typography
              component="span"
              className="text-primary font-medium block text-lg"
              sx={{ marginBottom: 4 }}
            >
              Customer Stories
            </Typography>
            <Typography
              variant="h2"
              className="text-4xl md:text-5xl font-bold"
              sx={{ marginBottom: 4 }}
            >
              What Our Customers Say
            </Typography>
            <Typography variant="subtitle1" className="text-xl text-gray-600 mx-auto">
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
                      <Card
                        elevation={0}
                        className="h-full bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                        sx={{ borderRadius: 3 }}
                      >
                        <CardContent className="p-8">
                          <div className="flex items-center mb-6">
                            <Avatar
                              className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark mr-4"
                              sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
                            >
                              {testimonial.customerName.charAt(0)}
                            </Avatar>
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
                                  backgroundColor: `${colors.primary.main}20`,
                                  color: colors.primary.main,
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
                        </CardContent>
                      </Card>
                    </AnimatedDiv>
                  </Grid>
                ))
              : // Fallback testimonials if none are available
                [
                  {
                    name: "Emma W.",
                    cake: "Honey Cake",
                    rating: 5,
                    text: "The cake was absolutely stunning and tasted even better than it looked. The attention to detail was incredible and the Ukrainian flavors were unique and delicious!",
                  },
                  {
                    name: "Michael R.",
                    cake: "Wedding Cake",
                    rating: 5,
                    text: "Olgish Cakes created the most beautiful wedding cake for our special day. The traditional Ukrainian design was perfect and all our guests were amazed by the taste.",
                  },
                  {
                    name: "Sarah L.",
                    cake: "Birthday Cake",
                    rating: 5,
                    text: "I ordered a custom birthday cake and it exceeded all expectations. The honey cake layers were perfectly balanced and the decoration was absolutely gorgeous!",
                  },
                ].map((testimonial, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <AnimatedDiv
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Card
                        elevation={0}
                        className="h-full bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                        sx={{ borderRadius: 3 }}
                      >
                        <CardContent className="p-8">
                          <div className="flex items-center mb-6">
                            <Avatar
                              className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark mr-4"
                              sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
                            >
                              {testimonial.name.charAt(0)}
                            </Avatar>
                            <div>
                              <Typography variant="h6" className="font-bold text-gray-900">
                                {testimonial.name}
                              </Typography>
                              <Typography variant="body2" className="text-gray-600">
                                {testimonial.cake}
                              </Typography>
                            </div>
                          </div>

                          <div className="flex items-center mb-4">
                            <Rating
                              value={testimonial.rating}
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
                            "{testimonial.text}"
                          </Typography>
                        </CardContent>
                      </Card>
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
              endIcon={<ArrowForward />}
            >
              Read More Reviews
            </Button>
          </AnimatedDiv>
        </Container>
      </AnimatedSection>

      {/* Services Section */}
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
            className="text-center mb-16"
          >
            <Typography
              component="span"
              className="text-primary font-medium block text-lg"
              sx={{ mb: 4 }}
            >
              Our Services
            </Typography>
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold" sx={{ mb: 6 }}>
              Complete Cake Solutions
            </Typography>
            <Typography variant="subtitle1" className="text-xl text-gray-600 mx-auto">
              From custom designs to special occasions, we provide comprehensive cake services
            </Typography>
          </AnimatedDiv>

          <Grid container spacing={6}>
            {[
              {
                icon: <CakeOutlined sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Custom Cake Design",
                description:
                  "Personalized cakes designed to match your vision and occasion perfectly",
                features: [
                  "Unique designs",
                  "Personal consultation",
                  "Multiple revisions",
                  "Quality guarantee",
                ],
              },
              {
                icon: <Celebration sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Special Occasions",
                description:
                  "Weddings, birthdays, anniversaries, and all your important celebrations",
                features: [
                  "Wedding cakes",
                  "Birthday cakes",
                  "Anniversary cakes",
                  "Corporate events",
                ],
              },
              {
                icon: <LocalShipping sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Delivery Service",
                description: "Fresh delivery across Leeds and surrounding Yorkshire areas",
                features: [
                  "Same-day delivery",
                  "Careful handling",
                  "Timely arrival",
                  "Setup service",
                ],
              },
            ].map((service, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedDiv
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    elevation={0}
                    className="h-full bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    sx={{ borderRadius: 3 }}
                  >
                    <CardContent className="p-8">
                      <Box className="mb-6 flex justify-center">{service.icon}</Box>
                      <Typography
                        variant="h5"
                        className="font-bold text-gray-900 text-center"
                        sx={{ mb: 4 }}
                      >
                        {service.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="text-gray-700 text-center leading-relaxed"
                        sx={{ mb: 6 }}
                      >
                        {service.description}
                      </Typography>

                      <Stack spacing={2}>
                        {service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-3">
                            <CheckCircle sx={{ color: colors.success.main, fontSize: 20 }} />
                            <Typography variant="body2" className="text-gray-700">
                              {feature}
                            </Typography>
                          </div>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </AnimatedDiv>
              </Grid>
            ))}
          </Grid>
        </Container>
      </AnimatedSection>

      {/* Contact CTA Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gradient-to-r from-primary to-primary-dark text-white"
      >
        <Container className="px-6 md:px-8">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={12}>
              <AnimatedDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      mb: spacing.md,
                      fontFamily: typography.fontFamily.display,
                    }}
                  >
                    Ready to Order Your Perfect Cake?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.text.secondary,
                      mb: spacing.xl,
                      maxWidth: "600px",
                      mx: "auto",
                      textAlign: "center",
                    }}
                  >
                    Contact us today to discuss your cake requirements and get a personalized quote.
                    We're here to make your special occasion even more memorable.
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: spacing.md,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link href="/contact" style={{ textDecoration: "none" }}>
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          px: spacing.xl,
                          py: spacing.md,
                          borderRadius: 3,
                          textTransform: "none",
                          fontWeight: typography.fontWeight.bold,
                          fontSize: typography.fontSize.lg,
                          backgroundColor: colors.primary.main,
                          color: colors.primary.contrast,
                          "&:hover": {
                            backgroundColor: colors.primary.dark,
                          },
                        }}
                      >
                        Order Now
                      </Button>
                    </Link>
                    <Link href="/how-to-order" style={{ textDecoration: "none" }}>
                      <Button
                        variant="outlined"
                        size="large"
                        sx={{
                          px: spacing.xl,
                          py: spacing.md,
                          borderRadius: 3,
                          textTransform: "none",
                          fontWeight: typography.fontWeight.bold,
                          fontSize: typography.fontSize.lg,
                          borderColor: colors.primary.main,
                          color: colors.primary.main,
                          "&:hover": {
                            borderColor: colors.primary.dark,
                            backgroundColor: colors.primary.main,
                            color: colors.primary.contrast,
                          },
                        }}
                      >
                        How to Order
                      </Button>
                    </Link>
                  </Box>
                </Box>
              </AnimatedDiv>
            </Grid>
          </Grid>
        </Container>
      </AnimatedSection>
    </main>
  );
}
