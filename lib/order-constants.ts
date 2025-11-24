/**
 * Constants for order management
 * Centralized status definitions and labels
 */

export const ORDER_STATUS_COLORS = {
    'new': 'error',
    'confirmed': 'warning',
    'in-progress': 'info',
    'ready-pickup': 'primary',
    'out-delivery': 'secondary',
    'delivered': 'success',
    'completed': 'success',
    'cancelled': 'error',
} as const;

export const ORDER_STATUS_LABELS = {
    'new': 'New Order',
    'confirmed': 'Confirmed',
    'in-progress': 'In Progress',
    'ready-pickup': 'Ready for Pickup',
    'out-delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_COLORS;

