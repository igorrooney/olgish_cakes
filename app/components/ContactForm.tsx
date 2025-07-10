"use client";

import { useState, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Stack,
  Paper,
  Alert,
  AlertTitle,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { designTokens } from "@/lib/design-system";
import { StyledTextField, PrimaryButton, BodyText, SectionHeading } from "@/lib/ui-components";

const { colors, typography, spacing, borderRadius, shadows } = designTokens;

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

interface FormData {
  name: string;
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
}: ContactFormProps = {}) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
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

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setInternalSubmitStatus(null);
  }

  function handleDateChange(newValue: Dayjs | null) {
    setFormData(prevData => ({ ...prevData, dateNeeded: newValue }));
    setInternalSubmitStatus(null);
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
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      if (formData.cakeInterest) {
        formDataToSend.append("cakeInterest", formData.cakeInterest);
      }
      if (formData.dateNeeded) {
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        id="contact-form"
        onSubmit={handleSubmit}
        role="form"
        aria-label="Contact form"
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

          <MotionBox {...formFieldAnimation} transition={{ delay: 0.5 }}>
            <StyledTextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
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
                />
                {!previewUrl ? (
                  <Box onClick={() => fileInputRef.current?.click()} sx={{ cursor: "pointer" }}>
                    <CloudUploadIcon
                      sx={{
                        fontSize: "3rem",
                        color: colors.text.secondary,
                        mb: spacing.sm,
                      }}
                    />
                    <BodyText sx={{ color: colors.text.secondary, mb: spacing.sm }}>
                      Click to upload design reference image
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
                      <IconButton
                        onClick={handleRemoveImage}
                        sx={{
                          position: "absolute",
                          top: -spacing.sm,
                          right: -spacing.sm,
                          backgroundColor: colors.error.main,
                          color: "white",
                          "&:hover": {
                            backgroundColor: colors.error.dark,
                          },
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
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
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
