import type { Metadata } from "next";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Ukrainian Cake Recipes & Baking Blog | Traditional Ukrainian Desserts | Honey Cake (Medovik) | Olgish Cakes",
  description:
    "Discover authentic Ukrainian cake recipes, baking tips, and cultural stories. Learn to make traditional Ukrainian desserts like honey cake (Medovik), Kyiv cake, and more. Professional baking guidance from Ukrainian baker Olga.",
  keywords:
    "Ukrainian cake recipes, traditional Ukrainian desserts, honey cake recipe, Medovik recipe, Kyiv cake recipe, Ukrainian baking blog, Ukrainian dessert recipes, authentic Ukrainian cakes, Ukrainian baking tips, traditional medovik",
  openGraph: {
    title:
      "Ukrainian Cake Recipes & Baking Blog | Traditional Ukrainian Desserts | Honey Cake (Medovik)",
    description:
      "Discover authentic Ukrainian cake recipes, baking tips, and cultural stories. Learn to make traditional Ukrainian desserts like honey cake (Medovik), Kyiv cake, and more.",
    url: "https://olgish-cakes.vercel.app/blog",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgish-cakes.vercel.app/images/ukrainian-baking-blog.jpg",
        width: 1200,
        height: 630,
        alt: "Ukrainian Cake Recipes and Baking Blog - Honey Cake (Medovik) - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Ukrainian Cake Recipes & Baking Blog | Traditional Ukrainian Desserts | Honey Cake (Medovik)",
    description:
      "Discover authentic Ukrainian cake recipes, baking tips, and cultural stories. Learn to make traditional Ukrainian desserts like honey cake (Medovik), Kyiv cake, and more.",
    images: ["https://olgish-cakes.vercel.app/images/ukrainian-baking-blog.jpg"],
  },
  alternates: {
    canonical: "https://olgish-cakes.vercel.app/blog",
  },
};

const blogPosts = [
  {
    id: 1,
    title: "Traditional Honey Cake Recipe: The Perfect Ukrainian Honey Cake",
    excerpt:
      "Learn the authentic recipe for honey cake, Ukraine's beloved honey cake. Discover the secrets to creating the perfect layers and creamy filling.",
    image: "/images/blog/honey-cake-recipe.jpg",
    category: "Recipes",
    readTime: "8 min read",
    date: "2024-01-15",
    slug: "traditional-honey-cake-recipe",
  },
  {
    id: 2,
    title: "The History of Kyiv Cake: A Ukrainian Classic",
    excerpt:
      "Explore the fascinating history behind Kyiv cake, from its royal origins to becoming a symbol of Ukrainian culinary heritage.",
    image: "/images/blog/kyiv-cake-history.jpg",
    category: "Culture",
    readTime: "6 min read",
    date: "2024-01-10",
    slug: "kyiv-cake-history",
  },
  {
    id: 3,
    title: "Ukrainian Baking Traditions: From Generation to Generation",
    excerpt:
      "Discover how Ukrainian baking traditions have been passed down through generations and the cultural significance of traditional desserts.",
    image: "/images/blog/ukrainian-baking-traditions.jpg",
    category: "Culture",
    readTime: "10 min read",
    date: "2024-01-05",
    slug: "ukrainian-baking-traditions",
  },
  {
    id: 4,
    title: "Essential Ukrainian Baking Tools and Ingredients",
    excerpt:
      "A comprehensive guide to the essential tools and ingredients needed for authentic Ukrainian baking, from traditional equipment to modern alternatives.",
    image: "/images/blog/baking-tools-ingredients.jpg",
    category: "Tips",
    readTime: "7 min read",
    date: "2024-01-01",
    slug: "ukrainian-baking-tools-ingredients",
  },
  {
    id: 5,
    title: "Seasonal Ukrainian Cakes: Celebrating Throughout the Year",
    excerpt:
      "Explore how Ukrainian cakes change with the seasons, from Christmas honey cake to Easter celebrations and summer fruit cakes.",
    image: "/images/blog/seasonal-ukrainian-cakes.jpg",
    category: "Seasonal",
    readTime: "9 min read",
    date: "2023-12-28",
    slug: "seasonal-ukrainian-cakes",
  },
  {
    id: 6,
    title: "Customer Story: A Ukrainian Wedding Cake in Leeds",
    excerpt:
      "Read the heartwarming story of how we created the perfect Ukrainian wedding cake for a couple celebrating their heritage in Leeds.",
    image: "/images/blog/ukrainian-wedding-cake-story.jpg",
    category: "Stories",
    readTime: "5 min read",
    date: "2023-12-20",
    slug: "ukrainian-wedding-cake-story",
  },
];

