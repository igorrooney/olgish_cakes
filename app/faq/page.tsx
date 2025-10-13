import type { Metadata } from "next";
import { Container, Typography, Box, Button } from "@mui/material";
import { FAQItems } from "./FAQItems";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Link from "next/link";
import { getFaqs } from "../utils/fetchFaqs";

export const metadata: Metadata = {
  title: "FAQ | Olgish Cakes - Frequently Asked Questions",
  description:
    "Find answers to common questions about my Ukrainian-style cakes, ordering process, delivery options, and more at Olgish Cakes in Leeds.",
  openGraph: {
    title: "FAQ | Olgish Cakes - Frequently Asked Questions",
    description:
      "Find answers to common questions about my Ukrainian-style cakes, ordering process, delivery options, and more at Olgish Cakes in Leeds.",
    url: "https://olgishcakes.co.uk/faq",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/faq.jpg",
        width: 1200,
        height: 630,
        alt: "FAQ - Frequently Asked Questions - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Olgish Cakes - Frequently Asked Questions",
    description:
      "Find answers to common questions about my Ukrainian-style cakes, ordering process, delivery options, and more at Olgish Cakes in Leeds.",
    images: ["https://olgishcakes.co.uk/images/faq.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/faq",
  },
  keywords: [
    "FAQ Ukrainian cakes Leeds",
    "honey cake questions",
    "Medovik cake FAQ",
    "Ukrainian bakery Leeds questions",
    "cake ordering FAQ",
    "cake delivery questions",
    "custom cake inquiries",
    "wedding cake questions",
    "birthday cake FAQ",
    "Ukrainian dessert questions",
    "cake pricing FAQ",
    "cake ingredients questions",
    "allergen information",
    "cake storage questions",
    "cake delivery areas",
    "cake consultation FAQ",
  ],
  authors: [{ name: "Olgish Cakes", url: "https://olgishcakes.co.uk" }],
  creator: "Olgish Cakes",
  publisher: "Olgish Cakes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://olgishcakes.co.uk"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "ggHjlSwV1aM_lVT4IcRSlUIk6Vn98ZbJ_FGCepoVi64",
  },
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
  },
};

export default async function FAQPage() {
  try {
    const faqItems = await getFaqs();

    // Generate FAQ structured data
    const faqStructuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

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
            <Typography variant="body1" color="error" textAlign="center">
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
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "FAQ", href: "/faq" },
              ]}
            />
          </Box>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
          />

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
              variant="h2"
              component="h2"
              color="text.secondary"
              sx={{
                mb: 4,
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                fontWeight: 400,
              }}
            >
              Everything you need to know about my Ukrainian-style cakes
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
              Have a specific question about my Ukrainian-style cakes?
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
              Contact Me
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
          <Typography variant="body1" color="error" textAlign="center">
            Error loading FAQs. Please try again later.
          </Typography>
        </Container>
      </Box>
    );
  }
}
