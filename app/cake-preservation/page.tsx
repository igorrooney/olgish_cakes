import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cake Preservation | How to Store Cakes",
  description:
    "Learn how to preserve and store your cakes for maximum freshness. Tips for storing wedding cakes, birthday cakes, and traditional Ukrainian cakes.",
  keywords:
    "cake preservation, how to store cakes, cake storage tips, wedding cake storage, birthday cake storage",
  openGraph: {
    title: "Cake Preservation | How to Store Cakes",
    description:
      "Learn how to preserve and store your cakes for maximum freshness. Tips for storing wedding cakes, birthday cakes, and traditional Ukrainian cakes.",
    url: "https://olgishcakes.co.uk/cake-preservation",
    images: ["https://olgishcakes.co.uk/images/cake-preservation.jpg"],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake Preservation | How to Store Cakes",
    description:
      "Learn how to preserve and store your cakes for maximum freshness. Tips for storing wedding cakes, birthday cakes, and traditional Ukrainian cakes.",
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
              color: "#005BBB",
            }}
          >
            Cake Preservation
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
            Learn how to preserve and store your cakes for maximum freshness. Tips for weddings,
            birthdays, and traditional Ukrainian cakes.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Storage Tips" color="primary" />
            <Chip label="Wedding Cakes" color="secondary" />
            <Chip label="Birthday Cakes" color="primary" />
            <Chip label="Traditional Cakes" color="secondary" />
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mb: 6, textAlign: "center", maxWidth: "900px", mx: "auto", lineHeight: 1.7 }}>
          Proper cake preservation is essential to maintain the freshness, flavour, and beautiful appearance of your cake. 
          Whether you are storing a wedding cake, birthday cake, or traditional Ukrainian cake, these tips will help you 
          keep your cake perfect until it is time to enjoy it.
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
          <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
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
          <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
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

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h3" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
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
