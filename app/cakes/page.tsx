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
  title: "All Cakes | Ukrainian Cakes Collection",
  description:
    "Explore our complete collection of authentic Ukrainian cakes. Traditional honey cake (Medovik), Kyiv cake, wedding cakes, birthday cakes, and custom designs. Handcrafted in Leeds with premium ingredients.",
  keywords:
    "Ukrainian cakes collection, honey cake, Medovik, Kyiv cake, traditional Ukrainian cakes, custom cakes Leeds, wedding cakes, birthday cakes, Ukrainian bakery Leeds, authentic Ukrainian desserts",
  openGraph: {
    title: "All Cakes | Ukrainian Cakes Collection",
    description:
      "Explore our complete collection of authentic Ukrainian cakes. Traditional honey cake (Medovik), Kyiv cake, wedding cakes, birthday cakes, and custom designs.",
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
    title: "All Cakes | Ukrainian Cakes Collection",
    description:
      "Explore our complete collection of authentic Ukrainian cakes. Traditional honey cake (Medovik), Kyiv cake, wedding cakes, birthday cakes, and custom designs.",
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

        {/* Main Content */}
        <Container maxWidth="lg" className="py-16">
          {/* Cakes Grid */}
          {!cakes || cakes.length === 0 ? (
            <Box className="text-center py-16">
              <Typography variant="h2" component="h2" className="mb-4 text-gray-700 font-light">
                Our Cake Collection
              </Typography>
              <Typography variant="body1" color="text.secondary" className="max-w-md mx-auto">
                We are currently preparing our cake collection. Please check back soon!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={6} className="mt-8">
              {cakes.map(cake => (
                <Grid item xs={12} sm={6} md={4} key={cake._id}>
                  <CakeCard cake={cake} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </main>
    </>
  );
}
