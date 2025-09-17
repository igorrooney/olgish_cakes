import { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import Image from "next/image";
import { 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Box,
  Container,
  Avatar,
  Divider,
  Stack,
  Paper,
  Grid,
} from "@mui/material";
import { Breadcrumbs } from "../../components/Breadcrumbs";

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  const query = groq`*[_type == "post" && defined(slug.current)] {
    "slug": slug.current
  }`;
  
  try {
    const posts = await client.fetch(query);
    return posts.map((post: { slug: string }) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for blog posts:", error);
    return [];
  }
}

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  content: any;
  publishedAt: string;
  author: {
    name: string;
    image?: any;
  };
  categories: string[];
  featuredImage?: any;
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
}

interface BlogPostPageProps {
  params: { slug: string };
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const query = groq`
      *[_type == "blogPost" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        excerpt,
        content,
        publishedAt,
        author->{
          name,
          image
        },
        categories,
        featuredImage,
        "readingTime": round(length(pt::text(content)) / 200),
        seoTitle,
        seoDescription
      }
    `;

    const post = await client.fetch(query, { slug });
    return post;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

async function getRelatedPosts(categories: string[], currentSlug: string): Promise<BlogPost[]> {
  try {
    const query = groq`
      *[_type == "blogPost" && slug.current != $currentSlug && count(categories[value in $categories]) > 0] | order(publishedAt desc)[0...3] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        featuredImage,
        categories
      }
    `;

    const posts = await client.fetch(query, { categories, currentSlug });
    return posts;
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | Olgish Cakes",
      description: "The requested blog post could not be found.",
    };
  }

  const imageUrl = post.featuredImage
    ? urlFor(post.featuredImage).url()
    : "/images/placeholder-cake.jpg";

  return {
    title: post.seoTitle || `${post.title} | Olgish Cakes Blog`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://olgishcakes.co.uk/blog/${params.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.categories, params.slug);
  const imageUrl = post.featuredImage
    ? urlFor(post.featuredImage).url()
    : "/images/placeholder-cake.jpg";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: imageUrl,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://olgishcakes.co.uk/blog/${params.slug}`,
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
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.title, href: `/blog/${params.slug}` },
              ]}
            />
          </Box>

          <Box sx={{ maxWidth: "800px", mx: "auto" }}>
            {/* Article Header */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                mb: 6,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Categories */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {post.categories.map(category => (
                    <Chip
                      key={category}
                      label={category}
                      sx={{
                        backgroundColor: "#2E3192",
                        color: "white",
                        fontSize: "0.8rem",
                        mb: 1,
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Title */}
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontFamily: "var(--font-playfair-display)",
                  fontSize: { xs: "2rem", md: "3rem" },
                  fontWeight: 700,
                  color: "#1e293b",
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                {post.title}
              </Typography>

              {/* Excerpt */}
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  color: "#64748b",
                  mb: 4,
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                {post.excerpt}
              </Typography>

              {/* Author and Meta Info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ width: 48, height: 48, backgroundColor: "#2E3192" }}>
                    {post.author.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {post.author.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Professional Cake Designer
                    </Typography>
                  </Box>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  • {post.readingTime} min read
                </Typography>
              </Box>
            </Paper>

            {/* Featured Image */}
            {post.featuredImage && (
              <Box sx={{ mb: 6 }}>
                <Image
                  src={imageUrl}
                  alt={post.title}
                  width={1200}
                  height={600}
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "cover",
                    borderRadius: "16px",
                  }}
                  priority
                />
              </Box>
            )}

            {/* Article Content */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                mb: 8,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
              }}
            >
              <Box
                sx={{
                  "& .prose": {
                    color: "#374151",
                    fontSize: "1.1rem",
                    lineHeight: 1.7,
                    "& h1, & h2, & h3, & h4, & h5, & h6": {
                      color: "#1e293b",
                      fontWeight: 600,
                      mt: 4,
                      mb: 2,
                    },
                    "& h2": {
                      fontSize: "1.8rem",
                      borderBottom: "2px solid #e2e8f0",
                      pb: 1,
                    },
                    "& h3": {
                      fontSize: "1.5rem",
                    },
                    "& p": {
                      mb: 3,
                    },
                    "& ul, & ol": {
                      mb: 3,
                      pl: 3,
                    },
                    "& li": {
                      mb: 1,
                    },
                    "& blockquote": {
                      borderLeft: "4px solid #2E3192",
                      pl: 3,
                      py: 2,
                      backgroundColor: "#f8fafc",
                      borderRadius: "0 8px 8px 0",
                      fontStyle: "italic",
                      mb: 3,
                    },
                    "& img": {
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  },
                }}
              >
                <PortableText value={post.content} />
              </Box>
            </Paper>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <Box sx={{ mb: 8 }}>
                <Typography
                  variant="h3"
                  sx={{
                    mb: 4,
                    color: "#2E3192",
                    fontWeight: 600,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                    textAlign: "center",
                  }}
                >
                  Related Articles
                </Typography>
                <Grid container spacing={4}>
                  {relatedPosts.map(relatedPost => (
                    <Grid item xs={12} md={4} key={relatedPost._id}>
                      <Card
                        sx={{
                          height: "100%",
                          borderRadius: 3,
                          overflow: "hidden",
                          border: "1px solid #e2e8f0",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            transition: "all 0.3s ease-in-out",
                            boxShadow: "0 12px 24px rgba(46, 49, 146, 0.1)",
                          },
                        }}
                      >
                        {relatedPost.featuredImage && (
                          <Image
                            src={urlFor(relatedPost.featuredImage).url()}
                            alt={relatedPost.title}
                            width={400}
                            height={200}
                            style={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {relatedPost.categories.slice(0, 2).map(category => (
                                <Chip
                                  key={category}
                                  label={category}
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    borderColor: "#2E3192",
                                    color: "#2E3192",
                                    fontSize: "0.7rem",
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 600,
                              mb: 2,
                              color: "#1e293b",
                              fontSize: "1.1rem",
                              lineHeight: 1.3,
                            }}
                          >
                            {relatedPost.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#64748b",
                              mb: 3,
                              lineHeight: 1.5,
                              fontSize: "0.9rem",
                            }}
                          >
                            {relatedPost.excerpt}
                          </Typography>
                          <Button
                            component={Link}
                            href={`/blog/${relatedPost.slug.current}`}
                            variant="outlined"
                            size="small"
                            sx={{
                              borderColor: "#2E3192",
                              color: "#2E3192",
                              "&:hover": {
                                backgroundColor: "#2E3192",
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
            )}

            {/* CTA Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 4,
                background: "linear-gradient(135deg, #2E3192 0%, #1e2470 100%)",
                color: "white",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  fontSize: { xs: "1.8rem", md: "2.5rem" },
                }}
              >
                Ready to Work Together?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  maxWidth: "600px",
                  mx: "auto",
                }}
              >
                Inspired by this article? Let me create a custom cake for your special occasion. 
                From weddings to corporate events, I bring professional expertise to every project.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  component={Link}
                  href="/get-custom-quote"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: "#FEF102",
                    color: "#2E3192",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "rgba(254, 241, 2, 0.9)",
                    },
                  }}
                >
                  Get Custom Quote
                </Button>
                <Button
                  component={Link}
                  href="/contact"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Contact Us
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  );
}