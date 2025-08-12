import {
  CakeOutlinedIcon,
  CheckCircleIcon,
  LocalShippingIcon,
  PaymentIcon,
} from "@/lib/mui-optimization";
import { Alert, AlertTitle, Box, Card, Container, Grid, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { borderRadius, colors, shadows, typography } from "../../lib/design-system";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { QuoteForm } from "./QuoteForm";

// SEO Metadata
export const metadata: Metadata = {
  title: "Get Custom Cake Quote | Professional Ukrainian Cakes Leeds | Olgish Cakes",
  description:
    "Get a personal custom cake quote from Olga at Leeds' #1 Ukrainian bakery. Wedding cakes, birthday cakes, honey cake (Medovik) & traditional Ukrainian desserts. Free consultation & same-day delivery across Yorkshire.",
  keywords:
    "custom cake quote Leeds, wedding cake quote, birthday cake quote, Ukrainian cake pricing, honey cake quote, Medovik quote, cake consultation Leeds, professional cake design quote, Ukrainian bakery quote, cake delivery quote Yorkshire",
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
    canonical: "https://olgishcakes.co.uk/get-custom-quote",
  },
  openGraph: {
    title: "Get Custom Cake Quote | Professional Ukrainian Cakes Leeds | Olgish Cakes",
    description:
      "Get a personal custom cake quote from Olga at Leeds' #1 Ukrainian bakery. Wedding cakes, birthday cakes, honey cake (Medovik) & traditional Ukrainian desserts. Free consultation & same-day delivery.",
    url: "https://olgishcakes.co.uk/get-custom-quote",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/custom-cake-quote.jpg",
        width: 1200,
        height: 630,
        alt: "Professional Custom Cake Quote - Ukrainian Cakes Leeds - Olgish Cakes",
        type: "image/jpeg",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Custom Cake Quote | Professional Ukrainian Cakes Leeds | Olgish Cakes",
    description:
      "Get a personal custom cake quote from Olga at Leeds' #1 Ukrainian bakery. Wedding cakes, birthday cakes, honey cake (Medovik) & traditional Ukrainian desserts.",
    images: ["https://olgishcakes.co.uk/images/custom-cake-quote.jpg"],
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
    price_range: "££",
    cuisine: "Ukrainian",
    service_type: "Custom Cake Design & Consultation",
  },
};

// Structured Data for Quote Page
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Cake Quote Service",
  description:
    "Personal custom cake quote service from Olga for wedding cakes, birthday cakes, and traditional Ukrainian desserts including honey cake (Medovik) and Kyiv cake.",
  provider: {
    "@type": "Bakery",
    name: "Olgish Cakes",
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
  },
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
  serviceType: "Custom Cake Design & Consultation",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
    description: "Free consultation and quote for custom cakes",
    availability: "https://schema.org/InStock",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Custom Cake Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Wedding Cake Design",
          description: "Custom wedding cake design and consultation",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Birthday Cake Design",
          description: "Custom birthday cake design and consultation",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Traditional Ukrainian Cakes",
          description: "Honey cake (Medovik), Kyiv cake, and traditional Ukrainian desserts",
        },
      },
    ],
  },
};

// Main Page Component
export default function GetCustomQuotePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Box sx={{ minHeight: "100vh", backgroundColor: colors.background.default }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Get Custom Quote", href: "/get-custom-quote" },
            ]}
          />

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                fontWeight: typography.fontWeight.bold,
                color: colors.primary.main,
                mb: 3,
              }}
            >
              Get Your Professional Cake Quote
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                color: colors.text.secondary,
                mb: 4,
                maxWidth: "800px",
                lineHeight: 1.5,
                mx: "auto",
              }}
            >
              Transform your vision into a stunning Ukrainian masterpiece. Get a detailed quote for
              your custom cake with a personal consultation from Olga, our expert Ukrainian cake
              designer.
            </Typography>
          </Box>

          {/* Benefits Section */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {[
              {
                icon: <CheckCircleIcon sx={{ fontSize: 48, color: colors.success.main }} />,
                title: "Free Consultation",
                description:
                  "Personal consultation with Olga, our expert Ukrainian cake designer at no cost",
              },
              {
                icon: <PaymentIcon sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Transparent Pricing",
                description: "Detailed breakdown of costs with no hidden fees",
              },
              {
                icon: <LocalShippingIcon sx={{ fontSize: 48, color: colors.secondary.main }} />,
                title: "Same-Day Delivery",
                description: "Fresh delivery across Leeds and Yorkshire areas",
              },
              {
                icon: <CakeOutlinedIcon sx={{ fontSize: 48, color: colors.ukrainian.honey }} />,
                title: "Ukrainian Authenticity",
                description: "Traditional recipes and techniques for authentic taste",
              },
            ].map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    p: 3,
                    backgroundColor: colors.background.paper,
                    boxShadow: shadows.base,
                    "&:hover": {
                      boxShadow: shadows.lg,
                      transform: "translateY(-4px)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  <Box sx={{ mb: 2 }}>{benefit.icon}</Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: typography.fontWeight.semibold,
                      mb: 1,
                      color: colors.text.primary,
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quote Form */}
          <QuoteForm />

          {/* Additional Information */}
          <Box sx={{ mt: 8 }}>
            <Alert
              severity="info"
              sx={{
                mb: 4,
                borderRadius: borderRadius.lg,
                backgroundColor: colors.info.light,
                color: colors.info.dark,
              }}
            >
              <AlertTitle sx={{ fontWeight: typography.fontWeight.semibold }}>
                What Happens Next?
              </AlertTitle>
              <Typography variant="body1">
                After submitting your quote request, Olga will personally review your requirements
                and get back to you within 24 hours with a detailed proposal, including pricing,
                timeline, and design recommendations. She may also schedule a personal consultation
                call to discuss your vision in more detail.
              </Typography>
            </Alert>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, height: "100%" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      mb: 2,
                      color: colors.primary.main,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    Why Choose Our Quote Service?
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CheckCircleIcon sx={{ color: colors.success.main }} />
                      <Typography variant="body1">
                        Personal consultation with Olga at no cost
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CheckCircleIcon sx={{ color: colors.success.main }} />
                      <Typography variant="body1">Detailed pricing breakdown</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CheckCircleIcon sx={{ color: colors.success.main }} />
                      <Typography variant="body1">
                        Personal design recommendations from Olga
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CheckCircleIcon sx={{ color: colors.success.main }} />
                      <Typography variant="body1">Timeline and delivery options</Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, height: "100%" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      mb: 2,
                      color: colors.primary.main,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    Our Process
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: colors.primary.main,
                          color: colors.primary.contrast,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: typography.fontWeight.bold,
                        }}
                      >
                        1
                      </Typography>
                      <Typography variant="body1">Submit your quote request</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: colors.primary.main,
                          color: colors.primary.contrast,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: typography.fontWeight.bold,
                        }}
                      >
                        2
                      </Typography>
                      <Typography variant="body1">
                        Receive detailed proposal within 24 hours
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: colors.primary.main,
                          color: colors.primary.contrast,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: typography.fontWeight.bold,
                        }}
                      >
                        3
                      </Typography>
                      <Typography variant="body1">Consultation call (optional)</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: colors.primary.main,
                          color: colors.primary.contrast,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: typography.fontWeight.bold,
                        }}
                      >
                        4
                      </Typography>
                      <Typography variant="body1">Confirm order and start creation</Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
}
