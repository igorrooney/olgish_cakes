import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title:
    "Custom Cake Design Leeds | Personalized Cakes | Wedding Cakes | Birthday Cakes | Olgish Cakes",
  description:
    "Custom cake design service in Leeds. Personalized wedding cakes, birthday cakes, and celebration cakes. Ukrainian-inspired designs with traditional flavors. Free consultation available.",
  keywords:
    "custom cake design Leeds, personalized cakes Leeds, wedding cake design, birthday cake design, celebration cakes Leeds, custom cake consultation, unique cake designs, Ukrainian cake design",
  openGraph: {
    title: "Custom Cake Design Leeds | Personalized Cakes | Wedding Cakes | Birthday Cakes",
    description:
      "Custom cake design service in Leeds. Personalized wedding cakes, birthday cakes, and celebration cakes. Ukrainian-inspired designs with traditional flavors. Free consultation available.",
    url: "https://olgishcakes.co.uk/custom-cake-design",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/custom-cake-design.jpg",
        width: 1200,
        height: 630,
        alt: "Custom Cake Design Leeds - Personalized Cakes by Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Cake Design Leeds | Personalized Cakes | Wedding Cakes | Birthday Cakes",
    description:
      "Custom cake design service in Leeds. Personalized wedding cakes, birthday cakes, and celebration cakes. Ukrainian-inspired designs with traditional flavors.",
    images: ["https://olgishcakes.co.uk/images/custom-cake-design.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/custom-cake-design",
  },
};

