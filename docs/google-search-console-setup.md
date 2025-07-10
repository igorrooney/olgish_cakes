# Google Search Console Setup Guide for Olgish Cakes

## Overview

Google Search Console is essential for monitoring your website's search performance, indexing status, and SEO health. This guide will help you set up and optimize GSC for your Ukrainian cake business.

## Step 1: Property Setup

### 1.1 Add Your Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Enter your domain: `https://olgish-cakes.vercel.app`
4. Choose "Domain" property type (recommended for better coverage)

### 1.2 Verify Ownership

Choose one of these verification methods:

**Option A: DNS Record (Recommended)**

- Add TXT record to your domain's DNS
- Record: `google-site-verification=YOUR_VERIFICATION_CODE`
- Wait 24-48 hours for verification

**Option B: HTML File**

- Download the verification file
- Upload to your website root
- Access via: `https://olgish-cakes.vercel.app/google1234567890.html`

**Option C: HTML Tag**

- Add meta tag to your `app/layout.tsx`:

```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

## Step 2: Submit Sitemap

### 2.1 Submit XML Sitemap

1. Go to "Sitemaps" in GSC
2. Submit: `https://olgish-cakes.vercel.app/sitemap.xml`
3. Monitor indexing status

### 2.2 Submit Additional Sitemaps (if needed)

- `https://olgish-cakes.vercel.app/cakes-sitemap.xml`
- `https://olgish-cakes.vercel.app/blog-sitemap.xml`

## Step 3: Configure Settings

### 3.1 Geographic Target

- Set target country: **United Kingdom**
- This helps with local SEO for Leeds area

### 3.2 Preferred Domain

- Set to: `https://olgish-cakes.vercel.app`
- Redirect www to non-www (already configured)

### 3.3 International Targeting

- Set hreflang if targeting multiple regions
- For now, focus on UK market

## Step 4: Monitor Key Metrics

### 4.1 Performance Dashboard

Monitor these metrics weekly:

- **Total Clicks**: Track organic traffic growth
- **Total Impressions**: Monitor visibility
- **Average CTR**: Optimize for better click-through rates
- **Average Position**: Track ranking improvements

### 4.2 Key Queries to Monitor

Set up alerts for these important keywords:

- "Ukrainian cakes Leeds"
- "honey cake Leeds"
- "Medovik cake"
- "custom cakes Leeds"
- "wedding cakes Leeds"
- "birthday cakes Leeds"

### 4.3 Top Pages

Focus on these high-priority pages:

- Homepage (`/`)
- Cakes collection (`/cakes`)
- About page (`/about`)
- Contact page (`/contact`)
- Individual cake pages (`/cakes/[slug]`)

## Step 5: Fix Issues

### 5.1 Coverage Report

Monitor for:

- **Submitted and indexed**: ✅ Good
- **Submitted but not indexed**: ⚠️ Check content quality
- **Excluded**: ❌ Fix issues
- **Error**: ❌ Critical - fix immediately

### 5.2 Common Issues to Watch For

- **404 errors**: Broken links
- **Mobile usability**: Mobile-friendly issues
- **Core Web Vitals**: Performance issues
- **Security issues**: HTTPS problems

## Step 6: Optimize for Local SEO

### 6.1 Local Business Schema

Your website already includes Local Business schema. Verify in GSC:

1. Go to "Enhancements" > "Local Business"
2. Check for any missing information
3. Ensure address and contact details are accurate

### 6.2 Google My Business Integration

1. Create/claim Google My Business listing
2. Use same business name: "Olgish Cakes"
3. Add same address and contact details
4. Link to your website

## Step 7: Regular Maintenance

### 7.1 Weekly Tasks

- Check for new errors in Coverage report
- Monitor Core Web Vitals
- Review search queries and performance
- Check for manual actions

### 7.2 Monthly Tasks

- Analyze top-performing pages
- Identify content gaps
- Review and update sitemap
- Check for new competitors

### 7.3 Quarterly Tasks

- Comprehensive SEO audit
- Update business information
- Review and optimize content
- Analyze competitor strategies

## Step 8: Advanced Features

### 8.1 URL Inspection Tool

Use to:

- Check indexing status of specific pages
- Request indexing of new/updated pages
- Debug crawl issues
- Test live URLs

### 8.2 Performance Reports

- Filter by country (UK)
- Filter by device (mobile/desktop)
- Analyze seasonal trends
- Identify content opportunities

### 8.3 Core Web Vitals

Monitor these metrics:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## Step 9: Content Strategy Integration

### 9.1 Blog Performance

Monitor blog post performance:

- Track which posts get most traffic
- Identify trending topics
- Optimize underperforming content
- Plan future content based on data

### 9.2 Product Page Optimization

For cake pages:

- Monitor individual cake page performance
- Track conversion metrics
- Optimize product descriptions
- Add customer reviews and ratings

## Step 10: Reporting

### 10.1 Monthly SEO Report

Include:

- Traffic growth trends
- Top-performing keywords
- Page performance analysis
- Technical SEO health
- Recommendations for improvement

### 10.2 Quarterly Business Review

- SEO impact on business goals
- ROI analysis
- Competitive analysis
- Strategic recommendations

## Troubleshooting

### Common Issues

1. **Verification fails**: Check DNS propagation
2. **Sitemap errors**: Validate XML format
3. **Indexing delays**: Check robots.txt and meta tags
4. **Performance issues**: Optimize images and code

### Support Resources

- [Google Search Console Help](https://support.google.com/webmasters/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Core Web Vitals](https://web.dev/vitals/)

## Next Steps

1. Complete GSC setup
2. Monitor for 2-4 weeks to establish baseline
3. Implement recommendations from this guide
4. Set up regular reporting schedule
5. Plan ongoing optimization strategy

---

**Note**: This setup will help you track your website's search performance and identify opportunities for improvement. Regular monitoring and optimization based on GSC data will significantly improve your search rankings and organic traffic.
