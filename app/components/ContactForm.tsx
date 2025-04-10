"use client";

import { useState } from "react";
import { TextField, Button, Box, Typography, CircularProgress } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";

interface FormData {
  name: string;
  email: string;
  phone: string;
  cakeInterest?: string;
  dateNeeded: Dayjs | null;
  message: string;
}

interface ContactFormProps {
  onSubmit?: (formData: FormData) => Promise<void>;
  isSubmitting?: boolean;
  submitStatus?: "success" | "error" | null;
  hideCakeInterest?: boolean;
  isOrderForm?: boolean;
}

export function ContactForm({
  onSubmit,
  isSubmitting: externalIsSubmitting,
  submitStatus: externalSubmitStatus,
  hideCakeInterest = false,
  isOrderForm = false,
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onSubmit) {
      await onSubmit(formData);
      return;
    }

    setInternalIsSubmitting(true);
    setInternalSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dateNeeded: formData.dateNeeded ? formData.dateNeeded.toISOString() : undefined,
        }),
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
    } catch (error) {
      console.error("Form submission error:", error);
      setInternalSubmitStatus("error");
    } finally {
      setInternalIsSubmitting(false);
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          disabled={isSubmitting}
          placeholder="Enter your full name"
        />
        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          disabled={isSubmitting}
          placeholder="Enter your email address"
        />
        <TextField
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          disabled={isSubmitting}
          placeholder="Enter your phone number"
        />
        {!hideCakeInterest && (
          <TextField
            label="Cake Interest"
            name="cakeInterest"
            value={formData.cakeInterest}
            onChange={handleChange}
            required={isOrderForm}
            fullWidth
            margin="normal"
            disabled={isSubmitting}
            placeholder="Which cake are you interested in?"
          />
        )}
        <DatePicker
          label={isOrderForm ? "Required Date" : "Preferred Date (Optional)"}
          value={formData.dateNeeded}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              name: "dateNeeded",
              disabled: isSubmitting,
              placeholder: isOrderForm ? "Select your required date" : "Select your preferred date",
              required: isOrderForm,
            },
          }}
          disablePast
        />
        <TextField
          label="Order Details"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          multiline
          rows={4}
          disabled={isSubmitting}
          placeholder="Please provide details about your order, including any special requests, dietary requirements, or preferred flavors"
        />
        <Box sx={{ position: "relative", mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Sending..." : "Send Order Inquiry"}
          </Button>
          {isSubmitting && (
            <CircularProgress
              size={24}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Box>
        {submitStatus === "success" && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            Your order inquiry has been sent successfully! We'll get back to you soon.
          </Typography>
        )}
        {submitStatus === "error" && (
          <Typography color="error.main" sx={{ mt: 2 }}>
            Failed to send your order inquiry. Please try again later or contact us directly via
            phone or email.
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
}
