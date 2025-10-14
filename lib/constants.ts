/**
 * Business constants and settings
 * Centralized location for all business configuration
 */

export const BUSINESS_CONSTANTS = {
  // Contact Information
  PHONE: '+44 786 721 8194',
  EMAIL: 'hello@olgishcakes.co.uk',
  WEBSITE: 'https://olgishcakes.co.uk',
  
  // Business Details
  NAME: 'Olgish Cakes',
  TAGLINE: 'Traditional Ukrainian Cakes & Desserts',
  
  // Address (if needed in the future)
  ADDRESS: {
    street: '',
    city: 'Leeds',
    postcode: '',
    country: 'United Kingdom'
  },
  
  // Social Media
  SOCIAL: {
    instagram: 'https://instagram.com/olgishcakes',
    facebook: 'https://facebook.com/olgishcakes',
    whatsapp: 'https://wa.me/447867218194',
    youtube: 'https://www.youtube.com/channel/UCxv3i6tL5v5KZNjT1z1Rx1Q'
  },
  
  // Business Hours (if needed in the future)
  HOURS: {
    monday: '9:00 AM - 8:00 PM',
    tuesday: '9:00 AM - 8:00 PM',
    wednesday: '9:00 AM - 8:00 PM',
    thursday: '9:00 AM - 8:00 PM',
    friday: '9:00 AM - 8:00 PM',
    saturday: '9:00 AM - 8:00 PM',
    sunday: '9:00 AM - 8:00 PM'
  }
} as const;

/**
 * Helper functions for phone number formatting
 */
export const PHONE_UTILS = {
  /**
   * Get display phone number (international format)
   */
  get displayPhone() {
    return BUSINESS_CONSTANTS.PHONE;
  },
  
  /**
   * Get tel: link for phone number
   */
  get telLink() {
    return `tel:${BUSINESS_CONSTANTS.PHONE}`;
  },
  
  /**
   * Get phone number for WhatsApp (no spaces, no +)
   */
  get whatsappPhone() {
    return BUSINESS_CONSTANTS.PHONE.replace(/\s/g, '').replace(/\+/, '');
  },
  
  /**
   * Get WhatsApp link
   */
  get whatsappLink() {
    return `https://wa.me/${this.whatsappPhone}`;
  }
} as const;

/**
 * Email utilities
 */
export const EMAIL_UTILS = {
  /**
   * Get mailto: link
   */
  get mailtoLink() {
    return `mailto:${BUSINESS_CONSTANTS.EMAIL}`;
  }
} as const;
