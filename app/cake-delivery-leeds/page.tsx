import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { BUSINESS_CONSTANTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cake Delivery Leeds | Same-Day Delivery | 5★ Rated",
  description:
    "Same-day cake delivery Leeds from £5 | Order before 10am | Fresh Ukrainian cakes | 127+ 5-star reviews | Serving all Leeds postcodes | Order today!",
  keywords:
    "cake delivery Leeds, same day cake delivery Leeds, cake delivery service Leeds, next day cake delivery Leeds, Ukrainian cake delivery Leeds, birthday cake delivery Leeds, wedding cake delivery Leeds",
  openGraph: {
    title: "Cake Delivery Leeds | Same-Day Delivery | 5★ Rated",
    description:
      "Same-day cake delivery Leeds from £5 | Order before 10am | Fresh Ukrainian cakes | 127+ 5-star reviews | Serving all Leeds postcodes | Order today!",
    url: "https://olgishcakes.co.uk/cake-delivery-leeds",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cake-delivery.jpg",
        width: 1200,
        height: 630,
        alt: "Same-Day Cake Delivery Leeds - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Delivery Leeds | Same-Day Delivery | 5★ Rated",
    description:
      "Same-day cake delivery Leeds from £5 | Order before 10am | Fresh Ukrainian cakes | 127+ 5-star reviews | Order today!",
    images: ["https://olgishcakes.co.uk/images/cake-delivery.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-delivery-leeds",
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
    "geo.position": "53.8008;-1.5491",
    ICBM: "53.8008, -1.5491",
  },
};

export default function CakeDeliveryLeedsPage() {
  return (
    <>
      <Script
        id="cake-delivery-leeds-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Cake Delivery Leeds",
            description:
              "Same-day and next-day cake delivery service across Leeds. Fresh Ukrainian cakes delivered to your door. Professional delivery service with careful handling.",
            url: "https://olgishcakes.co.uk/cake-delivery-leeds",
            provider: {
              "@type": "Bakery",
              "@id": "https://olgishcakes.co.uk/#organization",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
              telephone: BUSINESS_CONSTANTS.PHONE,
              email: "hello@olgishcakes.co.uk",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Allerton Grange",
                addressLocality: "Leeds",
                postalCode: "LS17",
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5",
                reviewCount: "127",
                bestRating: "5",
                worstRating: "1",
              },
            },
            serviceType: "Cake Delivery Service",
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Cake Delivery Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Same Day Delivery Leeds",
                    description: "Same-day cake delivery available when ordered before 10am",
                  },
                  price: "5",
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Next Day Delivery Leeds",
                    description: "Standard next-day delivery service across Leeds",
                  },
                  price: "5",
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                },
              ],
            },
          }),
        }}
      />
      <Script
        id="cake-delivery-leeds-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Do you deliver cakes to Leeds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, I deliver fresh cakes to all areas of Leeds including City Centre, Headingley, Chapel Allerton, Roundhay, Moortown, Alwoodley, and all surrounding areas. Same-day delivery is available when ordered before 10am.",
                },
              },
              {
                "@type": "Question",
                name: "How much does cake delivery cost in Leeds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Cake delivery in Leeds starts from £5 for Leeds City Centre and central areas. Leeds suburbs cost £8, and outer Leeds areas cost £12. Delivery fees vary based on your postcode location within Leeds.",
                },
              },
              {
                "@type": "Question",
                name: "Can I get same-day cake delivery in Leeds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, same-day cake delivery is available in Leeds when you order before 10am. This is perfect for last-minute celebrations. Delivery times are between 10am and 6pm on the same day.",
                },
              },
              {
                "@type": "Question",
                name: "What areas of Leeds do you deliver to?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "I deliver to all Leeds postcodes including LS1-LS17, LS19-LS20, and surrounding areas. This covers Leeds City Centre, Headingley, Chapel Allerton, Roundhay, Moortown, Alwoodley, Harehills, Chapeltown, Meanwood, Woodhouse, Hyde Park, Burley, Kirkstall, Armley, Pudsey, Farsley, Calverley, Guiseley, Yeadon, Rawdon, and all Leeds districts.",
                },
              },
              {
                "@type": "Question",
                name: "How do I order cake delivery in Leeds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Ordering cake delivery in Leeds is easy. Contact me via phone, email, or the contact form on my website. Provide your Leeds address, preferred delivery date and time, and cake details. I'll confirm delivery availability and pricing for your Leeds postcode.",
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
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Cake Delivery Leeds", href: "/cake-delivery-leeds" },
              ]}
            />
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
              Same-Day Cake Delivery Leeds
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
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              Fresh Ukrainian cakes delivered straight to your door across Leeds. Same-day delivery available when ordered before 10am. Professional delivery service with careful handling to ensure your cake arrives in perfect condition.
            </Typography>
            <Chip
              label="5★ Rated Delivery Service | 127+ Reviews"
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

          {/* Delivery Features */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Same-Day Delivery",
                description:
                  "Order before 10am for same-day delivery across Leeds. Perfect for last-minute celebrations and surprise parties.",
                icon: "⚡",
                highlight: "Order by 10am",
              },
              {
                title: "All Leeds Postcodes",
                description:
                  "I deliver to all Leeds areas including LS1-LS17, LS19-LS20, and surrounding districts. From City Centre to outer suburbs.",
                icon: "📍",
                highlight: "All Areas Covered",
              },
              {
                title: "Fresh & Safe",
                description:
                  "Every cake is carefully packaged and delivered fresh on your celebration day. Professional handling ensures perfect condition.",
                icon: "🎂",
                highlight: "Guaranteed Fresh",
              },
              {
                title: "Flexible Timing",
                description:
                  "Choose your preferred delivery time slot. Weekend deliveries available. Flexible scheduling to fit your celebration.",
                icon: "⏰",
                highlight: "Choose Your Time",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    height: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {feature.icon}
                  </Typography>
                  <Chip
                    label={feature.highlight}
                    sx={{
                      backgroundColor: "primary.main",
                      color: "white",
                      fontSize: "0.75rem",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h4"
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

          {/* Delivery Zones & Pricing */}
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
              Cake Delivery Zones & Pricing in Leeds
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              I deliver fresh Ukrainian cakes across all Leeds postcodes. Delivery fees are based on your location within Leeds, ensuring fair pricing for everyone. Same-day delivery is available in all zones when ordered before 10am.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  zone: "Zone 1 - Leeds City Centre",
                  fee: "£5",
                  postcodes: "LS1, LS2, LS3, LS4",
                  areas: "City Centre, Headingley, Chapel Allerton, Hyde Park",
                  deliveryTime: "Same-day available",
                },
                {
                  zone: "Zone 2 - Leeds Suburbs",
                  fee: "£8",
                  postcodes: "LS5, LS6, LS7, LS8, LS17",
                  areas: "Roundhay, Moortown, Alwoodley, Harehills, Meanwood",
                  deliveryTime: "Same-day available",
                },
                {
                  zone: "Zone 3 - Leeds Outskirts",
                  fee: "£12",
                  postcodes: "LS12, LS13, LS18, LS19, LS20",
                  areas: "Pudsey, Farsley, Calverley, Guiseley, Yeadon, Rawdon",
                  deliveryTime: "Next-day standard",
                },
                {
                  zone: "Zone 4 - Extended Leeds",
                  fee: "£15",
                  postcodes: "LS26, LS27, LS28, LS29",
                  areas: "Rothwell, Garforth, Wetherby, Otley",
                  deliveryTime: "Next-day standard",
                },
              ].map((zone, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      backgroundColor: index === 0 ? "rgba(46, 49, 146, 0.05)" : "rgba(255, 255, 255, 0.9)",
                      borderRadius: 2,
                      border: index === 0 ? "2px solid" : "1px solid",
                      borderColor: index === 0 ? "primary.main" : "divider",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}
                    >
                      {zone.zone}
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ mb: 2, fontWeight: 700 }}>
                      {zone.fee}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                      {zone.postcodes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {zone.areas}
                    </Typography>
                    <Chip
                      label={zone.deliveryTime}
                      size="small"
                      sx={{
                        backgroundColor: index === 0 ? "primary.main" : "secondary.main",
                        color: index === 0 ? "white" : "primary.main",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Why Choose Our Delivery Service */}
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
              Why Choose Our Cake Delivery Service in Leeds?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Local Leeds Bakery",
                  description:
                    "I'm a local Leeds bakery, so I know the city well. I understand Leeds postcodes, traffic patterns, and the best routes to get your cake to you fresh and on time.",
                },
                {
                  title: "Personal Service",
                  description:
                    "Unlike large delivery companies, I personally handle every delivery. I'll contact you before delivery to confirm timing and make sure someone is available to receive your cake.",
                },
                {
                  title: "Specialized Cake Handling",
                  description:
                    "I understand how to transport cakes safely. Special packaging and careful handling ensure your decorated cake arrives in perfect condition, ready for your celebration.",
                },
                {
                  title: "Flexible & Reliable",
                  description:
                    "I work around your schedule, not mine. Weekend deliveries, early morning deliveries, and evening deliveries are all possible. You tell me what works for your celebration.",
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
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {benefit.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Delivery Process */}
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
              How Cake Delivery Works in Leeds
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Place Your Order",
                  description:
                    "Contact me with your Leeds address, preferred delivery date, and cake details. I'll confirm delivery availability and provide pricing for your Leeds postcode.",
                },
                {
                  step: "2",
                  title: "Order Confirmation",
                  description:
                    "I'll confirm your order details, delivery address, date, and preferred time slot. For same-day delivery, orders must be placed before 10am.",
                },
                {
                  step: "3",
                  title: "Cake Preparation",
                  description:
                    "Your cake is freshly baked and carefully packaged for safe delivery. I use specialized packaging to ensure your cake stays perfect during transport.",
                },
                {
                  step: "4",
                  title: "Delivery Day",
                  description:
                    "On delivery day, I'll contact you to confirm timing. I personally deliver your cake, ensuring it arrives fresh and in perfect condition at your Leeds address.",
                },
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {step.step}
                    </Box>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Call to Action */}
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
              Ready to Order Cake Delivery in Leeds?
            </Typography>
            <Typography variant="h4" component="h3" sx={{ mb: 4, color: "text.secondary" }}>
              Contact me today to check delivery availability for your Leeds postcode
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}>
                Order Cake Delivery Now
              </Button>
            </Link>
              <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}>
                Browse Our Cakes
              </Button>
            </Link>
              <Link href="/delivery-areas" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}>
                View All Delivery Areas
              </Button>
            </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}


