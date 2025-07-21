import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Cake Sizes Guide Leeds | How Many People Does a Cake Serve | Cake Portion Guide | Olgish Cakes",
  description:
    "Complete cake sizes guide for Leeds. Learn how many people each cake size serves, portion sizes, and party planning tips. Ukrainian cake sizing guide for all occasions.",
  keywords:
    "cake sizes Leeds, how many people does a cake serve, cake portion guide, cake serving sizes, party cake sizes, wedding cake sizes, birthday cake sizes, cake planning guide",
  openGraph: {
    title: "Cake Sizes Guide Leeds | How Many People Does a Cake Serve | Cake Portion Guide",
    description:
      "Complete cake sizes guide for Leeds. Learn how many people each cake size serves, portion sizes, and party planning tips. Ukrainian cake sizing guide for all occasions.",
    url: "https://olgishcakes.co.uk/cake-sizes-guide",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cake-sizes-guide.jpg",
        width: 1200,
        height: 630,
        alt: "Cake Sizes Guide - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Sizes Guide Leeds | How Many People Does a Cake Serve | Cake Portion Guide",
    description:
      "Complete cake sizes guide for Leeds. Learn how many people each cake size serves, portion sizes, and party planning tips.",
    images: ["https://olgishcakes.co.uk/images/cake-sizes-guide.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-sizes-guide",
  },
};