export default function BlogPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Ukrainian Baking Blog",
    description:
      "Discover authentic Ukrainian cake recipes, baking tips, cultural stories, and the secrets behind traditional Ukrainian desserts.",
    url: "https://olgish-cakes.vercel.app/blog",
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgish-cakes.vercel.app/logo.png",
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
          url: `https://olgish-cakes.vercel.app/blog/${post.slug}`,
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
                { label: "Blog", href: "/blog" },
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
              Ukrainian Baking Blog
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Discover authentic Ukrainian cake recipes, baking tips, cultural stories, and the
              secrets behind traditional Ukrainian desserts. From honey cake to Kyiv cake, learn the
              art of Ukrainian baking from professional baker Olga.
            </Typography>
            <Chip
              label="Authentic Ukrainian Recipes & Stories"
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

          {/* Category Filter */}
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
              Browse by Category
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
              {["All", "Recipes", "Culture", "Tips", "Seasonal", "Stories"].map(category => (
                <Chip
                  key={category}
                  label={category}
                  variant={category === "All" ? "filled" : "outlined"}
                  sx={{
                    backgroundColor: category === "All" ? "primary.main" : "transparent",
                    color: category === "All" ? "white" : "primary.main",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Featured Post */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" sx={{ mb: 4, color: "primary.main", fontWeight: 600 }}>
              Featured Article
            </Typography>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      height: { xs: 300, md: 400 },
                      backgroundImage: "url(/images/blog/honey-cake-recipe.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CardContent
                    sx={{
                      p: 4,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Chip
                      label="Recipes"
                      size="small"
                      sx={{
                        mb: 2,
                        backgroundColor: "primary.main",
                        color: "white",
                        alignSelf: "flex-start",
                      }}
                    />
                    <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, lineHeight: 1.2 }}>
                      Traditional Honey Cake Recipe: The Perfect Ukrainian Honey Cake
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ mb: 3, color: "text.secondary", lineHeight: 1.6 }}
                    >
                      Learn the authentic recipe for honey cake, Ukraine's beloved honey cake.
                      Discover the secrets to creating the perfect layers and creamy filling that
                      make this traditional dessert so special.
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        January 15, 2024
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        • 8 min read
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      component={Link}
                      href="/blog/traditional-honey-cake-recipe"
                      sx={{
                        backgroundColor: "primary.main",
                        alignSelf: "flex-start",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                      }}
                    >
                      Read Full Recipe
                    </Button>
                  </CardContent>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Blog Posts Grid */}
          <Box>
            <Typography variant="h4" sx={{ mb: 4, color: "primary.main", fontWeight: 600 }}>
              Latest Articles
            </Typography>
            <Grid container spacing={4}>
              {blogPosts.slice(1).map(post => (
                <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardMedia component="img" height="200" image={post.image} alt={post.title} />
                    <CardContent sx={{ p: 3 }}>
                      <Chip
                        label={post.category}
                        size="small"
                        sx={{ mb: 2, backgroundColor: "primary.main", color: "white" }}
                      />
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, lineHeight: 1.3 }}>
                        {post.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mb: 2, color: "text.secondary", lineHeight: 1.5 }}
                      >
                        {post.excerpt}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {new Date(post.date).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          • {post.readTime}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        component={Link}
                        href={`/blog/${post.slug}`}
                        sx={{
                          borderColor: "primary.main",
                          color: "primary.main",
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Newsletter Signup */}
          <Box sx={{ mt: 8, textAlign: "center" }}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
                color: "white",
              }}
            >
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                Stay Updated with Ukrainian Baking
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Get the latest Ukrainian recipes, baking tips, and cultural stories delivered to
                your inbox.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "white",
                  color: "primary.main",
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                Subscribe to Newsletter
              </Button>
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  );
}
