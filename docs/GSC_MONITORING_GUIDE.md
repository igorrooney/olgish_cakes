# Google Search Console Monitoring Guide

**Date:** October 23, 2025  
**Status:** GSC Issues Fixed - Monitoring Phase

---

## 🎯 Overview

This guide documents the monitoring process for tracking GSC issue resolution and indexing progress after implementing fixes for:

1. ✅ **Product schema errors** - Fixed homepage product schema
2. ✅ **Event schema warnings** - Added missing performer, eventStatus, price fields  
3. ✅ **Breadcrumb "Unnamed item"** - Fixed breadcrumb validation
4. 🔄 **Zero indexing issue** - URLs submitted for re-indexing

---

## 📊 Success Criteria

### Immediate (Day 1-3)
- [ ] All structured data validates in Rich Results Test
- [ ] No new errors in GSC Rich Results report
- [ ] Top 20 URLs submitted for indexing

### Short Term (Day 3-7)
- [ ] Indexed pages increase from 0 to 20+
- [ ] Homepage position improves from 25.6 to <20
- [ ] Click-through rates start improving

### Medium Term (Week 2-4)
- [ ] 50+ pages indexed
- [ ] Rich snippets appear in search results
- [ ] CTR improves by 50-100%
- [ ] Multiple #1 rankings for target keywords

---

## 🔍 Daily Monitoring Checklist

### 1. GSC Coverage Report
**Location:** GSC → Coverage → Pages

**What to Check:**
- Total indexed pages count
- "Valid" pages increasing
- "Error" pages decreasing
- New pages appearing in "Valid" section

**Target:** 0 → 20+ indexed pages within 7 days

### 2. Rich Results Report
**Location:** GSC → Enhancements

**What to Check:**
- **Product snippets:** Errors = 0, Warnings = 0
- **Breadcrumbs:** No "Unnamed item" errors
- **Events:** All events showing as valid

**Target:** All enhancement types showing 0 errors

### 3. Performance Report
**Location:** GSC → Performance

**What to Check:**
- Total clicks increasing
- Average position improving
- CTR (click-through rate) improving
- Top performing pages

**Target:** CTR improvement of 50-100% within 2 weeks

---

## 🛠️ Manual Validation Tools

### 1. Google Rich Results Test
**URL:** https://search.google.com/test/rich-results

**Test These URLs:**
- `https://olgishcakes.co.uk/` (Product schema)
- `https://olgishcakes.co.uk/market-schedule` (Event schema)
- `https://olgishcakes.co.uk/cakes/honey-cake-medovik` (Product + Breadcrumbs)
- `https://olgishcakes.co.uk/birthday-cakes` (Breadcrumbs)

**Expected Results:**
- ✅ "Page is eligible for rich results"
- ✅ All structured data types detected
- ✅ No errors or warnings

### 2. Schema.org Validator
**URL:** https://validator.schema.org/

**Purpose:** Validate structured data syntax
**Expected:** All schemas pass validation

### 3. GSC URL Inspection Tool
**Location:** GSC → URL Inspection

**Test Priority URLs:**
1. Homepage
2. /cakes
3. /order
4. /market-schedule
5. /cakes/honey-cake-medovik

**Expected Results:**
- ✅ "URL is on Google"
- ✅ "Indexed" status
- ✅ Rich results detected

---

## 📈 Key Metrics to Track

### Indexing Metrics
| Metric | Current | Target (7 days) | Target (30 days) |
|--------|---------|------------------|------------------|
| Indexed Pages | 0 | 20+ | 50+ |
| Valid Pages | 0 | 20+ | 50+ |
| Error Pages | 0 | 0 | 0 |

### Performance Metrics
| Metric | Current | Target (7 days) | Target (30 days) |
|--------|---------|------------------|------------------|
| Total Clicks | 32/week | 50+/week | 100+/week |
| Average Position | 25.6 | <20 | <15 |
| CTR | 10.9% | 15%+ | 20%+ |

### Rich Results Metrics
| Schema Type | Current Status | Target |
|-------------|----------------|--------|
| Product Snippets | 3 errors | 0 errors |
| Breadcrumbs | 11 "Unnamed" | 0 errors |
| Events | 3 warnings | 0 warnings |

