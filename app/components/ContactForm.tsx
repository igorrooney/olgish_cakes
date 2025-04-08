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
  phone?: string;
  cakeInterest?: string;
  dateNeeded?: Dayjs | null;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    cakeInterest: "",
    dateNeeded: null,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setSubmitStatus(null); // Reset status on change
  }

  function handleDateChange(newValue: Dayjs | null) {
    setFormData(prevData => ({ ...prevData, dateNeeded: newValue }));
    setSubmitStatus(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Format date for API (ISO string or null)
    const submissionData = {
      ...formData,
      dateNeeded: formData.dateNeeded ? formData.dateNeeded.toISOString() : undefined, // Send undefined if null
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        // Attempt to parse error details from the response
        let errorDetails = "An unknown error occurred.";
        try {
          const errorData = await response.json();
          errorDetails = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (parseError) {
          // If parsing fails, use the status text
          errorDetails = response.statusText;
        }
        throw new Error(`API Error: ${response.status} ${errorDetails}`);
      }

      // Handle success
      setSubmitStatus("success");
      // Reset form data after successful submission
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
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          disabled={isSubmitting}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          disabled={isSubmitting}
        />
        <TextField
          label="Phone (Optional)"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={isSubmitting}
        />
        <TextField
          label="Which cake are you interested in? (Optional)"
          name="cakeInterest"
          value={formData.cakeInterest}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={isSubmitting}
        />
        <DatePicker
          label="When do you need it? (Optional)"
          value={formData.dateNeeded}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              name: "dateNeeded",
              disabled: isSubmitting,
            },
          }}
          disablePast
        />
        <TextField
          label="Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          multiline
          rows={4}
          disabled={isSubmitting}
        />
        <Box sx={{ mt: 2, position: "relative" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Sending..." : "Send Message"}
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
            Message sent successfully! We'll get back to you soon.
          </Typography>
        )}
        {submitStatus === "error" && (
          <Typography color="error.main" sx={{ mt: 2 }}>
            Failed to send message. Please try again later or contact us directly via phone or
            email.
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
}
