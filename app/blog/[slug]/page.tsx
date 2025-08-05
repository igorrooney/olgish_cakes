import { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import Image from "next/image";
import { Button, Typography, Card, CardContent, Chip } from "@mui/material";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map(category => (
                <Chip key={category} label={category} color="primary" variant="outlined" />
              ))}
            </div>

            <Typography
              variant="h2"
              component="h1"
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              {post.title}
            </Typography>

            <Typography variant="h3" className="text-xl text-gray-600 mb-6">
              {post.excerpt}
            </Typography>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>👤 {post.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  📅{" "}
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>⏱️ {post.readingTime} min read</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8">
              <Image
                src={imageUrl}
                alt={post.title}
                width={1200}
                height={600}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <PortableText value={post.content} />
          </div>

          <hr className="my-12" />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mb-12">
              <Typography variant="h3" className="text-3xl font-bold text-center mb-6">
                Related Articles
              </Typography>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Card
                    key={relatedPost._id}
                    sx={{
                      overflow: "hidden",
                      "&:hover": { boxShadow: 6 },
                      transition: "box-shadow 0.3s",
                    }}
                  >
                    {relatedPost.featuredImage && (
                      <Image
                        src={urlFor(relatedPost.featuredImage).url()}
                        alt={relatedPost.title}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {relatedPost.categories.slice(0, 2).map(category => (
                          <Chip key={category} label={category} size="small" variant="outlined" />
                        ))}
                      </div>
                      <Typography variant="h4" className="font-semibold text-lg mb-2">
                        {relatedPost.title}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 mb-4">
                        {relatedPost.excerpt}
                      </Typography>
                      <Link href={`/blog/${relatedPost.slug.current}`}>
                        <Button variant="outlined" size="small">
                          Read More
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white text-center">
            <Typography variant="h3" className="text-2xl font-bold mb-4">
              Ready to Order Your Perfect Cake?
            </Typography>
            <Typography variant="h4" className="text-blue-100 mb-6">
              Inspired by our blog? Let us create a custom cake for your special occasion.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cakes">
                <Button
                  size="large"
                  sx={{
                    bgcolor: "yellow.500",
                    color: "gray.900",
                    "&:hover": { bgcolor: "yellow.600" },
                  }}
                >
                  Browse Our Cakes
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="large"
                  variant="outlined"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": { bgcolor: "white", color: "blue.700" },
                  }}
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
