import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title:
    "Ukrainian Baking Classes Leeds | Learn Ukrainian Cake Making | Traditional Baking Workshops | Olgish Cakes",
  description:
    "Learn authentic Ukrainian baking in Leeds. Traditional cake making workshops, Ukrainian baking classes, and hands-on tutorials. Master honey cake, Kyiv cake, and traditional Ukrainian desserts with professional baker Olga.",
  keywords:
    "Ukrainian baking classes Leeds, Ukrainian cake making workshops, traditional Ukrainian baking, honey cake baking class, Kyiv cake tutorial, Ukrainian dessert workshops, baking lessons Leeds",
  openGraph: {
    title:
      "Ukrainian Baking Classes Leeds | Learn Ukrainian Cake Making | Traditional Baking Workshops",
    description:
      "Learn authentic Ukrainian baking in Leeds. Traditional cake making workshops, Ukrainian baking classes, and hands-on tutorials. Master honey cake, Kyiv cake, and traditional Ukrainian desserts.",
    url: "https://olgishcakes.co.uk/ukrainian-baking-classes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/ukrainian-baking-classes.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Baking Classes Leeds - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Ukrainian Baking Classes Leeds | Learn Ukrainian Cake Making | Traditional Baking Workshops",
    description:
      "Learn authentic Ukrainian baking in Leeds. Traditional cake making workshops, Ukrainian baking classes, and hands-on tutorials.",
    images: ["https://olgishcakes.co.uk/images/ukrainian-baking-classes.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/ukrainian-baking-classes",
  },
};

const classes = [
  {
    id: 1,
    title: "Honey Cake Masterclass",
    description:
      "Learn to make the traditional Ukrainian honey cake from scratch. Master the art of layering and cream filling.",
    duration: "3 hours",
    price: "Â£75",
    level: "Intermediate",
    maxStudents: 6,
    includes: ["All ingredients", "Recipe booklet", "Take-home cake", "Tea & coffee"],
    image: "/images/classes/honey-cake-class.jpg",
  },
  {
    id: 2,
    title: "Kyiv Cake Workshop",
    description:
      "Create the elegant Kyiv cake with chocolate layers, meringue, and hazelnut filling. Advanced techniques included.",
    duration: "4 hours",
    price: "Â£95",
    level: "Advanced",
    maxStudents: 4,
    includes: ["All ingredients", "Recipe booklet", "Take-home cake", "Lunch provided"],
    image: "/images/classes/kyiv-cake-class.jpg",
  },
  {
    id: 3,
    title: "Ukrainian Baking Basics",
    description:
      "Introduction to Ukrainian baking traditions and essential techniques. Perfect for beginners.",
    duration: "2.5 hours",
    price: "Â£60",
    level: "Beginner",
    maxStudents: 8,
    includes: ["All ingredients", "Recipe booklet", "Take-home treats", "Tea & coffee"],
    image: "/images/classes/basics-class.jpg",
  },
  {
    id: 4,
    title: "Seasonal Ukrainian Desserts",
    description:
      "Learn to make seasonal Ukrainian desserts including Christmas honey cake and Easter specialties.",
    duration: "3.5 hours",
    price: "Â£85",
    level: "Intermediate",
    maxStudents: 6,
    includes: ["All ingredients", "Recipe booklet", "Take-home desserts", "Seasonal refreshments"],
    image: "/images/classes/seasonal-class.jpg",
  },
];

