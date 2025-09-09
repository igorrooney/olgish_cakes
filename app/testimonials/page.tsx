import type { Metadata } from "next";
import { Container, Typography, Box, Paper } from "@mui/material";
import { TestimonialsList } from "./TestimonialsList";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { client } from "@/sanity/lib/client";
import { testimonialQuery, testimonialCountQuery } from "@/sanity/lib/queries";

// Force static generation
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "Customer Testimonials | Olgish Cakes Leeds",
  description:
    "Read what our customers say about their experience with Olgish Cakes. Real reviews and photos from our satisfied customers in Leeds.",
  openGraph: {
    title: "Customer Testimonials | Olgish Cakes Leeds",
    description:
      "Read what our customers say about their experience with Olgish Cakes. Real reviews and photos from our satisfied customers in Leeds.",
    url: "https://olgishcakes.co.uk/testimonials",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/testimonials.jpg",
        width: 1200,
        height: 630,
        alt: "Customer Testimonials - Olgish Cakes Leeds",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Customer Testimonials | Olgish Cakes Leeds",
    description:
      "Read what our customers say about their experience with Olgish Cakes. Real reviews and photos from our satisfied customers in Leeds.",
    images: ["https://olgishcakes.co.uk/images/testimonials.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/testimonials",
  },
  keywords: [
    "customer testimonials Olgish Cakes",
    "Ukrainian bakery reviews",
    "cake shop testimonials",
    "Ukrainian cake reviews",
    "bakery customer feedback",
    "cake shop reviews Leeds",
    "Ukrainian bakery testimonials",
    "cake delivery reviews",
    "wedding cake testimonials",
    "birthday cake reviews",
    "honey cake testimonials",
    "Medovik cake reviews",
    "Ukrainian dessert reviews",
    "bakery customer satisfaction",
    "cake shop feedback Leeds",
    "Ukrainian cake shop reviews",
  ],
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

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 6;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const [testimonials, totalCount] = await Promise.all([
    client.fetch(testimonialQuery, { start, end }),
    client.fetch(testimonialCountQuery),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Customer Testimonials - Olgish Cakes",
    description:
      "Read what our customers say about their experience with Olgish Cakes. Real reviews and photos from our satisfied customers in Leeds.",
    url: "https://olgishcakes.co.uk/testimonials",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
      },
    },
    mainEntity: {
      "@id": "https://olgishcakes.co.uk/#organization",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Box
        sx={{
          background: "linear-gradient(to right, #faf7f5, #ffffff, #faf7f5)",
          py: { xs: 6, md: 10 },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Testimonials", href: "/testimonials" },
              ]}
            />
          </Box>

          <Box
            className="text-center"
            sx={{
              maxWidth: "800px",
              mx: "auto",
              px: { xs: 2, md: 0 },
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Our Happy Customers
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                color: "text.secondary",
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.6,
                mb: 4,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                fontWeight: 400,
              }}
            >
              Discover what makes Olgish Cakes special through the words of our valued customers.
              Real experiences, genuine feedback.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                justifyContent: "center",
                flexWrap: "wrap",
                mb: 4,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  px: 3,
                  py: 2,
                  backgroundColor: "rgba(44, 82, 130, 0.1)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h3"
                  component="h3"
                  color="primary.main"
                  fontWeight="bold"
                  mb={1}
                >
                  {totalCount}+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Happy Customers
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  px: 3,
                  py: 2,
                  backgroundColor: "rgba(44, 82, 130, 0.1)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h3"
                  component="h3"
                  color="primary.main"
                  fontWeight="bold"
                  mb={1}
                >
                  5.0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 6, md: 10 },
        }}
      >
        <TestimonialsList testimonials={testimonials} currentPage={page} totalPages={totalPages} />
      </Container>
    </>
  );
}
