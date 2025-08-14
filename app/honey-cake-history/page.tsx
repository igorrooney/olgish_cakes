import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Honey Cake History | Ukrainian Honey Cake History | Traditional Ukrainian Desserts | Olgish Cakes",
  description:
    "Discover the fascinating history of honey cake, Ukraine's beloved honey cake. Learn about its origins, cultural significance, and traditional preparation methods. The story behind this iconic Ukrainian dessert.",
  keywords:
    "honey cake history, Ukrainian honey cake history, traditional Ukrainian desserts, honey cake origins, Ukrainian cake history, honey cake traditions, Ukrainian baking heritage",
  openGraph: {
    title: "Honey Cake History | Ukrainian Honey Cake History | Traditional Ukrainian Desserts",
    description:
      "Discover the fascinating history of honey cake, Ukraine's beloved honey cake. Learn about its origins, cultural significance, and traditional preparation methods.",
    url: "https://olgishcakes.co.uk/honey-cake-history",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/honey-cake-history.jpg",
        width: 1200,
        height: 630,
        alt: "Honey Cake History - Ukrainian Honey Cake Traditions",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Honey Cake History | Ukrainian Honey Cake History | Traditional Ukrainian Desserts",
    description:
      "Discover the fascinating history of honey cake, Ukraine's beloved honey cake. Learn about its origins, cultural significance, and traditional preparation methods.",
    images: ["https://olgishcakes.co.uk/images/honey-cake-history.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/honey-cake-history",
  },
};

