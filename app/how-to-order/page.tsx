import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { InteractiveLink } from "./InteractiveLink";

export const metadata: Metadata = {
  title: "How to Order Cake | Cake Ordering Process | Custom Cake Orders | Olgish Cakes",
  description:
    "Complete guide to ordering Ukrainian cakes. Step-by-step cake ordering process, consultation details, payment options, and delivery information. Easy cake ordering in Leeds.",
  keywords:
    "how to order cake, cake ordering process, custom cake orders, cake consultation, cake payment, cake delivery, order Ukrainian cake, cake ordering guide",
  openGraph: {
    title: "How to Order Cake | Cake Ordering Process | Custom Cake Orders",
    description:
      "Complete guide to ordering Ukrainian cakes. Step-by-step cake ordering process, consultation details, payment options, and delivery information. Easy cake ordering in Leeds.",
    url: "https://olgishcakes.co.uk/how-to-order",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/how-to-order.jpg",
        width: 1200,
        height: 630,
        alt: "How to Order Cake - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Order Cake | Cake Ordering Process | Custom Cake Orders",
    description:
      "Complete guide to ordering Ukrainian cakes. Step-by-step cake ordering process, consultation details, payment options, and delivery information.",
    images: ["https://olgishcakes.co.uk/images/how-to-order.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/how-to-order",
  },
};

export default function HowToOrderPage() {
  return (
    <>
      <Script
        id="how-to-order-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Order a Ukrainian Cake",
            description:
              "Complete guide to ordering Ukrainian cakes. Step-by-step cake ordering process, consultation details, payment options, and delivery information. Easy cake ordering in Leeds.",
            image: "https://olgishcakes.co.uk/images/how-to-order.jpg",
            totalTime: "PT30M",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "GBP",
              value: "25",
            },
            step: [
              {
                "@type": "HowToStep",
                name: "Initial Contact",
                text: "Contact us via phone (+44 786 721 8194), email (hello@olgishcakes.co.uk), or our online form to discuss your cake requirements.",
              },
              {
                "@type": "HowToStep",
                name: "Consultation",
                text: "We'll discuss your vision, preferences, dietary requirements, and event details including cake design, theme, flavor, and size selection.",
              },
              {
                "@type": "HowToStep",
                name: "Design & Quote",
                text: "We'll create a custom design proposal and provide a detailed quote with pricing breakdown and delivery details.",
              },
              {
                "@type": "HowToStep",
                name: "Confirmation & Deposit",
                text: "Once you're happy with the design and quote, we'll confirm your order. A 50% deposit is required to secure your order.",
              },
              {
                "@type": "HowToStep",
                name: "Cake Creation",
                text: "We'll create your cake with regular updates and photos during the process, including quality control checks.",
              },
              {
                "@type": "HowToStep",
                name: "Delivery & Payment",
                text: "Your cake is delivered fresh and beautiful, with final payment due upon delivery.",
              },
            ],
            url: "https://olgishcakes.co.uk/how-to-order",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How to Order" }]} />
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
              How to Order Your Cake
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
              Ordering your perfect Ukrainian cake is easy! Follow our simple step-by-step process
              to get your custom cake from consultation to delivery. We're here to make your cake
              ordering experience smooth and enjoyable.
            </Typography>
            <Chip
              label="Simple Ordering Process"
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

          {/* Quick Start Guide */}
          <Alert severity="info" sx={{ mb: 6 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Quick Start:
            </Typography>
            <Typography variant="body2">
              For urgent orders (within 48 hours), please call us directly. For standard orders, we
              recommend at least 1 week notice, and for custom designs, 2-3 weeks notice.
            </Typography>
          </Alert>

          {/* Step-by-Step Process */}
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
              Step-by-Step Ordering Process
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Initial Contact",
                  description:
                    "Contact us via phone, email, or our online form to discuss your cake requirements",
                  details: [
                    "Call us: +44 786 721 8194",
                    "Email: hello@olgishcakes.co.uk",
                    "Online contact form",
                    "WhatsApp messaging available",
                  ],
                  links: [
                    { text: "+44 786 721 8194", href: "tel:+447867218194" },
                    { text: "hello@olgishcakes.co.uk", href: "mailto:hello@olgishcakes.co.uk" },
                  ],
                  icon: "📞",
                },
                {
                  step: "2",
                  title: "Consultation",
                  description:
                    "We'll discuss your vision, preferences, dietary requirements, and event details",
                  details: [
                    "Cake design and theme discussion",
                    "Flavor and size selection",
                    "Dietary requirements review",
                    "Event date and timing confirmation",
                  ],
                  icon: "💬",
                },
                {
                  step: "3",
                  title: "Design & Quote",
                  description: "We'll create a custom design proposal and provide a detailed quote",
                  details: [
                    "Custom design sketches or descriptions",
                    "Detailed pricing breakdown",
                    "Ingredient and flavor options",
                    "Delivery and setup details",
                  ],
                  icon: "✏️",
                },
                {
                  step: "4",
                  title: "Confirmation & Deposit",
                  description:
                    "Once you're happy with the design and quote, we'll confirm your order",
                  details: [
                    "50% deposit required to secure your order",
                    "Order confirmation sent via email",
                    "Production timeline provided",
                    "Final details confirmed",
                  ],
                  icon: "✅",
                },
                {
                  step: "5",
                  title: "Cake Creation",
                  description:
                    "We'll create your cake with regular updates and photos during the process",
                  details: [
                    "Regular progress updates",
                    "Photos of cake creation process",
                    "Quality control checks",
                    "Final approval before delivery",
                  ],
                  icon: "🎂",
                },
                {
                  step: "6",
                  title: "Delivery & Payment",
                  description: "Your cake is delivered fresh and beautiful, with final payment due",
                  details: [
                    "Professional delivery service",
                    "Careful handling and setup",
                    "Final payment collection",
                    "Post-delivery support",
                  ],
                  icon: "🚚",
                },
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
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
                        {step.icon}
                      </Typography>
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
                          fontWeight: 600,
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        {step.step}
                      </Box>
                      <Typography
                        variant="h3"
                        component="h4"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {step.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {step.description}
                    </Typography>
                    <Box>
                      {step.details.map((detail, idx) => {
                        // Check if this detail contains contact information that should be a link
                        const link = step.links?.find(link => detail.includes(link.text));

                        if (link) {
                          return (
                            <Typography
                              key={idx}
                              variant="body2"
                              sx={{ mb: 1, fontSize: "0.9rem" }}
                            >
                              • {detail.split(link.text)[0]}
                              <InteractiveLink
                                text={link.text}
                                href={link.href}
                                sx={{
                                  textDecoration: "none",
                                  color: "inherit",
                                  fontWeight: 500,
                                }}
                              />
                              {detail.split(link.text)[1]}
                            </Typography>
                          );
                        }

                        return (
                          <Typography key={idx} variant="body2" sx={{ mb: 1, fontSize: "0.9rem" }}>
                            • {detail}
                          </Typography>
                        );
                      })}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Consultation Details */}
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
              Consultation Details
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Our consultation process is designed to understand your vision and create the perfect
              cake for your special occasion. We offer multiple consultation options to suit your
              preferences.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  type: "Phone Consultation",
                  icon: "📞",
                  description:
                    "Quick and convenient consultation over the phone to discuss your cake requirements",
                  duration: "15-30 minutes",
                  bestFor: "Simple orders and quick questions",
                },
                {
                  type: "Video Consultation",
                  icon: "📹",
                  description:
                    "Face-to-face consultation via video call to discuss designs and show examples",
                  duration: "30-45 minutes",
                  bestFor: "Custom designs and detailed planning",
                },
                {
                  type: "In-Person Consultation",
                  icon: "👥",
                  description:
                    "Personal consultation at our location with cake tasting and design discussion",
                  duration: "45-60 minutes",
                  bestFor: "Wedding cakes and complex designs",
                },
                {
                  type: "Email Consultation",
                  icon: "📧",
                  description: "Detailed consultation via email with photos and design references",
                  duration: "24-48 hours response",
                  bestFor: "Non-urgent orders and detailed specifications",
                },
              ].map((consultation, index) => (
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
                      {consultation.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h4"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {consultation.type}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {consultation.description}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                      Duration: {consultation.duration}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "primary.main" }}>
                      {consultation.bestFor}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Payment Information */}
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
              Payment Information
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  method: "Deposit Payment",
                  icon: "💰",
                  amount: "50% of total order value",
                  when: "Required to secure your order",
                  methods: ["Bank transfer", "Cash", "Card payment"],
                  description: "Secures your order date and begins the cake creation process",
                },
                {
                  method: "Final Payment",
                  icon: "💳",
                  amount: "Remaining 50%",
                  when: "Due before delivery or collection",
                  methods: ["Bank transfer", "Cash", "Card payment"],
                  description: "Final payment ensures your cake is ready for delivery",
                },
                {
                  method: "Full Payment",
                  icon: "💵",
                  amount: "100% of total order value",
                  when: "For orders under £50 or urgent orders",
                  methods: ["Bank transfer", "Cash", "Card payment"],
                  description: "Full payment upfront for smaller or urgent orders",
                },
                {
                  method: "Wedding Cakes",
                  icon: "💒",
                  amount: "50% deposit, 50% final",
                  when: "Deposit on booking, final payment 1 week before",
                  methods: ["Bank transfer", "Cash", "Card payment"],
                  description: "Special payment terms for wedding cake orders",
                },
              ].map((payment, index) => (
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
                        {payment.icon}
                      </Typography>
                      <Typography
                        variant="h3"
                        component="h4"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {payment.method}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                      {payment.amount}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      <strong>When:</strong> {payment.when}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {payment.methods.map((method, idx) => (
                        <Chip
                          key={idx}
                          label={method}
                          size="small"
                          sx={{
                            m: 0.5,
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.9rem", color: "text.secondary" }}
                    >
                      {payment.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Ordering Timeline */}
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
              Ordering Timeline
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Planning ahead ensures the best results for your cake. Here's our recommended timeline
              for different types of orders.
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  type: "Standard Cakes",
                  notice: "1 week minimum",
                  recommended: "2-3 weeks",
                  description: "Traditional Ukrainian cakes and simple custom designs",
                  process: "Design consultation → Order confirmation → Cake creation → Delivery",
                },
                {
                  type: "Custom Cakes",
                  notice: "2 weeks minimum",
                  recommended: "3-4 weeks",
                  description: "Complex designs, themed cakes, and special decorations",
                  process:
                    "Detailed consultation → Design approval → Order confirmation → Creation → Delivery",
                },
                {
                  type: "Wedding Cakes",
                  notice: "1 month minimum",
                  recommended: "2-3 months",
                  description: "Wedding cakes with consultations and tastings",
                  process:
                    "Initial consultation → Tasting session → Design approval → Order confirmation → Creation → Delivery",
                },
                {
                  type: "Urgent Orders",
                  notice: "48 hours minimum",
                  recommended: "3-5 days",
                  description: "Last-minute orders (subject to availability)",
                  process: "Quick consultation → Immediate confirmation → Rush creation → Delivery",
                },
              ].map((timeline, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Typography
                      variant="h4"
                      component="h4"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {timeline.type}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                      Minimum Notice: {timeline.notice}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                      Recommended: {timeline.recommended}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      {timeline.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                      {timeline.process}
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
              Ready to Order Your Cake?
            </Typography>
            <Typography variant="h4" component="h4" sx={{ mb: 4, color: "text.secondary" }}>
              Contact us today to start your cake ordering journey
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
                Start Your Order
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
