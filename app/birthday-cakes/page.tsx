import type { Metadata } from "next";
import { Container, Typography, Box, Grid, Paper, Chip, Button } from "@mui/material";
import { getAllCakes } from "../utils/fetchCakes";
import CakeCard from "../components/CakeCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AreasWeCover } from "../components/AreasWeCover";
import Link from "next/link";
import { blocksToText, type Cake, type CakeImage } from "@/types/cake";
import { getPriceValidUntil, getOfferShippingDetails, getMerchantReturnPolicy } from "../utils/seo";
import { urlFor } from "@/sanity/lib/image";

export const metadata: Metadata = {
  title:
    "Birthday Cakes Leeds £25+ | Same-Day | 5★ | Custom Themes",
  description:
    "Birthday cakes Leeds from £25 | Same-day delivery | Ukrainian honey cake & custom themes | Kids & adults | 5★ rated (127+ reviews) | Free consultation!",
  keywords:
    "birthday cakes Leeds, themed birthday cakes Leeds, children birthday cakes Leeds, adult birthday cakes Leeds, Ukrainian honey cake birthday, Medovik birthday cake, birthday cake delivery Leeds",
  openGraph: {
    title:
      "Birthday Cakes Leeds from £25 | 5★ Rated | Same-Day Delivery",
    description:
      "Birthday cakes Leeds from £25 | Same-day delivery | Ukrainian honey cake | 127+ 5-star reviews | Children's & adult themes | Order today!",
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

  // Get popular cakes for the flavours section - filter out Christmas and seasonal
  const popularCakes = allCakes
    .filter(
      cake =>
        !cake.name.toLowerCase().includes("christmas") &&
        !cake.name.toLowerCase().includes("halloween") &&
        cake.category !== "seasonal"
    )
    .slice(0, 6);

  const birthdayServices = [
    {
      name: "Children's Birthday Cakes",
      description: "Colourful, fun, and themed birthday cakes perfect for children's parties",
      price: "From £25",
    },
    {
      name: "Adult Birthday Cakes",
      description: "Elegant and sophisticated birthday cakes for adults",
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
        acceptedAnswer: { "@type": "Answer", text: "Prices start from £25 for a 6‑inch cake. Final price depends on size and design." }
      }
    ]
  } as const;

  // Server-rendered Product list to avoid client-only JSON-LD being missed by crawlers
  const productListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Birthday Cakes",
    description:
      "Custom birthday cakes by Olgish Cakes. Traditional Ukrainian flavours and modern designs.",
    url: "https://olgishcakes.co.uk/birthday-cakes",
    itemListElement: birthdayCakes.map((cake: Cake, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: cake.name,
        image: (() => {
          // Import urlFor dynamically to avoid build issues
          type UrlForReturn = {
            width: (w: number) => {
              height: (h: number) => {
                url: () => string
              }
            }
          }
          // Get the best available image
          const mainImage: CakeImage | undefined = cake.mainImage?.asset?._ref
            ? cake.mainImage as CakeImage
            : cake.designs?.standard?.find((img: CakeImage) => img.isMain && img.asset?._ref) ||
              cake.designs?.standard?.find((img: CakeImage) => img.asset?._ref) ||
              cake.designs?.standard?.[0] ||
              cake.designs?.individual?.find((img: CakeImage) => img.isMain && img.asset?._ref) ||
              cake.designs?.individual?.find((img: CakeImage) => img.asset?._ref) ||
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
          shippingDetails: getOfferShippingDetails(),
          hasMerchantReturnPolicy: getMerchantReturnPolicy(),
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
                  "Colourful, fun, and themed birthday cakes perfect for children's parties with popular characters and designs",
                icon: "🎂",
              },
              {
                title: "Adult Birthday Cakes",
                description:
                  "Elegant and sophisticated birthday cakes for adults, featuring Ukrainian flavours and modern designs",
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
                  "Traditional Ukrainian birthday cakes like honey cake (Medovik) and Kyiv cake with authentic flavours and cultural meaning",
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
                  <Box sx={{ mb: 2, fontSize: "3rem" }}>
                    {service.icon}
                  </Box>
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
                <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                  color="primary"
                  size="large">
                  Birthday Cake Consultation
                </Button>
            </Link>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {birthdayCakes.map((cake, index) => (
                  <Grid item xs={12} sm={6} md={4} key={cake._id || `cake-${index}`}>
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
                  price: "From £25",
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
            subtitle="I deliver birthday cakes across Leeds and surrounding towns."
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
              I make several cake flavours, but honey cake is my most popular. It's traditional Ukrainian honey
              cake (Medovik) with 5 layers of soft honey sponge and buttercream made with condensed milk. Kyiv
              cake is premium cake with meringue and cashew nuts, filled with custard cream. I also make Vanilla
              Delicia birthday cake and Chocolate Delicia sponge cake. For all flavours, see my{" "}
              <Link href="/cake-flavors" style={{ color: "inherit", textDecoration: "underline" }}>
                complete flavour guide
              </Link>
              .
            </Typography>
            <Grid container spacing={3}>
              {popularCakes.map((cake, index) => {
                const description = cake.shortDescription
                  ? blocksToText(cake.shortDescription)
                  : blocksToText(cake.description);
                return (
                  <Grid item xs={12} sm={6} key={cake._id || index}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "primary.main",
                          mr: 2,
                          mt: 1,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Link
                          href={`/cakes/${cake.slug?.current || cake._id}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, "&:hover": { color: "primary.main" } }}>
                            {cake.name}
                          </Typography>
                        </Link>
                        {description && (
                          <Typography variant="body2" color="text.secondary">
                            {description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
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
                    "I discuss your birthday cake vision, including theme, colours, flavours, and any special requirements. This can be in-person, over the phone, or via video call.",
                },
                {
                  step: "2",
                  title: "Design & Tasting",
                  description:
                    "I create a custom design proposal and arrange a tasting session with my signature Ukrainian flavours and classic birthday cake options.",
                },
                {
                  step: "3",
                  title: "Final Design",
                  description:
                    "After the tasting, I finalize the design, flavours, and all details. A 50% deposit secures your birthday cake order.",
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

          {/* Same-Day Birthday Cake Delivery Leeds */}
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
              Same-Day Birthday Cake Delivery in Leeds
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              Need a birthday cake today? I offer same-day delivery across Leeds for orders placed before 10am. Perfect for last-minute birthday celebrations or when you need a fresh cake delivered quickly. My same-day service covers Leeds city centre, Headingley, Roundhay, Chapel Allerton, Moortown, and surrounding areas.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              Standard birthday cake orders require 3-5 days notice for custom designs. However, I keep a selection of popular flavours available for urgent orders. Contact me to check same-day availability. Delivery fees range from £5 for nearby Leeds areas to £12 for outer Leeds postcodes.
            </Typography>
          </Paper>

          {/* Age-Specific Birthday Cake Designs */}
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
              Birthday Cakes for Every Age
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  age: "Children (1-12 years)",
                  description: "Fun, colourful designs featuring popular characters, unicorns, dinosaurs, princesses, superheroes, and more. Perfect for children's birthday parties with kid-friendly flavours.",
                  popular: "Unicorn cakes, Dinosaur cakes, Princess cakes, Superhero cakes"
                },
                {
                  age: "Teenagers (13-19 years)",
                  description: "Trendy designs featuring sports themes, music, gaming, or sophisticated colour schemes. Can incorporate hobbies and interests for personalised birthday celebrations.",
                  popular: "Sport themes, Gaming cakes, Music themes, Minimalist designs"
                },
                {
                  age: "Adults (20-60 years)",
                  description: "Elegant and sophisticated birthday cakes with Ukrainian honey cake or modern designs. Perfect for milestone birthdays like 30th, 40th, 50th celebrations.",
                  popular: "Honey cake, Kyiv cake, Floral designs, Elegant tiered cakes"
                },
                {
                  age: "Seniors (60+ years)",
                  description: "Classic and traditional designs with timeless elegance. Can feature favourite flowers, hobbies, or family themes. Traditional flavours highly recommended.",
                  popular: "Classic Victoria sponge, Traditional fruit cake, Elegant florals"
                },
              ].map((category, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                      {category.age}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {category.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      Popular: {category.popular}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Leeds Birthday Cake Testimonials */}
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
              What Leeds Families Say
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  quote: "The unicorn birthday cake for my daughter's 5th birthday was perfect! All the kids loved it and the Ukrainian honey cake inside was a surprise hit with the adults too.",
                  author: "Lisa M., Roundhay Leeds",
                  occasion: "5th Birthday Party"
                },
                {
                  quote: "Ordered a last-minute birthday cake for my husband's 40th. Same-day delivery saved the day! The cake was beautiful and delicious. Highly recommend!",
                  author: "Rachel P., Headingley Leeds",
                  occasion: "40th Birthday"
                },
                {
                  quote: "Amazing custom design for my son's superhero birthday party. Olgish captured exactly what we wanted. All the parents asked where we got it from!",
                  author: "Sarah T., Chapel Allerton Leeds",
                  occasion: "7th Birthday Party"
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="h4" component="h3" sx={{ mb: 2, color: "secondary.main", fontSize: "2rem" }}>
                      ⭐⭐⭐⭐⭐
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ mb: 2, fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      {testimonial.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {testimonial.occasion}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Popular Birthday Cake Themes */}
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
              Popular Birthday Cake Themes in Leeds
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
              I create custom birthday cakes for all themes and interests. Here are some of the most popular birthday cake designs requested by Leeds families. Don't see your theme? Contact me for a custom design consultation.
            </Typography>
            <Grid container spacing={2}>
              {[
                "Unicorn & Rainbow Cakes",
                "Dinosaur Cakes",
                "Princess & Fairy Cakes",
                "Superhero Cakes (Marvel, DC)",
                "Football & Sports Cakes",
                "Gaming Cakes (Minecraft, Fortnite)",
                "Floral & Elegant Designs",
                "Ukrainian Honey Cake",
                "Number Cakes (Age Display)",
                "Photo Cakes",
                "Drip Cakes",
                "Geode Cakes",
              ].map((theme, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ display: "flex", alignItems: "center", p: 2, backgroundColor: "rgba(46, 49, 146, 0.03)", borderRadius: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        mr: 2,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body1">{theme}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Birthday Cakes by Location */}
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
              Birthday Cakes in Your Area
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, textAlign: "center" }}>
              I deliver birthday cakes across Yorkshire with same-day delivery available. Select your area for local delivery details:
            </Typography>
            <Grid container spacing={2}>
              {[
                { name: "Birthday Cakes Leeds", href: "/cakes-leeds" },
                { name: "Birthday Cakes Bradford", href: "/cakes-bradford" },
                { name: "Birthday Cakes Huddersfield", href: "/cakes-huddersfield" },
                { name: "Birthday Cakes Wakefield", href: "/cakes-wakefield" },
                { name: "Birthday Cakes York", href: "/cakes-york" },
                { name: "Birthday Cakes Halifax", href: "/cakes-halifax" },
                { name: "Birthday Cakes Pudsey", href: "/cakes-pudsey" },
                { name: "Birthday Cakes Otley", href: "/cakes-otley" },
              ].map((area, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Link href={area.href} style={{ textDecoration: 'none', display: 'block' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      sx={{
                        py: 1.5,
                        justifyContent: "flex-start",
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                      }}
                    >
                      {area.name}
                    </Button>
                  </Link>
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
              Order Your Leeds Birthday Cake Today
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: "700px", mx: "auto", fontSize: "1.1rem", lineHeight: 1.8 }}>
              From children's themed birthday cakes to elegant adult celebrations, I create custom birthday cakes that make your Leeds celebration special. Same-day delivery available for urgent orders. Contact me for a free design consultation.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}>
                Order Birthday Cake
              </Button>
            </Link>
              <Link href="/cakes" style={{ textDecoration: 'none' }}>
              <Button variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}>
                View All Cakes
              </Button>
            </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
