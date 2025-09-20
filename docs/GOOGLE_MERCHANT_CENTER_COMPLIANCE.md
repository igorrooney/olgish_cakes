# Google Merchant Center Compliance Guide

## Overview

This document outlines the fixes applied to resolve Google Search Console Merchant Listings issues related to missing `hasMerchantReturnPolicy` fields in product structured data.

## Issue Summary

Google Search Console reported the following error:
- **Issue**: Missing field 'hasMerchantReturnPolicy' (in 'offers')
- **Affected URLs**: 
  - `https://olgishcakes.co.uk/wedding-cakes`
  - `https://olgishcakes.co.uk/cakes-wakefield`
- **Affected Products**: 
  - "Vanilla Delicia Birthday Cake"
  - "Chocolate Delicia Sponge Cake for Parties"

## Root Cause

The issue was caused by missing `hasMerchantReturnPolicy` fields in structured data offers across multiple pages and components. Google Merchant Center requires this field for proper product listing validation.

## Fixes Applied

### 1. Updated Utility Functions

**File**: `app/utils/seo.ts`
- Enhanced `generateProductSchema()` to include `hasMerchantReturnPolicy`
- Enhanced `generateServiceSchema()` to include `hasMerchantReturnPolicy`
- Both functions now use `getMerchantReturnPolicy()` and `getOfferShippingDetails()`

### 2. Fixed Specific Files

**Files Updated**:
- `app/get-custom-quote/page.tsx` - Added return policy to all OfferCatalog items
- `app/cakes/[slug]/CakePageSEO.tsx` - Added return policy to service offers
- `app/cakes/[slug]/OrderModalStructuredData.tsx` - Added return policy to service offers

### 3. Created Utility Functions

**File**: `app/utils/merchantReturnPolicy.ts`
- `STANDARD_MERCHANT_RETURN_POLICY` - Standard return policy object
- `ensureMerchantReturnPolicy()` - Ensures offer has return policy
- `ensureAllOffersHaveReturnPolicy()` - Validates offer arrays
- `validateMerchantReturnPolicies()` - Comprehensive validation function

### 4. Created Validation Scripts

**Scripts Created**:
- `scripts/validate-structured-data.ts` - Validates all structured data files
- `scripts/google-search-console-fix.ts` - Generates compliance report
- `scripts/test-structured-data.ts` - Tests utility functions

## Return Policy Details

```json
{
  "@type": "MerchantReturnPolicy",
  "applicableCountry": "GB",
  "returnFees": "https://schema.org/FreeReturn",
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": 14,
  "returnMethod": "https://schema.org/ReturnByMail"
}
```

## Validation Results

✅ All product offers now include `hasMerchantReturnPolicy`
✅ All service offers now include `hasMerchantReturnPolicy`
✅ All OfferCatalog items now include `hasMerchantReturnPolicy`
✅ Consistent return policy across all structured data

## Next Steps

1. **Deploy Changes**: Deploy the updated code to production
2. **Wait for Re-crawl**: Allow 24-48 hours for Google to re-crawl affected pages
3. **Request Validation**: Use Google Search Console to request re-validation:
   - Navigate to Merchant listings > Missing field 'hasMerchantReturnPolicy'
   - Click "VALIDATE FIX" button
4. **Monitor Status**: Check validation status in Google Search Console

## Future Maintenance

### Adding New Products

When adding new products or services, ensure they include the return policy:

```typescript
import { getMerchantReturnPolicy } from '@/app/utils/seo';

const offer = {
  "@type": "Offer",
  // ... other offer properties
  hasMerchantReturnPolicy: getMerchantReturnPolicy(),
};
```

### Adding New Pages

For new pages with product offers, use the utility functions:

```typescript
import { generateProductSchema } from '@/app/utils/seo';

const structuredData = generateProductSchema({
  name: 'Product Name',
  description: 'Product description',
  // ... other properties
});
```

### Validation

Run the validation scripts before deployment:

```bash
# Test utility functions
npx tsx scripts/test-structured-data.ts

# Generate compliance report
npx tsx scripts/google-search-console-fix.ts
```

## Monitoring

- Regularly check Google Search Console for new Merchant Listings issues
- Monitor structured data validation tools
- Test new product pages before going live
- Use the validation scripts in CI/CD pipeline

## Related Files

- `app/utils/seo.ts` - Main SEO utility functions
- `app/utils/merchantReturnPolicy.ts` - Return policy utilities
- `app/components/CakeCard.tsx` - Product card with structured data
- `app/cakes/[slug]/page.tsx` - Individual cake pages
- `app/wedding-cakes/page.tsx` - Wedding cakes page
- `app/cakes-wakefield/page.tsx` - Wakefield cakes page

## Support

For questions or issues related to Google Merchant Center compliance:
1. Check Google Search Console for specific error messages
2. Use the validation scripts to identify issues
3. Refer to [Google's Merchant Return Policy documentation](https://developers.google.com/search/docs/appearance/structured-data/product#merchant-return-policy)
4. Test structured data using [Google's Rich Results Test](https://search.google.com/test/rich-results)
