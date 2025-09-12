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
            Discover the perfect cake by post options for surprising your loved ones anywhere in the UK. 
            From traditional recipes to modern delivery innovations.
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
            Sending cake by post has become increasingly popular in the UK, offering a convenient and 
            delightful way to surprise friends and family. Whether you're celebrating a birthday, 
            anniversary, or just want to show someone you care, cake delivery by post brings joy 
            directly to their door.
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
            Top Cake by Post Options in the UK
          </Typography>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    Traditional Ukrainian Honey Cake
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                    Our signature honey cake (honey cake) is perfect for postal delivery. This traditional 
                    Ukrainian delicacy features layers of honey-infused sponge with creamy filling, 
                    vacuum-packed to maintain freshness during transit.
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Letterbox-friendly packaging"
                        secondary="Fits through standard UK letterboxes"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="7-day freshness guarantee"
                        secondary="Vacuum-packed for optimal preservation"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Free UK delivery"
                        secondary="Delivered within 2-3 working days"
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
                    Perfect for birthdays, anniversaries, and special occasions. Our celebration cakes 
                    are designed specifically for postal delivery, ensuring they arrive in perfect 
                    condition to make someone's day extra special.
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Personalized messaging"
                        secondary="Include a custom message with your cake"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Gift wrapping available"
                        secondary="Beautiful presentation for special occasions"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Multiple size options"
                        secondary="Choose from individual portions to sharing sizes"
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
            What Makes a Great Cake by Post?
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            Not all cakes are suitable for postal delivery. The best cakes by post share several key characteristics:
          </Typography>

          <List sx={{ mb: 4 }}>
            <ListItem>
              <ListItemText 
                primary="Durability"
                secondary="Cakes that can withstand shipping without losing their shape or taste"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Freshness preservation"
                secondary="Packaging and ingredients that maintain quality during transit"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Letterbox compatibility"
                secondary="Packages that fit through standard UK letterboxes for convenience"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Consistent quality"
                secondary="Reliable taste and texture that customers can depend on"
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
            To ensure the best experience when ordering cake by post, consider these helpful tips:
          </Typography>

          <List sx={{ mb: 4 }}>
            <ListItem>
              <ListItemText 
                primary="Plan ahead"
                secondary="Order a few days in advance to allow for baking and shipping time"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Check delivery areas"
                secondary="Confirm that your recipient's address is within the delivery area"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Consider the recipient"
                secondary="Think about their preferences, dietary restrictions, and the occasion"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Add a personal touch"
                secondary="Include a personalized message to make the gift even more special"
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
            Cake by post offers a unique way to surprise someone special. Whether you're celebrating 
            a milestone, showing appreciation, or simply brightening someone's day, a delicious cake 
            delivered to their door is a gesture that's sure to be remembered.
          </Typography>

          <Typography variant="body1" sx={{ mb: 6, lineHeight: 1.7 }}>
            At Olgish Cakes, we specialize in traditional Ukrainian honey cake that's perfect for 
            postal delivery. Our letterbox-friendly packaging and vacuum-sealed freshness ensure 
            that your surprise arrives in perfect condition, ready to delight the recipient.
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
              Discover our traditional Ukrainian honey cake by post service. Perfect for surprising 
              loved ones anywhere in the UK with our delicious, letterbox-friendly delivery.
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