export default function UkrainianBakingClassesPage() {
  return (
    <>
      <Script
        id="ukrainian-baking-classes-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: "Ukrainian Baking Classes Leeds",
            description:
              "Join Ukrainian baking classes in Leeds. Learn to bake traditional cakes and pastries.",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: "Olgish Cakes Studio",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Leeds",
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
            },
            organizer: {
              "@type": "Organization",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
            },
            url: "https://olgishcakes.co.uk/ukrainian-baking-classes",
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
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Ukrainian Baking Classes" }]}
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
              Ukrainian Baking Classes Leeds
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
              Learn authentic Ukrainian baking from professional baker Olga. Master traditional
              Ukrainian cakes like honey cake, Kyiv cake, and seasonal desserts in our hands-on
              workshops. Discover the secrets of Ukrainian baking traditions.
            </Typography>
            <Chip
              label="Learn from Professional Ukrainian Baker"
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

          {/* Class Features */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Why Choose Our Ukrainian Baking Classes?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "Professional Instruction",
                  description:
                    "Learn from Olga, a professionally trained Ukrainian baker with years of experience in traditional Ukrainian baking.",
                  icon: "ðŸ‘©â€ðŸ³",
                },
                {
                  title: "Authentic Recipes",
                  description:
                    "Master authentic Ukrainian recipes passed down through generations. Learn traditional techniques and methods.",
                  icon: "ðŸ“œ",
                },
                {
                  title: "Small Group Classes",
                  description:
                    "Intimate class sizes ensure personalized attention and hands-on guidance throughout the baking process.",
                  icon: "ðŸ‘¥",
                },
                {
                  title: "Take-Home Treats",
                  description:
                    "Take your freshly baked Ukrainian cakes home to share with family and friends. Practice what you've learned.",
                  icon: "ðŸŽ",
                },
              ].map((feature, index) => (
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
                      {feature.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                      {feature.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Available Classes */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Available Classes
            </Typography>
            <Grid container spacing={4}>
              {classes.map((classItem, index) => (
                <Grid item xs={12} md={6} key={index}>
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
                        height: 250,
                        backgroundImage: `url(${classItem.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <Box sx={{ p: 3 }}>
                      <Typography
                        variant="h4"
                        sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                      >
                        {classItem.title}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {classItem.description}
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            <strong>Duration:</strong> {classItem.duration}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            <strong>Level:</strong> {classItem.level}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            <strong>Max Students:</strong> {classItem.maxStudents}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            <strong>Price:</strong> {classItem.price}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Typography variant="h4" component="h4" sx={{ mb: 2, fontWeight: 600 }}>
                        What's Included:
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        {classItem.includes.map((item, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            sx={{ mb: 0.5, color: "text.secondary" }}
                          >
                            â€¢ {item}
                          </Typography>
                        ))}
                      </Box>

                      <Button
                        variant="contained"
                        component={Link}
                        href="/contact"
                        sx={{
                          backgroundColor: "primary.main",
                          width: "100%",
                          py: 1.5,
                          "&:hover": {
                            backgroundColor: "primary.dark",
                          },
                        }}
                      >
                        Book This Class
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Class Schedule */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #2E3192 0%, #FEF102 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
                Class Schedule
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    Weekly Classes:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Tuesday: Ukrainian Baking Basics (6:30 PM)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Thursday: Honey Cake Masterclass (6:30 PM)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Saturday: Kyiv Cake Workshop (10:00 AM)
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    â€¢ Sunday: Seasonal Ukrainian Desserts (2:00 PM)
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    Special Events:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Private Group Classes (Any day)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Corporate Team Building
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    â€¢ Hen Parties & Celebrations
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    â€¢ Children's Baking Parties
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Class Location */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Class Location & Facilities
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}>
                    Our Baking Studio
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Our fully equipped baking studio is located in the heart of Leeds, providing the
                    perfect environment for learning Ukrainian baking traditions.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Each student has their own workstation with professional equipment, ensuring a
                    hands-on learning experience.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    The studio is easily accessible by public transport and has parking available
                    nearby.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}>
                    What to Bring
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    â€¢ Comfortable clothing and closed-toe shoes
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    â€¢ Apron (provided if you don't have one)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    â€¢ Enthusiasm and willingness to learn
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    â€¢ Container to take your creations home
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Student Testimonials */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              What Our Students Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Jennifer from Leeds",
                  text: "The honey cake masterclass was incredible! Olga is such a patient teacher and I learned so much about Ukrainian baking traditions. My family loved the cake I made!",
                  class: "Honey Cake Masterclass",
                },
                {
                  name: "Mark from Bradford",
                  text: "As a complete beginner, I was nervous about the Kyiv cake workshop, but Olga made it so easy to follow. The cake turned out perfectly and tasted amazing!",
                  class: "Kyiv Cake Workshop",
                },
                {
                  name: "Sophie from Harrogate",
                  text: "The seasonal desserts class was wonderful. I learned to make traditional Ukrainian Christmas cakes and can't wait to make them for my family this year.",
                  class: "Seasonal Ukrainian Desserts",
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ mb: 3, fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    <Typography
                      variant="h4"
                      component="h4"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {testimonial.class}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
              Ready to Learn Ukrainian Baking?
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Book your spot in one of our Ukrainian baking classes and discover the art of
              traditional Ukrainian cake making. Spaces are limited, so book early to secure your
              place!
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
                Book a Class
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
                Contact for Private Classes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}

