import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cake Gallery | Ukrainian Cake Designs | Custom Cake Portfolio | Olgish Cakes",
  description:
    "Explore our beautiful cake gallery showcasing Ukrainian cake designs, custom cakes, and traditional Ukrainian desserts. Wedding cakes, birthday cakes, and celebration cakes portfolio.",
  keywords:
    "cake gallery, Ukrainian cake designs, custom cake portfolio, wedding cake gallery, birthday cake designs, celebration cake photos, cake inspiration, Ukrainian dessert gallery",
  openGraph: {
    title: "Cake Gallery | Ukrainian Cake Designs | Custom Cake Portfolio",
    description:
      "Explore our beautiful cake gallery showcasing Ukrainian cake designs, custom cakes, and traditional Ukrainian desserts. Wedding cakes, birthday cakes, and celebration cakes portfolio.",
    url: "https://olgish-cakes.vercel.app/cake-gallery",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/cake-gallery.jpg",
        width: 1200,
        height: 630,
        alt: "Cake Gallery - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Gallery | Ukrainian Cake Designs | Custom Cake Portfolio",
    description:
      "Explore our beautiful cake gallery showcasing Ukrainian cake designs, custom cakes, and traditional Ukrainian desserts.",
    images: ["https://olgish-cakes.vercel.app/images/cake-gallery.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/cake-gallery",
  },
};

