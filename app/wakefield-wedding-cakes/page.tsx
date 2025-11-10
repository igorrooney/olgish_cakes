import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import CakeCard from "@/app/components/CakeCard";
import { Container, Typography, Box, Grid, Paper, List, ListItem, ListItemIcon, ListItemText, Chip } from "@mui/material";
import { Cake as CakeIcon, Favorite, LocalShipping, Star, LocationOn, Phone, CheckCircle } from "@mui/icons-material";
import { StructuredData } from "@/app/components/StructuredData";
import { Cake as CakeType } from "@/types/cake";

export const metadata: Metadata = {
  title: "Wakefield Wedding Cakes | Bespoke Designs | Free Consultation",
  description: "💒 Wakefield's Premier Wedding Cake Designer! Custom wedding cakes, bridal cakes & celebration cakes. Free consultation, same-day delivery Wakefield. 5⭐ rated Ukrainian bakery. Book now!",
  keywords: [
    "wakefield wedding cakes",
    "wedding cakes wakefield",
    "bridal cakes wakefield",
    "custom wedding cakes wakefield",
    "wedding cake designer wakefield",
    "celebration cakes wakefield",
    "ukrainian wedding cakes wakefield",
    "honey cake wedding wakefield",
    "kyiv cake wedding wakefield",
    "wedding cake delivery wakefield",
    "wakefield wedding venues",
    "wedding cake consultation wakefield",
    "bespoke wedding cakes wakefield",
    "luxury wedding cakes wakefield",
    "traditional wedding cakes wakefield"
  ].join(", "),
  openGraph: {
    title: "Wakefield Wedding Cakes | Bespoke Designs | Free Consultation",
    description: "💒 Wakefield's Premier Wedding Cake Designer! Custom wedding cakes, bridal cakes & celebration cakes. Free consultation, same-day delivery Wakefield. 5⭐ rated Ukrainian bakery. Book now!",
    url: "https://olgishcakes.co.uk/wakefield-wedding-cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/wakefield-wedding-cakes-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Wakefield Wedding Cakes - Bespoke Ukrainian Wedding Cake Designs",
      },
    ],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/wakefield-wedding-cakes",
  },
};

async function getCakes(): Promise<CakeType[]> {
  const query = `*[_type == "cake"] {
    _id,
    name,
    description,
    slug,
    category,
    _createdAt,
    size,
    pricing,
    designs,
    mainImage {
      asset->{
        _id,
        url
      }
    }
  }`;
  return client.fetch(query);
}

