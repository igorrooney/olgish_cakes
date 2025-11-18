import { createPriceData } from "@/lib/utils/price-formatting";
import { Box, Button, Chip, Container, Grid, Paper, Typography } from "@mui/material";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import CakeCard from "../components/CakeCard";
import { getAllCakes } from "../utils/fetchCakes";
import { getPriceValidUntil } from "../utils/seo";

export const metadata: Metadata = {
  title: "Traditional Ukrainian Cakes Leeds",
  description:
    "Discover real traditional Ukrainian cakes in Leeds. Handcrafted honey cake, Kyiv cake, Napoleon, and more using traditional Ukrainian recipes. Order real Ukrainian desserts.",
  keywords:
    "traditional Ukrainian cakes Leeds, real Ukrainian desserts, honey cake Leeds, Kyiv cake Leeds, Ukrainian honey cake, traditional Ukrainian baking, Ukrainian cake recipes, real Ukrainian sweets",
  openGraph: {
    title: "Traditional Ukrainian Cakes Leeds",
    description:
      "Discover real traditional Ukrainian cakes in Leeds. Handcrafted honey cake, Kyiv cake, Napoleon, and more using traditional Ukrainian recipes.",
    url: "https://olgishcakes.co.uk/traditional-ukrainian-cakes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/traditional-ukrainian-cakes.jpg",
        width: 1200,
        height: 630,
        alt: "Traditional Ukrainian Cakes Collection - Olgish Cakes Leeds",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traditional Ukrainian Cakes Leeds",
    description:
      "Discover real traditional Ukrainian cakes in Leeds. Handcrafted honey cake, Kyiv cake, Napoleon, and more using traditional Ukrainian recipes.",
    images: ["https://olgishcakes.co.uk/images/traditional-ukrainian-cakes.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/traditional-ukrainian-cakes",
  },
};

export default async function TraditionalUkrainianCakesPage() {
  const allCakes = await getAllCakes();
  const traditionalCakes = allCakes.filter(cake => cake.category === "traditional");

  const traditionalCakeTypes = [
    createPriceData(25, "From"),
    createPriceData(30, "From"),
    createPriceData(28, "From"),
    createPriceData(20, "From"),
  ].map((priceData, index) => {
    const baseData = [
      {
        name: "Medovik (Honey Cake)",
        description:
          "The most beloved Ukrainian cake with delicate honey-infused layers and smooth traditional Ukrainian sour cream filling",
      },
      {
        name: "Kyiv Cake",
        description:
          "Legendary cake with crispy meringue layers, hazelnuts, and rich chocolate-buttercream frosting",
      },
      {
        name: "Napoleon Cake",
        description:
          "Ukrainian version with multiple layers of flaky puff pastry and rich vanilla custard cream",
      },
      {
        name: "Poppy Seed Roll (Makivnyk)",
        description:
          "Traditional Ukrainian poppy seed roll with soft yeast dough and sweetened poppy seed filling",
      },
    ][index]
    return {
      ...baseData,
      price: priceData.displayPrice,
      numericPrice: priceData.numericPrice,
    }
  })

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Traditional Ukrainian Cakes",
    description:
      "Discover real traditional Ukrainian cakes in Leeds. Handcrafted honey cake, Kyiv cake, Napoleon, and more using traditional Ukrainian recipes.",
    url: "https://olgishcakes.co.uk/traditional-ukrainian-cakes",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
      },
    },
    itemListElement: traditionalCakeTypes.map((cake, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: cake.name,
        description: cake.description,
        image: "https://olgishcakes.co.uk/images/placeholder-cake.jpg",
        category: "Traditional Ukrainian Cake",
        brand: {
          "@type": "Brand",
          name: "Olgish Cakes",
        },
        offers: {
          "@type": "Offer",
          price: cake.numericPrice,
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          priceValidUntil: getPriceValidUntil(30),
          seller: {
            "@type": "Organization",
            name: "Olgish Cakes",
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
        },
      },
    })),
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
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Traditional Ukrainian Cakes", href: "/traditional-ukrainian-cakes" },
              ]}
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
              Traditional Ukrainian Cakes
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
              Discover the real taste of Ukraine with my handcrafted traditional cakes. Each recipe has been
              passed down through generations, bringing the warmth and traditional traditions of Ukrainian
              baking to Leeds.
            </Typography>
            <Chip
              label="Real Ukrainian Recipes"
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

          {/* Traditional Cake Features */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Traditional Recipes",
                description:
                  "Each cake follows real Ukrainian recipes passed down through generations",
                icon: "🏺",
              },
              {
                title: "Premium Ingredients",
                description:
                  "I use only the finest ingredients, including traditional Ukrainian honey and poppy seeds",
                icon: "🌟",
              },
              {
                title: "Handcrafted with Love",
                description:
                  "Every cake is meticulously crafted by Ukrainian baker Olga",
                icon: "💝",
              },
              {
                title: "Traditional Techniques",
                description:
                  "Traditional Ukrainian baking methods make sure the real taste and texture",
                icon: "👩‍🍳",
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

          {/* Traditional Cakes Grid */}
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
              My traditional Ukrainian Collection
            </Typography>

            {traditionalCakes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h3" component="h3" color="text.secondary" sx={{ mb: 2 }}>
                  My traditional Ukrainian Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  I am currently preparing my traditional Ukrainian cake collection. Please check back soon
                  for real Ukrainian desserts!
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

          {/* Ukrainian Traditions Section */}
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
              Traditional Ukrainian Baking Traditions
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              Ukrainian baking traditions date back centuries, with each region of Ukraine having its
              own unique recipes and techniques. My traditional cakes represent the heart of Ukrainian
              culinary heritage, bringing together the finest ingredients and traditional methods.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              From the delicate layers of honey cake to the rich flavors of Kyiv cake, each traditional
              Ukrainian dessert tells a story of family, celebration, and the warmth of Ukrainian
              hospitality. These recipes have been cherished and preserved through generations,
              making sure the real taste of Ukraine continues to delight people around the world.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              At Olgish Cakes, I honor these traditions by using real Ukrainian recipes and
              techniques, bringing the real taste of Ukrainian baking to my community in Leeds. Every
              cake is crafted with the same love and attention to detail that Ukrainian bakers have
              practiced for generations.
            </Typography>
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
              Taste Real Ukrainian Flavors
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Order your traditional Ukrainian cake today and taste the authentic flavours that have been cherished
              for generations. Perfect for celebrations, special occasions, or simply to experience
              the warmth of Ukrainian hospitality.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
                <Button variant="contained"
                  color="primary"
                  size="large"
                  sx={{ px: 4, py: 1.5 }}>
                  Order traditional Cake
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
