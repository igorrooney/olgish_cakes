"use client";

import Link from "next/link";
import { designTokens } from "@/lib/design-system";
import { logger } from "@/lib/logger";
import { ORDER_STATUS_LABELS } from "@/lib/order-constants";
import { urlFor } from "@/sanity/lib/image";
import type { Order, SortableOrderValue } from "@/types/order";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  ZoomIn as ZoomIcon
} from "@/lib/daisy-ui";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  TableContainer,
  TablePagination,
  TextField,
  Typography,
} from "@/lib/daisy-ui";
import { AdapterDayjs } from "@/lib/daisy-ui";
import { DatePicker } from "@/lib/daisy-ui";
import { LocalizationProvider } from "@/lib/daisy-ui";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/en-gb";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddOrderModal } from "./AddOrderModal";

// Set British locale for date formatting
dayjs.locale("en-gb");

// Order type imported from types/order.ts
// Status colors and labels imported from lib/order-constants.ts
type OrderImageAsset = {
  _type?: string;
  _id?: string;
  _ref?: string;
  url?: string;
};

type OrderImagePreview = {
  asset: OrderImageAsset;
  alt: string;
  source: 'reference' | 'note';
};

type OrderFocusFilter = 'all' | 'needs-action' | 'active';

type StoredIpLocation = {
  city?: string;
  region?: string;
  country?: string;
};

const needsActionStatuses = ['new', 'confirmed', 'in-progress'];
const activeStatuses = [...needsActionStatuses, 'ready-pickup', 'out-delivery'];

const isNeedsActionStatus = (status: string) => needsActionStatuses.includes(status);
const isActiveStatus = (status: string) => activeStatuses.includes(status);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const readStringField = (record: Record<string, unknown>, field: string) => {
  const value = record[field];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
};

const getOrderIpLocation = (order: Order): StoredIpLocation | null => {
  if (!isRecord(order.metadata)) {
    return null;
  }

  const ipLocation = order.metadata.ipLocation;

  if (!isRecord(ipLocation)) {
    return null;
  }

  const location = {
    city: readStringField(ipLocation, 'city'),
    region: readStringField(ipLocation, 'region'),
    country: readStringField(ipLocation, 'country')
  };

  return Object.values(location).some(Boolean) ? location : null;
};

const formatIpLocation = (location: StoredIpLocation | null) =>
  location ? [location.city, location.region, location.country].filter(Boolean).join(', ') : 'Not captured';