export default async function WakefieldWeddingCakesPage() {
  const cakes = await getCakes();
  const weddingCakes = cakes.filter(cake =>
    cake.category?.toLowerCase().includes('wedding') ||
    cake.category?.toLowerCase().includes('bridal') ||
    cake.category?.toLowerCase().includes('celebration')
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Olgish Cakes - Wakefield Wedding Cakes",
    description: "Premier wedding cake designer in Wakefield, specializing in bespoke Ukrainian wedding cakes and custom bridal designs.",
    url: "https://olgishcakes.co.uk/wakefield-wedding-cakes",
    telephone: "+44 786 721 8194",
    email: "hello@olgishcakes.co.uk",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Wakefield",
      addressRegion: "West Yorkshire",
      addressCountry: "GB",
      postalCode: "WF1"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 53.6833,
      longitude: -1.4977
    },
    openingHours: "Mo-Sa 08:00-18:00",
    priceRange: "£££",
    servesCuisine: "Ukrainian",
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: {
        "@type": "MenuSection",
        name: "Wedding Cakes",
        hasMenuItem: weddingCakes.map(cake => ({
          "@type": "MenuItem",
          name: cake.name,
          description: cake.description,
          image: cake.mainImage?.asset?.url
        }))
      }
    },
    areaServed: [
      "Wakefield",
      "Leeds",
      "Bradford",
      "Huddersfield",
      "Halifax",
      "York"
    ],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 53.6833,
        longitude: -1.4977
      },
      geoRadius: "25"
    }
  };

  const wakefieldVenues = [
    "Chateau Impney Hotel",
    "Sandal Castle",
    "Heath Old Hall",
    "The Mansion House",
    "Wakefield Cathedral",
    "Cliffe Castle Museum",
    "Royal Armouries Museum",
    "Wakefield Town Hall",
    "The Hepworth Wakefield",
    "Pontefract Castle"
  ];

  return (
    <>
      <StructuredData type="localBusiness" data={structuredData} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h1" component="h1" gutterBottom sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 700,
            color: '#2E3192',
            mb: 2
          }}>
            💒 Wakefield Wedding Cakes
          </Typography>
          <Typography variant="h2" component="h2" sx={{
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: '#666',
            mb: 4,
            fontWeight: 400
          }}>
            Bespoke Ukrainian Wedding Cake Designs for Your Special Day
          </Typography>
          <Typography variant="body1" sx={{
            fontSize: '1.2rem',
            maxWidth: '800px',
            mx: 'auto',
            mb: 4,
            lineHeight: 1.7
          }}>
            🎂 Wakefield's best wedding cake designer! I create unforgettable memories with my
            authentic Ukrainian wedding cakes. From traditional honey cakes to modern Kyiv cake designs,
            I make bespoke wedding cakes that show your unique love story. Free consultation
            and delivery throughout Wakefield and surrounding areas.
          </Typography>

          {/* Location & Contact Info */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            flexWrap: 'wrap',
            mt: 4,
            p: 3,
            backgroundColor: '#f8f9fa',
            borderRadius: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ color: '#2E3192' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Serving Wakefield & 25-mile radius
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone sx={{ color: '#2E3192' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Free Consultation: +44 786 721 8194
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star sx={{ color: '#FEF102' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                5⭐ Rated Wedding Cake Designer
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Key Features */}
        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <CakeIcon sx={{ fontSize: 48, color: '#2E3192', mb: 2 }} />
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                Bespoke Wedding Designs
              </Typography>
              <Typography variant="body1">
                Every wedding cake we make is unique and matches your theme, colors, and personal style.
                From traditional Ukrainian motifs to modern simple designs.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Favorite sx={{ fontSize: 48, color: '#FEF102', mb: 2 }} />
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                Authentic Ukrainian Recipes
              </Typography>
              <Typography variant="body1">
                Traditional honey cake (Medovik), Kyiv cake, and other authentic Ukrainian desserts.
                Made with premium ingredients and time-honored recipes.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <LocalShipping sx={{ fontSize: 48, color: '#2E3192', mb: 2 }} />
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                Wakefield Delivery & Setup
              </Typography>
              <Typography variant="body1">
                Professional delivery and setup service throughout Wakefield. We handle everything
                so you can focus on your special day.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Wedding Cake Collection */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            Our Wedding Cake Collection
          </Typography>
          <Typography variant="body1" sx={{
            textAlign: 'center',
            mb: 4,
            fontSize: '1.1rem',
            maxWidth: '800px',
            mx: 'auto'
          }}>
            From intimate ceremonies to grand celebrations, our wedding cake collection offers
            something perfect for every Wakefield couple. Each cake is crafted with love and
            attention to detail.
          </Typography>

          <Grid container spacing={3}>
            {weddingCakes.slice(0, 6).map((cake) => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <CakeCard cake={cake} variant="catalog" />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Wakefield Wedding Venues */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            Popular Wakefield Wedding Venues We Serve
          </Typography>
          <Typography variant="body1" sx={{
            textAlign: 'center',
            mb: 4,
            fontSize: '1.1rem',
            maxWidth: '800px',
            mx: 'auto'
          }}>
            We proudly deliver and set up wedding cakes at Wakefield's most beautiful venues.
            Our team knows these locations well and ensures perfect presentation every time.
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            {wakefieldVenues.map((venue) => (
              <Grid item key={venue}>
                <Chip
                  label={venue}
                  variant="outlined"
                  sx={{
                    m: 1,
                    borderColor: '#2E3192',
                    color: '#2E3192',
                    '&:hover': {
                      backgroundColor: '#2E3192',
                      color: 'white'
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Wedding Planning Guide */}
        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h3" component="h3" gutterBottom sx={{
                fontSize: '1.8rem',
                color: '#2E3192',
                fontWeight: 600,
                mb: 3
              }}>
                💒 Wedding Cake Planning Timeline
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h4" sx={{ color: '#2E3192', fontWeight: 700 }}>12+</Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Months Before"
                    secondary="Initial consultation and design concept development"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h4" sx={{ color: '#2E3192', fontWeight: 700 }}>6</Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Months Before"
                    secondary="Final design approval and tasting session"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h4" sx={{ color: '#2E3192', fontWeight: 700 }}>2</Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Weeks Before"
                    secondary="Final details confirmation and delivery planning"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h4" sx={{ color: '#2E3192', fontWeight: 700 }}>1</Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Day Before"
                    secondary="Fresh baking and final preparations"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h3" component="h3" gutterBottom sx={{
                fontSize: '1.8rem',
                color: '#2E3192',
                fontWeight: 600,
                mb: 3
              }}>
                🎨 Customization Options
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Personalized cake toppers and decorations" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Wedding color scheme matching" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Multiple flavor combinations" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Dietary requirement accommodations" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Professional photography styling" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Why Choose Us */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            Why Choose Olgish Cakes for Your Wakefield Wedding?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 48, color: '#2E3192', mb: 2 }} />
                <Typography variant="h4" component="h4" sx={{ fontWeight: 600, color: '#2E3192', mb: 2 }}>
                  Authentic Ukrainian Heritage
                </Typography>
                <Typography variant="body1">
                  Experience the rich flavors and traditional techniques of Ukrainian baking,
                  bringing cultural authenticity to your special day.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Star sx={{ fontSize: 48, color: '#FEF102', mb: 2 }} />
                <Typography variant="h4" component="h4" sx={{ fontWeight: 600, color: '#2E3192', mb: 2 }}>
                  Bespoke Design Service
                </Typography>
                <Typography variant="body1">
                  Every wedding cake is uniquely crafted to reflect your personal style,
                  wedding theme, and cultural preferences.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <LocalShipping sx={{ fontSize: 48, color: '#A0522D', mb: 2 }} />
                <Typography variant="h4" component="h4" sx={{ fontWeight: 600, color: '#2E3192', mb: 2 }}>
                  Professional Service
                </Typography>
                <Typography variant="body1">
                  From initial consultation to wedding day delivery and setup,
                  we handle every detail with care and professionalism.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* FAQ Section */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            Wedding Cake FAQ
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  How far in advance should I book my wedding cake?
                </Typography>
                <Typography variant="body1">
                  We recommend booking 6-12 months in advance, especially for peak wedding season
                  (May-September). This ensures we can accommodate your date and create your perfect design.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  Do you offer cake tastings?
                </Typography>
                <Typography variant="body1">
                  Yes! We include a complimentary tasting session as part of our consultation.
                  You'll sample our most popular Ukrainian cake flavors and discuss your preferences.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  Can you accommodate dietary restrictions?
                </Typography>
                <Typography variant="body1">
                  Absolutely! I specialize in gluten-friendly, dairy-free, and vegan wedding cakes.
                  All dietary requirements can be accommodated without compromising on taste or design.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  What's included in your wedding cake service?
                </Typography>
                <Typography variant="body1">
                  Our service includes consultation, design, baking, decoration, delivery, and setup
                  at your Wakefield venue. We also provide cake stands and serving utensils if needed.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  Do you deliver to venues outside Wakefield?
                </Typography>
                <Typography variant="body1">
                  Yes! We deliver throughout West Yorkshire including Leeds, Bradford, Huddersfield,
                  Halifax, and York. Delivery charges may apply for venues outside our standard area.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  What makes Ukrainian wedding cakes special?
                </Typography>
                <Typography variant="body1">
                  Ukrainian wedding cakes feature traditional honey cake layers, authentic recipes
                  passed down through generations, and cultural significance that adds meaning to your celebration.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box textAlign="center" sx={{
          background: 'linear-gradient(135deg, #2E3192 0%, #FEF102 100%)',
          borderRadius: 3,
          p: 6,
          color: 'white'
        }}>
          <Typography variant="h2" component="h2" gutterBottom sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 700,
            mb: 3
          }}>
            💒 Ready to Create Your Dream Wedding Cake?
          </Typography>
          <Typography variant="body1" sx={{
            fontSize: '1.2rem',
            mb: 4,
            maxWidth: '600px',
            mx: 'auto'
          }}>
            Book your free consultation today and let us create a wedding cake that perfectly
            represents your love story. Serving Wakefield's most beautiful weddings since 2024.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Box
              component="a"
              href="/contact"
              sx={{
                display: 'inline-block',
                backgroundColor: 'white',
                color: '#2E3192',
                px: 4,
                py: 2,
                borderRadius: 2,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              Book Free Consultation
            </Box>
            <Box
              component="a"
              href="/wedding-cakes"
              sx={{
                display: 'inline-block',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                px: 4,
                py: 2,
                borderRadius: 2,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: 'white',
                  color: '#2E3192',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              View Wedding Gallery
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
