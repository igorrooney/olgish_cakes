'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ShoppingCart,
  TrendingUp,
  Article,
  Email,
  Settings,
  Analytics,
  ContentPaste,
  Store,
  People,
  LocalShipping,
  Assessment,
  Refresh,
  OpenInNew,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { designTokens } from '@/lib/design-system';

interface QuickStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  systemStatus: 'healthy' | 'warning' | 'error';
}

export function AdminDashboard() {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders data
      const ordersResponse = await fetch('/api/orders');
      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders');
      }
      const ordersData = await ordersResponse.json();

      // Fetch earnings data
      const earningsResponse = await fetch('/api/admin/earnings');
      if (!earningsResponse.ok) {
        throw new Error('Failed to fetch earnings');
      }
      const earningsData = await earningsResponse.json();

      // Calculate stats
      const orders = ordersData.orders || [];
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((order: any) =>
        ['confirmed', 'in-progress', 'ready-pickup', 'out-delivery'].includes(order.status)
      ).length;
      const completedOrders = orders.filter((order: any) =>
        order.status === 'completed'
      ).length;

      const totalRevenue = earningsData.totalRevenue || 0;
      const recentOrders = orders.slice(0, 5);

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentOrders,
        systemStatus: 'healthy'
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
      // Set fallback stats
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        systemStatus: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const adminResources = [
    {
      title: 'Order Management',
      description: 'Manage customer orders, update statuses, and track deliveries',
      icon: <ShoppingCart />,
      href: '/admin/orders',
      color: designTokens.colors.primary.main,
      stats: stats ? `${stats.pendingOrders} pending` : 'Loading...'
    },
    {
      title: 'Earnings Dashboard',
      description: 'View revenue analytics and financial reports',
      icon: <TrendingUp />,
      href: '/admin/earnings',
      color: designTokens.colors.success.main,
      stats: stats ? `£${stats.totalRevenue.toLocaleString()}` : 'Loading...'
    },
    {
      title: 'Blog Management',
      description: 'Create and manage blog posts and content',
      icon: <Article />,
      href: '/admin/blog',
      color: designTokens.colors.ukrainian.honey,
      stats: 'Content'
    },
    {
      title: 'Email Testing',
      description: 'Test email templates and preview content',
      icon: <Email />,
      href: '/test-emails',
      color: designTokens.colors.error.main,
      stats: 'Templates'
    },
    {
      title: 'Content Studio',
      description: 'Manage products, categories, and content in Sanity',
      icon: <ContentPaste />,
      href: '/studio',
      color: designTokens.colors.warning.main,
      stats: 'CMS',
      external: true
    },
    {
      title: 'Website Analytics',
      description: 'View website performance and user analytics',
      icon: <Analytics />,
      href: '/analytics',
      color: designTokens.colors.info.main,
      stats: 'Reports',
      comingSoon: true
    }
  ];

  const quickActions = [
    {
      title: 'Clear Cache',
      description: 'Refresh website cache',
      icon: <Refresh />,
      action: 'clearCache',
      color: designTokens.colors.grey[600]
    },
    {
      title: 'View Website',
      description: 'Open main website',
      icon: <Store />,
      href: '/',
      color: designTokens.colors.success.main,
      external: true
    }
  ];

  const handleQuickAction = async (action: string) => {
    if (action === 'clearCache') {
      try {
        const response = await fetch('/api/admin/clear-cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN || 'dev-token'}`
          },
          body: JSON.stringify({ pattern: '*' })
        });

        if (response.ok) {
          alert('Cache cleared successfully!');
        } else {
          alert('Failed to clear cache');
        }
      } catch (err) {
        alert('Error clearing cache');
      }
    }
  };

  if (loading) {
    return (
      <AdminAuthGuard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <Box sx={{ maxWidth: 1400, margin: '0 auto', padding: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ color: designTokens.colors.primary.main, fontWeight: 700 }}>
            🎂 Admin Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage all aspects of Olgish Cakes from one central location
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Quick Stats */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: `linear-gradient(135deg, ${designTokens.colors.primary.main} 0%, ${designTokens.colors.primary.dark} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                        {stats.totalOrders}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.95 }}>
                        Total Orders
                      </Typography>
                    </Box>
                    <ShoppingCart sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: `linear-gradient(135deg, ${designTokens.colors.warning.main} 0%, ${designTokens.colors.warning.dark} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                        {stats.pendingOrders}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.95 }}>
                        Pending Orders
                      </Typography>
                    </Box>
                    <LocalShipping sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: `linear-gradient(135deg, ${designTokens.colors.success.main} 0%, ${designTokens.colors.success.dark} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                        {stats.completedOrders}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.95 }}>
                        Completed
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: `linear-gradient(135deg, ${designTokens.colors.info.main} 0%, ${designTokens.colors.info.dark} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                        £{stats.totalRevenue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', opacity: 0.95 }}>
                        Total Revenue
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Admin Resources */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: designTokens.colors.primary.main, fontWeight: 600 }}>
            Admin Resources
          </Typography>
          <Grid container spacing={3}>
            {adminResources.map((resource, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    },
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => {
                    if (resource.href) {
                      if (resource.external) {
                        window.open(resource.href, '_blank');
                      } else {
                        window.location.href = resource.href;
                      }
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                      <Box sx={{ color: resource.color }}>
                        {resource.icon}
                      </Box>
                      {resource.external && (
                        <OpenInNew sx={{ fontSize: 16, color: 'text.secondary' }} />
                      )}
                      {resource.comingSoon && (
                        <Chip
                          label="Coming Soon"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {resource.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {resource.description}
                    </Typography>

                    <Chip
                      label={resource.stats}
                      size="small"
                      sx={{
                        backgroundColor: resource.color + '20',
                        color: resource.color,
                        fontWeight: 500
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: designTokens.colors.primary.main, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => {
                    if (action.href) {
                      if (action.external) {
                        window.open(action.href, '_blank');
                      } else {
                        window.location.href = action.href;
                      }
                    } else if (action.action) {
                      handleQuickAction(action.action);
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ color: action.color }}>
                        {action.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Recent Orders */}
        {stats && stats.recentOrders.length > 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: designTokens.colors.primary.main, fontWeight: 600 }}>
              Recent Orders
            </Typography>
            <Paper>
              <List>
                {stats.recentOrders.map((order: any, index: number) => (
                  <div key={order._id || index}>
                    <ListItem>
                      <ListItemIcon>
                        <ShoppingCart color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Order #${order.orderNumber || order._id?.slice(-6)}`}
                        secondary={`${order.customer?.name || 'Unknown Customer'} • £${order.pricing?.total || 0} • ${order.status || 'Unknown'}`}
                      />
                      <Chip
                        label={order.status || 'Unknown'}
                        size="small"
                        color={
                          order.status === 'completed' ? 'success' :
                          order.status === 'cancelled' ? 'error' :
                          'primary'
                        }
                      />
                    </ListItem>
                    {index < stats.recentOrders.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {/* System Status */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: designTokens.colors.primary.main, fontWeight: 600 }}>
            System Status
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <CheckCircle color="success" />
              <Typography variant="body1">
                All systems operational
              </Typography>
              <Chip
                label="Healthy"
                color="success"
                size="small"
                sx={{ ml: 'auto' }}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </AdminAuthGuard>
  );
}
