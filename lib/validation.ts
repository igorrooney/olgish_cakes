import { z } from 'zod'

// UK phone number validation
// Validates UK phone numbers in various formats
// Supports: +44..., 0..., 0044..., with spaces, dashes, or no separators
// Examples: +447911123456, 07911123456, +44 7911 123456, 020 1234 5678
function validateUKPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses for validation
  const cleaned = phone.replace(/[\s\-()]/g, '')

  // Check if it starts with UK country code or national format
  if (cleaned.startsWith('+44')) {
    // International format: +44 followed by 9-10 digits (excluding leading 0)
    return /^\+44[1-9]\d{8,9}$/.test(cleaned)
  } else if (cleaned.startsWith('0044')) {
    // Alternative international format: 0044 followed by 9-10 digits
    return /^0044[1-9]\d{8,9}$/.test(cleaned)
  } else if (cleaned.startsWith('0')) {
    // National format: 0 followed by 9-10 digits
    return /^0[1-9]\d{8,9}$/.test(cleaned)
  }

  return false
}

const londonDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

function getTodayDateInputValue(baseDate = new Date()) {
  const dateParts = londonDateFormatter.formatToParts(baseDate)
  const year = dateParts.find((part) => part.type === 'year')?.value
  const month = dateParts.find((part) => part.type === 'month')?.value
  const day = dateParts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Failed to format London date parts')
  }

  return `${year}-${month}-${day}`
}

function isDateOnOrAfterToday(value: string, todayDate = getTodayDateInputValue()) {
  if (!value) {
    return true
  }

  return value >= todayDate
}

const workshopDateErrorMessage = 'Please select a valid date'
const workshopFutureDateErrorMessage = 'Please select a future date'

function getTomorrowDateInputValue(baseDate = new Date()) {
  const tomorrowDate = new Date(baseDate)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  return getTodayDateInputValue(tomorrowDate)
}

function isWorkshopDateInFuture(value: string, tomorrowDate = getTomorrowDateInputValue()) {
  if (!value) {
    return true
  }

  return value >= tomorrowDate
}

const requiredWorkshopEmailSchema = z
  .string()
  .trim()
  .min(1, 'Please add an email address')
  .pipe(z.string().email('Invalid email address'))

const optionalWorkshopPhoneSchema = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .refine((val) => validateUKPhone(val), {
      message: 'Please enter a valid UK phone number (e.g., +44 7911 123456 or 07911 123456)'
    })
])

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .refine((val) => validateUKPhone(val), {
      message: 'Please enter a valid UK phone number (e.g., +44 7911 123456 or 07911 123456)'
    }),
  message: z.string().max(2000).optional(), // Optional when order form, required otherwise
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  dateNeeded: z.string().optional(),
  cakeInterest: z.string().optional(),
  isOrderForm: z.boolean().optional()
}).refine((data) => {
  // Message is required if not an order form
  if (!data.isOrderForm && (!data.message || data.message.trim().length < 10)) {
    return false
  }
  return true
}, {
  message: 'Message must be at least 10 characters when not submitting an order',
  path: ['message']
})

// Quote form validation
export const quoteFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .refine((val) => validateUKPhone(val), {
      message: 'Please enter a valid UK phone number (e.g., +44 7911 123456 or 07911 123456)'
    }),
  occasion: z.string().min(2, 'Please specify the occasion'),
  dateNeeded: z.string().min(1, 'Date is required'),
  guestCount: z.string().optional(),
  cakeType: z.string().min(1, 'Please select a cake type'),
  designStyle: z.string().optional(),
  flavors: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  budget: z.string().min(1, 'Please select a budget range'),
  specialRequests: z.string().max(2000).optional()
})

export const workshopEnquirySchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: requiredWorkshopEmailSchema,
  phone: optionalWorkshopPhoneSchema,
  eventType: z.string().trim().min(1, 'Please select the event type'),
  groupSize: z.string().trim().min(1, 'Please add the group size').max(80),
  location: z.string().trim().min(2, 'Please add the location').max(160),
  preferredDate: z
    .string()
    .trim()
    .min(1, 'Please select a preferred date')
    .pipe(z.string().date(workshopDateErrorMessage))
    .refine((value) => isWorkshopDateInFuture(value), {
      message: workshopFutureDateErrorMessage
    }),
  decorationTheme: z.string().trim().max(160).optional(),
  brief: z.string().trim().min(12, 'Please add a few details about the event').max(2000),
  csrfToken: z.string().min(1, 'CSRF token is required')
})

// Order validation
export const orderSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .refine((val) => validateUKPhone(val), {
      message: 'Please enter a valid UK phone number (e.g., +44 7911 123456 or 07911 123456)'
    }),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  message: z.string().max(2000),
  dateNeeded: z.string().optional(),
  orderType: z.enum(['custom-quote', 'standard', 'custom']).default('custom-quote'),
  productType: z.enum(['cake', 'hamper', 'custom']).default('custom'),
  productId: z.string().optional(),
  productName: z.string().max(200),
  designType: z.enum(['individual', 'standard']).default('individual'),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().nonnegative().default(0),
  totalPrice: z.number().nonnegative().default(0),
  size: z.string().max(100).optional(),
  flavor: z.string().max(100).optional(),
  specialInstructions: z.string().max(2000).optional(),
  deliveryMethod: z.enum(['collection', 'local-delivery', 'courier']).default('collection'),
  deliveryAddress: z.string().max(500).optional(),
  deliveryNotes: z.string().max(500).optional(),
  giftNote: z.string().max(500).optional(),
  note: z.string().max(1000).optional(),
  paymentMethod: z.enum(['cash-collection', 'card-collection', 'online']).default('cash-collection'),
  referrer: z.string().max(200).optional()
})

// Admin login validation
export const adminLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100)
})

// Order status update validation
export const orderStatusSchema = z.object({
  status: z.enum(['new', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'refunded'])
})

// Helper function to validate request body
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const validData = await schema.parseAsync(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// Helper to format validation errors
export function formatValidationErrors(errors: z.ZodError): string {
  return errors.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ')
}

