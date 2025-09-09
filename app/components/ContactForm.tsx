"use client";

import { designTokens } from "@/lib/design-system";
import {
  BodyText,
  PrimaryButton,
  StyledTextField,
  TouchTargetWrapper,
  AccessibleIconButton,
} from "@/lib/ui-components";
import {
  CloudUploadIcon,
  DeleteIcon,
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
} from "@/lib/mui-optimization";
import { AdapterDayjs, DatePicker, LocalizationProvider } from "@/lib/mui-optimization";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState, useMemo } from "react";

// Configure dayjs for British locale
dayjs.locale("en-gb");

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

const MotionBox = motion.create(Box);

interface FormData {
  name: string;
  address?: string;
  city?: string;
  postcode?: string;
  email: string;
  phone: string;
  cakeInterest?: string;
  dateNeeded: Dayjs | null;
  message: string;
  designImage?: File;
}

interface ContactFormProps {
  onSubmit?: (formData: FormData) => Promise<void>;
  isSubmitting?: boolean;
  submitStatus?: "success" | "error" | null;
  hideCakeInterest?: boolean;
  isOrderForm?: boolean;
  buttonText?: string;
  showImageUpload?: boolean;
  showButton?: boolean;
  showAddress?: boolean;
  showDate?: boolean;
  showPostcode?: boolean;
  showCity?: boolean;
  requireMessage?: boolean;
  // When true, suppresses rendering of JSON-LD to avoid duplicates in modals
  suppressStructuredData?: boolean;
}

const formFieldAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export function ContactForm({
  onSubmit,
  isSubmitting: externalIsSubmitting,
  submitStatus: externalSubmitStatus,
  hideCakeInterest = false,
  isOrderForm = false,
  buttonText = isOrderForm ? "Send Order Inquiry" : "Send Message",
  showImageUpload = false,
  showButton = true,
  showAddress = false,
  showDate = true,
  showPostcode = false,
  showCity = false,
  requireMessage = true,
  suppressStructuredData = false,
}: ContactFormProps = {}) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    city: "",
    postcode: "",
    email: "",
    phone: "",
    cakeInterest: "",
    dateNeeded: null,
    message: "",
  });
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [internalSubmitStatus, setInternalSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = externalIsSubmitting ?? internalIsSubmitting;
  const submitStatus = externalSubmitStatus ?? internalSubmitStatus;

  // Generate comprehensive structured data for contact form
  const contactFormStructuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: isOrderForm ? "Cake Order Form" : "Contact Form",
      description: isOrderForm
        ? "Order your custom Ukrainian honey cake from Olgish Cakes in Leeds"
        : "Get in touch with Olgish Cakes for custom cake inquiries and orders",
      url: "https://olgishcakes.co.uk/contact",
      mainEntity: {
        "@type": "ContactForm",
        name: isOrderForm ? "Cake Order Form" : "Contact Form",
        description: "Contact form for cake inquiries and orders",
        provider: {
          "@type": "Organization",
          name: "Olgish Cakes",
          url: "https://olgishcakes.co.uk",
          description: "Authentic Ukrainian honey cakes made with love in Leeds",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Allerton Grange",
            addressLocality: "Leeds",
            addressRegion: "West Yorkshire",
            postalCode: "LS17",
            addressCountry: "GB",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+44 786 721 8194",
            email: "hello@olgishcakes.co.uk",
            contactType: "customer service",
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            availableLanguage: "English",
          },
        },
        // Form fields structured data
        hasPart: [
          {
            "@type": "PropertyValueSpecification",
            valueName: "name",
            valueRequired: true,
            description: "Your full name",
          },
          {
            "@type": "PropertyValueSpecification",
            valueName: "email",
            valueRequired: true,
            description: "Your email address",
          },
          {
            "@type": "PropertyValueSpecification",
            valueName: "phone",
            valueRequired: true,
            description: "Your phone number",
          },
          {
            "@type": "PropertyValueSpecification",
            valueName: "message",
            valueRequired: true,
            description: "Your message or cake requirements",
          },
        ],
      },
      // Local business context
      isPartOf: {
        "@type": "LocalBusiness",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
        description: "Authentic Ukrainian honey cakes made with love in Leeds",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Allerton Grange",
          addressLocality: "Leeds",
          addressRegion: "West Yorkshire",
          postalCode: "LS17",
          addressCountry: "GB",
        },
        areaServed: {
          "@type": "City",
          name: "Leeds",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Ukrainian Cake Collection",
          description: "Traditional Ukrainian honey cakes and custom designs",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Ukrainian Honey Cake",
                description: "Traditional Ukrainian honey cake (Medovik)",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Custom Wedding Cakes",
                description: "Custom designed wedding cakes",
              },
            },
          ],
        },
      },
    }),
    [isOrderForm]
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setInternalSubmitStatus(null);
  }

  function handleDateChange(newValue: Dayjs | null) {
    setFormData(prevData => ({ ...prevData, dateNeeded: newValue }));
    setInternalSubmitStatus(null);
  }

  function formatPostcode(value: string) {
    return value.replace(/\s+/g, "").toUpperCase().replace(/([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})/, "$1 $2");
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prevData => ({ ...prevData, designImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveImage() {
    setFormData(prevData => ({ ...prevData, designImage: undefined }));
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onSubmit) {
      await onSubmit(formData);
      return;
    }

    setInternalIsSubmitting(true);
    setInternalSubmitStatus(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      if (formData.address) {
        formDataToSend.append("address", formData.address);
      }
      if (formData.city) {
        formDataToSend.append("city", formData.city);
      }
      if (formData.postcode) {
        formDataToSend.append("postcode", formData.postcode);
      }
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      if (formData.cakeInterest) {
        formDataToSend.append("cakeInterest", formData.cakeInterest);
      }
      if (showDate && formData.dateNeeded) {
        formDataToSend.append("dateNeeded", formData.dateNeeded.toISOString());
      }
      formDataToSend.append("message", formData.message);
      if (formData.designImage) {
        formDataToSend.append("designImage", formData.designImage);
      }
      formDataToSend.append("isOrderForm", isOrderForm.toString());

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setInternalSubmitStatus("success");
      setFormData({
        name: "",
        address: "",
        city: "",
        postcode: "",
        email: "",
        phone: "",
        cakeInterest: "",
        dateNeeded: null,
        message: "",
      });
      setPreviewUrl(null);
    } catch (error) {
      console.error("Form submission error:", error);
      setInternalSubmitStatus("error");
    } finally {
      setInternalIsSubmitting(false);
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      {/* Enhanced Structured Data for SEO (suppressed when embedded in modal) */}
      {!suppressStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(contactFormStructuredData),
          }}
        />
      )}

      <Box
        component="form"
        id="contact-form"
        onSubmit={handleSubmit}
        role="form"
        aria-label={isOrderForm ? "Cake order form" : "Contact form"}
        itemScope
        itemType="https://schema.org/ContactForm"
      >
        <Stack spacing={spacing.lg}>
          {[
            <StyledTextField
              key="name"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              disabled={isSubmitting}
              placeholder="Enter your full name"
              size="medium"
              aria-label="Full name"
              aria-required="true"
            />,
            showAddress ? (
              <StyledTextField
                key="address"
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                fullWidth
                disabled={isSubmitting}
                placeholder="Enter your address"
                size="medium"
                aria-label="Address"
                aria-required="true"
              />
            ) : null,
            showCity ? (
              <StyledTextField
                key="city"
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                fullWidth
                disabled={isSubmitting}
                placeholder="Enter your city"
                size="medium"
                aria-label="City"
                aria-required="true"
              />
            ) : null,
            showPostcode ? (
              <StyledTextField
                key="postcode"
                label="Postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                onBlur={() =>
                  setFormData(prev => ({ ...prev, postcode: formatPostcode(prev.postcode || "") }))
                }
                required
                fullWidth
                disabled={isSubmitting}
                placeholder="e.g. LS1 2AB"
                size="medium"
                inputProps={{
                  pattern: "^[A-Za-z]{1,2}\\d[A-Za-z\\d]? ?\\d[A-Za-z]{2}$",
                  title: "Enter a valid UK postcode (e.g. LS1 2AB)",
                }}
                aria-label="Postcode"
                aria-required="true"
              />
            ) : null,
            <StyledTextField
              key="email"
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              disabled={isSubmitting}
              placeholder="Enter your email address"
              size="medium"
              aria-label="Email address"
              aria-required="true"
            />,
            <StyledTextField
              key="phone"
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              fullWidth
              disabled={isSubmitting}
              placeholder="Enter your phone number"
              size="medium"
            />,
          ].map((field, index) => (
            <MotionBox key={index} {...formFieldAnimation} transition={{ delay: index * 0.1 }}>
              {field}
            </MotionBox>
          ))}

          {!hideCakeInterest && (
            <MotionBox {...formFieldAnimation} transition={{ delay: 0.3 }}>
              <StyledTextField
                label="Cake Interest"
                name="cakeInterest"
                value={formData.cakeInterest}
                onChange={handleChange}
                fullWidth
                disabled={isSubmitting}
                placeholder="What type of cake are you interested in?"
                size="medium"
              />
            </MotionBox>
          )}

          {showDate && (
            <MotionBox {...formFieldAnimation} transition={{ delay: 0.4 }}>
              <DatePicker
                label="Date Needed"
                value={formData.dateNeeded}
                onChange={handleDateChange}
                disabled={isSubmitting}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "medium",
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: borderRadius.lg,
                        backgroundColor: colors.background.paper,
                        "& fieldset": {
                          borderColor: colors.border.medium,
                        },
                        "&:hover fieldset": {
                          borderColor: colors.border.dark,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary.main,
                        },
                      },
                    },
                  },
                }}
              />
            </MotionBox>
          )}

          <MotionBox {...formFieldAnimation} transition={{ delay: 0.5 }}>
            <StyledTextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required={requireMessage}
              fullWidth
              multiline
              rows={4}
              disabled={isSubmitting}
              placeholder={
                isOrderForm
                  ? "Tell us about your cake requirements, any special requests, or dietary restrictions..."
                  : "How can we help you?"
              }
              size="medium"
              aria-required={requireMessage ? "true" : undefined}
            />
          </MotionBox>

          {showImageUpload && (
            <MotionBox {...formFieldAnimation} transition={{ delay: 0.6 }}>
              <Box
                sx={{
                  border: `2px dashed ${colors.border.medium}`,
                  borderRadius: borderRadius.lg,
                  p: spacing.lg,
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
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  disabled={isSubmitting}
                  id="design-image-upload"
                  aria-label="Upload design reference image"
                />
                {!previewUrl ? (
                  <Box
                    onClick={() => !isSubmitting && fileInputRef.current?.click()}
                    sx={{
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    <CloudUploadIcon
                      sx={{
                        fontSize: "3rem",
                        color: colors.text.secondary,
                        mb: spacing.sm,
                      }}
                    />
                    <BodyText sx={{ color: colors.text.secondary, mb: spacing.sm }}>
                      {isSubmitting
                        ? "Upload disabled during submission..."
                        : "Click to upload design reference image"}
                    </BodyText>
                    <BodyText
                      sx={{
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.sm,
                        fontStyle: "italic",
                      }}
                    >
                      (Optional) JPG, PNG up to 5MB
                    </BodyText>
                  </Box>
                ) : (
                  <Box>
                    <Box
                      sx={{
                        position: "relative",
                        display: "inline-block",
                        mb: spacing.md,
                      }}
                    >
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        style={{
                          objectFit: "cover",
                          borderRadius: borderRadius.md,
                        }}
                        priority
                      />
                      <AccessibleIconButton
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                        ariaLabel="Remove uploaded image"
                        title="Remove uploaded image"
                        sx={{
                          position: "absolute",
                          top: -spacing.sm,
                          right: -spacing.sm,
                          backgroundColor: colors.error.main,
                          color: "white",
                          minWidth: "48px", // WCAG touch target requirement with extra padding
                          minHeight: "48px", // WCAG touch target requirement with extra padding
                          width: "48px",
                          height: "48px",
                          padding: "12px", // Ensure adequate padding
                          "&:hover": {
                            backgroundColor: colors.error.dark,
                          },
                          opacity: isSubmitting ? 0.6 : 1,
                        }}
                      >
                        <DeleteIcon />
                      </AccessibleIconButton>
                    </Box>
                    <BodyText sx={{ color: colors.text.secondary }}>
                      Image uploaded successfully
                    </BodyText>
                  </Box>
                )}
              </Box>
            </MotionBox>
          )}

          <AnimatePresence>
            {submitStatus && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  severity={submitStatus}
                  sx={{
                    borderRadius: borderRadius.lg,
                    "& .MuiAlert-icon": {
                      color: submitStatus === "success" ? colors.success.main : colors.error.main,
                    },
                  }}
                >
                  <AlertTitle sx={{ fontWeight: typography.fontWeight.semibold }}>
                    {submitStatus === "success" ? "Message Sent!" : "Error"}
                  </AlertTitle>
                  <BodyText>
                    {submitStatus === "success"
                      ? "Thank you for your message. We'll get back to you soon!"
                      : "There was an error sending your message. Please try again."}
                  </BodyText>
                </Alert>
              </MotionBox>
            )}
          </AnimatePresence>

          {showButton && (
            <MotionBox {...formFieldAnimation} transition={{ delay: 0.7 }}>
              <PrimaryButton
                type="submit"
                disabled={isSubmitting}
                fullWidth
                sx={{
                  py: spacing.md,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {isSubmitting ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                    <CircularProgress size={20} sx={{ color: "inherit" }} />
                    Sending...
                  </Box>
                ) : (
                  buttonText
                )}
              </PrimaryButton>
            </MotionBox>
          )}
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
