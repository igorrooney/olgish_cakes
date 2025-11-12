import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cake Decorating Services | Custom Design",
  description:
    "Professional cake decorating services in Leeds. I offer custom cake design, fondant work, sugar flowers, and more for weddings, birthdays, and special occasions.",
  keywords:
    "cake decorating services, custom cake design, cake decoration Leeds, wedding cake decoration, birthday cake decoration",
  openGraph: {
    title: "Cake Decorating Services | Custom Design",
    description:
      "Professional cake decorating services in Leeds. I offer custom cake design, fondant work, sugar flowers, and more for weddings, birthdays, and special occasions.",
    url: "https://olgishcakes.co.uk/cake-decorating-services",
    images: ["https://olgishcakes.co.uk/images/cake-decorating-services.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Decorating Services | Custom Design",
    description:
      "Professional cake decorating services in Leeds. I offer custom cake design, fondant work, sugar flowers, and more for weddings, birthdays, and special occasions.",
    images: ["https://olgishcakes.co.uk/images/cake-decorating-services.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-decorating-services",
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

export default function CakeDecoratingServicesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Cake Decorating Services",
    description: "Professional cake decorating and custom cake design in Leeds by Ukrainian baker Olga",
    provider: {
      "@type": "Organization",
      name: "Olgish Cakes",
    },
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
    serviceType: "Cake Decorating",
    url: "https://olgishcakes.co.uk/cake-decorating-services",
  };

  const services = [
    {
      name: "Custom Cake Design",
      description: "Personalized cake designs for any occasion.",
      icon: "🎨",
    },
    {
      name: "Fondant Work",
      description: "Smooth fondant finishes and creative shapes.",
      icon: "🍰",
    },
    {
      name: "Sugar Flowers",
      description: "Handcrafted sugar flowers for elegant cakes.",
      icon: "🌸",
    },
    { name: "Edible Prints", description: "Custom edible images and prints.", icon: "🖼️" },
    {
      name: "Sculpted Cakes",
      description: "3D sculpted cakes for unique celebrations.",
      icon: "🗿",
    },
    {
      name: "Themed Cakes",
      description: "Cakes for birthdays, weddings, and special events.",
      icon: "🎂",
    },
  ];

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
              items={[{ label: "Home", href: "/" }, { label: "Cake Decorating Services" }]}
            />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: "bold",
                mb: 2,
                color: "#005BBB",
              }}
            >
              Cake Decorating Services
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                color: "text.secondary",
                mb: 3,
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              Professional cake decorating and custom cake design for weddings, birthdays, and
              special occasions in Leeds. I bring real Ukrainian style and attention to detail.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip label="Custom Design" color="primary" />
              <Chip label="Fondant Work" color="secondary" />
              <Chip label="Sugar Flowers" color="primary" />
              <Chip label="Edible Prints" color="secondary" />
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 6, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}>
            Cake decorating is not just about making cakes look pretty - it is about creating memories and bringing joy to special moments.
            Every decoration I create tells a story and makes your celebration even more special. I love working with you to bring your vision to life!
          </Typography>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {services.map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {item.icon}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ mb: 2, color: "#005BBB", fontWeight: "bold" }}
                  >
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              My Decorating Process
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>💬</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Consultation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    First, I listen to your ideas and vision. I want to understand what you have in mind, what colours you love,
                    and what makes your celebration special. Every detail helps me create the perfect design for you.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>✏️</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Design & Planning
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    I create a detailed plan for your cake decoration, considering the flavours, size, and style.
                    I will show you sketches or describe exactly what I will create so you feel confident about your choice.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🎨</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Handcrafted Creation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    I make every decoration by hand with love and attention to detail. From sugar flowers to fondant figures,
                    everything is crafted especially for your cake. I take my time to make it perfect.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Popular Decoration Styles
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Elegant & Classic
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Beautiful, timeless designs with smooth fondant finishes and delicate sugar flowers. Perfect for weddings,
                    anniversaries, and formal celebrations. Clean lines and sophisticated colours create an elegant look that never goes out of style.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Fun & Colourful
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Bright, playful designs perfect for children's birthdays and casual celebrations. I love creating fun characters,
                    colourful patterns, and creative themes that bring smiles to everyone's faces. Great for parties and special occasions.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Rustic & Natural
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Natural, organic designs with fresh flowers, rustic textures, and earthy colours. Perfect for outdoor celebrations,
                    country weddings, or anyone who loves a natural, relaxed style. Beautiful and authentic.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Modern & Creative
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Contemporary designs with bold colours, geometric patterns, and unique styling. Perfect for modern celebrations
                    and people who want something different and artistic. I love creating unique, one-of-a-kind designs.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Link href="/custom-cake-design" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
              size="large"
              sx={{ bgcolor: "#FFD700", color: "#005BBB", "&:hover": { bgcolor: "#ffe066" } }}>
              Start Your Custom Cake
            </Button>
            </Link>
          </Box>
        </Container>
      </Box>
    </>
  );
}
