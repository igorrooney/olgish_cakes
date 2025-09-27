"use client";

import Link from "next/link";
import { GiftHamper } from "@/types/giftHamper";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Typography,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ContactForm } from "@/app/components/ContactForm";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import { CheckCircleIcon, ErrorIcon } from "@/lib/mui-optimization";

dayjs.locale("en-gb");

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

interface GiftHamperOrderModalProps {
  open: boolean;
  onClose: () => void;
  hamper: GiftHamper;
}

export function GiftHamperOrderModal({ open, onClose, hamper }: GiftHamperOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  async function handleSubmit(formData: any) {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      if (formData.address) {
        data.append("address", formData.address);
      }
      if (formData.city) {
        data.append("city", formData.city);
      }
      if (formData.postcode) {
        data.append("postcode", formData.postcode);
      }
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      if (formData.dateNeeded) {
        const britishDate = formData.dateNeeded.format("DD/MM/YYYY");
        data.append("dateNeeded", formData.dateNeeded.format("YYYY-MM-DD"));
        data.append("dateNeededDisplay", britishDate);
      }
      data.append(
        "message",
        `\nGift Hamper: ${hamper.name}\nPrice: £${hamper.price}\nCategory: ${hamper.category || "N/A"}\n\n${formData.message || "No additional message provided"}\n`
      );
      if (formData.giftNote) {
        data.append("giftNote", formData.giftNote);
      }
      if (formData.note) {
        data.append("note", formData.note);
      }
      // Explicitly mark as order form so API uses order subject
      data.append("isOrderForm", "true");
      
      // Add order-specific fields for order creation
      data.append("orderType", "gift-hamper");
      data.append("productType", "gift-hamper");
      data.append("productId", hamper.slug?.current || "");
      data.append("productName", hamper.name);
      data.append("designType", "standard"); // Gift hampers are standard
      data.append("quantity", "1");
      data.append("unitPrice", hamper.price.toString());
      data.append("totalPrice", hamper.price.toString());
      data.append("size", "Standard");
      data.append("flavor", hamper.category || "Mixed");
      data.append("specialInstructions", formData.message || "");
      data.append("deliveryMethod", "postal"); // Default for gift hampers - postal delivery
      data.append("deliveryAddress", formData.address || "");
      data.append("deliveryNotes", formData.note || "");
      data.append("paymentMethod", "card"); // Default payment method for gift hampers - card payment
      
      // Add gift hamper specific fields
      if (formData.giftNote) {
        data.append("giftNote", formData.giftNote);
      }
      
      // Debug logging
      console.log("Gift hamper form data:", {
        note: formData.note,
        giftNote: formData.giftNote,
        message: formData.message
      });

      const response = await fetch("/api/contact", { method: "POST", body: data });
      if (!response.ok) throw new Error("Failed to send message");

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

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        <Dialog
          open={open}
          onClose={isSubmitting ? undefined : onClose}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
          aria-labelledby="hamper-order-modal-title"
          aria-describedby="hamper-order-modal-description"
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
                id="hamper-order-modal-title"
                sx={{ fontFamily: "var(--font-playfair-display)", fontWeight: 600, mb: 1 }}
              >
                Order {hamper.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  £{hamper.price}
                </Typography>
                {hamper.category && (
                  <Chip label={hamper.category} color="secondary" variant="outlined" />
                )}
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                id="hamper-order-modal-description"
              >
                Luxury gift hampers with UK delivery
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
                sx={{ color: "primary.main", fontWeight: 600, mb: 2 }}
              >
                Request your hamper
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fill in your details and we’ll confirm availability and delivery.
              </Typography>
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
                    inset: 0,
                    bgcolor: "rgba(255,255,255,0.8)",
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
                hideCakeInterest
                showButton={false}
                showAddress={true}
                showPostcode={true}
                showCity={true}
                showDate={true}
                requireMessage={false}
                showGiftNote={true}
                showNote={true}
                suppressStructuredData
              />
            </MotionBox>

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
                  <Chip label="24h Response" color="success" variant="outlined" />
                  <Chip label="Free Consultation" color="success" variant="outlined" />
                  <Chip label="UK Delivery" color="success" variant="outlined" />
                  <Chip label="Quality Guaranteed" color="success" variant="outlined" />
                </Box>
              </Paper>
            </MotionBox>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{ mr: 1 }}
              disabled={isSubmitting}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              form="contact-form"
              disabled={isSubmitting}
              sx={{ minWidth: 200, fontWeight: 600, position: "relative" }}
              size="large"
            >
              {isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: "inherit" }} />
                  Sending Order...
                </Box>
              ) : (
                "Send Order"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Modal */}
        <Dialog
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2, textAlign: "center", py: 3 } }}
        >
          <DialogContent>
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
                Thank you. We’ll confirm your order details as soon as possible.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setShowSuccessModal(false)}
                sx={{ minWidth: 150 }}
              >
                Close
              </Button>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Error Modal */}
        <Dialog
          open={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2, textAlign: "center", py: 3 } }}
        >
          <DialogContent>
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
                  style={{ textDecoration: "none", color: "inherit", fontWeight: 500 }}
                  aria-label="Email us at hello@olgishcakes.co.uk"
                >
                  <span
                    style={{ cursor: "pointer" }}
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
          </DialogContent>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}
