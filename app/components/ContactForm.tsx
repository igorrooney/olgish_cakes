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
      <Box component="form" id="contact-form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {[
            <TextField
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
            />,
            <TextField
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
            />,
            <TextField
              key="phone"
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              fullWidth
              disabled={isSubmitting}
              placeholder="Enter your phone number"
              size="medium"
            />,
            !hideCakeInterest && (
              <TextField
                key="cakeInterest"
                label="Cake Interest"
                name="cakeInterest"
                value={formData.cakeInterest}
                onChange={handleChange}
                required={isOrderForm}
                fullWidth
                disabled={isSubmitting}
                placeholder="Which cake are you interested in?"
                size="medium"
              />
            ),
            <DatePicker
              key="datePicker"
              label={isOrderForm ? "Required Date" : "Preferred Date (Optional)"}
              value={formData.dateNeeded}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: isOrderForm,
                  name: "dateNeeded",
                  disabled: isSubmitting,
                  placeholder: isOrderForm
                    ? "Select your required date"
                    : "Select your preferred date",
                  size: "medium",
                },
              }}
              disablePast
            />,
            <TextField
              key="message"
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              disabled={isSubmitting}
              placeholder="Enter your message"
              size="medium"
            />,
          ].map(
            (field, index) =>
              field && (
                <motion.div
                  key={index}
                  initial="initial"
                  animate="animate"
                  variants={formFieldAnimation}
                  transition={{ delay: index * 0.1 }}
                >
                  {field}
                </motion.div>
              )
          )}

          {showImageUpload && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={formFieldAnimation}
              transition={{ delay: 0.6 }}
            >
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 3,
                  textAlign: "center",
                  bgcolor: "grey.50",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  ref={fileInputRef}
                />
                {previewUrl ? (
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={previewUrl}
                      alt="Design reference"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 200,
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        top: -16,
                        right: -16,
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&:hover": {
                          bgcolor: "error.light",
                          color: "white",
                        },
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<CloudUploadIcon />}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  >
                    Choose Image
                  </Button>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Upload a reference image for your cake design
                </Typography>
              </Box>
            </motion.div>
          )}

          {!isOrderForm && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={formFieldAnimation}
              transition={{ delay: 0.7 }}
            >
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? "Sending..." : buttonText}
              </Button>
            </motion.div>
          )}

          {submitStatus === "success" && !isOrderForm && (
            <Alert severity="success">
              <AlertTitle>Message Sent Successfully!</AlertTitle>
              Thank you for your message. We'll get back to you soon!
            </Alert>
          )}

          {submitStatus === "error" && !isOrderForm && (
            <Alert severity="error">
              <AlertTitle>Error Sending Message</AlertTitle>
              There was an error sending your message. Please try again or contact us directly.
            </Alert>
          )}
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
