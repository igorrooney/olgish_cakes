import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import Script from "next/script";
import { colors } from '@/lib/design-system';

export const metadata: Metadata = {
  title: "How to Preserve Cakes | Complete Cake Storage Guide",
  description:
    "Learn how to preserve cakes and keep them fresh. Expert tips for storing wedding cakes, birthday cakes, honey cakes. Complete guide from Ukrainian baker.",
  keywords:
    "how to preserve cakes, how to preserve cake, cake preservation, how to store cakes, cake storage tips, preserve wedding cake, preserve birthday cake, honey cake storage, medovik storage",
  openGraph: {
    title: "How to Preserve Cakes | Complete Cake Storage Guide",
    description:
      "Learn how to preserve cakes and keep them fresh. Expert tips for storing wedding cakes, birthday cakes, honey cakes. Complete guide from Ukrainian baker.",
    url: "https://olgishcakes.co.uk/cake-preservation",
    images: ["https://olgishcakes.co.uk/images/cake-preservation.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Preserve Cakes | Complete Cake Storage Guide",
    description:
      "Learn how to preserve cakes and keep them fresh. Expert tips for storing wedding cakes, birthday cakes, honey cakes.",
    images: ["https://olgishcakes.co.uk/images/cake-preservation.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-preservation",
  },
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
    google: "your-google-verification-code",
  },
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
  },
};

