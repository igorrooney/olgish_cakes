import { Metadata } from "next";
import { Container, Typography, Box, Card, CardContent, Grid, List, ListItem, ListItemText, ListItemIcon } from "@/lib/mui-optimization";
import { designTokens } from "@/lib/design-system";
import Link from "next/link";
import { Button } from "@/lib/mui-optimization";

const { colors, typography, spacing } = designTokens;

export const metadata: Metadata = {
  title: "Top 5 Reasons to Order Letterbox Cakes Online | Olgish Cakes",
  description: "Discover the top 5 reasons why ordering letterbox cakes online is the perfect solution for surprising loved ones. Convenience, freshness, and UK-wide delivery included.",
  keywords: "letterbox cakes online, order cakes online UK, cake delivery by post, letterbox friendly cakes, online cake ordering, UK cake delivery, surprise cake delivery",
  openGraph: {
    title: "Top 5 Reasons to Order Letterbox Cakes Online | Olgish Cakes",
    description: "Discover the top 5 reasons why ordering letterbox cakes online is the perfect solution for surprising loved ones.",
    url: "https://olgishcakes.co.uk/blog/top-5-reasons-order-letterbox-cakes-online",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/letterbox-cakes-online-blog.jpg",
        width: 1200,
        height: 630,
        alt: "Top 5 reasons to order letterbox cakes online - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top 5 Reasons to Order Letterbox Cakes Online | Olgish Cakes",
    description: "Discover the top 5 reasons why ordering letterbox cakes online is the perfect solution for surprising loved ones.",
    images: ["https://olgishcakes.co.uk/images/letterbox-cakes-online-blog.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/blog/top-5-reasons-order-letterbox-cakes-online",
  },
};

export default function Top5ReasonsLetterboxCakesPage() {
  const reasons = [
    {
      number: "1",
      title: "Ultimate Convenience",
      description: "Order from anywhere, anytime",
      details: "Ordering letterbox cakes online means you can surprise someone special without leaving your home. Whether you're at work, traveling, or simply don't have time to visit a bakery, online ordering puts the power of cake delivery at your fingertips.",
      icon: "🏠"
    },
    {
      number: "2", 
      title: "Letterbox-Friendly Delivery",
      description: "No need to be home for delivery",
      details: "Traditional cake delivery requires someone to be home to receive the package. With letterbox cakes, your surprise arrives directly through the recipient's letterbox, ensuring they don't miss their delicious delivery even if they're out.",
      icon: "📮"
    },
    {
      number: "3",
      title: "Freshness Guaranteed",
      description: "Vacuum-packed for maximum freshness",
      details: "Our letterbox cakes are specially packaged using vacuum-sealing technology to maintain freshness during transit. Each cake slice is individually wrapped to ensure it arrives in perfect condition, ready to enjoy.",
      icon: "🥧"
    },
    {
      number: "4",
      title: "UK-Wide Coverage",
      description: "Deliver to any UK address",
      details: "Unlike local bakeries limited by geography, online letterbox cake services can deliver to any UK mainland address. This makes it perfect for surprising friends and family across the country, no matter how far away they are.",
      icon: "🇬🇧"
    },
    {
      number: "5",
      title: "Perfect for Surprises",
      description: "Create memorable moments",
      details: "The element of surprise is what makes letterbox cakes so special. Imagine the joy on someone's face when they discover a delicious cake in their letterbox. It's an unexpected treat that creates lasting memories.",
      icon: "🎉"
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Top 5 Reasons to Order Letterbox Cakes Online",
            description: "Discover the top 5 reasons why ordering letterbox cakes online is the perfect solution for surprising loved ones.",
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
            datePublished: "2024-01-20",
            dateModified: "2024-01-20",
            mainEntityOfPage: "https://olgishcakes.co.uk/blog/top-5-reasons-order-letterbox-cakes-online",
            image: "https://olgishcakes.co.uk/images/letterbox-cakes-online-blog.jpg",
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://olgishcakes.co.uk" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://olgishcakes.co.uk/blog" },
                { "@type": "ListItem", position: 3, name: "Top 5 Reasons to Order Letterbox Cakes Online", item: "https://olgishcakes.co.uk/blog/top-5-reasons-order-letterbox-cakes-online" },
              ],
            },
          }),
        }}
      />

      <Container maxWidth="lg" sx={{ py: 8, px: 4 }}>
        {/* Breadcrumbs */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
            {" > "}
            <Link href="/blog" style={{ textDecoration: "none", color: "inherit" }}>Blog</Link>
            {" > "}
            Top 5 Reasons to Order Letterbox Cakes Online
          </Typography>
        </Box>

        {/* Article Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{
              mb: 3,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              lineHeight: 1.2,
            }}
          >
            Top 5 Reasons to Order Letterbox Cakes Online
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: colors.text.secondary,
              maxWidth: "800px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Discover why ordering letterbox cakes online is revolutionizing how we surprise our loved ones. 
            From convenience to freshness, here's why this delivery method is becoming so popular.
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Published: 20th January 2024 | Reading time: 6 minutes
          </Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ maxWidth: "800px", mx: "auto" }}>
          <Typography
            component="h2"
            variant="h4"
            sx={{
              mb: 3,
              mt: 6,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}
          >
            The Rise of Letterbox Cake Delivery
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            In recent years, letterbox cakes have transformed the way we think about cake delivery. 
            This innovative approach combines the convenience of online shopping with the joy of 
            receiving a surprise treat. But what makes ordering letterbox cakes online so appealing? 
            Let's explore the top 5 reasons that are driving this trend.
          </Typography>

          {/* Top 5 Reasons */}
          <Box sx={{ mb: 6 }}>
            {reasons.map((reason, index) => (
              <Card key={index} sx={{ mb: 4, p: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: "50%", 
                      backgroundColor: colors.primary.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 3,
                      color: "white",
                      fontSize: "1.5rem",
                      fontWeight: typography.fontWeight.bold,
                      flexShrink: 0,
                    }}>
                      {reason.number}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        component="h3"
                        variant="h5"
                        sx={{
                          mb: 1,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                        }}
                      >
                        {reason.icon} {reason.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          color: colors.primary.main,
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        {reason.description}
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                        {reason.details}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Typography
            component="h2"
            variant="h4"
            sx={{
              mb: 3,
              mt: 6,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}
          >
            How Letterbox Cakes Work
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            Understanding how letterbox cakes work helps explain why they're so effective. The process 
            is designed to be simple for both the sender and recipient:
          </Typography>

          <List sx={{ mb: 4 }}>
            <ListItem>
              <ListItemText 
                primary="Order Online"
                secondary="Browse our selection of letterbox-friendly cakes and place your order with the recipient's address"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Fresh Baking"
                secondary="We bake your cake fresh and prepare it specifically for postal delivery"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Special Packaging"
                secondary="Each cake is vacuum-packed and placed in letterbox-compatible packaging"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Secure Delivery"
                secondary="Your cake is shipped via Royal Mail and delivered directly to the recipient's letterbox"
              />
            </ListItem>
          </List>

          <Typography
            component="h2"
            variant="h4"
            sx={{
              mb: 3,
              mt: 6,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}
          >
            Perfect for Every Occasion
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            Letterbox cakes are perfect for a wide variety of occasions and situations:
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Birthdays"
                    secondary="Surprise someone on their special day"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Anniversaries"
                    secondary="Celebrate milestones with a sweet treat"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Just Because"
                    secondary="Brighten someone's day unexpectedly"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Thank You Gifts"
                    secondary="Show appreciation with a thoughtful gesture"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Long Distance"
                    secondary="Connect with loved ones across the country"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Work Surprises"
                    secondary="Delight colleagues with an unexpected treat"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          <Typography
            component="h2"
            variant="h4"
            sx={{
              mb: 3,
              mt: 6,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}
          >
            Why Choose Olgish Cakes for Letterbox Delivery?
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7 }}>
            At Olgish Cakes, we've perfected the art of letterbox cake delivery. Our traditional 
            Ukrainian honey cake is specially designed for postal delivery, featuring:
          </Typography>

          <List sx={{ mb: 6 }}>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: "1.5rem" }}>🍯</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="Traditional Ukrainian Honey Cake"
                secondary="Authentic recipe with honey-infused layers and creamy filling"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: "1.5rem" }}>📦</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="Letterbox-Compatible Packaging"
                secondary="Designed to fit through standard UK letterboxes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: "1.5rem" }}>🚚</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="Free UK Delivery"
                secondary="No delivery charges on any order"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: "1.5rem" }}>⭐</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="7-Day Freshness Guarantee"
                secondary="Vacuum-packed to maintain quality during transit"
              />
            </ListItem>
          </List>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center", py: 6, backgroundColor: colors.background.subtle, borderRadius: 3, px: 4 }}>
            <Typography
              component="h3"
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}
            >
              Ready to Experience Letterbox Cake Delivery?
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7, maxWidth: "600px", mx: "auto" }}>
              Join thousands of satisfied customers who have discovered the joy of letterbox cake delivery. 
              Surprise someone special today with our traditional Ukrainian honey cake.
            </Typography>
            
            <Button
              component={Link}
              href="/cake-by-post-service"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: colors.primary.main,
                color: colors.primary.contrast,
                px: 4,
                py: 2,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: colors.primary.dark,
                },
              }}
            >
              Learn About Cake by Post Service
            </Button>
          </Box>
        </Box>
      </Container>
    </main>
  );
}
