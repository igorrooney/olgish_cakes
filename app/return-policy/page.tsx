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
  Alert,
  Chip,
} from "@mui/material";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Return Policy | Olgish Cakes - Refunds & Returns Policy",
  description:
    "Learn about Olgish Cakes' return and refund policy for Ukrainian cakes and traditional desserts. Our commitment to customer satisfaction and quality assurance.",
  openGraph: {
    title: "Return Policy | Olgish Cakes - Refunds & Returns Policy",
    description:
      "Learn about Olgish Cakes' return and refund policy for Ukrainian cakes and traditional desserts. Our commitment to customer satisfaction and quality assurance.",
    url: "https://olgishcakes.co.uk/return-policy",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/return-policy.jpg",
        width: 1200,
        height: 630,
        alt: "Return Policy - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Return Policy | Olgish Cakes - Refunds & Returns Policy",
    description:
      "Learn about Olgish Cakes' return and refund policy for Ukrainian cakes and traditional desserts. Our commitment to customer satisfaction and quality assurance.",
    images: ["https://olgishcakes.co.uk/images/return-policy.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/return-policy",
  },
  keywords: [
    "return policy Olgish Cakes",
    "Ukrainian bakery returns",
    "cake refund policy",
    "Ukrainian cake returns",
    "Ukrainian cake refunds",
    "bakery return policy",
    "cake order returns",
    "delivery refund policy",
    "Ukrainian dessert returns",
    "cake service returns",
    "Ukrainian cake policy",
    "bakery refund terms",
    "cake order refunds",
    "Ukrainian cake returns",
    "bakery return terms",
    "cake delivery returns",
    "Ukrainian cake refund policy",
    "bakery return conditions",
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

export default function ReturnPolicyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Return Policy - Olgish Cakes",
    description:
      "Learn about Olgish Cakes' return and refund policy for Ukrainian cakes and traditional desserts. Our commitment to customer satisfaction and quality assurance.",
    url: "https://olgishcakes.co.uk/return-policy",
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
      headline: "Return Policy",
      description: "Learn about Olgish Cakes' return and refund policy for Ukrainian cakes and traditional desserts.",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Return Policy" }]} />
          </Box>

          <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 700,
                mb: 4,
                color: "primary.main",
                textAlign: "center",
              }}
            >
              Return Policy
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              Last updated:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Typography>

            <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                We want you to be completely satisfied with your Ukrainian cake and traditional dessert order. 
                Please read our return policy carefully to understand your rights and our procedures.
              </Typography>
            </Alert>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              1. General Return Policy
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Due to the perishable nature of our products, we have specific return policies designed to ensure 
              food safety while maintaining customer satisfaction. All returns must be initiated within 24 hours 
              of delivery or collection.
            </Typography>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              2. Eligible Returns
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              We will accept returns in the following circumstances:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Quality Issues"
                  secondary="If the product arrives damaged, spoiled, or significantly different from what was ordered"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Wrong Order"
                  secondary="If you receive the wrong product or flavour than what was ordered"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Allergy Concerns"
                  secondary="If the product contains allergens not disclosed or if there's a labelling error"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Delivery Issues"
                  secondary="If the product was delivered to the wrong address or significantly late without prior notice"
                />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              3. Non-Eligible Returns
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              We cannot accept returns for the following reasons:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Change of Mind"
                  secondary="Personal preference changes or simply not liking the taste"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Custom Orders"
                  secondary="Custom-designed cakes that were made to your specific requirements"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Perishable Nature"
                  secondary="Products that have been consumed, partially eaten, or stored improperly"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Time Limit"
                  secondary="Returns requested more than 24 hours after delivery or collection"
                />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              4. Return Process
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              To initiate a return, please follow these steps:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Step 1: Contact Us"
                  secondary="Email us at hello@olgishcakes.co.uk or call +44 786 721 8194 within 24 hours"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Step 2: Provide Details"
                  secondary="Include your order number, reason for return, and photos if applicable"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Step 3: Return Authorization"
                  secondary="We will review your request and provide return instructions if approved"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Step 4: Return or Refund"
                  secondary="We will arrange collection or provide a full refund within 5-7 business days"
                />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              5. Refund Policy
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Refunds will be processed as follows:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Full Refund"
                  secondary="For quality issues, wrong orders, or delivery problems - 100% refund including delivery charges"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Partial Refund"
                  secondary="For minor issues where the product is still consumable - up to 50% refund"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Store Credit"
                  secondary="Option to receive store credit for future orders instead of cash refund"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Processing Time"
                  secondary="Refunds will be processed within 5-7 business days after approval"
                />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              6. Special Circumstances
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" component="h3" sx={{ mb: 1, fontWeight: 600, fontSize: "1.2rem" }}>
                Wedding Cakes
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Wedding cakes have special considerations due to their custom nature and importance:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Design Changes"
                    secondary="Minor design changes can be made up to 7 days before the event"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Cancellation"
                    secondary="Cancellations more than 14 days before the event receive 50% refund"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Quality Issues"
                    secondary="Any quality issues will be addressed immediately with replacement or full refund"
                  />
                </ListItem>
              </List>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" component="h3" sx={{ mb: 1, fontWeight: 600, fontSize: "1.2rem" }}>
                Seasonal Products
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Special seasonal items (Christmas, Easter, etc.) have extended return periods:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Extended Period"
                    secondary="48 hours instead of 24 hours for seasonal items"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Holiday Considerations"
                    secondary="Special arrangements for holiday delivery issues"
                  />
                </ListItem>
              </List>
            </Box>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              7. Quality Assurance
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We take pride in the quality of our Ukrainian cakes and traditional desserts. 
              Our quality assurance process includes:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Fresh ingredients sourced daily" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Traditional Ukrainian recipes followed precisely" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Quality checks at every stage of preparation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Proper packaging and storage conditions" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Temperature-controlled delivery when possible" />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              8. Customer Satisfaction Guarantee
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We are committed to your satisfaction. If you're not completely happy with your order, 
              we will work with you to resolve the issue. Our goal is to ensure every customer 
              enjoys the authentic taste of Ukrainian cakes and traditional desserts.
            </Typography>

            <Box sx={{ 
              backgroundColor: "primary.50", 
              p: 3, 
              borderRadius: 2, 
              mb: 4,
              border: "1px solid",
              borderColor: "primary.200"
            }}>
              <Typography variant="h3" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                Quick Contact for Returns
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <Chip 
                  label="Email: hello@olgishcakes.co.uk" 
                  color="primary" 
                  variant="outlined"
                  clickable
                  component="a"
                  href="mailto:hello@olgishcakes.co.uk"
                />
                <Chip 
                  label="Phone: +44 786 721 8194" 
                  color="primary" 
                  variant="outlined"
                  clickable
                  component="a"
                  href="tel:+447867218194"
                />
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Available Monday to Sunday, 9:00 AM - 8:00 PM
              </Typography>
            </Box>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              9. Legal Rights
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              This return policy does not affect your statutory rights as a consumer under UK law. 
              You may have additional rights under the Consumer Rights Act 2015, including the right 
              to reject goods that are not of satisfactory quality, fit for purpose, or as described.
            </Typography>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              10. Policy Updates
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We reserve the right to update this return policy at any time. Any changes will be 
              posted on this page with an updated revision date. Continued use of our services 
              after changes constitutes acceptance of the updated policy.
            </Typography>

            <Box sx={{ mt: 6, textAlign: "center" }}>
              <Button
                component={Link}
                href="/"
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
                Back to Home
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
