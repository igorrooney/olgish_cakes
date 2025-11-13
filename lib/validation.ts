import { z } from 'zod'

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  dateNeeded: z.string().optional(),
  cakeInterest: z.string().optional(),
  isOrderForm: z.boolean().optional()
})

// Quote form validation
export const quoteFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
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

// Order validation
export const orderSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
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

