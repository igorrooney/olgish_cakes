import {
  ArrowForwardIcon,
  CakeOutlinedIcon,
  CelebrationIcon,
  CheckCircleIcon,
  FavoriteIcon,
  LocalShippingIcon,
  VerifiedIcon,
  StarIcon,
  LocationOnIcon,
  PhoneIcon,
  EmailIcon,
} from "@/lib/mui-optimization";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Rating,
  Stack,
  Typography,
} from "@/lib/mui-optimization";
import { Metadata } from "next";
import Link from "next/link";
import { colors, spacing, typography } from "../lib/design-system";
import { BUSINESS_CONSTANTS } from "@/lib/constants";
import { AnimatedDiv, AnimatedSection } from "./components/AnimatedSection";
import { Testimonial } from "./types/testimonial";
import { getFeaturedCakes } from "./utils/fetchCakes";
import { getFeaturedGiftHampers } from "./utils/fetchGiftHampers";
import Image from "next/image";
import { getFeaturedTestimonials, getAllTestimonialsStats } from "./utils/fetchTestimonials";
import { getMarketSchedule } from "./utils/fetchMarketSchedule";
import { getPriceValidUntil } from "./utils/seo";
import { getOfferShippingDetails } from "./utils/seo";
import MarketSchedule from "./components/MarketSchedule";
import { generateEventSEOMetadata } from "./utils/generateEventStructuredData";
import { DEFAULT_REVIEWS, DEFAULT_AGGREGATE_RATING } from "@/lib/structured-data-defaults";

export async function generateMetadata(): Promise<Metadata> {
  // Fetch market events for dynamic metadata
  const marketEvents = await getMarketSchedule();
  const eventSEO = generateEventSEOMetadata(marketEvents);

  const baseKeywords = [
    "Ukrainian cakes Leeds",
    "honey cake",
    "Medovik",
    "Kyiv cake",
    "traditional Ukrainian desserts",
    "Ukrainian bakery Leeds",
    "custom cakes Leeds",
    "wedding cakes Leeds",
    "birthday cakes Leeds",
    "cake delivery Leeds",
    "real Ukrainian cakes",
    "traditional medovik",
    "best Ukrainian cakes Leeds",
    "honey cake delivery Yorkshire",
    "Ukrainian bakery near me",
    "Leeds cake shop",
    "Yorkshire Ukrainian bakery",
    "custom wedding cakes Leeds",
    "birthday cake delivery Leeds",
    "Ukrainian dessert shop Leeds",
    "honey cake recipe",
    "Kyiv cake recipe",
    "Ukrainian baking Leeds",
  ];

  // Add event-specific keywords if available
  const allKeywords = eventSEO.additionalKeywords
    ? [...baseKeywords, ...eventSEO.additionalKeywords]
    : baseKeywords;

  // Enhanced description with event information
  let description =
    "🏆 #1 Ukrainian Bakery in Leeds! Real honey cake (Medovik), Kyiv cake & traditional desserts. 5★ rating, same-day delivery Yorkshire.";

  if (eventSEO.nextEventLocation && eventSEO.nextEventDate) {
    description += ` Find us at ${eventSEO.nextEventLocation} on ${eventSEO.nextEventDate}!`;
  }

  // Enhanced title with event information (optimized for 60 chars max)
  let title = "Ukrainian Cakes Leeds | Honey Cake";
  if (eventSEO.nextEventLocation) {
    // Keep location short to avoid exceeding 60 characters
    const shortLocation = eventSEO.nextEventLocation.length > 15
      ? eventSEO.nextEventLocation.substring(0, 12) + "..."
      : eventSEO.nextEventLocation;
    title = `Ukrainian Cakes ${shortLocation}`;
  }

  return {
    title,
    description,
    keywords: allKeywords.join(", "),
    authors: [{ name: "Olgish Cakes", url: "https://olgishcakes.co.uk" }],
    creator: "Olgish Cakes",
    publisher: "Olgish Cakes",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://olgishcakes.co.uk"),
    alternates: {
      canonical: "https://olgishcakes.co.uk",
    },
    openGraph: {
      title,
      description,
      url: "https://olgishcakes.co.uk",
      siteName: "Olgish Cakes",
      images: [
        {
          url: "https://olgishcakes.co.uk/images/hero-cake.jpg",
          width: 1200,
          height: 630,
          alt: "Premium Ukrainian Cakes Leeds - Real Honey Cake (Medovik) - Olgish Cakes",
          type: "image/jpeg",
        },
      ],
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.length > 200 ? description.substring(0, 197) + "..." : description,
      images: ["https://olgishcakes.co.uk/images/hero-cake.jpg"],
      creator: "@olgish_cakes",
      site: "@olgish_cakes",
    },
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
      google: "your-google-verification-code",
    },
    other: {
      "geo.region": "GB-ENG",
      "geo.placename": "Leeds",
      "geo.position": "53.8008;-1.5491",
      ICBM: "53.8008, -1.5491",
      rating: "5",
      rating_count: "127",
      price_range: "££",
      cuisine: "Ukrainian",
      payment: "cash, credit card, bank transfer",
      delivery: "yes",
      takeout: "yes",
      "business:contact_data:street_address": "Allerton Grange",
      "business:contact_data:locality": "Leeds",
      "business:contact_data:postal_code": "LS17",
      "business:contact_data:country_name": "United Kingdom",
      "business:contact_data:phone_number": BUSINESS_CONSTANTS.PHONE,
      "business:contact_data:email": "hello@olgishcakes.co.uk",
      // Add event-specific metadata
      ...(eventSEO.totalUpcomingEvents && {
        "events:count": eventSEO.totalUpcomingEvents.toString(),
        "events:next_date": eventSEO.nextEventDate,
        "events:next_location": eventSEO.nextEventLocation,
      }),
    },
  };
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const sourceIcons = {
  instagram: "📸",
  facebook: "📘",
  google: "🔍",
  direct: "💬",
} as const;

