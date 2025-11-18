import { Box, Button, Chip, Container, Grid, Paper, Typography } from "@mui/material";
import type { Metadata } from "next";
import Link from "next/link";
import { AreasWeCover } from "../components/AreasWeCover";
import { Breadcrumbs } from "../components/Breadcrumbs";
import CakeCard from "../components/CakeCard";
import { getAllCakes } from "../utils/fetchCakes";
import { getPriceValidUntil } from "../utils/seo";

export const metadata: Metadata = {
  title:
    "Ukrainian Bakery Leeds | Authentic Ukrainian Cakes",
  description:
    "Real Ukrainian bakery in Leeds. Traditional Ukrainian cakes, honey cake (Medovik), Kyiv cake, and more. Handcrafted by Ukrainian baker Olga using real recipes and techniques.",
  keywords:
    "Ukrainian bakery Leeds, Ukrainian cakes Leeds, authentic Ukrainian desserts, traditional Ukrainian baking, Ukrainian baker Leeds, honey cake Leeds, Medovik Leeds, Kyiv cake Leeds, Ukrainian sweets Leeds, traditional medovik",
  openGraph: {
    title:
      "Ukrainian Bakery Leeds | Authentic Ukrainian Cakes",
    description:
      "Real Ukrainian bakery in Leeds. Traditional Ukrainian cakes, honey cake (Medovik), Kyiv cake, and more. Handcrafted by Ukrainian baker Olga using real recipes and techniques.",
    url: "https://olgishcakes.co.uk/ukrainian-bakery-leeds",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/ukrainian-bakery-leeds.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Bakery Leeds - Authentic Ukrainian Cakes - Honey Cake (Medovik) by Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Ukrainian Bakery Leeds | Authentic Ukrainian Cakes",
    description:
      "Real Ukrainian bakery in Leeds. Traditional Ukrainian cakes, honey cake (Medovik), Kyiv cake, and more. Handcrafted by Ukrainian baker Olga using real recipes and techniques.",
    images: ["https://olgishcakes.co.uk/images/ukrainian-bakery-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/ukrainian-bakery-leeds",
  },
};

export default async function UkrainianBakeryLeedsPage() {
  const allCakes = await getAllCakes();
  const traditionalCakes = allCakes.filter(cake => cake.category === "traditional");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Olgish Cakes - Ukrainian Bakery Leeds",
    description:
      "Authentic Ukrainian bakery in Leeds. Traditional Ukrainian cakes, honey cake (Medovik), Kyiv cake, and more. Handcrafted by Ukrainian baker Olga using authentic recipes and techniques.",
    url: "https://olgishcakes.co.uk/ukrainian-bakery-leeds",
    logo: {
      "@type": "ImageObject",
      url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Allerton Grange",
      addressLocality: "Leeds",
      postalCode: "LS17",
      addressCountry: "GB",
    },
    telephone: "+44 786 721 8194",
    email: "hello@olgishcakes.co.uk",
    openingHours: "Mo-Su 00:00-23:59",
    servesCuisine: "Ukrainian",
    priceRange: "££",
    hasMenu: {
      "@type": "Menu",
      name: "Ukrainian Cakes Menu",
      hasMenuSection: [
        {
          "@type": "MenuSection",
          name: "Traditional Ukrainian Cakes",
          hasMenuItem: [
            {
              "@type": "MenuItem",
              name: "Medovik (Honey Cake)",
              description:
                "Traditional Ukrainian honey cake with delicate layers and sour cream filling",
              offers: {
                "@type": "Offer",
                price: 25,
                priceCurrency: "GBP",
                priceValidUntil: getPriceValidUntil(30),
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
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  applicableCountry: "GB",
                  returnFees: "https://schema.org/FreeReturn",
                  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                  merchantReturnDays: 14,
                  returnMethod: "https://schema.org/ReturnByMail",
                },
              },
            },
            {
              "@type": "MenuItem",
              name: "Kyiv Cake",
              description:
                "Legendary Ukrainian cake with meringue layers and chocolate-buttercream",
              offers: {
                "@type": "Offer",
                price: 30,
                priceCurrency: "GBP",
                priceValidUntil: getPriceValidUntil(30),
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
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  applicableCountry: "GB",
                  returnFees: "https://schema.org/FreeReturn",
                  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                  merchantReturnDays: 14,
                  returnMethod: "https://schema.org/ReturnByMail",
                },
              },
            },
          ],
        },
      ],
    },
    founder: {
      "@type": "Person",
      name: "Olga",
      jobTitle: "Ukrainian Baker",
      description:
        "Professional Ukrainian baker bringing authentic recipes and techniques from Ukraine",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you deliver across Leeds?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, I deliver across Leeds and around towns. See my delivery areas." }
      },
      {
        "@type": "Question",
        name: "What is your most popular cake?",
        acceptedAnswer: { "@type": "Answer", text: "Our authentic Ukrainian honey cake (Medovik) is the bestseller." }
      },
      {
        "@type": "Question",
        name: "Can I order a custom cake?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. I create custom birthday and wedding cakes with Ukrainian flavours." }
      }
    ]
  } as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
              items={[{ label: "Home", href: "/" }, { label: "Ukrainian Bakery Leeds" }]}
            />
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
              Ukrainian Bakery Leeds
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
              Welcome to the only real Ukrainian bakery in Leeds. Founded by professional
              Ukrainian baker Olga, I bring the real taste of Ukraine to our local community
              with traditional recipes and techniques.
            </Typography>
            <Chip
              label="Authentic Ukrainian Baking"
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

          {/* Ukrainian Bakery Features */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Ukrainian Baker",
                description:
                  "Professional Ukrainian baker Olga brings real recipes and techniques from Ukraine",
                icon: "👩‍🍳",
              },
              {
                title: "Traditional Recipes",
                description: "Real Ukrainian cake recipes passed down through generations",
                icon: "📜",
              },
              {
                title: "Ukrainian Ingredients",
                description:
                  "Traditional Ukrainian ingredients including honey, poppy seeds, and sour cream",
                icon: "🇺🇦",
              },
              {
                title: "Cultural Heritage",
                description:
                  "Keeping Ukrainian baking traditions and sharing them with the Leeds community",
                icon: "🏛️",
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
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {feature.icon}
                  </Typography>
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

          {/* Traditional Ukrainian Cakes */}
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
              Traditional Ukrainian Cakes
            </Typography>

            {traditionalCakes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h3" component="h3" color="text.secondary" sx={{ mb: 2 }}>
                  Authentic Ukrainian Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Our traditional Ukrainian cake collection features authentic recipes from Ukraine.
                  Contact us to learn more about our Ukrainian desserts.
                </Typography>
                <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                  color="primary"
                  size="large">
                  View All Cakes
                </Button>
            </Link>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {traditionalCakes.map(cake => (
                  <Grid item xs={12} sm={6} md={4} key={cake._id}>
                    <CakeCard cake={cake} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Ukrainian Baking Traditions */}
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
              Ukrainian Baking Traditions
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Ukrainian baking has rich history dating back centuries, with each region of Ukraine
              having its own unique recipes and techniques. My bakery honors these traditions by
              using real Ukrainian recipes and methods passed down through generations.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Honey Cake",
                  description:
                    "A traditional Ukrainian honey cake with delicate layers and rich honey flavor, often served at celebrations and special occasions.",
                },
                {
                  title: "Kyiv Cake",
                  description:
                    "The legendary Kyiv cake features crispy meringue layers with hazelnuts and rich chocolate-buttercream frosting.",
                },
                {
                  title: "Napoleon Cake",
                  description:
                    "Ukrainian version of the classic Napoleon with multiple layers of flaky puff pastry and vanilla custard cream.",
                },
                {
                  title: "Poppy Seed Roll",
                  description:
                    "Traditional Makivnyk with soft yeast dough filled with sweetened poppy seed filling, a staple in Ukrainian celebrations.",
                },
              ].map((tradition, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {tradition.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tradition.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <AreasWeCover subtitle="Proudly serving Leeds and around Yorkshire towns with real Ukrainian cakes." />

          {/* Meet Our Ukrainian Baker */}
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
              Meet Our Ukrainian Baker
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  <strong>Olga Ieromenko</strong> is my professional Ukrainian baker who brings
                  real Ukrainian baking traditions to Leeds. Trained in traditional Ukrainian
                  baking techniques, Olga moved to Leeds in 2022 and founded Olgish Cakes to share
                  the real taste of Ukraine with our local community.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  With years of experience in Ukrainian baking, Olga specializes in traditional
                  Ukrainian cakes like honey cake, Kyiv cake, and other real Ukrainian
                  desserts. Her passion for keeping Ukrainian culinary heritage drives every cake
                  she creates.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  At Olgish Cakes, I'm proud to be the only real Ukrainian bakery in Leeds,
                  bringing the warmth and tradition of Ukrainian hospitality to my customers
                  through every delicious creation.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    backgroundColor: "primary.light",
                    borderRadius: 3,
                    p: 4,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ mb: 2, color: "white", fontWeight: 600 }}
                  >
                    Ukrainian Baking Expertise
                  </Typography>
                  <Typography variant="body1" sx={{ color: "white", mb: 3 }}>
                    • Traditional Ukrainian recipes
                    <br />
                    • Professional baking training
                    <br />
                    • Authentic Ukrainian techniques
                    <br />• Cultural heritage preservation
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Ukrainian Community */}
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
              Supporting the Ukrainian Community in Leeds
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              As a Ukrainian-owned business in Leeds, I'm proud to support and celebrate the
              Ukrainian community. My bakery serves as a cultural bridge, introducing real
              Ukrainian flavors to our diverse Leeds community while providing a taste of home for
              Ukrainian residents.
            </Typography>
            <Grid container spacing={3}>
              {[
                "Authentic Ukrainian flavors for the Ukrainian community",
                "Cultural exchange through traditional baking",
                "Supporting Ukrainian-owned businesses in Leeds",
                "Preserving Ukrainian culinary heritage",
                "Building community connections through food",
                "Celebrating Ukrainian traditions and celebrations",
              ].map((benefit, index) => (
                <Grid item xs={12} sm={6} key={index}>
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
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "var(--font-alice)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Experience Authentic Ukrainian Baking
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Taste the authentic flavours of Ukraine right here in Leeds. Order your traditional
              Ukrainian cake today and experience the warmth of Ukrainian hospitality.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}>
                Order Ukrainian Cake
              </Button>
            </Link>
              <Link href="/about" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}>
                Learn More About Us
              </Button>
            </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
