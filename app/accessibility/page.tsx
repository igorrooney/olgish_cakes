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
  Divider,
} from "@mui/material";
import Link from "next/link";
import { CLIENT_BUSINESS_INFO } from "@/lib/business-info";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Accessibility Statement | Olgish Cakes Leeds",
  description:
    "Olgish Cakes accessibility statement. I am committed to making my Ukrainian bakery website accessible to all users, including those with disabilities. WCAG 2.1 compliance information.",
  openGraph: {
    title: "Accessibility Statement | Olgish Cakes Leeds",
    description:
      "Olgish Cakes accessibility statement. I am committed to making my Ukrainian bakery website accessible to all users, including those with disabilities.",
    url: "https://olgishcakes.co.uk/accessibility",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/accessibility-statement.jpg",
        width: 1200,
        height: 630,
        alt: "Accessibility Statement - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Statement | Olgish Cakes Leeds",
    description:
      "Olgish Cakes accessibility statement. I am committed to making my Ukrainian bakery website accessible to all users.",
    images: ["https://olgishcakes.co.uk/images/accessibility-statement.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/accessibility",
  },
  keywords: [
    "accessibility statement",
    "WCAG 2.1 compliance",
    "accessible website",
    "disability access",
    "inclusive design",
    "Ukrainian bakery accessibility",
    "Leeds bakery accessibility",
    "cake website accessibility",
    "web accessibility",
    "inclusive Ukrainian cakes",
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

export default function AccessibilityStatementPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Accessibility Statement - Olgish Cakes",
    description:
      "Olgish Cakes accessibility statement. We are committed to making our Ukrainian bakery website accessible to all users, including those with disabilities.",
    url: "https://olgishcakes.co.uk/accessibility",
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
      headline: "Accessibility Statement",
      description: "Olgish Cakes accessibility statement and commitment to inclusive design.",
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
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Accessibility Statement" },
              ]}
            />
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
              Accessibility Statement
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
                Olgish Cakes is committed to making digital accessibility for all users, including
                those with disabilities. I am always improving the user experience for
                everyone and using the relevant accessibility standards.
              </Typography>
            </Alert>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              1. My Commitment
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Olgish Cakes is committed to providing a website that is accessible to the widest
              possible audience, regardless of technology or ability. I actively work to increase
              the accessibility and usability of my website and in doing so follow many of the
              available standards and guidelines.
            </Typography>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              2. Accessibility Standards
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This website endeavors to conform to level AA of the World Wide Web Consortium (W3C)
              Web Content Accessibility Guidelines 2.1. These guidelines explain how to make web
              content more accessible for people with disabilities, and user-friendly for everyone.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              The guidelines have three levels of accessibility (A, AA and AAA). We've chosen level
              AA as the target for our website.
            </Typography>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              3. Measures I've Taken
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              To make my website accessible, I have implemented the following measures:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Semantic HTML Structure"
                  secondary="I use proper heading hierarchy and semantic HTML elements to make sure screen readers can navigate content effectively"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Alternative Text for Images"
                  secondary="All images include descriptive alternative text to provide context for users with visual impairments"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Keyboard Navigation"
                  secondary="My website can be navigated using only a keyboard, without requiring a mouse"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Color Contrast"
                  secondary="I make sure sufficient color contrast between text and background colors for readability"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Focus Indicators"
                  secondary="Clear focus indicators help users understand which element is currently selected"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Responsive Design"
                  secondary="My website adapts to different screen sizes and devices for optimal viewing"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Form Labels"
                  secondary="All form inputs have associated labels to help screen readers identify form fields"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Link Descriptions"
                  secondary="Links contain descriptive text that explains their purpose and destination"
                />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              4. Known Accessibility Issues
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              I am aware of the following accessibility issues on my website:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Third-Party Content"
                  secondary="Some third-party content (such as embedded social media feeds) may not be fully accessible. I am working with my providers to improve this."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="PDF Documents"
                  secondary="Some downloadable PDF documents may not be fully accessible to screen readers. I am working to provide alternative formats."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Video Content"
                  secondary="Some video content may not have captions or transcripts. I am working to add these features."
                />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              5. Ongoing Improvements
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              I am continuously working to improve the accessibility of my website. My ongoing
              efforts include:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Regular accessibility audits and testing" />
              </ListItem>
              <ListItem>
                <ListItemText primary="User feedback integration" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Staff training on accessibility best practices" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Regular updates to meet evolving accessibility standards" />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              6. How to Report Accessibility Issues
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              I welcome your feedback on the accessibility of my website. If you encounter any
              accessibility barriers, please let me know:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary="hello@olgishcakes.co.uk"
                  secondaryTypographyProps={{
                    component: "a",
                    href: "mailto:hello@olgishcakes.co.uk",
                    sx: { color: "primary.main", textDecoration: "underline" },
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary={CLIENT_BUSINESS_INFO.displayPhone}
                  secondaryTypographyProps={{
                    component: "a",
                    href: CLIENT_BUSINESS_INFO.telLink,
                    sx: { color: "primary.main", textDecoration: "underline" },
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Postal Address"
                  secondary="Allerton Grange, Leeds, LS17, United Kingdom"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 3 }}>
              When contacting me, please include:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="The specific page or content where you encountered the issue" />
              </ListItem>
              <ListItem>
                <ListItemText primary="A description of the accessibility problem" />
              </ListItem>
              <ListItem>
                <ListItemText primary="The technology you were using (browser, screen reader, etc.)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Your contact information so we can follow up" />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              7. Alternative Access Methods
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              If you have difficulty accessing any part of my website, I offer alternative ways to
              access my services:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Phone Orders"
                  secondary="Call me at +44 786 721 8194 to place orders or get information"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Email Support"
                  secondary="Email me at hello@olgishcakes.co.uk for assistance"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="In-Person Visits"
                  secondary="Visit me at my location in Allerton Grange, Leeds"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Social Media"
                  secondary="Connect with me on Facebook and Instagram for updates and support"
                />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              8. Legal Compliance
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              This accessibility statement is made in accordance with the Equality Act 2010 and the
              Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility
              Regulations 2018. I am committed to making sure my website is accessible to all users
              and complies with relevant accessibility standards.
            </Typography>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              9. Testing and Evaluation
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              I regularly test my website for accessibility using:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Automated accessibility testing tools" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Manual testing with assistive technologies" />
              </ListItem>
              <ListItem>
                <ListItemText primary="User testing with people with disabilities" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Expert accessibility reviews" />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              10. Updates to This Statement
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              I will review and update this accessibility statement regularly to reflect any changes
              to my website or accessibility practices. The last update date is shown at the top
              of this page.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Box
              sx={{
                backgroundColor: "primary.50",
                p: 3,
                borderRadius: 2,
                mb: 4,
                border: "1px solid",
                borderColor: "primary.200",
              }}
            >
              <Typography variant="h3" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                Need Help?
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                If you need assistance accessing any part of my website or have questions about
                my accessibility features, please don't hesitate to contact me.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Chip
                  label="Email: hello@olgishcakes.co.uk"
                  color="primary"
                  variant="outlined"
                  clickable
                  component="a"
                  href="mailto:hello@olgishcakes.co.uk"
                />
                <Chip
                  label={`Phone: ${CLIENT_BUSINESS_INFO.displayPhone}`}
                  color="primary"
                  variant="outlined"
                  clickable
                  component="a"
                  href={CLIENT_BUSINESS_INFO.telLink}
                />
              </Box>
            </Box>

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