function getOrderImagePreviews(order: Order): OrderImagePreview[] {
  const messageImages = (order.messages || []).flatMap((message) =>
    (message.attachments || [])
      .filter((attachment) => Boolean(attachment?.asset))
      .map((attachment) => ({
        asset: attachment.asset,
        alt: attachment.alt || 'Customer reference image',
        source: 'reference' as const
      }))
  );

  const noteImages = (order.notes || []).flatMap((note) =>
    (note.images || [])
      .filter((image) => Boolean(image?.asset))
      .map((image) => ({
        asset: image.asset,
        alt: image.alt || 'Admin note image',
        source: 'note' as const
      }))
  );

  return [...messageImages, ...noteImages];
}

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
  const [selectedImage, setSelectedImage] = useState<OrderImageAsset | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [focusFilter, setFocusFilter] = useState<OrderFocusFilter>('all');
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
  // Removed unused monthlyEarnings state - using filteredStats instead
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
    dateNeeded: null as Dayjs | null,
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

  const fetchOrders = useCallback(async (isRefresh = false, signal?: AbortSignal) => {
    const controller = signal ? null : new AbortController();
    const requestSignal = signal || controller?.signal;
    const fetchedOrders: Order[] = [];
    const limit = 100;
    let offset = 0;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      while (true) {
        const response = await fetch(`/api/orders?limit=${limit}&offset=${offset}&t=${Date.now()}`, {
          credentials: 'include',
          signal: requestSignal,
        });
        const data = await response.json() as {
          orders?: Order[];
          hasMore?: boolean;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders');
        }

        fetchedOrders.push(...(data.orders || []));

        if (!data.hasMore) {
          break;
        }

        offset += limit;
      }

      setOrders(fetchedOrders);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      logger.error('Error fetching orders', error);
      showNotification('Failed to fetch orders', 'error');
    } finally {
      if (!requestSignal?.aborted) {
        if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    }
  }, [showNotification]);

  // Removed fetchMonthlyEarnings - not used in component

  const fetchCakes = async (signal?: AbortSignal) => {
    const controller = signal ? null : new AbortController();
    const requestSignal = signal || controller?.signal;

    try {
      const response = await fetch('/api/admin/cakes', {
        credentials: 'include',
        signal: requestSignal,
      });
      const data = await response.json();

      if (response.ok) {
        setAvailableCakes(data.cakes || []);
      } else {
        logger.error('Failed to fetch cakes', data);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      logger.error('Error fetching cakes', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const controller = new AbortController();

    fetchOrders(false, controller.signal);
    fetchCakes(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchOrders]); // Fetch on component mount

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter, monthFilter, focusFilter]);

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
    // Parse dateNeeded if it exists
    const dateNeeded = order.delivery?.dateNeeded
      ? dayjs(order.delivery.dateNeeded)
      : null;

    setEditForm({
      status: order.status,
      trackingNumber: order.delivery?.trackingNumber || '',
      paymentStatus: order.pricing?.paymentStatus || 'pending',
      paymentMethod: order.pricing?.paymentMethod || '',
      deliveryMethod: order.delivery?.deliveryMethod || 'collection',
      dateNeeded,
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

  const handleDeleteOrderPermanently = async () => {
    const password = deletePassword.trim();

    if (!selectedOrder || !password) return;

    const controller = new AbortController();
    const deletedOrderId = selectedOrder._id;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/orders/${deletedOrderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password,
          permanent: true
        }),
        signal: controller.signal,
      });

      if (response.ok) {
        showNotification('Order permanently deleted from Supabase', 'success');
        setOrders((currentOrders) => currentOrders.filter((order) => order._id !== deletedOrderId));
        setDeleteConfirmOpen(false);
        setEditDialogOpen(false);
        setViewDialogOpen(false);
        setSelectedOrder(null);
        setDeletePassword("");
        // Refresh orders data
        await fetchOrders();
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Invalid password') {
          showNotification('Incorrect password. Order not deleted.', 'error');
        } else {
          showNotification(errorData.error || 'Failed to delete order', 'error');
        }
      }
    } catch (error) {
      logger.error('Error deleting order', error);
      showNotification('Failed to delete order', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;

    const controller = new AbortController();

    setIsSaving(true);
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('status', editForm.status);
      formData.append('trackingNumber', editForm.trackingNumber);
      formData.append('deliveryMethod', editForm.deliveryMethod);
      // Format dateNeeded as YYYY-MM-DD for API (ISO format)
      if (editForm.dateNeeded) {
        formData.append('dateNeeded', editForm.dateNeeded.format('YYYY-MM-DD'));
      } else {
        formData.append('dateNeeded', '');
      }
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
      editForm.images.forEach((image) => {
        formData.append(`images`, image);
      });

      const response = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
        signal: controller.signal,
      });

      if (response.ok) {
        showNotification('Order updated successfully', 'success');
        setEditDialogOpen(false);
        fetchOrders(); // Refresh orders list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }
    } catch (error) {
      logger.error('Error updating order', error);
      showNotification('Failed to update order', 'error');
    } finally {
      setIsSaving(false);
    }
  };


  const searchAndMonthFilteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Apply search filter with null checks
      const matchesSearch = searchTerm === "" ||
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply month filter
      const matchesMonth = monthFilter === "all" || (() => {
        const orderDate = new Date(order._createdAt);
        const orderYear = orderDate.getFullYear();
        const orderMonth = String(orderDate.getMonth() + 1).padStart(2, '0');
        const filterValue = `${orderYear}-${orderMonth}`;
        return filterValue === monthFilter;
      })();

      return matchesSearch && matchesMonth;
    });
  }, [orders, searchTerm, monthFilter]);

  // Memoize filtered orders for performance
  const filteredOrders = useMemo(() => {
    return searchAndMonthFilteredOrders.filter(order => {
      // Apply status filter (if not "all")
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesFocus = focusFilter === 'all' ||
        (focusFilter === 'needs-action' && isNeedsActionStatus(order.status)) ||
        (focusFilter === 'active' && isActiveStatus(order.status));

      return matchesStatus && matchesFocus;
    });
  }, [searchAndMonthFilteredOrders, statusFilter, focusFilter]);

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
          logger.warn('Error calculating order total', { error, order });
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

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }), []);

  const allTimeRevenue = useMemo(() => orders
    .filter(order => order && order.status !== 'cancelled')
    .reduce((sum, order) => {
      const total = order.pricing?.total;
      return sum + (typeof total === 'number' && !isNaN(total) ? total : 0);
    }, 0), [orders]);

  // Memoize sorted orders for performance
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let aValue: SortableOrderValue;
      let bValue: SortableOrderValue;

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

      if (aValue === null || bValue === null) {
        if (aValue === null && bValue === null) return 0;
        return aValue === null ? 1 : -1;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredOrders, sortField, sortDirection]);

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

  const handleFocusFilterChange = (nextFocusFilter: OrderFocusFilter) => {
    setFocusFilter(nextFocusFilter);
    setStatusFilter('all');
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

  const handleImageClick = (imageAsset: OrderImageAsset) => {
    setSelectedImage(imageAsset);
    setImageViewerOpen(true);
  };

  const getImageUrl = (imageAsset: OrderImageAsset | null | undefined, width = 400, height = 400) => {
    if (!imageAsset) {
      return '';
    }

    if (imageAsset.url) {
      return imageAsset.url;
    }

    try {
      const imageUrl = urlFor(imageAsset).width(width).height(height).url();
      return imageUrl;
    } catch (error) {
      logger.error('Error generating image URL', error);
      return '';
    }
  };

  const formatOrderDateTime = (value: string) => {
    const date = new Date(value);

    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const formatDeliveryMethod = (value?: string) => {
    if (!value) {
      return 'Delivery method not specified';
    }

    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getPaymentBadgeClass = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'paid':
        return 'badge badge-sm badge-success';
      case 'refunded':
      case 'cancelled':
        return 'badge badge-sm badge-error';
      case 'partial':
        return 'badge badge-sm badge-info';
      default:
        return 'badge badge-sm badge-warning';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'badge badge-sm badge-success whitespace-nowrap';
      case 'cancelled':
        return 'badge badge-sm badge-error whitespace-nowrap';
      case 'in-progress':
      case 'out-delivery':
        return 'badge badge-sm badge-info whitespace-nowrap';
      case 'confirmed':
      case 'ready-pickup':
        return 'badge badge-sm badge-warning whitespace-nowrap';
      default:
        return 'badge badge-sm badge-primary whitespace-nowrap';
    }
  };

  const getOperationalBadge = (status: string) => {
    if (isNeedsActionStatus(status)) {
      return <span className="badge badge-warning badge-outline badge-sm whitespace-nowrap">Needs action</span>;
    }

    if (isActiveStatus(status)) {
      return <span className="badge badge-info badge-outline badge-sm whitespace-nowrap">Active</span>;
    }

    return null;
  };

  const selectedMonthLabel = monthFilter === 'all'
    ? 'All months'
    : monthOptions.find(month => month.value === monthFilter)?.label || 'Selected month';

  const focusFilterOptions: Array<{
    value: OrderFocusFilter;
    label: string;
    count: number;
  }> = [
    {
      value: 'all',
      label: 'All orders',
      count: searchAndMonthFilteredOrders.length
    },
    {
      value: 'needs-action',
      label: 'Needs action',
      count: searchAndMonthFilteredOrders.filter(order => isNeedsActionStatus(order.status)).length
    },
    {
      value: 'active',
      label: 'Active orders',
      count: searchAndMonthFilteredOrders.filter(order => isActiveStatus(order.status)).length
    }
  ];

  const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled').length;
  const needsActionOrders = filteredStats.newOrders + filteredStats.inProgressOrders;
  const visibleOrdersLabel = filteredOrders.length === orders.length
    ? `${filteredOrders.length} orders`
    : `${filteredOrders.length} of ${orders.length} orders`;
  const metricCards = [
    {
      label: monthFilter === 'all' ? 'Orders' : 'Filtered orders',
      value: filteredStats.totalOrders.toString(),
      detail: `${filteredStats.completedOrders} completed, ${cancelledOrders} cancelled`,
      tone: 'text-base-content'
    },
    {
      label: 'Needs action',
      value: needsActionOrders.toString(),
      detail: `${filteredStats.newOrders} new, ${filteredStats.inProgressOrders} in progress`,
      tone: 'text-warning'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-base-content/60">Operations</p>
            <h1 className="mt-1 text-3xl font-semibold text-base-content">Orders</h1>
            <p className="mt-2 max-w-2xl text-sm text-base-content/70">
              Fulfilment queue for customer cakes and hampers.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fetchOrders(true)}
              disabled={loading || isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <CircularProgress className="loading-sm" />
                  Refreshing
                </>
              ) : (
                <>
                  Refresh
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setAddOrderModalOpen(true)}
            >
              <AddIcon />
              Add order
            </button>
          </div>
        </div>
      </header>
      <section
        aria-label="Order summary"
        className="gap-3"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.75rem'
        }}
      >
        {metricCards.map(metric => (
          <article
            key={metric.label}
            className="rounded-box border border-base-300 bg-base-100 p-3 shadow-sm sm:p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-base-content/60">{metric.label}</p>
            <p className={`mt-2 text-xl font-semibold sm:text-2xl ${metric.tone}`}>{metric.value}</p>
            <p className="mt-1 text-sm text-base-content/65">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm" aria-label="Order filters">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto] lg:items-end">
          <label className="form-control w-full">
            <span className="label">
              <span className="label-text">Search</span>
            </span>
            <input
              type="search"
              className="input input-bordered w-full"
              placeholder="Order number, name or email"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="form-control w-full">
            <span className="label">
              <span className="label-text">Status</span>
            </span>
            <select
              className="select select-bordered w-full"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setFocusFilter('all');
              }}
            >
              <option value="all">All orders</option>
              <option value="new">New orders</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In progress</option>
              <option value="ready-pickup">Ready for pickup</option>
              <option value="out-delivery">Out for delivery</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label">
              <span className="label-text">Month</span>
            </span>
            <select
              className="select select-bordered w-full"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            >
              <option value="all">All months</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>

          <a className="btn btn-outline btn-sm lg:mb-1" href="/admin/earnings">
            {monthFilter === 'all'
              ? `All revenue ${currencyFormatter.format(allTimeRevenue)}`
              : 'View earnings'}
          </a>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Order focus filters">
          {focusFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn btn-sm ${focusFilter === option.value ? 'btn-primary' : 'btn-outline'}`}
              aria-pressed={focusFilter === option.value}
              onClick={() => handleFocusFilterChange(option.value)}
            >
              {option.label}
              <span className={`badge badge-sm ${focusFilter === option.value ? 'badge-neutral' : 'badge-ghost'}`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 border-t border-base-300 pt-3 text-sm text-base-content/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing <span className="font-medium text-base-content">{visibleOrdersLabel}</span>
          </p>
          <p>{selectedMonthLabel}</p>
        </div>
      </section>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm">
        <div className="flex flex-col gap-1 border-b border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-base-content">Order list</h2>
            <p className="text-sm text-base-content/65">{visibleOrdersLabel}</p>
          </div>
          <p className="text-sm text-base-content/65">Latest first</p>
        </div>
        <div className="divide-y divide-base-300 md:hidden">
          {loading ? (
            <div className="px-4 py-10 text-center text-base-content/65">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-4 py-10 text-center text-base-content/65">
              No orders found
            </div>
          ) : (
            paginatedOrders.map((order) => {
              const placedAt = formatOrderDateTime(order._createdAt);
              const firstItem = order.items[0];
              const additionalItems = Math.max(order.items.length - 1, 0);
              const paymentStatus = order.pricing?.paymentStatus || 'pending';
              const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status;
              const orderImages = getOrderImagePreviews(order);
              const visibleOrderImages = orderImages.slice(0, 3);

              return (
                <article key={order._id} className="px-4 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base-content">
                        #{order.orderNumber}
                      </h3>
                      <p className="mt-1 text-xs text-base-content/60">
                        {placedAt.date}, {placedAt.time}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={getStatusBadgeClass(order.status)}>
                        {statusLabel}
                      </span>
                      {getOperationalBadge(order.status)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 text-sm">
                    <div>
                      <p className="font-medium text-base-content">
                        {order.customer.name}
                      </p>
                      <a
                        className="mt-1 block truncate text-xs text-base-content/65 hover:text-primary"
                        href={`mailto:${order.customer.email}`}
                      >
                        {order.customer.email}
                      </a>
                      <a
                        className="mt-1 block text-xs text-base-content/65 hover:text-primary"
                        href={`tel:${order.customer.phone}`}
                      >
                        {order.customer.phone}
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                          Items
                        </p>
                        <p className="mt-1 line-clamp-2 font-medium text-base-content">
                          {firstItem ? firstItem.productName : 'Custom order'}
                        </p>
                        <p className="mt-1 text-xs text-base-content/65">
                          {firstItem ? `Qty ${firstItem.quantity}` : 'No line items'}
                          {additionalItems > 0 && `, +${additionalItems} more`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                          Needed
                        </p>
                        <p className="mt-1 font-medium text-base-content">
                          {order.delivery?.dateNeeded
                            ? new Date(order.delivery.dateNeeded).toLocaleDateString('en-GB')
                            : 'Not specified'}
                        </p>
                        <p className="mt-1 text-xs text-base-content/65">
                          {formatDeliveryMethod(order.delivery?.deliveryMethod)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {orderImages.length > 0 && (
                    <div
                      className="mt-4 flex items-center gap-2"
                      aria-label={`${orderImages.length} image${orderImages.length === 1 ? '' : 's'} attached to order ${order.orderNumber}`}
                    >
                      <div className="flex -space-x-2">
                        {visibleOrderImages.map((image, index) => {
                          const imageUrl = getImageUrl(image.asset);

                          if (!imageUrl) {
                            return null;
                          }

                          return (
                            <button
                              key={`${image.source}-${index}`}
                              type="button"
                              className="h-10 w-10 overflow-hidden rounded border-2 border-base-100 bg-base-200 shadow-sm"
                              onClick={() => handleImageClick(image.asset)}
                              aria-label={`Open ${image.alt}`}
                            >
                              <img
                                src={imageUrl}
                                alt={image.alt}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="badge badge-outline badge-sm">
                        {orderImages.length} image{orderImages.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-base-content">
                        £{(order.pricing?.total || 0).toFixed(2)}
                      </p>
                      <span className={`${getPaymentBadgeClass(paymentStatus)} mt-1 capitalize`}>
                        {paymentStatus}
                      </span>
                    </div>
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="btn btn-primary btn-sm"
                      aria-label={`Open order ${order.orderNumber}`}
                    >
                      Open
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
        <TableContainer className="hidden md:block">
          <table className="table table-zebra table-fixed w-full min-w-[920px] text-sm">
            <thead>
              <tr className="bg-base-200 text-xs uppercase tracking-wide text-base-content/70">
                <th className="w-[26%] px-4">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs px-0 font-semibold uppercase tracking-wide"
                    onClick={() => handleSort('orderNumber')}
                  >
                    Order / customer
                    {sortField === 'orderNumber' && (sortDirection === 'desc' ? ' v' : ' ^')}
                  </button>
                </th>
                <th className="w-[22%] px-4">Items</th>
                <th className="w-[13%] px-4">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs px-0 font-semibold uppercase tracking-wide"
                    onClick={() => handleSort('dateNeeded')}
                  >
                    Needed
                    {sortField === 'dateNeeded' && (sortDirection === 'desc' ? ' v' : ' ^')}
                  </button>
                </th>
                <th className="w-[12%] px-4 text-right">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs px-0 font-semibold uppercase tracking-wide"
                    onClick={() => handleSort('total')}
                  >
                    Total
                    {sortField === 'total' && (sortDirection === 'desc' ? ' v' : ' ^')}
                  </button>
                </th>
                <th className="w-[12%] px-4">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs px-0 font-semibold uppercase tracking-wide"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortField === 'status' && (sortDirection === 'desc' ? ' v' : ' ^')}
                  </button>
                </th>
                <th className="w-[15%] px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-base-content/65">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-base-content/65">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const placedAt = formatOrderDateTime(order._createdAt);
                  const firstItem = order.items[0];
                  const additionalItems = Math.max(order.items.length - 1, 0);
                  const paymentStatus = order.pricing?.paymentStatus || 'pending';
                  const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status;
                  const orderImages = getOrderImagePreviews(order);
                  const visibleOrderImages = orderImages.slice(0, 3);

                  return (
                    <tr key={order._id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-base-content">
                          #{order.orderNumber}
                        </div>
                        <div className="mt-1 text-xs text-base-content/60">
                          {placedAt.date}, {placedAt.time}
                        </div>
                        <div className="mt-3 font-medium text-base-content">
                          {order.customer.name}
                        </div>
                        <a
                          className="mt-1 block truncate text-xs text-base-content/65 hover:text-primary"
                          href={`mailto:${order.customer.email}`}
                        >
                          {order.customer.email}
                        </a>
                        <a
                          className="mt-1 block text-xs text-base-content/65 hover:text-primary"
                          href={`tel:${order.customer.phone}`}
                        >
                          {order.customer.phone}
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        <div className="line-clamp-2 font-medium leading-5 text-base-content">
                          {firstItem ? firstItem.productName : 'Custom order'}
                        </div>
                        <div className="mt-1 text-xs text-base-content/65">
                          {firstItem ? `Qty ${firstItem.quantity}` : 'No line items'}
                          {additionalItems > 0 && `, +${additionalItems} more`}
                        </div>
                        {orderImages.length > 0 && (
                          <div
                            className="mt-3 flex items-center gap-2"
                            aria-label={`${orderImages.length} image${orderImages.length === 1 ? '' : 's'} attached to order ${order.orderNumber}`}
                          >
                            <div className="flex -space-x-2">
                              {visibleOrderImages.map((image, index) => {
                                const imageUrl = getImageUrl(image.asset);

                                if (!imageUrl) {
                                  return null;
                                }

                                return (
                                  <button
                                    key={`${image.source}-${index}`}
                                    type="button"
                                    className="h-9 w-9 overflow-hidden rounded border-2 border-base-100 bg-base-200 shadow-sm"
                                    onClick={() => handleImageClick(image.asset)}
                                    aria-label={`Open ${image.alt}`}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={image.alt}
                                      className="h-full w-full object-cover"
                                    />
                                  </button>
                                );
                              })}
                            </div>
                            <span className="badge badge-outline badge-sm">
                              {orderImages.length}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {order.delivery?.dateNeeded ? (
                          <div className="font-medium text-base-content">
                            {new Date(order.delivery.dateNeeded).toLocaleDateString('en-GB')}
                          </div>
                        ) : (
                          <div className="italic text-base-content/55">
                            Date not specified
                          </div>
                        )}
                        <div className="mt-1 text-xs text-base-content/65">
                          {formatDeliveryMethod(order.delivery?.deliveryMethod)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-semibold text-base-content">
                          £{(order.pricing?.total || 0).toFixed(2)}
                        </div>
                        <span className={`${getPaymentBadgeClass(paymentStatus)} mt-2 capitalize`}>
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span className={getStatusBadgeClass(order.status)}>
                            {statusLabel}
                          </span>
                          {getOperationalBadge(order.status)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-nowrap justify-end gap-2">
                          <span title="Open Order">
                            <Link
                              href={`/admin/orders/${order.orderNumber}`}
                              className="btn btn-primary btn-xs"
                              aria-label={`Open order ${order.orderNumber}`}
                            >
                              Open
                            </Link>
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TableContainer>
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
      </div>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                Order editor
              </p>
              <span className="mt-1 block text-xl font-semibold text-base-content">
                #{selectedOrder?.orderNumber}
              </span>
            </div>
            {selectedOrder && (
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <span className={getStatusBadgeClass(editForm.status)}>
                  {ORDER_STATUS_LABELS[editForm.status as keyof typeof ORDER_STATUS_LABELS] || editForm.status}
                </span>
                <span className={`${getPaymentBadgeClass(editForm.paymentStatus)} capitalize`}>
                  {editForm.paymentStatus || 'pending'}
                </span>
              </div>
            )}
          </div>
        </DialogTitle>
        <DialogContent className="space-y-5">
          {selectedOrder && (
            <section className="grid gap-3 rounded-box border border-base-300 bg-base-200/40 p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                  Customer
                </p>
                <p className="mt-1 font-medium text-base-content">{selectedOrder.customer.name}</p>
                <p className="truncate text-base-content/65">{selectedOrder.customer.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                  Needed
                </p>
                <p className="mt-1 font-medium text-base-content">
                  {editForm.dateNeeded ? editForm.dateNeeded.format('DD/MM/YYYY') : 'Not specified'}
                </p>
                <p className="text-base-content/65">{formatDeliveryMethod(editForm.deliveryMethod)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                  Total
                </p>
                <p className="mt-1 font-semibold text-base-content">
                  £{Number(editForm.totalPrice || 0).toFixed(2)}
                </p>
                <p className="text-base-content/65">{formatDeliveryMethod(editForm.paymentMethod)}</p>
              </div>
            </section>
          )}
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
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                <DatePicker
                  label="Date Needed"
                  value={editForm.dateNeeded}
                  onChange={(newValue) => setEditForm({ ...editForm, dateNeeded: newValue })}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "medium",
                    },
                  }}
                />
              </LocalizationProvider>
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
                    Custom Order
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
                <label
                  htmlFor="image-upload"
                  className="btn btn-outline btn-sm cursor-pointer"
                >
                  Upload images
                </label>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className="mt-2 block"
                >
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
        <DialogActions className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button
            onClick={() => setDeleteConfirmOpen(true)}
            variant="outlined"
            color="error"
            size="small"
            className="w-full sm:mr-auto sm:w-auto"
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
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Order Permanently</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This action will permanently delete order #{selectedOrder?.orderNumber} from Supabase.
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
            disabled={deletePassword.trim().length === 0 || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                Order details
              </p>
              <span className="mt-1 block text-xl font-semibold text-base-content">
                #{selectedOrder?.orderNumber}
              </span>
            </div>
            {selectedOrder && (
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <span className={getStatusBadgeClass(selectedOrder.status)}>
                  {ORDER_STATUS_LABELS[selectedOrder.status as keyof typeof ORDER_STATUS_LABELS] || selectedOrder.status}
                </span>
                <span className={`${getPaymentBadgeClass(selectedOrder.pricing?.paymentStatus)} capitalize`}>
                  {selectedOrder.pricing?.paymentStatus || 'pending'}
                </span>
                <span className="badge badge-sm">
                  £{(selectedOrder.pricing?.total || 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </DialogTitle>
        <DialogContent className="space-y-5">
          {selectedOrder && (
            <>
              <section className="grid gap-3 rounded-box border border-base-300 bg-base-200/40 p-4 text-sm md:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                    Customer
                  </p>
                  <p className="mt-1 font-medium text-base-content">{selectedOrder.customer.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                    Needed
                  </p>
                  <p className="mt-1 font-medium text-base-content">
                    {selectedOrder.delivery?.dateNeeded
                      ? new Date(selectedOrder.delivery.dateNeeded).toLocaleDateString('en-GB')
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                    Method
                  </p>
                  <p className="mt-1 font-medium text-base-content">
                    {formatDeliveryMethod(selectedOrder.delivery?.deliveryMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                    Total
                  </p>
                  <p className="mt-1 font-semibold text-base-content">
                    £{(selectedOrder.pricing?.total || 0).toFixed(2)}
                  </p>
                </div>
              </section>
              <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Name:</strong> {selectedOrder.customer.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Email:</strong>{' '}
                    <Typography
                      component="a"
                      href={`mailto:${selectedOrder.customer.email}`}
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {selectedOrder.customer.email}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Phone:</strong>{' '}
                    <Typography
                      component="a"
                      href={`tel:${selectedOrder.customer.phone}`}
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {selectedOrder.customer.phone}
                    </Typography>
                  </Typography>
                  {selectedOrder.customer.address && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Address:</strong> {selectedOrder.customer.address}
                    </Typography>
                  )}
                  {selectedOrder.customer.city && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>City:</strong> {selectedOrder.customer.city}
                    </Typography>
                  )}
                  {selectedOrder.customer.postcode && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Postcode:</strong> {selectedOrder.customer.postcode}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Approx. submitted from:</strong> {formatIpLocation(getOrderIpLocation(selectedOrder))}
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>Order Items</Typography>
                {selectedOrder.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {item.productName}
                    </Typography>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      {item.productType && (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-base-content/55">Product type</dt>
                          <dd className="mt-1 text-base-content">
                            {item.productType === 'cake' ? 'Cake' : item.productType === 'gift-hamper' ? 'Gift Hamper' : item.productType}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-base-content/55">Quantity</dt>
                        <dd className="mt-1 text-base-content">{item.quantity}</dd>
                      </div>
                      {item.unitPrice != null && (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-base-content/55">Unit price</dt>
                          <dd className="mt-1 text-base-content">£{(item.unitPrice || 0).toFixed(2)}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-base-content/55">Total price</dt>
                        <dd className="mt-1 font-medium text-base-content">£{(item.totalPrice || 0).toFixed(2)}</dd>
                      </div>
                      {item.size && (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-base-content/55">Size</dt>
                          <dd className="mt-1 text-base-content">{item.size}</dd>
                        </div>
                      )}
                      {item.flavor && (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-base-content/55">Flavor</dt>
                          <dd className="mt-1 text-base-content">{item.flavor}</dd>
                        </div>
                      )}
                      {item.designType && (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-base-content/55">Design</dt>
                          <dd className="mt-1 text-base-content">
                            {item.designType === 'standard' ? 'Standard Design' : item.designType === 'individual' ? 'Individual Design' : item.designType}
                          </dd>
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                            Special instructions
                          </dt>
                          <Typography variant="body2" sx={{ mt: 0.5, p: 1, bgcolor: 'grey.50', borderRadius: 0.5, whiteSpace: 'pre-wrap' }}>
                            {item.specialInstructions}
                          </Typography>
                        </div>
                      )}
                    </dl>

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
                                        logger.error('Failed to load design image', e);
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
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Date Needed:</strong> {new Date(selectedOrder.delivery.dateNeeded).toLocaleDateString('en-GB')}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Method:</strong> {selectedOrder.delivery?.deliveryMethod
                      ? selectedOrder.delivery.deliveryMethod
                        .replace('-', ' ')
                        .replace(/\b\w/g, (char) => char.toUpperCase())
                      : 'Not specified'}
                  </Typography>
                  {selectedOrder.delivery?.deliveryAddress && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Delivery Address:</strong>
                    </Typography>
                  )}
                  {selectedOrder.delivery?.deliveryAddress && (
                    <Typography variant="body2" sx={{ mb: 1, ml: 2, p: 1, bgcolor: 'grey.50', borderRadius: 0.5, whiteSpace: 'pre-wrap' }}>
                      {selectedOrder.delivery.deliveryAddress}
                    </Typography>
                  )}
                  {selectedOrder.delivery?.trackingNumber && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Tracking Number:</strong> {selectedOrder.delivery.trackingNumber}
                    </Typography>
                  )}
                </Box>

                <Typography variant="h6" gutterBottom>Pricing</Typography>
                <Box sx={{ mb: 2 }}>
                  {selectedOrder.pricing?.subtotal != null && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Subtotal:</strong> £{(selectedOrder.pricing.subtotal || 0).toFixed(2)}
                    </Typography>
                  )}
                  {selectedOrder.pricing?.deliveryFee != null && selectedOrder.pricing.deliveryFee > 0 && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Delivery Fee:</strong> £{(selectedOrder.pricing.deliveryFee || 0).toFixed(2)}
                    </Typography>
                  )}
                  {selectedOrder.pricing?.discount != null && selectedOrder.pricing.discount > 0 && (
                    <Typography variant="body2" sx={{ mb: 0.5, color: 'success.main' }}>
                      <strong>Discount:</strong> -£{(selectedOrder.pricing.discount || 0).toFixed(2)}
                    </Typography>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    <strong>Total:</strong> £{(selectedOrder.pricing?.total || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Payment Status:</strong> {selectedOrder.pricing?.paymentStatus
                      ? selectedOrder.pricing.paymentStatus.charAt(0).toUpperCase() + selectedOrder.pricing.paymentStatus.slice(1)
                      : 'Pending'}
                  </Typography>
                  {selectedOrder.pricing?.paymentMethod && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Payment Method:</strong> {selectedOrder.pricing.paymentMethod
                        .replace('-', ' ')
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </Typography>
                  )}
                </Box>

                {selectedOrder.delivery?.deliveryNotes && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Delivery Notes</Typography>
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedOrder.delivery.deliveryNotes}
                      </Typography>
                    </Box>
                  </>
                )}

                {(() => {
                  // Check both delivery.giftNote (new format) and metadata.giftNote (old format) for backwards compatibility
                  const giftNote = selectedOrder.delivery?.giftNote || selectedOrder.metadata?.giftNote;
                  if (giftNote) {
                    return (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                          Gift Note
                        </Typography>
                        <Box
                          sx={{
                            mb: 2,
                            p: 2,
                            bgcolor: 'primary.50',
                            borderRadius: 1,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              fontStyle: 'italic',
                              color: 'text.primary',
                              lineHeight: 1.6
                            }}
                          >
                            {giftNote}
                          </Typography>
                        </Box>
                      </>
                    );
                  }
                  return null;
                })()}

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
                                          logger.error('Failed to load message image', e);
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
                                          logger.error('Failed to load thumbnail image', e);
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
            </>
          )}
        </DialogContent>
        <DialogActions className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
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
                src={getImageUrl(selectedImage, 800, 600)}
                alt="Note attachment"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
                onError={(e) => {
                  logger.error('Failed to load image in modal', e);
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
    </div>
  );
}
