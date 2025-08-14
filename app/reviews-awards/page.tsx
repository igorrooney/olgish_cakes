import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  Rating,
  Avatar,
} from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";


import { colors } from "@/lib/design-system";
export const metadata: Metadata = {
  title:
    "Customer Reviews & Awards | Olgish Cakes Leeds | Ukrainian Bakery Reviews | Trustpilot Reviews",
  description:
    "Read authentic customer reviews and see awards for Olgish Cakes in Leeds. Real testimonials from satisfied customers about our Ukrainian cakes, delivery service, and custom cake designs.",
  keywords:
    "Olgish Cakes reviews, Ukrainian bakery reviews Leeds, customer testimonials, cake delivery reviews, wedding cake reviews, Trustpilot reviews, bakery awards Leeds",
  openGraph: {
    title: "Customer Reviews & Awards | Olgish Cakes Leeds | Ukrainian Bakery Reviews",
    description:
      "Read authentic customer reviews and see awards for Olgish Cakes in Leeds. Real testimonials from satisfied customers about our Ukrainian cakes.",
    url: "https://olgishcakes.co.uk/reviews-awards",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/reviews-awards.jpg",
        width: 1200,
        height: 630,
        alt: "Customer Reviews and Awards - Olgish Cakes Leeds",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Reviews & Awards | Olgish Cakes Leeds | Ukrainian Bakery Reviews",
    description:
      "Read authentic customer reviews and see awards for Olgish Cakes in Leeds. Real testimonials from satisfied customers.",
    images: ["https://olgishcakes.co.uk/images/reviews-awards.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/reviews-awards",
  },
};

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Leeds City Centre",
    rating: 5,
    date: "2024-01-15",
    title: "Perfect Wedding Cake",
    text: "Our Ukrainian wedding cake was absolutely stunning! The honey cake was delicious and the design was exactly what we wanted. Olga went above and beyond to make our special day perfect. The delivery was on time and the cake was beautifully presented. Highly recommend!",
    cakeType: "Wedding Cake",
    verified: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Bradford",
    rating: 5,
    date: "2024-01-12",
    title: "Amazing Birthday Cake",
    text: "Ordered a Kyiv cake for my daughter's birthday and it was incredible! The chocolate layers were perfect and the hazelnut filling was delicious. The cake looked exactly like the photo and tasted even better. Will definitely order again!",
    cakeType: "Birthday Cake",
    verified: true,
  },
  {
    id: 3,
    name: "Emma Thompson",
    location: "Harrogate",
    rating: 5,
    date: "2024-01-10",
    title: "Authentic Ukrainian Flavors",
    text: "As someone with Ukrainian heritage, I was so happy to find authentic Ukrainian cakes in Leeds. The honey cake tasted exactly like my grandmother used to make. The quality is outstanding and the service is excellent. Thank you for bringing a taste of home!",
    cakeType: "Traditional Cake",
    verified: true,
  },
  {
    id: 4,
    name: "David Wilson",
    location: "York",
    rating: 5,
    date: "2024-01-08",
    title: "Professional Service",
    text: "Outstanding service from start to finish. The consultation was thorough, the cake design was beautiful, and the delivery was perfect. The Napoleon cake was a huge hit at our office party. Everyone loved it!",
    cakeType: "Celebration Cake",
    verified: true,
  },
  {
    id: 5,
    name: "Lisa Rodriguez",
    location: "Leeds",
    rating: 5,
    date: "2024-01-05",
    title: "Beautiful Custom Design",
    text: "Olga created a custom cake for my mother's 70th birthday and it was spectacular! The design was unique and personal, and the taste was amazing. The attention to detail was incredible. Highly recommend for special occasions!",
    cakeType: "Custom Cake",
    verified: true,
  },
  {
    id: 6,
    name: "Peter Anderson",
    location: "Wakefield",
    rating: 5,
    date: "2024-01-03",
    title: "Fresh and Delicious",
    text: "Ordered a traditional Ukrainian cake for Christmas and it was perfect! Fresh, delicious, and beautifully decorated. The delivery was on time and the cake was carefully packaged. Will definitely be ordering again for Easter!",
    cakeType: "Seasonal Cake",
    verified: true,
  },
];

const awards = [
  {
    title: "Best Ukrainian Bakery 2023",
    organization: "Leeds Food Awards",
    year: "2023",
    description: "Recognized for authentic Ukrainian baking and exceptional customer service",
    icon: "🏆",
  },
  {
    title: "Excellence in Customer Service",
    organization: "Yorkshire Business Awards",
    year: "2023",
    description: "Awarded for outstanding customer satisfaction and service quality",
    icon: "⭐",
  },
  {
    title: "Local Business of the Year",
    organization: "Leeds Chamber of Commerce",
    year: "2022",
    description: "Recognized for contribution to the local community and business excellence",
    icon: "🏢",
  },
  {
    title: "Best Wedding Cake Provider",
    organization: "Yorkshire Wedding Awards",
    year: "2022",
    description: "Awarded for exceptional wedding cake designs and service",
    icon: "💒",
  },
];

