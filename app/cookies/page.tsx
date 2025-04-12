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
import { StructuredData } from "../components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | Olgish Cakes - Website Cookie Usage",
  description:
    "Learn about how Olgish Cakes uses cookies on our website. Our cookie policy explains the types of cookies we use and how you can manage your preferences.",
};

export default function CookiePolicyPage() {
  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom, #FFF5E6 0%, #FFFFFF 100%)",
        minHeight: "100vh",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <StructuredData />

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

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
            1. What Are Cookies?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Cookies are small text files that are placed on your computer or mobile device when you
            visit our website. They help us provide you with a better experience and allow us to
            improve our services.
          </Typography>

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
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

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
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

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
            4. Managing Your Cookie Preferences
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You can control and/or delete cookies as you wish. You can delete all cookies that are
            already on your computer and you can set most browsers to prevent them from being
            placed. However, if you do this, you may have to manually adjust some preferences every
            time you visit our site and some services and functionalities may not work.
          </Typography>

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
            5. Third-Party Cookies
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Some cookies are placed by third-party services that appear on our pages. We use
            services like Google Analytics to help us understand how visitors use our website. These
            third parties may set their own cookies on your device.
          </Typography>

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
            6. Contact Us
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            If you have any questions about our Cookie Policy, please contact us at:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Email: olgish.cakes@gmail.com
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Phone: +447867218194
          </Typography>
          <Typography variant="body1">
            Address: 107 Harehills Lane, Leeds, LS8 4DN, United Kingdom
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
  );
}
