# Google Search Console - Remaining Issues
**Date:** October 30, 2025  
**Status:** ⚠️ Issues Found - Need Fixing

---

## 🔴 CRITICAL ISSUES (Must Fix)

### 1. Gift Hampers Page - Products Missing Required Fields

**URL:** `https://olgishcakes.co.uk/gift-hampers`

**Critical Errors (6 products):**
- ❌ **Branded Gift Box – Personalised Logo Cake** - Missing `offers`, `review`, or `aggregateRating`
- ❌ **Birthday Gift by Post – A Slice of Personalised Honey Cake** - Missing `offers`, `review`, or `aggregateRating`
- ❌ **Honey Cake by post** - Missing `offers`, `review`, or `aggregateRating`
- ❌ **Mini Christmas Gift Box with Caramel Biscuits** - Missing `offers`, `review`, or `aggregateRating`
- ❌ **Christmas Caramel Treats** - Missing `offers`, `review`, or `aggregateRating`
- ❌ **Cake by post** - Missing `offers`, `review`, or `aggregateRating`

**Warnings (All 6 products also missing):**
- ⚠️ Missing `shippingDetails`
- ⚠️ Missing `hasMerchantReturnPolicy`

**Impact:** These products won't appear in Google Shopping and rich results will fail.

**Priority:** 🔴 **CRITICAL** - Fix immediately

---

### 2. Homepage - Still Showing Old Errors

**URL:** `https://olgishcakes.co.uk/`

**Errors (3 instances):**
- ❌ "Ukrainian Honey Cake" - Missing `offers`, `review`, or `aggregateRating` (3 instances)

**Note:** This should be fixed in code, but Google hasn't re-crawled yet (last crawled: Oct 30, 2025). After re-indexing, this should resolve.

---

## 🟡 WARNINGS (Medium Priority)

### 3. CakeCard Products Missing Fields

**Affected Pages:**
- `/birthday-cakes` - Products from CakeCard showing warnings
- `/cakes` - Products from CakeCard showing warnings

**Missing Fields:**
- ⚠️ `shippingDetails`
- ⚠️ `hasMerchantReturnPolicy`
- ⚠️ `description` (some products)

**Affected Products:**
- Kyiv Cake – Premium Handmade Ukrainian Cake
- Chocolate Delicia Sponge Cake for Parties
- Sacher Torte
- Vanilla Delicia Birthday Cake
- Napoleon Cake
- Honey Cake (Medovik)
- Christmas Cake Design – Bespoke Cakes Made Just for You

**Note:** CakeCard component should already have these fields. This might be a cached version issue, or products need to be checked individually.

---

### 4. Breadcrumbs Showing "Unnamed item"

**Affected Pages:** All pages

**Issue:** Breadcrumb schema showing items as "Unnamed item"

**Note:** We fixed this in code, but Google hasn't re-crawled yet. This will resolve after re-indexing.

---

### 5. FAQ Showing "Unnamed item"

**Affected Pages:**
- `/birthday-cakes`
- `/gift-hampers`

**Issue:** FAQ schema showing questions/answers as "Unnamed item"

**Note:** Need to check FAQ schema generation to ensure proper names are set.

---

## ✅ WHAT'S WORKING

- ✅ All pages are **indexed**
- ✅ No critical errors on individual cake pages (`/cakes/[slug]`)
- ✅ Sitemap is valid (101 URLs, 0 errors)
- ✅ Mobile-friendly
- ✅ No robots.txt blocking

---

## 🎯 ACTION PLAN

### Immediate (Today)

1. **🔴 Fix Gift Hampers Page** - Add required fields to all product schemas:
   - Add `offers` with complete offer details
   - Add `aggregateRating` or `review`
   - Add `shippingDetails`
   - Add `hasMerchantReturnPolicy`

2. **🟡 Verify CakeCard** - Double-check that CakeCard component has all required fields and that they're being rendered correctly

### This Week

3. **Request Re-Indexing** for:
   - Homepage (should resolve after re-crawl)
   - Gift Hampers page (after fixes)
   - Birthday Cakes page
   - Cakes page

4. **Check FAQ Schema** - Ensure FAQ questions/answers have proper names

---

## 📊 Summary

| Issue | Severity | Status | Action |
|-------|----------|--------|--------|
| Gift Hampers products | 🔴 Critical | Needs Fix | Add offers/review/aggregateRating |
| Homepage products | 🔴 Critical | Fixed in code | Wait for re-crawl |
| CakeCard warnings | 🟡 Warning | Needs Check | Verify component |
| Breadcrumbs | 🟡 Warning | Fixed in code | Wait for re-crawl |
| FAQ names | 🟡 Warning | Needs Check | Verify schema |

---

**Next Steps:** Fix gift hampers page first (critical), then verify CakeCard component.

