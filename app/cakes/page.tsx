import { Container, Grid, Typography, Box, Button, Paper } from "@/lib/mui-optimization";
import CakeCard from "../components/CakeCard";
import { getAllCakes } from "../utils/fetchCakes";
import HeroSection from "./HeroSection";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Metadata } from "next";
import Link from "next/link";

// Enable revalidation for this page
export const revalidate = 300; // 5 minutes

// Force static generation
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: "Traditional Ukrainian Cakes Leeds | Birthday & Wedding Cakes",
  description:
    "Authentic traditional Ukrainian cakes in Leeds from £25. Ukrainian birthday cakes, honey cake (Medovik), Kyiv cake. 127+ 5-star reviews. Order now!",
  keywords:
    "traditional Ukrainian cakes, ukrainian cakes Leeds, authentic ukrainian cakes, ukraine birthday cake, ukrainian birthday cakes, ukrainian bakery near me, honey cake, Medovik, Kyiv cake, Ukrainian wedding cakes, Ukrainian desserts Leeds, real Ukrainian cakes, Ukrainian baker Leeds, authentic Medovik, traditional medovik",
  openGraph: {
    title: "Traditional Ukrainian Cakes Leeds | Birthday & Wedding Cakes",
    description:
      "Authentic traditional Ukrainian cakes in Leeds from £25. Ukrainian birthday cakes, honey cake (Medovik), Kyiv cake. 127+ 5-star reviews. Order now!",
    url: "https://olgishcakes.co.uk/cakes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cakes-collection.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Cakes Collection - Honey Cake (Medovik) - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traditional Ukrainian Cakes Leeds | Birthday & Wedding Cakes",
    description:
      "Authentic traditional Ukrainian cakes in Leeds from £25. Ukrainian birthday cakes, honey cake (Medovik), Kyiv cake. 127+ 5-star reviews.",
    images: ["https://olgishcakes.co.uk/images/cakes-collection.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cakes",
  },
};

