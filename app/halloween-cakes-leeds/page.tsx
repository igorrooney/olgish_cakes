import { Metadata } from "next";
import Link from "next/link";
import { Button, Typography, Card, CardContent, Chip } from "@mui/material";
import { Box } from "@mui/material";

export const metadata: Metadata = {
  title: "Halloween Cakes Leeds | Spooky Custom Cakes | Olgish Cakes",
  description:
    "Order spooky Halloween cakes in Leeds. Pumpkin cakes, ghost designs, and Halloween-themed creations. Same-day delivery available in Leeds and surrounding areas.",
  keywords:
    "halloween cakes leeds, spooky cakes, pumpkin cakes, ghost cakes, halloween cake delivery leeds",
  openGraph: {
    title: "Halloween Cakes Leeds | Spooky Custom Cakes",
    description:
      "Order spooky Halloween cakes in Leeds. Pumpkin cakes, ghost designs, and Halloween-themed creations.",
    type: "website",
    url: "https://olgishcakes.co.uk/halloween-cakes-leeds",
    images: [
      {
        url: "/images/cakes/halloween-cake.jpg",
        width: 1200,
        height: 630,
        alt: "Halloween Cake Leeds",
      },
    ],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/halloween-cakes-leeds",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Halloween Cakes Leeds",
  description:
    "Spooky Halloween cakes in Leeds with pumpkin designs, ghost decorations, and Halloween themes. Perfect for parties and celebrations.",
  provider: {
    "@type": "LocalBusiness",
    name: "Olgish Cakes",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Leeds",
      addressRegion: "West Yorkshire",
      addressCountry: "GB",
    },
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
  },
  serviceType: "Halloween Cake Delivery",
  areaServed: "Leeds",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://olgishcakes.co.uk/halloween-cakes-leeds",
  },
};

const halloweenCakes = [
  {
    name: "Spooky Pumpkin Cake",
    description: "Pumpkin-shaped cake with orange frosting and spooky decorations",
    price: "£45",
    features: ["Pumpkin shape", "Orange frosting", "Spooky decorations", "Perfect for Halloween"],
  },
  {
    name: "Ghostly Delight",
    description: "White cake with ghost decorations and eerie mist effects",
    price: "£50",
    features: ["Ghost decorations", "White frosting", "Mist effects", "Eerie design"],
  },
  {
    name: "Witch's Cauldron",
    description: "Chocolate cake shaped like a cauldron with bubbling effects",
    price: "£55",
    features: ["Cauldron shape", "Chocolate cake", "Bubbling effects", "Witch theme"],
  },
  {
    name: "Monster Mash",
    description: "Colorful cake with monster faces and Halloween candy",
    price: "£60",
    features: ["Monster faces", "Colorful design", "Halloween candy", "Fun for kids"],
  },
];

export default function HalloweenCakesLeedsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
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
            Halloween Cakes
            <span className="block text-purple-600">Leeds</span>
          </Typography>
          <Typography variant="h5" className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get spooky with our Halloween cakes! From pumpkin designs to ghostly creations, we'll
            make your Halloween party unforgettable.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cakes">
              <Button
                size="large"
                sx={{ bgcolor: "purple.600", "&:hover": { bgcolor: "purple.700" }, color: "white" }}
              >
                Browse Halloween Cakes
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="large"
                variant="outlined"
                sx={{
                  borderColor: "purple.600",
                  color: "purple.600",
                  "&:hover": { bgcolor: "purple.600", color: "white" },
                }}
              >
                Custom Design
              </Button>
            </Link>
          </div>
        </section>

        {/* Popular Halloween Cakes */}
        <section className="mb-16">
          <Typography variant="h3" className="text-3xl font-bold text-center mb-12">
            Spooky Halloween Cakes
          </Typography>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {halloweenCakes.map((cake, index) => (
              <Card
                key={index}
                sx={{
                  overflow: "hidden",
                  "&:hover": { boxShadow: 6 },
                  transition: "box-shadow 0.3s",
                }}
              >
                <CardContent>
                  <Typography variant="h5" color="primary" className="text-xl mb-2">
                    {cake.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-4">
                    {cake.description}
                  </Typography>
                  <Typography variant="h4" className="text-2xl font-bold text-gray-900 mb-4">
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
                      bgcolor: "purple.600",
                      "&:hover": { bgcolor: "purple.700" },
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
          <Box sx={{ bgcolor: "purple.600", borderRadius: 2, p: 4, color: "white" }}>
            <Typography variant="h3" className="text-3xl font-bold mb-4">
              Make Your Halloween Spooky
            </Typography>
            <Typography variant="h5" className="text-xl mb-6">
              Order your Halloween cake today and make your celebration frightfully fun!
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cakes">
                <Button
                  size="large"
                  sx={{ bgcolor: "white", color: "purple.600", "&:hover": { bgcolor: "gray.100" } }}
                >
                  Browse All Cakes
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="large"
                  variant="outlined"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": { bgcolor: "white", color: "purple.600" },
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
