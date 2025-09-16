import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Button } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Buy Cake Online – Order Ukrainian Cakes in Leeds | Olgish Cakes",
  description:
    "Buy cake online in Leeds: Ukrainian honey cake (Medovik), Kyiv cake and more. Fast checkout, delivery across Leeds, prices from £35.",
  keywords: "buy cake, buy cake leeds, order cake online leeds, cake shop leeds, medovik",
  alternates: { canonical: "https://olgishcakes.co.uk/buy-cake" },
  openGraph: {
    title: "Buy Cake Online – Order Ukrainian Cakes in Leeds",
    description: "Order Ukrainian cakes with delivery across Leeds. Fast ordering and secure payment.",
    url: "https://olgishcakes.co.uk/buy-cake",
    siteName: "Olgish Cakes",
    images: [{ url: "https://olgishcakes.co.uk/images/hero-cake.jpg", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Buy Cake Online – Leeds", images: ["https://olgishcakes.co.uk/images/hero-cake.jpg"] },
};

export default function BuyCakePage() {
  const productCollectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Buy Cake Online",
    itemListElement: [
      { "@type": "ListItem", position: 1, url: "https://olgishcakes.co.uk/cakes/medovik" },
      { "@type": "ListItem", position: 2, url: "https://olgishcakes.co.uk/cakes/kyiv-cake" },
    ],
  } as const;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "How do I order?", acceptedAnswer: { "@type": "Answer", text: "Choose a cake, click Order or Contact, and we’ll confirm details and delivery." } },
      { "@type": "Question", name: "Do you deliver?", acceptedAnswer: { "@type": "Answer", text: "Yes, across Leeds with careful handling. Prices from £5." } },
      { "@type": "Question", name: "Can I customise the cake?", acceptedAnswer: { "@type": "Answer", text: "Yes, we offer personalised messages, sizes and flavours." } },
    ],
  } as const;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productCollectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Box sx={{ background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)", minHeight: "100vh", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography variant="h1" component="h1" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2.5rem", md: "3.5rem" }, fontWeight: 700, color: "primary.main", mb: 3, lineHeight: 1.2 }}>
              Buy Cake Online in Leeds
            </Typography>
            <Typography variant="h2" component="h2" sx={{ color: "text.secondary", maxWidth: "800px", mx: "auto", mb: 4, lineHeight: 1.6 }}>
              Order Ukrainian cakes with delivery across Leeds. Fast checkout, secure payment, custom options.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button component={Link} href="/cakes" variant="contained" color="primary" size="large" sx={{ px: 4, py: 1.5 }}>
                Browse Cakes
              </Button>
              <Button component={Link} href="/contact" variant="outlined" color="primary" size="large" sx={{ px: 4, py: 1.5 }}>
                Get Custom Quote
              </Button>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Popular Choices
            </Typography>
            <Grid container spacing={3}>
              {[
                { name: "Medovik (Honey Cake)", url: "/cakes/medovik", desc: "Real Ukrainian honey cake" },
                { name: "Kyiv Cake", url: "/cakes/kyiv-cake", desc: "Classic Kyiv meringue cake" },
              ].map((p, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Typography variant="h4" component="h3" sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}>
                    <Link href={p.url}>{p.name}</Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{p.desc}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Container>
      </Box>
    </>
  );
}