export default function CakePreservationPage() {
  const tips = [
    {
      title: "Room Temperature Storage",
      description:
        "Most cakes can be stored at room temperature for up to 2 days in an airtight container.",
      icon: "🏠",
    },
    {
      title: "Refrigeration",
      description:
        "Cakes with cream or fresh fruit should be refrigerated and consumed within 3 days.",
      icon: "❄️",
    },
    {
      title: "Freezing Cakes",
      description:
        "Wrap cakes tightly and freeze for up to 3 months. Thaw in the fridge overnight.",
      icon: "🧊",
    },
    {
      title: "Avoid Sunlight",
      description: "Keep cakes away from direct sunlight to prevent melting and drying.",
      icon: "☀️",
    },
    {
      title: "Use Cake Domes",
      description: "Cake domes help maintain moisture and protect from air exposure.",
      icon: "🎂",
    },
    {
      title: "Label and Date",
      description: "Label cakes before freezing to keep track of freshness.",
      icon: "🏷️",
    },
  ];

  return (
    <>
      <Script
        id="cake-preservation-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Preserve and Store Cakes",
            description:
              "Learn how to preserve and store your cakes for maximum freshness. Tips for storing wedding cakes, birthday cakes, and traditional Ukrainian cakes.",
            image: "https://olgishcakes.co.uk/images/cake-preservation.jpg",
            totalTime: "PT5M",
            estimatedCost: {
              "@type": "MonetaryAmount",
              currency: "GBP",
              value: "0",
            },
            supply: [
              {
                "@type": "HowToSupply",
                name: "Airtight container",
              },
              {
                "@type": "HowToSupply",
                name: "Plastic wrap",
              },
              {
                "@type": "HowToSupply",
                name: "Cake dome",
              },
              {
                "@type": "HowToSupply",
                name: "Labels",
              },
            ],
            step: [
              {
                "@type": "HowToStep",
                name: "Choose Storage Method",
                text: "Decide between room temperature (2 days), refrigeration (3 days), or freezing (3 months) based on cake type and timeline.",
              },
              {
                "@type": "HowToStep",
                name: "Prepare for Storage",
                text: "Wrap cakes in plastic wrap or place in airtight container to prevent drying and odor absorption.",
              },
              {
                "@type": "HowToStep",
                name: "Store Properly",
                text: "Keep away from direct sunlight and store in appropriate temperature conditions.",
              },
              {
                "@type": "HowToStep",
                name: "Label and Monitor",
                text: "Label frozen cakes with date and type, and monitor freshness regularly.",
              },
            ],
            url: "https://olgishcakes.co.uk/cake-preservation",
          }),
        }}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: "bold",
              mb: 2,
              color: colors.primary.main,
            }}
          >
            How to Preserve Cakes
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "text.secondary",
              mb: 3,
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            Complete guide on how to preserve cake and keep it fresh. Expert tips from a Ukrainian baker for all cake types.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Storage Tips" color="primary" />
            <Chip label="Wedding Cakes" color="secondary" />
            <Chip label="Birthday Cakes" color="primary" />
            <Chip label="Traditional Cakes" color="secondary" />
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mb: 4, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}>
          Knowing how to preserve cake properly is essential to maintain freshness, flavour, and beautiful appearance.
          Whether you're learning how to preserve cakes for a wedding, birthday celebration, or storing traditional Ukrainian honey cake,
          these expert tips will help you keep your cake perfect until it's time to enjoy it.
        </Typography>
        <Typography variant="body1" sx={{ mb: 6, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}>
          As a Ukrainian baker in Leeds, I've learned traditional methods for how to preserve cake that keep flavors fresh and textures perfect.
          These techniques work for all types of cakes - from simple sponges to complex layered Ukrainian cakes like Medovik.
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {tips.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                  {item.icon}
                </Typography>
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{ mb: 2, color: "#005BBB", fontWeight: "bold" }}
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {item.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            Ukrainian Cake Preservation Tips
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Honey Cake (Medovik) Storage
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  My traditional honey cake is best stored in the refrigerator to maintain its beautiful honey flavour and texture.
                  Wrap it tightly in plastic wrap or place it in an airtight container. The honey layers will stay moist and delicious
                  for up to 5-7 days. For longer storage, you can freeze individual slices for up to 3 months.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Kyiv Cake Preservation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  The delicate meringue layers in Kyiv cake need special care. Store in the refrigerator in an airtight container
                  to maintain the crispness of the meringue. Handle with care to avoid crushing the beautiful layers.
                  Best consumed within 3-5 days for optimal texture and flavour.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Decorated Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Cakes with fondant decorations or sugar flowers need extra care. Store in a cool, dry place away from direct sunlight.
                  If the cake has fresh flowers, remove them before storing. Fondant-covered cakes can be stored at room temperature
                  for 2-3 days if the environment is not too humid.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Cream-Filled Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Cakes with fresh cream or custard fillings must be refrigerated immediately. These cakes are best enjoyed within
                  2-3 days of baking. Always store in the refrigerator and bring to room temperature for 30 minutes before serving
                  for the best taste experience.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            Step-by-Step Preservation Guide
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>📦</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Prepare for Storage
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  First, make sure your cake is completely cool before storing. Remove any decorations that might be damaged by storage.
                  Choose the right container - airtight for refrigerator storage, or plastic wrap for freezer storage.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🌡️</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Choose Storage Method
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Room temperature for 24 hours, refrigerator for 5-7 days, or freezer for 2-3 months. The method depends on
                  when you plan to serve the cake and what type of cake it is. Cream-filled cakes must go in the refrigerator.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2 }}>🍰</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Serve Perfectly
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Remove from storage 1-2 hours before serving to bring to room temperature. This allows the flavours to develop
                  fully and the texture to be perfect. Cut with a sharp knife for clean slices and enjoy!
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            How to Preserve Different Types of Cakes
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Sponge Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  How to preserve cake with sponge: Wrap tightly in cling film to prevent drying. Store at room temperature for 2 days or refrigerate for up to 5 days. Sponge cakes freeze well - wrap in cling film then foil, freeze up to 3 months. Thaw at room temperature for best texture.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Buttercream Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  How to preserve cakes with buttercream: Refrigerate immediately. Buttercream cakes must stay cold. Store in airtight container or cake box in fridge for up to 5 days. Before serving, bring to room temperature for 1 hour so buttercream softens and flavors develop.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Fondant-Covered Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  How to preserve cake with fondant: Store at room temperature in cool, dry place. Do not refrigerate - condensation will ruin fondant. Cover loosely with cake dome. Fondant cakes stay fresh 3-5 days. Keep away from sunlight and humidity for best preservation.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Cheesecakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  How to preserve cheesecake: Always refrigerate. Cover with cling film or store in airtight container. Cheesecakes stay fresh 5-7 days in fridge. Can freeze for up to 2 months, but texture may change slightly. Thaw overnight in refrigerator.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            How to Preserve Cake: The Complete Process
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                Learning how to preserve cakes properly starts with understanding the complete process. Here's my step-by-step method for how to preserve cake perfectly:
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 3, height: "100%", backgroundColor: "white" }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2, textAlign: "center" }}>1️⃣</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main", textAlign: "center" }}>
                  Cool Completely
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  The first step in how to preserve cake: wait until it's completely cool. Warm cake creates condensation that makes it soggy. For layered cakes, ensure each layer is cool before assembling. This can take 2-3 hours at room temperature.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 3, height: "100%", backgroundColor: "white" }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2, textAlign: "center" }}>2️⃣</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main", textAlign: "center" }}>
                  Wrap Properly
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Critical for how to preserve cakes: wrap tightly in cling film, ensuring no air pockets. For extra protection, add layer of foil over cling film. This double wrapping is best method for how to preserve cake when freezing.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 3, height: "100%", backgroundColor: "white" }}>
                <Typography variant="h4" sx={{ fontSize: "3rem", mb: 2, textAlign: "center" }}>3️⃣</Typography>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main", textAlign: "center" }}>
                  Choose Storage Method
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  For how to preserve cake short-term: refrigerate for 3-7 days. For long-term: freeze up to 3 months. Label with date. The key to how to preserve cakes successfully is choosing the right method for your cake type and timeline.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 6 }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            Frequently Asked Questions About How to Preserve Cakes
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                  How long can I preserve cake in the fridge?
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  Most cakes stay fresh 5-7 days when properly refrigerated. Cream-filled cakes: 3-5 days. Buttercream cakes: 5-7 days. Fondant cakes should not be refrigerated - store at room temperature for 3-5 days.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                  Can I freeze cake to preserve it?
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  Yes! Freezing is excellent for how to preserve cakes long-term. Most cakes freeze well for up to 3 months. Wrap tightly in cling film then foil. Thaw in fridge overnight, then bring to room temperature before serving.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                  Should I preserve cake at room temperature?
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  Simple sponge cakes and fondant cakes can be preserved at room temperature for 2-3 days in airtight container. Any cake with cream, custard, or fresh fruit must be refrigerated immediately for food safety.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                  How to preserve wedding cake top tier?
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  Wrap top tier tightly in multiple layers of cling film, then foil. Place in airtight container or freezer bag. Freeze immediately. When preserved properly, wedding cake can last up to 1 year in freezer.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                  What's the best way to preserve cake overnight?
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  To preserve cake overnight: wrap in cling film or place in airtight container. If cake has cream filling, refrigerate. Simple cakes can stay at room temperature. This short-term preservation keeps cake fresh and moist.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                  Does freezing preserve cake quality?
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  When done correctly, freezing preserves cake quality excellently. The key is proper wrapping to prevent freezer burn. Most people can't tell difference between fresh and properly frozen cake after thawing.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
            Common Preservation Mistakes to Avoid
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Storing While Warm
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Never store a cake while it is still warm. This creates condensation that will make the cake soggy and affect the texture.
                  Always let your cake cool completely before wrapping and storing.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Improper Wrapping
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Not wrapping your cake properly allows air to reach it, making it dry and stale. Always use airtight containers
                  or wrap tightly in plastic wrap to maintain freshness and prevent the cake from absorbing other flavours.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Wrong Temperature
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Storing cakes in the wrong temperature can ruin them. Cream-filled cakes must be refrigerated, while some decorated cakes
                  are better at room temperature. Know your cake type and store accordingly.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                  Too Long Storage
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Even with perfect preservation, cakes have a limited shelf life. Fresh cakes are always best, so try to consume
                  within the recommended timeframes. If you need to store longer, freezing is your best option.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
}
