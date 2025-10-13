"use client";

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
  Avatar,
  Divider,
  Stack,
  Pagination,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  image?: string | null;
  category: string;
  readTime: string;
  viewCount?: number;
  date: string;
  publishDate: string;
  slug: string;
  featured?: boolean;
}

interface BlogClientProps {
  blogPosts: BlogPost[];
  categories: Array<{ name: string; count: number }>;
}

export default function BlogClient({ blogPosts, categories }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const postsPerPage = 6;

  // Fetch view counts for all posts
  useEffect(() => {
    const fetchViewCounts = async () => {
      const counts: Record<string, number> = {};

      for (const post of blogPosts) {
        try {
          const response = await fetch(`/api/blog-posts/${post.id}/view`);
          if (response.ok) {
            const data = await response.json();
            counts[post.id] = data.viewCount || 0;
          } else {
            counts[post.id] = post.viewCount || 0;
          }
        } catch (error) {
          console.error(`Failed to fetch view count for ${post.id}:`, error);
          counts[post.id] = post.viewCount || 0;
        }
      }

      setViewCounts(counts);
    };

    fetchViewCounts();
  }, [blogPosts]);

  // Get real view count from state or fallback to post data
  const getViewCount = (post: BlogPost) => {
    // If we have updated view counts, use them, otherwise use the server-side data
    return viewCounts[post.id] !== undefined ? viewCounts[post.id] : (post.viewCount ?? 0);
  };

  // Social share handlers
  const handleShare = (post: BlogPost, platform: string) => {
    const url = `https://olgishcakes.co.uk/blog/${post.slug}`;
    const title = post.title;
    const text = post.excerpt;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy the URL and open Instagram
        navigator.clipboard.writeText(url);
        window.open('https://www.instagram.com/', '_blank');
        return;
      case 'x':
        shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const filteredPosts = selectedCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // Scroll to top of blog section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Category Filter */}
      <Box sx={{ mb: 6, textAlign: "center" }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
              {categories.map(category => (
                <Chip
                  key={category.name}
                  label={category.name}
                  variant={category.name === selectedCategory ? "filled" : "outlined"}
                  onClick={() => handleCategoryChange(category.name)}
                  sx={{
                    backgroundColor: category.name === selectedCategory ? "#2E3192" : "transparent",
                    color: category.name === selectedCategory ? "white" : "#2E3192",
                    borderColor: "#2E3192",
                    fontSize: "0.8rem",
                    px: 2,
                    py: 0.5,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    borderRadius: "20px",
                    "&:hover": {
                      backgroundColor: category.name === selectedCategory ? "#1e2470" : "#2E3192",
                      color: "white",
                    },
                  }}
                />
              ))}
            </Box>
      </Box>

      {/* Blog Posts Grid */}
      <Box>
        <Grid container spacing={4}>
          {currentPosts.map(post => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Link href={`/blog/${post.slug}`} aria-label={`Read blog post: ${post.title}`} style={{ textDecoration: "none" }}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "35px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(46, 49, 146, 0.08)",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "all 0.3s ease-in-out",
                      boxShadow: "0 8px 24px rgba(46, 49, 146, 0.15)",
                      borderColor: "#2E3192",
                    },
                  }}
                >
                <Box
                  sx={{
                    height: 200,
                    width: "100%",
                    backgroundColor: post.image ? "#f8fafc" : "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative"
                  }}
                >
                  <img
                    src={post.image || "/images/olgish-cakes-logo-bakery-brand.png"}
                    alt={post.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center"
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/olgish-cakes-logo-bakery-brand.png";
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={post.category}
                        size="small"
                        sx={{
                          backgroundColor: "#2E3192",
                          color: "white",
                          fontSize: "0.7rem",
                          height: "20px",
                          "& .MuiChip-label": {
                            px: 1
                          }
                        }}
                      />
                      {post.featured && (
                        <Chip
                          label="Featured"
                          size="small"
                          sx={{
                            backgroundColor: "#FEF102",
                            color: "#2E3192",
                            fontSize: "0.7rem",
                            height: "20px",
                            fontWeight: 600,
                            "& .MuiChip-label": {
                              px: 1
                            }
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: "#2E3192",
                        fontSize: "1.25rem"
                      }}
                    >
                      {post.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      color: "#64748b",
                      lineHeight: 1.5,
                      fontSize: "0.9rem"
                    }}
                  >
                    {post.description || post.excerpt}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
                    <Typography variant="caption" sx={{ color: "#999", fontSize: "0.8rem" }}>
                      {new Date(post.publishDate).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#999", fontSize: "0.75rem" }}>
                      {post.readTime ? `${post.readTime} min read` : "5 min read"}
                    </Typography>
                  </Box>

                  {/* View Count and Social Share */}
                  <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    pt: 1,
                    borderTop: "1px solid #f0f0f0"
                  }}>
                    {/* View Count */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <VisibilityIcon sx={{ fontSize: "0.9rem", color: "#999" }} />
                      <Typography variant="caption" sx={{ color: "#999", fontSize: "0.75rem" }}>
                        {getViewCount(post).toLocaleString()} views
                      </Typography>
                    </Box>

                    {/* Social Share Buttons */}
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Share this post on Facebook">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(post, 'facebook');
                          }}
                          sx={{
                            p: 0.5,
                            color: "#1877F2",
                            "&:hover": { backgroundColor: "#f0f8ff" }
                          }}
                        >
                          <FacebookIcon sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy link and open Instagram">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(post, 'instagram');
                          }}
                          sx={{
                            p: 0.5,
                            color: "#E4405F",
                            "&:hover": { backgroundColor: "#fdf2f8" }
                          }}
                        >
                          <InstagramIcon sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share this post on X (Twitter)">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(post, 'x');
                          }}
                          sx={{
                            p: 0.5,
                            color: "#000000",
                            "&:hover": { backgroundColor: "#f5f5f5" }
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy post link to clipboard">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(post, 'copy');
                          }}
                          sx={{
                            p: 0.5,
                            color: "#666",
                            "&:hover": { backgroundColor: "#f0f8ff" }
                          }}
                        >
                          <ShareIcon sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#2E3192",
                borderColor: "#2E3192",
                "&.Mui-selected": {
                  backgroundColor: "#2E3192",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1e2470",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(46, 49, 146, 0.1)",
                },
              },
            }}
          />
        </Box>
      )}
    </>
  );
}
