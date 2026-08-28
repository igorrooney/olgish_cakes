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
    recipientName?: string;
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
    deliveryCourier?: string;
    termsPresentedVersion?: string
    allergenStatement?: string
    allergenLabelIncluded?: boolean
    allergenConfirmedAt?: string
    customerAcceptedOffer?: boolean
    customerAcceptedAt?: string
    dietaryHealthInformation?: string | null
    dietaryHealthConsent?: boolean
    dietaryHealthConsentVersion?: string | null
    dietaryHealthConsentedAt?: string | null
    dietaryHealthWithdrawnAt?: string | null
    customerFacingOfferDescription?: string
    [key: string]: unknown;
}

export interface OrderRetentionLifecycle {
    completedAt?: string
    financialYearEndedAt?: string
    retentionDueAt?: string
    dietaryHealthRetentionDueAt?: string
    dietaryHealthErasedAt?: string
    legalHold: boolean
    legalHoldReason?: 'active-complaint' | 'legal-claim' | 'regulatory-request' | 'fraud-investigation' | 'other-necessary-hold'
    legalHoldReviewAt?: string
}

export type OrderRetentionEvidenceBasis =
    | 'order-status-record'
    | 'payment-provider-record'
    | 'invoice-accounting-record'
    | 'customer-correspondence'

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
    retentionLifecycle?: OrderRetentionLifecycle;
}

/**
 * Order update payload for PATCH requests
 */
export interface OrderUpdate {
    status?: string;
    trackingNumber?: string;
    deliveryCourier?: string;
    deliveryMethod?: string;
    deliveryRecipientName?: string;
    deliveryAddress?: string;
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
    items?: OrderItem[];
    subtotal?: number;
    deliveryFee?: number;
    discount?: number;
    total?: number;
    allergenStatement?: string;
    allergenLabelIncluded?: boolean;
    customerAcceptedOffer?: boolean;
    customerFacingOfferDescription?: string;
}

/**
 * Type for sortable order field values
 */
export type SortableOrderValue = string | number | Date | null;

