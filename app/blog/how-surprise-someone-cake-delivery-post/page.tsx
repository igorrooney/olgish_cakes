import { Metadata } from "next";
import { Container, Typography, Box, Card, CardContent, Grid, List, ListItem, ListItemText, ListItemIcon } from "@/lib/mui-optimization";
import { designTokens } from "@/lib/design-system";
import Link from "next/link";
import { Button } from "@/lib/mui-optimization";

const { colors, typography, spacing } = designTokens;

export const metadata: Metadata = {
  title: "How to Surprise Someone with Cake Delivery by Post | Olgish Cakes",
  description: "Learn how to surprise someone with cake delivery by post. Tips for perfect timing, choosing the right cake, and creating memorable moments with postal cake delivery.",
  keywords: "surprise cake delivery, cake delivery by post, surprise someone with cake, postal cake delivery, cake surprise ideas, birthday cake surprise, anniversary cake delivery",
  openGraph: {
    title: "How to Surprise Someone with Cake Delivery by Post | Olgish Cakes",
    description: "Learn how to surprise someone with cake delivery by post. Tips for perfect timing, choosing the right cake, and creating memorable moments.",
    url: "https://olgishcakes.co.uk/blog/how-surprise-someone-cake-delivery-post",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/surprise-cake-delivery-blog.jpg",
        width: 1200,
        height: 630,
        alt: "How to surprise someone with cake delivery by post - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Surprise Someone with Cake Delivery by Post | Olgish Cakes",
    description: "Learn how to surprise someone with cake delivery by post. Tips for perfect timing, choosing the right cake, and creating memorable moments.",
    images: ["https://olgishcakes.co.uk/images/surprise-cake-delivery-blog.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/blog/how-surprise-someone-cake-delivery-post",
  },
};

export default function HowToSurpriseWithCakeDeliveryPage() {
  const surpriseTips = [
    {
      title: "Perfect Timing",
      description: "Coordinate delivery for maximum impact",
      icon: "⏰",
      details: "Plan your cake delivery to arrive at the perfect moment. Consider sending it a day early for birthdays so it arrives on the actual day, or coordinate with special events for maximum surprise effect."
    },
    {
      title: "Choose the Right Occasion",
      description: "Match the cake to the moment",
      icon: "🎉",
      details: "Different occasions call for different approaches. Birthdays deserve celebratory cakes, while 'just because' surprises can be more personal and thoughtful."
    },
    {
      title: "Add a Personal Message",
      description: "Make it meaningful with words",
      icon: "💝",
      details: "Include a heartfelt message with your cake delivery. A personal note transforms a simple cake into a meaningful gesture that shows you care."
    },
    {
      title: "Consider Their Preferences",
      description: "Think about what they'd love",
      icon: "🎯",
      details: "Choose a cake that matches their taste preferences. Consider dietary restrictions, favorite flavors, and any special memories associated with certain types of cake."
    },
    {
      title: "Keep It a Secret",
      description: "Maintain the element of surprise",
      icon: "🤫",
      details: "The best surprises are unexpected. Avoid giving hints and let the cake delivery be a complete surprise that catches them off guard in the best way."
    },
    {
      title: "Follow Up",
      description: "Share in their joy",
      icon: "📞",
      details: "After the delivery, give them a call or send a message to share in their excitement. This extends the joy of the surprise and shows you were thinking of them."
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
            headline: "How to Surprise Someone with Cake Delivery by Post",
            description: "Learn how to surprise someone with cake delivery by post. Tips for perfect timing, choosing the right cake, and creating memorable moments.",
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
            datePublished: "2024-01-25",
            dateModified: "2024-01-25",
            mainEntityOfPage: "https://olgishcakes.co.uk/blog/how-surprise-someone-cake-delivery-post",
            image: "https://olgishcakes.co.uk/images/surprise-cake-delivery-blog.jpg",
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://olgishcakes.co.uk" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://olgishcakes.co.uk/blog" },
                { "@type": "ListItem", position: 3, name: "How to Surprise Someone with Cake Delivery by Post", item: "https://olgishcakes.co.uk/blog/how-surprise-someone-cake-delivery-post" },
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
            How to Surprise Someone with Cake Delivery by Post
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
            How to Surprise Someone with Cake Delivery by Post
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
            Discover the art of creating perfect surprise moments with cake delivery by post. 
            Learn my tips for timing, messaging, and creating unforgettable experiences.
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Published: 25th January 2024 | Reading time: 7 minutes
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
            The Magic of Cake Delivery Surprises
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            There's something magical about surprising someone with cake delivery by post. Unlike 
            traditional gifts that require the recipient to be present, cake delivery creates a 
            moment of unexpected joy that can brighten anyone's day. But creating the perfect 
            surprise requires careful planning and attention to detail.
          </Typography>

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
            6 Essential Tips for Perfect Cake Delivery Surprises
          </Typography>

          {/* Surprise Tips */}
          <Box sx={{ mb: 6 }}>
            {surpriseTips.map((tip, index) => (
              <Card key={index} sx={{ mb: 4, p: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                    <Typography sx={{ fontSize: "2rem", mr: 2 }}>{tip.icon}</Typography>
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
                        {tip.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          color: colors.primary.main,
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        {tip.description}
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                        {tip.details}
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
            Best Occasions for Cake Delivery Surprises
          </Typography>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    🎂 Special Celebrations
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Birthdays"
                        secondary="Make their day extra special with a surprise cake"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Anniversaries"
                        secondary="Celebrate milestones with a sweet gesture"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Graduations"
                        secondary="Congratulate achievements with cake delivery"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    💝 Thoughtful Gestures
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Just Because"
                        secondary="Brighten someone's day unexpectedly"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Thank You"
                        secondary="Show appreciation with a sweet surprise"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Long Distance"
                        secondary="Connect across miles with cake delivery"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
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
            Planning Your Perfect Cake Delivery Surprise
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            Successful cake delivery surprises require careful planning. Here's a step-by-step guide 
            to ensure your surprise is perfect:
          </Typography>

          <List sx={{ mb: 4 }}>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: typography.fontWeight.bold, color: colors.primary.main }}>1</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="Choose the Perfect Timing"
                secondary="Plan delivery for when it will have maximum impact - birthdays, anniversaries, or just when they need cheering up"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: typography.fontWeight.bold, color: colors.primary.main }}>2</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="Select the Right Cake"
                secondary="Consider their preferences, dietary restrictions, and the occasion when choosing your cake"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: typography.fontWeight.bold, color: colors.primary.main }}>3</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="Craft a Personal Message"
                secondary="Write a heartfelt note that makes the gift personal and meaningful"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: typography.fontWeight.bold, color: colors.primary.main }}>4</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="Double-Check the Address"
                secondary="Ensure the delivery address is correct and accessible for letterbox delivery"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: typography.fontWeight.bold, color: colors.primary.main }}>5</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="Follow Up"
                secondary="Call or message them after delivery to share in their joy and extend the surprise"
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
            Creating Memorable Moments
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7 }}>
            The best cake delivery surprises create lasting memories. When someone discovers a 
            delicious cake in their letterbox, it's not just about the treat itself - it's about 
            the thought, the surprise, and the joy of knowing someone was thinking of them. 
            These moments of unexpected happiness are what make cake delivery by post so special.
          </Typography>

          <Typography variant="body1" sx={{ mb: 6, lineHeight: 1.7 }}>
            At Olgish Cakes, I understand the power of surprise. My traditional Ukrainian honey 
            cake is perfect for creating these magical moments, with its real taste and 
            letterbox-friendly packaging making sure your surprise arrives in perfect condition.
          </Typography>

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
              Ready to Create a Surprise?
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7, maxWidth: "600px", mx: "auto" }}>
              Start planning your perfect cake delivery surprise today. My traditional Ukrainian 
              honey cake is ready to bring joy to someone special in your life.
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
