import { Container, Grid, Typography, Box } from "@/lib/mui-optimization";
import CakeCard from "../components/CakeCard";
import { getAllCakes, getRevalidateTime } from "../utils/fetchCakes";
import Loading from "@/app/components/Loading";
import HeroSection from "./HeroSection";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Metadata } from "next";

// Enable revalidation for this page
export const revalidate = getRevalidateTime();

// Force static generation
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: "Ukrainian Cakes Leeds | Authentic Medovik & Kyiv Cake from £25",
  description:
    "★★★★★ Authentic Ukrainian cakes in Leeds from £25. Traditional honey cake (Medovik), Kyiv cake, Napoleon. 127+ 5-star reviews. Same-day delivery. Order now!",
  keywords:
    "Ukrainian cakes, ukrainian cakes Leeds, authentic ukrainian cakes, ukrainian bakery near me, honey cake, Medovik, Kyiv cake, traditional Ukrainian cakes, Ukrainian desserts Leeds, real Ukrainian cakes, Ukrainian baker Leeds, authentic Medovik",
  openGraph: {
    title: "Ukrainian Cakes Leeds | Authentic Medovik & Kyiv Cake from £25",
    description:
      "★★★★★ Authentic Ukrainian cakes in Leeds from £25. Traditional honey cake (Medovik), Kyiv cake, Napoleon. 127+ 5-star reviews. Same-day delivery. Order now!",
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
    title: "Ukrainian Cakes Leeds | Authentic Medovik & Kyiv Cake from £25",
    description:
      "★★★★★ Authentic Ukrainian cakes in Leeds from £25. Traditional honey cake (Medovik), Kyiv cake, Napoleon. 127+ 5-star reviews. Same-day delivery. Order now!",
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
      "Authentic Ukrainian cakes made with love in Leeds. Traditional recipes, premium ingredients, and exceptional taste.",
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
          <Typography variant="h2" component="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 6, textAlign: "center" }}>
            Our Ukrainian Cake Collection
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
            <Typography variant="h2" component="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Authentic Ukrainian Cakes in Leeds
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem", textAlign: "left" }}>
              Welcome to the only authentic Ukrainian bakery in Leeds specializing in traditional Ukrainian cakes. Every cake I make follows recipes passed down through generations of my family in Ukraine. My Ukrainian cakes aren't just desserts - they're a taste of Ukrainian heritage, made with love and traditional techniques you won't find anywhere else in Leeds.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: "1.1rem", textAlign: "left" }}>
              What makes Ukrainian cakes different from British cakes? Ukrainian cakes like Medovik (honey cake) and Kyiv cake have unique flavors and textures perfected over centuries. The honey cake features delicate layers soaked in real honey overnight, creating a melt-in-your-mouth experience. Kyiv cake combines meringue, hazelnuts, and chocolate in a way that's sophisticated yet comforting. These aren't mass-produced supermarket cakes - every Ukrainian cake is handmade using premium ingredients and traditional methods.
            </Typography>
          </Box>

          <Box sx={{ mb: 8 }}>
            <Typography variant="h2" component="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
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
            <Typography variant="h2" component="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
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
