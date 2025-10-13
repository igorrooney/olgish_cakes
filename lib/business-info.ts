/**
 * Business information utilities
 * Centralized location for business contact details
 * 
 * @deprecated Use BUSINESS_CONSTANTS and helper utilities from lib/constants.ts instead
 */

import { BUSINESS_CONSTANTS, PHONE_UTILS, EMAIL_UTILS } from './constants';

export const BUSINESS_INFO = {
  // Phone number from constants
  get phone() {
    return BUSINESS_CONSTANTS.PHONE;
  },
  
  // Formatted phone number for display
  get displayPhone() {
    return PHONE_UTILS.displayPhone;
  },
  
  // Phone number for tel: links
  get telLink() {
    return PHONE_UTILS.telLink;
  },
  
  // Email address
  get email() {
    return BUSINESS_CONSTANTS.EMAIL;
  },
  
  // Email link
  get emailLink() {
    return EMAIL_UTILS.mailtoLink;
  },
  
  // Website URL
  get website() {
    return BUSINESS_CONSTANTS.WEBSITE;
  }
} as const;

// For client-side usage - uses constants
export const CLIENT_BUSINESS_INFO = {
  // Phone number from constants
  get phone() {
    return BUSINESS_CONSTANTS.PHONE;
  },
  
  // Formatted phone number for display
  get displayPhone() {
    return PHONE_UTILS.displayPhone;
  },
  
  // Phone number for tel: links
  get telLink() {
    return PHONE_UTILS.telLink;
  },
  
  // Email address
  get email() {
    return BUSINESS_CONSTANTS.EMAIL;
  },
  
  // Email link
  get emailLink() {
    return EMAIL_UTILS.mailtoLink;
  },
  
  // Website URL
  get website() {
    return BUSINESS_CONSTANTS.WEBSITE;
  }
} as const;
