import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { getPriceValidUntil } from "../utils/seo";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Gift Cards | Ukrainian Cake Gift Cards",
  description:
    "Give the gift of authentic Ukrainian cakes with our gift cards. Perfect for birthdays, weddings, holidays, and special occasions. Redeemable for any Ukrainian cake or custom cake design in Leeds.",
  keywords:
    "gift cards, Ukrainian cake gift cards, cake vouchers Leeds, birthday gift cards, wedding gift cards, cake delivery gift cards, Ukrainian bakery gift cards",
  openGraph: {
    title: "Gift Cards | Ukrainian Cake Gift Cards",
    description:
      "Give the gift of authentic Ukrainian cakes with our gift cards. Perfect for birthdays, weddings, holidays, and special occasions. Redeemable for any Ukrainian cake or custom cake design in Leeds.",
    url: "https://olgishcakes.co.uk/gift-cards",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/gift-cards.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Cake Gift Cards - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gift Cards | Ukrainian Cake Gift Cards",
    description:
      "Give the gift of authentic Ukrainian cakes with our gift cards. Perfect for birthdays, weddings, holidays, and special occasions.",
    images: ["https://olgishcakes.co.uk/images/gift-cards.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/gift-cards",
  },
};

const giftCardOptions = [
  {
    value: 25,
    title: "Small Treat",
    description: "Perfect for a small Ukrainian cake or selection of mini cakes",
    image: "/images/gift-cards/small-treat.jpg",
  },
  {
    value: 50,
    title: "Celebration Cake",
    description: "Ideal for a medium-sized Ukrainian cake for special occasions",
    image: "/images/gift-cards/celebration-cake.jpg",
  },
  {
    value: 75,
    title: "Premium Cake",
    description: "Perfect for a large Ukrainian cake or custom cake design",
    image: "/images/gift-cards/premium-cake.jpg",
  },
  {
    value: 100,
    title: "Luxury Experience",
    description: "Ultimate Ukrainian cake experience with custom design and delivery",
    image: "/images/gift-cards/luxury-experience.jpg",
  },
];

