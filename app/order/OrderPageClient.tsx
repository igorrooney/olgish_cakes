"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Rating,
} from "@/lib/mui-optimization";
import {
  CakeIcon,
  LocalShippingIcon,
  DesignServicesIcon,
  CheckCircleIcon,
  ExpandMoreIcon,
  PhoneIcon,
  EmailIcon,
  ScheduleIcon,
  LocationOnIcon,
} from "@/lib/mui-optimization";
import { ContactForm } from "@/app/components/ContactForm";
import { colors, typography, spacing, shadows } from "@/lib/design-system";
import AnimatedWrapper from "../components/AnimatedWrapper";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { OrderTestimonials } from "./OrderTestimonials";
import dynamic from "next/dynamic";

// Lazy load components for better performance
const LazyContactForm = dynamic(
  () => import("@/app/components/ContactForm").then(mod => ({ default: mod.ContactForm })),
  {
    loading: () => <div>Loading form...</div>,
    ssr: false,
  }
);

interface OrderOption {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const orderOptions: OrderOption[] = [
  {
    id: "browse-catalog",
    title: "Browse Our Catalog",
    description: "Choose from our curated collection of premium cakes",
    price: "From £25",
    features: [
      "Ready-to-order designs",
      "Premium ingredients",
      "Fast delivery",
      "Professional packaging",
      "Quality guarantee",
    ],
    icon: <CakeIcon sx={{ fontSize: 40, color: colors.primary.main }} />,
  },
  {
    id: "custom-design",
    title: "Custom Design",
    description: "Create your perfect cake with professional consultation",
    price: "From £45",
    features: [
      "Personal consultation",
      "Custom design sketches",
      "Unlimited revisions",
      "Premium ingredients",
      "Professional photography",
      "Delivery included",
    ],
    popular: true,
    icon: <DesignServicesIcon sx={{ fontSize: 40, color: colors.secondary.main }} />,
  },
];

const deliveryAreas = [
  "Leeds City Centre",
  "Headingley",
  "Chapel Allerton",
  "Roundhay",
  "Moortown",
  "Alwoodley",
  "Horsforth",
  "Pudsey",
  "Otley",
  "Ilkley",
  "Wakefield",
  "Bradford",
  "Halifax",
  "Huddersfield",
];

export function OrderPageClient() {
  const [selectedOption, setSelectedOption] = useState<string>("browse-catalog");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const steps = [
    {
      label: "Choose Order Type",
      description: "Select between browsing our catalog or custom design",
    },
    {
      label: "Fill Order Form",
      description: "Provide your details and requirements",
    },
    {
      label: "Review & Submit",
      description: "We'll review and get back to you within 24 hours",
    },
  ];

  const handleOptionSelect = useCallback((optionId: string) => {
    setSelectedOption(optionId);
    setIsFormVisible(true);
    setActiveStep(1);

    // Track option selection for analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "order_option_select", {
        option_id: optionId,
        option_name: orderOptions.find(opt => opt.id === optionId)?.title,
      });
    }

    // Smooth scroll to the form title after a delay to ensure it's rendered
    setTimeout(() => {
      const formTitle = document.getElementById("order-form-title");
      if (formTitle) {
        formTitle.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 300);
  }, []);

