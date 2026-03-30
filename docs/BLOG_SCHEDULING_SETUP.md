# Blog Scheduling Setup Guide

This guide describes the current article workflow for Olgish Cakes. The legacy `blogPost` API routes, `/admin/blog`, and manual scheduled-post publisher are retired.

## What The Current System Uses

### Sanity content types
- `article`
- `articleTopic`

### Public routes
- `/blog`
- `/blog/[slug]`

### Revalidation paths
- Immediate publish and content edits: `/api/revalidate`
- Future-dated article availability: `/api/cron/revalidate-articles`

## How Scheduling Works Now

### Publish immediately
1. Create or edit an `article` in Sanity Studio.
2. Publish it.
3. Sanity webhook calls `/api/revalidate`.
4. The app refreshes `/blog`, the article detail page, and sitemap caches.

### Schedule for a future date
1. Create or edit an `article` in Sanity Studio.
2. Set `publishedAt` to the future date and time you want.
3. Publish the document in Sanity.
4. The article stays hidden until `publishedAt <= now()`.
5. Vercel cron calls `/api/cron/revalidate-articles` every 5 minutes and refreshes:
   - `/blog`
   - due `/blog/[slug]` pages
   - sitemap caches

## Required Production Setup

### Environment variables
Set these in Vercel production:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
REVALIDATE_SECRET=your_random_revalidate_secret
CRON_SECRET=your_random_cron_secret
ARTICLE_PUBLISH_REVALIDATE_SECONDS=300
```

Notes:
- `SANITY_API_TOKEN` is required because the cron route uses the server Sanity client.
- `CRON_SECRET` is required so Vercel cron requests can authenticate.
- `REVALIDATE_SECRET` is used by the Sanity webhook and for manual revalidation calls.

### Sanity webhook
Create a webhook in Sanity Management Console:

- URL: `https://your-domain.com/api/revalidate`
- Method: `POST`
- Dataset: `production`
- Events: `create`, `update`, `delete`
- Header:
  - `Authorization: Bearer YOUR_REVALIDATE_SECRET`
- Filter:

```text
_type in ["cake","testimonial","faq","giftHamper","giftHamperCollection","article","articleTopic","marketSchedule","collection","cakesFeaturedOffer","cakesDeliverySection","giftHampersDeliverySection","collectionsDisplayOrder","productsDisplayOrder"]
```

- Projection:

```json
{
  "_type": _type,
  "_id": _id,
  "slug": slug
}
```

### Vercel cron
`vercel.json` already registers:

```json
{
  "path": "/api/cron/revalidate-articles",
  "schedule": "*/5 * * * *"
}
```

After deployment, verify the cron exists in the Vercel dashboard.

## Normal Editorial Workflow

### Create a new article
1. Open Sanity Studio.
2. Go to `Content Marketing -> Articles`.
3. Create an `Article`.
4. Fill in:
   - title
   - slug
   - summary
   - dek
   - cover image or card image
   - body content
   - topic
   - SEO fields
   - optional linked product references
5. Publish immediately, or set a future `publishedAt` and publish.

### Create or edit topics
1. Open Sanity Studio.
2. Go to `Content Marketing -> Article Topics`.
3. Create or edit the topic title, slug, description, and order.
4. Publish changes.

## What To Expect On The Site

### Blog archive
- `/blog` shows published articles only.
- Topic filters use query params.
- Pagination appears when the current archive view has more than 12 articles.

### Article detail pages
- `/blog/[slug]` resolves only when the article is published and `publishedAt <= now()`.
- Article pages and archive pages both use the same published-only visibility rule.

### Sitemap
- New live articles appear in `sitemap.xml`.
- Article images appear in `sitemap-images.xml` when article imagery exists.
- Future-dated articles rely on the cron route to refresh sitemap caches when they become due.

## Testing After Deployment

### Manual webhook test
```bash
curl -X POST https://your-domain.com/api/revalidate \
  -H "Authorization: Bearer YOUR_REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"_type\":\"article\",\"_id\":\"test\",\"slug\":{\"current\":\"your-article-slug\"}}"
```

### Manual cron test
```bash
curl https://your-domain.com/api/cron/revalidate-articles \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Scheduled article test
1. Publish an article with `publishedAt` a few minutes in the future.
2. Wait until that time passes.
3. Confirm:
   - `/blog` shows the article
   - `/blog/your-slug` resolves
   - `sitemap.xml` includes the article URL

## Troubleshooting

### Article is published in Sanity but not visible
- Confirm it is `Published`, not just draft.
- Confirm `publishedAt` is not still in the future.
- Confirm anonymous published reads can see `article` and `articleTopic` documents.
- Confirm the Sanity webhook filter includes `article` and `articleTopic`.

### Future-dated article did not appear
- Confirm `CRON_SECRET` exists in Vercel.
- Confirm `SANITY_API_TOKEN` exists in Vercel.
- Confirm the Vercel cron job is registered and running.
- Check Vercel function logs for `/api/cron/revalidate-articles`.

### Sitemap did not update
- Confirm the webhook or cron route revalidated the `sitemaps` tag.
- Check `sitemap.xml` after the article is due and after a cron run.
