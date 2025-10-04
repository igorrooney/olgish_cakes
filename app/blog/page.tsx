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
import { getBlogPosts, getBlogCategories, BlogPost } from "@/lib/sanity-blog";
import { CategoryLinks } from "../components/CategoryLinks";

export const metadata: Metadata = {
  title:
    "Professional Cake Business Blog | Wedding & Corporate Cakes",
  description:
    "Professional insights into the cake business, wedding cake trends, corporate event planning, and custom cake design. Expert advice from Leeds' premier Ukrainian cake specialist.",
  keywords:
    "cake business blog, wedding cake trends, corporate cakes, custom cake design, cake business tips, professional cake decorator, Leeds cake specialist, Ukrainian cake business, event planning, cake industry insights",
  openGraph: {
    title:
      "Professional Cake Business Blog | Wedding & Corporate Cakes",
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
      "Professional Cake Business Blog | Wedding & Corporate Cakes",
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

export default async function BlogPage() {
  // Fetch blog posts and categories from Sanity
  const [blogPosts, categories] = await Promise.all([
    getBlogPosts({ status: 'published', limit: 20 }),
    getBlogCategories()
  ])

  // Transform Sanity data to match the expected format
  const transformedPosts = blogPosts.map((post: BlogPost) => ({
    id: post._id,
    title: post.title,
    excerpt: post.excerpt,
    description: post.description || post.excerpt, // Use description if available, fallback to excerpt
    image: post.cardImage?.asset?.url || post.featuredImage?.asset?.url || null,
    category: post.category,
    readTime: post.readTime,
    viewCount: post.viewCount || 0,
    date: post.publishDate ? new Date(post.publishDate).toISOString().split('T')[0] : new Date(post._createdAt).toISOString().split('T')[0],
    publishDate: post.publishDate || post._createdAt,
    slug: post.slug.current,
    featured: post.featured || false,
  }))

  // Add "All" category
  const allCategories = [
    { name: "All", count: transformedPosts.length },
    ...categories
  ]
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
      itemListElement: transformedPosts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          url: `https://olgishcakes.co.uk/blog/${post.slug}`,
          datePublished: post.publishDate,
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

              {/* Category Links for Internal SEO */}
              <CategoryLinks
                categories={categories.map(cat => cat.name)}
              />

              {/* Client Component for Interactive Features */}
              <BlogClient blogPosts={transformedPosts} categories={allCategories} />
        </Container>
      </Box>
    </>
  );
}