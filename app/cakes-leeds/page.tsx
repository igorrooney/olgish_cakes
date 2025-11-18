import { formatStructuredDataPrice } from "@/lib/utils/price-formatting";
import { Box, Button, Chip, Container, Grid, Paper, Typography } from "@mui/material";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";
import CakeCard from "../components/CakeCard";
import { getAllCakes } from "../utils/fetchCakes";
import { getMerchantReturnPolicy, getOfferShippingDetails } from "../utils/seo";

export const metadata: Metadata = {
  title: "Birthday Cakes Leeds from £25 | 5★ Rated",
  description:
    "Birthday cakes Leeds from £25 | Same-day delivery | Ukrainian honey cake | 127+ 5-star reviews | Custom designs | Children's & adult themes | Order today!",
  keywords:
    "cakes Leeds, bakery Leeds, custom cakes Leeds, wedding cakes Leeds, birthday cakes Leeds, cake delivery Leeds, Ukrainian cakes Leeds, local bakery Leeds, fresh cakes Leeds",
  openGraph: {
    title: "Birthday Cakes Leeds from £25 | 5★ Rated",
    description:
      "Birthday cakes Leeds from £25 | Same-day delivery | Ukrainian honey cake | 127+ 5-star reviews | Custom designs | Children's & adult themes | Order today!",
    url: "https://olgishcakes.co.uk/cakes-leeds",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cakes-leeds.jpg",
        width: 1200,
        height: 630,
        alt: "Fresh Cakes Leeds - Olgish Cakes Ukrainian Bakery",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Birthday Cakes Leeds from £25 | 5★ Rated",
    description:
      "Birthday cakes Leeds from £25 | Same-day delivery | Ukrainian honey cake | 127+ 5-star reviews | Custom designs | Children's & adult themes | Order today!",
    images: ["https://olgishcakes.co.uk/images/cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes-leeds",
  },
  authors: [{ name: "Olgish Cakes", url: "https://olgishcakes.co.uk" }],
  creator: "Olgish Cakes",
  publisher: "Olgish Cakes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://olgishcakes.co.uk"),
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
    google: "ggHjlSwV1aM_lVT4IcRSlUIk6Vn98ZbJ_FGCepoVi64",
  },
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
  },
};