export default function CustomCakeDesignPage() {
  const designServices = [
    {
      name: "Wedding Cake Design",
      description: "Nice wedding cakes designed to match your wedding theme and personal style",
      price: "From £80",
    },
    {
      name: "Birthday Cake Design",
      description: "Personalized birthday cakes with custom themes, colors, and decorations",
      price: "From £35",
    },
    {
      name: "Celebration Cake Design",
      description: "Special occasion cakes for anniversaries, graduations, and milestones",
      price: "From £45",
    },
    {
      name: "Ukrainian Design Cakes",
      description:
        "Traditional Ukrainian-inspired designs with real flavors and cultural elements",
      price: "From £50",
    },
  ];

  const designProcess = [
    {
      step: "1",
      title: "Initial Consultation",
      description:
        "We discuss your vision, theme, colors, guest count, and any special requirements.",
    },
    {
      step: "2",
      title: "Design Concept",
      description:
        "We create a custom design proposal with sketches, color schemes, and flavor combinations.",
    },
    {
      step: "3",
      title: "Tasting Session",
      description:
        "Sample our signature Ukrainian flavors and traditional cake options to find the perfect combination.",
    },
    {
      step: "4",
      title: "Final Design",
      description: "We refine the design based on your feedback and create the final custom cake.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Custom Cake Design Leeds",
    description:
      "Custom cake design service in Leeds. Personalized wedding cakes, birthday cakes, and celebration cakes. Ukrainian-inspired designs with traditional flavors.",
    url: "https://olgishcakes.co.uk/custom-cake-design",
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
      name: "Custom Cake Design Services",
      itemListElement: designServices.map(service => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          category: "Custom Cake Design",
          provider: {
            "@type": "Organization",
            name: "Olgish Cakes",
          },
        },
        price: service.price,
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
    },
    mainEntity: {
      "@type": "HowTo",
      name: "Custom Cake Design Process",
      description: "Our step-by-step process for creating custom cakes",
      step: designProcess.map(process => ({
        "@type": "HowToStep",
        name: process.title,
        text: process.description,
      })),
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
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Custom Cake Design", href: "/custom-cake-design" },
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
              Custom Cake Design Leeds
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
              Transform your vision into a beautiful custom cake. My personalized cake design
              service mixes Ukrainian traditions with modern creativity to create special,
              beautiful cakes for your special occasions.
            </Typography>
            <Chip
              label="Personalized Cake Design"
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

          {/* Custom Design Services */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Wedding Cakes",
                description:
                  "Nice wedding cakes designed to match your wedding theme and personal style",
                icon: "💍",
              },
              {
                title: "Birthday Cakes",
                description:
                  "Personalized birthday cakes with custom themes, colors, and decorations",
                icon: "🎂",
              },
              {
                title: "Celebration Cakes",
                description:
                  "Special occasion cakes for anniversaries, graduations, and milestones",
                icon: "🎉",
              },
              {
                title: "Ukrainian Designs",
                description:
                  "Traditional Ukrainian-inspired designs with real flavors and cultural elements",
                icon: "🇺🇦",
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

          {/* Design Process */}
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
              Our Custom Cake Design Process
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Initial Consultation",
                  description:
                    "We discuss your vision, theme, colors, guest count, and any special requirements. This can be in-person, over the phone, or via video call.",
                },
                {
                  step: "2",
                  title: "Design Concept",
                  description:
                    "We create a custom design proposal with sketches, color schemes, and flavor combinations that match your vision and preferences.",
                },
                {
                  step: "3",
                  title: "Tasting Session",
                  description:
                    "Sample our signature Ukrainian flavors and traditional cake options to find the perfect combination for your custom cake.",
                },
                {
                  step: "4",
                  title: "Final Design",
                  description:
                    "After the tasting, we finalize all details including design, flavors, size, and delivery arrangements. A 50% deposit secures your order.",
                },
                {
                  step: "5",
                  title: "Creation Process",
                  description:
                    "Your custom cake is carefully crafted using traditional Ukrainian techniques and premium ingredients, with regular updates on progress.",
                },
                {
                  step: "6",
                  title: "Delivery & Setup",
                  description:
                    "Professional delivery and setup service to your venue, ensuring your custom cake arrives in perfect condition.",
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

          {/* Design Options */}
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
              Custom Design Options
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  category: "Design Styles",
                  options: [
                    "Traditional Ukrainian designs",
                    "Modern minimalist",
                    "Rustic and natural",
                    "Elegant and sophisticated",
                    "Whimsical and fun",
                    "Seasonal themes",
                  ],
                },
                {
                  category: "Decoration Techniques",
                  options: [
                    "Hand-piped buttercream flowers",
                    "Ukrainian folk art patterns",
                    "Edible gold and silver leaf",
                    "Fresh flower arrangements",
                    "Custom cake toppers",
                    "Textured fondant work",
                  ],
                },
                {
                  category: "Flavor Combinations",
                  options: [
                    "Traditional Ukrainian flavors",
                    "Classic wedding cake flavors",
                    "Modern fusion combinations",
                    "Seasonal fruit flavors",
                    "Chocolate and caramel",
                    "Light and refreshing options",
                  ],
                },
                {
                  category: "Special Features",
                  options: [
                    "Multi-tier designs",
                    "Hidden filling layers",
                    "Personalized messages",
                    "Photo transfers",
                    "3D sculpted elements",
                    "Interactive elements",
                  ],
                },
              ].map((category, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
                    >
                      {category.category}
                    </Typography>
                    {category.options.map((option, optionIndex) => (
                      <Box key={optionIndex} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "primary.main",
                            mr: 2,
                          }}
                        />
                        <Typography variant="body2">{option}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Ukrainian Design Elements */}
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
              Ukrainian Design Elements
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Our custom cakes often incorporate traditional Ukrainian design elements, bringing
              cultural heritage and authentic flavors to your special occasions. These elements can
              be combined with modern design trends for a unique and meaningful cake experience.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Ukrainian Folk Art",
                  description:
                    "Traditional Ukrainian embroidery patterns, floral motifs, and geometric designs inspired by Ukrainian folk art.",
                },
                {
                  title: "Ukrainian Colors",
                  description:
                    "Traditional Ukrainian color palette including blue and yellow, representing the Ukrainian flag and cultural heritage.",
                },
                {
                  title: "Ukrainian Flavors",
                  description:
                    "Authentic Ukrainian cake flavors like Medovik (honey), Kyiv cake, and traditional Ukrainian ingredients.",
                },
                {
                  title: "Cultural Symbols",
                  description:
                    "Meaningful Ukrainian symbols and motifs that can be incorporated into cake designs for cultural celebrations.",
                },
              ].map((element, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {element.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {element.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Pricing Information */}
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
              Custom Cake Pricing
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Custom cake pricing varies based on design complexity, size, ingredients, and
              decoration requirements. We offer transparent pricing and will provide a detailed
              quote after our initial consultation.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  factor: "Cake Size",
                  description:
                    "Larger cakes require more ingredients and time, affecting the overall cost.",
                },
                {
                  factor: "Design Complexity",
                  description:
                    "Intricate designs, custom decorations, and special techniques may increase pricing.",
                },
                {
                  factor: "Ingredients",
                  description:
                    "Premium ingredients, special dietary requirements, and imported Ukrainian ingredients.",
                },
                {
                  factor: "Delivery & Setup",
                  description: "Delivery distance, setup requirements, and special handling needs.",
                },
              ].map((factor, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {factor.factor}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {factor.description}
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
              sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
            >
              Start Your Custom Cake Design Journey
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Ready to create your perfect custom cake? Contact us today to schedule your free
              consultation and start bringing your vision to life.
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
                Free Consultation
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View Cake Gallery
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
