"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  IconButton,
  Alert,
  Snackbar,
  Grid,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  ZoomIn as ZoomIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { AddOrderModal } from "./AddOrderModal";
import { projectId, dataset } from "@/sanity/env";
import { urlFor } from "@/sanity/lib/image";
import { designTokens } from "@/lib/design-system";

interface Order {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  orderNumber: string;
  status: string;
  orderType: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postcode?: string;
  };
  items: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    size?: string;
    designType?: string;
  }>;
  delivery: {
    dateNeeded: string;
    deliveryMethod: string;
    trackingNumber?: string;
    deliveryNotes?: string;
    giftNote?: string;
  };
  pricing: {
    total: number;
    paymentStatus: string;
    paymentMethod?: string;
  };
  messages?: Array<{
    message: string;
    attachments?: Array<{
      _type: string;
      asset: {
        _type: string;
        _id: string;
        _ref: string;
        url: string;
      };
      alt?: string;
      caption?: string;
    }>;
  }>;
  notes?: Array<{
    note: string;
    author: string;
    createdAt: string;
    images?: Array<{
      _type: string;
      asset: {
        _type: string;
        _ref: string;
      };
      alt?: string;
      caption?: string;
    }>;
  }>;
}

const statusColors = {
  'new': 'error',
  'confirmed': 'warning',
  'in-progress': 'info',
  'ready-pickup': 'primary',
  'out-delivery': 'secondary',
  'delivered': 'success',
  'completed': 'success',
  'cancelled': 'error',
} as const;