export default async function CakesLeedsPage() {
  const allCakes = await getAllCakes();

  return (
    <>
      <Script
        id="cakes-leeds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Olgish Cakes - Leeds Ukrainian Bakery",
            description:
              "Fresh, handmade cakes in Leeds. Ukrainian bakery offering custom cakes, wedding cakes, birthday cakes, and traditional Ukrainian desserts. Local cake delivery in Leeds and surrounding areas.",
            url: "https://olgishcakes.co.uk/cakes-leeds",
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
              latitude: "53.8008",
              longitude: "-1.5491",
            },
            openingHours: "Mo-Su 00:00-23:59",
            priceRange: "££",
            servesCuisine: "Ukrainian",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5",
              reviewCount: "127",
              bestRating: "5",
              worstRating: "1",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Ukrainian Cakes",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Ukrainian Honey Cake",
                    image: "https://olgishcakes.co.uk/images/placeholder-cake.jpg",
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: "5",
                      reviewCount: "127",
                      bestRating: "5",
                      worstRating: "1",
                    },
                  },
                  price: formatStructuredDataPrice(25, 25),
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                  shippingDetails: getOfferShippingDetails(),
                  hasMerchantReturnPolicy: getMerchantReturnPolicy(),
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Kyiv Cake",
                    image: "https://olgishcakes.co.uk/images/placeholder-cake.jpg",
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: "5",
                      reviewCount: "127",
                      bestRating: "5",
                      worstRating: "1",
                    },
                  },
                  price: formatStructuredDataPrice(40, 40),
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                  shippingDetails: getOfferShippingDetails(),
                  hasMerchantReturnPolicy: getMerchantReturnPolicy(),
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Custom Wedding Cakes",
                    image: "https://olgishcakes.co.uk/images/placeholder-cake.jpg",
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: "5",
                      reviewCount: "127",
                      bestRating: "5",
                      worstRating: "1",
                    },
                  },
                  price: formatStructuredDataPrice(150, 150),
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                  shippingDetails: getOfferShippingDetails(),
                  hasMerchantReturnPolicy: getMerchantReturnPolicy(),
                },
              ],
            },
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
          }),
        }}
      />
      <Script
        id="cakes-leeds-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Do you deliver birthday cakes in Leeds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, I deliver fresh birthday cakes across Leeds including City Centre, Headingley, Chapel Allerton, Roundhay, Moortown, and all surrounding areas. Same-day delivery is available when ordered before 10am.",
                },
              },
              {
                "@type": "Question",
                name: "How much do birthday cakes cost in Leeds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Birthday cakes in Leeds start from £25 for a 6-inch cake serving 8-12 people. Prices vary based on size, design complexity, and customization. Delivery fee ranges from £5-12 depending on location within Leeds.",
                },
              },
              {
                "@type": "Question",
                name: "Can I get same-day birthday cake delivery in Leeds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, same-day delivery is available in Leeds when you order before 10am. This is perfect for last-minute birthday celebrations. Standard delivery requires 3-5 days notice.",
                },
              },
              {
                "@type": "Question",
                name: "What types of birthday cakes do you make in Leeds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "I create all types of birthday cakes in Leeds including children's themed cakes (unicorns, dinosaurs, superheroes), adult milestone cakes, Ukrainian honey cake, Kyiv cake, and custom-designed cakes to match any theme or preference.",
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
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cakes Leeds" }]} />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
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
              Fresh Cakes Leeds
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
              Handcrafted Ukrainian cakes made fresh in Leeds. From traditional Ukrainian desserts
              to custom celebration cakes, I bring authentic flavours and beautiful designs to our
              local community.
            </Typography>
            <Chip
              label="Local Leeds Bakery"
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

          {/* Local Bakery Features */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Made in Leeds",
                description:
                  "All my cakes are freshly baked in my Leeds kitchen using traditional Ukrainian recipes",
                icon: "🏠",
              },
              {
                title: "Local Delivery",
                description:
                  "Fast delivery service across Leeds and surrounding areas, making sure your cake arrives fresh",
                icon: "🚚",
              },
              {
                title: "Ukrainian Traditions",
                description:
                  "Authentic Ukrainian baking techniques and flavours brought to the Leeds community",
                icon: "🇺🇦",
              },
              {
                title: "Personal Service",
                description:
                  "Local, personal service with consultations and custom cake design for Leeds customers",
                icon: "👥",
              },
            ].map((feature, index) => (
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
                  <Box sx={{ mb: 2, fontSize: "3rem" }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Cake Categories */}
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
              Our Cake Collection
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

          {/* Local Service Areas */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Serving Leeds and Surrounding Areas
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              I'm proud to serve the Leeds community and surrounding areas with my authentic
              Ukrainian cakes. My local delivery service makes sure that your fresh, handmade cakes
              arrive at your doorstep or venue in perfect condition.
            </Typography>
            <Grid container spacing={3}>
              {[
                "Leeds City Centre",
                "Harehills",
                "Chapeltown",
                "Roundhay",
                "Moortown",
                "Alwoodley",
                "Headingley",
                "Hyde Park",
                "Woodhouse",
                "Burley",
                "Kirkstall",
                "Meanwood",
                "And surrounding areas",
              ].map((area, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        mr: 2,
                      }}
                    />
                    <Typography variant="body1">{area}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Why Choose Local */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Why Choose a Local Leeds Bakery?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Fresh & Local",
                  description:
                    "All cakes are made fresh in our Leeds kitchen, ensuring the highest quality and freshness for local customers.",
                },
                {
                  title: "Personal Touch",
                  description:
                    "As a local business, we provide personalized service and build lasting relationships with our Leeds community.",
                },
                {
                  title: "Support Local",
                  description:
                    "By choosing Olgish Cakes, you're supporting a local Leeds business and contributing to our vibrant community.",
                },
                {
                  title: "Quick Delivery",
                  description:
                    "Local delivery means faster service and fresher cakes, with same-day delivery available for urgent orders.",
                },
              ].map((benefit, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Local Testimonials */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              What Leeds Customers Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  quote: "The best cakes in Leeds! The Ukrainian honey cake was absolutely divine.",
                  author: "Sarah M., Leeds City Centre",
                },
                {
                  quote:
                    "Amazing service and the wedding cake was perfect. Highly recommend for any celebration!",
                  author: "Emma & Tom, Roundhay",
                },
                {
                  quote:
                    "Fresh, delicious, and beautiful cakes. Great local bakery with authentic Ukrainian flavours.",
                  author: "David P., Headingley",
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="body1"
                      sx={{ mb: 3, fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      {testimonial.author}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Cake Services in Leeds */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Popular Cake Services in Leeds
            </Typography>
            <Grid container spacing={3}>
              {[
                { name: "Wedding Cakes Leeds", href: "/wedding-cakes", description: "Custom wedding cakes with free consultation and venue delivery" },
                { name: "Birthday Cakes Leeds", href: "/birthday-cakes", description: "Themed birthday cakes for all ages with same-day delivery" },
                { name: "Celebration Cakes", href: "/celebration-cakes", description: "Anniversary, graduation, and special occasion cakes" },
                { name: "Custom Cake Design", href: "/custom-cake-design", description: "Personalized cake design service with free consultation" },
                { name: "Vegan Cakes Leeds", href: "/vegan-cakes-leeds", description: "100% plant-based Ukrainian cakes" },
                { name: "Nut-Free Cakes Leeds", href: "/nut-free-cakes-leeds", description: "Safe allergen-free cakes for nut allergies" },
              ].map((service, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Link href={service.href} style={{ textDecoration: 'none', display: 'block' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      sx={{
                        py: 2,
                        px: 3,
                        flexDirection: "column",
                        alignItems: "flex-start",
                        height: "100%",
                        textAlign: "left",
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                          "& .MuiTypography-root": {
                            color: "white",
                          },
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {service.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {service.description}
                      </Typography>
                    </Button>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Nearby Areas */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Cake Delivery to Nearby Areas
            </Typography>
            <Grid container spacing={2}>
              {[
                { name: "Cakes Bradford", href: "/cakes-bradford" },
                { name: "Cakes Huddersfield", href: "/cakes-huddersfield" },
                { name: "Cakes Wakefield", href: "/cakes-wakefield" },
                { name: "Cakes York", href: "/cakes-york" },
                { name: "Cakes Halifax", href: "/cakes-halifax" },
                { name: "Cakes Pudsey", href: "/cakes-pudsey" },
                { name: "Cakes Ilkley", href: "/cakes-ilkley" },
                { name: "Cakes Skipton", href: "/cakes-skipton" },
                { name: "Cakes Otley", href: "/cakes-otley" },
              ].map((area, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Link href={area.href} style={{ textDecoration: 'none', display: 'block' }}>
                    <Button
                      variant="text"
                      color="primary"
                      fullWidth
                      sx={{ py: 1, justifyContent: "flex-start" }}
                    >
                      {area.name}
                    </Button>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-alice)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Order Your Fresh Leeds Cake Today
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Experience the taste of authentic Ukrainian baking right here in Leeds. Contact me to
              order your fresh, handmade cake or schedule a consultation.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}>
                Order Cake
              </Button>
            </Link>
              <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}>
                View All Cakes
              </Button>
            </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
