import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import { blocksToText } from "@/types/cake";
import CakeCard from "../components/CakeCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AreasWeCover } from "../components/AreasWeCover";
import Link from "next/link";
import { getPriceValidUntil } from "../utils/seo";

export const metadata: Metadata = {
  title:
    "Wedding Cakes Leeds | Custom Designs | From £150 | 5★ Rated",
  description:
    "Wedding cakes Leeds from £150 | Custom Ukrainian honey cake designs | Free tasting & venue setup | 5★ rated (127+ reviews) | Book consultation!",
  keywords:
    "wedding cakes Leeds, custom wedding cakes Leeds, wedding cake tasting Leeds, wedding cake consultation Leeds, venue setup wedding cake Leeds, honey cake wedding cake, Ukrainian wedding cakes, luxury wedding cakes",
  openGraph: {
    title:
      "Wedding Cakes Leeds – Custom Designs",
    description:
      "Special wedding cakes in Leeds with Ukrainian flavours. Design consultation, private tasting and professional delivery with venue setup.",
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
      "Wedding Cakes Leeds – Custom Designs",
    description:
      "Special Ukrainian-inspired wedding cakes with tasting, consultation and venue setup.",
    images: ["https://olgishcakes.co.uk/images/wedding-cakes.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/wedding-cakes",
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
        "Every wedding cake is made special to match your wedding theme and personal style",
      price: "From £80",
    },
    {
      name: "Ukrainian Flavours Wedding Cakes",
      description:
        "Traditional Ukrainian cake flavours like honey cake and Kyiv cake for special wedding experience",
      price: "From £90",
    },
    {
      name: "Wedding Cake Consultation",
      description:
        "Personal consultation to talk about design, flavours, and wedding cake needs",
      price: "Free",
    },
    {
      name: "Wedding Cake Delivery",
      description:
        "Professional delivery and setup service to your wedding venue in Leeds and around areas",
      price: "From £20",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Wedding Cakes Leeds",
    description:
      "Special wedding cakes in Leeds with Ukrainian flavours including honey cake. Private tasting, design consultation and venue setup.",
    url: "https://olgishcakes.co.uk/wedding-cakes",
    provider: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
      },
      url: "https://olgishcakes.co.uk",
      telephone: "+44 786 721 8194",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Allerton Grange",
        addressLocality: "Leeds",
        postalCode: "LS17",
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
        priceValidUntil: getPriceValidUntil(30),
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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you offer wedding cake tastings?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. I arrange private tastings during the design stage." }
      },
      {
        "@type": "Question",
        name: "Can you deliver and set up at my venue?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, delivery and full venue setup are available across Leeds and around areas." }
      },
      {
        "@type": "Question",
        name: "How far in advance should I book?",
        acceptedAnswer: { "@type": "Answer", text: "I recommend booking 6–12 weeks in advance. Short‑notice orders may be possible." }
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
              variant="h2"
              component="h2"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                fontWeight: 400,
              }}
            >
              Create the perfect centerpiece for your special day with my custom wedding cakes.
              Mixing Ukrainian traditions with modern elegance, each wedding cake is special
              masterpiece made with love and care.
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
                  "Every wedding cake is made special to match your wedding theme and personal style",
                icon: "🎨",
              },
              {
                title: "Ukrainian Flavors",
                description:
                  "Traditional Ukrainian cake flavours like honey cake and Kyiv cake for special wedding experience",
                icon: "🇺🇦",
              },
              {
                title: "Wedding Consultation",
                  description:
                    "Personal consultation to talk about design, flavours, and wedding cake needs",
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
                  <Box sx={{ mb: 2, fontSize: "3rem" }}>
                    {service.icon}
                  </Box>
                  <Typography
                    variant="h4"
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
                <Typography variant="h3" component="h3" color="text.secondary" sx={{ mb: 2 }}>
                  Custom Wedding Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Every wedding cake is custom-designed to match your unique vision. Contact me to
                  discuss your wedding cake requirements and view my portfolio.
                </Typography>
                <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                  color="primary"
                  size="large">
                  Wedding Cake Consultation
                </Button>
            </Link>
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
                    "I meet with you to talk about your wedding theme, colour scheme, guest count, and cake preferences. This can be in-person, over the phone, or via video call.",
                },
                {
                  step: "2",
                  title: "Design & Tasting",
                  description:
                    "I create a custom design proposal and arrange a tasting session with my signature Ukrainian flavours and traditional wedding cake options.",
                },
                {
                  step: "3",
                  title: "Final Design",
                  description:
                    "After the tasting, I finalize the design, flavours, and all details. A 50% deposit secures your wedding date.",
                },
                {
                  step: "4",
                  title: "Creation & Delivery",
                  description:
                    "Your wedding cake is carefully made and delivered to your venue on your special day, with professional setup included.",
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
                    <Typography
                      variant="h4"
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

          <AreasWeCover
            title="Wedding Cake Delivery Areas"
            subtitle="Professional wedding cake delivery and venue setup across Leeds and surrounding towns."
          />

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
              My wedding cakes feature a unique blend of traditional Ukrainian flavours and classic
              wedding cake options. From the delicate honey layers of honey cake to the rich
              chocolate of Kyiv cake, each flavour tells a story of Ukrainian tradition while
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

          {/* Leeds Wedding Venues Section */}
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
              Wedding Cake Delivery to Leeds Venues
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              I deliver and set up wedding cakes at venues across Leeds and surrounding areas. My professional delivery service ensures your wedding cake arrives in perfect condition and is beautifully displayed at your reception. I've worked with many popular wedding venues in Leeds including Oulton Hall, Thorpe Park Hotel & Spa, The Met Hotel Leeds, Headingley Stadium, Leeds Town Hall, and many beautiful country venues across Yorkshire.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Each wedding cake delivery includes careful transportation, professional setup at your venue, and coordination with your venue coordinator to ensure perfect timing. I understand the importance of your wedding day and take every precaution to deliver excellence. My delivery service covers Leeds city centre, North Leeds, South Leeds, East Leeds, and West Leeds, plus surrounding towns including Wetherby, Harrogate, York, Wakefield, Bradford, and Halifax.
            </Typography>
          </Paper>

          {/* Wedding Cake Pricing & Packages */}
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
              Wedding Cake Pricing Leeds
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Wedding cake prices start from £150 for a two-tier cake serving 40-50 guests. Final pricing depends on the size, design complexity, flavour choices, and decorative elements. I offer transparent pricing with no hidden fees. A typical three-tier wedding cake serving 100-120 guests ranges from £250-£400. Custom sugar flowers, intricate piping, and premium flavours like Ukrainian honey cake may add to the final cost.
            </Typography>
            <Grid container spacing={3}>
              {[
                { size: "Two-Tier Cake", serves: "40-50 guests", price: "From £150" },
                { size: "Three-Tier Cake", serves: "100-120 guests", price: "From £250" },
                { size: "Four-Tier Cake", serves: "150-180 guests", price: "From £400" },
                { size: "Five-Tier Cake", serves: "200+ guests", price: "From £550" },
              ].map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ p: 3, backgroundColor: "rgba(46, 49, 146, 0.05)", borderRadius: 2 }}>
                    <Typography variant="h4" component="h3" sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}>
                      {option.size}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: "text.secondary" }}>
                      Serves: {option.serves}
                    </Typography>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                      {option.price}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Leeds Wedding Testimonials */}
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
              What Leeds Couples Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  quote: "The honey cake wedding cake was absolutely stunning and tasted incredible. All our guests asked where we got it from. Olgish was professional, creative, and delivered exactly what we wanted.",
                  author: "Emma & James, Married at Oulton Hall",
                  rating: "5/5"
                },
                {
                  quote: "We wanted something different for our wedding and the Ukrainian Kyiv cake was perfect. Beautiful presentation, unique flavours, and Olgish made the whole process so easy. Highly recommend!",
                  author: "Sarah & Tom, Married at Thorpe Park Hotel",
                  rating: "5/5"
                },
                {
                  quote: "From the initial consultation to delivery at our venue, everything was perfect. The three-tier cake was elegant, delicious, and our guests are still talking about it months later.",
                  author: "Rebecca & David, Married at Headingley Stadium",
                  rating: "5/5"
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h4" component="h3" sx={{ mb: 2, color: "secondary.main", fontSize: "2rem" }}>
                      ⭐⭐⭐⭐⭐
                    </Typography>
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

          {/* Why Choose Olgish Cakes for Your Leeds Wedding */}
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
              Why Leeds Couples Choose Olgish Cakes
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              As a local Leeds Ukrainian bakery, I bring unique flavours and traditions to your special day. My wedding cakes combine the elegance of modern design with the authentic taste of Ukrainian baking. Every cake is handmade with premium ingredients and baked fresh for your wedding day.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              I offer a personal service that larger bakeries can't match. From your first consultation to the moment your cake is displayed at your reception, I'm involved in every step. My Ukrainian heritage brings unique flavour options like honey cake (Medovik) and Kyiv cake that make your wedding cake truly special and memorable for your guests.
            </Typography>
            <Grid container spacing={3}>
              {[
                "Local Leeds bakery with personal service",
                "Unique Ukrainian flavours and traditions",
                "Free wedding cake tastings",
                "Custom designs to match your wedding theme",
                "Professional venue delivery and setup",
                "Flexible booking from 6 weeks to 12 months advance",
                "Dietary accommodations available",
                "127+ five-star reviews from happy couples",
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

          {/* Wedding Cakes by Location */}
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
              Wedding Cakes in Your Area
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, textAlign: "center" }}>
              I deliver wedding cakes across Yorkshire. Click your area to see local delivery details, pricing, and venue information:
            </Typography>
            <Grid container spacing={2}>
              {[
                { name: "Wedding Cakes Leeds", href: "/cakes-leeds" },
                { name: "Wedding Cakes Bradford", href: "/cakes-bradford" },
                { name: "Wedding Cakes Huddersfield", href: "/cakes-huddersfield" },
                { name: "Wedding Cakes Wakefield", href: "/cakes-wakefield" },
                { name: "Wedding Cakes York", href: "/cakes-york" },
                { name: "Wedding Cakes Halifax", href: "/cakes-halifax" },
                { name: "Wedding Cakes Ilkley", href: "/cakes-ilkley" },
                { name: "Wedding Cakes Skipton", href: "/cakes-skipton" },
              ].map((area, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Link href={area.href} style={{ textDecoration: 'none', display: 'block' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      sx={{
                        py: 1.5,
                        justifyContent: "flex-start",
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                      }}
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
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Book Your Wedding Cake Consultation
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "700px", mx: "auto", fontSize: "1.1rem", lineHeight: 1.8 }}
            >
              Let me create the perfect wedding cake for your Leeds celebration. Contact me today to schedule your free consultation and tasting session. I'll work with you to design a stunning wedding cake that reflects your style and delights your guests with authentic Ukrainian flavours.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}>
                Book Free Consultation
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
