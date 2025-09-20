import { Metadata } from "next";
import Link from "next/link";
import { Button, Typography, Card, CardContent, Chip } from "@mui/material";
import { Box } from "@mui/material";

export const metadata: Metadata = {
  title: "Valentine's Day Cakes Leeds | Romantic Cakes",
  description:
    "Order beautiful Valentine's Day cakes in Leeds. Romantic heart-shaped cakes, chocolate lovers cakes, and custom designs. Same-day delivery available in Leeds and around areas.",
  keywords:
    "valentine's day cakes leeds, romantic cakes, heart shaped cakes, chocolate cakes, valentine cakes delivery leeds",
  openGraph: {
    title: "Valentine's Day Cakes Leeds | Romantic Cakes",
    description:
      "Order beautiful Valentine's Day cakes in Leeds. Romantic heart-shaped cakes, chocolate lovers cakes, and custom designs.",
    type: "website",
    url: "https://olgishcakes.co.uk/valentines-cakes-leeds",
    images: [
      {
        url: "/images/cakes/valentine-cake.jpg",
        width: 1200,
        height: 630,
        alt: "Valentine's Day Cake Leeds",
      },
    ],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/valentines-cakes-leeds",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Valentine's Day Cakes Leeds",
  description:
    "Custom Valentine's Day cakes in Leeds with romantic designs, heart shapes, and chocolate flavors. Same-day delivery available.",
  provider: {
    "@type": "LocalBusiness",
    name: "Olgish Cakes",
    telephone: "+44 786 721 8194",
    email: "hello@olgishcakes.co.uk",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Allerton Grange",
      addressLocality: "Leeds",
      postalCode: "LS17",
      addressRegion: "West Yorkshire",
      addressCountry: "GB",
    },
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
  },
  serviceType: "Valentine's Day Cake Delivery",
  areaServed: "Leeds",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://olgishcakes.co.uk/valentines-cakes-leeds",
  },
};

const valentineCakes = [
  {
    name: "Heart of Chocolate",
    description: "Rich chocolate cake with chocolate ganache and fresh strawberries",
    price: "£45",
    features: ["Heart-shaped", "Chocolate ganache", "Fresh strawberries", "Romantic decoration"],
  },
  {
    name: "Love in Bloom",
    description: "Vanilla cake with rose-flavored buttercream and edible flowers",
    price: "£50",
    features: ["Rose buttercream", "Edible flowers", "Elegant design", "Perfect for romance"],
  },
  {
    name: "Sweet Romance",
    description: "Red velvet cake with cream cheese frosting and gold accents",
    price: "£55",
    features: ["Red velvet", "Cream cheese frosting", "Gold decoration", "Classic romantic"],
  },
  {
    name: "Chocolate Lovers Dream",
    description: "Triple chocolate cake with chocolate mousse and chocolate shavings",
    price: "£60",
    features: [
      "Triple chocolate",
      "Chocolate mousse",
      "Luxury design",
      "Chocolate lover's paradise",
    ],
  },
];

export default function ValentinesCakesLeedsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Typography
            variant="h1"
            component="h1"
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Valentine's Day Cakes
            <span className="block text-red-600">Leeds</span>
          </Typography>
          <Typography
            variant="h2"
            component="h2"
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Celebrate love with my beautiful Valentine's Day cakes. From romantic heart-shaped
            designs to luxurious chocolate creations, I'll make your special day unforgettable.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cakes" aria-label="Browse our Valentine's Day cake collection">
              <Button
                size="large"
                sx={{ bgcolor: "red.600", "&:hover": { bgcolor: "red.700" }, color: "white" }}
              >
                Browse Valentine's Cakes
              </Button>
            </Link>
            <Link href="/contact" aria-label="Contact me for custom Valentine's Day cake design">
              <Button
                size="large"
                variant="outlined"
                sx={{
                  borderColor: "red.600",
                  color: "red.600",
                  "&:hover": { bgcolor: "red.600", color: "white" },
                }}
              >
                Custom Design
              </Button>
            </Link>
          </div>
        </section>

        {/* Popular Valentine's Cakes */}
        <section className="mb-16">
          <Typography variant="h3" className="text-3xl font-bold text-center mb-12">
            Popular Valentine's Day Cakes
          </Typography>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valentineCakes.map((cake, index) => (
              <Card
                key={index}
                sx={{
                  overflow: "hidden",
                  "&:hover": { boxShadow: 6 },
                  transition: "box-shadow 0.3s",
                }}
              >
                <CardContent>
                  <Typography variant="h4" component="h3" color="primary" className="text-xl mb-2">
                    {cake.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-4">
                    {cake.description}
                  </Typography>
                  <Typography
                    variant="h4"
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
                    sx={{ width: "100%", bgcolor: "red.600", "&:hover": { bgcolor: "red.700" } }}
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
          <Box sx={{ bgcolor: "red.600", borderRadius: 2, p: 4, color: "white" }}>
            <Typography variant="h3" className="text-3xl font-bold mb-4">
              Make This Valentine's Day Special
            </Typography>
            <Typography variant="h4" component="h3" className="text-xl mb-6">
              Order your perfect Valentine's Day cake today and make your celebration unforgettable.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cakes" aria-label="Browse our complete cake collection">
                <Button
                  size="large"
                  sx={{ bgcolor: "white", color: "red.600", "&:hover": { bgcolor: "gray.100" } }}
                >
                  Browse All Cakes
                </Button>
              </Link>
              <Link href="/contact" aria-label="Contact me for custom cake design">
                <Button
                  size="large"
                  variant="outlined"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": { bgcolor: "white", color: "red.600" },
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
