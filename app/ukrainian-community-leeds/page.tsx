import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip } from "@mui/material";
export const metadata: Metadata = {
  title: "Ukrainian Community Leeds | Ukrainian Events & Support | Olgish Cakes",
  description:
    "Learn about the Ukrainian community in Leeds. Find Ukrainian events, support groups, and cultural activities in West Yorkshire.",
  keywords:
    "Ukrainian community Leeds, Ukrainian events Leeds, Ukrainian support Leeds, Ukrainian culture Leeds",
  openGraph: {
    title: "Ukrainian Community Leeds | Ukrainian Events & Support",
    description:
      "Learn about the Ukrainian community in Leeds. Find Ukrainian events, support groups, and cultural activities in West Yorkshire.",
    url: "https://olgish-cakes.vercel.app/ukrainian-community-leeds",
    images: ["https://olgish-cakes.vercel.app/images/ukrainian-community-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ukrainian Community Leeds | Ukrainian Events & Support",
    description:
      "Learn about the Ukrainian community in Leeds. Find Ukrainian events, support groups, and cultural activities in West Yorkshire.",
    images: ["https://olgish-cakes.vercel.app/images/ukrainian-community-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/ukrainian-community-leeds",
  },
};

export default function UkrainianCommunityLeedsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Ukrainian Community Leeds",
    description:
      "Learn about the Ukrainian community in Leeds. Find Ukrainian events, support groups, and cultural activities in West Yorkshire.",
    url: "https://olgish-cakes.vercel.app/ukrainian-community-leeds",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
            Ukrainian Community in Leeds
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
            Find Ukrainian events, support groups, and cultural activities in Leeds and West
            Yorkshire.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip label="Community" color="primary" />
            <Chip label="Events" color="secondary" />
            <Chip label="Support" color="primary" />
            <Chip label="Culture" color="secondary" />
          </Box>
        </Box>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
            Ukrainian Community Organizations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            - Leeds Ukrainian Community Centre
            <br />- Ukrainian Association of Great Britain (Leeds Branch)
            <br />- Ukrainian Saturday School
            <br />- Ukrainian Church of the Holy Trinity
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
            Upcoming Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            - Ukrainian Independence Day Celebration
            <br />- Easter Paska Baking Workshop
            <br />- Ukrainian Christmas Carols
            <br />- Community Support Meetings
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ color: "#005BBB", fontWeight: "bold", mb: 2 }}>
            Support & Resources
          </Typography>
          <Typography variant="body2" color="text.secondary">
            - English language classes
            <br />- Refugee support
            <br />- Cultural integration programs
            <br />- Volunteering opportunities
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
