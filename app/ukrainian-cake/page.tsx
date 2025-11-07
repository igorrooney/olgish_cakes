import type { Metadata } from 'next'
import { Container, Typography, Box, Grid, Paper, Button, Chip, Link as MuiLink } from '@mui/material'
import Link from 'next/link'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ArrowForwardIcon, CakeOutlinedIcon, CheckCircleIcon, VerifiedIcon, LocalOfferIcon, SchoolIcon, FavoriteIcon } from '@/lib/mui-optimization'
import { colors } from '@/lib/design-system'
import { BUSINESS_CONSTANTS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Ukrainian Cake | Authentic Traditional Cakes Leeds',
  description: '★★★★★ Discover authentic Ukrainian cakes in Leeds. Traditional Medovik honey cake, Kyiv cake & Napoleon. Real Ukrainian recipes, handmade with love. Order now!',
  keywords: 'ukrainian cake, ukrainian cakes, traditional ukrainian cake, authentic ukrainian cake, ukrainian cake near me, ukrainian bakery, medovik, kyiv cake, ukrainian desserts',
  openGraph: {
    title: 'Ukrainian Cake | Authentic Traditional Cakes Leeds',
    description: '★★★★★ Discover authentic Ukrainian cakes in Leeds. Traditional Medovik honey cake, Kyiv cake & Napoleon. Real Ukrainian recipes, handmade with love. Order now!',
    url: `${BUSINESS_CONSTANTS.BASE_URL}/ukrainian-cake`,
    siteName: 'Olgish Cakes',
    images: [
      {
        url: `${BUSINESS_CONSTANTS.BASE_URL}/images/ukrainian-cakes-collection.jpg`,
        width: 1200,
        height: 630,
        alt: 'Authentic Ukrainian Cakes - Traditional Medovik and Kyiv Cake',
        type: 'image/jpeg'
      }
    ],
    locale: 'en_GB',
    type: 'article'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ukrainian Cake | Authentic Traditional Cakes Leeds',
    description: '★★★★★ Discover authentic Ukrainian cakes in Leeds. Traditional Medovik honey cake, Kyiv cake & Napoleon. Real Ukrainian recipes, handmade with love.',
    images: [`${BUSINESS_CONSTANTS.BASE_URL}/images/ukrainian-cakes-collection.jpg`]
  },
  alternates: {
    canonical: `${BUSINESS_CONSTANTS.BASE_URL}/ukrainian-cake`
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
    'geo.placename': 'Leeds'
  }
}

