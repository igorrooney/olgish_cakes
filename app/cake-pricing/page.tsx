import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cake Pricing Guide | Ukrainian Cake Prices",
  description:
    "Complete cake pricing guide for Ukrainian cakes. Transparent pricing structure, custom cake costs, and value information. Fair pricing for real Ukrainian cakes in Leeds.",
  keywords:
    "cake pricing guide, Ukrainian cake prices, custom cake cost, cake prices Leeds, wedding cake pricing, birthday cake prices, cake pricing structure, transparent cake pricing",
  openGraph: {
    title: "Cake Pricing Guide | Ukrainian Cake Prices",
    description:
      "Complete cake pricing guide for Ukrainian cakes. Transparent pricing structure, custom cake costs, and value information. Fair pricing for real Ukrainian cakes in Leeds.",
    url: "https://olgishcakes.co.uk/cake-pricing",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cake-pricing.jpg",
        width: 1200,
        height: 630,
        alt: "Cake Pricing Guide - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Pricing Guide | Ukrainian Cake Prices",
    description:
      "Complete cake pricing guide for Ukrainian cakes. Transparent pricing structure, custom cake costs, and value information.",
    images: ["https://olgishcakes.co.uk/images/cake-pricing.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-pricing",
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

export default function CakePricingPage() {
  const pricingData = {
    traditionalCakes: [
      { name: "Medovik (Honey Cake)", size: "6-inch", price: "£25", serves: "8-10 people" },
      { name: "Medovik (Honey Cake)", size: "8-inch", price: "£35", serves: "12-15 people" },
      { name: "Medovik (Honey Cake)", size: "10-inch", price: "£45", serves: "20-25 people" },
      { name: "Kyiv Cake", size: "6-inch", price: "£30", serves: "8-10 people" },
      { name: "Kyiv Cake", size: "8-inch", price: "£40", serves: "12-15 people" },
      { name: "Kyiv Cake", size: "10-inch", price: "£50", serves: "20-25 people" },
    ],
    customCakes: [
      { type: "Wedding Cakes", startingPrice: "£80", description: "Multi-tier designs" },
      { type: "Birthday Cakes", startingPrice: "£35", description: "Custom designs" },
      { type: "Celebration Cakes", startingPrice: "£45", description: "Special occasions" },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Ukrainian Cake Pricing Guide",
    description:
            "Transparent pricing for real Ukrainian cakes. My pricing structure reflects the quality, craftsmanship, and cultural meaning of traditional Ukrainian baking.",
    url: "https://olgishcakes.co.uk/cake-pricing",
    provider: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
      },
    },
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Ukrainian Cake Pricing",
      itemListElement: [
        ...pricingData.traditionalCakes.map(cake => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: cake.name,
            description: `${cake.name} - ${cake.size} size, serves ${cake.serves}`,
            category: "Ukrainian Cake",
            brand: {
              "@type": "Brand",
              name: "Olgish Cakes",
            },
          },
          price: cake.price,
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "GB",
            returnFees: "https://schema.org/FreeReturn",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
            returnMethod: "https://schema.org/ReturnByMail",
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: 0,
              currency: "GBP",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "GB",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 0,
                maxValue: 1,
                unitCode: "DAY",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 3,
                unitCode: "DAY",
              },
            },
            appliesToDeliveryMethod: "https://purl.org/goodrelations/v1#DeliveryModeMail",
          },
        })),
        ...pricingData.customCakes.map(cake => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: cake.type,
            description: cake.description,
            category: "Custom Cake Design",
            provider: {
              "@type": "Organization",
              name: "Olgish Cakes",
            },
          },
          price: cake.startingPrice,
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "GB",
            returnFees: "https://schema.org/FreeReturn",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
            returnMethod: "https://schema.org/ReturnByMail",
          },
        })),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cake Pricing" }]} />
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
              Cake Pricing Guide
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
              Transparent cake pricing for all my Ukrainian cakes. From traditional honey cake to
              custom designs, I offer competitive prices for quality ingredients and expert
              craftsmanship.
            </Typography>
            <Chip
              label="Transparent Pricing Structure"
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

          {/* Pricing Philosophy */}
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
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              My Pricing Philosophy
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              I believe in fair, transparent pricing that reflects the quality and cultural
              meaning of my Ukrainian cakes. Every price includes the finest ingredients,
              traditional techniques, and personal craftsmanship.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  principle: "Quality Ingredients",
                  icon: "🌟",
                  description:
                    "I use only the finest ingredients, including traditional Ukrainian honey, premium flour, and fresh dairy products",
                  impact: "Higher ingredient costs make sure real taste and quality",
                },
                {
                  principle: "Traditional Techniques",
                  icon: "👩‍🍳",
                  description:
                    "Each cake is handcrafted using traditional Ukrainian baking methods passed down through generations",
                  impact: "Time-intensive traditional methods require skilled craftsmanship",
                },
                {
                  principle: "Cultural Meaning",
                  icon: "🇺🇦",
                  description:
                    "My cakes keep Ukrainian cultural heritage and traditional recipes",
                  impact: "Cultural meaning and real taste add unique value",
                },
                {
                  principle: "Personal Service",
                  icon: "💝",
                  description:
                    "Every order includes personal consultation, custom design, and attentive service",
                  impact: "Personalized service ensures your perfect cake experience",
                },
              ].map((principle, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Typography variant="h2" sx={{ fontSize: "2.5rem", mb: 2 }}>
                        {principle.icon}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {principle.principle}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {principle.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {principle.impact}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Pricing by Size */}
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
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Pricing by Size
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              My pricing is based on cake size and complexity. Larger cakes offer better value per
              serving, while smaller cakes are perfect for intimate celebrations.
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Cake Size
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Serves
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Standard Design
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Individual Design
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Best For
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      size: "6 inch",
                      serves: "8-12 people",
                      standard: "From £35",
                      individual: "From £45",
                      bestFor: "Small family celebrations",
                    },
                    {
                      size: "8 inch",
                      serves: "15-20 people",
                      standard: "From £45",
                      individual: "From £55",
                      bestFor: "Medium parties",
                    },
                    {
                      size: "10 inch",
                      serves: "25-30 people",
                      standard: "From £60",
                      individual: "From £75",
                      bestFor: "Large family gatherings",
                    },
                    {
                      size: "12 inch",
                      serves: "35-40 people",
                      standard: "From £80",
                      individual: "From £100",
                      bestFor: "Big celebrations",
                    },
                    {
                      size: "14 inch",
                      serves: "45-55 people",
                      standard: "From £110",
                      individual: "From £140",
                      bestFor: "Very large parties",
                    },
                    {
                      size: "16 inch",
                      serves: "60-70 people",
                      standard: "From £150",
                      individual: "From £190",
                      bestFor: "Weddings & major events",
                    },
                  ].map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:nth-of-type(odd)": { backgroundColor: "rgba(0,0,0,.02)" } }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                        {row.size}
                      </TableCell>
                      <TableCell>{row.serves}</TableCell>
                      <TableCell>{row.standard}</TableCell>
                      <TableCell>{row.individual}</TableCell>
                      <TableCell>{row.bestFor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Pricing Factors */}
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
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Factors That Affect Pricing
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  factor: "Cake Size",
                  icon: "📏",
                  description:
                    "Larger cakes require more ingredients and longer baking time, but offer better value per serving",
                  impact: "Larger cakes = higher total cost but lower cost per serving",
                },
                {
                  factor: "Design Complexity",
                  icon: "🎨",
                  description:
                    "Complex designs, custom decorations, and intricate patterns require more time and skill",
                  impact: "Complex designs add £10-50 to the base price",
                },
                {
                  factor: "Ingredients",
                  icon: "🥛",
                  description:
                    "Premium ingredients, dietary requirements, and special flavors may affect pricing",
                  impact: "Premium ingredients may add £5-20 to the price",
                },
                {
                  factor: "Delivery & Setup",
                  icon: "🚚",
                  description:
                    "Delivery distance, setup requirements, and special handling affect delivery costs",
                  impact: "Delivery costs range from £5-25 depending on location",
                },
                {
                  factor: "Urgency",
                  icon: "⏰",
                  description: "Rush orders and last-minute requests may incur additional charges",
                  impact: "Rush orders may add 10-20% to the total price",
                },
                {
                  factor: "Special Requirements",
                  icon: "🎯",
                  description:
                    "Dietary restrictions, special equipment, or unique requirements may affect pricing",
                  impact: "Special requirements may add £5-30 to the price",
                },
              ].map((factor, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Typography variant="h2" sx={{ fontSize: "2.5rem", mb: 2 }}>
                        {factor.icon}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                      >
                        {factor.factor}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {factor.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {factor.impact}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Value Proposition */}
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
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Why Choose My Ukrainian Cakes?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  benefit: "Real Ukrainian Taste",
                  icon: "🇺🇦",
                  description:
                    "Traditional recipes and techniques make sure real Ukrainian flavors that you can't find elsewhere",
                  value: "Unique cultural experience",
                },
                {
                  benefit: "Premium Quality",
                  icon: "🌟",
                  description:
                    "Only the finest ingredients and traditional methods create exceptional taste and quality",
                  value: "Superior taste and texture",
                },
                {
                  benefit: "Personal Service",
                  icon: "💝",
                  description:
                    "Personal consultation, custom design, and attentive service throughout your order",
                  value: "Personalized experience",
                },
                {
                  benefit: "Cultural Heritage",
                  icon: "🏛️",
                  description: "Support Ukrainian culture and keep traditional baking heritage",
                  value: "Cultural significance",
                },
                {
                  benefit: "Fresh & Local",
                  icon: "🏠",
                  description:
                    "Freshly baked in Leeds using local ingredients and traditional Ukrainian recipes",
                  value: "Fresh, local, authentic",
                },
                {
                  benefit: "Memorable Experience",
                  icon: "🎉",
                  description:
                    "Create unforgettable memories with unique Ukrainian cakes for your special occasions",
                  value: "Lasting memories",
                },
              ].map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: "2.5rem" }}>
                      {benefit.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {benefit.benefit}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {benefit.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {benefit.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Payment Options */}
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
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Payment Options
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  method: "Bank Transfer",
                  icon: "🏦",
                  description: "Secure bank transfer for deposits and final payments",
                  advantages: ["No fees", "Secure", "Immediate confirmation"],
                },
                {
                  method: "Cash Payment",
                  icon: "💵",
                  description: "Cash payment accepted for deposits and final payments",
                  advantages: ["No fees", "Immediate", "Personal service"],
                },
                {
                  method: "Card Payment",
                  icon: "💳",
                  description: "Card payment available for convenience",
                  advantages: ["Convenient", "Secure", "Digital record"],
                },
                {
                  method: "Payment Plans",
                  icon: "📅",
                  description: "Flexible payment plans available for larger orders",
                  advantages: ["Spread cost", "Flexible", "No interest"],
                },
              ].map((payment, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="h2" sx={{ fontSize: "2.5rem", mb: 2 }}>
                      {payment.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {payment.method}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {payment.description}
                    </Typography>
                    <Box>
                      {payment.advantages.map((advantage, idx) => (
                        <Chip
                          key={idx}
                          label={advantage}
                          sx={{
                            m: 0.5,
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                            minHeight: "44px", // WCAG touch target requirement
                            padding: "8px 16px", // Ensure adequate padding
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
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
              Ready to Order Your Ukrainian Cake?
            </Typography>
            <Typography variant="h3" component="h3" sx={{ mb: 4, color: "text.secondary" }}>
              Contact me for a personalized quote and start your cake ordering journey
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
                Get a Quote
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View My Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
