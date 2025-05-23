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
  title: "Privacy Policy | Olgish Cakes - Data Protection & Privacy",
  description:
    "Learn about how Olgish Cakes protects your privacy and handles your personal data. Our commitment to data protection and your rights.",
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
            1. Introduction
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            At Olgish Cakes, we are committed to protecting your privacy and ensuring the security
            of your personal information. This Privacy Policy explains how we collect, use, and
            safeguard your data when you visit our website or use our services.
          </Typography>

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
            2. Information We Collect
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We may collect the following types of information:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Contact Information"
                secondary="Name, email address, phone number, and delivery address"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Order Details"
                secondary="Cake preferences, special requirements, and payment information"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Website Usage"
                secondary="IP address, browser type, and pages visited"
              />
            </ListItem>
          </List>

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
            3. How We Use Your Information
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            We use your information to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Process and fulfill your cake orders" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communicate with you about your orders" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Improve our services and website" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Send you marketing communications (with your consent)" />
            </ListItem>
          </List>

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
            4. Data Security
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            We implement appropriate security measures to protect your personal information.
            However, no method of transmission over the internet is 100% secure, and we cannot
            guarantee absolute security.
          </Typography>

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
            5. Your Rights
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You have the right to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Access your personal data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Correct inaccurate data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Request deletion of your data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Object to processing of your data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Withdraw consent at any time" />
            </ListItem>
          </List>

          <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
            6. Contact Us
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            If you have any questions about this Privacy Policy or our data practices, please
            contact us at:
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
