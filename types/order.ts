/**
 * Type definitions for order management
 */

export interface OrderItem {
    productType?: string;
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice?: number;
    totalPrice: number;
    size?: string;
    flavor?: string;
    designType?: string;
    specialInstructions?: string;
}

export interface OrderCustomer {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postcode?: string;
}

export interface OrderDelivery {
    dateNeeded?: string;
    deliveryMethod: string;
    deliveryAddress?: string;
    trackingNumber?: string;
    deliveryNotes?: string;
    giftNote?: string;
}

export interface OrderPricing {
    subtotal?: number;
    deliveryFee?: number;
    discount?: number;
    total: number;
    paymentStatus: string;
    paymentMethod?: string;
}

export interface OrderMessageAttachment {
    _type: string;
    asset: {
        _type: string;
        _id: string;
        _ref: string;
        url: string;
    };
    alt?: string;
    caption?: string;
}

/**
 * Attachment type alias for backward compatibility
 */
export type Attachment = OrderMessageAttachment;

export interface OrderMessage {
    message: string;
    attachments?: OrderMessageAttachment[];
}

export interface OrderNoteImage {
    _type: string;
    asset: {
        _type: string;
        _id?: string;
        _ref?: string;
        url?: string;
    };
    alt?: string;
    caption?: string;
}

export interface OrderNote {
    note: string;
    author: string;
    createdAt: string;
    images?: OrderNoteImage[];
}

export interface OrderMetadata {
    giftNote?: string;
    [key: string]: unknown;
}

export interface Order {
    _id: string;
    _createdAt: string;
    _updatedAt: string;
    orderNumber: string;
    status: string;
    orderType: string;
    customer: OrderCustomer;
    items: OrderItem[];
    delivery: OrderDelivery;
    pricing: OrderPricing;
    messages?: OrderMessage[];
    notes?: OrderNote[];
    metadata?: OrderMetadata;
}

/**
 * Order update payload for PATCH requests
 */
export interface OrderUpdate {
    status?: string;
    trackingNumber?: string;
    deliveryMethod?: string;
    dateNeeded?: string | null;
    paymentStatus?: string;
    paymentMethod?: string;
    note?: string;
    author?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    customerCity?: string;
    customerPostcode?: string;
    itemPrice?: string;
    totalPrice?: string;
    selectedCakeId?: string;
    selectedCakeName?: string;
    selectedCakeSize?: string;
    selectedDesignType?: string;
    subtotal?: number;
    deliveryFee?: number;
    discount?: number;
    total?: number;
}

/**
 * Type for sortable order field values
 */
export type SortableOrderValue = string | number | Date | null;

