"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  Paper,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Schedule as ScheduleIcon, Publish as PublishIcon, CloudUpload as CloudUploadIcon, Image as ImageIcon } from '@mui/icons-material';
import { BlogPost } from '@/lib/sanity-blog';
import AdminGuard from '@/app/components/AdminGuard';

function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    description: '',
    category: '',
    readTime: '',
    status: 'draft',
    featured: false,
    publishDate: '',
    seoTitle: '',
    seoDescription: '',
    keywords: [] as string[],
    slug: '',
    content: [] as any[],
    featuredImage: null as File | null,
    featuredImageUrl: '',
    cardImage: null as File | null,
    cardImageUrl: '',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog-posts');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      excerpt: '',
      description: '',
      category: '',
      readTime: '',
      status: 'draft',
      featured: false,
      publishDate: '',
      seoTitle: '',
      seoDescription: '',
      keywords: [],
      slug: '',
      content: [],
      featuredImage: null,
      featuredImageUrl: '',
      cardImage: null,
      cardImageUrl: '',
    });
    setOpenDialog(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      description: post.description || '',
      category: post.category || '',
      readTime: post.readTime || '',
      status: post.status,
      featured: post.featured || false,
      publishDate: post.publishDate ? new Date(post.publishDate).toISOString().slice(0, 16) : '',
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      keywords: Array.isArray(post.keywords) ? post.keywords : [],
      slug: post.slug?.current || '',
      content: post.content || [],
      featuredImage: null,
      featuredImageUrl: post.featuredImage?.asset?.url || '',
      cardImage: null,
      cardImageUrl: post.cardImage?.asset?.url || '',
    });
    setOpenDialog(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, featuredImage: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, featuredImage: file, featuredImageUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCardImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, cardImage: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, cardImage: file, cardImageUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePost = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('readTime', formData.readTime);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('featured', formData.featured.toString());
      formDataToSend.append('publishDate', formData.publishDate ? new Date(formData.publishDate).toISOString() : '');
      formDataToSend.append('seoTitle', formData.seoTitle);
      formDataToSend.append('seoDescription', formData.seoDescription);
      formDataToSend.append('keywords', JSON.stringify(formData.keywords));
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('content', JSON.stringify(formData.content));
      
      if (formData.featuredImage) {
        formDataToSend.append('featuredImage', formData.featuredImage);
      }
      
      if (formData.cardImage) {
        formDataToSend.append('cardImage', formData.cardImage);
      }

      let response;
      if (editingPost) {
        // Update existing post
        response = await fetch(`/api/blog-posts/${editingPost._id}`, {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        // Create new post
        response = await fetch('/api/blog-posts', {
          method: 'POST',
          body: formDataToSend,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save post');
      }

      setOpenDialog(false);
      fetchPosts();
      alert('Post saved successfully!');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await fetch(`/api/blog-posts/${id}`, { method: 'DELETE' });
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handlePublishScheduled = async () => {
    try {
      const response = await fetch('/api/publish-scheduled-posts', { method: 'POST' });
      const data = await response.json();
      alert(data.message);
      fetchPosts();
    } catch (error) {
      console.error('Error publishing scheduled posts:', error);
    }
  };

  const handlePublishNow = async (postId: string) => {
    if (confirm('Are you sure you want to publish this post immediately?')) {
      try {
        const response = await fetch(`/api/blog-posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'published',
            publishDate: new Date().toISOString()
          }),
        });
        
        if (response.ok) {
          alert('Post published successfully!');
          fetchPosts();
        } else {
          const errorData = await response.json();
          alert('Failed to publish post: ' + (errorData.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error publishing post:', error);
        alert('Error publishing post: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const handlePublishAllDrafts = async () => {
    const draftPosts = posts.filter(post => post.status === 'draft');
    if (draftPosts.length === 0) {
      alert('No draft posts to publish');
      return;
    }

    if (confirm(`Are you sure you want to publish all ${draftPosts.length} draft posts immediately?`)) {
      try {
        const publishPromises = draftPosts.map(post => 
          fetch(`/api/blog-posts/${post._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: 'published',
              publishDate: new Date().toISOString()
            }),
          })
        );

        const results = await Promise.all(publishPromises);
        const successCount = results.filter(response => response.ok).length;
        
        alert(`Successfully published ${successCount} out of ${draftPosts.length} posts`);
        fetchPosts();
      } catch (error) {
        console.error('Error publishing posts:', error);
        alert('Error publishing posts');
      }
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  return (
    <AdminGuard>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Blog Posts Management</Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{ mr: 2 }}
            >
              Logout
            </Button>
            <Button
              variant="outlined"
              startIcon={<PublishIcon />}
              onClick={handlePublishAllDrafts}
              sx={{ mr: 2, color: '#4caf50', borderColor: '#4caf50' }}
            >
              Publish All Drafts
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={handlePublishScheduled}
              sx={{ mr: 2 }}
            >
              Publish Scheduled
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePost}
            >
              Create Post
            </Button>
          </Box>
        </Box>

      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} lg={4} key={post._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1, mr: 2 }}>
                    {post.title}
                  </Typography>
                  <Box>
                    {post.status === 'draft' && (
                      <IconButton 
                        size="small" 
                        onClick={() => handlePublishNow(post._id)}
                        title="Publish Now"
                        sx={{ color: '#4caf50' }}
                      >
                        <PublishIcon />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleEditPost(post)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeletePost(post._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {post.excerpt}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={post.category} size="small" />
                  <Chip label={post.status} size="small" color={post.status === 'published' ? 'success' : 'default'} />
                  {post.featured && <Chip label="Featured" size="small" color="primary" />}
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'Draft'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="Excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="Business Guide">Business Guide</MenuItem>
                  <MenuItem value="Cake by Post">Cake by Post</MenuItem>
                  <MenuItem value="Traditional Ukrainian">Traditional Ukrainian</MenuItem>
                  <MenuItem value="Wedding Cakes">Wedding Cakes</MenuItem>
                  <MenuItem value="Customer Stories">Customer Stories</MenuItem>
                  <MenuItem value="Behind the Scenes">Behind the Scenes</MenuItem>
                  <MenuItem value="Seasonal">Seasonal</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Read Time (minutes)"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                placeholder="e.g., 8"
                helperText="Enter number of minutes (e.g., 8 for '8 min read')"
              />
              
              <TextField
                label="Publish Date"
                type="datetime-local"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                disabled={formData.status !== 'scheduled'}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
              }
              label="Featured Post"
            />
            
            {/* Featured Image Upload */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Featured Image
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
                This image will be used for social media sharing, blog post headers, and as a fallback for card images.
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#2E3192',
                    backgroundColor: '#f8f9ff',
                  },
                }}
                onClick={() => document.getElementById('featured-image-upload')?.click()}
              >
                <input
                  id="featured-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {formData.featuredImageUrl ? (
                  <Box>
                    <Avatar
                      src={formData.featuredImageUrl}
                      sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                      variant="rounded"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Click to change image
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Click to upload featured image
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Recommended: 1200x630px (2:1 ratio)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                      Used for social sharing and blog headers
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
            
            {/* Card Image Upload */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Card Image
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
                This image will be displayed on the blog listing page cards. If not provided, the featured image will be used.
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#2E3192',
                    backgroundColor: '#f8f9ff',
                  },
                }}
                onClick={() => document.getElementById('card-image-upload')?.click()}
              >
                <input
                  id="card-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCardImageUpload}
                  style={{ display: 'none' }}
                />
                {formData.cardImageUrl ? (
                  <Box>
                    <Avatar
                      src={formData.cardImageUrl}
                      sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                      variant="rounded"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Click to change image
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Click to upload card image
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Recommended: 400x300px (4:3 ratio)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                      Used for blog listing cards
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
            
            {/* Image Guidelines */}
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: '#f8f9ff', 
              borderRadius: 2, 
              border: '1px solid #e2e8f0' 
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#2E3192', fontWeight: 600 }}>
                📸 Image Guidelines
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1 }}>
                • <strong>File formats:</strong> JPG, PNG, WebP (WebP recommended for better performance)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1 }}>
                • <strong>File size:</strong> Keep under 2MB for faster loading
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1 }}>
                • <strong>Quality:</strong> Use high-quality images with good contrast and lighting
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                • <strong>Alt text:</strong> Always provide descriptive alt text for accessibility
              </Typography>
            </Box>
            
            <TextField
              label="SEO Title"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="SEO Description"
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
              helperText="Short description of the blog post"
            />
            
            <TextField
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              fullWidth
              helperText="URL-friendly version of the title (e.g., my-blog-post)"
            />
            
            <TextField
              label="Keywords"
              value={Array.isArray(formData.keywords) ? formData.keywords.join(', ') : ''}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
              fullWidth
              helperText="Comma-separated keywords for SEO"
            />
            
            <TextField
              label="Content"
              value={Array.isArray(formData.content) ? JSON.stringify(formData.content) : formData.content}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData({ ...formData, content: parsed });
                } catch {
                  // If parsing fails, wrap the string in an array
                  setFormData({ ...formData, content: [e.target.value] });
                }
              }}
              multiline
              rows={10}
              fullWidth
              helperText="Main content of the blog post (JSON format for rich text)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePost} variant="contained">
            {editingPost ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </AdminGuard>
  );
}

export default BlogAdminPage;
