import type { Metadata } from 'next'
import { Container, Typography, Box, Grid, Paper, Button, Chip, Card, CardContent, Link as MuiLink } from '@mui/material'
import Link from 'next/link'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ArrowForwardIcon, LocalShippingIcon, CheckCircleIcon, StarIcon, CakeOutlinedIcon } from '@/lib/mui-optimization'
import { colors } from '@/lib/design-system'
import { BUSINESS_CONSTANTS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Cake in Leeds | Best Ukrainian Bakery Leeds Yorkshire',
  description: '★★★★★ Best cake in Leeds! Authentic Ukrainian cakes, same-day delivery across Leeds. Traditional Medovik, Kyiv cake & custom designs from £25. Order now!',
  keywords: 'cake in leeds, cakes leeds, leeds bakery, ukrainian bakery leeds, cake delivery leeds, birthday cake leeds, wedding cake leeds, best cake leeds',
  openGraph: {
    title: 'Cake in Leeds | Best Ukrainian Bakery Leeds Yorkshire',
    description: '★★★★★ Best cake in Leeds! Authentic Ukrainian cakes, same-day delivery across Leeds. Traditional Medovik, Kyiv cake & custom designs from £25. Order now!',
    url: `${BUSINESS_CONSTANTS.BASE_URL}/cake-in-leeds`,
    siteName: 'Olgish Cakes',
    images: [
      {
        url: `${BUSINESS_CONSTANTS.BASE_URL}/images/cakes-leeds-delivery.jpg`,
        width: 1200,
        height: 630,
        alt: 'Cake in Leeds - Ukrainian Bakery Leeds Yorkshire',
        type: 'image/jpeg'
      }
    ],
    locale: 'en_GB',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cake in Leeds | Best Ukrainian Bakery Leeds Yorkshire',
    description: '★★★★★ Best cake in Leeds! Authentic Ukrainian cakes, same-day delivery across Leeds. Traditional Medovik, Kyiv cake & custom designs.',
    images: [`${BUSINESS_CONSTANTS.BASE_URL}/images/cakes-leeds-delivery.jpg`]
  },
  alternates: {
    canonical: `${BUSINESS_CONSTANTS.BASE_URL}/cake-in-leeds`
  },
  authors: [{ name: 'Olgish Cakes', url: BUSINESS_CONSTANTS.BASE_URL }],
  creator: 'Olgish Cakes',
  publisher: 'Olgish Cakes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL(BUSINESS_CONSTANTS.BASE_URL),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  other: {
    'geo.region': 'GB-ENG',
    'geo.placename': 'Leeds',
    'geo.position': '53.8008;-1.5491',
    ICBM: '53.8008, -1.5491'
  }
}

