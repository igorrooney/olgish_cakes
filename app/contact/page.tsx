import type { Metadata } from "next";
import { Container, Typography, Box, Stack, Link, Grid, Paper, Divider } from "@mui/material";
import { ContactForm } from "../components/ContactForm"; // Adjust the path as necessary
// Import StructuredData
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram"; // Example social icon
import FacebookIcon from "@mui/icons-material/Facebook"; // Example social icon
import WhatsAppIcon from "@mui/icons-material/WhatsApp"; // Import WhatsApp icon

// SEO Metadata
export const metadata: Metadata = {
  title: "Contact Olgish Cakes | Leeds Custom Cake Orders & Inquiries",
  description:
    "Get in touch with Olgish Cakes in Leeds for custom cake orders, inquiries, or quotes. Contact us via phone, email, WhatsApp, or our online form.",
  // Add canonical URL if your domain is set up
  // alternates: {
  //   canonical: 'https://olgishcakes.com/contact',
  // },
};

export default function ContactPage() {
  const contactEmail = "olgish.cakes@gmail.com"; // Updated email
  const contactPhone = "+447867218194"; // Updated phone number
  const whatsappLink = `https://wa.me/${contactPhone.replace(/\D/g, "")}`;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, px: { xs: 1, md: 0 } }}>
      {/* Add structured data component */}
      

      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          background: "#fffaf4",
          borderRadius: 4,
          boxShadow: 1,
          p: { xs: 2, md: 4 },
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 5 }}>
          Contact Us
        </Typography>
        <Grid container spacing={5} alignItems="stretch">
          {/* Left Column: Contact Info & Social Links */}
          <Grid item xs={12} md={5} sx={{ display: "flex" }}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxShadow: "0 4px 24px 0 rgba(0,0,0,0.07)",
              }}
            >
              <Typography variant="h6" component="h2" gutterBottom>
                Get in Touch
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Reach out via phone, email, or social media. We're happy to answer questions or
                discuss custom cake orders.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2} sx={{ mb: 3 }}>
                {/* Phone */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <PhoneIcon color="action" />
                  <Link href={`tel:${contactPhone}`} color="text.secondary" underline="hover">
                    <Typography variant="body1">{contactPhone}</Typography>
                  </Link>
                  <Link
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    sx={{ display: "inline-flex", alignItems: "center" }}
                    aria-label="Chat on WhatsApp"
                  >
                    <WhatsAppIcon sx={{ color: "#25D366", fontSize: "1.5rem" }} />
                  </Link>
                </Stack>
                {/* Email */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <EmailIcon color="action" />
                  <Link href={`mailto:${contactEmail}`} color="text.secondary" underline="hover">
                    <Typography variant="body1">{contactEmail}</Typography>
                  </Link>
                </Stack>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Social Links Section */}
              <Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  Follow Us
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Link
                    href="https://www.instagram.com/olgish_cakes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="text.secondary"
                    aria-label="Instagram"
                    sx={{ "&:hover": { color: "#E1306C" } }}
                  >
                    <InstagramIcon fontSize="large" />
                  </Link>
                  <Link
                    href="https://www.facebook.com/profile.php?id=61557043820222"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="text.secondary"
                    aria-label="Facebook"
                    sx={{ "&:hover": { color: "#1877F2" } }}
                  >
                    <FacebookIcon fontSize="large" />
                  </Link>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Contact Form */}
          <Grid item xs={12} md={7} sx={{ display: "flex" }}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                boxShadow: "0 4px 24px 0 rgba(0,0,0,0.07)",
              }}
            >
              <Typography variant="h6" component="h2" gutterBottom>
                Send Us a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use the form below to send us a direct message.
              </Typography>
              <ContactForm />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
