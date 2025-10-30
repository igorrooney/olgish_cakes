import { Container, Grid, Typography, Box } from "@/lib/mui-optimization";
import GiftHamperCard from "../components/GiftHamperCard";
import { getAllGiftHampers } from "../utils/fetchGiftHampers";
import { getRevalidateTime } from "../utils/fetchCakes";
import HeroSection from "./HeroSection";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { urlFor } from "@/sanity/lib/image";
import { StyledAccordion } from "@/lib/ui-components";
import type { Metadata } from "next";
import { getAllTestimonialsStats } from "../utils/fetchTestimonials";
import { getPriceValidUntil, getOfferShippingDetails, getMerchantReturnPolicy } from "../utils/seo";

export const revalidate = getRevalidateTime();

// Force static generation
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Gift Hampers | Luxury Ukrainian Baskets",
  description:
    "Explore our curated collection of luxury Ukrainian gift hampers. Thoughtfully assembled baskets with premium treats. Handcrafted in Leeds with UK delivery.",
  keywords:
    "gift hampers, luxury gift hampers, Ukrainian hampers, gourmet gift baskets, Leeds hampers, Yorkshire gift hampers, food gifts UK, premium hampers Leeds, artisan hampers",
  openGraph: {
    title: "Gift Hampers | Luxury Ukrainian Baskets",
    description:
      "Explore our curated collection of luxury Ukrainian gift hampers. Thoughtfully assembled baskets with premium treats.",
    url: "https://olgishcakes.co.uk/gift-hampers",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/gift-hampers-collection.jpg",
        width: 1200,
        height: 630,
        alt: "Luxury Ukrainian Gift Hampers - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gift Hampers | Luxury Ukrainian Baskets",
    description:
      "Explore our curated collection of luxury Ukrainian gift hampers. Thoughtfully assembled baskets with premium treats.",
    images: ["https://olgishcakes.co.uk/images/gift-hampers-collection.jpg"],
  },
  alternates: { canonical: "https://olgishcakes.co.uk/gift-hampers" },
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