export default function CakeInLeedsPage() {
  const localBusinessStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: 'Olgish Cakes',
    description: 'Best cake in Leeds. Authentic Ukrainian bakery specializing in traditional cakes, birthday cakes, wedding cakes, and custom cake designs.',
    image: `${BUSINESS_CONSTANTS.BASE_URL}/images/olgish-cakes-logo-bakery-brand.png`,
    url: BUSINESS_CONSTANTS.BASE_URL,
    telephone: BUSINESS_CONSTANTS.PHONE,
    email: BUSINESS_CONSTANTS.EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Allerton Grange',
      addressLocality: 'Leeds',
      addressRegion: 'West Yorkshire',
      postalCode: 'LS17',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 53.8008,
      longitude: -1.5491
    },
    servesCuisine: 'Ukrainian',
    priceRange: '££',
    areaServed: [
      { '@type': 'City', name: 'Leeds' },
      { '@type': 'City', name: 'Bradford' },
      { '@type': 'City', name: 'York' },
      { '@type': 'City', name: 'Wakefield' },
      { '@type': 'City', name: 'Huddersfield' }
    ],
    openingHours: 'Mo-Su 08:00-20:00'
  }

  const serviceStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Cake Bakery and Delivery',
    provider: {
      '@type': 'Bakery',
      name: 'Olgish Cakes',
      telephone: BUSINESS_CONSTANTS.PHONE
    },
    areaServed: {
      '@type': 'City',
      name: 'Leeds'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Cakes in Leeds',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Ukrainian Honey Cake',
            description: 'Traditional Ukrainian honey cake with delicate layers'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Birthday Cake Leeds',
            description: 'Custom birthday cakes made fresh to order'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Wedding Cake Leeds',
            description: 'Beautiful wedding cakes designed for your special day'
          }
        }
      ]
    }
  }

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BUSINESS_CONSTANTS.BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cake in Leeds',
        item: `${BUSINESS_CONSTANTS.BASE_URL}/cake-in-leeds`
      }
    ]
  }

  const leedsAreas = [
    { name: 'City Centre', postcodes: 'LS1, LS2' },
    { name: 'Headingley', postcodes: 'LS6' },
    { name: 'Chapel Allerton', postcodes: 'LS7' },
    { name: 'Roundhay', postcodes: 'LS8' },
    { name: 'Moortown', postcodes: 'LS17' },
    { name: 'Horsforth', postcodes: 'LS18' },
    { name: 'Yeadon', postcodes: 'LS19' },
    { name: 'Guiseley', postcodes: 'LS20' },
    { name: 'Otley', postcodes: 'LS21' },
    { name: 'Wetherby', postcodes: 'LS22, LS23' },
    { name: 'Pudsey', postcodes: 'LS28' },
    { name: 'Morley', postcodes: 'LS27' }
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <main className="min-h-screen bg-gray-50">
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Cake in Leeds', href: '/cake-in-leeds' }
            ]}
          />
        </Container>

        {/* Hero Section */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 'bold',
                mb: 3,
                textAlign: 'center'
              }}
            >
              Best Cake in Leeds
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
                mb: 4,
                textAlign: 'center',
                maxWidth: '900px',
                mx: 'auto'
              }}
            >
              Authentic Ukrainian cakes made fresh daily in Leeds. Same-day delivery across Yorkshire.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
              <Chip label="★★★★★ 127+ Reviews" sx={{ bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 'bold' }} />
              <Chip label="Same-Day Delivery" sx={{ bgcolor: 'white', color: 'primary.main' }} />
              <Chip label="From £25" sx={{ bgcolor: 'white', color: 'primary.main' }} />
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {/* Introduction */}
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Looking for cake in Leeds? I'm Olga, and I run the only authentic Ukrainian bakery in Leeds. I make traditional Ukrainian cakes that you won't find anywhere else in Yorkshire. Every cake is handmade using recipes my family taught me in Ukraine. When you order cake in Leeds from me, you get something special - not mass-produced supermarket cake, but real Ukrainian tradition made with love.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              I started making cakes in Leeds because I missed the authentic Ukrainian cakes from home. British cakes are nice, but Ukrainian cakes are different - more layers, better textures, more sophisticated flavors. Now Leeds people can taste real Ukrainian tradition without traveling to Ukraine. My customers tell me they've never had cake like this before. That makes me proud.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              Whether you need birthday cake in Leeds, wedding cake, or just want to try something new, I make every cake fresh to order. I deliver across all of Leeds - from city centre to Roundhay, Headingley to Morley. Same-day delivery available if you order before noon. Prices start from £25, so authentic Ukrainian cake in Leeds is affordable for everyone.
            </Typography>
          </Paper>

          {/* Why Choose Us */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Why Olgish Cakes is the Best Cake in Leeds
          </Typography>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {[
              {
                icon: <CakeOutlinedIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
                title: 'Authentic Ukrainian Recipes',
                description: 'I\'m from Ukraine and use family recipes passed down through generations. You won\'t find these cakes anywhere else in Leeds. Every cake is authentic Ukrainian tradition.'
              },
              {
                icon: <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />,
                title: 'Made Fresh Daily',
                description: 'No freezers, no preservatives. Every cake in Leeds from Olgish Cakes is made fresh when you order it. I start baking the day before your delivery to ensure perfect freshness.'
              },
              {
                icon: <LocalShippingIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
                title: 'Same-Day Delivery Leeds',
                description: 'Order before noon and get your cake the same day. I deliver personally across Leeds, handling each cake with care. Free delivery for orders over £50 in Leeds.'
              },
              {
                icon: <StarIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
                title: '127+ Five-Star Reviews',
                description: 'Leeds people love my cakes! Over 127 five-star reviews from happy customers. Read what people say about the best cake in Leeds on my testimonials page.'
              }
            ].map((item, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>{item.icon}</Box>
                    <Typography variant="h3" component="h3" sx={{ fontSize: '1.5rem', fontWeight: 600, color: 'primary.main', mb: 2 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Types of Cakes */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Types of Cake in Leeds We Offer
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.8rem', fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  <MuiLink component={Link} href="/birthday-cakes" underline="none" sx={{ color: colors.primary.main }}>Birthday Cake Leeds</MuiLink>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  Need birthday cake in Leeds? I make beautiful custom birthday cakes with any design you want. From simple elegant cakes to elaborate themed creations, every birthday cake is made fresh and designed just for you. Popular flavors include honey cake, vanilla, and chocolate. Order 2 days ahead for custom designs.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.8rem', fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  <MuiLink component={Link} href="/wedding-cakes" underline="none" sx={{ color: colors.primary.main }}>Wedding Cake Leeds</MuiLink>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  Your wedding cake should be as special as your day. I create stunning wedding cakes in Leeds with beautiful designs and delicious flavors. Traditional Ukrainian wedding cakes feature elegant decorations and sophisticated taste. Free consultation and cake tasting for wedding cakes.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.8rem', fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  <MuiLink component={Link} href="/cakes/honey-cake-medovik" underline="none" sx={{ color: colors.primary.main }}>Traditional Ukrainian Cakes</MuiLink>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  Try authentic Ukrainian cakes in Leeds. My <MuiLink component={Link} href="/cakes/honey-cake-medovik" underline="always" sx={{ color: colors.primary.main }}>honey cake (Medovik)</MuiLink>, <MuiLink component={Link} href="/cakes/kyiv-cake" underline="always" sx={{ color: colors.primary.main }}>Kyiv cake</MuiLink>, and Napoleon are made exactly how they're made in Ukraine. These aren't British versions - they're the real thing. Perfect for people who miss Ukrainian cakes or want to try something new.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.8rem', fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  <MuiLink component={Link} href="/custom-cake-design" underline="none" sx={{ color: colors.primary.main }}>Custom Cake Design Leeds</MuiLink>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  Have a special vision for your cake? I offer custom cake design in Leeds. Tell me what you want - colors, theme, style - and I'll create it. Every custom cake is unique and made just for your celebration. Perfect for corporate events, anniversaries, and special occasions.
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Delivery Areas */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Cake Delivery Across Leeds
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'center' }}>
              I deliver cake across all Leeds areas. Same-day delivery available for orders placed before noon. Free delivery on orders over £50 within Leeds.
            </Typography>
            <Grid container spacing={2}>
              {leedsAreas.map((area, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                      {area.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {area.postcodes}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Typography variant="body1" sx={{ mt: 4, lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'center' }}>
              Also delivering to Bradford, York, Wakefield, Huddersfield, and surrounding areas. Contact me for delivery outside Leeds.
            </Typography>
          </Paper>

          {/* Ukrainian vs British Cakes */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Ukrainian Cakes vs Regular Cakes in Leeds
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Many Leeds bakeries make good cakes, but Ukrainian cakes are different. Most cakes in Leeds are sponge-based with buttercream. They're nice for children's parties. But Ukrainian cakes are more sophisticated. They're for people who appreciate fine desserts.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Ukrainian cakes have multiple thin layers - 8, 10, sometimes 12 layers in one cake. Each layer is paper-thin. The fillings are different too - we use sour cream, condensed milk, custard, not just buttercream. The flavors are more subtle and refined. When Leeds people try my Ukrainian cakes, they're surprised how different they taste.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Another difference is time. British cakes can be made in a few hours. Ukrainian cakes take longer - my honey cake soaks overnight, the meringue needs time to dry, the pastry needs to rest. I can't rush Ukrainian cakes. That's why they taste so special. In Leeds, nobody else makes cakes this way.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              If you're looking for cake in Leeds and want something different from regular British cakes, try my Ukrainian cakes. Many customers order from me every time now because they can't go back to regular cakes. Once you taste the difference, you understand why Ukrainian cakes are special.
            </Typography>
          </Paper>

          {/* Pricing */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Cake Prices in Leeds
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    Standard Cakes
                  </Typography>
                  <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    From £25
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Traditional Ukrainian cakes (8 inch)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 3, border: '2px solid', borderColor: 'secondary.main', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    Custom Designs
                  </Typography>
                  <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    From £45
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Birthday & celebration cakes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    Wedding Cakes
                  </Typography>
                  <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    Custom Quote
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Free consultation & tasting
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* How to Order */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            How to Order Cake in Leeds
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={3}>
              {[
                {
                  step: '1',
                  title: 'Choose Your Cake',
                  description: 'Browse my collection of traditional Ukrainian cakes or request a custom design. Not sure? Call me for recommendations.'
                },
                {
                  step: '2',
                  title: 'Place Your Order',
                  description: (
                    <>
                      Order online, by phone <MuiLink href={`tel:${BUSINESS_CONSTANTS.PHONE}`} underline="always" sx={{ color: colors.primary.main }}>{BUSINESS_CONSTANTS.PHONE}</MuiLink>, or email <MuiLink href={`mailto:${BUSINESS_CONSTANTS.EMAIL}`} underline="always" sx={{ color: colors.primary.main }}>{BUSINESS_CONSTANTS.EMAIL}</MuiLink>. Tell me your delivery date and any special requirements.
                    </>
                  )
                },
                {
                  step: '3',
                  title: 'I Make Your Cake',
                  description: 'I start making your cake fresh, using traditional methods. Each cake is made with care and attention to detail.'
                },
                {
                  step: '4',
                  title: 'Delivery or Collection',
                  description: 'Choose same-day delivery across Leeds or collect from my kitchen in LS17. I handle every cake carefully.'
                }
              ].map((item, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}
                    >
                      {item.step}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* CTA Section */}
          <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, px: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 'bold', mb: 3 }}>
              Ready to Order the Best Cake in Leeds?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', maxWidth: '700px', mx: 'auto' }}>
              Order your authentic Ukrainian cake today. Same-day delivery available across Leeds. Call <MuiLink href={`tel:${BUSINESS_CONSTANTS.PHONE}`} underline="always" sx={{ color: colors.secondary.main }}>{BUSINESS_CONSTANTS.PHONE}</MuiLink> or order online now.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/cakes"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'primary.main',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': { bgcolor: 'secondary.dark' }
                }}
                endIcon={<ArrowForwardIcon />}
              >
                View All Cakes
              </Button>
              <Button
                component={Link}
                href="/get-custom-quote"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': { borderColor: 'secondary.main', bgcolor: 'white', color: 'primary.main' }
                }}
              >
                Get Custom Quote
              </Button>
            </Box>
          </Box>
        </Container>
      </main>
    </>
  )
}

