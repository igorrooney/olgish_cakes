# Schema Validation Guide

## Overview
This guide explains how to validate structured data schemas in the OlgishCakes project.

## Automated Validation

### Running the Validator

**Quick validation with mock data (recommended for CI/CD):**
```bash
pnpm run validate:schemas
```

**Full validation with real Sanity data:**
```bash
pnpm run validate:schemas:real
```

This script will:
1. Generate product schemas (from mock or real Sanity data)
2. Validate each schema for compliance
3. Check MPN uniqueness
4. Report any errors or warnings

**Note:** The `--real` flag requires Sanity environment variables to be set.

### Expected Output
```
🔍 Starting schema validation...

📊 Fetching up to 30 cakes from Sanity...
✅ Fetched 28 cakes in 42.15ms

🏗️  Generating product schemas...
✅ Generated 28 schemas in 11.23ms

✔️  Validating schemas...
[Schema Validation] 28/28 schemas are valid

⏱️  Validation completed in 6.45ms

🔑 Checking MPN uniqueness...
✅ All MPNs are unique

============================================================
📋 VALIDATION SUMMARY
============================================================
Total cakes fetched:     28
Schemas generated:       28
Valid schemas:           28
Invalid schemas:         0
MPN uniqueness:          ✅ Pass
Total time:              59.83ms
============================================================

✅ All schemas are valid and ready for production!
```

---

## Manual Validation

### Google Rich Results Test
1. Build your site locally or deploy to staging
2. Visit: https://search.google.com/test/rich-results
3. Enter a product page URL (e.g., `https://olgishcakes.co.uk/order`)
4. Verify all product schemas are detected
5. Check for warnings or errors

### Google Search Console
1. Log in to Google Search Console
2. Go to "Enhancements" → "Products"
3. Monitor for errors or warnings
4. Fix any issues flagged by Google

### Schema.org Validator
1. Visit: https://validator.schema.org/
2. Paste your page URL or JSON-LD markup
3. Verify no errors are shown

---

## Common Validation Errors

### Error: "Missing or invalid SKU"
**Cause:** SKU doesn't follow the `OC-PRODUCT-NAME-001` format

**Fix:** Ensure `generateSKU()` is used for all products:
```typescript
sku: generateSKU(productName, index)
```

---

### Error: "Duplicate MPNs found"
**Cause:** Multiple products have the same MPN

**Fix:** Ensure MPN includes unique identifiers:
```typescript
const mpn = `${slug.toUpperCase()}-${price}-${sku.split('-').pop()}`;
```

---

### Error: "Missing priceValidUntil date"
**Cause:** Offer is missing price validity date

**Fix:** Use the helper function:
```typescript
priceValidUntil: getPriceValidUntil(30)
```

---

### Error: "Missing reviewCount in aggregateRating"
**Cause:** Aggregate rating object incomplete

**Fix:** Always include all required fields:
```typescript
aggregateRating: {
  "@type": "AggregateRating",
  ratingValue: "4.8",
  reviewCount: "16",
  bestRating: "5",
  worstRating: "1"
}
```

---

## Validation Checklist

### Product Schema Requirements
- [ ] `name` (string, required)
- [ ] `description` (string, required)
- [ ] `image` (array with at least 1 URL, required)
- [ ] `sku` (string, must start with "OC-", required)
- [ ] `mpn` (string, must be unique, required)
- [ ] `brand` (object with name, required)
- [ ] `offers` (object, required)
  - [ ] `price` (string, required)
  - [ ] `priceCurrency` (must be "GBP", required)
  - [ ] `availability` (schema.org URL, required)
  - [ ] `priceValidUntil` (YYYY-MM-DD format, required)
- [ ] `aggregateRating` (recommended)
  - [ ] `ratingValue` (string, 1-5)
  - [ ] `reviewCount` (string)
  - [ ] `bestRating` ("5")
  - [ ] `worstRating` ("1")

### Review Schema Requirements
- [ ] `author` (Person object with name, required)
- [ ] `reviewRating` (Rating object, required)
  - [ ] `ratingValue` (string, 1-5)
  - [ ] `bestRating` ("5")
  - [ ] `worstRating` ("1")
- [ ] `reviewBody` (string, required)
- [ ] `datePublished` (YYYY-MM-DD format, required)
- [ ] `itemReviewed` (Product object, required)

---

## CI/CD Integration

### Pre-commit Hook (Recommended)
Add to `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run schema validation before commit
pnpm run validate:schemas || exit 1
```

### GitHub Actions (Future Enhancement)
```yaml
name: Validate Schemas

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run validate:schemas
```

---

## Monitoring & Alerts

### Performance Thresholds
- **Query Time:** < 100ms (warn if exceeded)
- **Schema Generation:** < 50ms (warn if exceeded)
- **Total Time:** < 150ms (warn if exceeded)

### Log Monitoring
In development mode, watch for:
- `[Product Schemas]` - Schema generation logs
- `[Schema Validation]` - Validation results
- `[Testimonials]` - Cache hit/miss info
- `[OrderPage]` - Performance metrics

---

## Troubleshooting

### Validation Script Fails
1. Check Sanity connection: `NEXT_PUBLIC_SANITY_PROJECT_ID` is set
2. Verify dataset: `NEXT_PUBLIC_SANITY_DATASET` is correct
3. Check for malformed data in Sanity CMS
4. Review error messages in console output

### Schemas Not Appearing in Google
1. Verify deployment includes structured data
2. Check page source for `<script type="application/ld+json">`
3. Use "View Page Source" in browser (not Inspect Element)
4. Allow 1-2 weeks for Google to reindex

### Performance Degradation
1. Reduce `MAX_PRODUCTS_FOR_SCHEMA` in `lib/schema-constants.ts`
2. Check Sanity query performance
3. Review cache hit rate in logs
4. Consider implementing Redis cache for production

---

## Best Practices

1. **Always validate before deployment:** Run `pnpm run validate:schemas`
2. **Monitor performance:** Check logs for timing information
3. **Keep constants updated:** Review `lib/schema-constants.ts` quarterly
4. **Update review dates:** Refresh `REVIEW_DATES` every 3 months
5. **Test with Google:** Use Rich Results Test after major changes

---

## Resources

- [Schema.org Product Specification](https://schema.org/Product)
- [Google Merchant Center Requirements](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

---

**Last Updated:** October 15, 2025

