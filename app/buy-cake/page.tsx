import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Button } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Buy Cake Online – Order Ukrainian Cakes in Leeds",
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
              How to Order Your Perfect Cake
            </Typography>

            <Typography variant="body1" sx={{ mb: 4, textAlign: "center", maxWidth: "800px", mx: "auto", lineHeight: 1.7 }}>
              Ordering your cake from me is very simple! I believe every celebration deserves something special,
              so I make sure the process is easy and personal. Here is how it works:
            </Typography>

            <Grid container spacing={4} sx={{ mb: 6 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>1️⃣</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Choose Your Cake
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse my collection or tell me what you have in mind. I have traditional Ukrainian cakes like honey cake and Kyiv cake,
                    plus many other flavours that everyone will love.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>2️⃣</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Contact Me
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send me a message or call me to discuss your cake. I love hearing about your celebration and helping you choose
                    the perfect design and flavour for your special day.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>3️⃣</Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Enjoy Your Cake
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    I will make your cake with love and care, then deliver it fresh to your door across Leeds.
                    Your celebration will be perfect with one of my handmade cakes!
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="h4" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.5rem", md: "1.8rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Most Popular Cakes
            </Typography>
            <Grid container spacing={3}>
              {[
                { name: "Honey Cake (Medovik)", url: "/cakes/honey-cake-medovik", desc: "Traditional Ukrainian honey cake with 5 layers of soft honey sponge and light buttercream made with condensed milk. Handmade with real honey for authentic flavor." },
                { name: "Kyiv Cake", url: "/cakes/kyiv-cake", desc: "Premium handmade Ukrainian cake with meringue and cashew nuts, filled with custard cream between layers. A true masterpiece of Ukrainian baking." },
                { name: "Vanilla Delicia Birthday Cake", url: "/cakes/vanilla-delicia-birthday-cake", desc: "Fluffy sponge with creamy butter and condensed milk filling. Perfect for custom designs and special celebrations, available in various sizes." },
                { name: "Napoleon Cake", url: "/cakes/napoleon-cake", desc: "Handmade with 7 layers of flaky puff pastry and smooth diplomat cream. Traditional Ukrainian recipe - crunchy and creamy in every bite." },
              ].map((p, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600, color: "primary.main" }}>
                    <Link href={p.url} aria-label={`Learn more about ${p.name}`}>{p.name}</Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{p.desc}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
            <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Why Choose My Cakes?
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Made with Love and Tradition
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Every cake I make is crafted with the same love and attention that my grandmother taught me.
                    I use traditional Ukrainian recipes and techniques, but I also love creating new flavours that
                    bring joy to modern celebrations.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Fresh Ingredients, No Compromises
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    I use only the best ingredients - real butter, fresh eggs, quality flour, and natural flavours.
                    No artificial preservatives or shortcuts. Your cake will taste amazing because I care about every ingredient.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Personal Service
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    When you order from me, you are not just getting a cake - you are getting a personal service.
                    I want to understand your celebration and make sure your cake is perfect for the occasion.
                    Every detail matters to me.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                    Delivered with Care
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    I deliver your cake personally across Leeds, making sure it arrives in perfect condition.
                    Your cake is not just a product to me - it is part of your special moment, and I treat it with the respect it deserves.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

