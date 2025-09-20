import { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { ViewTracker } from "@/app/components/ViewTracker";
import { RelatedPosts } from "@/app/components/RelatedPosts";
import { CategoryLinks } from "@/app/components/CategoryLinks";
import { getRelatedPosts, getBlogPost, getBlogCategories } from "@/lib/sanity-blog";

// Simple markdown parser function
function parseMarkdown(content: string) {
  // Helper function to process inline formatting
  const processInlineFormatting = (text: string) => {
    // Check if the entire text is wrapped in bold markers
    const isBoldWrapped = text.startsWith('**') && text.endsWith('**');
    
    // First split by links to handle them separately
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = text.split(linkRegex);
    
    const result = parts.map((part, index) => {
      // Check if this part is a link text (odd indices after splitting by linkRegex)
      if (index % 3 === 1) {
        const url = parts[index + 1];
        return (
          <Link
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#2E3192",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            {part}
          </Link>
        );
      }
      // Check if this part is a URL (even indices after splitting by linkRegex, but skip the text)
      if (index % 3 === 2) {
        return null; // Skip URL parts as they're handled with the text
      }
      // Regular text - process for bold formatting
      if (part) {
        // If the entire text is bold-wrapped, treat all parts as bold
        if (isBoldWrapped) {
          // Remove leading ** from first part and trailing ** from last part
          let processedPart = part;
          if (index === 0) {
            processedPart = part.replace(/^\*\*/, '');
          }
          if (index === parts.length - 1) {
            processedPart = processedPart.replace(/\*\*$/, '');
          }
          
          return (
            <Box key={index} component="strong" sx={{ fontWeight: 600 }}>
              {processedPart}
            </Box>
          );
        } else {
          // Normal bold processing
          const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
          return boldParts.map((boldPart, boldIndex) => {
            if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
              const boldText = boldPart.slice(2, -2);
              return (
                <Box key={`${index}-${boldIndex}`} component="strong" sx={{ fontWeight: 600 }}>
                  {boldText}
                </Box>
              );
            }
            return boldPart;
          });
        }
      }
      return part;
    }).filter(Boolean);
    
    return result;
  };

  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: JSX.Element[] = [];
  
  lines.forEach((line, index) => {
    // Headers
    if (line.startsWith('### ')) {
      if (currentList.length > 0) {
        elements.push(
          <Box key={`list-${index}`} component="ul" sx={{ pl: 3, mb: 2 }}>
            {currentList}
          </Box>
        );
        currentList = [];
      }
      elements.push(
        <Typography
          key={index}
          variant="h5"
          sx={{
            color: "#2E3192",
            fontWeight: 600,
            mb: 2,
            mt: 2,
            fontSize: { xs: "1.1rem", md: "1.25rem" },
          }}
        >
          {processInlineFormatting(line.replace('### ', ''))}
        </Typography>
      );
    } else if (line.startsWith('## ')) {
      if (currentList.length > 0) {
        elements.push(
          <Box key={`list-${index}`} component="ul" sx={{ pl: 3, mb: 2 }}>
            {currentList}
          </Box>
        );
        currentList = [];
      }
      elements.push(
        <Typography
          key={index}
          variant="h4"
          sx={{
            color: "#2E3192",
            fontWeight: 600,
            mb: 2,
            mt: 3,
            fontSize: { xs: "1.25rem", md: "1.5rem" },
          }}
        >
          {processInlineFormatting(line.replace('## ', ''))}
        </Typography>
      );
    } else if (line.startsWith('# ')) {
      if (currentList.length > 0) {
        elements.push(
          <Box key={`list-${index}`} component="ul" sx={{ pl: 3, mb: 2 }}>
            {currentList}
          </Box>
        );
        currentList = [];
      }
      elements.push(
        <Typography
          key={index}
          variant="h3"
          sx={{
            color: "#2E3192",
            fontWeight: 600,
            mb: 2,
            mt: 4,
            fontSize: { xs: "1.5rem", md: "2rem" },
          }}
        >
          {processInlineFormatting(line.replace('# ', ''))}
        </Typography>
      );
    } else if (line.startsWith('- ')) {
      // Unordered lists
      currentList.push(
        <Box key={index} component="li" sx={{ mb: 1 }}>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.7,
              color: "#374151",
              fontSize: "1rem",
            }}
          >
            {processInlineFormatting(line.replace('- ', ''))}
          </Typography>
        </Box>
      );
    } else if (/^\d+\.\s/.test(line)) {
      // Numbered lists
      currentList.push(
        <Box key={index} component="li" sx={{ mb: 1 }}>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.7,
              color: "#374151",
              fontSize: "1rem",
            }}
          >
            {processInlineFormatting(line.replace(/^\d+\.\s/, ''))}
          </Typography>
        </Box>
      );
    } else if (line.trim() === '') {
      // Empty lines
      if (currentList.length > 0) {
        elements.push(
          <Box key={`list-${index}`} component="ul" sx={{ pl: 3, mb: 2 }}>
            {currentList}
          </Box>
        );
        currentList = [];
      }
      elements.push(<Box key={index} sx={{ mb: 1 }} />);
    } else {
      // Regular paragraphs
      if (currentList.length > 0) {
        elements.push(
          <Box key={`list-${index}`} component="ul" sx={{ pl: 3, mb: 2 }}>
            {currentList}
          </Box>
        );
        currentList = [];
      }
      elements.push(
        <Typography
          key={index}
          variant="body1"
          sx={{
            mb: 2,
            lineHeight: 1.7,
            color: "#374151",
            fontSize: "1rem",
          }}
        >
          {processInlineFormatting(line)}
        </Typography>
      );
    }
  });
  
  // Add any remaining list items
  if (currentList.length > 0) {
    elements.push(
      <Box key="final-list" component="ul" sx={{ pl: 3, mb: 2 }}>
        {currentList}
      </Box>
    );
  }
  
  return elements;
}

