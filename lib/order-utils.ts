/**
 * Order utility functions
 * Shared utilities for order management
 */

/**
 * Generate unique numeric order number
 * Format: YYMMDDHHMMSS + 2 random digits (14 digits)
 * Example: 25011314302542 = Jan 13, 2025 at 14:30:25 with random suffix
 * 
 * @returns Unique order number string
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2).padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  // Add 2 random digits to ensure uniqueness if orders are created in the same second
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  
  return `${year}${month}${day}${hours}${minutes}${seconds}${random}`
}

/**
 * Generate unique key for Sanity array items
 * Uses timestamp + random string to avoid collisions
 * 
 * @param prefix - Optional prefix for the key (e.g., 'item', 'msg')
 * @returns Unique key string
 */
export function generateUniqueKey(prefix: string = 'key'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11) // 9 random chars
  return `${prefix}-${timestamp}-${random}`
}

