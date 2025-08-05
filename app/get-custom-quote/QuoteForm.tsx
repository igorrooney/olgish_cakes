"use client";

import {
  ArrowBackIcon,
  ArrowForwardIcon,
  CakeOutlinedIcon,
  CelebrationIcon,
  CloudUploadIcon,
  DeleteIcon,
  InfoIcon,
  LocalShippingIcon,
} from "@/lib/mui-optimization";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en-gb";
import { motion } from "framer-motion";
import { useState } from "react";
import { borderRadius, colors, shadows, typography } from "../../lib/design-system";

// Set British locale for date formatting
dayjs.locale("en-gb");

interface FormData {
  name: string;
  email: string;
  phone: string;
  occasion: string;
  dateNeeded: Dayjs | null;
  guestCount: string;
  cakeType: string;
  designStyle: string;
  flavors: string[];
  dietaryRequirements: string[];
  budget: string;
  specialRequests: string;
  designImage: File | null;
}

const occasions = [
  "Wedding",
  "Birthday",
  "Anniversary",
  "Christening",
  "Graduation",
  "Corporate Event",
  "Other",
];

const cakeTypes = [
  "Traditional Honey Cake (Medovik)",
  "Kyiv Cake",
  "Wedding Cake",
  "Birthday Cake",
  "Anniversary Cake",
  "Custom Design",
];

const designStyles = [
  "Traditional Ukrainian",
  "Modern Minimalist",
  "Rustic Countryside",
  "Elegant Classic",
  "Whimsical Fun",
  "Floral Garden",
  "Geometric Modern",
];

const flavorOptions = [
  "Honey (Traditional)",
  "Chocolate",
  "Vanilla",
  "Strawberry",
  "Lemon",
  "Coffee",
  "Caramel",
  "Nuts (Hazelnut, Walnut)",
  "Fruit (Berries, Citrus)",
  "Spices (Cinnamon, Cardamom)",
];

const dietaryOptions = [
  "Gluten-Free",
  "Dairy-Free",
  "Egg-Free",
  "Nut-Free",
  "Vegan",
  "Low Sugar",
  "None",
];

const budgetRanges = [
  "Under £50",
  "£50 - £100",
  "£100 - £200",
  "£200 - £300",
  "£300 - £500",
  "£500+",
  "Flexible",
];

const steps = [
  {
    label: "Basic Information",
    icon: <InfoIcon />,
    description: "Tell us about yourself and your event",
  },
  {
    label: "Cake Details",
    icon: <CakeOutlinedIcon />,
    description: "Describe your dream cake",
  },
  {
    label: "Design & Style",
    icon: <CelebrationIcon />,
    description: "Choose your preferred design style",
  },
  {
    label: "Delivery & Budget",
    icon: <LocalShippingIcon />,
    description: "Delivery details and budget considerations",
  },
];