export default async function GiftHampersPage() {
  // Force static data for build-time generation
  const [hampers, testimonialStats] = await Promise.all([
    getAllGiftHampers(false),
    getAllTestimonialsStats()
  ]);

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Olgish Cakes",
    url: "https://olgishcakes.co.uk",
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
    sameAs: [
      "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
      "https://www.instagram.com/olgish_cakes/",
    ],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: "50" },
  };

  return (
    <>
      {(() => {
        // Breadcrumbs + ItemList JSON-LD (server-rendered)
        const breadcrumbJsonLd = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://olgishcakes.co.uk" },
            {
              "@type": "ListItem",
              position: 2,
              name: "Gift Hampers",
              item: "https://olgishcakes.co.uk/gift-hampers",
            },
          ],
        } as const;

        const itemListJsonLd = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Luxury Ukrainian Gift Hampers",
          itemListElement: (hampers || []).map((h, index) => {
            // Get the best available image
            const mainImage = h.images?.find((img: any) => img.isMain && img.asset?._ref) || h.images?.[0];
            const imageUrl = mainImage?.asset?._ref
              ? urlFor(mainImage).width(800).height(800).url()
              : "https://olgishcakes.co.uk/images/placeholder-cake.jpg";

            return {
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                "@id": `https://olgishcakes.co.uk/gift-hampers/${h.slug.current}#product`,
                name: h.name,
                description: h.shortDescription 
                  ? (Array.isArray(h.shortDescription) 
                    ? h.shortDescription.map((p: any) => p.children?.map((c: any) => c.text).join("") || "").join(" ")
                    : String(h.shortDescription))
                  : `${h.name} luxury Ukrainian gift hamper`,
                image: imageUrl,
                url: `https://olgishcakes.co.uk/gift-hampers/${h.slug.current}`,
                brand: {
                  "@type": "Brand",
                  name: "Olgish Cakes"
                },
                offers: {
                  "@type": "Offer",
                  price: h.price || 0,
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                  priceValidUntil: getPriceValidUntil(30),
                  url: `https://olgishcakes.co.uk/gift-hampers/${h.slug.current}`,
                  seller: {
                    "@type": "Organization",
                    name: "Olgish Cakes",
                    url: "https://olgishcakes.co.uk"
                  },
                  shippingDetails: getOfferShippingDetails(),
                  hasMerchantReturnPolicy: getMerchantReturnPolicy(),
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: testimonialStats.averageRating.toFixed(1),
                  reviewCount: testimonialStats.count.toString(),
                  bestRating: "5",
                  worstRating: "1"
                }
              }
            };
          }),
        } as const;

        const faqJsonLd = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Do you deliver gift hampers across the UK?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. We ship our gift hampers nationwide across the UK with careful packaging to ensure items arrive in perfect condition.",
              },
            },
            {
              "@type": "Question",
              name: "Can I include a personalised message?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Absolutely. Add a personalised gift note at checkout and we will include it inside the hamper.",
              },
            },
            {
              "@type": "Question",
              name: "Are your hampers suitable for corporate gifting?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. We offer beautifully presented hampers ideal for client and team gifts. Contact us for bespoke quantities and branding.",
              },
            },
          ],
        } as const;

        const localBusinessJsonLd = localBusinessData;

        return (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
          </>
        );
      })()}
      <main className="min-h-screen bg-gray-50">
        <HeroSection />

        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Gift Hampers", href: "/gift-hampers" },
            ]}
          />
        </Container>

        <Container maxWidth="lg" className="py-16">
          {!hampers || hampers.length === 0 ? (
            <Box className="text-center py-16">
              <Typography variant="h2" component="h2" className="mb-4 text-gray-700 font-light">
                Our Gift Hampers
              </Typography>
              <Typography variant="body1" color="text.secondary" className="max-w-md mx-auto">
                We’re assembling our luxury hamper collection. Please check back soon!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={6} className="mt-8">
              {hampers.map(hamper => (
                <Grid item xs={12} sm={6} md={4} key={hamper._id}>
                  <GiftHamperCard hamper={hamper} testimonialStats={testimonialStats} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>

        {/* SEO body content block for topical authority */}
        <Container maxWidth="lg" sx={{ pb: 12 }}>
          <Box component="section" aria-label="About our gift hampers" sx={{ mt: 6 }}>
            <Typography component="h2" variant="h3" className="mb-4 text-gray-800">
              Luxury Ukrainian Gift Hampers in Leeds, with UK Delivery
            </Typography>
            <Typography component="p" variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Our curated hampers feature handmade Ukrainian treats crafted by Olgish Cakes in
              Leeds. Thoughtful selections for birthdays, anniversaries, corporate gifting and
              festive celebrations.
            </Typography>
            <Typography component="p" variant="body1" color="text.secondary">
              Order online for reliable UK delivery. Every hamper is prepared to order for peak
              freshness and beautifully presented for an unforgettable gifting experience.
            </Typography>
          </Box>

          {/* FAQ for rich results */}
          <Box component="section" aria-label="Gift hampers FAQs" sx={{ mt: 6 }}>
            <Typography component="h2" variant="h3" className="mb-4 text-gray-800">
              Frequently Asked Questions
            </Typography>
            <StyledAccordion title="Do you deliver gift hampers across the UK?">
              <Typography component="p" variant="body1" color="text.secondary">
                Yes. We ship our gift hampers nationwide across the UK with careful packaging to
                ensure items arrive in perfect condition.
              </Typography>
            </StyledAccordion>
            <StyledAccordion title="Can I include a personalised message?">
              <Typography component="p" variant="body1" color="text.secondary">
                Absolutely. Add a personalised gift note at checkout and we will include it inside
                the hamper.
              </Typography>
            </StyledAccordion>
            <StyledAccordion title="Are your hampers suitable for corporate gifting?">
              <Typography component="p" variant="body1" color="text.secondary">
                Yes. We offer beautifully presented hampers ideal for client and team gifts. Contact
                us for bespoke quantities and branding.
              </Typography>
            </StyledAccordion>
          </Box>
        </Container>
      </main>
    </>
  );
}
