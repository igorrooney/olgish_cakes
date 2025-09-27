// Order status enum
export type OrderStatus = 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED';

// Product interface
export interface Product {
  $id: string;
  name: string;
  slug: string;
  description: string;
  priceGBP: number; // in pence
  isGiftHamper: boolean;
  stripePriceId?: string;
  categoryId?: string;
  images: string[];
  isActive: boolean;
}

// Category interface
export interface Category {
  $id: string;
  name: string;
  slug: string;
}

// Order interface
export interface Order {
  $id?: string;
  userId: string;
  status: OrderStatus;
  subtotalGBP: number; // in pence
  totalGBP: number; // in pence
  currency: string;
  paymentIntentId?: string;
  stripeCheckoutSessionId: string;
  email: string; // snapshot at time of order
  shippingName: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Order item interface
export interface OrderItem {
  $id?: string;
  orderId: string;
  productId: string;
  name: string;
  unitPriceGBP: number; // in pence
  quantity: number;
  image: string;
}

// Complete order with items
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Checkout session data
export interface CheckoutSessionData {
  productId: string;
  quantity?: number;
  customerEmail?: string;
}

// Stripe webhook event types
export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

// Order creation data
export interface CreateOrderData {
  userId: string;
  stripeCheckoutSessionId: string;
  email: string;
  shippingName: string;
  shippingAddress: Order['shippingAddress'];
  items: {
    productId: string;
    name: string;
    unitPriceGBP: number;
    quantity: number;
    image: string;
  }[];
}

