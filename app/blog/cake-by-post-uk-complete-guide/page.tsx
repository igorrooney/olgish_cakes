import { Metadata } from "next";
import { Container, Typography, Box, Grid, Card, CardContent, List, ListItem, ListItemText, Button } from "@/lib/mui-optimization";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import Link from "next/link";
import { TocLink } from "./TocLink";

export const metadata: Metadata = {
  title: "Honey Cake by Post UK: Complete Guide to Letterbox Delivery 2025",
  description: "Everything you need to know about honey cake by post in the UK. Discover why traditional Ukrainian honey cake is perfect for letterbox delivery and how to surprise loved ones.",
  keywords: [
    "honey cake by post UK",
    "honey cake letterbox delivery",
    "Ukrainian honey cake by post",
    "honey cake postal delivery UK",
    "honey cake by post",
    "letterbox friendly honey cake",
    "surprise honey cake delivery",
    "birthday honey cake by post",
    "anniversary honey cake delivery",
    "honey cake gift by post",
    "order cake online UK",
    "cake by post service",
    "honey cake by post",
    "traditional cake delivery",
    "Ukrainian cake by post"
  ],
  openGraph: {
    title: "Cake by Post UK: Complete Guide to Letterbox Cake Delivery 2025",
    description: "Everything you need to know about cake by post in the UK. Discover the best letterbox-friendly cakes, delivery options, and how to surprise loved ones with delicious postal cakes.",
    url: "https://olgishcakes.co.uk/blog/cake-by-post-uk-complete-guide",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cake-by-post-guide.jpg",
        width: 1200,
        height: 630,
        alt: "Honey Cake by Post UK Complete Guide - Traditional Ukrainian Letterbox Cake Delivery, Cake by Post Service, Letterbox Friendly Cakes",
      },
    ],
    locale: "en_GB",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake by Post UK: Complete Guide to Letterbox Cake Delivery 2025",
    description: "Everything you need to know about cake by post in the UK. Discover the best letterbox-friendly cakes, delivery options, and how to surprise loved ones.",
    images: ["https://olgishcakes.co.uk/images/cake-by-post-guide.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/blog/cake-by-post-uk-complete-guide",
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
    google: "ggHjlSwV1aM_lVT4IcRSlUIk6Vn98ZbJ_FGCepoVi64",
  },
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
  },
};

