import { Metadata } from "next";
import { Container, Typography, Box, Card, CardContent, Grid, List, ListItem, ListItemText } from "@/lib/mui-optimization";
import { designTokens } from "@/lib/design-system";
import Link from "next/link";
import { Button } from "@/lib/mui-optimization";

const { colors, typography, spacing } = designTokens;

export const metadata: Metadata = {
  title: "Best Cakes You Can Send by Post in the UK | Olgish Cakes",
  description: "Discover the best cakes you can send by post in the UK. From traditional Ukrainian honey cake to letterbox-friendly delivery options. Perfect for surprising loved ones anywhere in the country.",
  keywords: "best cakes by post UK, cakes delivered by post, letterbox cakes UK, postal cake delivery, cake by post service, UK cake delivery, honey cake by post, surprise cake delivery",
  openGraph: {
    title: "Best Cakes You Can Send by Post in the UK | Olgish Cakes",
    description: "Discover the best cakes you can send by post in the UK. From traditional Ukrainian honey cake to letterbox-friendly delivery options.",
    url: "https://olgishcakes.co.uk/blog/best-cakes-you-can-send-by-post-uk",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cake-by-post-uk-blog.jpg",
        width: 1200,
        height: 630,
        alt: "Best cakes you can send by post in the UK - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cakes You Can Send by Post in the UK | Olgish Cakes",
    description: "Discover the best cakes you can send by post in the UK. From traditional Ukrainian honey cake to letterbox-friendly delivery options.",
    images: ["https://olgishcakes.co.uk/images/cake-by-post-uk-blog.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/blog/best-cakes-you-can-send-by-post-uk",
  },
};

export default function BestCakesByPostPage() {
  return (
    <main className="min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Best Cakes You Can Send by Post in the UK",
            description: "Discover the best cakes you can send by post in the UK. From traditional Ukrainian honey cake to letterbox-friendly delivery options.",
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
            datePublished: "2024-01-15",
            dateModified: "2024-01-15",
            mainEntityOfPage: "https://olgishcakes.co.uk/blog/best-cakes-you-can-send-by-post-uk",
            image: "https://olgishcakes.co.uk/images/cake-by-post-uk-blog.jpg",
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://olgishcakes.co.uk" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://olgishcakes.co.uk/blog" },
                { "@type": "ListItem", position: 3, name: "Best Cakes You Can Send by Post in the UK", item: "https://olgishcakes.co.uk/blog/best-cakes-you-can-send-by-post-uk" },
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
            Best Cakes You Can Send by Post in the UK
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
            Best Cakes You Can Send by Post in the UK
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
            Find the best cake by post options for surprising your family and friends anywhere in UK. 
            From old recipes to new ways of sending cakes.
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Published: 15th January 2024 | Reading time: 8 minutes
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
            Why Choose Cake by Post?
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            Sending cake by post is getting more popular in UK, it's easy and nice way to surprise 
            friends and family. Whether you celebrate birthday, anniversary, or just want to show 
            someone you care, cake delivery by post brings happiness right to their door.
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
            Best Cake by Post Options in UK
          </Typography>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    Ukrainian Honey Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                    My special honey cake (honey cake) is perfect for sending by post. This old 
                    Ukrainian treat has layers of honey sponge with creamy filling, 
                    packed in special way to stay fresh during delivery.
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Fits through letterbox"
                        secondary="Goes through normal UK letterboxes"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="7-day freshness promise"
                        secondary="Packed special way to keep fresh"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Free UK delivery"
                        secondary="Comes in 2-3 working days"
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
                    Celebration Cakes by Post
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                    Good for birthdays, anniversaries, and special days. My celebration cakes 
                    are made special for sending by post, so they come in good 
                    condition to make someone's day better.
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Personal message"
                        secondary="I can put special message with your cake"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Gift wrapping available"
                        secondary="Nice presentation for special days"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Different sizes"
                        secondary="Choose from small portions to big sharing sizes"
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
            What Makes Good Cake by Post?
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            Not all cakes are good for sending by post. The best cakes by post have these important things:
          </Typography>

          <List sx={{ mb: 4 }}>
            <ListItem>
              <ListItemText 
                primary="Strong"
                secondary="Cakes that can handle shipping without losing shape or taste"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Stays fresh"
                secondary="Packaging and ingredients that keep quality during delivery"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Fits letterbox"
                secondary="Packages that go through normal UK letterboxes for easy delivery"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Always good"
                secondary="Reliable taste and texture that people can trust"
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
            Tips for Ordering Cake by Post
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            To get best experience when ordering cake by post, think about these helpful tips:
          </Typography>

          <List sx={{ mb: 4 }}>
            <ListItem>
              <ListItemText 
                primary="Plan early"
                secondary="Order few days before to give time for baking and shipping"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Check delivery areas"
                secondary="Make sure the address is in delivery area"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Think about who gets it"
                secondary="Think about what they like, food allergies, and the occasion"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Add personal touch"
                secondary="Include special message to make the gift even better"
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
            The Perfect Surprise Delivery
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7 }}>
            Cake by post is special way to surprise someone you care about. Whether you celebrate 
            something important, show you appreciate them, or just make their day better, a good cake 
            delivered to their door is something they will remember.
          </Typography>

          <Typography variant="body1" sx={{ mb: 6, lineHeight: 1.7 }}>
            At Olgish Cakes, I specialize in old Ukrainian honey cake that's perfect for 
            sending by post. My letterbox-friendly packaging and special freshness packing make sure 
            that your surprise comes in good condition, ready to make the person happy.
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
              Ready to Send Cake by Post?
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7, maxWidth: "600px", mx: "auto" }}>
              Try my old Ukrainian honey cake by post service. Perfect for surprising 
              family and friends anywhere in UK with my good, letterbox-friendly delivery.
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
