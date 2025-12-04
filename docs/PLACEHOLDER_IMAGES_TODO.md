# Placeholder Images - Production Checklist

**Status**: 🔴 BLOCKER - Must be completed before production deployment

## Overview
The mobile homepage implementation currently uses placeholder images from various sources. All placeholders MUST be replaced with real product photography before going to production.

## Critical Path Items

### MobileHero Component
**File**: `app/components/mobile-homepage/MobileHero.tsx`

Replace the following placeholder images:
- [ ] Hero image 1: Currently using `https://images.unsplash.com/photo-1464349095431-e9a21285b5f3`
- [ ] Hero image 2: Currently using `https://images.unsplash.com/photo-1578985545062-69928b1d9587`
- [ ] Hero image 3: Currently using `https://images.unsplash.com/photo-1558636508-e0db3814bd1d`

**Recommended specs**:
- Format: WebP with JPG fallback
- Dimensions: 300x400px (mobile), 400x500px (tablet), 500x600px (desktop)
- Optimization: Use Next.js Image component with proper `sizes` attribute
- Alt text: Descriptive, SEO-friendly text for each image

### MobileBestsellers Component
**File**: `app/components/mobile-homepage/MobileBestsellers.tsx`

Replace the following placeholder images:
- [ ] Honey cake (Medovik): Currently using `https://images.unsplash.com/photo-1621303837174-89787a7d4729`
- [ ] Chocolate cake: Currently using `https://images.unsplash.com/photo-1578985545062-69928b1d9587`
- [ ] Cheesecake: Currently using `https://images.unsplash.com/photo-1533134486753-c833f0ed4866`

**Recommended specs**:
- Format: WebP with JPG fallback
- Dimensions: 350x350px (square, mobile), 400x400px (tablet), 500x500px (desktop)
- Optimization: Add `priority` for above-the-fold images
- Alt text: Product name + descriptive details (e.g., "Honey cake (Medovik) with layers of honey sponge and cream")

### MobileAbout Component
**File**: `app/components/mobile-homepage/MobileAbout.tsx`

Replace the following placeholder images:
- [ ] Background card image: Currently using `https://images.unsplash.com/photo-1464349095431-e9a21285b5f3`

**Recommended specs**:
- Format: WebP with JPG fallback
- Dimensions: Full width, 400px height (mobile), 600px (tablet)
- Optimization: Use `loading="lazy"` as it's below the fold
- Alt text: "Olgish Cakes bakery interior" or similar

### MobileOccasions Component
**File**: `app/components/mobile-homepage/MobileOccasions.tsx`

Replace the following placeholder images:
- [ ] Birthdays: Currently using `https://images.unsplash.com/photo-1558636508-e0db3814bd1d`
- [ ] Weddings: Currently using `https://images.unsplash.com/photo-1464349095431-e9a21285b5f3`
- [ ] Celebrations: Currently using `https://images.unsplash.com/photo-1578985545062-69928b1d9587`

**Recommended specs**:
- Format: WebP with JPG fallback
- Dimensions: 300x300px (square, mobile), 350x350px (tablet)
- Optimization: Use `loading="lazy"` as they're below the fold
- Alt text: Occasion-specific descriptions

## SEO Impact

### Critical SEO Requirements
- [ ] All alt text must be descriptive and include keywords (e.g., "Ukrainian honey cake Leeds", "custom birthday cake")
- [ ] Image filenames should be SEO-friendly (e.g., `ukrainian-honey-cake-medovik-leeds.webp`)
- [ ] Implement structured data for Product images in JSON-LD
- [ ] Ensure proper image dimensions are specified to avoid CLS (Cumulative Layout Shift)

### Performance Impact
Current placeholder images are optimized, but real images must maintain:
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] File sizes < 100KB per image (after optimization)

## Action Items

### Before Production
1. [ ] Commission professional product photography session
2. [ ] Process and optimize all images using:
   - [ ] WebP conversion with 85% quality
   - [ ] JPG fallbacks with 80% quality
   - [ ] Responsive image variants (mobile, tablet, desktop)
3. [ ] Upload images to `/public/images/products/` directory
4. [ ] Update all component image sources
5. [ ] Run Lighthouse audit to verify performance
6. [ ] Test on real devices to verify image quality

### Recommended Tooling
- **Image optimization**: `next/image` (already in use)
- **Bulk conversion**: `sharp` or `imagemagick`
- **Format**: WebP primary, JPG fallback
- **CDN**: Consider Vercel Image Optimization or Cloudinary

## Verification Checklist

Before marking this as complete:
- [ ] All placeholder URLs removed from codebase
- [ ] `grep -r "unsplash.com" app/` returns no results
- [ ] `grep -r "picsum.photos" app/` returns no results
- [ ] All images have descriptive alt text
- [ ] All images have proper dimensions specified
- [ ] Lighthouse Performance score > 90
- [ ] Core Web Vitals pass on mobile and desktop

## Tracking

**Created**: December 3, 2024  
**Target completion**: Before PR #121 merge to production  
**Owner**: Design/Content team  
**Reviewer**: Technical lead

---

**Note**: This is a BLOCKER for production deployment. Do not merge PR #121 to production until all items are checked off.

