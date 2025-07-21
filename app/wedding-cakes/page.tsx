import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import { blocksToText } from "@/types/cake";
import CakeCard from "../components/CakeCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Wedding Cakes Leeds | Ukrainian Wedding Cakes | Honey Cake (Medovik) Wedding Cakes | Custom Wedding Cakes | Olgish Cakes",
  description:
    "Beautiful custom wedding cakes in Leeds. Ukrainian-inspired wedding cakes with traditional flavors like honey cake (Medovik) and modern designs. Wedding cake consultation and delivery service available.",
  keywords:
    "wedding cakes Leeds, Ukrainian wedding cakes, honey cake wedding cakes, Medovik wedding cakes, custom wedding cakes Leeds, wedding cake consultation, wedding cake delivery Leeds, traditional wedding cakes, luxury wedding cakes, wedding cake design",
  openGraph: {
    title:
      "Wedding Cakes Leeds | Ukrainian Wedding Cakes | Honey Cake (Medovik) Wedding Cakes | Custom Wedding Cakes",
    description:
      "Beautiful custom wedding cakes in Leeds. Ukrainian-inspired wedding cakes with traditional flavors like honey cake (Medovik) and modern designs. Wedding cake consultation and delivery service available.",
    url: "https://olgishcakes.co.uk/wedding-cakes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/wedding-cakes.jpg",
        width: 1200,
        height: 630,
        alt: "Beautiful Wedding Cakes Leeds - Honey Cake (Medovik) - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Wedding Cakes Leeds | Ukrainian Wedding Cakes | Honey Cake (Medovik) Wedding Cakes | Custom Wedding Cakes",
    description:
      "Beautiful custom wedding cakes in Leeds. Ukrainian-inspired wedding cakes with traditional flavors like honey cake (Medovik) and modern designs.",
    images: ["https://olgishcakes.co.uk/images/wedding-cakes.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/wedding-cakes",
  },
};

export default async function WeddingCakesPage() {
  const allCakes = await getAllCakes();
  const weddingCakes = allCakes.filter(
    cake =>
      cake.category === "custom" ||
      cake.name.toLowerCase().includes("wedding") ||
      blocksToText(cake.description).toLowerCase().includes("wedding")
  );

  const weddingServices = [
    {
      name: "Custom Design Wedding Cakes",
      description:
        "Every wedding cake is uniquely designed to match your wedding theme and personal style",
      price: "From £80",
    },
    {
      name: "Ukrainian Flavors Wedding Cakes",
      description:
        "Traditional Ukrainian cake flavors like honey cake and Kyiv cake for a unique wedding experience",
      price: "From £90",
    },
    {
      name: "Wedding Cake Consultation",
      description:
        "Personal consultation to discuss design, flavors, and wedding cake requirements",
      price: "Free",
    },
    {
      name: "Wedding Cake Delivery",
      description:
        "Professional delivery and setup service to your wedding venue in Leeds and surrounding areas",
      price: "From £20",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Wedding Cakes Leeds",
    description:
      "Beautiful custom wedding cakes in Leeds. Ukrainian-inspired wedding cakes with traditional flavors like honey cake (Medovik) and modern designs.",
    url: "https://olgishcakes.co.uk/wedding-cakes",
    provider: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/logo.png",
      },
      url: "https://olgishcakes.co.uk",
      telephone: "+44 786 721 8194",
      address: {
        "@type": "PostalAddress",
        streetAddress: "107 Harehills Lane",
        addressLocality: "Leeds",
        postalCode: "LS8 4DN",
        addressCountry: "GB",
      },
    },
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Wedding Cake Services",
      itemListElement: weddingServices.map(service => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          category: "Wedding Cake",
          provider: {
            "@type": "Organization",
            name: "Olgish Cakes",
          },
        },
        price: service.price,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://olgishcakes.co.uk",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Wedding Cakes",
          item: "https://olgishcakes.co.uk/wedding-cakes",
        },
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
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Wedding Cakes", href: "/wedding-cakes" },
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
              Wedding Cakes Leeds
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Create the perfect centerpiece for your special day with our custom wedding cakes.
              Combining Ukrainian traditions with modern elegance, each wedding cake is a unique
              masterpiece crafted with love and attention to detail.
            </Typography>
            <Chip
              label="Custom Wedding Cake Design"
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

          {/* Wedding Cake Services */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Custom Design",
                description:
                  "Every wedding cake is uniquely designed to match your wedding theme and personal style",
                icon: "🎨",
              },
              {
                title: "Ukrainian Flavors",
                description:
                  "Traditional Ukrainian cake flavors like honey cake and Kyiv cake for a unique wedding experience",
                icon: "🇺🇦",
              },
              {
                title: "Wedding Consultation",
                description:
                  "Personal consultation to discuss design, flavors, and wedding cake requirements",
                icon: "💍",
              },
              {
                title: "Wedding Delivery",
                description:
                  "Professional delivery and setup service to your wedding venue in Leeds and surrounding areas",
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
                  <Typography variant="h2" sx={{ mb: 2, fontSize: "3rem" }}>
                    {service.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Wedding Cake Gallery */}
          <Box sx={{ mb: 6 }}>
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
              Wedding Cake Inspiration
            </Typography>

            {weddingCakes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                  Custom Wedding Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Every wedding cake is custom-designed to match your unique vision. Contact us to
                  discuss your wedding cake requirements and view our portfolio.
                </Typography>
                <Button
                  component={Link}
                  href="/contact"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Wedding Cake Consultation
                </Button>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {weddingCakes.map(cake => (
                  <Grid item xs={12} sm={6} md={4} key={cake._id}>
                    <CakeCard cake={cake} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Wedding Cake Process */}
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
              Your Wedding Cake Journey
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Initial Consultation",
                  description:
                    "We meet to discuss your wedding theme, color scheme, guest count, and cake preferences. This can be in-person, over the phone, or via video call.",
                },
                {
                  step: "2",
                  title: "Design & Tasting",
                  description:
                    "We create a custom design proposal and arrange a tasting session with our signature Ukrainian flavors and traditional wedding cake options.",
                },
                {
                  step: "3",
                  title: "Final Design",
                  description:
                    "After the tasting, we finalize the design, flavors, and all details. A 50% deposit secures your wedding date.",
                },
                {
                  step: "4",
                  title: "Creation & Delivery",
                  description:
                    "Your wedding cake is carefully crafted and delivered to your venue on your special day, with professional setup included.",
                },
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center" }}>
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
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
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

          {/* Wedding Cake Flavors */}
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
              Wedding Cake Flavors
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Our wedding cakes feature a unique blend of traditional Ukrainian flavors and classic
              wedding cake options. From the delicate honey layers of honey cake to the rich
              chocolate of Kyiv cake, each flavor tells a story of Ukrainian tradition while
              creating a memorable wedding experience.
            </Typography>
            <Grid container spacing={3}>
              {[
                "Honey Cake - Traditional Ukrainian honey layers",
                "Kyiv Cake - Rich chocolate and hazelnut meringue",
                "Vanilla Bean - Classic wedding cake with Ukrainian twist",
                "Chocolate Fudge - Decadent chocolate layers",
                "Lemon Poppy Seed - Light and refreshing option",
                "Red Velvet - Classic with Ukrainian cream cheese frosting",
              ].map((flavor, index) => (
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
                    <Typography variant="body1">{flavor}</Typography>
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
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Start Your Wedding Cake Journey
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Let us create the perfect wedding cake for your special day. Contact us today to
              schedule your wedding cake consultation and tasting session.
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
                Wedding Cake Consultation
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View All Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
