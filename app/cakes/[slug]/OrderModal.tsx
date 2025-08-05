"use client";

import Link from "next/link";
import { ContactForm } from "@/app/components/ContactForm";
import { Cake } from "@/types/cake";
import { OrderModalStructuredData } from "./OrderModalStructuredData";
import { CheckCircleIcon, ErrorIcon } from "@/lib/mui-optimization";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Dialog as SuccessDialog,
  DialogContent as SuccessDialogContent,
  Typography,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";

// Configure dayjs for British locale
dayjs.locale("en-gb");

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  cake: Cake;
  designType: "standard" | "individual";
  onDesignTypeChange: (type: "standard" | "individual") => void;
}

export function OrderModal({
  open,
  onClose,
  cake,
  designType,
  onDesignTypeChange,
}: OrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  async function handleSubmit(formData: any) {
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      if (formData.dateNeeded) {
        // Format date in British format (DD/MM/YYYY) for display
        const britishDate = formData.dateNeeded.format("DD/MM/YYYY");
        data.append("dateNeeded", formData.dateNeeded.format("YYYY-MM-DD")); // ISO format for backend
        data.append("dateNeededDisplay", britishDate); // British format for display
      }
      data.append(
        "message",
        `
Cake: ${cake.name}
Design Type: ${designType === "standard" ? "Standard Design" : "Individual Design"}
Price: £${designType === "standard" ? cake.pricing.standard : cake.pricing.individual}
Size: ${cake.size}
Category: ${cake.category}

${formData.message}
      `
      );
      if (formData.designImage) {
        data.append("designImage", formData.designImage);
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Close the order modal and show success modal
      setSubmitStatus("success");
      onClose();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentPrice = designType === "standard" ? cake.pricing.standard : cake.pricing.individual;
  const priceDifference = cake.pricing.individual - cake.pricing.standard;

  return (
    <>
      <OrderModalStructuredData cake={cake} designType={designType} currentPrice={currentPrice} />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        <Dialog
          open={open}
          onClose={isSubmitting ? undefined : onClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
          aria-labelledby="order-modal-title"
          aria-describedby="order-modal-description"
        >
          <DialogTitle sx={{ pb: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                variant="h5"
                component="div"
                id="order-modal-title"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Order {cake.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  £{currentPrice}
                </Typography>
                <Chip label={cake.size} size="small" color="secondary" variant="outlined" />
              </Box>
              <Typography variant="body2" color="text.secondary" id="order-modal-description">
                Professional cake design and delivery in Leeds and surrounding areas
              </Typography>
            </motion.div>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  mb: 5,
                }}
              >
                Select Design Type
              </Typography>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="design-type-label">Design Type</InputLabel>
                <Select
                  labelId="design-type-label"
                  value={designType}
                  label="Design Type"
                  onChange={e => onDesignTypeChange(e.target.value as "standard" | "individual")}
                >
                  <MenuItem value="standard">
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Standard Design • £{cake.pricing.standard}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Our signature design with premium ingredients
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="individual">
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Individual Design • £{cake.pricing.individual}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Custom design +£{priceDifference} • Personal consultation included
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              <AnimatePresence mode="wait">
                {designType === "individual" && (
                  <MotionBox
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    sx={{ mt: 2, overflow: "hidden" }}
                  >
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <AlertTitle>Individual Design Service</AlertTitle>
                      Includes personal consultation, custom design sketches, and unlimited
                      revisions. Perfect for special occasions and unique requirements.
                    </Alert>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        bgcolor: "primary.50",
                        p: 1.5,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "primary.100",
                      }}
                    >
                      <strong>What's included:</strong> Design consultation, custom sketches,
                      unlimited revisions, premium ingredients, professional photography, and
                      delivery within Leeds area.
                    </Typography>
                  </MotionBox>
                )}
              </AnimatePresence>
            </MotionPaper>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              sx={{ position: "relative" }}
            >
              {isSubmitting && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <CircularProgress size={40} sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Sending your order inquiry...
                    </Typography>
                  </Box>
                </Box>
              )}
              <ContactForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isOrderForm
                showImageUpload={designType === "individual"}
                hideCakeInterest
                showButton={false}
              />
            </MotionBox>

            {/* Professional Service Information */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              sx={{ mt: 3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "success.50",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "success.200",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "success.dark", mb: 1 }}
                >
                  Professional Service Guarantee
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Chip label="24h Response" size="small" color="success" variant="outlined" />
                  <Chip label="Free Consultation" size="small" color="success" variant="outlined" />
                  <Chip label="Leeds Delivery" size="small" color="success" variant="outlined" />
                  <Chip
                    label="Quality Guaranteed"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </Paper>
            </MotionBox>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              form="contact-form"
              disabled={isSubmitting}
              sx={{
                minWidth: 200,
                fontWeight: 600,
                position: "relative",
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: "inherit" }} />
                  Sending Order Inquiry...
                </Box>
              ) : (
                "Send Order Inquiry"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Professional Success Modal */}
        <SuccessDialog
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              textAlign: "center",
              py: 3,
            },
          }}
        >
          <SuccessDialogContent>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Order Inquiry Sent Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Thank you for choosing Olgish Cakes. Your order inquiry has been received and we're
                excited to create something special for you.
              </Typography>
              <Box
                sx={{
                  bgcolor: "success.50",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "success.200",
                  mb: 3,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "success.dark", mb: 1 }}
                >
                  What happens next?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • We'll review your requirements within 24 hours
                  <br />
                  • You'll receive a detailed quote and design consultation
                  <br />
                  • We'll schedule a consultation call to discuss your vision
                  <br />• Your cake will be crafted with premium ingredients
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setShowSuccessModal(false)}
                sx={{ minWidth: 150 }}
              >
                Close
              </Button>
            </motion.div>
          </SuccessDialogContent>
        </SuccessDialog>

        {/* Error Modal */}
        <SuccessDialog
          open={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              textAlign: "center",
              py: 3,
            },
          }}
        >
          <SuccessDialogContent>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Error Sending Order
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                There was an error sending your order. Please try again or contact us directly at{" "}
                <Link
                  href="mailto:hello@olgishcakes.co.uk"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: 500,
                  }}
                  aria-label="Email us at hello@olgishcakes.co.uk"
                >
                  <span
                    style={{
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.textDecoration = "underline";
                      e.currentTarget.style.color = "var(--mui-palette-primary-main)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.textDecoration = "none";
                      e.currentTarget.style.color = "inherit";
                    }}
                  >
                    hello@olgishcakes.co.uk
                  </span>
                </Link>
              </Typography>
              <Button variant="contained" onClick={() => setShowErrorModal(false)}>
                Try Again
              </Button>
            </motion.div>
          </SuccessDialogContent>
        </SuccessDialog>
      </LocalizationProvider>
    </>
  );
}
