# Production Content Updates Guide

This guide explains how production content updates work in the current app.

## Legal Release Gate

Do not release the legal and privacy update until every item below is complete:

- [ ] A UK-qualified solicitor has reviewed the exact terms version `2026-07-28`.
- [ ] The solicitor has confirmed the sole-trader identity, public trading address, contract-formation process, cancellation wording, allergen wording, liability wording and governing-law wording.
- [ ] Any solicitor changes have been applied to both the visible `/terms` page and `public/legal/olgish-cakes-terms-2026-07-28.pdf`.
- [ ] The final PDF has been regenerated with `pnpm run legal:terms-pdf` and visually checked page by page.
- [x] Automated tests confirm that order-request receipts and final-offer emails attach the versioned `2026-07-28` terms PDF. The full test gate last passed on 28 August 2026: 333 suites and 4,039 tests passed, with every configured coverage threshold met.
- [x] A real final-offer test email for `#TEST-ALLERGEN-20260828-01` was delivered to and retained by the owner on 28 August 2026. The saved EML was checked for the exact product-specific allergen statement in both HTML and plain text, the readable versioned terms PDF attachment and the absence of customer free text and dietary-health information. Evidence EML SHA-256: `fbe7ab2bc6bbae86acd9b7dcb401fc3ca38173df80440b6e44759975e282ac43`.
- [ ] Staff use the final-offer workflow and record written acceptance or payment before production or fulfilment.
- [ ] Product-specific written allergen information is included in the final offer and supplied with the food.
- [ ] Staff identify fixed-date workshops, catering and leisure services that fall within the statutory cancellation exception and explain this before contract.
- [ ] For any other service starting during an applicable 14-day cancellation period, the customer expressly requests early performance and acknowledges the effect on the cancellation right.
- [ ] Processor terms, data-processing agreements and international-transfer safeguards have been checked for Vercel, Supabase, Resend, Telegram, Sanity, Google and Microsoft.
- [ ] The owner has confirmed that the ICO data-protection fee is paid or that a documented exemption applies.
- [x] The application retention schedule has a named owner, quarterly discovery-only cron, six granular deletion categories with nothing preselected, exact per-record data-effect review, a complete active-hold register and a non-sensitive audit trail. See `docs/PRIVACY_RETENTION_OPERATIONS.md`.
- [x] The application and migration code separates 30-day terminal-lifecycle health minimisation from immediate consent withdrawal, and provides an authenticated server-now-plus-30-day scheduling action for eligible legacy records with no deadline. It does not guess historical lifecycle dates.
- [x] The final local production-browser audit on 25 August 2026 covered granular unchecked-by-default selection, held-record blocking, exact deletion effects, confirmation invalidation, lifecycle review, legal holds, expired-claim recovery, persisted-run resumption, definitive and ambiguous failure handling, and authenticated same-origin/cross-origin protection. The affected public pages also passed 18 responsive page/viewport checks at 390px, 1024px and 1440px with no overflow or console errors. This does not replace the migration and staging-database gates below.
- [ ] The retention migrations `20260825120000_add_privacy_retention_lifecycle.sql`, `20260825122500_atomic_enquiry_retention_lifecycle.sql`, `20260825130000_add_health_information_retention.sql`, `20260825140000_add_privacy_retention_candidate_pagination.sql`, `20260825150000_add_privacy_hold_claim_recovery.sql` and `20260825160000_bound_event_photo_cleanup.sql` have been applied in that exact order before the application code, and the first owner review has been recorded in `/admin/privacy-retention`. Earlier migration deployment does not cover the three new `140000`, `150000` and `160000` migrations.
- [ ] The retention migrations and application have been verified against a staging PostgreSQL database, including grants/RLS, constraints, genuine terminal transitions, legacy health scheduling, legal holds, candidate 251 and later pages, held/non-held scale cases, last-page clamping, one-pending-action concurrency, exact affected-item counts, atomic storage/database finalisation, expired-claim hold recovery and safe resumption of an interrupted persisted run. Pending or ambiguous work must resume its exact run; only an investigated terminal pre-irreversible failure may use a fresh preview/run.
- [ ] The service-role-only noncanonical-storage inventory is empty after safely remediating any legacy custom-bucket rows, the deployment does not configure a noncanonical `SUPABASE_ENQUIRY_BUCKET` or `EVENT_PHOTO_TEMP_BUCKET`, and the bounded event-photo cleanup has been tested with held records and a legacy backlog.
- [ ] The owner has checked the external processor, mailbox, device and backup-retention steps in `docs/PRIVACY_RETENTION_OPERATIONS.md`; application deletion cannot verify those independent systems.
- [x] The consent-evidence migration `20260729120000_add_sensitive_data_consent_evidence.sql` was applied before `20260730120000_add_sensitive_data_withdrawal_evidence.sql`. The deployed enquiry-table columns were verified read-only on 23 August 2026.
- [x] The atomic order-withdrawal migration `20260823153000_atomic_order_health_withdrawal.sql` is present in the live database. A service-role missing-record probe returned the expected `not-found` result on 24 August 2026 without changing data.
- [ ] The atomic withdrawal function's revoked `public`, `anon` and `authenticated` execute grants have been independently verified in the deployed database; the migration and automated tests enforce the intended service-role-only policy, but no anon key was available for the live release audit.
- [ ] Authenticated withdrawal has been tested against contact, custom-cake, workshop and order records, including irreversible health-content redaction and idempotent repeat requests.
- [ ] The owner has confirmed the physical written-allergen labelling process used at collection, dispatch and delivery.
- [x] On 28 August 2026, the owner confirmed that all CMS reviews are genuine and approved for publication. Runtime intentionally shows all structurally displayable records using the original review-card design; source-attribution metadata is not displayed.
- [ ] Merchant Center account-level UK shipping rates, destinations and delivery times have been verified against the current website and product feed wherever item-level shipping is omitted.
- [ ] A UK-qualified solicitor has reviewed the final `2026-08-25` Privacy Policy and the unchanged terms and explicit-consent wording.

The current wording is a guidance-aligned working draft, not a substitute for legal advice.

Release remains blocked until an accountable owner signs off processor agreements
and transfers, ICO fee status, retention ownership, applies and verifies the new
retention migrations in a staging/deployed database, checks physical allergen
labelling, and obtains final UK-solicitor approval.

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
- `CRON_SECRET` protects `/api/cron/revalidate-articles` and the discovery-only
  `/api/cron/privacy-retention` route.
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
    },
    {
      "path": "/api/cron/privacy-retention",
      "schedule": "0 8 1 3,6,9,12 *"
    }
  ]
}
```

After deployment:
1. Open the Vercel project dashboard.
2. Check that the article revalidation and quarterly privacy-retention discovery
   jobs are registered.
3. Confirm `CRON_SECRET` is set in the project environment variables.

The privacy-retention cron creates a discovery-only audit run with non-sensitive
counts. It does not select or delete any customer record.

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

### Test the privacy-retention discovery route

This is non-destructive, but it records a discovery-only run in the audit history:

```bash
curl https://your-domain.com/api/cron/privacy-retention \
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
- [ ] Quarterly privacy-retention discovery cron registered
- [ ] Manual webhook test passes
- [ ] Manual cron test passes
- [ ] Manual privacy-retention discovery test returns counts without selecting or deleting records
