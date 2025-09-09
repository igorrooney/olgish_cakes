import { Metadata } from "next";
import Link from "next/link";
import { Button, Typography, Card, CardContent, Chip } from "@mui/material";
import { Box } from "@mui/material";

export const metadata: Metadata = {
  title: "Easter Cakes Leeds | Traditional Ukrainian Easter Cakes | Olgish Cakes",
  description:
    "Order traditional Ukrainian Easter cakes in Leeds. Paska, babka, and Easter-themed cakes with authentic recipes. Same-day delivery available in Leeds and surrounding areas.",
  keywords:
    "easter cakes leeds, ukrainian easter cakes, paska, babka, traditional easter cakes, easter cake delivery leeds",
  openGraph: {
    title: "Easter Cakes Leeds | Traditional Ukrainian Easter Cakes",
    description:
      "Order traditional Ukrainian Easter cakes in Leeds. Paska, babka, and Easter-themed cakes with authentic recipes.",
    type: "website",
    url: "https://olgishcakes.co.uk/easter-cakes-leeds",
    images: [
      {
        url: "/images/cakes/easter-cake.jpg",
        width: 1200,
        height: 630,
        alt: "Easter Cake Leeds",
      },
    ],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/easter-cakes-leeds",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Easter Cakes Leeds",
  description:
    "Traditional Ukrainian Easter cakes in Leeds including Paska and Babka. Authentic recipes and Easter-themed designs.",
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
  serviceType: "Easter Cake Delivery",
  areaServed: "Leeds",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://olgishcakes.co.uk/easter-cakes-leeds",
  },
};

const easterCakes = [
  {
    name: "Traditional Paska",
    description: "Authentic Ukrainian Easter bread with rich, sweet dough and decorative cross",
    price: "£35",
    features: ["Traditional recipe", "Sweet dough", "Decorative cross", "Easter symbols"],
  },
  {
    name: "Babka Easter Cake",
    description: "Classic Ukrainian babka with raisins, nuts, and Easter decorations",
    price: "£40",
    features: ["Raisins and nuts", "Rich flavor", "Easter decorations", "Traditional recipe"],
  },
  {
    name: "Easter Honey Cake",
    description: "Ukrainian honey cake with layers of sweet honey cream",
    price: "£45",
    features: ["Honey layers", "Sweet cream", "Easter design", "Traditional Ukrainian"],
  },
  {
    name: "Spring Flower Cake",
    description: "Light vanilla cake decorated with spring flowers and Easter eggs",
    price: "£50",
    features: ["Spring flowers", "Easter eggs", "Light vanilla", "Beautiful decoration"],
  },
];

export default function EasterCakesLeedsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Typography
            variant="h2"
            component="h1"
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Easter Cakes
            <span className="block text-green-600">Leeds</span>
          </Typography>
          <Typography
            variant="h2"
            component="h2"
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Celebrate Easter with our traditional Ukrainian Easter cakes. From authentic Paska to
            beautiful Easter-themed designs, we'll make your celebration special.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cakes" aria-label="Browse our Easter cake collection">
              <Button
                size="large"
                sx={{ bgcolor: "green.600", "&:hover": { bgcolor: "green.700" }, color: "white" }}
              >
                Browse Easter Cakes
              </Button>
            </Link>
            <Link href="/contact" aria-label="Contact us for custom Easter cake design">
              <Button
                size="large"
                variant="outlined"
                sx={{
                  borderColor: "green.600",
                  color: "green.600",
                  "&:hover": { bgcolor: "green.600", color: "white" },
                }}
              >
                Custom Design
              </Button>
            </Link>
          </div>
        </section>

        {/* Popular Easter Cakes */}
        <section className="mb-16">
          <Typography variant="h3" className="text-3xl font-bold text-center mb-12">
            Traditional Easter Cakes
          </Typography>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {easterCakes.map((cake, index) => (
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
                    variant="h5"
                    component="h5"
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
                    sx={{
                      width: "100%",
                      bgcolor: "green.600",
                      "&:hover": { bgcolor: "green.700" },
                    }}
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
          <Box sx={{ bgcolor: "green.600", borderRadius: 2, p: 4, color: "white" }}>
            <Typography variant="h3" className="text-3xl font-bold mb-4">
              Celebrate Easter with Tradition
            </Typography>
            <Typography variant="h4" component="h3" className="text-xl mb-6">
              Order your traditional Ukrainian Easter cakes today and make your celebration
              authentic and special.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cakes" aria-label="Browse our complete cake collection">
                <Button
                  size="large"
                  sx={{ bgcolor: "white", color: "green.600", "&:hover": { bgcolor: "gray.100" } }}
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
                    "&:hover": { bgcolor: "white", color: "green.600" },
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
