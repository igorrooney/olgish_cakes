import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AreasWeCover } from "../components/AreasWeCover";
import Link from "next/link";
import { blocksToText } from "@/types/cake";
import { getPriceValidUntil } from "../utils/seo";

export const metadata: Metadata = {
  title:
    "Birthday Cakes Leeds – Custom Designs",
  description:
    "Custom birthday cakes in Leeds for children and adults. Themed designs, Ukrainian favorites like honey cake (Medovik), delivery available. Prices from £35.",
  keywords:
    "birthday cakes Leeds, themed birthday cakes Leeds, children birthday cakes Leeds, adult birthday cakes Leeds, Ukrainian honey cake birthday, Medovik birthday cake, birthday cake delivery Leeds",
  openGraph: {
    title:
      "Birthday Cakes Leeds – Custom Designs",
    description:
      "Custom birthday cakes for all ages with Ukrainian flavours like honey cake. Delivery available across Leeds.",
    url: "https://olgishcakes.co.uk/birthday-cakes",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/birthday-cakes.jpg",
        width: 1200,
        height: 630,
        alt: "Beautiful Birthday Cakes Leeds - Honey Cake (Medovik) - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Birthday Cakes Leeds – Custom Designs",
    description:
      "Custom birthday cakes with Ukrainian flavours. Delivery available across Leeds.",
    images: ["https://olgishcakes.co.uk/images/birthday-cakes.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/birthday-cakes",
  },
  authors: [{ name: "Olgish Cakes", url: "https://olgishcakes.co.uk" }],
  creator: "Olgish Cakes",
  publisher: "Olgish Cakes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://olgishcakes.co.uk"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "ggHjlSwV1aM_lVT4IcRSlUIk6Vn98ZbJ_FGCepoVi64",
  },
  other: {
    "geo.region": "GB-ENG",
    "geo.placename": "Leeds",
  },
};