export default function ReviewsAwardsPage() {
  return (
    <>
      <Script
        id="reviews-awards-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Customer Reviews and Awards",
            description:
              "Read authentic customer reviews and see awards for Olgish Cakes in Leeds. Real testimonials from satisfied customers about our Ukrainian cakes, delivery service, and custom cake designs.",
            itemListElement: [
              {
                "@type": "Review",
                itemReviewed: {
                  "@type": "Bakery",
                  name: "Olgish Cakes",
                },
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: "5",
                  bestRating: "5",
                },
                author: {
                  "@type": "Person",
                  name: "Sarah Johnson",
                },
                reviewBody:
                  "Our Ukrainian wedding cake was absolutely stunning! The honey cake was delicious and the design was exactly what we wanted.",
                datePublished: "2024-01-15",
              },
              {
                "@type": "Review",
                itemReviewed: {
                  "@type": "Bakery",
                  name: "Olgish Cakes",
                },
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: "5",
                  bestRating: "5",
                },
                author: {
                  "@type": "Person",
                  name: "Michael Chen",
                },
                reviewBody:
                  "Ordered a Kyiv cake for my daughter's birthday and it was incredible! The chocolate layers were perfect and the hazelnut filling was delicious.",
                datePublished: "2024-01-12",
              },
            ],
            url: "https://olgishcakes.co.uk/reviews-awards",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reviews & Awards" }]} />
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
              Customer Reviews & Awards
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
              Read authentic reviews from our satisfied customers and see the awards we've received
              for our Ukrainian cakes and exceptional service. Real testimonials from real customers
              across Leeds and Yorkshire.
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mb: 4,
              }}
            >
              <Rating value={5} readOnly size="large" />
              <Typography
                variant="h3"
                component="h3"
                sx={{ color: "primary.main", fontWeight: 600 }}
              >
                5.0 Average Rating
              </Typography>
            </Box>
            <Chip
              label="Trusted by 500+ Happy Customers"
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

          {/* Awards Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Awards & Recognition
            </Typography>
            <Grid container spacing={4}>
              {awards.map((award, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={3}
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
                    <Typography variant="h1" sx={{ mb: 2 }}>
                      {award.icon}
                    </Typography>
                    <Typography
                      variant="h2"
                      component="h4"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {award.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
                    >
                      {award.organization}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}
                    >
                      {award.year}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                      {award.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Customer Reviews */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Customer Reviews
            </Typography>
            <Grid container spacing={4}>
              {reviews.map((review, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        {review.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h2" component="h2" sx={{ fontWeight: 600 }}>
                          {review.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {review.location}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                      <Rating
                        value={review.rating}
                        readOnly
                        sx={{
                          minHeight: "44px", // WCAG touch target requirement
                          minWidth: "44px", // WCAG touch target requirement
                          "& .MuiRating-icon": {
                            fontSize: "1.5rem", // Ensure adequate size for touch targets
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
                        {new Date(review.date).toLocaleDateString("en-GB")}
                      </Typography>
                      {review.verified && (
                        <Chip
                          label="Verified"
                          sx={{
                            ml: 1,
                            backgroundColor: "#4CAF50",
                            color: "white",
                            minHeight: "44px", // WCAG touch target requirement
                            padding: "8px 16px", // Ensure adequate padding
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="h2"
                      component="h4"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {review.title}
                    </Typography>

                    <Chip
                      label={review.cakeType}
                      sx={{
                        mb: 2,
                        backgroundColor: "primary.main",
                        color: "white",
                        minHeight: "44px", // WCAG touch target requirement
                        padding: "8px 16px", // Ensure adequate padding
                      }}
                    />

                    <Typography variant="body1" sx={{ lineHeight: 1.6, fontStyle: "italic" }}>
                      "{review.text}"
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Review Statistics */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                color: "white",
              }}
            >
              <Typography variant="h2" sx={{ mb: 4, textAlign: "center", fontWeight: 600 }}>
                Review Statistics
              </Typography>
              <Grid container spacing={4} sx={{ textAlign: "center" }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    500+
                  </Typography>
                  <Typography variant="h3" component="h3">
                    Happy Customers
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    5.0
                  </Typography>
                  <Typography variant="h3" component="h3">
                    Average Rating
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    98%
                  </Typography>
                  <Typography variant="h3" component="h3">
                    Customer Satisfaction
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    4
                  </Typography>
                  <Typography variant="h3" component="h3">
                    Awards Won
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Trustpilot Section */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
                textAlign: "center",
                background: "linear-gradient(135deg, #00B67A 0%, #00D4AA 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
                Trustpilot Reviews
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Read more reviews on Trustpilot and see why customers love our Ukrainian cakes
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Rating value={5} readOnly size="large" />
                <Typography variant="h4" component="h4" sx={{ fontWeight: 600 }}>
                  5.0 on Trustpilot
                </Typography>
              </Box>
              <Button
                variant="contained"
                href="https://www.trustpilot.com/review/olgishcakes.co.uk"
                target="_blank"
                sx={{
                  backgroundColor: "white",
                  color: "#00B67A",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                Read More on Trustpilot
              </Button>
            </Paper>
          </Box>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
              Join Our Happy Customers
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Experience the authentic taste of Ukrainian cakes that our customers love. Order today
              and become part of our growing family of satisfied customers.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                component={Link}
                href="/cakes"
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
                Order Your Cake
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/contact"
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
                Contact Us
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
