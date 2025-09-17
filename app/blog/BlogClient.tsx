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
} from "@mui/material";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image?: string | null;
  category: string;
  readTime: string;
  date: string;
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
  const postsPerPage = 6;

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
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3, 
            color: "#2E3192", 
            fontSize: "0.9rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600
          }}
        >
          Show tags
        </Typography>
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
              <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
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
                <CardMedia 
                  component="img" 
                  height="200" 
                  image={post.image || "/images/olgish-cakes-logo-bakery-brand.png"} 
                  alt={post.title}
                  sx={{ 
                    objectFit: "contain",
                    backgroundColor: post.image ? "#f8fafc" : "#ffffff",
                    padding: post.image ? 0 : 2
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/olgish-cakes-logo-bakery-brand.png";
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{ 
                      mb: 2, 
                      fontWeight: 600, 
                      lineHeight: 1.3,
                      color: "#2E3192",
                      fontSize: "1.25rem"
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ 
                      mb: 2, 
                      color: "#64748b", 
                      lineHeight: 1.5,
                      fontSize: "0.9rem"
                    }}
                  >
                    {post.excerpt}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Typography variant="caption" sx={{ color: "#999", fontSize: "0.8rem" }}>
                      {new Date(post.date).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
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
