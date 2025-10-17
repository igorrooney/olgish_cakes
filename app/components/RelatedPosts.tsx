'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Typography, Card, CardContent, CardMedia, Grid, Chip, Stack } from '@mui/material';
import { urlFor } from '@/sanity/lib/image';

interface RelatedPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  excerpt: string;
  category: string;
  readTime: string;
  featuredImage?: {
    asset: {
      _ref: string;
      url: string;
    };
    alt?: string;
  };
  cardImage?: {
    asset: {
      _ref: string;
      url: string;
    };
    alt?: string;
  };
  publishDate?: string;
  featured?: boolean;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  currentPostId: string;
  currentCategory: string;
}

export function RelatedPosts({ posts, currentPostId, currentCategory }: RelatedPostsProps) {
  // Filter out current post and prioritize by category relevance
  const filteredPosts = posts
    .filter(post => post._id !== currentPostId)
    .sort((a, b) => {
      // Prioritize same category posts
      if (a.category === currentCategory && b.category !== currentCategory) return -1;
      if (b.category === currentCategory && a.category !== currentCategory) return 1;

      // Then prioritize featured posts
      if (a.featured && !b.featured) return -1;
      if (b.featured && !a.featured) return 1;

      // Finally sort by publish date
      return new Date(b.publishDate || '').getTime() - new Date(a.publishDate || '').getTime();
    })
    .slice(0, 3); // Show maximum 3 related posts

  if (filteredPosts.length === 0) return null;

  return (
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
        You Might Also Like
      </Typography>

      <Grid container spacing={4}>
        {filteredPosts.map((post) => {
          const imageUrl = post.cardImage?.asset?.url || post.featuredImage?.asset?.url;
          const imageAlt = post.cardImage?.alt || post.featuredImage?.alt || post.title;

          return (
            <Grid item xs={12} md={4} key={post._id}>
              <Card
                component={Link}
                href={`/blog/${post.slug.current}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    borderColor: '#2E3192',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 200,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={imageUrl ? urlFor(imageUrl).url() : "/images/olgish-cakes-logo-bakery-brand.png"}
                    alt={imageAlt}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {post.featured && (
                    <Chip
                      label="Featured"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: '#2E3192',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {[post.category].slice(0, 2).map(category => (
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
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      mb: 2,
                      lineHeight: 1.5,
                      fontSize: "0.9rem",
                    }}
                  >
                    {post.excerpt}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Link
          href="/blog"
          aria-label="Browse all blog posts about Ukrainian cakes"
          style={{
            color: '#2E3192',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          View All Blog Posts
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12H19M12 5L19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </Box>
    </Box>
  );
}
