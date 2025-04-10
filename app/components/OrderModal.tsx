"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { ContactForm } from "./ContactForm";
import { Cake } from "@/types/cake";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  cake: Cake;
  designType: "standard" | "individual";
}

export function OrderModal({ open, onClose, cake, designType }: OrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          message: `Order Inquiry Details:
Cake: ${cake.name}
Design Type: ${designType === "standard" ? "Standard Design" : "Individual Design"}
Price: £${designType === "standard" ? cake.pricing.standard : cake.pricing.individual}
Size: ${cake.size} inch

Customer Message:
${formData.message}

Customer Details:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}
Date Needed: ${formData.dateNeeded ? new Date(formData.dateNeeded).toLocaleDateString("en-GB") : "Not specified"}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSubmitStatus("success");
      // Reset form data after successful submission
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Order {cake.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {designType === "standard" ? "Standard Design" : "Individual Design"} - £
          {designType === "standard" ? cake.pricing.standard : cake.pricing.individual}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mt: 2 }}>
          <ContactForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitStatus={submitStatus}
            hideCakeInterest
            isOrderForm
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