export default function CakeByPostGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Honey Cake by Post UK: Complete Guide to Letterbox Cake Delivery 2025",
    description: "Everything you need to know about honey cake by post in the UK. Discover why traditional Ukrainian honey cake is perfect for letterbox delivery and how to surprise loved ones.",
    author: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png"
    },
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png"
    },
    datePublished: "2025-01-15",
    dateModified: "2025-01-15",
    image: {
      "@type": "ImageObject",
      url: "https://olgishcakes.co.uk/images/cake-by-post-guide.jpg",
      width: 1200,
      height: 630,
      alt: "Honey Cake by Post UK Complete Guide - Traditional Ukrainian Letterbox Cake Delivery"
    },
    url: "https://olgishcakes.co.uk/blog/cake-by-post-uk-complete-guide",
    mainEntityOfPage: "https://olgishcakes.co.uk/blog/cake-by-post-uk-complete-guide",
    keywords: "honey cake by post, cake by post UK, letterbox delivery, traditional Ukrainian cake, cake by post service, letterbox friendly cake",
    articleSection: "Cake by Post Guide",
    wordCount: 2500,
    inLanguage: "en-GB"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is honey cake by post?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Honey cake by post is a traditional Ukrainian cake (Medovik) that is specially designed for postal delivery. It's vacuum-packed and sized to fit through standard UK letterboxes, making it perfect for surprising loved ones anywhere in the UK."
        }
      },
      {
        "@type": "Question",
        name: "Why is honey cake perfect for postal delivery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Honey cake is perfect for postal delivery because it has natural preservation properties from honey, a dense structure that prevents crumbling, and is specially sized to fit through letterboxes. It stays fresh for up to 7 days without refrigeration."
        }
      },
      {
        "@type": "Question",
        name: "How long does honey cake by post stay fresh?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Honey cake by post stays fresh for up to 7 days when properly stored. The honey acts as a natural preservative, and the vacuum packaging helps maintain freshness during postal delivery."
        }
      },
      {
        "@type": "Question",
        name: "Can I send honey cake by post to any UK address?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we deliver honey cake by post to any UK address. Our cakes are specially designed to fit through standard UK letterboxes, so they can be delivered even when no one is home."
        }
      },
      {
        "@type": "Question",
        name: "What occasions are perfect for honey cake by post?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Honey cake by post is perfect for birthdays, anniversaries, just because moments, holidays, and any special occasion where you want to surprise someone with a delicious traditional Ukrainian treat."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Order Honey Cake by Post",
    description: "Step-by-step guide to ordering traditional Ukrainian honey cake by post for delivery anywhere in the UK",
    image: "https://olgishcakes.co.uk/images/cake-by-post-guide.jpg",
    totalTime: "PT5M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "GBP",
      value: "25"
    },
    supply: [
      {
        "@type": "HowToSupply",
        name: "Computer or mobile device"
      },
      {
        "@type": "HowToSupply",
        name: "Recipient's UK address"
      }
    ],
    step: [
      {
        "@type": "HowToStep",
        name: "Visit our website",
        text: "Go to our cake by post service page to view available options",
        url: "https://olgishcakes.co.uk/gift-hampers/cake-by-post-service"
      },
      {
        "@type": "HowToStep",
        name: "Choose your cake",
        text: "Select the traditional Ukrainian honey cake option for postal delivery"
      },
      {
        "@type": "HowToStep",
        name: "Add to cart",
        text: "Add the honey cake to your cart and proceed to checkout"
      },
      {
        "@type": "HowToStep",
        name: "Enter delivery details",
        text: "Provide the recipient's UK address and any special delivery instructions"
      },
      {
        "@type": "HowToStep",
        name: "Complete payment",
        text: "Pay securely online and receive confirmation of your order"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      
      <Box sx={{ background: "linear-gradient(to bottom, #FFF5E6 0%, #FFFFFF 100%)", minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {/* Breadcrumbs */}
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: "Cake by Post UK Guide", href: "/blog/cake-by-post-uk-complete-guide" },
              ]}
            />
          </Box>

          {/* Article Header */}
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontWeight: 700,
                mb: 3,
                color: "primary.main",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                lineHeight: 1.2,
              }}
            >
              Honey Cake by Post UK: Complete Guide to Letterbox Delivery 2025
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                fontSize: "1.2rem",
                lineHeight: 1.6,
              }}
            >
              Everything you need to know about sending delicious traditional Ukrainian honey cake through the post in the UK. 
              From why honey cake is perfect for postal delivery to ensuring perfect delivery, this comprehensive guide covers it all.
            </Typography>
          </Box>

          {/* Table of Contents */}
          <Card sx={{ mb: 6, p: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
              Table of Contents
            </Typography>
            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary={
                    <TocLink href="#what-is-cake-by-post">
                      1. What is Cake by Post?
                    </TocLink>
                  } 
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary={
                    <TocLink href="#best-cakes-postal-delivery">
                      2. Why Honey Cake is Perfect for Postal Delivery
                    </TocLink>
                  } 
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary={
                    <TocLink href="#how-cake-by-post-works">
                      3. How Cake by Post Works
                    </TocLink>
                  } 
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary={
                    <TocLink href="#packaging-freshness">
                      4. Packaging and Freshness
                    </TocLink>
                  } 
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary={
                    <TocLink href="#delivery-times-costs">
                      5. Delivery Times and Costs
                    </TocLink>
                  } 
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary={
                    <TocLink href="#perfect-occasions">
                      6. Perfect Occasions for Cake by Post
                    </TocLink>
                  } 
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary={
                    <TocLink href="#tips-successful-delivery">
                      7. Tips for Successful Cake Delivery
                    </TocLink>
                  } 
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary={
                    <TocLink href="#frequently-asked-questions">
                      8. Frequently Asked Questions
                    </TocLink>
                  } 
                />
              </ListItem>
            </List>
          </Card>

          {/* Main Content */}
          <Grid container spacing={6}>
            <Grid item xs={12} md={8}>
              {/* Section 1 */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  id="what-is-cake-by-post"
                  variant="h2" 
                  sx={{ mb: 3, fontWeight: 600, color: "primary.main", scrollMarginTop: "100px" }}
                >
                  1. What is Cake by Post?
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                  Cake by post is a convenient way to send delicious cakes through the mail, allowing you to surprise 
                  loved ones anywhere in the UK without being physically present. This service has become increasingly 
                  popular, especially for special occasions like birthdays, anniversaries, and holidays.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                  The concept involves specially designed cakes that can fit through standard UK letterboxes, 
                  ensuring delivery even when the recipient isn't home. These cakes are typically vacuum-packed 
                  to maintain freshness during transit and can stay fresh for several days.
                </Typography>
              </Box>

              {/* Section 2 */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  id="best-cakes-postal-delivery"
                  variant="h2" 
                  sx={{ mb: 3, fontWeight: 600, color: "primary.main", scrollMarginTop: "100px" }}
                >
                  2. Why Honey Cake is Perfect for Postal Delivery
                </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Traditional Ukrainian honey cake (Medovik) is specifically designed for postal delivery.
              Unlike other cakes, honey cake has unique properties that make it the ideal choice for sending by post.
              Learn more about <Link href="/blog/best-cakes-you-can-send-by-post-uk" style={{ color: "#1976d2", textDecoration: "none", fontWeight: 600 }}>why honey cake is the best cake for postal delivery</Link>.
            </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                        🍯 Natural Preservation
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Honey acts as a natural preservative, keeping the cake fresh for up to 7 days without refrigeration. 
                        This makes it perfect for postal delivery across the UK.
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                        📦 Dense Structure
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        The layered structure of honey cake is dense and stable, preventing it from crumbling or 
                        getting damaged during postal transport. Each layer holds together perfectly.
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                        📏 Letterbox Perfect
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Our honey cakes are specially sized to fit through standard UK letterboxes (25cm x 5cm), 
                        ensuring easy delivery without requiring someone to be home.
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                        🏺 Traditional Recipe
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Made using centuries-old Ukrainian techniques with pure honey, fresh eggs, and natural ingredients. 
                        No artificial preservatives needed - just authentic, traditional baking.
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Section 3 */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  id="how-cake-by-post-works"
                  variant="h2" 
                  sx={{ mb: 3, fontWeight: 600, color: "primary.main", scrollMarginTop: "100px" }}
                >
                  3. How Cake by Post Works
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                  The cake by post process is designed to be simple and reliable:
                </Typography>
                
                <List sx={{ mb: 4 }}>
                  <ListItem>
                    <ListItemText 
                      primary="Step 1: Order Online" 
                      secondary="Choose your cake and provide the recipient's address and delivery instructions"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Step 2: Fresh Baking" 
                      secondary="We bake your cake fresh and cut it into letterbox-friendly portions"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Step 3: Secure Packaging" 
                      secondary="Each slice is vacuum-packed and placed in specially designed letterbox packaging"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Step 4: Delivery" 
                      secondary="We ship within 2-3 working days with tracking information provided"
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Section 4 */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  id="packaging-freshness"
                  variant="h2" 
                  sx={{ mb: 3, fontWeight: 600, color: "primary.main", scrollMarginTop: "100px" }}
                >
                  4. Packaging and Freshness
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                  Proper packaging is crucial for successful cake by post delivery. Our packaging process includes:
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                        🥡 Vacuum Sealing
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Each cake slice is individually vacuum-packed to maintain maximum freshness
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                        📦 Letterbox Design
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Specially designed packaging that fits through standard UK letterboxes
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                        🛡️ Protection
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Sturdy packaging protects against crushing and maintains cake integrity
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Section 5 */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  id="delivery-times-costs"
                  variant="h2" 
                  sx={{ mb: 3, fontWeight: 600, color: "primary.main", scrollMarginTop: "100px" }}
                >
                  5. Delivery Times and Costs
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                  Understanding delivery options helps you plan the perfect surprise:
                </Typography>
                
                <Card sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Standard Delivery
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Free UK Delivery" 
                        secondary="Included on all cake by post orders"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="2-3 Working Days" 
                        secondary="Typical delivery time for UK mainland"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Tracking Included" 
                        secondary="Full tracking information provided for peace of mind"
                      />
                    </ListItem>
                  </List>
                </Card>
              </Box>

              {/* Section 6 */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  id="perfect-occasions"
                  variant="h2" 
                  sx={{ mb: 3, fontWeight: 600, color: "primary.main", scrollMarginTop: "100px" }}
                >
                  6. Perfect Occasions for Cake by Post
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                  Cake by post is perfect for various occasions when you can't be there in person:
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                        🎂 Birthdays
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Surprise someone on their special day with a delicious birthday cake delivered straight to their door.
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                        💕 Anniversaries
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Celebrate anniversaries and milestones with a romantic cake delivery, even from afar.
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                        🎁 Just Because
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Sometimes the best surprises are unexpected. Brighten someone's day with a thoughtful cake delivery.
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                        🎉 Holidays
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        Send festive cheer with holiday-themed cakes for Christmas, Easter, and other celebrations.
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Section 7 */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  id="tips-successful-delivery"
                  variant="h2" 
                  sx={{ mb: 3, fontWeight: 600, color: "primary.main", scrollMarginTop: "100px" }}
                >
                  7. Tips for Successful Cake Delivery
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
                  Follow these expert tips to ensure your cake by post delivery is successful:
                </Typography>
                
                <List sx={{ mb: 4 }}>
                  <ListItem>
                    <ListItemText 
                      primary="Provide Accurate Address" 
                      secondary="Double-check the recipient's address and include any special delivery instructions"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Consider Timing" 
                      secondary="Order 3-5 days in advance to ensure delivery on the desired date"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Check Letterbox Size" 
                      secondary="Ensure the recipient has a standard-sized letterbox for delivery"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Include a Personal Note" 
                      secondary="Add a personal message to make the surprise even more special"
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Section 8 - FAQ */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  id="frequently-asked-questions"
                  variant="h2" 
                  sx={{ mb: 3, fontWeight: 600, color: "primary.main", scrollMarginTop: "100px" }}
                >
                  8. Frequently Asked Questions
                </Typography>
                
                <Card sx={{ p: 4, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    How long does cake by post stay fresh?
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Our vacuum-packed cakes stay fresh for up to 7 days when stored properly. We recommend 
                    consuming within 3-4 days for the best taste experience.
                  </Typography>
                </Card>
                
                <Card sx={{ p: 4, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    Do you deliver to all UK addresses?
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Yes, we deliver our cake by post service to all UK mainland addresses with free standard delivery. 
                    We also offer international shipping for special occasions.
                  </Typography>
                </Card>
                
                <Card sx={{ p: 4, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    What if the recipient isn't home?
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    That's the beauty of cake by post! Our packaging is designed to fit through standard letterboxes, 
                    so delivery is guaranteed even when no one is home.
                  </Typography>
                </Card>
                
                <Card sx={{ p: 4, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    Can I track my cake delivery?
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Absolutely! We provide full tracking information for all cake by post deliveries, so you can 
                    monitor your order from dispatch to delivery.
                  </Typography>
                </Card>
              </Box>

              {/* Call to Action */}
              <Box sx={{ textAlign: "center", py: 6, backgroundColor: "primary.main", borderRadius: 3, color: "white" }}>
                <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
                  Ready to Send Cake by Post?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                  Surprise someone special with our traditional Ukrainian honey cake delivered straight to their door.
                </Typography>
                <Button
                  component={Link}
                  href="/gift-hampers/cake-by-post"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: "white",
                    color: "primary.main",
                    px: 4,
                    py: 2,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "grey.100",
                    },
                  }}
                >
                  Order Cake by Post Now
                </Button>
              </Box>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: "sticky", top: 20 }}>
                <Card sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Related Articles
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      <Link href="/blog/best-cakes-you-can-send-by-post-uk" style={{ textDecoration: "none", color: "inherit" }}>
                        Best Cakes You Can Send by Post UK
                      </Link>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Discover the best cake types for postal delivery
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      <Link href="/blog/top-5-reasons-order-letterbox-cakes-online" style={{ textDecoration: "none", color: "inherit" }}>
                        Top 5 Reasons to Order Letterbox Cakes
                      </Link>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Why letterbox cakes are becoming so popular
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      <Link href="/blog/how-surprise-someone-cake-delivery-post" style={{ textDecoration: "none", color: "inherit" }}>
                        How to Surprise Someone with Cake Delivery
                      </Link>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Expert tips for perfect surprise moments
                    </Typography>
                  </Box>
                </Card>

                <Card sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Order Now
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    Ready to send a delicious surprise? Order our traditional Ukrainian honey cake by post today.
                  </Typography>
                  <Button
                    component={Link}
                    href="/gift-hampers/cake-by-post"
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: "primary.main",
                      color: "white",
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    Order Cake by Post
                  </Button>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
