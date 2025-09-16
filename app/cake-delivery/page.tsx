import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AreasWeCover } from "../components/AreasWeCover";

export const metadata: Metadata = {
  title: "Cake Delivery Leeds – Same‑day Options, Venue Setup | Olgish Cakes",
  description:
    "Professional cake delivery across Leeds and around areas with careful handling and optional venue setup for weddings. Same‑day options when available. Prices from £5.",
  keywords:
    "cake delivery Leeds, same day cake delivery Leeds, wedding cake delivery Leeds, birthday cake delivery Leeds, celebration cake delivery, venue setup wedding cakes, local cake delivery Leeds, Wakefield cake delivery, York cake delivery, Bradford cake delivery",
  openGraph: {
    title: "Cake Delivery Leeds – Same‑day Options, Venue Setup",
    description:
      "Professional cake delivery across Leeds and around areas. Optional wedding cake setup at your venue. Same‑day options when available.",
    url: "https://olgishcakes.co.uk/cake-delivery",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cake-delivery.jpg",
        width: 1200,
        height: 630,
        alt: "Cake Delivery Leeds - Professional Bakery Delivery Service",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Delivery Leeds – Same‑day Options, Venue Setup",
    description:
      "Professional cake delivery across Leeds and around areas with careful handling and venue setup for weddings.",
    images: ["https://olgishcakes.co.uk/images/cake-delivery.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-delivery",
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

export default function CakeDeliveryPage() {
  return (
    <>
      <Script
        id="cake-delivery-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Cake Delivery Leeds",
            description:
              "Professional cake delivery service in Leeds and around areas. Wedding cake delivery with venue setup, birthday cake delivery, and celebration cake delivery.",
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
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
            },
            serviceType: "Cake Delivery Service",
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Delivery Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Wedding Cake Delivery",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Birthday Cake Delivery",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Celebration Cake Delivery",
                  },
                },
              ],
            },
            url: "https://olgishcakes.co.uk/cake-delivery",
          }),
        }}
      />
      <Script
        id="cake-delivery-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Do you offer same‑day cake delivery in Leeds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, same‑day delivery is sometimes available depending on time and location. Please call or message to check availability."
                }
              },
              {
                "@type": "Question",
                name: "Which areas do you deliver to?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "I deliver across Leeds and around areas including Wakefield, Bradford, York, Harrogate and more."
                }
              },
              {
                "@type": "Question",
                name: "How much does delivery cost?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Local Leeds delivery starts from £5. Costs vary by distance and any venue setup requirements."
                }
              },
              {
                "@type": "Question",
                name: "Do you deliver and set up wedding cakes at venues?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. We provide professional delivery and full setup for wedding cakes at your venue."
                }
              },
              {
                "@type": "Question",
                name: "Can I collect my cake instead?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, free collection from our Leeds bakery is available by prior arrangement."
                }
              }
            ]
          })
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
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cake Delivery", href: "/cake-delivery" },
            ]}
          />

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
              Cake Delivery Leeds
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
              Reliable cake delivery service across Leeds and around areas. I make sure your
              Ukrainian cakes arrive fresh, safe, and nicely presented for your special
              occasions.
            </Typography>
            <Chip
              label="Professional Delivery Service"
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

          {/* Delivery Services */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Wedding Cake Delivery",
                description:
                  "Professional delivery and setup service for wedding cakes at your venue",
                icon: "💍",
              },
              {
                title: "Birthday Cake Delivery",
                description:
                  "Safe and timely delivery of birthday cakes to your home or party venue",
                icon: "🎂",
              },
              {
                title: "Celebration Cake Delivery",
                description:
                  "Delivery service for all types of celebration cakes and special occasions",
                icon: "🎉",
              },
              {
                title: "Local Leeds Delivery",
                description: "Fast delivery service across Leeds and around areas",
                icon: "🚚",
              },
            ].map((service, index) => (
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
                    {service.icon}
                  </Typography>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                  >
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Delivery Areas */}
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
              Delivery Areas
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              I provide professional cake delivery service across Leeds and around areas. My
              delivery team makes sure your cake arrives safely and on time, with careful handling and
              professional setup when needed.
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
                "Beeston",
                "Hunslet",
                "Holbeck",
                "And around areas",
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

          <AreasWeCover
            title="Cake Delivery Areas"
            subtitle="I deliver cakes across Leeds and around towns. Choose your town to learn more."
          />

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
              Our Delivery Process
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Careful Preparation",
                  description:
                    "Your cake is carefully packaged and secured in specialized cake boxes to ensure safe transportation.",
                },
                {
                  step: "2",
                  title: "Temperature Control",
                  description:
                    "Cakes are transported in temperature-controlled conditions to maintain freshness and quality.",
                },
                {
                  step: "3",
                  title: "Professional Transport",
                  description:
                    "Experienced delivery team handles your cake with the utmost care during transportation.",
                },
                {
                  step: "4",
                  title: "Safe Delivery",
                  description:
                    "Cake is delivered to your specified location with careful handling and professional setup if required.",
                },
                {
                  step: "5",
                  title: "Quality Check",
                  description:
                    "Final inspection ensures your cake arrives in perfect condition and ready for your celebration.",
                },
                {
                  step: "6",
                  title: "Setup Service",
                  description:
                    "For wedding cakes and special events, we provide professional setup and arrangement service.",
                },
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
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
                        fontWeight: "bold",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {step.step}
                    </Box>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Delivery Options */}
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
              Delivery Options
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Standard Delivery",
                  description:
                    "Delivery to your home or venue within Leeds and surrounding areas. Includes careful handling and basic setup.",
                  price: "From £5",
                },
                {
                  title: "Wedding Cake Delivery",
                  description:
                    "Professional delivery and setup service for wedding cakes. Includes venue setup, arrangement, and coordination.",
                  price: "From £15",
                },
                {
                  title: "Same Day Delivery",
                  description:
                    "Urgent delivery service for last-minute orders. Subject to availability and location.",
                  price: "From £10",
                },
                {
                  title: "Collection Service",
                  description:
                    "Free collection from our Leeds bakery. Perfect for customers who prefer to collect their cakes.",
                  price: "Free",
                },
              ].map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 4,
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {option.description}
                    </Typography>
                    <Typography variant="h3" component="h3" color="primary.main" fontWeight={600}>
                      {option.price}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Delivery Tips */}
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
              Cake Delivery Tips
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              To make sure your cake arrives in perfect condition, I follow strict delivery
              protocols and provide helpful tips for receiving your cake.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Delivery Timing",
                  description:
                    "Schedule delivery 1-2 hours before your event to allow time for setup and temperature adjustment.",
                },
                {
                  title: "Storage Instructions",
                  description:
                    "Keep your cake in a cool, dry place away from direct sunlight and heat sources until serving.",
                },
                {
                  title: "Handling Care",
                  description:
                    "Avoid moving the cake once it's been delivered and set up to prevent damage to decorations.",
                },
                {
                  title: "Temperature Control",
                  description:
                    "Maintain room temperature for most cakes, or refrigerate if specified in your order details.",
                },
              ].map((tip, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {tip.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tip.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Ready to Order Your Cake with Delivery?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Ready to order your cake with professional delivery service? Contact me to discuss
              your delivery requirements and get a quote for your area.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/contact"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Order with Delivery
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View Cake Collection
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
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
          Cake Delivery FAQs
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              q: "Do you offer same‑day delivery?",
              a: "Sometimes, depending on time and location. Contact us to check availability.",
            },
            {
              q: "Which areas do you cover?",
              a: "Leeds and around areas such as Wakefield, Bradford, York and Harrogate.",
            },
            { q: "How much does delivery cost?", a: "From £5 in Leeds. Distance and setup may affect pricing." },
            { q: "Can you set up wedding cakes at the venue?", a: "Yes, we offer full delivery and professional setup." },
            { q: "Can I collect instead?", a: "Yes, free collection from our Leeds bakery is available." },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" component="h3" sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}>
                  {item.q}
                </Typography>
                <Typography variant="body2" color="text.secondary">{item.a}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </>
  );
}
