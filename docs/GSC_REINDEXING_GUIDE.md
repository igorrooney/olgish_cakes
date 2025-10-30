# Google Search Console Re-Indexing Guide
**Date:** October 30, 2025  
**Purpose:** Re-index updated pages after SEO improvements

---

## ✅ Pages That Need Re-Indexing

Based on the recent changes we made, these pages should be re-indexed in Google Search Console:

### **High Priority (Metadata & Pricing Changes)**

1. **`https://olgishcakes.co.uk/birthday-cakes`**
   - **Changes:** Updated pricing from £35 to £25 in title, description, and FAQ schema
   - **Impact:** Will show correct pricing in search results
   - **Priority:** 🔴 HIGH

2. **`https://olgishcakes.co.uk/cakes-wakefield`**
   - **Changes:** Fixed pricing inconsistency (£35 → £25), updated metadata and FAQ schema
   - **Impact:** Correct pricing in search snippets
   - **Priority:** 🔴 HIGH

3. **`https://olgishcakes.co.uk/cakes-bradford`**
   - **Status:** Already correctly using £25
   - **Priority:** 🟡 MEDIUM (if metadata was updated)

4. **`https://olgishcakes.co.uk/cakes-huddersfield`**
   - **Status:** Already correctly using £25
   - **Priority:** 🟡 MEDIUM (if metadata was updated)

5. **`https://olgishcakes.co.uk/cake-delivery-leeds`**
   - **Changes:** Fixed button text contrast (yellow background)
   - **Impact:** Minor - visual only, no SEO impact
   - **Priority:** 🟢 LOW

6. **`https://olgishcakes.co.uk/` (Homepage)**
   - **Changes:** Added "Areas We Serve" section with internal links
   - **Impact:** Improved internal linking structure
   - **Priority:** 🟡 MEDIUM

---

## 📋 How to Re-Index in Google Search Console

### Step-by-Step Instructions:

1. **Go to Google Search Console**
   - Visit: https://search.google.com/search-console
   - Select your property: `olgishcakes.co.uk`

2. **Use URL Inspection Tool**
   - Click on "URL Inspection" in the left sidebar
   - Or use the search bar at the top

3. **Submit Each URL**
   - Paste the full URL (e.g., `https://olgishcakes.co.uk/birthday-cakes`)
   - Press Enter
   - Wait for Google to analyze the page

4. **Request Indexing**
   - Click the "Request Indexing" button
   - Wait for confirmation: "Indexing requested"
   - **Important:** Wait 5-10 minutes between requests to avoid rate limiting

5. **Repeat for All Priority Pages**
   - Process URLs one at a time
   - Focus on HIGH priority pages first

---

## ⏱️ Timeline Expectations

### **Automatic Re-Crawling (Without Requesting)**
- **Timeline:** 1-2 weeks
- **When:** Google crawls your site automatically
- **Best for:** Non-critical updates

### **Manual Re-Indexing (With Request)**
- **Timeline:** 24-72 hours
- **When:** You request indexing via GSC
- **Best for:** Critical updates (like pricing changes)

### **What to Expect:**
- **Day 1:** URLs submitted for indexing
- **Day 2-3:** Google crawls and processes pages
- **Day 3-7:** Updated content appears in search results
- **Week 2:** Full indexing complete, new metadata visible

---

## 🎯 Priority Order

### **Do Today (Critical):**
1. `/birthday-cakes` - Pricing change critical for SEO
2. `/cakes-wakefield` - Pricing consistency fix

### **Do This Week:**
3. `/cakes-bradford` - Verify consistency
4. `/cakes-huddersfield` - Verify consistency
5. `/` (Homepage) - Internal linking improvements

### **Optional:**
6. `/cake-delivery-leeds` - Visual changes only

---

## 📊 Monitoring After Re-Indexing

### **Check in GSC After 3-7 Days:**

1. **Coverage Report**
   - Go to: Coverage → Valid
   - Verify pages show as "Indexed"

2. **Performance Report**
   - Go to: Performance → Pages
   - Check if updated titles/descriptions appear
   - Monitor CTR changes

3. **URL Inspection**
   - Re-check each URL
   - Verify Google sees updated content
   - Check "Last crawl" date

---

## 🔍 What Changed That Needs Re-Indexing

### **Metadata Changes (Visible in Search Results):**
- ✅ Title tags updated with £25 pricing
- ✅ Meta descriptions updated with correct pricing
- ✅ OpenGraph titles/descriptions updated
- ✅ FAQ schema updated with £25 pricing

### **Content Changes (Google Needs to Re-Crawl):**
- ✅ Homepage "Areas We Serve" section added
- ✅ Internal linking structure improved

### **Visual Changes (No Re-Indexing Needed):**
- ⚠️ Button text contrast fixes (CSS only)
- ⚠️ Subtitle centering (CSS only)

---

## 💡 Pro Tips

1. **Don't Over-Submit**
   - Only submit URLs that actually changed
   - Wait 5-10 minutes between requests
   - Don't submit more than 10 URLs per day

2. **Check Sitemap**
   - Verify your sitemap is up to date
   - Submit sitemap in GSC if not already done
   - Location: Sitemaps → Submit sitemap URL

3. **Monitor Results**
   - Check GSC Performance report weekly
   - Look for CTR improvements
   - Verify correct pricing appears in snippets

4. **Use Batch Requests (If Available)**
   - Some GSC interfaces allow bulk URL submission
   - Check if available in your GSC account

---

## ✅ Checklist

- [ ] Submit `/birthday-cakes` for indexing
- [ ] Submit `/cakes-wakefield` for indexing
- [ ] Submit `/cakes-bradford` for indexing (verify)
- [ ] Submit `/cakes-huddersfield` for indexing (verify)
- [ ] Submit homepage `/` for indexing
- [ ] Wait 3-7 days
- [ ] Verify pages are indexed in Coverage report
- [ ] Check Performance report for updated snippets
- [ ] Monitor CTR improvements

---

## 🚨 Important Notes

- **Re-indexing is NOT required** - Google will eventually re-crawl
- **BUT:** Manual re-indexing speeds up the process significantly
- **Critical for:** Pricing changes (users see wrong prices in search results)
- **Less critical for:** Visual/CSS changes (no SEO impact)

---

## 📞 Need Help?

If you encounter issues:
1. Check GSC Help Center: https://support.google.com/webmasters
2. Verify URLs are accessible (not blocked by robots.txt)
3. Check if pages return 200 status codes
4. Ensure sitemap is submitted and valid

---

**Last Updated:** October 30, 2025  
**Status:** Ready for manual re-indexing

