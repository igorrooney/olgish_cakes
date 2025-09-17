import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Link from "next/link";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title:
    "Professional Cake Business Blog | Wedding Cakes, Corporate Events & Custom Cakes | Olgish Cakes Leeds",
  description:
    "Professional insights into the cake business, wedding cake trends, corporate event planning, and custom cake design. Expert advice from Leeds' premier Ukrainian cake specialist.",
  keywords:
    "cake business blog, wedding cake trends, corporate cakes, custom cake design, cake business tips, professional cake decorator, Leeds cake specialist, Ukrainian cake business, event planning, cake industry insights",
  openGraph: {
    title:
      "Professional Cake Business Blog | Wedding Cakes, Corporate Events & Custom Cakes",
    description:
      "Professional insights into the cake business, wedding cake trends, corporate event planning, and custom cake design. Expert advice from Leeds' premier Ukrainian cake specialist.",
    url: "https://olgishcakes.co.uk/blog",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/professional-cake-business-blog.jpg",
        width: 1200,
        height: 630,
        alt: "Professional Cake Business Blog - Wedding Cakes, Corporate Events & Custom Cakes - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Professional Cake Business Blog | Wedding Cakes, Corporate Events & Custom Cakes",
    description:
      "Professional insights into the cake business, wedding cake trends, corporate event planning, and custom cake design. Expert advice from Leeds' premier Ukrainian cake specialist.",
    images: ["https://olgishcakes.co.uk/images/professional-cake-business-blog.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/blog",
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

const blogPosts = [
  {
    id: 1,
    title: "Cake by Post UK: Complete Guide to Letterbox Cake Delivery 2025 | Best Postal Cakes Leeds",
    excerpt:
      "Everything what you need to know about sending cakes by post in UK. I will tell you about best cakes for letterbox, how delivery works, and how to surprise your family with nice postal cakes. From my experience running cake business in Leeds.",
    image: undefined, // No image provided - will use brand logo
    category: "Business Guide",
    readTime: "12 min read",
    date: "2025-09-17",
    slug: "cake-by-post-uk-complete-guide",
    featured: true,
  },
  {
    id: 2,
    title: "Best Cakes You Can Send by Post UK 2025 | Letterbox Friendly Cakes Leeds",
    excerpt:
      "Find out which cakes are perfect for sending by post in UK. I learned from experience which ones travel good and how to make sure your postal cakes arrive in perfect condition. Working with customers from Leeds and all over UK.",
    image: null, // No image provided - will use brand logo
    category: "Cake by Post",
    readTime: "8 min read",
    date: "2025-09-16",
    slug: "best-cakes-you-can-send-by-post-uk",
  },
  {
    id: 3,
    title: "How to Surprise Someone with Cake Delivery by Post UK | Postal Cake Ideas Leeds",
    excerpt:
      "Creative ideas how to surprise your loved ones with cake delivery by post. Some tips from my experience to make special moments more memorable with postal cake surprises. Perfect for birthdays, anniversaries, and special occasions.",
    image: undefined, // No image provided - will use placeholder
    category: "Cake by Post",
    readTime: "6 min read",
    date: "2025-09-15",
    slug: "how-surprise-someone-cake-delivery-post",
  },
  {
    id: 4,
    title: "Why Order Letterbox Cakes Online UK 2025 | Best Postal Cake Delivery Leeds",
    excerpt:
      "Why letterbox cakes are becoming more popular choice for many customers. Discover the benefits of ordering cakes online for postal delivery from my experience. Convenient, fresh, and perfect for any occasion.",
    image: null, // No image provided - will use placeholder
    category: "Cake by Post",
    readTime: "5 min read",
    date: "2025-09-14",
    slug: "top-5-reasons-order-letterbox-cakes-online",
  },
];

const categories = [
  { name: "All", count: blogPosts.length },
  { name: "Business Guide", count: blogPosts.filter(post => post.category === "Business Guide").length },
  { name: "Cake by Post", count: blogPosts.filter(post => post.category === "Cake by Post").length },
];

export default function BlogPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Professional Cake Business Blog",
    description:
      "Professional insights into the cake business, wedding cake trends, corporate event planning, and custom cake design. Expert advice from Leeds' premier Ukrainian cake specialist.",
    url: "https://olgishcakes.co.uk/blog",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
      },
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: blogPosts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          url: `https://olgishcakes.co.uk/blog/${post.slug}`,
          datePublished: post.date,
          author: {
            "@type": "Person",
            name: "Olga",
          },
          publisher: {
            "@type": "Organization",
            name: "Olgish Cakes",
          },
        },
      })),
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
          backgroundColor: "#ffffff",
          minHeight: "100vh",
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
              ]}
            />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "#2E3192",
                mb: 2,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Blog
            </Typography>
          </Box>

          {/* Client Component for Interactive Features */}
          <BlogClient blogPosts={blogPosts} categories={categories} />
        </Container>
      </Box>
    </>
  );
}