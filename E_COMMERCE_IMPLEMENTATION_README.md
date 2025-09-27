# OlgishCakes E-commerce Implementation

## Overview

This implementation adds a complete e-commerce authentication and payment system to the OlgishCakes website using Appwrite for backend services and Stripe for payments.

## Features Implemented

### ✅ Authentication System
- **Email/Password Registration** with email verification
- **Google OAuth Integration** for easy sign-in
- **Password Reset** functionality
- **Session Management** with secure cookies
- **Role-based Access Control** (Customer, Admin, Staff)

### ✅ Customer Account Management
- **Account Dashboard** with overview and quick stats
- **Order History** with detailed order tracking
- **Address Management** with UK postcode validation
- **Profile Management** with password updates
- **Account Deletion** (GDPR compliant)

### ✅ Stripe Payment Integration
- **Gift Hamper Checkout** using Stripe Checkout Sessions
- **Secure Payment Processing** with webhook handling
- **Order Creation** and status management
- **Payment Confirmation** emails and pages

### ✅ Security & Compliance
- **CSRF Protection** on all forms
- **Rate Limiting** for authentication routes
- **Secure Headers** and cookie settings
- **GDPR Compliance** with data deletion
- **Input Validation** with Zod schemas

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, daisyUI
- **Backend**: Appwrite (Auth, Database, Storage)
- **Payments**: Stripe (Checkout Sessions, Webhooks)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: daisyUI + Lucide React icons

## Project Structure

```
app/
├── auth/
│   ├── sign-in/
│   ├── sign-up/
│   └── forgot/
├── account/
│   ├── layout.tsx
│   ├── page.tsx (overview)
│   ├── orders/
│   ├── addresses/
│   └── profile/
├── checkout/
│   └── success/
└── api/
    ├── checkout/hamper/
    └── stripe/webhook/

lib/
├── appwrite.ts (Appwrite client setup)
├── auth-context.tsx (Authentication context)
├── copy.ts (Ukrainian-in-UK copywriting)
└── stripe.ts (Stripe integration)

types/
├── auth.ts (Authentication types)
└── orders.ts (Order and product types)

components/
└── gift-hamper-product.tsx
```

## Environment Setup

### Required Environment Variables

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id

# Appwrite Collection IDs
APPWRITE_USERS_PRIVATE_COLLECTION_ID=users_private
APPWRITE_ADDRESSES_COLLECTION_ID=addresses
APPWRITE_PRODUCTS_COLLECTION_ID=products
APPWRITE_CATEGORIES_COLLECTION_ID=categories
APPWRITE_ORDERS_COLLECTION_ID=orders
APPWRITE_ORDER_ITEMS_COLLECTION_ID=order_items

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Appwrite Setup

