# Production Content Updates Guide

This guide explains how production content updates work in the current app.

## Legal Release Gate

Do not release the 28 July 2026 legal-page update until every item below is complete:

- [ ] A UK-qualified solicitor has reviewed the exact terms version `2026-07-28`.
- [ ] The solicitor has confirmed the sole-trader identity, public trading address, contract-formation process, cancellation wording, allergen wording, liability wording and governing-law wording.
- [ ] Any solicitor changes have been applied to both the visible `/terms` page and `public/legal/olgish-cakes-terms-2026-07-28.pdf`.
- [ ] The final PDF has been regenerated with `pnpm run legal:terms-pdf` and visually checked page by page.
- [ ] Order-request receipts and final-offer emails have been tested with the versioned terms attachment.
- [ ] Staff use the final-offer workflow and record written acceptance or payment before production or fulfilment.
- [ ] Product-specific written allergen information is included in the final offer and supplied with the food.
- [ ] Staff identify fixed-date workshops, catering and leisure services that fall within the statutory cancellation exception and explain this before contract.
- [ ] For any other service starting during an applicable 14-day cancellation period, the customer expressly requests early performance and acknowledges the effect on the cancellation right.
- [ ] Processor terms, data-processing agreements and international-transfer safeguards have been checked for Vercel, Supabase, Resend, Telegram, Sanity, Google and Microsoft.
- [ ] The privacy retention schedule has an assigned owner and a recurring deletion/review process.

The current wording is a guidance-aligned working draft, not a substitute for legal advice.

### Known `/terms` performance risk

The local production Lighthouse audit on 28 July 2026 scored Performance 90,
Accessibility 100, Best Practices 100 and SEO 100. CLS was 0.002, but mobile lab
LCP was 3.46 seconds. The page's observed LCP element rendered in 234 ms; the
higher simulated result remains a release risk to verify against the deployed
URL and real-user data.

Non-visible optimisations have been applied, including removing speculative
prefetching from legal-page navigation. Do not delay the immediately visible
cookie-consent UI or change the approved page design solely to improve the lab
score. Re-run Lighthouse against the deployed `/terms` URL before release and
monitor Core Web Vitals after release.

## Update Paths In Production

### Immediate updates from Sanity webhook
Use this for normal publish and edit events:
- cakes
- gift hampers
- articles
- article topics
- testimonials
- FAQs
- merchandising and collection documents

Endpoint:

```text
/api/revalidate
```

### Scheduled updates for future-dated articles
Use this when an article was already published in Sanity but should only become visible once `publishedAt` is reached.

Endpoint:

```text
/api/cron/revalidate-articles
```

This route refreshes:
- `/blog`
- due `/blog/[slug]` pages
- `articles`, `article`, and `sitemaps` cache tags

## Required Production Environment Variables

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
REVALIDATE_SECRET=your_random_revalidate_secret
CRON_SECRET=your_random_cron_secret
ARTICLE_PUBLISH_REVALIDATE_SECONDS=300
```

Notes:
- `SANITY_API_TOKEN` is required for write-enabled and server-authenticated Sanity operations used by cron/migration paths.
- `REVALIDATE_SECRET` protects `/api/revalidate`.
- `CRON_SECRET` protects `/api/cron/revalidate-articles`.
- `ARTICLE_PUBLISH_REVALIDATE_SECONDS` is the fallback time-based refresh window for article data.

## Sanity Webhook Setup

### Webhook target

```text
https://your-domain.com/api/revalidate
```

### Method

```text
POST
```

### Dataset

```text
production
```

### Filter

```text
_type in ["cake","testimonial","faq","giftHamper","giftHamperCollection","article","articleTopic","marketSchedule","collection","cakesFeaturedOffer","cakesDeliverySection","giftHampersDeliverySection","collectionsDisplayOrder","productsDisplayOrder"]
```

### Events
- create
- update
- delete

### Header

```text
Authorization: Bearer YOUR_REVALIDATE_SECRET
```

### Projection

```json
{
  "_type": _type,
  "_id": _id,
  "slug": slug
}
```

## Vercel Cron Setup

`vercel.json` should include:

```json
{
  "crons": [
    {
      "path": "/api/cron/revalidate-articles",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

After deployment:
1. Open the Vercel project dashboard.
2. Check that the cron job is registered.
3. Confirm `CRON_SECRET` is set in the project environment variables.

## How Production Updates Behave

### Cakes and gift hampers
- They appear when published and revalidated via the normal Sanity webhook.
- Their URLs are included in `sitemap-products.xml`.
- Their images are included in `sitemap-images.xml` when image data exists.

### Articles published now
- Sanity webhook revalidates `/blog`, the article URL, and sitemap caches immediately.

### Articles scheduled for the future
- The article remains hidden until `publishedAt <= now()`.
- Vercel cron revalidates blog pages and sitemap caches every 5 minutes.
- The article also benefits from the 5-minute article cache fallback on the page data path.

## Manual Tests

### Test the webhook route
```bash
curl -X POST https://your-domain.com/api/revalidate \
  -H "Authorization: Bearer YOUR_REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"_type\":\"article\",\"_id\":\"test\",\"slug\":{\"current\":\"your-article-slug\"}}"
```

### Test the cron route
```bash
curl https://your-domain.com/api/cron/revalidate-articles \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Troubleshooting

### Webhook is not updating content
- Confirm `REVALIDATE_SECRET` matches between Sanity and Vercel.
- Confirm the Sanity webhook filter includes `article` and `articleTopic`.
- Confirm the affected document is published.
- Check Vercel function logs for `/api/revalidate`.

### Scheduled article is not appearing
- Confirm the article is published in Sanity.
- Confirm `publishedAt` is now in the past.
- Confirm `CRON_SECRET` exists in Vercel.
- Confirm `SANITY_API_TOKEN` exists in Vercel.
- Check Vercel logs for `/api/cron/revalidate-articles`.

### Sitemap is not updating
- Confirm webhook revalidation or cron revalidation ran after the content became live.
- Check `sitemap.xml`, `sitemap-images.xml`, and `sitemap-products.xml` after the revalidation event.

## Deployment Checklist

- [ ] `REVALIDATE_SECRET` set in production
- [ ] `CRON_SECRET` set in production
- [ ] `SANITY_API_TOKEN` set in production
- [ ] Sanity webhook configured with the current filter
- [ ] Vercel cron job registered
- [ ] Manual webhook test passes
- [ ] Manual cron test passes