export default function CakeSizesGuidePage() {
  return (
    <>
      <Script
        id="cake-sizes-guide-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "Cake Sizes Guide",
            description: "Guide to choosing the right cake size for your event.",
            image: "https://olgishcakes.co.uk/images/cake-size-guide.jpg",
            step: [
              {
                "@type": "HowToStep",
                name: "Determine Guest Count",
                text: "Count the number of guests.",
              },
              {
                "@type": "HowToStep",
                name: "Select Cake Size",
                text: "Choose a cake size based on servings needed.",
              },
              {
                "@type": "HowToStep",
                name: "Order with Buffer",
                text: "Order a slightly larger cake for leftovers.",
              },
            ],
            url: "https://olgishcakes.co.uk/cake-sizes-guide",
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
              Cake Sizes Guide
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
              Not sure what size cake you need? Our comprehensive guide helps you choose the perfect
              cake size for your celebration. From intimate gatherings to large parties, we have the
              right size for every occasion.
            </Typography>
            <Chip
              label="Complete Cake Sizing Guide"
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

          {/* Cake Sizes Table */}
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
              Cake Size Chart
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Use this comprehensive chart to determine the right cake size for your celebration.
              Portion sizes are based on standard 1" x 2" slices, but can be adjusted for larger or
              smaller servings.
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Cake Size
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Diameter
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Standard Servings
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Large Servings
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      Best For
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      size: "6 inch",
                      diameter: "15 cm",
                      standard: "8-12 people",
                      large: "6-8 people",
                      bestFor: "Small family celebrations, intimate gatherings, couples",
                    },
                    {
                      size: "8 inch",
                      diameter: "20 cm",
                      standard: "15-20 people",
                      large: "10-15 people",
                      bestFor: "Medium parties, family gatherings, small office celebrations",
                    },
                    {
                      size: "10 inch",
                      diameter: "25 cm",
                      standard: "25-30 people",
                      large: "18-25 people",
                      bestFor: "Large family gatherings, medium parties, milestone birthdays",
                    },
                    {
                      size: "12 inch",
                      diameter: "30 cm",
                      standard: "35-40 people",
                      large: "25-35 people",
                      bestFor: "Large parties, corporate events, big celebrations",
                    },
                    {
                      size: "14 inch",
                      diameter: "35 cm",
                      standard: "45-55 people",
                      large: "35-45 people",
                      bestFor: "Very large parties, weddings, major celebrations",
                    },
                    {
                      size: "16 inch",
                      diameter: "40 cm",
                      standard: "60-70 people",
                      large: "45-55 people",
                      bestFor: "Weddings, large corporate events, major celebrations",
                    },
                  ].map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:nth-of-type(odd)": { backgroundColor: "rgba(0,0,0,.02)" } }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                        {row.size}
                      </TableCell>
                      <TableCell>{row.diameter}</TableCell>
                      <TableCell>{row.standard}</TableCell>
                      <TableCell>{row.large}</TableCell>
                      <TableCell>{row.bestFor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Occasion-Specific Sizing */}
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
              Cake Sizes by Occasion
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  occasion: "Birthday Parties",
                  icon: "🎂",
                  sizes: [
                    "Children's parties: 6-8 inch (8-20 people)",
                    "Adult parties: 8-10 inch (15-30 people)",
                    "Large celebrations: 12-14 inch (35-55 people)",
                  ],
                  tips: "Consider if you want leftovers and the age of guests",
                },
                {
                  occasion: "Weddings",
                  icon: "💒",
                  sizes: [
                    "Small weddings: 10-12 inch (25-40 people)",
                    "Medium weddings: 12-14 inch (35-55 people)",
                    "Large weddings: 14-16 inch (45-70 people)",
                  ],
                  tips: "Many couples choose tiered cakes for visual impact",
                },
                {
                  occasion: "Corporate Events",
                  icon: "🏢",
                  sizes: [
                    "Small meetings: 6-8 inch (8-20 people)",
                    "Department parties: 10-12 inch (25-40 people)",
                    "Company events: 12-16 inch (35-70 people)",
                  ],
                  tips: "Consider dietary restrictions and professional presentation",
                },
                {
                  occasion: "Family Gatherings",
                  icon: "👨‍👩‍👧‍👦",
                  sizes: [
                    "Small family: 6-8 inch (8-20 people)",
                    "Extended family: 10-12 inch (25-40 people)",
                    "Large family: 12-14 inch (35-55 people)",
                  ],
                  tips: "Ukrainian families often prefer larger portions",
                },
              ].map((occasion, index) => (
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
                        {occasion.icon}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                        {occasion.occasion}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      {occasion.sizes.map((size, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          sx={{ mb: 1, color: "text.secondary" }}
                        >
                          {size}
                        </Typography>
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.main" }}>
                      {occasion.tips}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Ukrainian Cake Sizing */}
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
              Ukrainian Cake Sizing Traditions
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Ukrainian cake traditions often call for generous portions and larger cakes, as
              sharing food is a central part of Ukrainian hospitality and celebration culture.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  tradition: "Generous Portions",
                  description:
                    "Ukrainian hospitality tradition calls for generous cake portions. Guests should never leave hungry, so consider ordering slightly larger than standard recommendations.",
                },
                {
                  tradition: "Family Sharing",
                  description:
                    "Ukrainian cakes are often shared among extended family and friends. Larger cakes ensure everyone can enjoy the traditional flavors and hospitality.",
                },
                {
                  tradition: "Celebration Sizes",
                  description:
                    "Ukrainian celebrations typically involve more guests and longer gatherings, requiring larger cakes to accommodate the extended celebration period.",
                },
                {
                  tradition: "Traditional Sizes",
                  description:
                    "Traditional Ukrainian cakes like Medovik and Kyiv cake are often made in larger sizes to serve multiple generations and extended family members.",
                },
              ].map((tradition, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {tradition.tradition}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tradition.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Party Planning Tips */}
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
              Party Planning Tips
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  tip: "Count Your Guests",
                  description:
                    "Always count your confirmed guests and add 2-3 extra servings for unexpected guests or larger appetites.",
                  icon: "👥",
                },
                {
                  tip: "Consider the Occasion",
                  description:
                    "Weddings and formal events typically require larger portions, while casual gatherings can use standard portions.",
                  icon: "🎉",
                },
                {
                  tip: "Think About Leftovers",
                  description:
                    "Ukrainian cakes keep well and make excellent leftovers. Consider ordering slightly larger if you want cake for the next day.",
                  icon: "🍰",
                },
                {
                  tip: "Dietary Considerations",
                  description:
                    "If you have guests with dietary restrictions, you might need additional smaller cakes or alternative options.",
                  icon: "🥗",
                },
                {
                  tip: "Time of Day",
                  description:
                    "Evening events typically require smaller portions as guests may have already eaten, while afternoon events need larger portions.",
                  icon: "⏰",
                },
                {
                  tip: "Ukrainian Hospitality",
                  description:
                    "Ukrainian tradition emphasizes generous hospitality, so consider ordering larger cakes to ensure no guest goes without.",
                  icon: "🇺🇦",
                },
              ].map((tip, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: "2.5rem" }}>
                      {tip.icon}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {tip.tip}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tip.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Pricing by Size */}
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
              Pricing by Size
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Our pricing is based on cake size and complexity. Larger cakes offer better value per
              serving, while smaller cakes are perfect for intimate celebrations.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  size: "6 inch",
                  standardPrice: "From £35",
                  individualPrice: "From £45",
                  value: "Best for small gatherings",
                },
                {
                  size: "8 inch",
                  standardPrice: "From £45",
                  individualPrice: "From £55",
                  value: "Most popular size",
                },
                {
                  size: "10 inch",
                  standardPrice: "From £60",
                  individualPrice: "From £75",
                  value: "Great value per serving",
                },
                {
                  size: "12 inch",
                  standardPrice: "From £80",
                  individualPrice: "From £100",
                  value: "Best value for large parties",
                },
              ].map((size, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {size.size}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Standard: {size.standardPrice}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Individual: {size.individualPrice}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {size.value}
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
              Need Help Choosing the Right Size?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
              Contact us for personalized advice on choosing the perfect cake size for your
              celebration
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
                Get Size Advice
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View Our Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
