"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Dialog as SuccessDialog,
  DialogContent as SuccessDialogContent,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ContactForm } from "@/app/components/ContactForm";
import { Cake } from "@/types/cake";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  cake: Cake;
}

export function OrderModal({ open, onClose, cake }: OrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [designType, setDesignType] = useState<"standard" | "individual">("standard");
  const [showFeedback, setShowFeedback] = useState(false);

  async function handleSubmit(formData: any) {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      if (formData.dateNeeded) {
        data.append("dateNeeded", formData.dateNeeded.format("YYYY-MM-DD"));
      }
      data.append(
        "message",
        `
Cake: ${cake.name}
Design Type: ${designType === "standard" ? "Standard Design" : "Individual Design"}
Price: £${designType === "standard" ? cake.pricing.standard : cake.pricing.individual}

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

      setSubmitStatus("success");
      setShowFeedback(true);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentPrice = designType === "standard" ? cake.pricing.standard : cake.pricing.individual;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
        TransitionProps={{
          onExited: () => {
            setDesignType("standard");
            setSubmitStatus(null);
            setShowFeedback(false);
          },
        }}
      >
        {submitStatus === "success" ? (
          <DialogContent sx={{ textAlign: "center", py: 6 }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Order Sent Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Thank you for your order inquiry. We'll get back to you soon!
              </Typography>
              <Button variant="contained" onClick={onClose}>
                Close
              </Button>
            </motion.div>
          </DialogContent>
        ) : (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontFamily: "var(--font-playfair-display)",
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Order {cake.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {cake.size} inch cake • £{currentPrice}
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
                    mb: 2,
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
                    onChange={e => setDesignType(e.target.value as "standard" | "individual")}
                  >
                    <MenuItem value="standard">Standard Design • £{cake.pricing.standard}</MenuItem>
                    <MenuItem value="individual">
                      Individual Design • £{cake.pricing.individual}
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
                        Individual design allows you to customize the cake according to your
                        preferences. You can upload a reference image below to help us understand
                        your vision.
                      </Typography>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </MotionPaper>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <ContactForm
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  submitStatus={submitStatus}
                  isOrderForm
                  buttonText="Send Order Inquiry"
                  showImageUpload={designType === "individual"}
                  hideCakeInterest
                />
              </motion.div>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" form="contact-form" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Order Inquiry"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <SuccessDialog
        open={showFeedback && submitStatus === "error"}
        onClose={() => {
          setShowFeedback(false);
        }}
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
              There was an error sending your order. Please try again or contact us directly.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setShowFeedback(false);
              }}
            >
              Try Again
            </Button>
          </motion.div>
        </SuccessDialogContent>
      </SuccessDialog>
    </>
  );
}