export default async function CakesPage() {
  // Force static data for build-time generation
  const cakes = await getAllCakes(false);

  // Local Business structured data
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Olgish Cakes",
    description:
      "Authentic traditional Ukrainian cakes made with love in Leeds. Traditional family recipes, premium ingredients, and exceptional taste. Specializing in Ukrainian birthday cakes, wedding cakes, and traditional honey cake (Medovik).",
    image: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
    url: "https://olgishcakes.co.uk",
    telephone: "+44 786 721 8194",
    email: "hello@olgishcakes.co.uk",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Allerton Grange",
      addressLocality: "Leeds",
      postalCode: "LS17",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "53.8008",
      longitude: "-1.5491",
    },
    openingHours: "Mo-Su 00:00-23:59",
    priceRange: "££",
    servesCuisine: "Ukrainian",
    hasMenu: "https://olgishcakes.co.uk/cakes",
    // Reference central organization for any ratings to avoid duplicate aggregate ratings
    mainEntityOfPage: {
      "@id": "https://olgishcakes.co.uk/#organization",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />
      <main className="min-h-screen bg-gray-50">
        <HeroSection />

        {/* Breadcrumbs */}
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "All Cakes", href: "/cakes" },
            ]}
          />
        </Container>

        {/* Cakes Collection - Moved to top */}
        <Container maxWidth="lg" className="py-8">
          <Typography variant="h2" component="h2" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 6, textAlign: "center" }}>
            Traditional Ukrainian Cake Collection
          </Typography>
          
          {/* Cakes Grid */}
          {!cakes || cakes.length === 0 ? (
            <Box className="text-center py-16">
              <Typography variant="h3" component="h3" className="mb-4 text-gray-700 font-light">
                Our Cake Collection
              </Typography>
              <Typography variant="body1" color="text.secondary" className="max-w-md mx-auto">
                We are currently preparing our cake collection. Please check back soon!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={6} className="mt-4">
              {cakes.map(cake => (
                <Grid item xs={12} sm={6} md={4} key={cake._id}>
                  <CakeCard cake={cake} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>

        {/* Ukrainian Cakes Information Section - Moved below cakes */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h2" component="h2" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Traditional Ukrainian Cakes in Leeds
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem", textAlign: "left" }}>
              Welcome to the only authentic Ukrainian bakery in Leeds specializing in traditional Ukrainian cakes. Every cake I make follows recipes passed down through generations of my family in Ukraine. My traditional Ukrainian cakes aren't just desserts - they're a piece of Ukrainian heritage, made with love and traditional baking techniques that have been perfected over centuries. You won't find these authentic methods anywhere else in Leeds.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem", textAlign: "left" }}>
              What makes traditional Ukrainian cakes different from British cakes? Ukrainian cakes like Medovik (honey cake) and Kyiv cake have unique flavors and textures perfected over generations. The traditional honey cake features 8-10 delicate layers soaked in real honey overnight, creating a melt-in-your-mouth experience. Traditional Kyiv cake combines meringue, hazelnuts, and chocolate in a way that's sophisticated yet comforting. These aren't mass-produced supermarket cakes - every traditional Ukrainian cake is handmade using premium ingredients and time-honored methods my grandmother taught me.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem", textAlign: "left" }}>
              Traditional Ukrainian baking is about patience and respect for ingredients. I roll each honey layer paper-thin by hand, exactly as it's done in Ukraine. The cakes soak overnight because that's how traditional Ukrainian cakes develop their special texture. I use real Yorkshire honey, organic eggs, and fresh cream - no artificial flavors or preservatives. This is how my family has made traditional Ukrainian cakes for generations, and this is how I make them in Leeds today.
            </Typography>
          </Box>

          {/* Ukrainian Birthday Cakes Section */}
          <Box sx={{ mb: 8, p: { xs: 4, md: 6 }, backgroundColor: "rgba(46, 49, 146, 0.05)", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h2" component="h2" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Ukrainian Birthday Cakes in Leeds
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Looking for Ukrainian birthday cake in Leeds? I create beautiful Ukrainian birthday cakes that combine traditional flavors with custom designs. Every Ukrainian birthday cake is special - whether you want traditional honey cake decorated for a birthday, or a custom-designed Ukrainian-style cake with your choice of flavors and decorations.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Ukrainian birthday cakes are different from British birthday cakes. Instead of heavy buttercream and thick sponge, Ukrainian birthday cakes have delicate layers with refined cream fillings. The flavors are sophisticated but not too sweet. Many people in Leeds tell me that Ukrainian birthday cakes remind them of celebrations from their childhood, while others discover these beautiful traditional cakes for the first time.
            </Typography>
            
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 3, height: "100%", backgroundColor: "white", borderRadius: 2 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                    Traditional Flavors
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    Choose from authentic Ukrainian flavors: honey cake (Medovik), Kyiv cake with hazelnuts and chocolate, Napoleon with vanilla custard, or chocolate Sacher. Every flavor is made using traditional Ukrainian methods.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 3, height: "100%", backgroundColor: "white", borderRadius: 2 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                    Custom Designs
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    Your Ukrainian birthday cake can be decorated exactly how you want. I create custom designs with fresh flowers, fruits, Ukrainian motifs, or modern minimalist styles. Tell me your vision and I'll make it real.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 3, height: "100%", backgroundColor: "white", borderRadius: 2 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
                    Made Fresh
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    Every Ukrainian birthday cake is made fresh to order, never frozen. I start baking 2 days before your celebration to ensure the layers have time to soak properly and the flavors develop perfectly.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem", fontStyle: "italic" }}>
                <strong>Perfect for:</strong> Adult birthdays, milestone celebrations, Ukrainian family gatherings, or anyone who appreciates sophisticated desserts. Prices for Ukrainian birthday cakes start from £45 for custom designs.
              </Typography>
              <Link href="/get-custom-quote" style={{ textDecoration: 'none' }}><Button variant="contained" color="primary" size="large" sx={{ px: 4, py: 2 }}>
                Order Ukrainian Birthday Cake
              </Button></Link>
            </Box>
          </Box>

          <Box sx={{ mb: 8 }}>
            <Typography variant="h2" component="h2" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Ukrainian Cake Comparison Guide
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Medovik (Honey Cake)",
                  description: "Traditional Ukrainian honey cake with thin layers soaked in honey and rich cream. Perfect for those who love subtle sweetness and sophisticated flavors.",
                  bestFor: "Adult celebrations, weddings, anniversaries",
                  price: "From £25",
                  servings: "8-12 people"
                },
                {
                  name: "Kyiv Cake",
                  description: "Legendary Ukrainian cake with hazelnut meringue layers, chocolate buttercream, and cashew coating. Rich and indulgent.",
                  bestFor: "Chocolate lovers, special occasions",
                  price: "From £30",
                  servings: "10-14 people"
                },
                {
                  name: "Napoleon Cake",
                  description: "Delicate puff pastry layers with vanilla custard cream. Light, crispy, and incredibly delicious. A Ukrainian classic.",
                  bestFor: "Tea parties, family gatherings",
                  price: "From £28",
                  servings: "8-12 people"
                }
              ].map((cake, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h3" component="h3" sx={{ fontWeight: 600, color: "primary.main", mb: 2, fontSize: "1.5rem" }}>
                      {cake.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {cake.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      Best For: <span style={{ fontWeight: 400 }}>{cake.bestFor}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      Price: <span style={{ fontWeight: 400 }}>{cake.price}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Servings: <span style={{ fontWeight: 400 }}>{cake.servings}</span>
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ mb: 8 }}>
            <Typography variant="h2" component="h2" sx={{ fontFamily: "var(--font-alice)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Why Choose Ukrainian Cakes?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Ukrainian cakes offer something you can't get from regular British cakes or supermarket desserts. The flavors are more complex, the textures more refined, and the heritage behind each recipe makes every bite special. My customers in Leeds tell me Ukrainian cakes remind them of family celebrations and create new memories for their own families. Whether you're Ukrainian living in Leeds and missing home, or you're discovering Ukrainian cakes for the first time, the authentic taste is unforgettable.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem" }}>
              I use only premium ingredients - real honey from Yorkshire beekeepers, organic eggs, fresh cream, and the highest quality flour and butter. No artificial flavors, no preservatives, no shortcuts. Each Ukrainian cake is made to order and delivered fresh. Prices start from just £25, making authentic Ukrainian cakes accessible for Leeds families who want something truly special for their celebrations.
            </Typography>
          </Box>
        </Container>
      </main>
    </>
  );
}
