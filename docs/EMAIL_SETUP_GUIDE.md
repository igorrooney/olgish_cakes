# Email Setup Guide for Olgish Cakes

This guide explains how to configure email sending for order forms and contact forms.

## Required Environment Variables

### Essential Variables

The following environment variables **must** be set for emails to work:

```bash
# Resend API Key (Required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to get it:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain `olgishcakes.co.uk`
3. Generate an API key in the API Keys section

### Optional Variables (with defaults)

```bash
# Email Recipients (defaults to hello@olgishcakes.co.uk)
CONTACT_EMAIL_TO=hello@olgishcakes.co.uk

# Application URL (for internal API calls)
NEXTAUTH_URL=https://olgishcakes.co.uk
# OR on Vercel, this is automatically set:
VERCEL_URL=olgishcakes.co.uk
```

## How Emails Work

### Contact Form ("Get a Quote")
- **Path:** `/api/contact`
- **Behavior:** Sends email directly via Resend
- **Emails sent:**
  1. Admin notification to `CONTACT_EMAIL_TO`
  2. BCC to `igorrooney@gmail.com`

### Order Forms (Cakes & Gift Hampers)
- **Path:** `/api/contact` → `/api/orders`
- **Behavior:** Delegates to Orders API which sends comprehensive emails
- **Fallback:** If Orders API fails, Contact API sends basic notification emails
- **Emails sent:**
  1. Customer confirmation with order details
  2. Admin notification with full order information
  3. BCC to `igorrooney@gmail.com`

## Testing Email Configuration

### Local Testing

1. Set environment variables in `.env.local`:
```bash
RESEND_API_KEY=your_key_here
NEXTAUTH_URL=http://localhost:3000
```

2. Start the dev server:
```bash
npm run dev
```

3. Test forms:
   - Go to `/contact` and submit "Get a Quote"
   - Go to `/cakes/[any-cake]` and submit an order form
   - Check server logs for detailed email status

### Production Testing

1. Verify environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Ensure `RESEND_API_KEY` is set

2. Check deployment logs:
   - Look for emoji-prefixed log messages:
     - ✅ Success messages
     - ❌ Error messages
     - 📦 Orders API operations
     - 📧 Email operations

## Troubleshooting

### No Emails Received

**Check server logs for:**

1. **Missing API Key**
   ```
   ❌ RESEND_API_KEY environment variable is not set
   ```
   → Add `RESEND_API_KEY` to environment variables

2. **Orders API Failure**
   ```
   ❌ Failed to create order. Status: 500
   ```
   → Check if Sanity credentials are correct
   → Verify NEXTAUTH_URL is set correctly
   → Fallback emails should still be sent

3. **Resend API Error**
   ```
   ❌ Resend API Error: [error message]
   ```
   → Verify domain is verified in Resend
   → Check API key is valid
   → Ensure you're not over quota

### Common Issues

#### Issue: Order forms don't send emails
**Solution:** 
- The Orders API might be failing to create orders in Sanity
- Fallback emails should still work
- Check logs for detailed error messages

#### Issue: "Get a Quote" works but order forms don't
**Solution:**
- Check `NEXTAUTH_URL` or `VERCEL_URL` is set correctly
- Verify Sanity credentials (`SANITY_API_TOKEN`)
- Look for Orders API errors in logs

#### Issue: Emails go to spam
**Solution:**
- Verify your domain in Resend
- Set up SPF, DKIM, and DMARC records
- Contact Resend support for domain reputation

## Environment Variable Checklist

For **production deployment**, ensure these are set:

- [ ] `RESEND_API_KEY` - From resend.com
- [ ] `NEXTAUTH_URL` - Your production URL (https://olgishcakes.co.uk)
- [ ] `CONTACT_EMAIL_TO` - Where admin emails go (default: hello@olgishcakes.co.uk)
- [ ] `SANITY_API_TOKEN` - For creating orders in Sanity

For **local development**:

- [ ] `RESEND_API_KEY` - Same as production or test key
- [ ] `NEXTAUTH_URL` - http://localhost:3000
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- [ ] `SANITY_API_TOKEN` - Sanity token with write permissions

## Monitoring

### Log Messages to Watch For

**Success indicators:**
- `✅ Successfully uploaded design image to Sanity`
- `✅ Order created successfully`
- `✅ Fallback admin email sent successfully`
- `✅ Orders API: Customer confirmation email sent successfully`

**Warning indicators:**
- `⚠️ Order creation failed, sending fallback notification emails...`

**Error indicators:**
- `❌ Failed to create order`
- `❌ Fallback email sending failed completely`
- `❌ Orders API: RESEND_API_KEY not configured`

## Support

If emails still don't work after following this guide:

1. Check server logs for specific error messages
2. Verify all environment variables are set correctly
3. Test the Resend API key directly via their dashboard
4. Contact Resend support if domain verification issues persist

---

**Last Updated:** {{ current_date }}
**Version:** 1.0


## Internal Email Testing Console

A guarded testing console is now available at `/admin/email-test` using the same shared template registry as production (`lib/email/templates/*`).

### New Environment Variables

```bash
# Transport mode:
# - capture: render and capture emails in memory (default in local/test)
# - live: send via Resend
# - disabled: skip sends completely
EMAIL_TRANSPORT_MODE=capture

# Real-send controls for /api/dev/email-test-send
EMAIL_REAL_SEND_ENABLED=false
EMAIL_TEST_RECIPIENT_ALLOWLIST=igorrooney@gmail.com,another@example.com
EMAIL_TEST_SUBJECT_PREFIX=[TEST]
EMAIL_REAL_SEND_RATE_LIMIT_PER_HOUR=5
```

### Dev Endpoints

- `POST /api/dev/email-preview`
  - Requires authenticated admin session (`admin_auth_token` cookie).
  - Body: `{ "templateId": "...", "scenarioId": "default", "input": { ... } }` (`scenarioId` optional)
  - Returns rendered `subject`, `text`, and `html` without sending.

- `POST /api/dev/email-test-send`
  - Requires authenticated admin session (`admin_auth_token` cookie).
  - Body: `{ "templateId": "...", "to": "...", "scenarioId": "default", "input": { ... } }` (`scenarioId` optional)
  - Sends a real email only when all guards pass:
    - `EMAIL_REAL_SEND_ENABLED=true`
    - recipient is allowlisted
    - per-hour rate limit not exceeded

### Recommended Workflow

1. Keep `EMAIL_TRANSPORT_MODE=capture` for local development.
2. Use `/admin/email-test` to preview all templates and payload variants.
3. Use "Send real test email" only for final smoke checks.
4. Keep real-send disabled in CI (`capture` or `disabled`).




