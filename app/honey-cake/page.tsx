import type { Metadata } from 'next'
import { Container, Typography, Box, Grid, Paper, Button, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import Link from 'next/link'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ArrowForwardIcon, ExpandMoreIcon, CheckCircleIcon, LocalDiningIcon, DesignServicesIcon, KitchenIcon, OpacityIcon, CakeIcon, AccessTimeIcon, Link as MuiLink } from '@/lib/mui-optimization'
import { colors } from '@/lib/design-system'
import { BUSINESS_CONSTANTS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Honey Cake | Authentic Ukrainian Medovik Leeds',
  description: 'Authentic honey cake (Medovik) in Leeds. Traditional Ukrainian recipe, handmade with real honey. 8 delicate layers soaked overnight. Order from £25!',
  keywords: 'honey cake, medovik, ukrainian honey cake, honey cake near me, buy honey cake, traditional honey cake, medovik cake, honey cake leeds',
  openGraph: {
    title: 'Honey Cake | Authentic Ukrainian Medovik Leeds',
    description: 'Authentic honey cake (Medovik) in Leeds. Traditional Ukrainian recipe, handmade with real honey. 8 delicate layers soaked overnight. Order from £25!',
    url: `${BUSINESS_CONSTANTS.BASE_URL}/honey-cake`,
    siteName: 'Olgish Cakes',
    images: [
      {
        url: `${BUSINESS_CONSTANTS.BASE_URL}/images/honey-cake-medovik.jpg`,
        width: 1200,
        height: 630,
        alt: 'Authentic Ukrainian Honey Cake (Medovik) - Traditional Recipe',
        type: 'image/jpeg'
      }
    ],
    locale: 'en_GB',
    type: 'article'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Honey Cake | Authentic Ukrainian Medovik Leeds',
    description: 'Authentic honey cake (Medovik) in Leeds. Traditional Ukrainian recipe, handmade with real honey. 8 delicate layers soaked overnight.',
    images: [`${BUSINESS_CONSTANTS.BASE_URL}/images/honey-cake-medovik.jpg`]
  },
  alternates: {
    canonical: `${BUSINESS_CONSTANTS.BASE_URL}/honey-cake`
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

export default function HoneyCakePage() {
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Honey Cake (Medovik): Complete Guide to Traditional Ukrainian Honey Cake',
    description: 'Discover authentic Ukrainian honey cake (Medovik) - what it is, its history, how it\'s made, and where to order the best honey cake in Leeds.',
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
    url: `${BUSINESS_CONSTANTS.BASE_URL}/honey-cake`
  }

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Ukrainian Honey Cake (Medovik)',
    description: 'Traditional Ukrainian honey cake with 8 delicate honey-soaked layers and rich cream filling. Handmade with real Yorkshire honey using authentic Ukrainian recipe.',
    image: `${BUSINESS_CONSTANTS.BASE_URL}/images/placeholder-cake.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'Olgish Cakes'
    },
    offers: {
      '@type': 'Offer',
      price: '40',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: `${BUSINESS_CONSTANTS.BASE_URL}/cakes/honey-cake-medovik`
    }
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is honey cake (Medovik)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Honey cake, called Medovik in Ukrainian and Russian, is a traditional layered cake with 8-12 thin honey-infused layers alternated with cream filling. The layers are soaked overnight, becoming incredibly soft and flavourful. It\'s one of the most beloved desserts in Ukraine and Eastern Europe.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long does honey cake last?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Honey cake stays fresh in the refrigerator for 5-7 days when stored in an airtight container. In fact, many people say it tastes even better after a few days as the flavours develop further. You can also freeze individual slices for up to 3 months.'
        }
      },
      {
        '@type': 'Question',
        name: 'Why is honey cake soaked overnight?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Soaking overnight allows the cream to penetrate the layers fully, softening them and creating the signature melt-in-your-mouth texture. The honey layers also absorb the cream\'s moisture, creating perfect balance between the layers and filling. This process cannot be rushed - it\'s essential for authentic honey cake.'
        }
      },
      {
        '@type': 'Question',
        name: 'What makes authentic honey cake special?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Authentic honey cake uses real honey in the layers, not just sugar. The layers must be rolled paper-thin by hand. Traditional recipes use sour cream or condensed milk in the filling, creating subtle sweetness. The overnight soaking process is crucial. These traditional methods create a taste and texture you cannot achieve with modern shortcuts.'
        }
      },
      {
        '@type': 'Question',
        name: 'Where can I buy authentic honey cake in Leeds?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Olgish Cakes makes authentic Ukrainian honey cake in Leeds using traditional family recipes. Every honey cake is handmade with real Yorkshire honey and soaked overnight for perfect texture. Order online or call ${BUSINESS_CONSTANTS.PHONE} for same-day delivery across Leeds.`
        }
      }
    ]
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
        name: 'Honey Cake',
        item: `${BUSINESS_CONSTANTS.BASE_URL}/honey-cake`
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
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
              { label: 'Honey Cake', href: '/honey-cake' }
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
              Honey Cake (Medovik)
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
              The ultimate guide to authentic Ukrainian honey cake - history, tradition, and where to order
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip label="Traditional Recipe" sx={{ bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 'bold' }} />
              <Chip label="Real Honey" sx={{ bgcolor: 'white', color: 'primary.main' }} />
              <Chip label="8 Delicate Layers" sx={{ bgcolor: 'white', color: 'primary.main' }} />
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {/* Introduction */}
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Honey cake, called Medovik in Ukrainian, is the most famous Ukrainian and Russian dessert. This isn't just any cake - it's a cultural treasure that Ukrainian families have been making for generations. Every bite tells a story of tradition, skill, and the magic that happens when you combine honey, cream, and time.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              What makes honey cake so special? It's not about fancy decorations or bright colours. The beauty of honey cake is in its simplicity and sophistication. Eight to twelve paper-thin honey layers, soaked overnight in rich cream filling, creating a texture that melts in your mouth. The flavour is subtle and refined - not too sweet, with the gentle taste of real honey coming through in every bite.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              I learned to make honey cake from my grandmother in Ukraine. She learned from her mother, who learned from her mother before. The recipe has been in my family for generations. Now I make authentic honey cake in Leeds, keeping this Ukrainian tradition alive and sharing it with Yorkshire people who appreciate real, handmade desserts.
            </Typography>
          </Paper>

          {/* What is Honey Cake */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-alice)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            What is Honey Cake (Medovik)?
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Honey cake is a layered dessert made with thin honey-infused sponge layers and cream filling. The word "Medovik" comes from "med" (мед), which means honey in Ukrainian and Russian. But calling it just a "layered cake" doesn't do it justice - that's like calling a symphony "organized sounds."
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              The layers are what make honey cake unique. Each layer is rolled incredibly thin - about 2-3 millimeters. When you cut a slice, you can count 8, 10, sometimes 12 distinct layers. These aren't thick sponge layers like British cakes. They're delicate, crisp when first baked, and then transform into something magical after soaking in cream overnight.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              The filling is just as important. Traditional honey cake uses sour cream or cream made with condensed milk - not buttercream. This creates a lighter, more refined taste. The cream soaks into the honey layers overnight, softening them while the honey flavour permeates the cream. After this soaking process, the layers and cream become one harmonious dessert.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              Many people ask me if honey cake is like British layer cakes. No. British cakes have thick sponge layers with buttercream. They're made quickly. Honey cake requires two days - one day to make and assemble, one day to soak. You cannot rush authentic honey cake. That patience is what creates its unique texture and taste.
            </Typography>
          </Paper>

          {/* History and Legend */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-alice)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            The Legend of Honey Cake
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Every Ukrainian knows the legend of how honey cake was created. In the 19th century, there was a Russian empress who absolutely hated honey. She refused to eat anything with honey in it. This made life difficult for the imperial chefs, who had to avoid honey in all desserts.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              One day, a young chef decided to create a new cake. He mixed honey into thin layers of dough and layered them with cream. When the empress tasted this cake, she fell in love with it immediately. She declared it the best dessert she'd ever eaten. Only then did the nervous chef confess that it was made with honey - the ingredient she claimed to hate.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Instead of being angry, the empress was amazed. The honey in the cake tasted completely different from raw honey - it was subtle, sophisticated, transformed by the baking process. She ordered honey cake to be made regularly for the imperial court. From there, it spread throughout Russia and Ukraine, becoming one of the most beloved desserts in Eastern Europe.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              Like many legends, this story might be partly myth. But it captures something true about honey cake - the honey flavour is so refined and sophisticated that even people who don't usually like honey fall in love with this cake. I see this happen all the time when people in Leeds try my honey cake for the first time.
            </Typography>
          </Paper>

          {/* How Honey Cake is Made */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-alice)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            How Traditional Honey Cake is Made
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: '1.1rem' }}>
              Making authentic honey cake is not quick or easy. It requires skill, patience, and understanding of traditional techniques. Here's what goes into every honey cake I make:
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalDiningIcon sx={{ fontSize: '2rem', color: 'secondary.main' }} />
                    The Honey Dough
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    The dough is made with real honey, butter, eggs, flour, and a bit of baking soda. The honey is heated with butter and sugar, creating a warm mixture. When baking soda is added, it bubbles and creates a special texture. This warm honey mixture is mixed with flour to create a dough that's workable but not too soft.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DesignServicesIcon sx={{ fontSize: '2rem', color: 'secondary.main' }} />
                    Rolling the Layers
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    This is where skill matters. The dough is divided into 8-10 portions. Each portion must be rolled paper-thin - about 2-3 millimeters. Too thick and the layers won't soak properly. Too thin and they'll break. Rolling perfectly even layers takes years of practice. I learned by watching my grandmother's hands.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <KitchenIcon sx={{ fontSize: '2rem', color: 'secondary.main' }} />
                    Baking Each Layer
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Each layer is baked individually at high temperature for just 3-4 minutes. They come out crispy, golden, and fragrant with honey aroma. The edges are trimmed to make perfect circles. Those trimmed edges aren't wasted - they're crushed into crumbs for decorating the cake later.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <OpacityIcon sx={{ fontSize: '2rem', color: 'secondary.main' }} />
                    The Cream Filling
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Traditional honey cake cream is made with sour cream and condensed milk. Some recipes use only sour cream. I use a combination that creates perfect balance - rich but not heavy, sweet but not cloying. The cream must be smooth and spreadable, not too thick or too thin.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CakeIcon sx={{ fontSize: '2rem', color: 'secondary.main' }} />
                    Assembly
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Each layer is spread with cream and stacked carefully. The cream must be distributed evenly. Too much and the cake becomes too soft. Too little and the layers won't soak properly. The top and sides are covered with cream, then decorated with the crushed honey crumbs from the trimmed edges.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: '2rem', color: 'secondary.main' }} />
                    Overnight Soaking
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    The assembled cake goes in the refrigerator for at least 12 hours, preferably 24 hours. This is the most important step. During this time, the cream soaks into the layers, softening them and allowing flavours to meld. Fresh honey cake is good. Properly soaked honey cake is magical.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Types of Honey Cake */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-alice)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Different Types of Honey Cake
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: '1.1rem' }}>
              While traditional honey cake follows the classic recipe, different regions and families have their own variations:
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Classic Medovik
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    The traditional version with sour cream filling. This is the most authentic style, beloved in Ukraine. The sour cream adds a slight tanginess that balances the honey sweetness perfectly.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Condensed Milk Version
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    Uses condensed milk in the cream, creating a sweeter, richer flavour. This version is popular in Russia and Ukraine. The condensed milk also helps the cream hold its shape better.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Chocolate Honey Cake
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    Adds cocoa to the honey layers, creating a darker, more complex flavour. The chocolate enhances the honey without overpowering it. This modern twist is becoming popular with younger generations.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Honey Cake with Nuts
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    Adds crushed walnuts or hazelnuts to the cream layers. The nuts add crunch and complement the honey flavour beautifully. Some families include nuts in their traditional recipe.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Why Order from Olgish Cakes */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-alice)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Why Order Honey Cake from Olgish Cakes?
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={3}>
              {[
                'Authentic Ukrainian recipe from my grandmother',
                'Made with real Yorkshire honey, not artificial flavouring',
                'Each layer rolled paper-thin by hand',
                'Soaked overnight for perfect texture',
                'Fresh ingredients - no preservatives',
                'Made to order - never frozen',
                'Same-day delivery available in Leeds',
                '127+ five-star reviews'
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

            <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem', mb: 2 }}>
                <strong>I'm the only baker in Leeds making authentic Ukrainian honey cake the traditional way.</strong> Other bakeries might offer "honey cake," but it's not the same. They use shortcuts - thick layers, buttercream instead of proper cream, no overnight soaking. That's not real Medovik.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                When you order my <Link href="/cakes/honey-cake-medovik" style={{ textDecoration: 'none' }}>
              <MuiLink underline="always" sx={{ color: colors.primary.main, fontWeight: 'bold' }}>honey cake</MuiLink>
            </Link>, you get the real thing - made exactly how my grandmother taught me, with the same care and attention that Ukrainian families have used for generations.
              </Typography>
            </Box>
          </Paper>

          {/* FAQ Section */}
          <Typography variant="h2" component="h2" sx={{ fontFamily: 'var(--font-alice)', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 600, color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Honey Cake Questions Answered
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, mb: 6, backgroundColor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            {[
              {
                question: 'What is honey cake (Medovik)?',
                answer: 'Honey cake, called Medovik in Ukrainian and Russian, is a traditional layered cake with 8-12 thin honey-infused layers alternated with cream filling. The layers are soaked overnight, becoming incredibly soft and flavourful. It\'s one of the most beloved desserts in Ukraine and Eastern Europe.'
              },
              {
                question: 'How long does honey cake last?',
                answer: 'Honey cake stays fresh in the refrigerator for 5-7 days when stored in an airtight container. In fact, many people say it tastes even better after a few days as the flavours develop further. You can also freeze individual slices for up to 3 months.'
              },
              {
                question: 'Why is honey cake soaked overnight?',
                answer: 'Soaking overnight allows the cream to penetrate the layers fully, softening them and creating the signature melt-in-your-mouth texture. The honey layers also absorb the cream\'s moisture, creating perfect balance between the layers and filling. This process cannot be rushed - it\'s essential for authentic honey cake.'
              },
              {
                question: 'What makes authentic honey cake special?',
                answer: 'Authentic honey cake uses real honey in the layers, not just sugar. The layers must be rolled paper-thin by hand. Traditional recipes use sour cream or condensed milk in the filling, creating subtle sweetness. The overnight soaking process is crucial. These traditional methods create a taste and texture you cannot achieve with modern shortcuts.'
              },
              {
                question: 'Is honey cake very sweet?',
                answer: 'No! That\'s one of the beautiful things about honey cake. Unlike many Western cakes, it\'s not overly sweet. The honey provides subtle, sophisticated sweetness. The sour cream in traditional recipes adds balance. Even people who don\'t usually like sweet desserts often love honey cake because the flavours are so refined.'
              },
              {
                question: 'Can I order honey cake for special occasions?',
                answer: 'Absolutely! Honey cake is perfect for birthdays, anniversaries, weddings, and any celebration. I can make it in different sizes and add custom decorations. Many Ukrainian families order honey cake for important celebrations because it\'s traditional and meaningful. Order at least 2 days ahead for special occasions.'
              },
              {
                question: 'Where can I buy authentic honey cake in Leeds?',
                answer: (
                  <>
                    Olgish Cakes makes authentic Ukrainian honey cake in Leeds using traditional family recipes. Every honey cake is handmade with real Yorkshire honey and soaked overnight for perfect texture. Order online or call <MuiLink href={`tel:${BUSINESS_CONSTANTS.PHONE}`} underline="always" sx={{ color: colors.primary.main }}>{BUSINESS_CONSTANTS.PHONE}</MuiLink> for same-day delivery across Leeds.
                  </>
                )
              }
            ].map((faq, idx) => (
              <Accordion key={idx} elevation={0} sx={{ mb: 2, '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          {/* CTA Section */}
          <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, px: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 'bold', mb: 3 }}>
              Ready to Try Authentic Honey Cake?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', maxWidth: '700px', mx: 'auto' }}>
              Order traditional Ukrainian honey cake made with real Yorkshire honey. Each cake is handmade to order and soaked overnight for perfect flavour. Same-day delivery available across Leeds.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/cakes/honey-cake-medovik" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
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
                Order Honey Cake Now
              </Button>
            </Link>
              <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': { borderColor: 'secondary.main', bgcolor: 'white', color: 'primary.main' }
                }}>
                View All Cakes
              </Button>
            </Link>
            </Box>
          </Box>
        </Container>
      </main>
    </>
  )
}

