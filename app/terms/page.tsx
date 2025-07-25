import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service | Olgish Cakes - Legal Terms & Conditions",
  description:
    "Review the terms and conditions for using Olgish Cakes' services. Our legal agreement covers ordering, delivery, and service policies.",
  openGraph: {
    title: "Terms of Service | Olgish Cakes - Legal Terms & Conditions",
    description:
      "Review the terms and conditions for using Olgish Cakes' services. Our legal agreement covers ordering, delivery, and service policies.",
    url: "https://olgishcakes.co.uk/terms",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/terms-of-service.jpg",
        width: 1200,
        height: 630,
        alt: "Terms of Service - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Olgish Cakes - Legal Terms & Conditions",
    description:
      "Review the terms and conditions for using Olgish Cakes' services. Our legal agreement covers ordering, delivery, and service policies.",
    images: ["https://olgishcakes.co.uk/images/terms-of-service.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/terms",
  },
};

export default function TermsOfServicePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service - Olgish Cakes",
    description:
      "Review the terms and conditions for using Olgish Cakes' services. Our legal agreement covers ordering, delivery, and service policies.",
    url: "https://olgishcakes.co.uk/terms",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
      },
    },
    mainEntity: {
      "@type": "Article",
      headline: "Terms of Service",
      description: "Review the terms and conditions for using Olgish Cakes' services.",
      author: {
        "@type": "Organization",
        name: "Olgish Cakes",
      },
      publisher: {
        "@type": "Organization",
        name: "Olgish Cakes",
      },
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split("T")[0],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Box
        sx={{
          background: "linear-gradient(to bottom, #FFF5E6 0%, #FFFFFF 100%)",
          minHeight: "100vh",
          py: 8,
        }}
      >
        <Container maxWidth="md">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />
          </Box>

          <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 700,
                mb: 4,
                color: "primary.main",
                textAlign: "center",
              }}
            >
              Terms of Service
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              Last updated:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Typography>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              By accessing and using Olgish Cakes' website and services, you agree to be bound by
              these Terms of Service. If you do not agree to these terms, please do not use our
              services.
            </Typography>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              2. Ordering Process
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              When placing an order with Olgish Cakes:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Order Confirmation"
                  secondary="Orders are confirmed via email or phone. A deposit may be required for certain orders."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Custom Orders"
                  secondary="Custom cake orders require a consultation and may have specific terms regarding design, ingredients, and delivery."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Order Changes"
                  secondary="Changes to orders must be requested at least 48 hours before the scheduled delivery or pickup date."
                />
              </ListItem>
            </List>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              3. Payment Terms
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              All prices are in GBP and include VAT where applicable. Payment methods include:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Bank transfer" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Credit/debit card" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Cash on collection" />
              </ListItem>
            </List>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              4. Delivery and Collection
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We offer both delivery and collection options:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Delivery"
                  secondary="Delivery charges apply based on location. We aim to deliver within the agreed time window."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Collection"
                  secondary="Collection is available from our Leeds location during specified hours."
                />
              </ListItem>
            </List>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              5. Cancellation Policy
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Cancellations must be made at least 48 hours before the scheduled delivery or
              collection time. Deposits may be non-refundable depending on the stage of order
              preparation.
            </Typography>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              6. Intellectual Property
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              All content on our website, including images, designs, and recipes, is the property of
              Olgish Cakes and protected by intellectual property laws.
            </Typography>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              7. Limitation of Liability
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              While we take every care in the preparation of our products, we cannot be held liable
              for any allergic reactions or dietary issues. Customers are responsible for informing
              us of any allergies or dietary requirements.
            </Typography>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              8. Changes to Terms
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We reserve the right to modify these terms at any time. Continued use of our services
              after changes constitutes acceptance of the modified terms.
            </Typography>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              9. Contact Us
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              If you have any questions about these Terms of Service, please contact us at:
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Email: hello@olgishcakes.co.uk
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Phone: +44 786 721 8194
            </Typography>

            <Box sx={{ mt: 6, textAlign: "center" }}>
              <Button component={Link} href="/" variant="contained" color="primary" size="large">
                Return to Home
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
