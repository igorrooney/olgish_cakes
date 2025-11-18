import {
  Box,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@/lib/mui-optimization";
import type { Metadata } from "next";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ContactForm } from "../components/ContactForm"; // Adjust the path as necessary
// Import StructuredData
import {
  EmailIcon,
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/lib/mui-optimization";
import { generatePageProductSchemaScripts } from "@/lib/schema-helpers";

// SEO Metadata
export const metadata: Metadata = {
  title: "Contact Olgish Cakes | Leeds Custom Cakes",
  description:
    "Get in touch with Olgish Cakes in Leeds for custom cake orders, questions, or prices. Contact me via phone, email, WhatsApp, or our online form.",
  openGraph: {
    title: "Contact Olgish Cakes | Leeds Custom Cakes",
    description:
      "Get in touch with Olgish Cakes in Leeds for custom cake orders, questions, or prices. Contact me via phone, email, WhatsApp, or our online form.",
    url: "https://olgishcakes.co.uk/contact",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Olgish Cakes - Leeds Ukrainian Bakery",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Olgish Cakes | Leeds Custom Cakes",
    description:
      "Get in touch with Olgish Cakes in Leeds for custom cake orders, questions, or prices. Contact me via phone, email, WhatsApp, or our online form.",
    images: ["https://olgishcakes.co.uk/images/contact.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/contact",
  },
  keywords: [
    "contact Olgish Cakes Leeds",
    "Ukrainian bakery contact",
    "cake order inquiries",
    "custom cake consultation",
    "wedding cake contact",
    "birthday cake orders",
    "cake delivery inquiries",
    "Ukrainian cake quotes",
    "cake consultation Leeds",
    "bakery contact information",
    "cake order phone number",
    "cake order email",
    "WhatsApp cake orders",
    "cake delivery questions",
    "custom cake design contact",
    "Ukrainian dessert orders",
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

export default function ContactPage() {
  const contactEmail = "hello@olgishcakes.co.uk"; // Updated email
  const contactPhone = "+44 786 721 8194"; // Updated phone number
  const whatsappLink = `https://wa.me/${contactPhone.replace(/\D/g, "")}`;

  // Structured data for contact page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Olgish Cakes",
    description:
      "Get in touch with Olgish Cakes in Leeds for custom cake orders, questions, or prices.",
    url: "https://olgishcakes.co.uk/contact",
    mainEntity: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: contactPhone,
          contactType: "customer service",
          availableLanguage: "English",
          areaServed: "Leeds, UK",
        },
        {
          "@type": "ContactPoint",
          email: contactEmail,
          contactType: "customer service",
          availableLanguage: "English",
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Allerton Grange",
        addressLocality: "Leeds",
        postalCode: "LS17",
        addressCountry: "GB",
      },
      sameAs: [
        "https://www.instagram.com/olgish_cakes/",
        "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
      ],
    },
  };

  // Product structured data for products mentioned on contact page
  const productSchemas = generatePageProductSchemaScripts(
    [
      {
        name: "Custom Wedding Cakes",
        description: "Beautiful custom wedding cakes designed for your special day. Traditional Ukrainian wedding cakes with elegant decorations and sophisticated flavours. Free consultation and cake tasting available.",
        image: "https://olgishcakes.co.uk/images/wedding-cake-hero.jpg",
        price: 150,
        category: "Wedding Cakes",
      },
      {
        name: "Ukrainian Honey Cake",
        description: "Traditional Ukrainian honey cake (Medovik) made with authentic recipes. Handcrafted with premium ingredients, featuring delicate layers and rich flavours. Perfect for celebrations and special occasions.",
        image: "https://olgishcakes.co.uk/images/honey-cake-hero.jpg",
        price: 25,
        category: "Ukrainian Honey Cake",
      },
    ],
    "contact"
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 1, md: 0 } }}>
      {/* Structured Data */}
      <script
        id="contact-page-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {productSchemas.map(({ id, schema }) => (
        <script
          key={id}
          id={id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Contact", href: "/contact" },
          ]}
        />
      </Box>

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
        <Typography variant="h1" component="h1" gutterBottom align="center" sx={{ mb: 5 }}>
          Contact Me
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
              <Typography variant="h2" component="h2" gutterBottom>
                Get in Touch
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Reach out via phone, email, or social media. I'm happy to answer questions or
                talk about custom cake orders.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2} sx={{ mb: 3 }}>
                {/* Phone */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <PhoneIcon color="action" />
                  <Link
                    href={`tel:${contactPhone}`}
                    color="text.secondary"
                    underline="hover"
                    aria-label={`Call us at ${contactPhone}`}
                  >
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
                  <Link
                    href={`mailto:${contactEmail}`}
                    color="text.secondary"
                    underline="hover"
                    aria-label={`Email us at ${contactEmail}`}
                  >
                    <Typography variant="body1">{contactEmail}</Typography>
                  </Link>
                </Stack>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Social Links Section */}
              <Box>
                <Typography variant="h2" component="h2" gutterBottom>
                  Follow Me
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Link
                    href="https://www.instagram.com/olgish_cakes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="text.secondary"
                    aria-label="Follow me on Instagram"
                    sx={{ "&:hover": { color: "#E1306C" } }}
                  >
                    <InstagramIcon fontSize="large" />
                  </Link>
                  <Link
                    href="https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="text.secondary"
                    aria-label="Follow me on Facebook"
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
              <Typography variant="h2" component="h2" gutterBottom>
                Send Me a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use the form below to send me a direct message.
              </Typography>
              <ContactForm />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
