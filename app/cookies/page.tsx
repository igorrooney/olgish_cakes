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
  title: "Cookie Policy | Olgish Cakes - Website Cookies",
  description:
    "Learn about how Olgish Cakes uses cookies on our website. Our cookie policy explains the types of cookies we use and how you can manage your preferences.",
  openGraph: {
    title: "Cookie Policy | Olgish Cakes - Website Cookies",
    description:
      "Learn about how Olgish Cakes uses cookies on our website. Our cookie policy explains the types of cookies we use and how you can manage your preferences.",
    url: "https://olgishcakes.co.uk/cookies",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cookies-policy.jpg",
        width: 1200,
        height: 630,
        alt: "Cookie Policy - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy | Olgish Cakes - Website Cookies",
    description:
      "Learn about how Olgish Cakes uses cookies on our website. Our cookie policy explains the types of cookies we use and how you can manage your preferences.",
    images: ["https://olgishcakes.co.uk/images/cookies-policy.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cookies",
  },
  keywords: [
    "cookie policy Olgish Cakes",
    "Ukrainian bakery cookies",
    "website cookie usage",
    "cake shop cookies",
    "Ukrainian cake cookies",
    "bakery website cookies",
    "cake order cookies",
    "Ukrainian dessert cookies",
    "bakery cookie policy",
    "cake service cookies",
    "Ukrainian cake website",
    "bakery cookie usage",
    "cake order website",
    "Ukrainian cake policy",
    "bakery cookie management",
    "cake shop cookie policy",
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

export default function CookiePolicyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cookie Policy - Olgish Cakes",
    description:
      "Learn about how Olgish Cakes uses cookies on our website. Our cookie policy explains the types of cookies we use and how you can manage your preferences.",
    url: "https://olgishcakes.co.uk/cookies",
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
      headline: "Cookie Policy",
      description: "Learn about how Olgish Cakes uses cookies on our website.",
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
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cookie Policy" }]} />
          </Box>

          <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontFamily: "var(--font-alice)",
                fontWeight: 700,
                mb: 4,
                color: "primary.main",
                textAlign: "center",
              }}
            >
              Cookie Policy
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              Last updated:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Typography>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              1. What Are Cookies?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Cookies are small text files that are placed on your computer or mobile device when
              you visit our website. They help us provide you with a better experience and allow us
              to improve our services.
            </Typography>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              2. Types of Cookies We Use
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              We use the following types of cookies:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Essential Cookies"
                  secondary="These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Analytics Cookies"
                  secondary="These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Preference Cookies"
                  secondary="These cookies remember your preferences and settings to enhance your browsing experience."
                />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              3. How We Use Cookies
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We use cookies to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Ensure the website functions correctly" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Remember your preferences and settings" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Analyze how visitors use our website" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Improve our services and user experience" />
              </ListItem>
            </List>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              4. Managing Your Cookie Preferences
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              You can control and/or delete cookies as you wish. You can delete all cookies that are
              already on your computer and you can set most browsers to prevent them from being
              placed. However, if you do this, you may have to manually adjust some preferences
              every time you visit our site and some services and functionalities may not work.
            </Typography>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              5. Third-Party Cookies
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Some cookies are placed by third-party services that appear on our pages. We use
              services like Google Analytics to help us understand how visitors use our website.
              These third parties may set their own cookies on your device.
            </Typography>

            <Typography variant="h2" component="h2" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              6. Contact Us
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              If you have any questions about our Cookie Policy, please contact us at:
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Email: hello@olgishcakes.co.uk
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Phone: +44 786 721 8194
            </Typography>
            <Typography variant="body1">Address: Based in Allerton Grange, Leeds LS17</Typography>

            <Box sx={{ mt: 6, textAlign: "center" }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
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
                }}>
                Back to Home
              </Button>
            </Link>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