export function QuoteForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    occasion: "",
    dateNeeded: null,
    guestCount: "",
    cakeType: "",
    designStyle: "",
    flavors: [],
    dietaryRequirements: [],
    budget: "",
    specialRequests: "",
    designImage: null,
  });

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value),
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, designImage: file }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, designImage: null }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("occasion", formData.occasion);
      formDataToSend.append(
        "dateNeeded",
        formData.dateNeeded ? formData.dateNeeded.format("YYYY-MM-DD") : ""
      );
      formDataToSend.append("guestCount", formData.guestCount);
      formDataToSend.append("cakeType", formData.cakeType);
      formDataToSend.append("designStyle", formData.designStyle);
      formDataToSend.append("flavors", formData.flavors.join(", "));
      formDataToSend.append("dietaryRequirements", formData.dietaryRequirements.join(", "));
      formDataToSend.append("budget", formData.budget);
      formDataToSend.append("specialRequests", formData.specialRequests);
      if (formData.designImage) {
        formDataToSend.append("designImage", formData.designImage);
      }

      const response = await fetch("/api/quote", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to send quote request");
      }

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        phone: "",
        occasion: "",
        dateNeeded: null,
        guestCount: "",
        cakeType: "",
        designStyle: "",
        flavors: [],
        dietaryRequirements: [],
        budget: "",
        specialRequests: "",
        designImage: null,
      });
      setActiveStep(0);

      // Show success notification
      setNotification({
        open: true,
        message:
          "🎂 Thank you! Your quote request has been sent successfully. We'll review your requirements and get back to you within 24 hours with a detailed proposal.",
        severity: "success",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      setNotification({
        open: true,
        message:
          "❌ There was an error sending your quote request. Please try again or contact us directly at hello@olgishcakes.co.uk",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.name && formData.email && formData.phone && formData.occasion;
      case 1:
        return formData.cakeType && formData.guestCount;
      case 2:
        return formData.designStyle;
      case 3:
        return formData.dateNeeded !== null && formData.budget;
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange("email", e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={e => handleInputChange("phone", e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Occasion</InputLabel>
                  <Select
                    value={formData.occasion}
                    label="Occasion"
                    onChange={e => handleInputChange("occasion", e.target.value)}
                  >
                    {occasions.map(occasion => (
                      <MenuItem key={occasion} value={occasion}>
                        {occasion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Cake Type</InputLabel>
                  <Select
                    value={formData.cakeType}
                    label="Cake Type"
                    onChange={e => handleInputChange("cakeType", e.target.value)}
                  >
                    {cakeTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Guests"
                  type="number"
                  value={formData.guestCount}
                  onChange={e => handleInputChange("guestCount", e.target.value)}
                  required
                  helperText="This helps us determine the appropriate cake size"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h3" component="h3" sx={{ mb: 2, color: colors.primary.main }}>
                  Preferred Flavors
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {flavorOptions.map(flavor => (
                    <FormControlLabel
                      key={flavor}
                      control={
                        <Checkbox
                          checked={formData.flavors.includes(flavor)}
                          onChange={e => handleArrayChange("flavors", flavor, e.target.checked)}
                        />
                      }
                      label={flavor}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Design Style</InputLabel>
                  <Select
                    value={formData.designStyle}
                    label="Design Style"
                    onChange={e => handleInputChange("designStyle", e.target.value)}
                  >
                    {designStyles.map(style => (
                      <MenuItem key={style} value={style}>
                        {style}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date Needed"
                  value={formData.dateNeeded}
                  onChange={newValue => handleInputChange("dateNeeded", newValue)}
                  disablePast
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      sx: { mb: 2 },
                      placeholder: "DD/MM/YYYY",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h3" component="h3" sx={{ mb: 2, color: colors.primary.main }}>
                  Dietary Requirements
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {dietaryOptions.map(requirement => (
                    <FormControlLabel
                      key={requirement}
                      control={
                        <Checkbox
                          checked={formData.dietaryRequirements.includes(requirement)}
                          onChange={e =>
                            handleArrayChange("dietaryRequirements", requirement, e.target.checked)
                          }
                        />
                      }
                      label={requirement}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: `2px dashed ${colors.border.medium}`,
                    borderRadius: borderRadius.lg,
                    p: 3,
                    textAlign: "center",
                    backgroundColor: colors.background.subtle,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: colors.primary.main,
                      backgroundColor: colors.background.warm,
                    },
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    id="design-image-upload"
                    aria-label="Upload design reference image"
                  />
                  <label htmlFor="design-image-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Upload Design Reference
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary">
                    Upload a photo or design reference to help us understand your vision
                  </Typography>
                  {formData.designImage && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={removeImage}
                        color="error"
                      >
                        Remove {formData.designImage.name}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Budget Range</InputLabel>
                  <Select
                    value={formData.budget}
                    label="Budget Range"
                    onChange={e => handleInputChange("budget", e.target.value)}
                  >
                    {budgetRanges.map(range => (
                      <MenuItem key={range} value={range}>
                        {range}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Requests or Additional Details"
                  multiline
                  rows={4}
                  value={formData.specialRequests}
                  onChange={e => handleInputChange("specialRequests", e.target.value)}
                  placeholder="Tell us about any specific requirements, color preferences, themes, or special requests..."
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: borderRadius.xl,
            backgroundColor: colors.background.paper,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 3,
              textAlign: "center",
              color: colors.primary.main,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            Get Your Custom Cake Quote
          </Typography>

          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor:
                          activeStep >= index ? colors.primary.main : colors.grey[300],
                        color:
                          activeStep >= index ? colors.primary.contrast : colors.text.secondary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  <Typography
                    variant="h4"
                    component="h4"
                    sx={{ fontWeight: typography.fontWeight.semibold }}
                  >
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>{renderStepContent(index)}</Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      startIcon={<ArrowBackIcon />}
                      variant="outlined"
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                      disabled={!isStepValid(activeStep) || isSubmitting}
                      endIcon={activeStep === steps.length - 1 ? undefined : <ArrowForwardIcon />}
                      sx={{
                        backgroundColor: colors.primary.main,
                        "&:hover": { backgroundColor: colors.primary.dark },
                        minWidth: activeStep === steps.length - 1 ? "200px" : "auto",
                      }}
                    >
                      {isSubmitting
                        ? "Sending..."
                        : activeStep === steps.length - 1
                          ? "Submit Quote Request"
                          : "Next"}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>

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
              borderRadius: borderRadius.lg,
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
      </Container>
    </LocalizationProvider>
  );
}