export default function GiftCardsPage() {
  return (
    <>
      <Script
        id="gift-cards-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Ukrainian Cake Gift Cards",
            description:
              "Give the gift of authentic Ukrainian cakes with our gift cards. Perfect for birthdays, weddings, holidays, and special occasions. Redeemable for any Ukrainian cake or custom cake design in Leeds.",
            brand: {
              "@type": "Brand",
              name: "Olgish Cakes",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5",
              reviewCount: "127",
              bestRating: "5",
              worstRating: "1",
            },
            offers: {
              "@type": "Offer",
              price: "25.00",
              priceCurrency: "GBP",
              availability: "https://schema.org/InStock",
              priceValidUntil: getPriceValidUntil(30),
              seller: {
                "@type": "Bakery",
                name: "Olgish Cakes",
                url: "https://olgishcakes.co.uk",
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
            category: "Gift Cards",
            image: "https://olgishcakes.co.uk/images/gift-cards.jpg",
            url: "https://olgishcakes.co.uk/gift-cards",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gift Cards" }]} />
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
              Ukrainian Cake Gift Cards
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
              Give the gift of authentic Ukrainian cakes. Perfect for birthdays, weddings, holidays,
              and special occasions. Our gift cards are redeemable for any Ukrainian cake or custom
              cake design, bringing the taste of Ukraine to your loved ones.
            </Typography>
            <Chip
              label="The Perfect Gift for Cake Lovers"
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

          {/* Gift Card Benefits */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Why Choose Our Gift Cards?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Flexible Redemption",
                  description:
                    "Redeemable for any Ukrainian cake, custom designs, or cake delivery service. No restrictions on cake selection.",
                  icon: "🎂",
                },
                {
                  title: "Personalized Experience",
                  description:
                    "Recipients can choose their preferred Ukrainian cake, size, and design. Perfect for personalizing their celebration.",
                  icon: "🎨",
                },
                {
                  title: "Convenient Delivery",
                  description:
                    "Gift cards can be delivered digitally or as physical cards. Recipients can schedule delivery at their convenience.",
                  icon: "📧",
                },
                {
                  title: "Long Validity",
                  description:
                    "Gift cards are valid for 12 months, giving recipients plenty of time to choose their perfect Ukrainian cake.",
                  icon: "⏰",
                },
              ].map((benefit, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      height: "100%",
                      borderRadius: 3,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      {benefit.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                      {benefit.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Gift Card Options */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Gift Card Options
            </Typography>
            <Grid container spacing={4}>
              {giftCardOptions.map((option, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${option.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <Box sx={{ p: 3 }}>
                      <Typography
                        variant="h4"
                        sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                      >
                        £{option.value}
                      </Typography>
                      <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                        {option.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mb: 3, color: "text.secondary", lineHeight: 1.5 }}
                      >
                        {option.description}
                      </Typography>
                      <Button
                        variant="contained"
                        component={Link}
                        href="/contact"
                        sx={{
                          backgroundColor: "primary.main",
                          width: "100%",
                          "&:hover": {
                            backgroundColor: "primary.dark",
                          },
                        }}
                      >
                        Purchase Gift Card
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Custom Gift Card Form */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 4, textAlign: "center", fontWeight: 600 }}>
                Custom Gift Card Amount
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, textAlign: "center", opacity: 0.9 }}>
                Choose your own amount for a personalized gift card. Perfect for specific cake
                orders or custom amounts.
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Gift Card Amount (£)"
                    type="number"
                    variant="outlined"
                    sx={{
                      backgroundColor: "white",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "transparent",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: "white" }}>Delivery Method</InputLabel>
                    <Select
                      sx={{
                        backgroundColor: "white",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "transparent",
                        },
                      }}
                    >
                      <MenuItem value="digital">Digital Gift Card (Email)</MenuItem>
                      <MenuItem value="physical">Physical Gift Card (Post)</MenuItem>
                      <MenuItem value="both">Both Digital & Physical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    component={Link}
                    href="/contact"
                    sx={{
                      backgroundColor: "white",
                      color: "primary.main",
                      px: 4,
                      py: 2,
                      fontSize: "1.1rem",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.9)",
                      },
                    }}
                  >
                    Order Custom Gift Card
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Perfect For Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Perfect For Every Occasion
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  occasion: "Birthdays",
                  description:
                    "Give the gift of a beautiful Ukrainian birthday cake. Let them choose their favorite flavor and design.",
                  icon: "🎂",
                },
                {
                  occasion: "Weddings",
                  description:
                    "Perfect wedding gift for couples who love authentic Ukrainian flavors. Custom wedding cake designs available.",
                  icon: "💒",
                },
                {
                  occasion: "Holidays",
                  description:
                    "Christmas, Easter, and other holidays. Traditional Ukrainian seasonal cakes and celebrations.",
                  icon: "🎄",
                },
                {
                  occasion: "Anniversaries",
                  description:
                    "Celebrate love with authentic Ukrainian cakes. Romantic designs and traditional flavors.",
                  icon: "💕",
                },
                {
                  occasion: "Housewarming",
                  description:
                    "Welcome new neighbors with the taste of Ukraine. Perfect for introducing Ukrainian culture.",
                  icon: "🏠",
                },
                {
                  occasion: "Thank You",
                  description:
                    "Show appreciation with authentic Ukrainian cakes. A thoughtful way to say thank you.",
                  icon: "🙏",
                },
              ].map((occasion, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      height: "100%",
                      borderRadius: 3,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                      },
                    }}
                  >
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      {occasion.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {occasion.occasion}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                      {occasion.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* How It Works */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              How Gift Cards Work
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Purchase Gift Card",
                  description:
                    "Choose your gift card amount and delivery method. We'll process your order and send the gift card.",
                },
                {
                  step: "2",
                  title: "Recipient Receives Card",
                  description:
                    "The recipient receives their gift card via email or post, with instructions on how to redeem it.",
                },
                {
                  step: "3",
                  title: "Choose Ukrainian Cake",
                  description:
                    "Recipient can browse our Ukrainian cake collection and choose their preferred cake and design.",
                },
                {
                  step: "4",
                  title: "Enjoy Authentic Ukrainian Cake",
                  description:
                    "We'll deliver the chosen Ukrainian cake to their doorstep, bringing the taste of Ukraine to their celebration.",
                },
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      height: "100%",
                      borderRadius: 3,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        fontSize: "1.5rem",
                        fontWeight: 600,
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
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                      {step.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Terms and Conditions */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
              }}
            >
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}>
                Gift Card Terms & Conditions
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                • Gift cards are valid for 12 months from the date of purchase
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                • Redeemable for any Ukrainian cake, custom designs, or delivery service
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                • Cannot be exchanged for cash or refunded
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                • Delivery charges may apply depending on location
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                • Gift cards are non-transferable and should be kept secure
              </Typography>
            </Paper>
          </Box>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
              Give the Gift of Ukrainian Tradition
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Share the authentic taste of Ukraine with your loved ones. Our gift cards make it easy
              to give the perfect gift for any occasion, allowing recipients to choose their ideal
              Ukrainian cake.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                component={Link}
                href="/contact"
                sx={{
                  backgroundColor: "primary.main",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Purchase Gift Card
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/cakes"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                View Cake Collection
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
