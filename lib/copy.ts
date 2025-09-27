// Copywriting helper functions with Ukrainian-in-UK ESL style
// Voice: warm, slightly imperfect, honest, friendly

export const copy = {
  // Auth messages
  verifyEmail: {
    banner: "Please check your email to verify. Small step, but important.",
    success: "Email verified! Welcome to Olgish family.",
    error: "Something went wrong with verification. Please try again.",
  },

  // Password messages
  password: {
    rules: "Use long password, not easy guess. At least 10 characters, please.",
    reset: "Check your email for reset link. We will help you back in.",
    changed: "Password changed! Your account is safe now.",
  },

  // Address messages
  address: {
    empty: "No address yet. Add one, so we know where to bring sweetness.",
    added: "Address saved! We know where to find you now.",
    updated: "Address updated. All good!",
    deleted: "Address removed. We will miss it.",
    defaultSet: "This is now your main address. Like home.",
  },

  // Order messages
  order: {
    success: "Thank you so much. Your hamper is on the way, like warm hug from kitchen.",
    pending: "Order is waiting for payment. Almost there!",
    paid: "All good — your order is paid. Thank you!",
    cancelled: "Order cancelled. No worries, we understand.",
  },

  // Product messages
  product: {
    buyNow: "Buy now",
    buyNowPolite: "Buy now, please",
    outOfStock: "Sorry, not available right now. Check back soon?",
    addedToCart: "Added to your basket. Good choice!",
  },

  // General messages
  general: {
    loading: "Just a moment, please...",
    error: "Oops, something went wrong. Please try again.",
    success: "All done! Thank you.",
    confirm: "Are you sure? This action cannot be undone.",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
  },

  // Email greetings
  email: {
    greeting: "Hello, it's Olgish.",
    closing: "With warm regards,\nOlgish",
    thankYou: "Thank you for choosing our cakes.",
  },

  // Error messages
  error: {
    network: "Connection problem. Check your internet, please.",
    unauthorized: "Please sign in first.",
    forbidden: "Sorry, you cannot do this.",
    notFound: "What you looking for is not here.",
    serverError: "Our server is having trouble. Please try later.",
    validation: "Please check your information and try again.",
  },
} as const;

// Helper function to format currency in GBP
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount / 100); // Convert from pence to pounds
}

// Helper function to format dates in British format
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

// Helper function for friendly error messages
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return copy.general.error;
}