  // Handle scrolling when form becomes visible
  useEffect(() => {
    if (isFormVisible && selectedOption) {
      const timer = setTimeout(() => {
        const formTitle = document.getElementById("order-form-title");
        if (formTitle) {
          formTitle.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isFormVisible, selectedOption]);

  const selectedOrderOption = useMemo(
    () => orderOptions.find(opt => opt.id === selectedOption),
    [selectedOption]
  );

  const handleFormSubmit = useCallback(
    async (formData: any) => {
      setIsSubmitting(true);

      // Track form submission for analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "order_form_submit", {
          order_option: selectedOption,
          form_type: "order_page",
        });
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("phone", formData.phone);
        if (formData.dateNeeded) {
          formDataToSend.append("dateNeeded", formData.dateNeeded.format("YYYY-MM-DD"));
        }
        formDataToSend.append("message", formData.message);
        if (formData.designImage) {
          formDataToSend.append("designImage", formData.designImage);
        }
        formDataToSend.append("isOrderForm", "true");
        formDataToSend.append("orderType", selectedOrderOption?.title || "");

        const response = await fetch("/api/contact", {
          method: "POST",
          body: formDataToSend,
        });

        if (!response.ok) {
          throw new Error("Failed to send order inquiry");
        }

        // Show success notification
        setNotification({
          open: true,
          message:
            "🎂 Thank you! Your order inquiry has been sent successfully. We'll review your requirements and get back to you within 24 hours with a detailed quote.",
          severity: "success",
        });

        // Reset form visibility and progress
        setIsFormVisible(false);
        setSelectedOption("browse-catalog");
        setActiveStep(2);
      } catch (error) {
        console.error("Form submission error:", error);
        setNotification({
          open: true,
          message:
            "❌ There was an error sending your order inquiry. Please try again or contact us directly at hello@olgishcakes.co.uk",
          severity: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedOption, selectedOrderOption]
  );

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Order", href: "/order" },
          ]}
        />
      </Container>
      {/* Hero Section - Matching Cakes Page Style */}
      <Box
        className="relative w-full"
        sx={{
          background:
            "linear-gradient(to bottom, rgba(245, 245, 244, 0.5), rgba(255, 255, 255, 0.8))",
          borderBottom: "1px solid rgba(231, 229, 228, 0.3)",
          backdropFilter: "blur(8px)",
          py: { xs: 8, sm: 10, md: 12, lg: 16 },
        }}
      >
        {/* Decorative elements */}
        <Box
          className="absolute inset-0 overflow-hidden pointer-events-none"
          sx={{
            "&::before": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: "0",
              right: "0",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.03), transparent)",
            },
          }}
        >
          <Box
            className="absolute inset-0"
            sx={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.02) 0%, transparent 50%)",
            }}
          />
        </Box>

        <Container
          maxWidth="lg"
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatedWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Box
              className="text-center"
              sx={{
                maxWidth: { xs: "100%", sm: "85%", md: "800px" },
                mx: "auto",
                px: { xs: 2, sm: 0 },
              }}
            >
              <Typography
                variant="overline"
                component="h1"
                sx={{
                  color: "text.secondary",
                  letterSpacing: "0.2em",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  fontWeight: 500,
                  mb: { xs: 3, sm: 4 },
                  opacity: 0.85,
                }}
              >
                ORDER YOUR PERFECT CAKE
              </Typography>

              <Typography
                variant="h1"
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: {
                    xs: "2rem",
                    sm: "2.5rem",
                    md: "3.25rem",
                    lg: "3.75rem",
                  },
                  fontWeight: 500,
                  lineHeight: { xs: 1.3, sm: 1.2 },
                  letterSpacing: "-0.02em",
                  mb: { xs: 3, sm: 4 },
                  maxWidth: { sm: "90%", md: "44rem" },
                  mx: "auto",
                  background: "linear-gradient(to right, #1c1917, #44403c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  px: { xs: 1, sm: 0 },
                }}
              >
                Professional Cake Ordering Service
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  color: "text.secondary",
                  fontSize: {
                    xs: "0.975rem",
                    sm: "1.125rem",
                  },
                  lineHeight: { xs: 1.6, sm: 1.75 },
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  maxWidth: { xs: "100%", sm: "90%", md: "36rem" },
                  mx: "auto",
                  opacity: 0.85,
                  mb: { xs: 4, sm: 5 },
                }}
              >
                From traditional honey cakes to custom wedding masterpieces, we bring your vision to
                life with premium ingredients and professional craftsmanship
              </Typography>

              {/* Quick Stats */}
              <Grid container spacing={3} sx={{ justifyContent: "center" }}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 700, mb: 1, color: colors.primary.main }}
                    >
                      127+
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Happy Customers
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 700, mb: 1, color: colors.primary.main }}
                    >
                      24h
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Response Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 700, mb: 1, color: colors.primary.main }}
                    >
                      5★
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Customer Rating
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 700, mb: 1, color: colors.primary.main }}
                    >
                      Leeds
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Local Delivery
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </AnimatedWrapper>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" className="py-16">
        {/* Order Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontFamily: "var(--font-playfair-display)",
              fontWeight: 600,
              fontSize: { xs: "2rem", md: "2.5rem" },
              textAlign: "center",
              mb: 2,
            }}
          >
            Choose Your Ordering Experience
          </Typography>
          <Typography
            variant="h3"
            component="h3"
            sx={{
              fontSize: "1.25rem",
              textAlign: "center",
              mb: 6,
              color: "text.secondary",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            From quick orders to custom designs, we have the perfect option for your needs
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {orderOptions.map((option, index) => (
              <Grid item xs={12} md={4} key={option.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      minHeight: 600,
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out",
                      border:
                        selectedOption === option.id
                          ? `2px solid ${colors.primary.main}`
                          : "2px solid transparent",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: shadows.xl,
                      },
                    }}
                    onClick={() => handleOptionSelect(option.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${option.title} option`}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleOptionSelect(option.id);
                      }
                    }}
                  >
                    {option.popular && (
                      <Chip
                        label="Most Popular"
                        color="secondary"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 16,
                          zIndex: 1,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 24,
                          "& .MuiChip-label": {
                            px: 1.5,
                            py: 0.5,
                          },
                        }}
                      />
                    )}
                    <CardContent
                      sx={{
                        p: 4,
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <Box sx={{ mb: 3 }}>{option.icon}</Box>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: colors.primary.main,
                        }}
                      >
                        {option.title}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
                        {option.description}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          mb: 3,
                          color: colors.secondary.main,
                        }}
                      >
                        {option.price}
                      </Typography>
                      <List dense>
                        {option.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{
                                variant: "body2",
                                sx: { fontWeight: 500 },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{
                          mt: "auto",
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: "none",
                        }}
                      >
                        Choose This Option
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Order Form Section */}
        {isFormVisible && selectedOrderOption && (
          <Box component="section" sx={{ py: { xs: 6, md: 8 }, mt: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Progress Stepper */}
              <Box sx={{ mb: 6 }}>
                <Stepper activeStep={activeStep} orientation="horizontal">
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel>{step.label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Typography
                id="order-form-title"
                variant="h2"
                component="h2"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  fontWeight: 600,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  textAlign: "center",
                  mb: 2,
                }}
              >
                Order Your {selectedOrderOption.title}
              </Typography>
              <Typography
                variant="h3"
                component="h3"
                sx={{
                  fontSize: "1.25rem",
                  textAlign: "center",
                  mb: 6,
                  color: "text.secondary",
                }}
              >
                Complete the form below and we'll get back to you within 24 hours
              </Typography>

              {isFormVisible && selectedOrderOption && (
                <Grid container spacing={6}>
                  <Grid item xs={12} lg={8}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
                      <LazyContactForm
                        onSubmit={handleFormSubmit}
                        isOrderForm
                        showImageUpload={selectedOption === "custom-design"}
                        hideCakeInterest
                        showButton={true}
                        isSubmitting={isSubmitting}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Box sx={{ position: "sticky", top: 24 }}>
                      {/* Order Summary */}
                      <Paper
                        elevation={0}
                        sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "primary.50" }}
                      >
                        <Typography variant="h3" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                          Order Summary
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedOrderOption.title}
                          </Typography>
                          <Typography
                            variant="h3"
                            component="h4"
                            color="primary.main"
                            sx={{ fontWeight: 700 }}
                          >
                            {selectedOrderOption.price}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <List dense>
                          {selectedOrderOption.features.slice(0, 3).map((feature, index) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={feature}
                                primaryTypographyProps={{ variant: "body2" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>

                      {/* Contact Information */}
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h3" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                          Need Help?
                        </Typography>
                        <List dense>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <PhoneIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Call Us"
                              secondary={
                                <Link
                                  href="tel:+441131234567"
                                  style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                    fontWeight: 500,
                                  }}
                                  aria-label="Call us at +44 113 123 4567"
                                >
                                  +44 113 123 4567
                                </Link>
                              }
                              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <EmailIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Email Us"
                              secondary={
                                <Link
                                  href="mailto:hello@olgishcakes.co.uk"
                                  style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                    fontWeight: 500,
                                  }}
                                  aria-label="Email us at hello@olgishcakes.co.uk"
                                >
                                  hello@olgishcakes.co.uk
                                </Link>
                              }
                              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <ScheduleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Response Time"
                              secondary="Within 24 hours"
                              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </motion.div>
          </Box>
        )}

        {/* Delivery Areas */}
        <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                fontSize: { xs: "2rem", md: "2.5rem" },
                textAlign: "center",
                mb: 2,
              }}
            >
              Delivery Areas
            </Typography>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontSize: "1.25rem",
                textAlign: "center",
                mb: 6,
                color: "text.secondary",
              }}
            >
              We deliver to Leeds and surrounding areas
            </Typography>

            <Grid container spacing={2}>
              {deliveryAreas.map((area, index) => (
                <Grid item xs={6} sm={4} md={3} key={area}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Chip
                      label={area}
                      variant="outlined"
                      color="primary"
                      icon={<LocationOnIcon />}
                      sx={{ width: "100%", py: 1 }}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Alert severity="info" sx={{ maxWidth: 600, mx: "auto" }}>
                <AlertTitle>Delivery Information</AlertTitle>
                Free delivery within Leeds city centre. Additional charges may apply for areas
                outside Leeds. Contact us for specific delivery quotes.
              </Alert>
            </Box>
          </motion.div>
        </Box>

        {/* Customer Testimonials Section */}
        <OrderTestimonials />

        {/* FAQ Section */}
        <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 600,
                fontSize: { xs: "2rem", md: "2.5rem" },
                textAlign: "center",
                mb: 6,
              }}
            >
              Frequently Asked Questions
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h3" component="h3" sx={{ fontWeight: 600 }}>
                      How far in advance should I order?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      We recommend ordering at least 1-2 weeks in advance for standard cakes and 4-6
                      weeks for custom designs and wedding cakes. For urgent orders, please contact
                      us directly.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h3" component="h3" sx={{ fontWeight: 600 }}>
                      Do you offer dietary options?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      Yes! We offer gluten-free, dairy-free, egg-free, and vegan options. All our
                      cakes can be adapted to meet your dietary requirements.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h3" component="h3" sx={{ fontWeight: 600 }}>
                      What's included in custom design?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      Custom design includes a personal consultation, design sketches, unlimited
                      revisions, premium ingredients, professional photography, and delivery within
                      Leeds area.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h3" component="h3" sx={{ fontWeight: 600 }}>
                      How much does delivery cost?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      Delivery is free within Leeds city centre. For areas outside Leeds, delivery
                      costs range from £5-15 depending on distance. We'll provide a specific quote
                      when you order.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </motion.div>
        </Box>

        {/* CTA Section */}
        <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: "center",
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                color: colors.primary.contrast,
              }}
            >
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  fontWeight: 600,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  mb: 2,
                }}
              >
                Ready to Order Your Perfect Cake?
              </Typography>
              <Typography
                variant="h3"
                component="h3"
                sx={{
                  fontSize: "1.25rem",
                  mb: 4,
                  opacity: 0.9,
                }}
              >
                Join hundreds of satisfied customers who trust us with their special occasions
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  component={Link}
                  href="/cakes"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: colors.secondary.main,
                    color: colors.secondary.contrast,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: colors.secondary.dark,
                    },
                  }}
                >
                  Browse Our Cakes
                </Button>
                <Button
                  component={Link}
                  href="/contact"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: colors.primary.contrast,
                    color: colors.primary.contrast,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: colors.primary.contrast,
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Contact Us
                </Button>
              </Box>

              {/* Related Pages Links */}
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                  Explore our cake collections:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                  <Link
                    href="/wedding-cakes"
                    style={{ textDecoration: "none" }}
                    aria-label="Browse our wedding cake collection"
                  >
                    <Chip
                      label="Wedding Cakes"
                      variant="outlined"
                      color="primary"
                      sx={{ cursor: "pointer", "&:hover": { bgcolor: "primary.50" } }}
                    />
                  </Link>
                  <Link
                    href="/birthday-cakes"
                    style={{ textDecoration: "none" }}
                    aria-label="Browse our birthday cake collection"
                  >
                    <Chip
                      label="Birthday Cakes"
                      variant="outlined"
                      color="primary"
                      sx={{ cursor: "pointer", "&:hover": { bgcolor: "primary.50" } }}
                    />
                  </Link>
                  <Link
                    href="/honey-cake-history"
                    style={{ textDecoration: "none" }}
                    aria-label="Learn about our traditional honey cakes"
                  >
                    <Chip
                      label="Honey Cakes"
                      variant="outlined"
                      color="primary"
                      sx={{ cursor: "pointer", "&:hover": { bgcolor: "primary.50" } }}
                    />
                  </Link>
                  <Link
                    href="/custom-cake-design"
                    style={{ textDecoration: "none" }}
                    aria-label="Explore our custom cake design services"
                  >
                    <Chip
                      label="Custom Design"
                      variant="outlined"
                      color="primary"
                      sx={{ cursor: "pointer", "&:hover": { bgcolor: "primary.50" } }}
                    />
                  </Link>
                  <Link
                    href="/cake-delivery"
                    style={{ textDecoration: "none" }}
                    aria-label="View our cake delivery information"
                  >
                    <Chip
                      label="Delivery Info"
                      variant="outlined"
                      color="primary"
                      sx={{ cursor: "pointer", "&:hover": { bgcolor: "primary.50" } }}
                    />
                  </Link>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Container>

      {/* Professional Notification System */}
      <Snackbar
        open={notification.open}
        autoHideDuration={8000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          zIndex: 9999,
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            minWidth: "400px",
            maxWidth: "600px",
            borderRadius: 2,
            boxShadow: shadows.lg,
            fontSize: "1rem",
            fontWeight: typography.fontWeight.medium,
            "& .MuiAlert-icon": {
              fontSize: "1.5rem",
            },
            "& .MuiAlert-message": {
              fontSize: "1rem",
              lineHeight: 1.5,
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </main>
  );
}
