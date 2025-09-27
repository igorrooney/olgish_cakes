# QA Checklist for OlgishCakes E-commerce System

## Pre-Release Checklist

### Authentication & User Management
- [ ] **Sign Up Flow**
  - [ ] User can create account with email/password
  - [ ] Email verification is sent and works
  - [ ] Password strength validation works (min 10 chars)
  - [ ] User receives confirmation message after signup
  - [ ] Invalid email formats are rejected
  - [ ] Duplicate email addresses are handled properly

- [ ] **Sign In Flow**
  - [ ] User can sign in with email/password
  - [ ] Google OAuth sign-in works
  - [ ] Invalid credentials show appropriate error
  - [ ] User is redirected to intended page after login
  - [ ] Remember me functionality works (if implemented)

- [ ] **Password Reset**
  - [ ] Forgot password sends email
  - [ ] Reset link works and allows new password
  - [ ] Invalid/expired reset links are handled
  - [ ] User can update password from profile

- [ ] **Account Management**
  - [ ] User can view account overview
  - [ ] Profile information can be updated
  - [ ] Password can be changed
  - [ ] Account can be deleted (GDPR compliance)
  - [ ] User is signed out after account deletion

### Address Management
- [ ] **Address CRUD**
  - [ ] User can add new address
  - [ ] User can edit existing address
  - [ ] User can delete address
  - [ ] User can set default address
  - [ ] UK postcode validation works
  - [ ] Required fields are validated

### Product & Checkout
- [ ] **Gift Hamper Products**
  - [ ] Product pages load correctly
  - [ ] Buy Now button appears for gift hampers
  - [ ] Product information displays properly
  - [ ] Images load and display correctly
  - [ ] Price formatting is correct (£)

- [ ] **Stripe Checkout**
  - [ ] Checkout session is created successfully
  - [ ] User is redirected to Stripe checkout
  - [ ] Payment processing works (test mode)
  - [ ] Success page displays order details
  - [ ] Cancel page works and redirects properly
  - [ ] Webhook processes payments correctly
  - [ ] Orders are created in database after payment

### Order Management
- [ ] **Order Display**
  - [ ] Orders list shows in account area
  - [ ] Order details page works
  - [ ] Order status is displayed correctly
  - [ ] Order items and pricing are correct
  - [ ] Delivery address is shown correctly

### Security & Compliance
- [ ] **Authentication Security**
  - [ ] Unauthenticated users cannot access account pages
  - [ ] Session management works correctly
  - [ ] CSRF protection is in place
  - [ ] Rate limiting works (if implemented)

- [ ] **Data Protection**
  - [ ] User data is handled securely
  - [ ] GDPR compliance measures are in place
  - [ ] Account deletion removes personal data
  - [ ] Privacy policy is accessible

### UI/UX & Accessibility
- [ ] **Responsive Design**
  - [ ] Mobile layout works on iPhone 13/SE
  - [ ] Tablet layout works on iPad
  - [ ] Desktop layout works on 1920x1080
  - [ ] Touch targets are appropriate size

- [ ] **Accessibility**
  - [ ] Keyboard navigation works
  - [ ] Focus states are visible
  - [ ] Alt text is provided for images
  - [ ] Color contrast meets WCAG AA
  - [ ] Screen reader compatibility

- [ ] **Content & Copy**
  - [ ] Ukrainian-in-UK ESL tone is maintained
  - [ ] British spelling is used
  - [ ] Currency is formatted as £
  - [ ] Error messages are helpful and friendly
  - [ ] Loading states are clear

### Performance
- [ ] **Page Load Times**
  - [ ] Account pages load within 2 seconds
  - [ ] Product pages load within 2 seconds
  - [ ] Images are optimized and lazy-loaded
  - [ ] No render-blocking resources

- [ ] **Database Performance**
  - [ ] Queries are optimized
  - [ ] No N+1 query problems
  - [ ] Pagination works correctly

### Error Handling
- [ ] **Network Errors**
  - [ ] Offline scenarios are handled
  - [ ] Network timeouts show appropriate messages
  - [ ] Retry mechanisms work

- [ ] **Validation Errors**
  - [ ] Form validation works correctly
  - [ ] Error messages are user-friendly
  - [ ] Required fields are clearly marked

### Browser Compatibility
- [ ] **Desktop Browsers**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)

- [ ] **Mobile Browsers**
  - [ ] Safari iOS
  - [ ] Chrome Android
  - [ ] Samsung Internet

## Testing Scenarios

### Happy Path Testing
1. **New User Journey**
   - Sign up → Verify email → Sign in → View account → Add address → Browse products → Purchase hamper → View order

2. **Returning User Journey**
   - Sign in → View orders → Update profile → Purchase another hamper

### Edge Cases
1. **Payment Failures**
   - Declined card → User sees appropriate message
   - Network failure during payment → Order status is handled correctly

2. **Data Edge Cases**
   - Very long names/addresses
   - Special characters in inputs
   - Empty form submissions

## Performance Benchmarks
- [ ] **Core Web Vitals**
  - [ ] LCP < 2.0s
  - [ ] CLS < 0.1
  - [ ] INP < 200ms

- [ ] **Bundle Size**
  - [ ] Initial JS bundle < 170KB gzipped
  - [ ] Total fonts < 100KB

## Release Sign-off
- [ ] All critical bugs fixed
- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Accessibility audit passed
- [ ] Content review completed

**Release Date:** ___________
**QA Tester:** ___________
**Developer:** ___________
**Product Owner:** ___________

## Post-Release Monitoring
- [ ] Monitor error rates for 24 hours
- [ ] Check payment processing success rates
- [ ] Monitor page load times
- [ ] Check user feedback and support tickets