export default async function BirthdayCakesPage() {
  const allCakes = await getAllCakes();
  const birthdayCakes = allCakes.filter(
    cake =>
      cake.category === "custom" ||
      cake.name.toLowerCase().includes("birthday") ||
      blocksToText(cake.description).toLowerCase().includes("birthday")
  );

  const birthdayServices = [
    {
      name: "Children's Birthday Cakes",
      description: "Colorful, fun, and themed birthday cakes perfect for children's parties",
      price: "From £35",
    },
    {
      name: "Adult Birthday Cakes",
      description: "Nice and sophisticated birthday cakes for adults",
      price: "From £45",
    },
    {
      name: "Themed Birthday Cakes",
      description: "Custom themed cakes based on hobbies and interests",
      price: "From £50",
    },
    {
      name: "Ukrainian Birthday Cakes",
      description: "Traditional Ukrainian birthday cakes like honey cake (Medovik)",
      price: "From £40",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Birthday Cakes Leeds",
    description:
      "Custom birthday cakes in Leeds for children and adults. Themed designs and Ukrainian flavours like honey cake (Medovik).",
    url: "https://olgishcakes.co.uk/birthday-cakes",
    provider: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
      },
    },
    areaServed: {
      "@type": "City",
      name: "Leeds",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Birthday Cake Services",
      itemListElement: birthdayServices.map(service => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          category: "Birthday Cake",
          provider: {
            "@type": "Organization",
            name: "Olgish Cakes",
          },
        },
        price: service.price,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        priceValidUntil: getPriceValidUntil(30),
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you make themed children's birthday cakes?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. I create custom themes tailored to your child's interests." }
      },
      {
        "@type": "Question",
        name: "Can you deliver birthday cakes in Leeds?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, delivery across Leeds is available. Same‑day may be possible—please ask." }
      },
      {
        "@type": "Question",
        name: "What are the starting prices?",
        acceptedAnswer: { "@type": "Answer", text: "Prices start from £35 for a 6‑inch cake. Final price depends on size and design." }
      }
    ]
  } as const;

  // Server-rendered Product list to avoid client-only JSON-LD being missed by crawlers
  const productListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Birthday Cakes",
    description:
      "Custom birthday cakes by Olgish Cakes. Traditional Ukrainian flavors and modern designs.",
    url: "https://olgishcakes.co.uk/birthday-cakes",
    itemListElement: birthdayCakes.map((cake: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: cake.name,
        image: (() => {
          // Import urlFor dynamically to avoid build issues
          let urlFor: any;
          try {
            urlFor = require('@/sanity/lib/image').urlFor;
          } catch (error) {
            // Fallback for build environments where dynamic import might fail
            urlFor = (image: any) => ({
              width: () => ({ height: () => ({ url: () => "https://olgishcakes.co.uk/images/placeholder-cake.jpg" }) })
            });
          }

          // Get the best available image
          const mainImage = cake.mainImage?.asset?._ref
            ? cake.mainImage
            : cake.designs?.standard?.find((img: any) => img.isMain && img.asset?._ref) ||
              cake.designs?.standard?.find((img: any) => img.asset?._ref) ||
              cake.designs?.standard?.[0] ||
              cake.designs?.individual?.find((img: any) => img.isMain && img.asset?._ref) ||
              cake.designs?.individual?.find((img: any) => img.asset?._ref) ||
              cake.designs?.individual?.[0];

          return mainImage?.asset?._ref
            ? urlFor(mainImage).width(800).height(800).url()
            : "https://olgishcakes.co.uk/images/placeholder-cake.jpg";
        })(),
        url: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
        brand: { "@type": "Brand", name: "Olgish Cakes" },
        category: "Birthday Cake",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          reviewCount: "127",
          bestRating: "5",
          worstRating: "1",
        },
        offers: {
          "@type": "Offer",
          price: cake?.pricing?.standard ?? 0,
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          priceValidUntil: getPriceValidUntil(30),
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: 0,
              currency: "GBP",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "GB",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 0,
                maxValue: 1,
                unitCode: "DAY",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 3,
                unitCode: "DAY",
              },
            },
            appliesToDeliveryMethod: "https://purl.org/goodrelations/v1#DeliveryModeMail",
          },
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListJsonLd) }}
      />
      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Birthday Cakes", href: "/birthday-cakes" },
              ]}
            />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "primary.main",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Birthday Cakes Leeds
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                fontWeight: 400,
              }}
            >
              Make every birthday special with my custom birthday cakes. From children's themed
              cakes to nice adult celebrations, I create personalized birthday cakes that bring
              joy and Ukrainian tradition to your special day.
            </Typography>
            <Chip
              label="Custom Birthday Cake Design"
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                fontSize: "1.1rem",
                px: 3,
                py: 1,
                mb: 4,
              }}
            />
          </Box>

          {/* Birthday Cake Services */}
          <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              {
                title: "Children's Birthday Cakes",
                description:
                  "Colorful, fun, and themed birthday cakes perfect for children's parties with popular characters and designs",
                icon: "🎂",
              },
              {
                title: "Adult Birthday Cakes",
                description:
                  "Nice and sophisticated birthday cakes for adults, featuring Ukrainian flavors and modern designs",
                icon: "🎉",
              },
              {
                title: "Themed Birthday Cakes",
                description:
                  "Custom themed cakes based on hobbies, interests, or special requests to make birthdays unforgettable",
                icon: "🎨",
              },
              {
                title: "Ukrainian Birthday Cakes",
                description:
                  "Traditional Ukrainian birthday cakes like honey cake (Medovik) and Kyiv cake with real flavors and cultural meaning",
                icon: "🇺🇦",
              },
            ].map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    height: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h3" component="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                    {service.icon}
                  </Typography>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                  >
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Birthday Cake Gallery */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Birthday Cake Inspiration
            </Typography>

            {birthdayCakes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h3" component="h3" color="text.secondary" sx={{ mb: 2 }}>
                  Custom Birthday Cakes
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Every birthday cake is custom-designed to match your unique vision. Contact me to
                  discuss your birthday cake requirements and view my portfolio.
                </Typography>
                <Button
                  component={Link}
                  href="/contact"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Birthday Cake Consultation
                </Button>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {birthdayCakes.map(cake => (
                  <Grid item xs={12} sm={6} md={4} key={cake._id}>
                    <CakeCard cake={cake} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Birthday Cake Sizes & Pricing */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Birthday Cake Sizes & Pricing
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  size: "6 inch",
                  serves: "8-12 people",
                  price: "From £35",
                  description: "Perfect for small family celebrations or intimate birthday parties",
                },
                {
                  size: "8 inch",
                  serves: "15-20 people",
                  price: "From £45",
                  description: "Ideal for medium-sized birthday parties and family gatherings",
                },
                {
                  size: "10 inch",
                  serves: "25-30 people",
                  price: "From £60",
                  description:
                    "Great for larger birthday celebrations and special milestone birthdays",
                },
                {
                  size: "12 inch",
                  serves: "35-40 people",
                  price: "From £80",
                  description: "Perfect for big birthday parties and milestone celebrations",
                },
              ].map((option, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {option.size}
                    </Typography>
                    <Typography variant="h4" component="h3" sx={{ mb: 1, color: "text.secondary" }}>
                      {option.serves}
                    </Typography>
                    <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                      {option.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <AreasWeCover
            title="Birthday Cake Delivery Areas"
            subtitle="I deliver birthday cakes across Leeds and around towns."
          />

          {/* Birthday Cake Flavors */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Birthday Cake Flavors
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Our birthday cakes feature a delightful selection of flavors perfect for celebrations.
              From traditional Ukrainian favorites to classic birthday cake flavors, we have
              something for everyone's taste.
            </Typography>
            <Grid container spacing={3}>
              {[
                "Medovik (Honey Cake) - Traditional Ukrainian honey layers",
                "Kyiv Cake - Rich chocolate and hazelnut meringue",
                "Vanilla Bean - Classic birthday cake with Ukrainian twist",
                "Chocolate Fudge - Decadent chocolate layers",
                "Lemon Poppy Seed - Light and refreshing option",
                "Red Velvet - Classic with Ukrainian cream cheese frosting",
                "Strawberry Cream - Fresh strawberry filling",
                "Carrot Cake - Traditional with Ukrainian spices",
              ].map((flavor, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        mr: 2,
                      }}
                    />
                    <Typography variant="body1">{flavor}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Birthday Cake Process */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              mb: 6,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 4,
                textAlign: "center",
              }}
            >
              Your Birthday Cake Journey
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  step: "1",
                  title: "Consultation",
                  description:
                    "We discuss your birthday cake vision, including theme, colors, flavors, and any special requirements. This can be in-person, over the phone, or via video call.",
                },
                {
                  step: "2",
                  title: "Design & Tasting",
                  description:
                    "We create a custom design proposal and arrange a tasting session with our signature Ukrainian flavors and classic birthday cake options.",
                },
                {
                  step: "3",
                  title: "Final Design",
                  description:
                    "After the tasting, we finalize the design, flavors, and all details. A 50% deposit secures your birthday cake order.",
                },
                {
                  step: "4",
                  title: "Creation & Delivery",
                  description:
                    "Your birthday cake is carefully crafted and delivered fresh to your celebration venue or home on your special day.",
                },
              ].map((step, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {step.step}
                    </Box>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Call to Action */}
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Ready to Order Your Birthday Cake?
            </Typography>
            <Typography variant="h4" component="h3" sx={{ mb: 4, color: "text.secondary" }}>
              Contact me today to start planning your perfect birthday celebration
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/contact"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                Order Birthday Cake
              </Button>
              <Button
                component={Link}
                href="/cakes"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View All Cakes
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