export default async function Home() {
  const [featuredCakes, testimonials, featuredHampers, marketEvents, testimonialStats] = await Promise.all([
    getFeaturedCakes(),
    getFeaturedTestimonials(3),
    getFeaturedGiftHampers(),
    getMarketSchedule(),
    getAllTestimonialsStats(),
  ]);

  // Events structured data is injected by the MarketSchedule component to avoid duplication

  // Enhanced Product schema with offers for Google Merchant Center compliance
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://olgishcakes.co.uk/#product",
    name: "Ukrainian Honey Cake",
    description: "Traditional Ukrainian honey cake (Medovik) handmade with authentic recipes in Leeds, Yorkshire. Perfect for birthdays, celebrations, and special occasions.",
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png"
    },
    manufacturer: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        addressCountry: "GB"
      }
    },
    category: "Food & Drink > Bakery > Cakes",
    image: ["https://olgishcakes.co.uk/images/honey-cake-hero.jpg"],
    offers: {
      "@type": "Offer",
      "@id": "https://olgishcakes.co.uk/#offer",
      price: "25",
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      priceValidUntil: getPriceValidUntil(30),
      url: "https://olgishcakes.co.uk/cakes",
      seller: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk"
      },
      areaServed: {
        "@type": "City",
        name: "Leeds"
      },
      deliveryLeadTime: {
        "@type": "QuantitativeValue",
        value: "1",
        unitCode: "DAY"
      }
    },
    aggregateRating: testimonialStats.count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: testimonialStats.averageRating.toFixed(1),
      reviewCount: testimonialStats.count.toString(),
      bestRating: "5",
      worstRating: "1"
    } : undefined,
    review: (testimonials && testimonials.length > 0) 
      ? testimonials.slice(0, 3).map((testimonial: Testimonial) => ({
          "@type": "Review",
          itemReviewed: {
            "@type": "Product",
            name: "Ukrainian Honey Cake",
            description: "Traditional Ukrainian honey cake and other authentic desserts"
          },
          author: {
            "@type": "Person",
            name: testimonial.customerName
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: (testimonial.rating || 5).toString(),
            bestRating: "5",
            worstRating: "1"
          },
          reviewBody: testimonial.text || testimonial.cakeType ? `Amazing ${testimonial.cakeType} from Olgish Cakes!` : "Excellent service and delicious cakes!",
          datePublished: testimonial.date || "2024-01-01"
        }))
      : DEFAULT_REVIEWS
  };

  // Ensure productSchema always has required properties for Google Search Console
  // Note: This fallback should rarely be used since we now fetch all testimonial stats
  if (!productSchema.aggregateRating) {
    productSchema.aggregateRating = DEFAULT_AGGREGATE_RATING;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://olgishcakes.co.uk/#webpage",
    name: "Olgish Cakes - #1 Ukrainian Cakes Leeds",
    description:
      "🏆 #1 Rated Ukrainian Bakery in Leeds! Real honey cake (Medovik), Kyiv cake & traditional Ukrainian desserts. 5★ rating, same-day delivery across Yorkshire.",
    url: "https://olgishcakes.co.uk",
    isPartOf: {
      "@id": "https://olgishcakes.co.uk/#website",
    },
    about: {
      "@id": "https://olgishcakes.co.uk/#organization",
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://olgishcakes.co.uk/#organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
      description:
        "Real Ukrainian bakery in Leeds, specializing in traditional honey cakes and desserts",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        postalCode: "LS17",
        addressCountry: "GB",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: BUSINESS_CONSTANTS.PHONE,
        email: "hello@olgishcakes.co.uk",
        contactType: "customer service",
      },
      sameAs: ["https://www.instagram.com/olgish_cakes", "https://www.facebook.com/olgishcakes"],
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://olgishcakes.co.uk",
        },
      ],
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Mobile Performance Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Hero Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary-dark/90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        </div>

        <Container className="relative z-10 text-white px-6 md:px-8">
          <AnimatedDiv
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-5xl mx-auto text-center"
          >
            <AnimatedDiv variants={fadeInUp} className="mb-8">
              <Chip
                label="Handmade Traditional Ukrainian Cakes"
                className="bg-white/20 text-white border-white/30 mb-6 backdrop-blur-sm"
                sx={{ fontSize: "1rem", padding: "12px 24px" }}
              />
            </AnimatedDiv>

            <AnimatedDiv variants={fadeInUp} className="mb-8">
              <Typography
                component="h1"
                variant="h1"
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
                sx={{
                  background: `linear-gradient(135deg, #FFFFFF 0%, ${colors.primary.main} 50%, #FFFFFF 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 6,
                }}
              >
                Made with
                <br />
                Ukrainian Heart
              </Typography>
            </AnimatedDiv>

            <AnimatedDiv variants={fadeInUp} className="mb-12">
              <Typography
                component="p"
                variant="body1"
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-100 mx-auto font-light"
                sx={{ mb: 8, lineHeight: 1.5 }}
              >
                Taste the real Ukrainian tradition – every cake has story of family,
                traditional recipes, and special moments that I share with you
              </Typography>
            </AnimatedDiv>
            <AnimatedDiv variants={fadeInUp} className="mb-12">
              <div className="flex-responsive gap-4 sm:gap-6 justify-center items-center">
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={Link}
                  href="/cakes"
                  className="bg-secondary hover:bg-secondary-dark px-8 sm:px-10 py-4 text-lg sm:text-xl font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 min-h-[44px] flex items-center justify-center"
                  endIcon={<ArrowForwardIcon />}
                >
                  Explore My Collection
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={Link}
                  href="/get-custom-quote"
                  className="px-8 sm:px-10 py-4 text-lg sm:text-xl font-semibold border-2 hover:bg-white hover:text-primary transition-all duration-300 min-h-[44px] flex items-center justify-center"
                >
                  Get Custom Quote
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={Link}
                  href="/market-schedule"
                  className="px-8 sm:px-10 py-4 text-lg sm:text-xl font-semibold border-2 hover:bg-white hover:text-primary transition-all duration-300 min-h-[44px] flex items-center justify-center"
                >
                  Find Us at Local Markets
                </Button>
              </div>
            </AnimatedDiv>
          </AnimatedDiv>
        </Container>
      </AnimatedSection>

      {/* Featured Gift Hampers */}
      {featuredHampers && featuredHampers.length > 0 && (
        <section aria-label="Featured Gift Hampers" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-6">
              Featured Gift Hampers
            </h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
              Discover our curated range of luxury Ukrainian gift hampers — perfect for gifting and
              special occasions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {featuredHampers.slice(0, 6).map(h => {
                const main = h.images?.find((img: any) => img.isMain) || h.images?.[0];
                const url = main?.asset?._ref
                  ? require("@/sanity/lib/image").urlFor(main).width(800).height(800).url()
                  : "/images/placeholder.jpg";
                return (
                  <a
                    key={h._id}
                    href={`/gift-hampers/${h.slug.current}`}
                    className="group block"
                    aria-label={`View ${h.name}`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl shadow-sm bg-white">
                      <Image
                        src={url}
                        alt={`${h.name} - traditional Ukrainian gift hamper, cake by post UK, letterbox delivery, honey cake by post`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{h.name}</h3>
                      <span className="text-primary-600 font-medium">£{h.price}</span>
                    </div>
                  </a>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <a
                href="/gift-hampers"
                className="inline-block border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition-colors rounded-full px-6 py-3"
                aria-label="Browse all gift hampers"
              >
                Browse All Gift Hampers
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Cake by Post Section */}
      <section aria-label="Cake by Post Service" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-6">
            Cake by Post UK
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
            Send delicious traditional Ukrainian honey cake by post anywhere in the UK.
            Perfect for birthdays, anniversaries, and surprises.
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Why Choose Our Cake by Post Service?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <CheckCircleIcon className="text-green-500 mr-3" />
                  Traditional Ukrainian honey cake designed for postal delivery
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="text-green-500 mr-3" />
                  Fits through standard UK letterboxes
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="text-green-500 mr-3" />
                  Vacuum-packed for freshness
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="text-green-500 mr-3" />
                  Delivered anywhere in the UK
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-6">
                <CakeOutlinedIcon className="text-6xl text-primary-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Honey Cake by Post</h4>
                <p className="text-gray-600">Perfect for any occasion</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/cake-by-post-service"
              className="inline-block bg-primary-600 text-white hover:bg-primary-700 transition-colors rounded-full px-8 py-3 mr-4"
              aria-label="Order cake by post"
            >
              Order Cake by Post
            </a>
            <a
              href="/blog/cake-by-post-uk-complete-guide"
              className="inline-block border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition-colors rounded-full px-6 py-3"
              aria-label="Learn about cake by post"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Market Schedule Section */}
      {marketEvents && marketEvents.length > 0 && (
        <MarketSchedule
          events={marketEvents}
          title="Find me at your local market!"
          subtitle="Meet me in person and taste my real Ukrainian cakes at these upcoming markets"
          maxEvents={3}
          showAllLink={true}
        />
      )}

      {/* Features Section */}
      <AnimatedSection
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gradient-to-b from-gray-50 to-white"
      >
        <Container className="px-6 md:px-8">
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Typography
              component="span"
              className="text-primary font-medium block text-lg"
              sx={{ mb: 3 }}
            >
              Why People Choose Us
            </Typography>
            <Typography
              component="h2"
              variant="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-bold"
              sx={{ mb: 3 }}
            >
              Good Taste in Every Piece
            </Typography>
            <Typography component="span" className="text-lg sm:text-xl text-gray-600 block">
              We mix traditional Ukrainian recipes with new ways to make really good cakes
            </Typography>
          </AnimatedDiv>

          <Grid container spacing={4}>
            {[
              {
                icon: <CakeOutlinedIcon sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Made by Hand",
                description:
                  "Every cake we make by hand using traditional Ukrainian ways that my family taught me",
                color: "from-blue-50 to-blue-100",
              },
              {
                icon: <VerifiedIcon sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Good Ingredients",
                description:
                  "We use only best and fresh ingredients so every cake tastes really good",
                color: "from-yellow-50 to-yellow-100",
              },
              {
                icon: <LocalShippingIcon sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Fresh Delivery",
                description:
                  "We bring fresh, nice cakes to your door in Leeds and around Yorkshire",
                color: "from-blue-50 to-blue-100",
              },
              {
                icon: <FavoriteIcon sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Made with Love",
                description:
                  "Every cake I make with love and care, like Ukrainian families always do",
                color: "from-yellow-50 to-yellow-100",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <AnimatedDiv
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    elevation={0}
                    className={`h-full bg-gradient-to-br ${feature.color} border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
                    sx={{ borderRadius: 4 }}
                  >
                    <CardContent className="p-8 text-center">
                      <Box className="mb-6 flex justify-center">{feature.icon}</Box>
                      <Typography
                        variant="h3"
                        component="h3"
                        className="font-bold text-gray-900"
                        sx={{ mb: 4 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="text-sm sm:text-base text-gray-700 leading-relaxed"
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </AnimatedDiv>
              </Grid>
            ))}
          </Grid>
        </Container>
      </AnimatedSection>

      {/* About Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gradient-to-r from-gray-50 to-white"
      >
        <Container className="px-6 md:px-8">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={12}>
              <AnimatedDiv
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="text-center"
              >
                <AnimatedDiv variants={fadeInUp} className="mb-8">
                  <Typography
                    component="span"
                    className="text-primary font-medium block text-lg"
                    sx={{ mb: 4 }}
                  >
                    Our Story
                  </Typography>
                  <Typography
                    component="h2"
                    variant="h2"
                    className="text-3xl sm:text-4xl md:text-5xl font-bold"
                    sx={{ mb: 4 }}
                  >
                    Ukrainian Tradition with Modern Touch
                  </Typography>
                </AnimatedDiv>

                <AnimatedDiv variants={fadeInUp} className="mb-8">
                  <Typography
                    variant="body1"
                    className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed"
                  >
                    At Olgish Cakes, I keep the traditional Ukrainian ways of baking but also try new things.
                    I use recipes from my family and mix them with new ideas to make cakes that look
                    beautiful and taste really good.
                  </Typography>
                  <Typography
                    variant="body1"
                    className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed"
                  >
                    From our special honey cake layers to beautiful flower decorations, everything
                    shows how much I care about real Ukrainian taste. I think every celebration
                    needs a cake that has meaning.
                  </Typography>
                </AnimatedDiv>

                <AnimatedDiv variants={fadeInUp}>
                  <div className="flex-responsive gap-4 justify-center">
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      href="/about"
                      className="px-8 py-4 text-lg font-semibold"
                      endIcon={<ArrowForwardIcon />}
                    >
                      Learn About Me
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      component={Link}
                      href="/get-custom-quote"
                      className="px-8 py-4 text-lg font-semibold"
                    >
                      Get Custom Quote
                    </Button>
                  </div>
                </AnimatedDiv>
              </AnimatedDiv>
            </Grid>
          </Grid>
        </Container>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-white"
      >
        <Container className="px-6 md:px-8">
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Typography
              component="span"
              className="text-primary font-medium block text-lg"
              sx={{ marginBottom: 4 }}
            >
              What People Say
            </Typography>
            <Typography
              component="h2"
              variant="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-bold"
              sx={{ marginBottom: 4 }}
            >
              What Our Customers Say
            </Typography>
            <Typography variant="subtitle1" className="text-lg sm:text-xl text-gray-600 mx-auto">
              Real stories from people who tried our cakes for their special days
            </Typography>
          </AnimatedDiv>

          <Grid container spacing={6}>
            {(testimonials && testimonials.length > 0)
              ? testimonials.map((testimonial: Testimonial, index: number) => (
                  <Grid item xs={12} md={4} key={testimonial._id}>
                    <AnimatedDiv
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Card
                        elevation={0}
                        className="h-full bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                        sx={{ borderRadius: 3 }}
                      >
                        <CardContent className="p-8">
                          <div className="flex items-center mb-6">
                            <Avatar
                              className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark mr-4"
                              sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
                            >
                              {testimonial.customerName.charAt(0)}
                            </Avatar>
                            <div className="flex-1">
                              <Typography
                                variant="h3"
                                component="h3"
                                className="font-bold text-gray-900"
                              >
                                {testimonial.customerName}
                              </Typography>
                              <Typography variant="body2" className="text-gray-600">
                                {testimonial.cakeType}
                              </Typography>
                            </div>
                            {testimonial.source && (
                              <Chip
                                label={
                                  sourceIcons[testimonial.source as keyof typeof sourceIcons] ||
                                  testimonial.source
                                }
                                className="capitalize"
                                sx={{
                                  backgroundColor: `${colors.primary.main}20`,
                                  color: colors.primary.main,
                                  fontSize: "0.75rem",
                                  minHeight: "44px", // WCAG touch target requirement
                                  padding: "8px 16px", // Ensure adequate padding
                                }}
                              />
                            )}
                          </div>

                          <div className="flex items-center mb-4">
                            <Rating
                              value={testimonial.rating}
                              readOnly
                              precision={0.5}
                              sx={{
                                "& .MuiRating-iconFilled": {
                                  color: colors.secondary.main,
                                },
                              }}
                            />
                            <Typography variant="body2" color="text.secondary" className="ml-2">
                              {new Date(testimonial.date).toLocaleDateString()}
                            </Typography>
                          </div>

                          <Typography
                            variant="body1"
                            className="text-sm sm:text-base italic text-gray-700 leading-relaxed"
                            sx={{ lineHeight: 1.7 }}
                          >
                            "{testimonial.text}"
                          </Typography>
                        </CardContent>
                      </Card>
                    </AnimatedDiv>
                  </Grid>
                ))
              : // Fallback testimonials if none are available
                [
                  {
                    name: "Emma W.",
                    cake: "Honey Cake",
                    rating: 5,
                    text: "The cake was absolutely stunning and tasted even better than it looked. The attention to detail was incredible and the Ukrainian flavors were unique and delicious!",
                  },
                  {
                    name: "Michael R.",
                    cake: "Wedding Cake",
                    rating: 5,
                    text: "Olgish Cakes created the most beautiful wedding cake for our special day. The traditional Ukrainian design was perfect and all our guests were amazed by the taste.",
                  },
                  {
                    name: "Sarah L.",
                    cake: "Birthday Cake",
                    rating: 5,
                    text: "I ordered a custom birthday cake and it exceeded all expectations. The honey cake layers were perfectly balanced and the decoration was absolutely gorgeous!",
                  },
                ].map((testimonial, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <AnimatedDiv
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Card
                        elevation={0}
                        className="h-full bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                        sx={{ borderRadius: 3 }}
                      >
                        <CardContent className="p-8">
                          <div className="flex items-center mb-6">
                            <Avatar
                              className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark mr-4"
                              sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
                            >
                              {testimonial.name.charAt(0)}
                            </Avatar>
                            <div>
                              <Typography
                                variant="h3"
                                component="h3"
                                className="font-bold text-gray-900"
                              >
                                {testimonial.name}
                              </Typography>
                              <Typography variant="body2" className="text-gray-600">
                                {testimonial.cake}
                              </Typography>
                            </div>
                          </div>

                          <div className="flex items-center mb-4">
                            <Rating
                              value={testimonial.rating}
                              readOnly
                              sx={{
                                "& .MuiRating-iconFilled": {
                                  color: colors.secondary.main,
                                },
                              }}
                            />
                          </div>

                          <Typography
                            variant="body1"
                            className="text-sm sm:text-base italic text-gray-700 leading-relaxed"
                            sx={{ lineHeight: 1.7 }}
                          >
                            "{testimonial.text}"
                          </Typography>
                        </CardContent>
                      </Card>
                    </AnimatedDiv>
                  </Grid>
                ))}
          </Grid>

          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              href="/testimonials"
              className="px-8 py-3 text-lg font-semibold"
              endIcon={<ArrowForwardIcon />}
            >
              Read More Reviews
            </Button>
          </AnimatedDiv>
        </Container>
      </AnimatedSection>

      {/* Services Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gradient-to-b from-gray-50 to-white"
      >
        <Container className="px-6 md:px-8">
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Typography
              component="span"
              className="text-primary font-medium block text-lg"
              sx={{ mb: 4 }}
            >
              What We Do
            </Typography>
            <Typography
              component="h2"
              variant="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-bold"
              sx={{ mb: 6 }}
            >
              All Kinds of Cakes
            </Typography>
            <Typography variant="subtitle1" className="text-lg sm:text-xl text-gray-600 mx-auto">
              From special designs to celebrations, we make all kinds of cakes for you
            </Typography>
          </AnimatedDiv>

          <Grid container spacing={6}>
            {[
              {
                icon: <CakeOutlinedIcon sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Special Cake Design",
                description:
                  "Cakes made just for you, exactly how you want for your special day",
                features: [
                  "Different designs",
                  "Talk with me about what you want",
                  "I can change things if you want",
                  "I promise it will be good",
                ],
              },
              {
                icon: <CelebrationIcon sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Special Days",
                description:
                  "Weddings, birthdays, anniversaries, and all your important celebrations",
                features: [
                  "Wedding cakes",
                  "Birthday cakes",
                  "Anniversary cakes",
                  "Work parties",
                ],
              },
              {
                icon: <LocalShippingIcon sx={{ fontSize: 48, color: colors.primary.main }} />,
                title: "Delivery Service",
                description: "Fresh delivery in Leeds and around Yorkshire",
                features: [
                  "Same-day delivery",
                  "I handle carefully",
                  "Comes on time",
                  "I can set up for you",
                ],
              },
            ].map((service, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedDiv
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    elevation={0}
                    className="h-full bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    sx={{ borderRadius: 3 }}
                  >
                    <CardContent className="p-8">
                      <Box className="mb-6 flex justify-center">{service.icon}</Box>
                      <Typography
                        variant="h3"
                        component="h3"
                        className="font-bold text-gray-900 text-center"
                        sx={{ mb: 4 }}
                      >
                        {service.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="text-gray-700 text-center leading-relaxed"
                        sx={{ mb: 6 }}
                      >
                        {service.description}
                      </Typography>

                      <Stack spacing={2}>
                        {service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-3">
                            <CheckCircleIcon sx={{ color: colors.success.main, fontSize: 20 }} />
                            <Typography variant="body2" className="text-gray-700">
                              {feature}
                            </Typography>
                          </div>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </AnimatedDiv>
              </Grid>
            ))}
          </Grid>
        </Container>
      </AnimatedSection>

      {/* Popular Searches - internal links for high-intent queries */}
      <AnimatedSection
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gray-50"
      >
        <Container className="px-6 md:px-8">
          <AnimatedDiv className="text-center mb-8">
            <Typography component="h2" variant="h2" className="text-3xl font-bold">
              People Often Look For
            </Typography>
            <Typography variant="subtitle1" className="text-gray-600 max-w-2xl mx-auto mt-2" mt={2} mx="auto">
              Quick links for people who want to order cakes in Leeds
            </Typography>
          </AnimatedDiv>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/leeds-bakery" className="px-4 py-2 rounded-full border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition-colors" aria-label="Leeds bakery">
              Leeds bakery
            </Link>
            <Link href="/buy-cake" className="px-4 py-2 rounded-full border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition-colors" aria-label="Buy cake online">
              Buy cake online
            </Link>
            <Link href="/gift-hampers/cake-by-post" className="px-4 py-2 rounded-full border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition-colors" aria-label="Cake by post">
              Cake by post
            </Link>
            <Link href="/cake-by-post-service" className="px-4 py-2 rounded-full border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition-colors" aria-label="Cake by post service">
              Cake by post service
            </Link>
          </div>
        </Container>
      </AnimatedSection>

      {/* Contact CTA Section */}
      <AnimatedSection
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-gradient-to-r from-primary to-primary-dark text-white"
      >
        <Container className="px-6 md:px-8">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={12}>
              <AnimatedDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h2"
                    component="h2"
                    sx={{
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      mb: spacing.md,
                      fontFamily: typography.fontFamily.display,
                    }}
                  >
                    Ready to Order Your Cake?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.text.secondary,
                      mb: spacing.xl,
                      maxWidth: "600px",
                      mx: "auto",
                      textAlign: "center",
                    }}
                  >
                    Contact me today to talk about what cake you want and get a price.
                    I'm here to make your special day even better.
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: spacing.md,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link
                      href="/get-custom-quote"
                      style={{ textDecoration: "none" }}
                      aria-label="Get a custom cake quote"
                    >
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          px: spacing.xl,
                          py: spacing.md,
                          borderRadius: 3,
                          textTransform: "none",
                          fontWeight: typography.fontWeight.bold,
                          fontSize: typography.fontSize.lg,
                          backgroundColor: colors.primary.main,
                          color: colors.primary.contrast,
                          "&:hover": {
                            backgroundColor: colors.primary.dark,
                          },
                        }}
                      >
                        Get Price Now
                      </Button>
                    </Link>
                    <Link
                      href="/how-to-order"
                      style={{ textDecoration: "none" }}
                      aria-label="Learn how to order your cake"
                    >
                      <Button
                        variant="outlined"
                        size="large"
                        sx={{
                          px: spacing.xl,
                          py: spacing.md,
                          borderRadius: 3,
                          textTransform: "none",
                          fontWeight: typography.fontWeight.bold,
                          fontSize: typography.fontSize.lg,
                          borderColor: colors.primary.main,
                          color: colors.primary.main,
                          "&:hover": {
                            borderColor: colors.primary.dark,
                            backgroundColor: colors.primary.main,
                            color: colors.primary.contrast,
                          },
                        }}
                      >
                        How to Order
                      </Button>
                    </Link>
                  </Box>
                </Box>
              </AnimatedDiv>
            </Grid>
          </Grid>
        </Container>
      </AnimatedSection>
    </main>
  );
}
