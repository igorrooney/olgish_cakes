import { Metadata } from "next";
import { generatePageMetadata } from "@/app/utils/seo";
import { Container, Typography, Box, Grid, Card, CardContent, Chip } from "@mui/material";
import { StructuredData } from "@/app/components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "Ultimate Guide to Ukrainian Cakes Leeds",
  description:
    "Discover authentic Ukrainian cakes in Leeds. From traditional medovik honey cake to modern wedding designs. Expert baking techniques, cultural history, and where to order the best Ukrainian cakes in Yorkshire.",
  keywords: [
    "ukrainian cakes leeds",
    "medovik honey cake",
    "traditional ukrainian desserts",
    "ukrainian bakery leeds",
    "honey cake recipe",
    "eastern european cakes",
    "authentic ukrainian food leeds",
    "traditional baking techniques",
    "ukrainian wedding cakes",
    "cultural desserts yorkshire",
  ],
  type: "article",
  publishedTime: new Date().toISOString(),
  author: "Olgish Cakes - Ukrainian Baking Experts",
  section: "Food & Culture",
  tags: [
    "Ukrainian Cuisine",
    "Traditional Baking",
    "Honey Cake",
    "Cultural Food",
    "Leeds Food Scene",
  ],
});

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Ultimate Guide to Ukrainian Cakes in Leeds",
  description:
    "Comprehensive guide to Ukrainian cake traditions, recipes, and where to find authentic Ukrainian cakes in Leeds",
  author: {
    "@type": "Organization",
    name: "Olgish Cakes",
    url: "https://olgishcakes.co.uk",
  },
  publisher: {
    "@type": "Organization",
    name: "Olgish Cakes",
    logo: {
      "@type": "ImageObject",
      url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
    },
  },
  datePublished: new Date().toISOString(),
  dateModified: new Date().toISOString(),
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://olgishcakes.co.uk/ultimate-ukrainian-cake-guide",
  },
  image: "https://olgishcakes.co.uk/images/ukrainian-honey-cake-medovik-layers.jpg",
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Ukrainian honey cake (medovik)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ukrainian honey cake, known as medovik, is a traditional layered cake made with thin honey-infused sponge layers and rich sour cream filling. Unlike Russian variants, Ukrainian medovik often uses specific techniques passed down through generations, creating a unique texture and flavor profile.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I buy authentic Ukrainian cakes in Leeds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Olgish Cakes is Leeds' premier Ukrainian bakery, specializing in authentic traditional recipes and modern custom designs. We offer both classic medovik and bespoke Ukrainian-inspired cakes for weddings and celebrations throughout West Yorkshire.",
      },
    },
    {
      "@type": "Question",
      name: "How is Ukrainian honey cake different from other honey cakes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ukrainian honey cake features distinctively thin, delicate layers made with a specific honey-baking soda technique, filled with tangy sour cream frosting. The preparation method and ingredients create a lighter, more nuanced flavor compared to denser honey cakes from other regions.",
      },
    },
    {
      "@type": "Question",
      name: "Can Ukrainian cakes be customized for modern celebrations?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely! Modern Ukrainian cake artists blend traditional recipes with contemporary design techniques. Wedding cakes can incorporate Ukrainian flavors like honey, poppy seed, and sour cherry while featuring elegant modern aesthetics perfect for today's celebrations.",
      },
    },
  ],
};

