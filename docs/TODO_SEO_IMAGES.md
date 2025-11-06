# TODO: SEO-Optimized Images for New Pages

## Overview
Three new SEO pages are currently using the generic `placeholder-cake.jpg` image. For optimal SEO performance, these should be replaced with page-specific, keyword-optimized images.

## Action Items

### 1. Ukrainian Cake Page (`/ukrainian-cake`)
**Current:** `/images/placeholder-cake.jpg`  
**Recommended:** `/images/ukrainian-cakes-collection.jpg`

**Specs:**
- Dimensions: 1200x630px (Open Graph standard)
- Content: Assortment of traditional Ukrainian cakes (Medovik, Kyiv cake, Napoleon)
- Keywords in filename: ✅ ukrainian, cakes, collection
- Alt text: Already optimized ("Authentic Ukrainian Cakes - Traditional Medovik and Kyiv Cake")

### 2. Cake in Leeds Page (`/cake-in-leeds`)
**Current:** `/images/placeholder-cake.jpg`  
**Recommended:** `/images/cakes-leeds-delivery.jpg`

**Specs:**
- Dimensions: 1200x630px
- Content: Cakes with Leeds context (landmarks, local branding, or delivery presentation)
- Keywords in filename: ✅ cakes, leeds, delivery
- Alt text: Already optimized ("Cake in Leeds - Ukrainian Bakery Leeds Yorkshire")

### 3. Honey Cake Page (`/honey-cake`)
**Current:** `/images/placeholder-cake.jpg`  
**Recommended:** `/images/honey-cake-medovik.jpg`

**Specs:**
- Dimensions: 1200x630px
- Content: Close-up of honey cake (Medovik) showing layers and texture
- Keywords in filename: ✅ honey, cake, medovik
- Alt text: Already optimized ("Authentic Ukrainian Honey Cake (Medovik) - Traditional Recipe")

## Implementation Steps

1. **Create/source the images** (photographer or existing photos)
2. **Optimize images:**
   - Compress for web (target: <200KB each)
   - Ensure 1200x630px dimensions
   - Add to `/public/images/`
3. **Update page metadata:**
   - `app/ukrainian-cake/page.tsx` line 20, 34
   - `app/cake-in-leeds/page.tsx` line 20, 34
   - `app/honey-cake/page.tsx` line 20, 34
4. **Update tests** (already done - currently expect placeholder)
5. **Test:**
   - Verify images load correctly
   - Check Open Graph preview with [opengraph.xyz](https://www.opengraph.xyz)
   - Run full test suite

## SEO Impact

**Current state:** ❌ Generic placeholder image used for all pages
- Google Image Search won't index these properly
- Social media sharing shows non-descriptive image
- Missing keyword signals from image filenames

**After implementation:** ✅ SEO-optimized, page-specific images
- Better Google Image Search rankings
- Improved social media engagement (proper previews)
- Additional keyword signals from descriptive filenames
- Enhanced user trust (professional, specific imagery)

## Notes

- Tests have been updated to expect `placeholder-cake.jpg` to unblock PR #102
- When proper images are created, update the three page files and verify tests still pass
- This is a **cosmetic SEO improvement** - the pages function correctly with placeholder images
- Priority: Medium (improves SEO but doesn't block functionality)

---
*Created: 2025-11-06*  
*Related PR: #102*  
*Status: Future enhancement*