export default async function CakeGalleryPage() {
  const allCakes = await getAllCakes();

  return (
    <>
      <StructuredData />

      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
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
              Cake Gallery
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
              Explore our beautiful collection of Ukrainian cakes and custom designs. From
              traditional Ukrainian desserts to modern celebration cakes, discover the artistry and
              craftsmanship that goes into every creation.
            </Typography>
            <Chip
              label="Ukrainian Cake Portfolio"
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

          {/* Gallery Categories */}
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
              Gallery Categories
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  category: "Traditional Ukrainian",
                  icon: "🇺🇦",
                  description: "Authentic Ukrainian cakes like Medovik, Kyiv cake, and Napoleon",
                  count: allCakes.filter(cake => cake.category === "traditional").length,
                },
                {
                  category: "Wedding Cakes",
                  icon: "💒",
                  description: "Elegant wedding cakes with Ukrainian-inspired designs",
                  count: allCakes.filter(cake => cake.category === "custom").length,
                },
                {
                  category: "Birthday Cakes",
                  icon: "🎂",
                  description: "Colorful and fun birthday cakes for all ages",
                  count: "Custom designs available",
                },
                {
                  category: "Celebration Cakes",
                  icon: "🎉",
                  description: "Special occasion cakes for anniversaries and celebrations",
                  count: "Custom designs available",
                },
              ].map((category, index) => (
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
                      {category.icon}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {category.category}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {category.description}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {category.count} cakes
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Traditional Ukrainian Cakes Gallery */}
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
              Traditional Ukrainian Cakes
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, textAlign: "center", color: "text.secondary" }}
            >
              Authentic Ukrainian cakes made with traditional recipes and techniques
            </Typography>

            {allCakes.filter(cake => cake.category === "traditional").length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                  Traditional Ukrainian Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Our traditional Ukrainian cake collection features authentic recipes from Ukraine.
                  Contact us to learn more about our Ukrainian desserts.
                </Typography>
                <Button
                  component={Link}
                  href="/contact"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Order Traditional Cake
                </Button>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {allCakes
                  .filter(cake => cake.category === "traditional")
                  .map(cake => (
                    <Grid item xs={12} sm={6} md={4} key={cake._id}>
                      <CakeCard cake={cake} />
                    </Grid>
                  ))}
              </Grid>
            )}
          </Box>

          {/* Custom Cakes Gallery */}
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
              Custom Cake Designs
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, textAlign: "center", color: "text.secondary" }}
            >
              Unique custom cakes designed for special occasions and celebrations
            </Typography>

            {allCakes.filter(cake => cake.category === "custom").length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                  Custom Cake Designs
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Every custom cake is uniquely designed to match your vision. Contact us to discuss
                  your custom cake requirements and view our portfolio.
                </Typography>
                <Button
                  component={Link}
                  href="/contact"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Order Custom Cake
                </Button>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {allCakes
                  .filter(cake => cake.category === "custom")
                  .map(cake => (
                    <Grid item xs={12} sm={6} md={4} key={cake._id}>
                      <CakeCard cake={cake} />
                    </Grid>
                  ))}
              </Grid>
            )}
          </Box>

          {/* Design Inspiration */}
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
              Design Inspiration
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Our cake designs draw inspiration from Ukrainian culture, traditional patterns, and
              modern aesthetics. Each cake tells a story and creates a memorable experience.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  inspiration: "Ukrainian Folk Art",
                  icon: "🎨",
                  description:
                    "Traditional Ukrainian embroidery patterns, floral motifs, and geometric designs inspire our cake decorations.",
                  elements: [
                    "Embroidery patterns",
                    "Floral motifs",
                    "Geometric designs",
                    "Traditional colors",
                  ],
                },
                {
                  inspiration: "Nature & Seasons",
                  icon: "🌿",
                  description:
                    "Ukrainian landscapes, seasonal flowers, and natural elements influence our cake designs and color palettes.",
                  elements: [
                    "Seasonal flowers",
                    "Natural textures",
                    "Landscape colors",
                    "Organic shapes",
                  ],
                },
                {
                  inspiration: "Cultural Heritage",
                  icon: "🏛️",
                  description:
                    "Ukrainian cultural symbols, traditional celebrations, and family traditions inspire meaningful cake designs.",
                  elements: [
                    "Cultural symbols",
                    "Traditional motifs",
                    "Family traditions",
                    "Celebration themes",
                  ],
                },
                {
                  inspiration: "Modern Elegance",
                  icon: "✨",
                  description:
                    "Contemporary design principles combined with Ukrainian traditions create elegant, modern cake aesthetics.",
                  elements: [
                    "Clean lines",
                    "Modern techniques",
                    "Elegant simplicity",
                    "Contemporary colors",
                  ],
                },
              ].map((inspiration, index) => (
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
                        {inspiration.icon}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                        {inspiration.inspiration}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {inspiration.description}
                    </Typography>
                    <Box>
                      {inspiration.elements.map((element, idx) => (
                        <Chip
                          key={idx}
                          label={element}
                          size="small"
                          sx={{
                            m: 0.5,
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Customer Testimonials */}
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
              What Our Customers Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Maria K.",
                  review:
                    "The Medovik cake was absolutely perfect! It tasted exactly like my grandmother used to make. Beautiful presentation and authentic Ukrainian flavors.",
                  rating: "⭐⭐⭐⭐⭐",
                },
                {
                  name: "Oleksandr P.",
                  review:
                    "Our wedding cake was stunning! The Ukrainian-inspired design was elegant and the traditional flavors were a hit with all our guests.",
                  rating: "⭐⭐⭐⭐⭐",
                },
                {
                  name: "Anna L.",
                  review:
                    "The Kyiv cake exceeded all expectations. The meringue was perfectly crisp and the chocolate filling was rich and delicious.",
                  rating: "⭐⭐⭐⭐⭐",
                },
                {
                  name: "Dmytro S.",
                  review:
                    "Amazing attention to detail and authentic Ukrainian taste. The cake was not only beautiful but also incredibly delicious.",
                  rating: "⭐⭐⭐⭐⭐",
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {testimonial.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}
                    >
                      "{testimonial.review}"
                    </Typography>
                    <Typography variant="body1" sx={{ color: "primary.main" }}>
                      {testimonial.rating}
                    </Typography>
                  </Box>
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
              Ready to Order Your Perfect Cake?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
              Contact us to discuss your cake requirements and bring your vision to life
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
                Order Your Cake
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
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