const statusLabels = {
  'new': 'New Order',
  'confirmed': 'Confirmed',
  'in-progress': 'In Progress',
  'ready-pickup': 'Ready for Pickup',
  'out-delivery': 'Out for Delivery',
  'delivered': 'Delivered',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

export function OrderManagementDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addOrderModalOpen, setAddOrderModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("_createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: "",
    severity: 'info',
  });
  const [monthlyEarnings, setMonthlyEarnings] = useState<{
    currentMonth: number;
    lastMonth: number;
    totalOrders: number;
    averageOrderValue: number;
  }>({
    currentMonth: 0,
    lastMonth: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });
  const [availableCakes, setAvailableCakes] = useState<Array<{
    _id: string;
    name: string;
    slug: { current: string };
    size: string;
    pricing: { standard: number; individual: number };
    category: string;
  }>>([]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: '',
    trackingNumber: '',
    paymentStatus: '',
    paymentMethod: '',
    deliveryMethod: '',
    note: '',
    images: [] as File[],
    // Customer information fields
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerPostcode: '',
    // Pricing fields
    itemPrice: 0,
    totalPrice: 0,
    // Item selection fields
    selectedCakeId: '',
    selectedCakeName: '',
    selectedCakeSize: '',
    selectedDesignType: 'standard',
  });

  // Generate month options for the current year and previous year
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Add current year months
    for (let i = currentMonth; i >= 0; i--) {
      const date = new Date(currentYear, i);
      months.push({
        value: `${currentYear}-${String(i + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      });
    }

    // Add previous year months if we're not in January
    if (currentMonth < 11) {
      for (let i = 11; i >= currentMonth + 1; i--) {
        const date = new Date(currentYear - 1, i);
        months.push({
          value: `${currentYear - 1}-${String(i + 1).padStart(2, '0')}`,
          label: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        });
      }
    }

    return months;
  };

  const monthOptions = generateMonthOptions();

  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'info') => {
    setNotification({ open: true, message, severity });
  }, []);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      // Always fetch all orders, filtering will be done on frontend
      const response = await fetch(`/api/orders?t=${Date.now()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Failed to fetch orders', 'error');
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [showNotification]);

  const fetchMonthlyEarnings = async () => {
    try {
      const response = await fetch(`/api/admin/earnings?t=${Date.now()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setMonthlyEarnings(data);
      } else {
        console.error('Failed to fetch monthly earnings:', data);
      }
    } catch (error) {
      console.error('Error fetching monthly earnings:', error);
    }
  };

  const fetchCakes = async () => {
    try {
      const response = await fetch('/api/admin/cakes', {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setAvailableCakes(data.cakes || []);
      } else {
        console.error('Failed to fetch cakes:', data);
      }
    } catch (error) {
      console.error('Error fetching cakes:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchOrders();
    fetchMonthlyEarnings();
    fetchCakes();
  }, [fetchOrders]); // Fetch on component mount

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter, monthFilter]);

  const handleCakeSelection = (cakeId: string) => {
    const selectedCake = availableCakes.find(cake => cake._id === cakeId);
    if (selectedCake) {
      const newPrice = editForm.selectedDesignType === 'individual' 
        ? selectedCake.pricing.individual 
        : selectedCake.pricing.standard;
      
      setEditForm({
        ...editForm,
        selectedCakeId: cakeId,
        selectedCakeName: selectedCake.name,
        selectedCakeSize: selectedCake.size,
        itemPrice: newPrice,
        totalPrice: newPrice, // Auto-update total when cake changes
      });
    }
  };

  const handleDesignTypeChange = (designType: string) => {
    const selectedCake = availableCakes.find(cake => cake._id === editForm.selectedCakeId);
    if (selectedCake) {
      const newPrice = designType === 'individual' 
        ? selectedCake.pricing.individual 
        : selectedCake.pricing.standard;
      
      setEditForm({
        ...editForm,
        selectedDesignType: designType,
        itemPrice: newPrice,
        totalPrice: newPrice, // Auto-update total when design type changes
      });
    } else {
      setEditForm({
        ...editForm,
        selectedDesignType: designType,
      });
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    const firstItem = order.items[0];
    setEditForm({
      status: order.status,
      trackingNumber: order.delivery?.trackingNumber || '',
      paymentStatus: order.pricing?.paymentStatus || 'pending',
      paymentMethod: order.pricing?.paymentMethod || '',
      deliveryMethod: order.delivery?.deliveryMethod || 'collection',
      note: '',
      images: [],
      // Populate customer information
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      customerAddress: order.customer.address || '',
      customerCity: order.customer.city || '',
      customerPostcode: order.customer.postcode || '',
      // Populate pricing information
      itemPrice: firstItem?.totalPrice || 0,
      totalPrice: order.pricing?.total || 0,
      // Populate item selection information
      selectedCakeId: firstItem?.productId || '',
      selectedCakeName: firstItem?.productName || 'Custom Order',
      selectedCakeSize: firstItem?.size || '',
      selectedDesignType: firstItem?.designType || 'standard',
    });
    setEditDialogOpen(true);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };


  const handleDeleteOrderPermanently = async () => {
    if (!selectedOrder || !deletePassword) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password: deletePassword,
          permanent: true
        }),
      });

      if (response.ok) {
        showNotification('Order permanently deleted from Sanity', 'success');
        setDeleteConfirmOpen(false);
        setEditDialogOpen(false);
        setDeletePassword("");
        // Refresh both orders and earnings data
        await Promise.all([
          fetchOrders(),
          fetchMonthlyEarnings()
        ]);
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Invalid password') {
          showNotification('Incorrect password. Order not deleted.', 'error');
        } else {
          showNotification(errorData.error || 'Failed to delete order', 'error');
        }
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showNotification('Failed to delete order', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;

    setIsSaving(true);
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('status', editForm.status);
      formData.append('trackingNumber', editForm.trackingNumber);
      formData.append('deliveryMethod', editForm.deliveryMethod);
      formData.append('paymentStatus', editForm.paymentStatus);
      formData.append('paymentMethod', editForm.paymentMethod);
      formData.append('note', editForm.note);
      // Add customer information
      formData.append('customerName', editForm.customerName);
      formData.append('customerEmail', editForm.customerEmail);
      formData.append('customerPhone', editForm.customerPhone);
      formData.append('customerAddress', editForm.customerAddress);
      formData.append('customerCity', editForm.customerCity);
      formData.append('customerPostcode', editForm.customerPostcode);
      // Add pricing information
      formData.append('itemPrice', editForm.itemPrice.toString());
      formData.append('totalPrice', editForm.totalPrice.toString());
      // Add item selection information
      formData.append('selectedCakeId', editForm.selectedCakeId);
      formData.append('selectedCakeName', editForm.selectedCakeName);
      formData.append('selectedCakeSize', editForm.selectedCakeSize);
      formData.append('selectedDesignType', editForm.selectedDesignType);

      // Add images to FormData
      editForm.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const response = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        showNotification('Order updated successfully', 'success');
        setEditDialogOpen(false);
        fetchOrders(); // Refresh orders list
        fetchMonthlyEarnings(); // Refresh earnings data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showNotification('Failed to update order', 'error');
    } finally {
      setIsSaving(false);
    }
  };


  const filteredOrders = orders.filter(order => {
    // Apply search filter with null checks
    const matchesSearch = searchTerm === "" ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter (if not "all")
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    // Apply month filter
    const matchesMonth = monthFilter === "all" || (() => {
      const orderDate = new Date(order._createdAt);
      const orderYear = orderDate.getFullYear();
      const orderMonth = String(orderDate.getMonth() + 1).padStart(2, '0');
      const filterValue = `${orderYear}-${orderMonth}`;
      return filterValue === monthFilter;
    })();

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Calculate filtered statistics based on current filters
  const getFilteredStatistics = () => {
    const filtered = filteredOrders || [];
    const totalRevenue = filtered
      .filter(order => order && order.status && order.status !== 'cancelled')
      .reduce((sum, order) => {
        // Defensive null checks - use optional chaining throughout
        if (!order) return sum;
        try {
          const total = order.pricing?.total;
          if (total == null || typeof total !== 'number' || isNaN(total)) return sum;
          return sum + total;
        } catch (error) {
          // If anything goes wrong, just skip this order
          console.warn('Error calculating order total:', error, order);
          return sum;
        }
      }, 0);

    const totalOrders = filtered.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const newOrders = filtered.filter(o => o.status === 'new').length;
    const inProgressOrders = filtered.filter(o => ['confirmed', 'in-progress'].includes(o.status)).length;
    const completedOrders = filtered.filter(o => ['delivered', 'completed'].includes(o.status)).length;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      newOrders,
      inProgressOrders,
      completedOrders
    };
  };

  const filteredStats = getFilteredStatistics();

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'orderNumber':
        aValue = a.orderNumber || '';
        bValue = b.orderNumber || '';
        break;
      case 'customer':
        aValue = a.customer?.name || '';
        bValue = b.customer?.name || '';
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'dateNeeded':
        aValue = a.delivery?.dateNeeded ? new Date(a.delivery.dateNeeded) : null;
        bValue = b.delivery?.dateNeeded ? new Date(b.delivery.dateNeeded) : null;
        // Handle null values - put them at the end when sorting
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        break;
      case 'orderDate':
        aValue = new Date(a._createdAt || 0);
        bValue = new Date(b._createdAt || 0);
        break;
      case 'total':
        aValue = a.pricing?.total || 0;
        bValue = b.pricing?.total || 0;
        break;
      case '_createdAt':
      default:
        aValue = new Date(a._createdAt || 0);
        bValue = new Date(b._createdAt || 0);
        break;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate the sorted orders
  const paginatedOrders = sortedOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setEditForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleRemoveImage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleImageClick = (imageAsset: any) => {
    setSelectedImage(imageAsset);
    setImageViewerOpen(true);
  };

  const getImageUrl = (imageAsset: any) => {
    if (!imageAsset) {
      return '';
    }

    try {
      // Use Sanity's urlFor function to properly generate image URLs
      const imageUrl = urlFor(imageAsset).width(400).height(400).url();
      return imageUrl;
    } catch (error) {
      console.error('Error generating image URL:', error);
      return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CompletedIcon />;
      case 'cancelled':
        return <CancelledIcon />;
      case 'out-delivery':
        return <ShippingIcon />;
      default:
        return <EditIcon />;
    }
  };

  return (
    <Box>
      {/* Stats Cards - Dynamic based on filters */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {monthFilter === 'all' ? 'Total Orders' : 'Filtered Orders'}
              </Typography>
              <Typography variant="h4">
                {filteredStats.totalOrders}
              </Typography>
              {monthFilter !== 'all' && (
                <Typography variant="caption" color="text.secondary">
                  {monthOptions.find(m => m.value === monthFilter)?.label}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {monthFilter === 'all' ? 'Total Revenue' : 'Filtered Revenue'}
              </Typography>
              <Typography variant="h4" color="success.main">
                £{filteredStats.totalRevenue.toFixed(2)}
              </Typography>
              {monthFilter !== 'all' && (
                <Typography variant="caption" color="text.secondary">
                  {monthOptions.find(m => m.value === monthFilter)?.label}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4" color="primary">
                £{filteredStats.averageOrderValue.toFixed(2)}
              </Typography>
              {monthFilter !== 'all' && (
                <Typography variant="caption" color="text.secondary">
                  {monthOptions.find(m => m.value === monthFilter)?.label}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Orders
              </Typography>
              <Typography variant="h4" color="success.main">
                {filteredStats.completedOrders}
              </Typography>
              {monthFilter !== 'all' && (
                <Typography variant="caption" color="text.secondary">
                  {monthOptions.find(m => m.value === monthFilter)?.label}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Stats - Dynamic based on filters */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                New Orders
              </Typography>
              <Typography variant="h4" color="error">
                {filteredStats.newOrders}
              </Typography>
              {monthFilter !== 'all' && (
                <Typography variant="caption" color="text.secondary">
                  {monthOptions.find(m => m.value === monthFilter)?.label}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4" color="warning.main">
                {filteredStats.inProgressOrders}
              </Typography>
              {monthFilter !== 'all' && (
                <Typography variant="caption" color="text.secondary">
                  {monthOptions.find(m => m.value === monthFilter)?.label}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cancelled Orders
              </Typography>
              <Typography variant="h4" color="error">
                {filteredOrders.filter(o => o.status === 'cancelled').length}
              </Typography>
              {monthFilter !== 'all' && (
                <Typography variant="caption" color="text.secondary">
                  {monthOptions.find(m => m.value === monthFilter)?.label}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {monthFilter === 'all' ? 'All Time Revenue' : 'Monthly Revenue'}
              </Typography>
              <Typography variant="h4" color="primary">
                £{monthFilter === 'all'
                  ? orders
                      .filter(order => order && order.status !== 'cancelled')
                      .reduce((sum, order) => {
                        if (!order || !order.pricing) return sum;
                        const total = order.pricing.total;
                        return sum + (typeof total === 'number' && !isNaN(total) ? total : 0);
                      }, 0)
                      .toFixed(2)
                  : filteredStats.totalRevenue.toFixed(2)
                }
              </Typography>
              <Button
                size="small"
                href="/admin/earnings"
                sx={{ mt: 1 }}
              >
                View Detailed Earnings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Orders</MenuItem>
                  <MenuItem value="new">New Orders</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="ready-pickup">Ready for Pickup</MenuItem>
                  <MenuItem value="out-delivery">Out for Delivery</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Month Filter</InputLabel>
                <Select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  label="Month Filter"
                >
                  <MenuItem value="all">All Months</MenuItem>
                  {monthOptions.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddOrderModalOpen(true)}
                sx={{ mr: 1 }}
              >
                Add Order
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button
                variant="outlined"
                startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={() => fetchOrders(true)}
                disabled={loading || isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'orderNumber'}
                    direction={sortField === 'orderNumber' ? sortDirection : 'asc'}
                    onClick={() => handleSort('orderNumber')}
                  >
                    Order #
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'customer'}
                    direction={sortField === 'customer' ? sortDirection : 'asc'}
                    onClick={() => handleSort('customer')}
                  >
                    Customer
                  </TableSortLabel>
                </TableCell>
                <TableCell>Items</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'orderDate'}
                    direction={sortField === 'orderDate' ? sortDirection : 'asc'}
                    onClick={() => handleSort('orderDate')}
                  >
                    Order Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'total'}
                    direction={sortField === 'total' ? sortDirection : 'asc'}
                    onClick={() => handleSort('total')}
                  >
                    Total (£)
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'status'}
                    direction={sortField === 'status' ? sortDirection : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'dateNeeded'}
                    direction={sortField === 'dateNeeded' ? sortDirection : 'asc'}
                    onClick={() => handleSort('dateNeeded')}
                  >
                    Date Needed
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>Loading orders...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        #{order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {order.customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer.email}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {order.customer.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {order.items.map((item, index) => (
                        <Typography key={index} variant="body2">
                          {item.productName} (x{item.quantity})
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order._createdAt).toLocaleDateString('en-GB')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order._createdAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        £{(order.pricing?.total || 0).toFixed(2)}
                      </Typography>
                      <Chip
                        label={order.pricing?.paymentStatus || 'pending'}
                        size="small"
                        color={(order.pricing?.paymentStatus || 'pending') === 'paid' ? 'success' : 'warning'}
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={statusLabels[order.status as keyof typeof statusLabels]}
                        color={statusColors[order.status as keyof typeof statusColors]}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {order.delivery?.dateNeeded ? (
                        <>
                          <Typography variant="body2">
                            {new Date(order.delivery.dateNeeded).toLocaleDateString('en-GB')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.delivery?.deliveryMethod ? order.delivery.deliveryMethod.replace('-', ' ') : 'Not specified'}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not specified
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewOrder(order)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Order">
                          <IconButton
                            size="small"
                            onClick={() => handleEditOrder(order)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
          />
        </TableContainer>
      </Card>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Order #{selectedOrder?.orderNumber}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="new">New Order</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="ready-pickup">Ready for Pickup</MenuItem>
                  <MenuItem value="out-delivery">Out for Delivery</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tracking Number"
                value={editForm.trackingNumber}
                onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={editForm.paymentStatus}
                  onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                  label="Payment Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partial">Partially Paid</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                  label="Payment Method"
                >
                  <MenuItem value="cash-collection">Cash on Collection</MenuItem>
                  <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                  <MenuItem value="card">Card Payment</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Delivery Method</InputLabel>
                <Select
                  value={editForm.deliveryMethod}
                  onChange={(e) => setEditForm({ ...editForm, deliveryMethod: e.target.value })}
                  label="Delivery Method"
                >
                  <MenuItem value="collection">Collection</MenuItem>
                  <MenuItem value="local-delivery">Local Delivery</MenuItem>
                  <MenuItem value="postal">Postal Delivery</MenuItem>
                  <MenuItem value="market-pickup">Market Stall Pickup</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Note"
                multiline
                rows={3}
                value={editForm.note}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                placeholder="Add internal note about this order..."
              />
            </Grid>

            {/* Item Selection Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6" color="primary">
                  Item Selection
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Select Cake</InputLabel>
                <Select
                  value={editForm.selectedCakeId}
                  onChange={(e) => handleCakeSelection(e.target.value)}
                  label="Select Cake"
                >
                  <MenuItem value="">
                    <em>Custom Order</em>
                  </MenuItem>
                  {availableCakes.map((cake) => (
                    <MenuItem key={cake._id} value={cake._id}>
                      {cake.name} ({cake.size} inch) - £{cake.pricing.standard}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Design Type</InputLabel>
                <Select
                  value={editForm.selectedDesignType}
                  onChange={(e) => handleDesignTypeChange(e.target.value)}
                  label="Design Type"
                >
                  <MenuItem value="standard">Standard Design</MenuItem>
                  <MenuItem value="individual">Individual Design</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {editForm.selectedCakeId && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Cake Details:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {editForm.selectedCakeName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Size:</strong> {editForm.selectedCakeSize} inch
                  </Typography>
                  <Typography variant="body2">
                    <strong>Design Type:</strong> {editForm.selectedDesignType === 'individual' ? 'Individual Design' : 'Standard Design'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Price:</strong> £{editForm.itemPrice}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Pricing Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6" color="primary">
                  Pricing
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Price (£)"
                type="number"
                value={editForm.itemPrice}
                onChange={(e) => setEditForm({ ...editForm, itemPrice: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Order Price (£)"
                type="number"
                value={editForm.totalPrice}
                onChange={(e) => setEditForm({ ...editForm, totalPrice: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Customer Information Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6" color="primary">
                  Customer Information
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={editForm.customerName}
                onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editForm.customerEmail}
                onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editForm.customerPhone}
                onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                value={editForm.customerAddress}
                onChange={(e) => setEditForm({ ...editForm, customerAddress: e.target.value })}
                placeholder="Street address"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={editForm.customerCity}
                onChange={(e) => setEditForm({ ...editForm, customerCity: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postcode"
                value={editForm.customerPostcode}
                onChange={(e) => setEditForm({ ...editForm, customerPostcode: e.target.value })}
              />
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Attach Images
              </Typography>

              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mr: 2 }}
                  >
                    Upload Images
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary">
                  Upload images to attach to this note (JPG, PNG, GIF)
                </Typography>
              </Box>

              {/* Display uploaded images */}
              {editForm.images.length > 0 && (
                <List dense>
                  {editForm.images.map((image, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>
                          <ImageIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={image.name}
                        secondary={`${(image.size / 1024).toFixed(1)} KB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveImage(index)}
                          color="error"
                          size="small"
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => setDeleteConfirmOpen(true)}
            variant="outlined"
            color="error"
            size="small"
            sx={{
              mr: 'auto',
              color: 'error.main',
              borderColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'white'
              }
            }}
          >
            Delete Order
          </Button>
          <Button
            onClick={handleSaveOrder}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : undefined}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚠️ Delete Order Permanently</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This action will permanently delete order #{selectedOrder?.orderNumber} from Sanity.
            This cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customer: {selectedOrder?.customer.name} ({selectedOrder?.customer.email})
          </Typography>
          <TextField
            fullWidth
            label="Admin Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter admin password to confirm deletion"
            variant="outlined"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteConfirmOpen(false);
            setDeletePassword("");
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteOrderPermanently}
            variant="contained"
            color="error"
            disabled={!deletePassword || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Order Details #{selectedOrder?.orderNumber}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography><strong>Name:</strong> {selectedOrder.customer.name}</Typography>
                  <Typography><strong>Email:</strong> {selectedOrder.customer.email}</Typography>
                  <Typography><strong>Phone:</strong> {selectedOrder.customer.phone}</Typography>
                  {selectedOrder.customer.address && (
                    <Typography><strong>Address:</strong> {selectedOrder.customer.address}</Typography>
                  )}
                  {selectedOrder.customer.city && (
                    <Typography><strong>City:</strong> {selectedOrder.customer.city}</Typography>
                  )}
                  {selectedOrder.customer.postcode && (
                    <Typography><strong>Postcode:</strong> {selectedOrder.customer.postcode}</Typography>
                  )}
                </Box>

                <Typography variant="h6" gutterBottom>Order Items</Typography>
                {selectedOrder.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography><strong>{item.productName}</strong></Typography>
                    <Typography>Quantity: {item.quantity}</Typography>
                    <Typography>Price: £{item.totalPrice}</Typography>
                    {item.designType && (
                      <Typography>Design: {item.designType}</Typography>
                    )}

                    {/* Display design images for individual designs */}
                    {item.designType === 'individual' && selectedOrder.messages && selectedOrder.messages.length > 0 && (() => {
                      return (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Design Reference Images:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {(() => {
                            const messagesWithAttachments = selectedOrder.messages.filter(message => message.attachments && message.attachments.length > 0);
                            const allAttachments = messagesWithAttachments.flatMap(message => message.attachments).filter(attachment => attachment && attachment.asset);

                            if (allAttachments.length === 0) {
                              return (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  No design images found. Messages: {selectedOrder.messages.length},
                                  Messages with attachments: {messagesWithAttachments.length}
                                </Typography>
                              );
                            }

                            return allAttachments.map((attachment, index) => {
                              if (!attachment) return null;
                              const imageUrl = getImageUrl(attachment.asset);

                              return (
                                <Box
                                  key={index}
                                  sx={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      opacity: 0.8,
                                    },
                                  }}
                                  onClick={() => handleImageClick(attachment.asset)}
                                >
                                  <CardMedia
                                    component="img"
                                    sx={{
                                      width: 100,
                                      height: 100,
                                      objectFit: 'cover',
                                      borderRadius: 1,
                                      border: `2px solid ${designTokens.colors.border.light}`,
                                    }}
                                    image={imageUrl}
                                    alt={attachment.alt || 'Design reference'}
                                    onError={(e) => {
                                      console.error('Failed to load design image:', e);
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      bgcolor: 'rgba(0,0,0,0.5)',
                                      color: 'white',
                                      '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.7)',
                                      },
                                    }}
                                  >
                                    <ZoomIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              );
                            });
                          })()}
                        </Box>
                      </Box>
                      );
                    })()}
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Delivery Information</Typography>
                <Box sx={{ mb: 2 }}>
                  {selectedOrder.delivery?.dateNeeded && (
                    <Typography><strong>Date Needed:</strong> {new Date(selectedOrder.delivery.dateNeeded).toLocaleDateString('en-GB')}</Typography>
                  )}
                  <Typography><strong>Method:</strong> {selectedOrder.delivery?.deliveryMethod ? selectedOrder.delivery.deliveryMethod.replace('-', ' ') : 'Not specified'}</Typography>
                  {selectedOrder.delivery?.trackingNumber && (
                    <Typography><strong>Tracking:</strong> {selectedOrder.delivery.trackingNumber}</Typography>
                  )}
                </Box>

                <Typography variant="h6" gutterBottom>Pricing</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography><strong>Total:</strong> £{selectedOrder.pricing?.total || 0}</Typography>
                  <Typography><strong>Payment Status:</strong> {selectedOrder.pricing?.paymentStatus || 'pending'}</Typography>
                  {selectedOrder.pricing?.paymentMethod && (
                    <Typography><strong>Payment Method:</strong> {selectedOrder.pricing.paymentMethod.replace('-', ' ')}</Typography>
                  )}
                </Box>

                {selectedOrder.delivery.deliveryNotes && (
                  <>
                    <Typography variant="h6" gutterBottom>Additional Notes</Typography>
                    <Box sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography>{selectedOrder.delivery.deliveryNotes}</Typography>
                    </Box>
                  </>
                )}

                {selectedOrder.delivery.giftNote && (
                  <>
                    <Typography variant="h6" gutterBottom>Gift Note</Typography>
                    <Box sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography>{selectedOrder.delivery.giftNote}</Typography>
                    </Box>
                  </>
                )}

                {/* Customer Messages Section */}
                {selectedOrder.messages && selectedOrder.messages.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>Customer Messages</Typography>
                    {selectedOrder.messages.map((message, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                        <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                          {message.message}
                        </Typography>
                        
                        {/* Display message attachments if they exist */}
                        {message.attachments && message.attachments.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Attached Images:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {message.attachments
                                .filter(attachment => attachment && attachment.asset)
                                .map((attachment, imgIndex) => {
                                  const imageUrl = getImageUrl(attachment.asset);
                                  
                                  return (
                                    <Box
                                      key={imgIndex}
                                      sx={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        '&:hover': {
                                          opacity: 0.8,
                                        },
                                      }}
                                      onClick={() => handleImageClick(attachment.asset)}
                                    >
                                      <CardMedia
                                        component="img"
                                        sx={{
                                          width: 100,
                                          height: 100,
                                          objectFit: 'cover',
                                          borderRadius: 1,
                                          border: `2px solid ${designTokens.colors.border.light}`,
                                        }}
                                        image={imageUrl}
                                        alt={attachment.alt || 'Message attachment'}
                                        onError={(e) => {
                                          console.error('Failed to load message image:', e);
                                        }}
                                      />
                                      <IconButton
                                        size="small"
                                        sx={{
                                          position: 'absolute',
                                          top: 4,
                                          right: 4,
                                          bgcolor: 'rgba(0,0,0,0.5)',
                                          color: 'white',
                                          '&:hover': {
                                            bgcolor: 'rgba(0,0,0,0.7)',
                                          },
                                        }}
                                      >
                                        <ZoomIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  );
                                })}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </>
                )}

                {selectedOrder.notes && selectedOrder.notes.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>Internal Notes</Typography>
                    {selectedOrder.notes.map((note, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                        {note.note && (
                          <Typography sx={{ mb: 1 }}>{note.note}</Typography>
                        )}

                        {/* Display images if they exist */}
                        {note.images && note.images.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Attached Images:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {note.images
                                .filter(image => image && image.asset)
                                .map((image, imgIndex) => {

                                const imageUrl = getImageUrl(image.asset);

                                return (
                                  <Box
                                    key={imgIndex}
                                    sx={{
                                      position: 'relative',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        opacity: 0.8,
                                      },
                                    }}
                                    onClick={() => handleImageClick(image.asset)}
                                  >
                                    <CardMedia
                                      component="img"
                                      sx={{
                                        width: 100,
                                        height: 100,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        border: `2px solid ${designTokens.colors.border.light}`,
                                      }}
                                      image={imageUrl}
                                      alt={image.alt || 'Note attachment'}
                                      onError={(e) => {
                                        console.error('Failed to load thumbnail image:', e);
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        '&:hover': {
                                          bgcolor: 'rgba(0,0,0,0.7)',
                                        },
                                      }}
                                    >
                                      <ZoomIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        )}

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {note.author} - {new Date(note.createdAt).toLocaleDateString('en-GB')}
                        </Typography>
                      </Box>
                    ))}
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button onClick={() => { setViewDialogOpen(false); handleEditOrder(selectedOrder!); }} variant="contained">
            Edit Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Order Modal */}
      <AddOrderModal
        open={addOrderModalOpen}
        onClose={() => setAddOrderModalOpen(false)}
        onOrderCreated={() => {
          fetchOrders();
          fetchMonthlyEarnings();
        }}
      />

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Image Preview</Typography>
            <IconButton onClick={() => setImageViewerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={urlFor(selectedImage).width(800).height(600).url()}
                alt="Note attachment"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
                onError={(e) => {
                  console.error('Failed to load image in modal:', e);
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
