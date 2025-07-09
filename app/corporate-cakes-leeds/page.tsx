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

export const metadata: Metadata = {
  title:
    "Corporate Cakes Leeds | Office Cakes | Business Catering | Ukrainian Corporate Cakes | Olgish Cakes",
  description:
    "Corporate cake catering in Leeds. Office cakes, business events, and corporate catering with Ukrainian cakes. Professional delivery service for meetings, conferences, and office celebrations.",
  keywords:
    "corporate cakes Leeds, office cakes, business catering Leeds, corporate catering, Ukrainian corporate cakes, office celebrations, business events, conference catering",
  openGraph: {
    title: "Corporate Cakes Leeds | Office Cakes | Business Catering | Ukrainian Corporate Cakes",
    description:
      "Corporate cake catering in Leeds. Office cakes, business events, and corporate catering with Ukrainian cakes. Professional delivery service for meetings, conferences, and office celebrations.",
    url: "https://olgishcakes.com/corporate-cakes-leeds",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.com/images/corporate-cakes-leeds.jpg",
        width: 1200,
        height: 630,
        alt: "Corporate Cakes Leeds - Business Catering by Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Cakes Leeds | Office Cakes | Business Catering | Ukrainian Corporate Cakes",
    description:
      "Corporate cake catering in Leeds. Office cakes, business events, and corporate catering with Ukrainian cakes. Professional delivery service.",
    images: ["https://olgishcakes.com/images/corporate-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.com/corporate-cakes-leeds",
  },
};

const corporateServices = [
  {
    title: "Office Celebrations",
    description:
      "Birthday cakes, retirement parties, promotions, and team celebrations with Ukrainian flair.",
    icon: "🎉",
    price: "From £25 per person",
  },
  {
    title: "Business Meetings",
    description:
      "Professional catering for board meetings, client presentations, and corporate events.",
    icon: "💼",
    price: "From £20 per person",
  },
  {
    title: "Conference Catering",
    description: "Large-scale catering for conferences, seminars, and corporate training events.",
    icon: "🏢",
    price: "From £15 per person",
  },
  {
    title: "Corporate Gifts",
    description: "Ukrainian cakes as corporate gifts for clients, partners, and employees.",
    icon: "🎁",
    price: "From £35 per cake",
  },
];

const corporatePackages = [
  {
    name: "Starter Package",
    description: "Perfect for small office celebrations and team meetings",
    price: "£150",
    serves: "10-15 people",
    includes: [
      "1 large Ukrainian cake",
      "Professional delivery",
      "Setup and presentation",
      "Disposable plates and cutlery",
      "Corporate branding option",
    ],
  },
  {
    name: "Business Package",
    description: "Ideal for medium-sized corporate events and client meetings",
    price: "£300",
    serves: "25-35 people",
    includes: [
      "2 large Ukrainian cakes",
      "Assorted mini cakes",
      "Professional delivery and setup",
      "Premium presentation",
      "Corporate branding included",
      "Dietary options available",
    ],
  },
  {
    name: "Corporate Package",
    description: "Comprehensive catering for large conferences and major events",
    price: "£500",
    serves: "50-75 people",
    includes: [
      "3 large Ukrainian cakes",
      "Assorted mini cakes and pastries",
      "Professional delivery and setup",
      "Premium presentation with stands",
      "Corporate branding included",
      "Dietary options available",
      "Event coordination support",
    ],
  },
];

export default function CorporateCakesLeedsPage() {
  return (
    <>
      

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
              Corporate Cakes Leeds
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
              Professional corporate catering with authentic Ukrainian cakes. Office celebrations,
              business meetings, conferences, and corporate events. Delicious Ukrainian cakes
              delivered to your workplace with professional service.
            </Typography>
            <Chip
              label="Professional Corporate Catering Service"
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

          {/* Corporate Services */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Corporate Services
            </Typography>
            <Grid container spacing={4}>
              {corporateServices.map((service, index) => (
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
                      {service.icon}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: "text.secondary", lineHeight: 1.5 }}
                    >
                      {service.description}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
                      {service.price}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Corporate Packages */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Corporate Packages
            </Typography>
            <Grid container spacing={4}>
              {corporatePackages.map((pkg, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      height: "100%",
                      borderRadius: 3,
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {pkg.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {pkg.description}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {pkg.price}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Serves {pkg.serves}
                      </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Package Includes:
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      {pkg.includes.map((item, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          sx={{ mb: 1, color: "text.secondary" }}
                        >
                          • {item}
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
                      Get Quote
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Corporate Benefits */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 4, textAlign: "center", fontWeight: 600 }}>
                Why Choose Olgish Cakes for Corporate Catering?
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Professional Service:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Reliable delivery and setup
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Professional presentation
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Flexible scheduling
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Corporate branding options
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Dietary requirement accommodation
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Quality Assurance:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Fresh, handmade cakes
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Premium ingredients
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Authentic Ukrainian recipes
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    • Consistent quality
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Food safety compliance
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Corporate Clients */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Our Corporate Clients
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  company: "Leeds City Council",
                  service: "Conference catering for 50+ attendees",
                  testimonial:
                    "Professional service and delicious Ukrainian cakes that impressed all our delegates.",
                },
                {
                  company: "Yorkshire Bank",
                  service: "Monthly office celebrations",
                  testimonial:
                    "Reliable delivery and beautiful presentation. Our team loves the Ukrainian cakes!",
                },
                {
                  company: "Leeds University",
                  service: "Academic events and seminars",
                  testimonial:
                    "Perfect catering for our international conferences. Authentic and delicious.",
                },
              ].map((client, index) => (
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
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {client.company}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {client.service}
                    </Typography>
                    <Typography variant="body1" sx={{ fontStyle: "italic", lineHeight: 1.6 }}>
                      "{client.testimonial}"
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Corporate Ordering Process */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Corporate Ordering Process
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Initial Consultation",
                  description:
                    "Contact us to discuss your corporate catering needs, event details, and dietary requirements.",
                },
                {
                  step: "2",
                  title: "Custom Quote",
                  description:
                    "We'll provide a detailed quote based on your requirements, including delivery and setup options.",
                },
                {
                  step: "3",
                  title: "Confirmation & Planning",
                  description:
                    "Once confirmed, we'll plan the delivery schedule and coordinate with your team.",
                },
                {
                  step: "4",
                  title: "Delivery & Setup",
                  description:
                    "Professional delivery and setup at your venue, ensuring everything is perfect for your event.",
                },
              ].map((step, index) => (
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
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        fontSize: "1.5rem",
                        fontWeight: 600,
                      }}
                    >
                      {step.step}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                      {step.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
              Ready to Elevate Your Corporate Events?
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Contact us today to discuss your corporate catering needs. We'll provide a custom
              quote and ensure your next business event is memorable with authentic Ukrainian cakes.
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
                Get Corporate Quote
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
                Schedule Consultation
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
