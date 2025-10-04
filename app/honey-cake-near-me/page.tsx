import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import CakeCard from "@/app/components/CakeCard";
import { Container, Typography, Box, Grid, Paper, List, ListItem, ListItemIcon, ListItemText, Chip } from "@mui/material";
import { Cake as CakeIcon, LocationOn, LocalShipping, Star, AccessTime, Phone, CheckCircle } from "@mui/icons-material";
import { StructuredData } from "@/app/components/StructuredData";
import { Cake as CakeType } from "@/types/cake";

export const metadata: Metadata = {
  title: "Honey Cake Near Me | Authentic Ukrainian Medovik | Leeds",
  description: "🍯 Find Authentic Honey Cake Near Me! Traditional Ukrainian Medovik, Kyiv cake & Ukrainian desserts. Same-day delivery Leeds, Bradford, York, Wakefield. 5⭐ rated bakery. Order now!",
  keywords: [
    "honey cake near me",
    "medovik near me",
    "ukrainian cake near me",
    "honey cake leeds",
    "medovik leeds",
    "ukrainian bakery near me",
    "traditional honey cake",
    "authentic medovik",
    "kyiv cake near me",
    "ukrainian desserts near me",
    "cake delivery near me",
    "local ukrainian bakery",
    "honey cake delivery",
    "medovik cake near me",
    "ukrainian honey cake recipe"
  ].join(", "),
  openGraph: {
    title: "Honey Cake Near Me | Authentic Ukrainian Medovik | Leeds",
    description: "🍯 Find Authentic Honey Cake Near Me! Traditional Ukrainian Medovik, Kyiv cake & Ukrainian desserts. Same-day delivery Leeds, Bradford, York, Wakefield. 5⭐ rated bakery. Order now!",
    url: "https://olgishcakes.co.uk/honey-cake-near-me",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/honey-cake-near-me-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Honey Cake Near Me - Authentic Ukrainian Medovik Leeds",
      },
    ],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/honey-cake-near-me",
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

