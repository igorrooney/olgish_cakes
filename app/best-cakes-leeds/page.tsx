import { Metadata } from "next";
import Link from "next/link";
import { Button, Typography, Card, CardContent, Chip } from "@mui/material";
import { Box } from "@mui/material";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Best Cakes Leeds | Top Rated Ukrainian Cakes | Olgish Cakes",
  description:
    "Discover the best cakes in Leeds! Award-winning Ukrainian cakes, traditional recipes, and custom designs. Rated #1 by customers. Same-day delivery available.",
  keywords:
    "best cakes leeds, top cakes leeds, ukrainian cakes leeds, award winning cakes, best bakery leeds",
  openGraph: {
    title: "Best Cakes Leeds | Top Rated Ukrainian Cakes",
    description:
      "Discover the best cakes in Leeds! Award-winning Ukrainian cakes, traditional recipes, and custom designs.",
    type: "website",
    url: "https://olgishcakes.co.uk/best-cakes-leeds",
    images: [
      {
        url: "/images/cakes/best-cake.jpg",
        width: 1200,
        height: 630,
        alt: "Best Cakes Leeds",
      },
    ],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/best-cakes-leeds",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Olgish Cakes - Best Cakes in Leeds",
  description:
    "Award-winning Ukrainian cakes in Leeds. Traditional recipes, custom designs, and exceptional quality.",
  url: "https://olgishcakes.co.uk",
  telephone: "+44 786 721 8194",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Leeds",
    addressRegion: "West Yorkshire",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 53.8008,
    longitude: -1.5491,
  },
  openingHours: "Mo-Su 00:00-23:59",
  priceRange: "££",
  // Avoid duplicating aggregate ratings across multiple JSON-LD blocks
  mainEntityOfPage: {
    "@id": "https://olgishcakes.co.uk/#organization",
  },
  servesCuisine: "Ukrainian",
  areaServed: "Leeds",
};

const bestCakes = [
  {
    name: "Traditional Honey Cake",
    description: "Our signature Ukrainian honey cake with layers of sweet honey cream",
    rating: "5.0",
    reviews: "89",
    price: "£45",
    features: ["Traditional recipe", "Honey layers", "Sweet cream", "Customer favorite"],
  },
  {
    name: "Kyiv Cake",
    description: "Classic Ukrainian cake with hazelnut meringue and chocolate",
    rating: "5.0",
    reviews: "67",
    price: "£50",
    features: ["Hazelnut meringue", "Chocolate layers", "Traditional", "Premium quality"],
  },
  {
    name: "Wedding Cake Deluxe",
    description: "Elegant wedding cake with custom design and premium ingredients",
    rating: "5.0",
    reviews: "45",
    price: "£120",
    features: ["Custom design", "Premium ingredients", "Elegant decoration", "Wedding special"],
  },
  {
    name: "Birthday Celebration Cake",
    description: "Colorful birthday cake with fun decorations and great taste",
    rating: "4.8",
    reviews: "78",
    price: "£40",
    features: ["Colorful design", "Fun decorations", "Great taste", "Perfect for parties"],
  },
];

export default function BestCakesLeedsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Best Cakes Leeds" }]} />
        </Box>

        {/* Hero Section */}
        <section className="text-center mb-16">
          <Typography
            variant="h2"
            component="h1"
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Best Cakes
            <span className="block text-blue-600">Leeds</span>
          </Typography>
          <Typography
            variant="h2"
            component="h2"
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Discover the best Ukrainian cakes in Leeds. From traditional honey cake to custom
            designs, we create exceptional cakes for every celebration.
          </Typography>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">5</span>
              <span className="text-gray-600">/5</span>
            </div>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">127+ Reviews</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">Award Winning</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cakes" aria-label="Browse our best cake collection">
              <Button
                size="large"
                sx={{ bgcolor: "blue.600", "&:hover": { bgcolor: "blue.700" }, color: "white" }}
              >
                Browse Our Cakes
              </Button>
            </Link>
            <Link href="/contact" aria-label="Contact us for custom cake design">
              <Button
                size="large"
                variant="outlined"
                sx={{
                  borderColor: "blue.600",
                  color: "blue.600",
                  "&:hover": { bgcolor: "blue.600", color: "white" },
                }}
              >
                Order Custom Cake
              </Button>
            </Link>
          </div>
        </section>

        {/* Best Selling Cakes */}
        <section className="mb-16">
          <Typography variant="h3" className="text-3xl font-bold text-center mb-12">
            Our Best Selling Cakes
          </Typography>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestCakes.map((cake, index) => (
              <Card
                key={index}
                sx={{
                  overflow: "hidden",
                  "&:hover": { boxShadow: 6 },
                  transition: "box-shadow 0.3s",
                }}
              >
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{cake.rating}</span>
                    <span className="text-gray-500">({cake.reviews})</span>
                  </div>
                  <Typography variant="h3" component="h3" color="primary" className="text-xl mb-2">
                    {cake.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-4">
                    {cake.description}
                  </Typography>
                  <Typography
                    variant="h3"
                    component="h3"
                    className="text-2xl font-bold text-gray-900 mb-4"
                  >
                    {cake.price}
                  </Typography>
                  <div className="space-y-2 mb-4">
                    {cake.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">• {feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    sx={{ width: "100%", bgcolor: "blue.600", "&:hover": { bgcolor: "blue.700" } }}
                  >
                    Order Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Box sx={{ bgcolor: "blue.600", borderRadius: 2, p: 4, color: "white" }}>
            <Typography variant="h3" className="text-3xl font-bold mb-4">
              Experience the Best Cakes in Leeds
            </Typography>
            <Typography variant="h4" component="h3" className="text-xl mb-6">
              Join hundreds of satisfied customers who choose Olgish Cakes for their special
              occasions.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cakes" aria-label="Browse our complete cake collection">
                <Button
                  size="large"
                  sx={{ bgcolor: "white", color: "blue.600", "&:hover": { bgcolor: "gray.100" } }}
                >
                  Browse All Cakes
                </Button>
              </Link>
              <Link href="/contact" aria-label="Contact us for custom cake design">
                <Button
                  size="large"
                  variant="outlined"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": { bgcolor: "white", color: "blue.600" },
                  }}
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </Box>
        </section>
      </div>
    </div>
  );
}
