import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Button, Chip } from "@mui/material";
import Link from "next/link";
import { AreasWeCover } from "../components/AreasWeCover";

export const metadata: Metadata = {
  title: "Leeds Bakery – Authentic Ukrainian Cakes, Same‑day Delivery | Olgish Cakes",
  description:
    "Looking for the best bakery in Leeds? Try authentic Ukrainian cakes including honey cake (Medovik) and Kyiv cake. Same‑day options, delivery across Leeds.",
  keywords:
    "leeds bakery, bakery leeds, best bakery leeds, cakes leeds, ukrainian bakery leeds, buy cake leeds, cake delivery leeds",
  alternates: { canonical: "https://olgishcakes.co.uk/leeds-bakery" },
  openGraph: {
    title: "Leeds Bakery – Authentic Ukrainian Cakes",
    description:
      "Authentic Ukrainian cakes in Leeds. Same‑day options and delivery across Leeds.",
    url: "https://olgishcakes.co.uk/leeds-bakery",
    siteName: "Olgish Cakes",
    images: [{ url: "https://olgishcakes.co.uk/images/ukrainian-bakery-leeds.jpg", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leeds Bakery – Authentic Ukrainian Cakes",
    description: "Authentic Ukrainian cakes with delivery across Leeds.",
    images: ["https://olgishcakes.co.uk/images/ukrainian-bakery-leeds.jpg"],
  },
};

export default function LeedsBakeryPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Do you deliver in Leeds?", acceptedAnswer: { "@type": "Answer", text: "Yes, we deliver across Leeds with prices from £5." } },
      { "@type": "Question", name: "Do you offer same‑day cakes?", acceptedAnswer: { "@type": "Answer", text: "Sometimes, depending on time and stock. Please contact us to check." } },
      { "@type": "Question", name: "What cakes are most popular?", acceptedAnswer: { "@type": "Answer", text: "Our signature Ukrainian honey cake (Medovik) and Kyiv cake." } },
    ],
  } as const;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Box sx={{ background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)", minHeight: "100vh", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography variant="h1" component="h1" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2.5rem", md: "3.5rem" }, fontWeight: 700, color: "primary.main", mb: 3, lineHeight: 1.2 }}>
              Leeds Bakery – Ukrainian Cakes
            </Typography>
            <Typography variant="h2" component="h2" sx={{ color: "text.secondary", maxWidth: "800px", mx: "auto", mb: 4, lineHeight: 1.6 }}>
              Freshly baked Ukrainian cakes – Medovik (honey cake), Kyiv cake and more. Order online with delivery across Leeds.
            </Typography>
            <Chip label="Same‑day options" sx={{ backgroundColor: "primary.main", color: "white", fontSize: "1.1rem", px: 3, py: 1, mb: 4 }} />
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button component={Link} href="/cakes" variant="contained" color="primary" size="large" sx={{ px: 4, py: 1.5 }}>
                Browse Cakes
              </Button>
              <Button component={Link} href="/cake-delivery" variant="outlined" color="primary" size="large" sx={{ px: 4, py: 1.5 }}>
                Delivery Info
              </Button>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Why Choose Our Leeds Bakery
            </Typography>
            <Grid container spacing={3}>
              {[
                { title: "Authentic Ukrainian recipes", desc: "Traditional flavours made from scratch" },
                { title: "Hand‑crafted to order", desc: "Fresh, personalised cakes for every occasion" },
                { title: "Delivery across Leeds", desc: "Careful handling and optional venue setup" },
                { title: "5★ customer rating", desc: "Trusted by Leeds customers" },
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Typography variant="h4" component="h3" sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <AreasWeCover subtitle="Order from anywhere in Leeds and nearby towns – we’ll deliver." />
        </Container>
      </Box>
    </>
  );
}


