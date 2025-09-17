"use client";

import { Box, Typography, Container, Grid, Card, CardContent, List, ListItem, ListItemText } from "@/lib/mui-optimization";
import { designTokens } from "@/lib/design-system";
import Link from "next/link";
import { Button } from "@/lib/mui-optimization";

const { colors, typography, spacing } = designTokens;

interface CakeByPostContentProps {
  hamper: any;
}

export function CakeByPostContent({ hamper }: CakeByPostContentProps) {
  return (
    <>
      {/* Enhanced Hero Section with SEO-optimized H1 */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 10 },
          px: { xs: 4, md: 8 },
          backgroundColor: colors.background.subtle,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h1"
            variant="h2"
            sx={{
              mb: spacing.lg,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              lineHeight: 1.2,
            }}
          >
            Cake by Post UK | Letterbox Cake Delivery | Order Online
          </Typography>
          
          <Typography
            component="p"
            variant="h5"
            sx={{
              mb: spacing.lg,
              color: colors.text.secondary,
              maxWidth: "800px",
              mx: "auto",
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              lineHeight: 1.6,
            }}
          >
            Send delicious cake by post anywhere in the UK! Our traditional Ukrainian honey cake is specially designed for letterbox delivery. 
            Freshly baked, vacuum-packed, and delivered straight to their door - perfect for birthdays, anniversaries, and surprises.
          </Typography>
          
          <Typography
            component="p"
            variant="body1"
            sx={{
              mb: spacing["2xl"],
              color: colors.text.secondary,
              maxWidth: "800px",
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.6,
            }}
          >
            Learn more about our <Link href="/blog/cake-by-post-uk-complete-guide" style={{ color: colors.primary.main, textDecoration: 'none', fontWeight: 600 }}>complete guide to cake by post delivery</Link> or discover the <Link href="/blog/best-cakes-you-can-send-by-post-uk" style={{ color: colors.primary.main, textDecoration: 'none', fontWeight: 600 }}>best honey cake for postal delivery</Link>.
          </Typography>
        </Container>
      </Box>

      {/* Why Choose Cake by Post Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            sx={{
              mb: spacing["2xl"],
              textAlign: "center",
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            Why Choose Cake by Post from OlgishCakes?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    🚚 Letterbox-Friendly Delivery
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Our cakes by post are specially designed to fit through standard UK letterboxes. 
                    No need to be home for delivery – your surprise cake will arrive safely and securely.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    📦 Vacuum-Packed Freshness
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Each cake slice is individually vacuum-packed to maintain maximum freshness during transit. 
                    Your cake by post stays delicious for up to 7 days when stored properly.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    🇬🇧 UK-Wide Delivery
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    We deliver our cake by post service to all UK mainland addresses with free standard delivery. 
                    Perfect for surprising friends and family across the country.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    🍯 Traditional Ukrainian Honey Cake
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Experience the authentic taste of traditional Ukrainian honey cake (honey cake), 
                    handcrafted in Leeds using time-honored recipes and premium ingredients. 
                    Learn more about our <Link href="/honey-cake-history" style={{ color: colors.primary.main, textDecoration: "none" }}>honey cake history</Link> and 
                    <Link href="/traditional-ukrainian-cakes" style={{ color: colors.primary.main, textDecoration: "none" }}>traditional Ukrainian baking traditions</Link>.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Perfect for Occasions Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 4, md: 8 },
          backgroundColor: colors.background.subtle,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            sx={{
              mb: spacing["2xl"],
              textAlign: "center",
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            Perfect for Birthdays, Anniversaries & Surprises
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                  🎂 Birthday Surprises
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  Send a birthday cake by post to make someone's special day even more memorable. 
                  Our honey cake is perfect for celebrating birthdays with a unique Ukrainian twist.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                  💕 Anniversary Gifts
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  Celebrate anniversaries with our romantic cake by post service. 
                  A thoughtful way to show your love with a delicious surprise delivered to their door.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", p: 3 }}>
                <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                  🎁 Just Because
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  Sometimes the best surprises are unexpected. Send cake by post just to brighten 
                  someone's day or show them you're thinking of them.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            sx={{
              mb: spacing.lg,
              textAlign: "center",
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            How Our Cake by Post Service Works
          </Typography>
          
          <Typography
            component="p"
            variant="body1"
            sx={{
              mb: spacing["2xl"],
              textAlign: "center",
              color: colors.text.secondary,
              maxWidth: "800px",
              mx: "auto",
              fontSize: "1.1rem",
              lineHeight: 1.6,
            }}
          >
            Our simple 4-step process makes ordering cake by post easy. For detailed information, check out our <Link href="/blog/top-5-reasons-order-letterbox-cakes-online" style={{ color: colors.primary.main, textDecoration: 'none', fontWeight: 600 }}>top 5 reasons to order honey cake by post online</Link>.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: "50%", 
                  backgroundColor: colors.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: typography.fontWeight.bold,
                }}>
                  1
                </Box>
                <Typography component="h3" variant="h6" sx={{ mb: 1, fontWeight: typography.fontWeight.semibold }}>
                  Order Online
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  Choose your cake by post option and add to cart. Include the recipient's address and any special delivery instructions.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: "50%", 
                  backgroundColor: colors.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: typography.fontWeight.bold,
                }}>
                  2
                </Box>
                <Typography component="h3" variant="h6" sx={{ mb: 1, fontWeight: typography.fontWeight.semibold }}>
                  Fresh Baking
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  We bake your traditional Ukrainian honey cake fresh and cut it into letterbox-friendly slices.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: "50%", 
                  backgroundColor: colors.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: typography.fontWeight.bold,
                }}>
                  3
                </Box>
                <Typography component="h3" variant="h6" sx={{ mb: 1, fontWeight: typography.fontWeight.semibold }}>
                  Secure Packing
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  Each slice is vacuum-packed and placed in our specially designed letterbox-friendly packaging.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: "50%", 
                  backgroundColor: colors.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: typography.fontWeight.bold,
                }}>
                  4
                </Box>
                <Typography component="h3" variant="h6" sx={{ mb: 1, fontWeight: typography.fontWeight.semibold }}>
                  Delivery
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  We ship within 2-3 working days with free UK delivery. Your surprise cake arrives fresh and ready to enjoy.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Delivery Details Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 4, md: 8 },
          backgroundColor: colors.background.subtle,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            sx={{
              mb: spacing["2xl"],
              textAlign: "center",
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            Letterbox Cake Delivery UK – Easy & Reliable
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 3, fontWeight: typography.fontWeight.semibold }}>
                    📮 Delivery Information
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Free UK Delivery" 
                        secondary="Standard delivery included on all cake by post orders"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="2-3 Working Days" 
                        secondary="We aim to ship and deliver your cake within 2-3 working days"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Letterbox Friendly" 
                        secondary="Packages designed to fit through standard UK letterboxes"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Tracking Available" 
                        secondary="Receive tracking information for your cake delivery"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 3, fontWeight: typography.fontWeight.semibold }}>
                    🍰 Cake Details
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Traditional Ukrainian Honey Cake" 
                        secondary="Authentic honey cake recipe passed down through generations"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="2 Delicious Slices" 
                        secondary="Perfect portion size for sharing or personal indulgence"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Vacuum Packed" 
                        secondary="Individually sealed to maintain freshness during transit"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="7-Day Freshness" 
                        secondary="Stays fresh for up to 7 days when stored properly"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 4, md: 8 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h2"
            variant="h3"
            sx={{
              mb: spacing.lg,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            Ready to Send Cake by Post?
          </Typography>
          
          <Typography
            component="p"
            variant="h6"
            sx={{
              mb: spacing["2xl"],
              color: colors.text.secondary,
              lineHeight: 1.7,
            }}
          >
            Surprise someone special with our traditional Ukrainian honey cake delivered straight to their door. 
            Order now and bring joy to their day with our delicious cake by post service.
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/gift-hampers/cake-by-post"
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
              Buy Cake by Post Now
            </Button>
            
            <Button
              component={Link}
              href="/contact"
              variant="outlined"
              size="large"
              sx={{
                borderColor: colors.primary.main,
                color: colors.primary.main,
                px: 4,
                py: 2,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: colors.primary.main,
                  color: colors.primary.contrast,
                },
              }}
            >
              Contact Us
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Related Articles Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 4, md: 8 },
          backgroundColor: colors.background.subtle,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            sx={{
              mb: spacing["2xl"],
              textAlign: "center",
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            Learn More About Cake by Post
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    Best Cakes by Post UK
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    Discover the best cakes you can send by post in the UK, from traditional recipes to modern delivery innovations.
                  </Typography>
                  <Button
                    component={Link}
                    href="/blog/best-cakes-you-can-send-by-post-uk"
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: colors.primary.main,
                      color: colors.primary.main,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: colors.primary.main,
                        color: colors.primary.contrast,
                      },
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    Top 5 Reasons for Letterbox Cakes
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    Learn why ordering letterbox cakes online is becoming the preferred way to surprise loved ones.
                  </Typography>
                  <Button
                    component={Link}
                    href="/blog/top-5-reasons-order-letterbox-cakes-online"
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: colors.primary.main,
                      color: colors.primary.main,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: colors.primary.main,
                        color: colors.primary.contrast,
                      },
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography component="h3" variant="h5" sx={{ mb: 2, fontWeight: typography.fontWeight.semibold }}>
                    How to Surprise with Cake Delivery
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    Expert tips for creating perfect surprise moments with cake delivery by post.
                  </Typography>
                  <Button
                    component={Link}
                    href="/blog/how-surprise-someone-cake-delivery-post"
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: colors.primary.main,
                      color: colors.primary.main,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: colors.primary.main,
                        color: colors.primary.contrast,
                      },
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              component={Link}
              href="/blog"
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
              View All Blog Posts
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