export default function HoneyCakeHistoryPage() {
  return (
    <>
      <Script
        id="honey-cake-history-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "History of Ukrainian Honey Cake",
            description: "Learn about the history and tradition of Ukrainian honey cake (medovik).",
            url: "https://olgishcakes.co.uk/honey-cake-history",
          }),
        }}
      />

      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "primary.main",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              The History of Honey Cake
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Discover the fascinating story behind honey cake, Ukraine's beloved honey cake. From
              ancient origins to modern celebrations, explore the cultural significance and
              traditional preparation methods of this iconic Ukrainian dessert.
            </Typography>
            <Chip
              label="Ukrainian Honey Cake Heritage"
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                fontSize: "1.1rem",
                px: 3,
                py: 1,
                mb: 4,
              }}
            />
          </Box>

          {/* Origins Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Ancient Origins
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
                  >
                    Early Beginnings
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Honey cake, meaning "honey cake" in Ukrainian, has roots that trace back to
                    ancient Slavic traditions. The use of honey as a sweetener predates the
                    widespread availability of sugar in Eastern Europe.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Early versions of honey cakes were simple flatbreads sweetened with honey, often
                    served during religious ceremonies and seasonal celebrations. These humble
                    beginnings would eventually evolve into the sophisticated layered cake we know
                    today.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    The tradition of honey-based desserts was particularly strong in regions where
                    beekeeping was a prominent agricultural practice, making honey a valuable and
                    cherished ingredient.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
                  >
                    Medieval Development
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    During the medieval period, Ukrainian baking techniques became more
                    sophisticated. The layered structure of honey cake began to emerge, with each
                    layer individually baked and then assembled.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    This technique was not only a display of culinary skill but also served
                    practical purposes - thinner layers baked more evenly and created a more
                    delicate texture when combined with cream filling.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    The addition of spices like cinnamon, cloves, and cardamom reflected the
                    influence of trade routes that brought exotic flavors to Ukrainian kitchens.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Cultural Significance */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #FEF102 0%, #FFA000 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 4, textAlign: "center", fontWeight: 600 }}>
                Cultural Significance
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Religious Traditions
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6 }}>
                    Honey cake has long been associated with Orthodox Christian celebrations,
                    particularly during fasting periods when honey was one of the few permitted
                    sweeteners.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6 }}>
                    The cake's golden color and honey sweetness symbolized prosperity, health, and
                    the sweetness of life, making it a popular choice for religious holidays and
                    family celebrations.
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                    Many families have their own honey cake recipes passed down through generations,
                    each with slight variations that reflect regional traditions and family
                    preferences.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Family Celebrations
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6 }}>
                    In Ukrainian culture, honey cake is more than just a dessert - it's a symbol of
                    family unity and the warmth of home. The process of making honey cake often
                    involves multiple family members.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6 }}>
                    The cake is traditionally served at weddings, birthdays, and major family
                    gatherings, representing the sweetness and joy of these special occasions.
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                    The layered structure of honey cake is said to represent the layers of family
                    history and the building of strong family bonds over time.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Evolution of the Recipe */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Evolution of the Recipe
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  period: "19th Century",
                  title: "Refinement",
                  description:
                    "The layered structure became standardized, with precise techniques for creating thin, even layers and smooth cream fillings.",
                  innovations: [
                    "Layered structure perfected",
                    "Cream filling recipes",
                    "Spice combinations",
                  ],
                },
                {
                  period: "Early 20th Century",
                  title: "Modernization",
                  description:
                    "Introduction of modern baking equipment and techniques, while preserving traditional flavors and methods.",
                  innovations: ["Electric ovens", "Precise measurements", "Consistent quality"],
                },
                {
                  period: "Present Day",
                  title: "Innovation",
                  description:
                    "Contemporary variations while maintaining authenticity, including dietary adaptations and new flavor combinations.",
                  innovations: [
                    "Gluten-friendly versions",
                    "Vegan adaptations",
                    "New flavor profiles",
                  ],
                },
              ].map((era, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      component="h4"
                      sx={{ mb: 1, color: "primary.main", fontWeight: 600 }}
                    >
                      {era.period}
                    </Typography>
                    <Typography variant="h4" component="h4" sx={{ mb: 2, fontWeight: 600 }}>
                      {era.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {era.description}
                    </Typography>
                    <Typography variant="h4" component="h4" sx={{ mb: 2, fontWeight: 600 }}>
                      Key Innovations:
                    </Typography>
                    {era.innovations.map((innovation, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                        â€¢ {innovation}
                      </Typography>
                    ))}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Traditional Preparation */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ mb: 4, textAlign: "center", color: "primary.main", fontWeight: 600 }}
            >
              Traditional Preparation Methods
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
                  >
                    The Art of Layering
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Traditional honey cake preparation is a labor-intensive process that requires
                    patience and skill. Each layer is individually rolled out and baked to achieve
                    the perfect thinness and texture.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    The dough is made with honey, flour, eggs, and spices, then rolled into thin
                    circles. Each layer is baked until golden brown, then cooled before assembly.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    The cream filling, traditionally made with sour cream and honey, is spread
                    between each layer, creating the characteristic moist texture and rich flavor.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}
                  >
                    Regional Variations
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Different regions of Ukraine have developed their own variations of honey cake,
                    each with unique characteristics and flavor profiles.
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Some versions use different types of honey, while others incorporate local
                    spices or alternative cream fillings. The number of layers can also vary
                    significantly.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    These regional variations reflect the diverse agricultural practices and
                    cultural influences found throughout Ukraine's different regions.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Modern Honey Cake */}
          <Box sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #8D6E63 0%, #5D4037 100%)",
                color: "white",
              }}
            >
              <Typography variant="h4" component="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Modern Adaptations
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Global Popularity
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6 }}>
                    Today, honey cake has gained international recognition as one of Ukraine's most
                    beloved desserts. Its unique combination of honey, spices, and layered structure
                    has captured the attention of food enthusiasts worldwide.
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                    Ukrainian bakeries around the world, including our own in Leeds, continue to
                    preserve and share this traditional recipe with new audiences.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6 }}>
                    Modern bakers have adapted honey cake to meet contemporary dietary needs while
                    preserving its authentic taste and cultural significance.
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                    Gluten-friendly, vegan, and dairy-free versions ensure that everyone can enjoy
                    this traditional Ukrainian dessert, regardless of dietary restrictions.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
            >
              Experience the Tradition
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
            >
              Taste the authentic flavors of Ukrainian tradition with our handcrafted honey cake
              cakes. Made using traditional recipes and techniques, our honey cake brings the rich
              history and cultural heritage of Ukraine to your table.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                component={Link}
                href="/cakes"
                sx={{
                  backgroundColor: "primary.main",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Order Honey Cake
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/ukrainian-culture-baking"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                Learn More About Ukrainian Baking
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}

