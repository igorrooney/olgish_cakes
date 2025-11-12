"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { BlogPost } from '@/lib/sanity-blog';
import { designTokens } from '@/lib/design-system';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog-posts');

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch {
      // Error handling without console logging
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthGuard>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: designTokens.colors.primary.main }}>
            Blog Posts Management
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: designTokens.colors.success.main,
                '&:hover': { backgroundColor: designTokens.colors.success.dark }
              }}
            >
              Create New Post
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {post.excerpt}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={post.status}
                      color={post.status === 'published' ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={post.category}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'Draft'}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <IconButton size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {posts.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No blog posts found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first blog post to get started
            </Typography>
          </Box>
        )}
      </Box>
    </AdminAuthGuard>
  );
}