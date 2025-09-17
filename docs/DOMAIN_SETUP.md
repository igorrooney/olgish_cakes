# Domain Setup Guide for olgishcakes.co.uk

## Overview

This guide covers the setup and configuration of your new domain `olgishcakes.co.uk` for your Ukrainian honey cake business.

## Domain Configuration

### 1. DNS Configuration

Configure your domain's DNS settings with your domain registrar:

#### A Records

```
@ -> 76.76.19.19 (Vercel's IP)
www -> 76.76.19.19 (Vercel's IP)
```

#### CNAME Records

```
www -> cname.vercel-dns.com
```

### 2. Vercel Domain Configuration

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add `olgishcakes.co.uk` as a custom domain
5. Add `www.olgishcakes.co.uk` as an alias
6. Verify domain ownership

### 3. SSL Certificate

Vercel will automatically provision an SSL certificate for your domain.

## SEO Configuration

### 1. Google Search Console

1. Add your new domain: `https://olgishcakes.co.uk`
2. Verify ownership (DNS or HTML file)
3. Submit your sitemap: `https://olgishcakes.co.uk/sitemap.xml`
4. Set preferred domain to `https://olgishcakes.co.uk`

### 2. Google Analytics

Update your Google Analytics property to use the new domain.

### 3. Social Media

Update all social media profiles with the new domain:

- Facebook Business Page
- Instagram Bio
- Twitter/X Profile
- LinkedIn Company Page

## Email Configuration

### 1. Professional Email Setup

Consider setting up professional email addresses:

- hello@olgishcakes.co.uk
- hello@olgishcakes.co.uk
- hello@olgishcakes.co.uk

### 2. Email Service Providers

Recommended options:

- Google Workspace
- Microsoft 365
- Zoho Mail

## Local Business Listings

### 1. Google My Business

1. Update your business listing with the new domain
2. Add the new website URL
3. Update business hours and contact information

### 2. Other Directories

Update these platforms with your new domain:

- Yell.com
- Yelp
- TripAdvisor
- Facebook Places
- Bing Places

## Technical Updates Completed

### ✅ Updated Files

- `app/robots.ts` - Updated sitemap URL
- `app/sitemap.ts` - Updated base URL
- `vercel.json` - Added domain configuration
- All page components (94 files) - Updated canonical URLs and structured data
- `package.json` - Updated lighthouse script
- Documentation files

### ✅ Domain References Updated

- Total files updated: 94
- Total replacements: 476
- All canonical URLs now point to `https://olgishcakes.co.uk`
- All structured data updated
- All internal links updated

## Next Steps

### 1. Deploy to Production

```bash
pnpm run deploy
```

### 2. Test Domain

- Visit `https://olgishcakes.co.uk`
- Test all major pages
- Verify SSL certificate
- Check mobile responsiveness

### 3. Monitor Performance

```bash
pnpm run lighthouse
```

### 4. Set Up Monitoring

- Google Search Console
- Google Analytics
- Vercel Analytics
- Performance monitoring

## Redirect Strategy

### traditional Domain Redirects

If you have any traditional domains, set up 301 redirects:

- `olgish-cakes.vercel.app` → `olgishcakes.co.uk`
- Any other traditional domains → `olgishcakes.co.uk`

## Security Considerations

### 1. Security Headers

Already configured in `next.config.js`:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### 2. SSL/TLS

- Vercel automatically provides SSL certificates
- Force HTTPS redirects
- HSTS headers (configured)

## Performance Optimization

### 1. Image Optimization

- WebP format support
- Responsive images
- Lazy loading
- CDN via Vercel

### 2. Caching

- Static assets: 1 year
- Images: 30 days
- API responses: Configured per endpoint

## Local SEO for Leeds

### 1. Location Pages

All location-specific pages are optimized:

- `/cakes-leeds`
- `/cakes-bradford`
- `/cakes-halifax`
- `/cakes-huddersfield`
- `/cakes-ilkley`
- `/cakes-otley`
- `/cakes-skipton`
- `/cakes-wakefield`
- `/cakes-york`
- `/cakes-pudsey`

### 2. Local Keywords

- "Ukrainian cakes Leeds"
- "Honey cake Leeds"
- "Wedding cakes Leeds"
- "Birthday cakes Leeds"

## Maintenance

### 1. Regular Checks

- Monitor domain expiration
- Check SSL certificate status
- Review Google Search Console for issues
- Monitor website performance

### 2. Updates

- Keep Next.js and dependencies updated
- Regular security updates
- Content updates via Sanity CMS

## Support

For technical issues:

1. Check Vercel deployment logs
2. Review Google Search Console
3. Monitor performance metrics
4. Check browser developer tools

## Success Metrics

Track these metrics after domain launch:

- Organic traffic growth
- Search rankings for target keywords
- Page load speed
- Mobile usability scores
- Conversion rates
- Local search visibility
