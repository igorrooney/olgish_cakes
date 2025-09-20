import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import CakeCard from "@/app/components/CakeCard";
import { Container, Typography, Box, Grid, Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { LocalShipping, CheckCircle, Cake as CakeIcon, DeliveryDining } from "@mui/icons-material";
import { StructuredData } from "@/app/components/StructuredData";
import { Cake } from "@/types/cake";

export const metadata: Metadata = {
  title: "Cake by Post | Cake Slices Delivery UK",
  description: "🎂 Send delicious cake slices through the letterbox! UK's best cake by post service. Individual cake slices delivered nationwide. Honey cake, Kyiv cake slices. Order now!",
  keywords: [
    "cake by post",
    "cake slices by post",
    "individual cake slices",
    "letterbox cake slices",
    "cake slice delivery UK",
    "send cake slices by post",
    "cake slice mail order",
    "online cake slice delivery",
    "Ukrainian cake slices",
    "honey cake slices by post",
    "Kyiv cake slices",
    "birthday cake slices by post",
    "cake slice postal delivery",
    "individual portions by post"
  ].join(", "),
  openGraph: {
    title: "Cake by Post | Cake Slices Delivery UK",
    description: "🎂 Send delicious cake slices through the letterbox! UK's best cake by post service. Individual cake slices delivered nationwide. Honey cake, Kyiv cake slices. Order now!",
    url: "https://olgishcakes.co.uk/cake-postal-delivery",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cake-postal-delivery-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Cake by Post Service - Send Cake Slices Through Letterbox UK",
      },
    ],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-postal-delivery",
  },
};