// PortableText components configuration
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      const getImageDimensions = (size: string) => {
        switch (size) {
          case 'small':
            return { width: 400, height: 300, maxWidth: '300px' };
          case 'medium':
            return { width: 800, height: 500, maxWidth: '600px' };
          case 'large':
            return { width: 1200, height: 600, maxWidth: '800px' };
          case 'full':
            return { width: 1400, height: 700, maxWidth: '100%' };
          default:
            return { width: 800, height: 500, maxWidth: '600px' };
        }
      };

      const dimensions = getImageDimensions(value.size || 'medium');
      
      return (
        <Box sx={{ 
          my: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Image
            src={urlFor(value).width(dimensions.width).height(dimensions.height).url()}
            alt={value.alt || 'Blog image'}
            width={dimensions.width}
            height={dimensions.height}
            style={{
              borderRadius: value.size === 'full' ? '0' : '12px',
              maxWidth: dimensions.maxWidth,
              width: '100%',
              height: 'auto',
              boxShadow: value.size === 'full' ? 'none' : '0 8px 32px rgba(0,0,0,0.1)',
            }}
            sizes={value.size === 'full' 
              ? '100vw' 
              : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
            }
          />
          {value.caption && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: '#64748b',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                maxWidth: dimensions.maxWidth,
              }}
            >
              {value.caption}
            </Typography>
          )}
        </Box>
      );
    },
  },
  block: {
    h2: ({ children }: any) => (
      <Typography
        variant="h3"
        sx={{
          color: "#2E3192",
          fontWeight: 600,
          mb: 2,
          mt: 4,
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        {children}
      </Typography>
    ),
    h3: ({ children }: any) => (
      <Typography
        variant="h4"
        sx={{
          color: "#2E3192",
          fontWeight: 600,
          mb: 2,
          mt: 3,
          fontSize: { xs: "1.25rem", md: "1.5rem" },
        }}
      >
        {children}
      </Typography>
    ),
    h4: ({ children }: any) => (
      <Typography
        variant="h5"
        sx={{
          color: "#2E3192",
          fontWeight: 600,
          mb: 2,
          mt: 2,
          fontSize: { xs: "1.1rem", md: "1.25rem" },
        }}
      >
        {children}
      </Typography>
    ),
    normal: ({ children }: any) => (
      <Typography
        variant="body1"
        sx={{
          mb: 2,
          lineHeight: 1.7,
          color: "#374151",
          fontSize: "1rem",
        }}
      >
        {children}
      </Typography>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <Box component="ul" sx={{ pl: 3, mb: 2 }}>
        {children}
      </Box>
    ),
    number: ({ children }: any) => (
      <Box component="ol" sx={{ pl: 3, mb: 2 }}>
        {children}
      </Box>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <Box component="li" sx={{ mb: 1 }}>
        {children}
      </Box>
    ),
    number: ({ children }: any) => (
      <Box component="li" sx={{ mb: 1 }}>
        {children}
      </Box>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <Box component="strong" sx={{ fontWeight: 600 }}>
        {children}
      </Box>
    ),
    em: ({ children }: any) => (
      <Box component="em" sx={{ fontStyle: 'italic' }}>
        {children}
      </Box>
    ),
    link: ({ children, value }: any) => (
      <Link
        href={value.href}
        style={{
          color: "#2E3192",
          textDecoration: "underline",
        }}
      >
        {children}
      </Link>
    ),
  },
};
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
  const query = groq`*[_type == "blogPost" && defined(slug.current)] {
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
  publishDate: string;
  author: {
    name: string;
    image?: any;
  };
  category: string;
  featuredImage?: any;
  readTime: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface BlogPostPageProps {
  params: { slug: string };
}



export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | Olgish Cakes",
      description: "The requested blog post could not be found.",
    };
  }

  // Type assertion after null check
  const blogPost = post as any;

  const imageUrl = blogPost.featuredImage
    ? urlFor(blogPost.featuredImage).url()
    : "/images/placeholder-cake.jpg";

  return {
    title: blogPost.seoTitle || `${blogPost.title} | Olgish Cakes Blog`,
    description: blogPost.seoDescription || blogPost.excerpt,
    keywords: blogPost.keywords ? blogPost.keywords.join(", ") : "Ukrainian cakes, honey cake, Leeds bakery, custom cakes, wedding cakes, professional baker",
    openGraph: {
      title: blogPost.title,
      description: blogPost.excerpt,
      type: "article",
      publishedTime: blogPost.publishDate,
      authors: [blogPost.author?.name || "Olga"],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blogPost.title,
        },
      ],
      siteName: "Olgish Cakes",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: blogPost.title,
      description: blogPost.excerpt,
      images: [imageUrl],
      creator: "@olgishcakes",
      site: "@olgishcakes",
    },
    alternates: {
      canonical: `https://olgishcakes.co.uk/blog/${params.slug}`,
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
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post._id, post.category, 3);
  const categories = await getBlogCategories();
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
      name: post.author?.name || "Olga",
      url: "https://olgishcakes.co.uk/about",
      jobTitle: "Professional Baker",
      worksFor: {
        "@type": "Organization",
        name: "Olgish Cakes"
      }
    },
    publisher: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      logo: {
        "@type": "ImageObject",
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        width: 200,
        height: 60
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Allerton Grange",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        postalCode: "LS17",
        addressCountry: "GB"
      }
    },
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    wordCount: post.content ? post.content.length : 0,
    timeRequired: `PT${post.readTime}M`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://olgishcakes.co.uk/blog/${params.slug}`,
    },
    articleBody: post.content ? post.content : post.excerpt,
    keywords: (post as any).keywords ? (post as any).keywords.join(", ") : "Ukrainian cakes, honey cake, Leeds bakery, custom cakes",
    inLanguage: "en-GB",
    isPartOf: {
      "@type": "Blog",
      name: "Olgish Cakes Blog",
      url: "https://olgishcakes.co.uk/blog"
    }
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://olgishcakes.co.uk"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://olgishcakes.co.uk/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://olgishcakes.co.uk/blog/${params.slug}`
      }
    ]
  };

  // Image structured data for better image search
  const imageStructuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `${post.title} - Image Gallery`,
    "description": `Images related to ${post.title}`,
    "url": `https://olgishcakes.co.uk/blog/${params.slug}`,
    "mainEntity": {
      "@type": "ImageObject",
      "contentUrl": imageUrl,
      "name": post.title,
      "description": post.excerpt,
      "caption": post.featuredImage?.alt || post.title,
      "creator": {
        "@type": "Person",
        "name": post.author?.name || "Olga"
      },
      "creditText": `Photography by Olgish Cakes - Professional Ukrainian Bakery in Leeds`,
      "copyrightNotice": `© ${new Date().getFullYear()} Olgish Cakes. All rights reserved. Traditional Ukrainian honey cake photography.`,
      "copyrightHolder": {
        "@type": "Organization",
        "name": "Olgish Cakes"
      },
      "license": "https://olgishcakes.co.uk/terms",
      "acquireLicensePage": "https://olgishcakes.co.uk/contact",
      "thumbnailUrl": imageUrl,
      "width": "1200",
      "height": "630",
      "encodingFormat": "image/jpeg",
      "isFamilyFriendly": true,
      "keywords": (post as any).keywords ? (post as any).keywords.join(", ") : "Ukrainian cakes, honey cake, Leeds bakery, custom cakes",
      "datePublished": post.publishDate,
      "dateModified": post.publishDate
    }
  };

  return (
    <>
      <ViewTracker postId={post._id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageStructuredData) }}
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

          {/* Back to Blog Button */}
          <Box sx={{ mb: 4 }}>
            <Button
              component={Link}
              href="/blog"
              variant="outlined"
              startIcon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12H5M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              sx={{
                borderColor: "#2E3192",
                color: "#2E3192",
                px: 3,
                py: 1.5,
                fontSize: "0.95rem",
                fontWeight: 500,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#2E3192",
                  color: "white",
                  borderColor: "#2E3192",
                },
                transition: "all 0.3s ease",
              }}
            >
              Back to Blog
            </Button>
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
                  {[post.category].map(category => (
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
                    <Image
                      src="/android-chrome-192x192.png"
                      alt="Author Avatar"
                      width={48}
                      height={48}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {post.author?.name || "Olga"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Professional baker
                    </Typography>
                  </Box>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {post.publishDate ? new Date(post.publishDate).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "No date"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  • {post.readTime} min read
                </Typography>
              </Box>
            </Paper>

            {/* Featured Image */}
            {post.featuredImage && (
              <Box sx={{ mb: 6 }}>
                <Image
                  src={imageUrl}
                  alt={post.featuredImage?.alt || `${post.title} - Featured image showing ${post.category} cake design`}
                  width={1200}
                  height={600}
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "cover",
                    borderRadius: "16px",
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  priority
                  title={`${post.title} - Professional ${post.category} cake`}
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
                {typeof post.content === 'string' ? (
                  <Box>
                    {parseMarkdown(post.content)}
                  </Box>
                ) : (
                  <Box>
                    <PortableText value={post.content} components={portableTextComponents} />
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Related Posts Section */}
            <RelatedPosts 
              posts={relatedPosts} 
              currentPostId={post._id} 
              currentCategory={post.category} 
            />

            {/* Category Links Section */}
            <CategoryLinks 
              currentCategory={post.category}
              categories={categories.map(cat => cat.name)} 
            />

            {/* Professional CTA Section */}
            <Paper
              elevation={3}
              sx={{
                p: { xs: 5, md: 8 },
                borderRadius: 3,
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                color: "#1a202c",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(45deg, rgba(46, 49, 146, 0.02) 0%, rgba(254, 241, 2, 0.02) 100%)",
                  pointerEvents: "none",
                },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontSize: { xs: "2rem", md: "2.8rem" },
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Let's Create Something Special
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    fontWeight: 400,
                    maxWidth: "700px",
                    mx: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  Transform your vision into an exquisite custom cake. From intimate celebrations to grand events, 
                  I deliver exceptional Ukrainian craftsmanship tailored to your unique occasion.
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 2,
                    mb: 4,
                    maxWidth: "500px",
                    mx: "auto",
                  }}
                >
                  <Chip
                    label="Wedding Cakes"
                    sx={{
                      backgroundColor: "#2E3192",
                      color: "white",
                      fontWeight: 500,
                      px: 2,
                      "&:hover": {
                        backgroundColor: "#1e2470",
                      },
                    }}
                  />
                  <Chip
                    label="Corporate Events"
                    sx={{
                      backgroundColor: "#2E3192",
                      color: "white",
                      fontWeight: 500,
                      px: 2,
                      "&:hover": {
                        backgroundColor: "#1e2470",
                      },
                    }}
                  />
                  <Chip
                    label="Special Occasions"
                    sx={{
                      backgroundColor: "#2E3192",
                      color: "white",
                      fontWeight: 500,
                      px: 2,
                      "&:hover": {
                        backgroundColor: "#1e2470",
                      },
                    }}
                  />
                </Box>
                
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
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
                      px: 5,
                      py: 2,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "0 4px 14px rgba(254, 241, 2, 0.3)",
                      "&:hover": {
                        backgroundColor: "rgba(254, 241, 2, 0.9)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(254, 241, 2, 0.4)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Request Custom Quote
                  </Button>
                  <Button
                    component={Link}
                    href="/contact"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "#2E3192",
                      color: "#2E3192",
                      px: 5,
                      py: 2,
                      fontSize: "1.1rem",
                      fontWeight: 500,
                      borderRadius: 2,
                      textTransform: "none",
                      borderWidth: 2,
                      "&:hover": {
                        backgroundColor: "#2E3192",
                        color: "white",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(46, 49, 146, 0.3)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Schedule Consultation
                  </Button>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 3,
                    color: "#64748b",
                    fontSize: "0.9rem",
                    fontStyle: "italic",
                  }}
                >
                  Free consultation • Custom design • Professional delivery
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  );
}