export default function UkrainianCakeGuidePage() {
  const cakeTypes = [
    {
      name: "Medovik (Honey Cake)",
      description:
        "The best Ukrainian dessert, with delicate honey layers and tangy sour cream filling",
      origin: "Traditional family recipe from many centuries ago",
      occasions: "Celebrations, holidays, family gatherings",
      characteristics: "Light layers, complex honey taste, creamy texture",
    },
    {
      name: "Kyivsky Tort (Kiev Cake)",
      description: "Nice cake with meringue layers, buttercream, and roasted nuts",
      origin: "Made in Kiev, became Ukrainian classic",
      occasions: "Special celebrations, formal events",
      characteristics: "Crunchy meringue, rich buttercream, decorative nuts",
    },
    {
      name: "Smetannyk (Sour Cream Cake)",
      description: "Rich, moist cake made with lots of Ukrainian sour cream",
      origin: "Traditional peasant cake, made into modern delicacy",
      occasions: "Everyday celebrations, tea time",
      characteristics: "Dense texture, tangy taste, very moist",
    },
    {
      name: "Makoviy Tort (Poppy Seed Cake)",
      description: "Traditional cake with ground poppy seeds in both layers and filling",
      origin: "Eastern European tradition, Ukrainian way",
      occasions: "Christmas, Easter, religious celebrations",
      characteristics: "Nutty poppy taste, dark look, festive decoration",
    },
  ];

  const bakingTechniques = [
    {
      technique: "Honey Layer Preparation",
      description: "Creating thin, pliable layers using heated honey and baking soda reaction",
      importance: "Essential for authentic texture and flavor development",
      skill: "Advanced - requires precise timing and temperature control",
    },
    {
      technique: "Sour Cream Handling",
      description: "Proper preparation and stabilization of sour cream for filling",
      importance: "Prevents separation and ensures smooth, creamy texture",
      skill: "Intermediate - understanding dairy science helps",
    },
    {
      technique: "Layer Assembly",
      description: "Strategic layering and resting times for optimal flavor melding",
      importance: "Critical for final texture and taste integration",
      skill: "Intermediate - patience and precision required",
    },
  ];

  return (
    <>
      <StructuredData type="article" data={structuredData} />
      <StructuredData type="faq" data={faqData} />

      <main role="main">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Hero Section */}
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 700,
                mb: 2,
                color: "#2E3192", // Brand primary color
              }}
            >
              Complete Guide to Ukrainian Cakes in Leeds
            </Typography>
            <Typography
              variant="h2"
              component="p"
              sx={{
                fontSize: "1.25rem",
                color: "text.secondary",
                mb: 4,
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              Learn about Ukrainian baking tradition, from real medovik honey cake to
              modern wedding cakes. Your complete guide to understanding, enjoying, and
              ordering the best Ukrainian cakes in Yorkshire.
            </Typography>

            <Box
              sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap", mb: 4 }}
            >
              <Chip label="Traditional Recipes" color="primary" />
              <Chip label="Cultural Heritage" color="primary" variant="outlined" />
              <Chip label="Modern Designs" color="primary" />
              <Chip label="Good Techniques" color="primary" variant="outlined" />
            </Box>
          </Box>

          {/* Introduction Section */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ mb: 3, fontSize: "2rem", fontWeight: 600 }}
            >
              Why Ukrainian Cakes Are Special
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Ukrainian cake-making is more than just baking—it's cultural art that has been
              passed down through many generations. Each cake tells story of tradition, family
              history, and rich food culture of Ukraine. In Leeds, this tradition
              still grows, bringing authentic flavours and traditional techniques to
              Yorkshire's different food scene.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
              The most famous of all Ukrainian cakes is the <strong>medovik</strong> (honey cake), a
              delicate masterpiece that shows Ukrainian way of balancing sweet taste with
              complex flavors. Unlike Russian version, Ukrainian honey cake has lighter
              layers and special tang of real sour cream, making dessert that's
              both comforting and sophisticated.
            </Typography>
          </Box>

          {/* Traditional Ukrainian Cakes Section */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ mb: 4, fontSize: "2rem", fontWeight: 600 }}
            >
              Ukrainian Cake Types
            </Typography>
            <Grid container spacing={4}>
              {cakeTypes.map((cake, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ height: "100%", borderRadius: "12px" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{ mb: 2, fontSize: "1.5rem", fontWeight: 600, color: "#2E3192" }}
                      >
                        {cake.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}
                      >
                        {cake.origin}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                        {cake.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Perfect for:
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {cake.occasions}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Key Characteristics:
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {cake.characteristics}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Baking Techniques Section */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ mb: 4, fontSize: "2rem", fontWeight: 600 }}
            >
              Ukrainian Baking Techniques
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Ukrainian cake baking uses special techniques that have been improved over
              many centuries. These methods are what give Ukrainian cakes their special textures and
              tastes, making them different from other European baking traditions.
            </Typography>

            {bakingTechniques.map((technique, index) => (
              <Card key={index} sx={{ mb: 3, borderRadius: "12px" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ fontSize: "1.3rem", fontWeight: 600, color: "#2E3192" }}
                    >
                      {technique.technique}
                    </Typography>
                    <Chip
                      label={technique.skill}
                      size="small"
                      color={technique.skill.includes("Advanced") ? "error" : "primary"}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                    {technique.description}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                    <strong>Why it matters:</strong> {technique.importance}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Modern Applications Section */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ mb: 4, fontSize: "2rem", fontWeight: 600 }}
            >
              Ukrainian Cakes in Modern Celebrations
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Today's Ukrainian cake makers in Leeds are mixing traditional flavors
              with modern design looks. Wedding cakes with classic medovik flavors
              can be styled nicely for modern ceremonies, while keeping the real taste
              that makes Ukrainian desserts so special.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Custom Ukrainian-inspired cakes give couples and celebration hosts chance to
              honor cultural heritage while creating beautiful centerpieces that impress guests. From
              multi-tier wedding cakes with honey cake layers to birthday celebrations with
              traditional poppy seed elements, the possibilities are endless.
            </Typography>
          </Box>

          {/* FAQ Section */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ mb: 4, fontSize: "2rem", fontWeight: 600 }}
            >
              Frequently Asked Questions
            </Typography>

            {faqData.mainEntity.map((faq, index) => (
              <Card key={index} sx={{ mb: 3, borderRadius: "12px" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 2, fontSize: "1.2rem", fontWeight: 600 }}
                  >
                    {faq.name}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {faq.acceptedAnswer.text}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Call to Action */}
          <Box
            sx={{ textAlign: "center", py: 4, backgroundColor: "#f8f9fa", borderRadius: "12px" }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{ mb: 3, fontSize: "1.8rem", fontWeight: 600 }}
            >
              Try Real Ukrainian Cakes in Leeds
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, lineHeight: 1.8, maxWidth: "600px", mx: "auto" }}
            >
              Ready to taste the authentic flavours of Ukraine? Olgish Cakes brings traditional
              recipes and modern art together to create unforgettable desserts for your special
              occasions.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/cakes" passHref aria-label="Browse our complete cake collection">
                <Typography
                  component="a"
                  sx={{
                    backgroundColor: "#2E3192",
                    color: "white",
                    px: 3,
                    py: 1.5,
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#1e2062" },
                  }}
                >
                  See My Cakes
                </Typography>
              </Link>
              <Link href="/contact" passHref aria-label="Contact us for custom cake orders">
                <Typography
                  component="a"
                  sx={{
                    border: "2px solid #2E3192",
                    color: "#2E3192",
                    px: 3,
                    py: 1.5,
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#f0f0f8" },
                  }}
                >
                  Contact Me
                </Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </main>
    </>
  );
}