async function getCakes(): Promise<Cake[]> {
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

export default async function CakePostalDeliveryPage() {
  const cakes = await getCakes();
  const postalFriendlyCakes = cakes.filter(cake => 
    cake.category?.toLowerCase().includes('postal') || 
    cake.category?.toLowerCase().includes('letterbox') ||
    cake.name.toLowerCase().includes('mini') ||
    cake.name.toLowerCase().includes('individual')
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Cake by Post Service",
    description: "Professional cake slice delivery service across the UK. Send delicious Ukrainian cake slices through the letterbox nationwide.",
    provider: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png"
    },
    areaServed: {
      "@type": "Country",
      name: "United Kingdom"
    },
    serviceType: "Cake Slice Delivery Service",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cake Slice Postal Delivery",
      itemListElement: postalFriendlyCakes.map((cake, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Product",
          name: cake.name,
          description: cake.description,
          image: cake.mainImage?.asset?.url
        }
      }))
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: "https://olgishcakes.co.uk/cake-postal-delivery",
      serviceSmsNumber: "+44 786 721 8194",
      serviceContactUrl: "https://olgishcakes.co.uk/contact"
    }
  };

  return (
    <>
      <StructuredData type="service" data={structuredData} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h1" component="h1" gutterBottom sx={{ 
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 700,
            color: '#2E3192',
            mb: 2
          }}>
            🎂 Cake by Post Service
          </Typography>
          <Typography variant="h2" component="h2" sx={{ 
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: '#666',
            mb: 4,
            fontWeight: 400
          }}>
            Send Delicious Cake Slices Through the Letterbox Across the UK
          </Typography>
          <Typography variant="body1" sx={{ 
            fontSize: '1.2rem',
            maxWidth: '800px',
            mx: 'auto',
            mb: 4,
            lineHeight: 1.7
          }}>
            🇬🇧 UK's best cake by post service! We send delicious individual cake slices through 
            your letterbox. Authentic Ukrainian honey cake slices, Kyiv cake slices, and other 
            traditional flavors delivered nationwide across England, Scotland, Wales, and Northern Ireland. 
            Perfect for birthdays, anniversaries, and special occasions when you cannot be there in person.
          </Typography>
        </Box>

        {/* Key Benefits */}
        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <LocalShipping sx={{ fontSize: 48, color: '#2E3192', mb: 2 }} />
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                Fresh Cake Slice Delivery
              </Typography>
              <Typography variant="body1">
                Individual cake slices delivered fresh across the UK. Our postal service 
                makes sure your cake slices arrive in perfect condition.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <DeliveryDining sx={{ fontSize: 48, color: '#FEF102', mb: 2 }} />
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                Letterbox-Friendly Cake Slices
              </Typography>
              <Typography variant="body1">
                Individual cake slices in specially designed packaging that fits through standard letterboxes. 
                No need to be home - your cake slice arrives safely while you're out.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <CheckCircle sx={{ fontSize: 48, color: '#2E3192', mb: 2 }} />
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                Fresh Slice Guarantee
              </Typography>
              <Typography variant="body1">
                100% fresh guarantee. All cake slices are baked to order and packaged 
                with special care to maintain quality during postal delivery.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* How It Works */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{ 
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            How Cake by Post Works
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h4" sx={{ color: '#2E3192', fontWeight: 700 }}>1</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Choose Your Cake Slice" 
                    secondary="Select from our individual cake slice collection. All slices are specially designed for safe postal delivery."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h4" sx={{ color: '#2E3192', fontWeight: 700 }}>2</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Add Delivery Details" 
                    secondary="Enter the recipient's address. We deliver to all UK postcodes including Northern Ireland, Scotland, and Wales."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h4" sx={{ color: '#2E3192', fontWeight: 700 }}>3</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="We Bake & Package" 
                    secondary="Fresh cake slices are baked to order and carefully packaged in letterbox-friendly containers."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="h4" sx={{ color: '#2E3192', fontWeight: 700 }}>4</Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Postal Delivery" 
                    secondary="Cake slices are sent via Royal Mail or courier service for delivery across the UK."
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #2E3192 0%, #FEF102 100%)',
                borderRadius: 2,
                p: 4,
                color: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.8rem', fontWeight: 600 }}>
                  🎯 Perfect for Special Occasions
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 3 }}>
                  Send love and celebration through the post with our premium cake slice delivery service.
                </Typography>
                <List sx={{ color: 'white' }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary="Birthday slice surprises" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary="Anniversary cake slices" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary="Thank you cake gifts" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText primary="Corporate cake gifts" />
                  </ListItem>
                </List>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Postal-Friendly Cakes */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{ 
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            Individual Cake Slice Collection
          </Typography>
          <Typography variant="body1" sx={{ 
            textAlign: 'center',
            mb: 4,
            fontSize: '1.1rem',
            maxWidth: '800px',
            mx: 'auto'
          }}>
            All our individual cake slices are specially designed to travel safely through the mail. 
            Each slice comes in letterbox-friendly packaging with detailed care instructions.
          </Typography>
          
          <Grid container spacing={3}>
            {postalFriendlyCakes.slice(0, 6).map((cake) => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <CakeCard cake={cake} variant="catalog" />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Delivery Areas & Pricing */}
        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h3" component="h3" gutterBottom sx={{ 
                fontSize: '1.8rem',
                color: '#2E3192',
                fontWeight: 600,
                mb: 3
              }}>
                🚚 UK-Wide Delivery Areas
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                We deliver individual cake slices by post across the entire United Kingdom:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="England - All regions and postcodes" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Scotland - Highlands, Lowlands, Islands" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Wales - All counties and regions" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Northern Ireland - All postcodes" />
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
                💰 Postal Delivery Pricing
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Standard Delivery (3-5 days)" 
                    secondary="£4.99 - Perfect for planned celebrations"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Express Delivery (1-2 days)" 
                    secondary="£8.99 - Faster delivery for urgent orders"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Same-Day Delivery (England only)" 
                    secondary="£12.99 - Order by 2pm for same-day delivery"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Free Delivery" 
                    secondary="Orders over £50 qualify for free standard delivery"
                  />
                </ListItem>
              </List>
              <Box sx={{ 
                mt: 3,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1
              }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  💡 Tip: Order early in the week for weekend delivery. 
                  All cakes include detailed care instructions and storage tips.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* FAQ Section */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{ 
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{ 
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  How long do cake slices stay fresh?
                </Typography>
                <Typography variant="body1">
                  Our individual cake slices are designed to stay fresh for 5-7 days when properly stored. 
                  Each slice comes with detailed storage instructions and best-by dates.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{ 
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  What if the recipient isn't home?
                </Typography>
                <Typography variant="body1">
                  Perfect! Our letterbox-friendly packaging means the cake slice can be delivered 
                  even when no one is home. The packaging fits through standard letterboxes.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{ 
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  Can I track my cake slice delivery?
                </Typography>
                <Typography variant="body1">
                  Yes! We provide tracking numbers for all deliveries. You'll receive email 
                  updates and can track your cake slice's journey from our bakery to the recipient.
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
                  Are cake slices suitable for special diets?
                </Typography>
                <Typography variant="body1">
                  Absolutely! We offer gluten-friendly, dairy-free, and vegan options. 
                  All dietary requirements are clearly labeled and can be filtered in our collection.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{ 
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  What happens if my cake slice is damaged in transit?
                </Typography>
                <Typography variant="body1">
                  We guarantee 100% satisfaction.                   If your cake slice arrives damaged, we'll replace 
                  it immediately at no extra cost. Our packaging is designed to protect cake slices during transit.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{ 
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  Can I add a personal message to my cake slice?
                </Typography>
                <Typography variant="body1">
                  Of course! Include a personal message when ordering, and we'll include it 
                  with the cake slice delivery. Perfect for birthdays, anniversaries, or just because.
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
            🎂 Ready to Send Cake Slice Love by Post?
          </Typography>
          <Typography variant="body1" sx={{ 
            fontSize: '1.2rem',
            mb: 4,
            maxWidth: '600px',
            mx: 'auto'
          }}>
            Surprise someone special with a delicious Ukrainian cake slice delivered straight to their door. 
            Order now and spread joy across the UK!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Box 
              component="a" 
              href="/cakes" 
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
              Browse Cake Slices
            </Box>
            <Box 
              component="a" 
              href="/contact" 
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
              Get Custom Quote
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