export default async function HoneyCakeNearMePage() {
  const cakes = await getCakes();
  const honeyCakes = cakes.filter(cake =>
    cake.name.toLowerCase().includes('honey') ||
    cake.name.toLowerCase().includes('medovik') ||
    cake.category?.toLowerCase().includes('honey') ||
    cake.category?.toLowerCase().includes('medovik') ||
    cake.category?.toLowerCase().includes('traditional')
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Olgish Cakes - Authentic Ukrainian Honey Cake",
    description: "Premier Ukrainian bakery in Leeds, specializing in authentic honey cake (Medovik) and traditional Ukrainian desserts.",
    url: "https://olgishcakes.co.uk/honey-cake-near-me",
    telephone: "+44 786 721 8194",
    email: "hello@olgishcakes.co.uk",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Leeds",
      addressRegion: "West Yorkshire",
      addressCountry: "GB"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 53.8008,
      longitude: -1.5491
    },
    openingHours: "Mo-Sa 08:00-18:00",
    priceRange: "££",
    servesCuisine: "Ukrainian",
    areaServed: [
      "Leeds",
      "Bradford",
      "York",
      "Wakefield",
      "Huddersfield",
      "Halifax",
      "Pudsey",
      "Otley",
      "Ilkley",
      "Skipton"
    ],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 53.8008,
        longitude: -1.5491
      },
      geoRadius: "25"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Ukrainian Honey Cakes",
      itemListElement: honeyCakes.map((cake, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Product",
          name: cake.name,
          description: cake.description,
          image: cake.mainImage?.asset?.url
        }
      }))
    }
  };

  const serviceAreas = [
    { city: "Leeds", distance: "0 miles", population: "789,194", delivery: "Available" },
    { city: "Bradford", distance: "9 miles", population: "349,561", delivery: "Available" },
    { city: "York", distance: "24 miles", population: "153,717", delivery: "Available" },
    { city: "Wakefield", distance: "12 miles", population: "99,251", delivery: "Available" },
    { city: "Huddersfield", distance: "18 miles", population: "162,949", delivery: "Available" },
    { city: "Halifax", distance: "15 miles", population: "88,134", delivery: "Available" },
    { city: "Pudsey", distance: "6 miles", population: "22,408", delivery: "Available" },
    { city: "Otley", distance: "10 miles", population: "14,528", delivery: "Available" },
    { city: "Ilkley", distance: "12 miles", population: "13,828", delivery: "Available" },
    { city: "Skipton", distance: "20 miles", population: "14,623", delivery: "Available" }
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
            🍯 Honey Cake Near Me
          </Typography>
          <Typography variant="h2" component="h2" sx={{
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: '#666',
            mb: 4,
            fontWeight: 400
          }}>
            Authentic Ukrainian Medovik & Traditional Desserts
          </Typography>
          <Typography variant="body1" sx={{
            fontSize: '1.2rem',
            maxWidth: '800px',
            mx: 'auto',
            mb: 4,
            lineHeight: 1.7
          }}>
            🇺🇦 You want authentic honey cake near you? Look no further! Olgish Cakes is your local
            Ukrainian bakery that makes traditional Medovik honey cake, Kyiv cake, and other
            authentic Ukrainian desserts. Fresh delivery across Leeds and surrounding areas.
            Made with love using old family recipes.
          </Typography>

          {/* Quick Contact & Location */}
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
                Based in Leeds, serving Yorkshire
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone sx={{ color: '#2E3192' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Order Now: +44 786 721 8194
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star sx={{ color: '#FEF102' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                5⭐ Rated Ukrainian Bakery
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
                Authentic Ukrainian Recipes
              </Typography>
              <Typography variant="body1">
                Traditional honey cake (Medovik) made with authentic Ukrainian recipes that passed down
                through generations. No shortcuts, just pure tradition and quality.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <LocalShipping sx={{ fontSize: 48, color: '#FEF102', mb: 2 }} />
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                Fresh Local Delivery
              </Typography>
              <Typography variant="body1">
                Fresh honey cake delivered across Leeds, Bradford, York, and surrounding areas.
                Order in advance for delivery to your door.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <AccessTime sx={{ fontSize: 48, color: '#2E3192', mb: 2 }} />
              <Typography variant="h3" component="h3" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                Fresh Baked Daily
              </Typography>
              <Typography variant="body1">
                Every honey cake is baked fresh daily using premium ingredients. No preservatives,
                no artificial flavors - just authentic Ukrainian taste you'll love.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Honey Cake Collection */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            Our Authentic Honey Cake Collection
          </Typography>
          <Typography variant="body1" sx={{
            textAlign: 'center',
            mb: 4,
            fontSize: '1.1rem',
            maxWidth: '800px',
            mx: 'auto'
          }}>
            Discover our collection of traditional Ukrainian honey cakes and desserts. Each cake
            is made with authentic recipes and premium ingredients, delivering the true taste of Ukraine.
          </Typography>

          <Grid container spacing={3}>
            {honeyCakes.slice(0, 6).map((cake) => (
              <Grid item xs={12} sm={6} md={4} key={cake._id}>
                <CakeCard cake={cake} variant="catalog" />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Service Areas */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            Honey Cake Delivery Areas
          </Typography>
          <Typography variant="body1" sx={{
            textAlign: 'center',
            mb: 4,
            fontSize: '1.1rem',
            maxWidth: '800px',
            mx: 'auto'
          }}>
            We deliver authentic honey cake throughout Yorkshire and beyond. Find your area below
            and enjoy fresh Ukrainian desserts delivered to your door.
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            {serviceAreas.map((area) => (
              <Grid item xs={12} sm={6} md={4} key={area.city}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h4" component="h4" gutterBottom sx={{
                    fontSize: '1.3rem',
                    color: '#2E3192',
                    fontWeight: 600
                  }}>
                    {area.city}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {area.distance} from Leeds • Population: {area.population}
                  </Typography>
                  <Chip
                    label={area.delivery}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Why Choose Our Honey Cake */}
        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h3" component="h3" gutterBottom sx={{
                fontSize: '1.8rem',
                color: '#2E3192',
                fontWeight: 600,
                mb: 3
              }}>
                🍯 What Makes Our Honey Cake Special?
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Authentic Ukrainian Medovik recipe" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Premium local honey and ingredients" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Traditional layering technique" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Traditional wheat-based recipe" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText primary="Made fresh daily, never frozen" />
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
                🚚 Delivery & Ordering Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccessTime sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fresh Delivery"
                    secondary="Order in advance for fresh delivery in Leeds area"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalShipping sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Free Delivery"
                    secondary="Free delivery on orders over £30 within 10 miles"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Easy Ordering"
                    secondary="Order online, by phone, or visit our Leeds location"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Star sx={{ color: '#2E3192' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Quality Guarantee"
                    secondary="100% satisfaction guarantee on all honey cakes"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Customer Reviews */}
        <Box mb={6}>
          <Typography variant="h2" component="h2" gutterBottom sx={{
            fontSize: '2.5rem',
            textAlign: 'center',
            mb: 4,
            color: '#2E3192',
            fontWeight: 600
          }}>
            What Our Customers Say About Our Honey Cake
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "The most authentic Ukrainian honey cake I've had outside of Ukraine!
                  The layers are perfect and the taste brings back childhood memories.
                  Highly recommend to anyone looking for traditional Medovik."
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2E3192' }}>
                  Anna K.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Leeds Customer
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} sx={{ color: '#FEF102', fontSize: 20 }} />
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "Amazing honey cake! Ordered for my birthday and it arrived fresh and delicious.
                  The delivery was reliable and the cake was beautifully packaged.
                  Will definitely order again!"
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2E3192' }}>
                  Michael S.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bradford Customer
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} sx={{ color: '#FEF102', fontSize: 20 }} />
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "Found this bakery when searching for 'honey cake near me' and couldn't be happier!
                  The Medovik is authentic and the service is excellent.
                  My Ukrainian grandmother would approve!"
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2E3192' }}>
                  Elena M.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  York Customer
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} sx={{ color: '#FEF102', fontSize: 20 }} />
                  ))}
                </Box>
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
                  What is Medovik honey cake?
                </Typography>
                <Typography variant="body1">
                  Medovik is a traditional Ukrainian honey cake made with thin layers of honey-flavored
                  cake and sweet cream. It's a beloved dessert that's been enjoyed in Ukraine for centuries.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  Do you offer gluten-free honey cake?
                </Typography>
                <Typography variant="body1">
                  Traditional honey cake (Medovik) contains wheat flour as part of the authentic recipe.
                  We focus on making the best traditional version using time-honored Ukrainian methods.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  How long does honey cake stay fresh?
                </Typography>
                <Typography variant="body1">
                  Our honey cake stays fresh for 5-7 days when properly stored in the refrigerator.
                  The cake actually improves in flavor after a day as the layers meld together.
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
                  Can I order honey cake for same-day delivery?
                </Typography>
                <Typography variant="body1">
                  We offer fresh delivery across Leeds and surrounding areas.
                  Please order in advance to ensure availability and fresh delivery to your location.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  Do you have a physical location I can visit?
                </Typography>
                <Typography variant="body1">
                  Yes! We're based in Leeds and welcome visitors. You can also find our honey cakes
                  at local farmers markets and specialty food stores throughout Yorkshire.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h4" gutterBottom sx={{
                  fontSize: '1.3rem',
                  color: '#2E3192',
                  fontWeight: 600
                }}>
                  What other Ukrainian desserts do you make?
                </Typography>
                <Typography variant="body1">
                  In addition to Medovik, we make Kyiv cake, traditional Ukrainian cookies,
                  and seasonal desserts. All using authentic recipes from Ukraine.
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
            🍯 Ready to Try Authentic Honey Cake?
          </Typography>
          <Typography variant="body1" sx={{
            fontSize: '1.2rem',
            mb: 4,
            maxWidth: '600px',
            mx: 'auto'
          }}>
            Experience the authentic taste of Ukraine with our traditional Medovik honey cake.
            Fresh baked and delivered to your door across Yorkshire.
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
              Browse Honey Cakes
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
              Contact Us
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
