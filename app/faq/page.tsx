import type { Metadata } from "next";
import { Container, Typography, Box, Button } from "@mui/material";
import { StructuredData } from "../components/StructuredData";
import { FAQItems } from "./FAQItems";
import Link from "next/link";
import { getFaqs } from "../utils/fetchFaqs";

export const metadata: Metadata = {
  title: "FAQ | Olgish Cakes - Frequently Asked Questions",
  description:
    "Find answers to common questions about our Ukrainian-style cakes, ordering process, delivery options, and more at Olgish Cakes in Leeds.",
};

export default async function FAQPage() {
  try {
    const faqItems = await getFaqs();
    console.log("Fetched FAQs:", faqItems);

    if (!faqItems || faqItems.length === 0) {
      return (
        <Box
          sx={{
            background: "linear-gradient(to bottom, #FFF5E6 0%, #FFFFFF 100%)",
            minHeight: "100vh",
            py: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Container>
            <Typography variant="h4" color="error" textAlign="center">
              No FAQs found. Please check your Sanity configuration.
            </Typography>
          </Container>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          background: "linear-gradient(to bottom, #FFF5E6 0%, #FFFFFF 100%)",
          minHeight: "100vh",
          py: 8,
        }}
      >
        <Container>
          <StructuredData />

          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 700,
                mb: 2,
                color: "primary.main",
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                mb: 4,
                fontFamily: "var(--font-playfair-display)",
              }}
            >
              Everything you need to know about our Ukrainian-style cakes
            </Typography>
          </Box>

          <FAQItems items={faqItems} />

          <Box sx={{ mt: 8, textAlign: "center" }}>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: "text.secondary",
                fontSize: "1.1rem",
              }}
            >
              Have a specific question about our Ukrainian-style cakes?
            </Typography>
            <Button
              component={Link}
              href="/contact"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 500,
                boxShadow: "0 4px 15px rgba(0, 91, 187, 0.2)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(0, 91, 187, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Contact Us
            </Button>
          </Box>
        </Container>
      </Box>
    );
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return (
      <Box
        sx={{
          background: "linear-gradient(to bottom, #FFF5E6 0%, #FFFFFF 100%)",
          minHeight: "100vh",
          py: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container>
          <Typography variant="h4" color="error" textAlign="center">
            Error loading FAQs. Please try again later.
          </Typography>
        </Container>
      </Box>
    );
  }
}