---

## 🚨 Alert Conditions

### Critical Issues (Fix Immediately)
- [ ] Indexed pages decrease
- [ ] New errors appear in Rich Results
- [ ] Homepage drops out of top 50 positions
- [ ] CTR drops below 5%

### Warning Signs (Monitor Closely)
- [ ] No new pages indexed after 3 days
- [ ] Position improvements stall
- [ ] Rich snippets not appearing
- [ ] Click volume not increasing

---

## 📅 Weekly Review Schedule

### Week 1 (Days 1-7)
**Focus:** Indexing Progress
- [ ] Daily: Check Coverage report
- [ ] Daily: Validate top 5 URLs with Rich Results Test
- [ ] Day 3: Submit additional URLs if needed
- [ ] Day 7: Full GSC audit

### Week 2 (Days 8-14)
**Focus:** Performance Improvement
- [ ] Every 2 days: Check Performance metrics
- [ ] Day 10: Validate all fixed schemas
- [ ] Day 14: Compare to baseline metrics

### Week 3-4 (Days 15-30)
**Focus:** Optimization
- [ ] Weekly: Full GSC review
- [ ] Weekly: Keyword ranking analysis
- [ ] Weekly: Competitor comparison

---

## 🔧 Troubleshooting Guide

### If Pages Still Not Indexed After 7 Days

**Check:**
1. **Robots.txt:** Ensure not blocking Googlebot
2. **Sitemap:** Verify sitemap.xml is accessible
3. **Manual Submission:** Use GSC URL Inspection tool
4. **Content Quality:** Ensure pages have unique, valuable content

**Actions:**
- Submit sitemap refresh in GSC
- Request indexing for top 10 URLs manually
- Check for technical SEO issues

### If Rich Results Still Show Errors

**Check:**
1. **Schema Syntax:** Validate with schema.org validator
2. **Required Fields:** Ensure all required fields present
3. **Data Quality:** Check for missing or invalid data

**Actions:**
- Fix any remaining schema errors
- Re-test with Rich Results Test
- Wait 24-48 hours for GSC to re-crawl

### If Performance Not Improving

**Check:**
1. **Content Relevance:** Ensure pages match search intent
2. **Technical SEO:** Page speed, mobile-friendliness
3. **User Experience:** Bounce rate, time on page

**Actions:**
- Optimize page content for target keywords
- Improve page loading speed
- Enhance user experience

---

## 📊 Reporting Template

### Weekly GSC Status Report

**Week of:** [Date]

**Indexing Status:**
- Total Indexed: [Number] (Change: +/-[Number])
- Valid Pages: [Number]
- Error Pages: [Number]

**Rich Results Status:**
- Product Snippets: [Errors/Warnings]
- Breadcrumbs: [Errors/Warnings]  
- Events: [Errors/Warnings]

**Performance Metrics:**
- Total Clicks: [Number] (Change: +/-[Number])
- Average Position: [Number] (Change: +/-[Number])
- CTR: [Percentage] (Change: +/-[Percentage])

**Key Achievements:**
- [List major improvements]

**Issues/Concerns:**
- [List any problems]

**Next Week Focus:**
- [List priorities]

---

## 🎯 Success Indicators

### Green Flags (Everything Working)
- ✅ Indexed pages increasing daily
- ✅ Rich Results showing 0 errors
- ✅ CTR improving week over week
- ✅ Multiple pages ranking in top 10
- ✅ Rich snippets appearing in search results

### Red Flags (Action Required)
- ❌ No indexing progress after 3 days
- ❌ New errors appearing in Rich Results
- ❌ Performance metrics declining
- ❌ Pages dropping out of top 50

---

## 📞 Support Resources

**GSC Help:**
- Google Search Console Help: https://support.google.com/webmasters
- Rich Results Test: https://search.google.com/test/rich-results
- URL Inspection Tool: Available in GSC

**Technical Resources:**
- Schema.org Documentation: https://schema.org/
- Google Search Central: https://developers.google.com/search
- GSC API Documentation: https://developers.google.com/webmaster-tools

---

*Last Updated: October 23, 2025*  
*Next Review: October 30, 2025*
