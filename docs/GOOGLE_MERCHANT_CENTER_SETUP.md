# Google Merchant Center Setup Guide

## Overview

This guide explains how to set up Google Merchant Center to automatically display your cakes and gift hampers in Google Shopping results.

## What We've Implemented

### 1. Product Feed API Endpoints

- **Main Feed**: `https://olgishcakes.co.uk/api/merchant-center/feed`
  - Complete XML feed with all products
  - Updated every hour automatically
  - Includes both cakes and gift hampers

- **Test Feed**: `https://olgishcakes.co.uk/api/merchant-center/test`
  - Limited products for testing (use `?limit=5` parameter)
  - No caching for immediate testing

- **Validation**: `https://olgishcakes.co.uk/api/merchant-center/validate`
  - JSON validation report of all products
  - Checks for missing required fields

### 2. Enhanced Structured Data

- Updated cake and hamper pages with Google Merchant Center compatible schema
- Includes all required fields: price, availability, shipping, returns
- Enhanced with GTIN, MPN, SKU identifiers

### 3. Automatic Updates

- Feed automatically updates when products change in Sanity
- Cache revalidation endpoint for manual updates
- 1-hour cache for optimal performance

## Setup Steps

### Step 1: Create Google Merchant Center Account

1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Sign in with your Google account
3. Create a new account for "Olgish Cakes"
4. Verify your business information

### Step 2: Verify Your Website

1. In Merchant Center, go to **Tools & Settings** > **Business information**
2. Add your website: `https://olgishcakes.co.uk`
3. Choose verification method:
   - **HTML file upload** (recommended)
   - **HTML tag** (alternative)
   - **Google Analytics** (if you have it)

### Step 3: Set Up Product Feed

1. Go to **Products** > **Feeds**
2. Click **Add product feed**
3. Choose **Scheduled fetch**
4. Enter feed details:
   - **Feed name**: "Olgish Cakes Products"
   - **Fetch URL**: `https://olgishcakes.co.uk/api/merchant-center/feed`
   - **Fetch frequency**: "Daily"
   - **Fetch time**: Choose a time (e.g., 2:00 AM)

### Step 4: Configure Feed Settings

1. **Primary feed**: Yes
2. **Country**: United Kingdom
3. **Language**: English (UK)
4. **Currency**: GBP (British Pound)
5. **Target country**: United Kingdom

### Step 5: Set Up Shipping

1. Go to **Tools & Settings** > **Shipping**
2. Add shipping service:
   - **Service name**: "Standard Delivery"
   - **Rate**: "Free"
   - **Delivery time**: "1-3 business days"
   - **Countries**: United Kingdom

### Step 6: Set Up Taxes

1. Go to **Tools & Settings** > **Tax**
2. Add tax rules:
   - **Country**: United Kingdom
   - **Rate**: 20% (VAT)
   - **Shipping taxed**: Yes

### Step 7: Test Your Feed

1. Use the test feed URL: `https://olgishcakes.co.uk/api/merchant-center/test?limit=5`
2. Validate with Google's feed validator
3. Check for any errors or warnings

### Step 8: Submit for Review

1. Once your feed is error-free, submit it for Google's review
2. Review typically takes 1-3 business days
3. You'll receive email notifications about the status

## Feed Features

### Product Information Included

- **Required fields**: ID, title, description, link, image, price, availability
- **Enhanced data**: Brand, category, shipping, taxes, returns policy
- **SEO optimized**: Keywords, meta descriptions, structured data
- **Local SEO**: Leeds and Yorkshire area targeting

### Automatic Updates

- Feed updates automatically when you add/edit products in Sanity
- Cache revalidation ensures immediate updates
- 1-hour cache for optimal performance

### Error Handling

- Validation endpoint checks all products for issues
- Detailed error reporting for troubleshooting
- Automatic fallbacks for missing data

## Troubleshooting

### Common Issues

1. **Feed not updating**: Check cache revalidation
2. **Missing products**: Verify Sanity CMS data
3. **Image errors**: Ensure image URLs are accessible
4. **Price issues**: Check pricing structure in Sanity

### Validation Tools

- **Feed validator**: Use `/api/merchant-center/validate` endpoint
- **Test feed**: Use `/api/merchant-center/test?limit=5`
- **Google's validator**: Upload test feed to Google's tool

### Manual Cache Revalidation

If you need to force an immediate update:

```bash
curl -X POST https://olgishcakes.co.uk/api/merchant-center/revalidate \
  -H "Authorization: Bearer YOUR_REVALIDATE_TOKEN"
```

## Expected Results

After successful setup:

1. **Google Shopping**: Your products appear in shopping results
2. **Shopping ads**: Can create campaigns with your products
3. **Local visibility**: Products show for Leeds/Yorkshire searches
4. **Automatic updates**: New products appear without manual intervention

## Monitoring

### Key Metrics to Track

- **Feed status**: Check daily for errors
- **Product approval rate**: Should be 95%+ for approved products
- **Click-through rates**: Monitor performance in Google Ads
- **Conversion rates**: Track sales from Google Shopping

### Regular Maintenance

- **Weekly**: Check feed validation report
- **Monthly**: Review product performance
- **Quarterly**: Update product descriptions and images

## Support

If you encounter issues:

1. Check the validation endpoint first
2. Review Google Merchant Center documentation
3. Contact Google Merchant Center support
4. Check server logs for API errors

## Environment Variables

Add these to your `.env.local`:

```env
MERCHANT_CENTER_REVALIDATE_TOKEN=your_secure_token_here
```

This token is used for manual cache revalidation and should be kept secure.

## Next Steps

1. Set up Google Ads account for shopping campaigns
2. Create product groups and campaigns
3. Monitor performance and optimize
4. Consider seasonal promotions and special offers