export default function UkrainianCakePage() {
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Ukrainian Cake: Complete Guide to Authentic Traditional Ukrainian Cakes',
    description: 'Discover authentic Ukrainian cakes like Medovik honey cake, Kyiv cake, and Napoleon. Learn what makes Ukrainian cakes unique and where to find real Ukrainian cakes in Leeds.',
    author: {
      '@type': 'Person',
      name: 'Olga',
      url: `${BUSINESS_CONSTANTS.BASE_URL}/about`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Olgish Cakes',
      logo: {
        '@type': 'ImageObject',
        url: `${BUSINESS_CONSTANTS.BASE_URL}/images/olgish-cakes-logo-bakery-brand.png`
      }
    },
    datePublished: '2025-11-05',
    dateModified: '2025-11-05',
    image: `${BUSINESS_CONSTANTS.BASE_URL}/images/placeholder-cake.jpg`,
    url: `${BUSINESS_CONSTANTS.BASE_URL}/ukrainian-cake`
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
        name: 'Ukrainian Cake',
        item: `${BUSINESS_CONSTANTS.BASE_URL}/ukrainian-cake`
      }
    ]
  }

  const localBusinessStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: 'Olgish Cakes',
    description: 'Authentic Ukrainian cake bakery in Leeds specializing in traditional Ukrainian cakes like Medovik, Kyiv cake, and Napoleon',
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
    servesCuisine: 'Ukrainian',
    priceRange: '££'
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessStructuredData) }}
      />

      <main className="min-h-screen bg-gray-50">
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Ukrainian Cake', href: '/ukrainian-cake' }
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
              Ukrainian Cake
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
                mb: 4,
                textAlign: 'center',
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Discover the authentic taste of traditional Ukrainian cakes in Leeds
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip label="Traditional Recipes" sx={{ bgcolor: 'white', color: 'primary.main' }} />
              <Chip label="Handmade with Love" sx={{ bgcolor: 'white', color: 'primary.main' }} />
              <Chip label="Fresh Daily" sx={{ bgcolor: 'white', color: 'primary.main' }} />
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {/* Introduction */}
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Ukrainian cake is not just a dessert - it's a piece of Ukrainian culture and tradition that I bring to Leeds. Every Ukrainian cake I make follows recipes passed down through my family for generations, using traditional methods you won't find in regular British bakeries. When you taste authentic Ukrainian cake, you taste the history and love that goes into every layer.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              What makes Ukrainian cake different from British cakes? Ukrainian cakes have unique flavors, delicate textures, and special techniques perfected over centuries. We don't use shortcuts or artificial ingredients. Every Ukrainian cake takes time and skill to make properly. The honey cake needs to soak overnight, the Kyiv cake requires perfect meringue layers, and the Napoleon needs paper-thin pastry. These aren't quick desserts - they're traditional Ukrainian masterpieces.
            </Typography>
          </Paper>

          {/* What Makes Ukrainian Cake Special */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            What Makes Ukrainian Cake Special?
          </Typography>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {[
              {
                icon: <VerifiedIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
                title: 'Authentic Ukrainian Tradition',
                description: 'Every recipe comes from my family in Ukraine. These are real Ukrainian cakes, not British versions or imitations. I use the same methods my grandmother taught me, keeping Ukrainian baking traditions alive in Leeds.'
              },
              {
                icon: <LocalOfferIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
                title: 'Premium Natural Ingredients',
                description: 'I use only the best ingredients - real Yorkshire honey, organic eggs, fresh cream, and high-quality flour. No artificial flavors, no preservatives, no shortcuts. Just natural ingredients that make Ukrainian cake taste the way it should.'
              },
              {
                icon: <SchoolIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
                title: 'Traditional Baking Methods',
                description: 'Ukrainian cake requires special techniques that take years to master. From the overnight soaking of honey layers to the delicate meringue preparation, every step follows traditional Ukrainian methods that create unique textures you can\'t get any other way.'
              },
              {
                icon: <FavoriteIcon sx={{ fontSize: 48, color: 'error.main' }} />,
                title: 'Made with Ukrainian Heart',
                description: 'In Ukraine, we say cakes made with love taste better. I put my heart into every Ukrainian cake I make. When you order from me, you get a cake made with the same care and love I would make for my own family.'
              }
            ].map((item, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Paper elevation={0} sx={{ p: 4, height: '100%', backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h3" component="h3" sx={{ fontSize: '1.5rem', fontWeight: 600, color: 'primary.main', mb: 2, textAlign: 'center' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Traditional Ukrainian Cakes */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Traditional Ukrainian Cakes
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.8rem', fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  Medovik (Honey Cake)
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  The most famous Ukrainian cake. Medovik has thin honey-soaked layers with rich cream filling. The honey flavor is subtle and sophisticated, not too sweet. After soaking overnight, the layers become incredibly soft and melt in your mouth. This is the Ukrainian cake that makes people fall in love with Ukrainian desserts.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  I use real Yorkshire honey and traditional Ukrainian methods to make my <MuiLink component={Link} href="/cakes/honey-cake-medovik" underline="always" sx={{ color: colors.primary.main }}>honey cake (Medovik)</MuiLink>. Every layer is rolled thin by hand, and the cream is made fresh. This Ukrainian cake takes two days to make properly, but the result is worth every minute.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.8rem', fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  Kyiv Cake
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  The legendary Ukrainian cake from Kyiv. This cake has two crispy hazelnut meringue layers filled with rich chocolate buttercream and covered with roasted cashews. The combination of crunchy meringue and smooth chocolate is incredible. Kyiv cake is a symbol of Ukrainian confectionery excellence.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  Making proper <MuiLink component={Link} href="/cakes/kyiv-cake" underline="always" sx={{ color: colors.primary.main }}>Kyiv cake</MuiLink> is difficult. The meringue needs to be perfect - crispy outside, slightly chewy inside. The chocolate cream must be smooth and not too sweet. This Ukrainian cake requires skill and experience to get right.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.8rem', fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  Napoleon Cake
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  Classic Ukrainian cake with thin puff pastry layers and vanilla custard cream. The pastry is crispy and light, the cream is smooth and rich. Napoleon cake is perfect for tea parties and family celebrations. In Ukraine, every grandmother has her own Napoleon recipe.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  I make my <MuiLink component={Link} href="/cakes/napoleon-cake" underline="always" sx={{ color: colors.primary.main }}>Napoleon cake</MuiLink> with 7-9 paper-thin pastry layers. Rolling the dough this thin takes practice, but it creates that special texture that makes Ukrainian Napoleon different from French mille-feuille.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h3" component="h3" sx={{ fontSize: '1.8rem', fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  Sacher Cake
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  While originally from Vienna, Sacher cake is very popular in Ukraine. I make it the Ukrainian way - with dark chocolate sponge, apricot jam, and glossy chocolate glaze. It's rich and sophisticated, perfect for chocolate lovers.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  My version uses premium dark chocolate and fresh apricot jam. The glaze needs to be mirror-smooth and set perfectly. This Ukrainian cake is for people who appreciate deep chocolate flavor without too much sweetness.
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Ukrainian Cake vs British Cake */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Ukrainian Cake vs British Cake
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Many people ask me what's different about Ukrainian cake compared to British cakes. The difference is big. British cakes are usually sponge-based with buttercream or fondant. They're good, but they're simple. Ukrainian cake is more complex and sophisticated.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Ukrainian cake has multiple thin layers instead of thick sponge. We use different fillings - sour cream, condensed milk, custard - not just buttercream. The flavors are more subtle and balanced. Ukrainian cake isn't about bright colors and fondant decorations - it's about taste and texture.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Another big difference is how we make Ukrainian cake. British cakes can be made quickly. Ukrainian cake takes time - sometimes two days. The honey cake needs to soak, the meringue needs to dry, the pastry needs to rest. You can't rush Ukrainian cake. That's why authentic Ukrainian cake tastes so special.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              When people in Leeds try my Ukrainian cake for the first time, they're always surprised. They expect something like British cake, but it's completely different. The layers are so thin and delicate. The flavors are more refined. Many tell me they've never tasted anything like it before. That's because authentic Ukrainian cake isn't common in Leeds - or anywhere in the UK.
            </Typography>
          </Paper>

          {/* Why Choose Olgish Cakes */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Why Choose Olgish Cakes for Ukrainian Cake in Leeds?
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={3}>
              {[
                "I'm Ukrainian and learned these recipes from my family",
                'Every cake is handmade using traditional methods',
                'I use only premium natural ingredients',
                'Each cake is made fresh to order',
                'Same-day delivery available in Leeds',
                '127+ five-star reviews from happy customers',
                "Authentic Ukrainian taste you won't find elsewhere",
                'Prices from £25 - affordable luxury'
              ].map((benefit, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24, mt: 0.5 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {benefit}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Cultural Significance */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-playfair-display)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            The Cultural Story Behind Ukrainian Cake
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              In Ukraine, cake is more than dessert. It's part of our culture and celebrations. Every birthday, wedding, anniversary, and holiday needs a special Ukrainian cake. We don't buy cakes from supermarkets - we order them from skilled bakers or make them at home using family recipes.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Ukrainian cake traditions go back many generations. My grandmother learned from her grandmother, and I learned from my grandmother. These recipes are precious to Ukrainian families. When I came to Leeds, I wanted to share this tradition with people here.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              For Ukrainian people living in Leeds, my cakes bring memories of home. They taste the flavors they grew up with. For British people, my Ukrainian cakes are a discovery - something new and special they haven't experienced before. Both groups tell me these cakes are different from anything else they can buy in Leeds.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              Making Ukrainian cake is my way of keeping Ukrainian culture alive in Yorkshire. Every cake I make is a little piece of Ukraine. I'm proud to be the only authentic Ukrainian baker in Leeds making traditional Ukrainian cakes the proper way.
            </Typography>
          </Paper>

          {/* CTA Section */}
          <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, px: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 'bold', mb: 3 }}>
              Ready to Try Authentic Ukrainian Cake?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', maxWidth: '700px', mx: 'auto' }}>
              Order your traditional Ukrainian cake today and taste the real Ukrainian tradition. Same-day delivery available across Leeds and Yorkshire. Call <MuiLink href={`tel:${BUSINESS_CONSTANTS.PHONE}`} underline="always" sx={{ color: colors.secondary.main }}>{BUSINESS_CONSTANTS.PHONE}</MuiLink> or email <MuiLink href={`mailto:${BUSINESS_CONSTANTS.EMAIL}`} underline="always" sx={{ color: colors.secondary.main }}>{BUSINESS_CONSTANTS.EMAIL}</MuiLink>.
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
                View All Ukrainian Cakes
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