1. **Create Appwrite Project**
   - Sign up at [Appwrite Cloud](https://cloud.appwrite.io)
   - Create a new project
   - Get your project ID and endpoint

2. **Configure Authentication**
   - Enable Email/Password authentication
   - Configure Google OAuth (add OAuth credentials)
   - Set up email templates

3. **Create Database Collections**
   ```bash
   # Run the setup script to create collections
   npm run setup:appwrite
   ```

4. **Set Collection Permissions**
   - `users_private`: Users can read/write their own documents
   - `addresses`: Users can read/write their own documents
   - `orders`: Users can read their own, admins can read all
   - `products`: Public read access
   - `categories`: Public read access

### Stripe Setup

1. **Create Stripe Account**
   - Sign up at [Stripe](https://stripe.com)
   - Get your API keys from the dashboard

2. **Configure Webhooks**
   - Add webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Subscribe to events: `checkout.session.completed`, `payment_intent.succeeded`

3. **Create Products and Prices**
   - Create gift hamper products in Stripe
   - Get the Price IDs for each product
   - Update your Appwrite products with `stripePriceId`

## Usage Guide

### For Customers

1. **Sign Up**
   - Visit `/auth/sign-up`
   - Enter email, password, and name
   - Verify email address
   - Sign in to account

2. **Manage Account**
   - View orders and order history
   - Add/edit delivery addresses
   - Update profile information
   - Change password

3. **Purchase Gift Hampers**
   - Browse products marked as gift hampers
   - Click "Buy Now" button
   - Complete checkout via Stripe
   - Receive order confirmation

### For Administrators

1. **User Management**
   - Access `/admin/users` (admin role required)
   - View all users and their roles
   - Update user roles as needed

2. **Order Management**
   - View all orders in Appwrite console
   - Update order status
   - Process refunds via Stripe

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Sign in user
- `POST /api/auth/forgot` - Send password reset email
- `POST /api/auth/reset` - Reset password

### Account Management
- `GET /api/account` - Get user profile summary
- `PATCH /api/account/profile` - Update user profile
- `POST /api/addresses` - Create new address
- `PATCH /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Checkout
- `POST /api/checkout/hamper` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Security Features

### Authentication Security
- **Password Hashing**: Handled by Appwrite (Argon2)
- **Session Management**: Secure HTTP-only cookies
- **CSRF Protection**: Implemented on all forms
- **Rate Limiting**: Prevents brute force attacks

### Data Protection
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Appwrite handles query sanitization
- **XSS Protection**: React's built-in protection + CSP headers
- **GDPR Compliance**: Account deletion and data export

### Payment Security
- **PCI Compliance**: Stripe handles card data
- **Webhook Verification**: Signature verification for webhooks
- **Idempotency**: Prevents duplicate payments
- **Price Validation**: Server-side price verification

## Copywriting Style Guide

All user-facing text follows the Ukrainian-in-UK ESL style:

### Voice Characteristics
- **Warm and friendly** tone
- **Slightly imperfect** but natural English
- **Simple words** and short sentences
- **Honest and authentic** messaging

### Examples
- ✅ "Thank you so much. Your hamper is on the way, like warm hug from kitchen."
- ✅ "Please check your email to verify. Small step, but important."
- ✅ "Use long password, not easy guess."

### Avoid
- ❌ Overly polished "AI" tone
- ❌ Marketing buzzwords
- ❌ Complex sentences
- ❌ Perfect grammar (keep it human)

## Testing

### Manual Testing
Use the `QA_CHECKLIST.md` for comprehensive manual testing before release.

### Key Test Scenarios
1. **New User Flow**: Sign up → Verify → Sign in → Purchase
2. **Returning User**: Sign in → View orders → Update profile
3. **Payment Flow**: Add to cart → Checkout → Payment → Confirmation
4. **Error Handling**: Invalid inputs, network failures, payment failures

### Performance Testing
- **Core Web Vitals**: LCP < 2s, CLS < 0.1, INP < 200ms
- **Bundle Size**: < 170KB gzipped initial load
- **Database Queries**: Optimized with proper indexing

## Deployment

### Vercel Deployment
1. **Environment Variables**: Add all required env vars to Vercel
2. **Domain Configuration**: Update Appwrite and Stripe webhook URLs
3. **Build Settings**: Ensure Node.js 18+ is selected

### Post-Deployment
1. **Test Authentication**: Verify sign up/in works
2. **Test Payments**: Use Stripe test mode
3. **Monitor Logs**: Check for any errors
4. **Update Webhooks**: Switch to live Stripe keys when ready

## Maintenance

### Regular Tasks
- **Monitor Error Rates**: Check Vercel logs weekly
- **Update Dependencies**: Keep packages current
- **Review Orders**: Monitor payment success rates
- **User Feedback**: Address any issues quickly

### Security Updates
- **Appwrite Updates**: Keep Appwrite SDK updated
- **Stripe Updates**: Monitor for API changes
- **Dependency Updates**: Regular security patches

## Support & Troubleshooting

### Common Issues
1. **Authentication Not Working**: Check Appwrite configuration
2. **Payments Failing**: Verify Stripe webhook setup
3. **Orders Not Creating**: Check database permissions
4. **Emails Not Sending**: Verify email service configuration

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and checking browser console and server logs.

### Contact
For technical support or questions about this implementation, please refer to the project documentation or contact the development team.

## Future Enhancements

### Planned Features
- **Admin Dashboard**: Web-based order management
- **Email Notifications**: Order status updates
- **Inventory Management**: Stock tracking
- **Shipping Integration**: Carrier API integration
- **Customer Reviews**: Product review system
- **Loyalty Program**: Points and rewards system

### Scalability Considerations
- **Database Optimization**: Implement caching layer
- **CDN Integration**: Optimize image delivery
- **Microservices**: Split into smaller services as needed
- **Analytics**: Enhanced tracking and reporting

---

**Implementation Date**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅

