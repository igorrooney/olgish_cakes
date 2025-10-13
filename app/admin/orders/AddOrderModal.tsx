"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon, Search as SearchIcon } from "@mui/icons-material";

interface AddOrderModalProps {
  open: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

interface Product {
  id: string;
  name: string;
  type: string;
  category: string;
  size?: string;
  pricing?: {
    standard: number;
    individual: number;
  };
  price?: number;
  slug: string;
  displayName: string;
  standardPrice: number;
  individualPrice: number;
}

interface OrderItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  designType: string;
  size: string;
  flavor: string;
  specialInstructions: string;
  isFromCatalog: boolean;
}

export function AddOrderModal({ open, onClose, onOrderCreated }: AddOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Customer info
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",

    // Order info
    orderType: "cake-standard-design",
    dateNeeded: "",
    deliveryMethod: "collection",
    deliveryAddress: "",
    deliveryNotes: "",
    paymentMethod: "cash-collection",
    message: "",

    // Pricing
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
  });

  const [items, setItems] = useState<OrderItem[]>([
    {
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      designType: "standard",
      size: "",
      flavor: "",
      specialInstructions: "",
      isFromCatalog: false,
    },
  ]);

  // Fetch products when modal opens
  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  // Set default delivery and payment methods based on order type
  useEffect(() => {
    if (formData.orderType === "gift-hamper") {
      setFormData(prev => ({
        ...prev,
        deliveryMethod: "postal",
        paymentMethod: "card"
      }));
    }
  }, [formData.orderType]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate total when pricing fields change
    if (field === 'subtotal' || field === 'deliveryFee' || field === 'discount') {
      const newSubtotal = field === 'subtotal' ? parseFloat(value) || 0 : formData.subtotal;
      const newDeliveryFee = field === 'deliveryFee' ? parseFloat(value) || 0 : formData.deliveryFee;
      const newDiscount = field === 'discount' ? parseFloat(value) || 0 : formData.discount;
      const newTotal = newSubtotal + newDeliveryFee - newDiscount;

      setFormData(prev => ({
        ...prev,
        total: newTotal
      }));
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Auto-calculate item total when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseInt(value) || 0 : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : newItems[index].unitPrice;
      newItems[index].totalPrice = quantity * unitPrice;
    }

    // Update price when design type changes for catalog items
    if (field === 'designType' && newItems[index].isFromCatalog && newItems[index].productId) {
      const product = products.find(p => p.id === newItems[index].productId);
      if (product) {
        const newPrice = value === 'individual' ? product.individualPrice : product.standardPrice;
        newItems[index].unitPrice = newPrice;
        newItems[index].totalPrice = newItems[index].quantity * newPrice;
      }
    }

    setItems(newItems);

    // Recalculate subtotal
    const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
    handleInputChange('subtotal', subtotal);
  };

  const handleProductSelect = (index: number, product: Product) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.displayName,
      size: product.size || '',
      isFromCatalog: true,
      // Set unit price based on design type
      unitPrice: newItems[index].designType === 'individual' ? product.individualPrice : product.standardPrice,
      totalPrice: newItems[index].quantity * (newItems[index].designType === 'individual' ? product.individualPrice : product.standardPrice),
    };

    setItems(newItems);

    // Recalculate subtotal
    const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
    handleInputChange('subtotal', subtotal);
  };

  const addItem = () => {
    setItems([...items, {
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      designType: "standard",
      size: "",
      flavor: "",
      specialInstructions: "",
      isFromCatalog: false,
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);

      // Recalculate subtotal
      const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      handleInputChange('subtotal', subtotal);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error("Customer name, email, and phone are required");
      }

      if (!formData.dateNeeded) {
        throw new Error("Date needed is required");
      }

      if (items.some(item => !item.productName || item.unitPrice <= 0)) {
        throw new Error("All items must have a product name and valid price");
      }

      if (formData.total <= 0) {
        throw new Error("Total amount must be greater than 0");
      }

      const orderData = {
        ...formData,
        items: items.map(item => ({
          productType: item.isFromCatalog ? "catalog" : "custom",
          productId: item.productId || "",
          productName: item.productName,
          designType: item.designType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          size: item.size,
          flavor: item.flavor,
          specialInstructions: item.specialInstructions,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Order created successfully! Order #${result.orderNumber}`);

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          postcode: "",
          orderType: "cake-standard-design",
          dateNeeded: "",
          deliveryMethod: "collection",
          deliveryAddress: "",
          deliveryNotes: "",
          paymentMethod: "cash-collection",
          message: "",
          subtotal: 0,
          deliveryFee: 0,
          discount: 0,
          total: 0,
        });

        setItems([{
          productId: "",
          productName: "",
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          designType: "standard",
          size: "",
          flavor: "",
          specialInstructions: "",
          isFromCatalog: false,
        }]);

        onOrderCreated();

        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess("");
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add New Order</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Customer Information</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postcode"
                value={formData.postcode}
                onChange={(e) => handleInputChange("postcode", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Order Information</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Order Type</InputLabel>
                <Select
                  value={formData.orderType}
                  onChange={(e) => handleInputChange("orderType", e.target.value)}
                  label="Order Type"
                >
                  <MenuItem value="cake-standard-design">Cake Standard Design</MenuItem>
                  <MenuItem value="cake-individual-design">Cake Individual Design</MenuItem>
                  <MenuItem value="wedding-cake">Wedding Cake</MenuItem>
                  <MenuItem value="gift-hamper">Gift Hamper</MenuItem>
                  <MenuItem value="custom-quote">Custom Quote</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date Needed *"
                type="date"
                value={formData.dateNeeded}
                onChange={(e) => handleInputChange("dateNeeded", e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Delivery Method</InputLabel>
                <Select
                  value={formData.deliveryMethod}
                  onChange={(e) => handleInputChange("deliveryMethod", e.target.value)}
                  label="Delivery Method"
                >
                  <MenuItem value="collection">Collection</MenuItem>
                  <MenuItem value="local-delivery">Local Delivery</MenuItem>
                  <MenuItem value="postal">Postal Delivery</MenuItem>
                  <MenuItem value="market-pickup">Market Stall Pickup</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="cash-collection">Cash on Collection</MenuItem>
                  <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                  <MenuItem value="card">Card Payment</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Address"
                multiline
                rows={2}
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Notes"
                multiline
                rows={2}
                value={formData.deliveryNotes}
                onChange={(e) => handleInputChange("deliveryNotes", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Message"
                multiline
                rows={3}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Order Items</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  variant="outlined"
                  size="small"
                >
                  Add Item
                </Button>
              </Box>
            </Grid>

            {items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Item {index + 1}</Typography>
                    {items.length > 1 && (
                      <IconButton onClick={() => removeItem(index)} size="small" color="error">
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <FormControl fullWidth>
                          <InputLabel>Select Product from Catalog</InputLabel>
                          <Select
                            value={item.productId || ""}
                            onChange={(e) => {
                              const product = products.find(p => p.id === e.target.value);
                              if (product) {
                                handleProductSelect(index, product);
                              }
                            }}
                            label="Select Product from Catalog"
                            disabled={productsLoading}
                          >
                          <MenuItem value="">
                            <em>Or enter custom product name below</em>
                          </MenuItem>
                          {productsLoading ? (
                            <MenuItem disabled>
                              Loading products...
                            </MenuItem>
                          ) : products.length === 0 ? (
                            <MenuItem disabled>
                              No products found
                            </MenuItem>
                          ) : (
                            products.map((product) => (
                              <MenuItem key={product.id} value={product.id}>
                                {product.displayName} - £{product.standardPrice.toFixed(2)} (Standard) / £{product.individualPrice.toFixed(2)} (Individual)
                              </MenuItem>
                            ))
                          )}
                          </Select>
                        </FormControl>
                        {item.isFromCatalog && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              const newItems = [...items];
                              newItems[index] = {
                                ...newItems[index],
                                productId: "",
                                productName: "",
                                unitPrice: 0,
                                totalPrice: 0,
                                size: "",
                                isFromCatalog: false,
                              };
                              setItems(newItems);
                              const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
                              handleInputChange('subtotal', subtotal);
                            }}
                          >
                            Clear
                          </Button>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Product Name *"
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                        placeholder={item.isFromCatalog ? "Selected from catalog" : "Enter custom product name"}
                        disabled={item.isFromCatalog}
                        required
                      />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Unit Price (£)"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Design Type</InputLabel>
                        <Select
                          value={item.designType}
                          onChange={(e) => handleItemChange(index, "designType", e.target.value)}
                          label="Design Type"
                        >
                          <MenuItem value="standard">Standard Design</MenuItem>
                          <MenuItem value="individual">Individual Design</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Total Price (£)"
                        value={item.totalPrice.toFixed(2)}
                        disabled
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Size"
                        value={item.size}
                        onChange={(e) => handleItemChange(index, "size", e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Flavor"
                        value={item.flavor}
                        onChange={(e) => handleItemChange(index, "flavor", e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Special Instructions"
                        multiline
                        rows={2}
                        value={item.specialInstructions}
                        onChange={(e) => handleItemChange(index, "specialInstructions", e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Pricing</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Subtotal (£)"
                type="number"
                value={formData.subtotal}
                onChange={(e) => handleInputChange("subtotal", e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Delivery Fee (£)"
                type="number"
                value={formData.deliveryFee}
                onChange={(e) => handleInputChange("deliveryFee", e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Discount (£)"
                type="number"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount (£)"
                type="number"
                value={formData.total}
                onChange={(e) => handleInputChange("total", e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Creating..." : "Create Order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
