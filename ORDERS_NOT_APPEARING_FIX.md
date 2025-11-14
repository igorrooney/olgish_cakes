# Fix: Orders Not Appearing in Sanity

## 🔍 Diagnosis

The issue is most likely one of these:

### 1. **SANITY_API_TOKEN Not Set in Vercel** (Most Common)

**Check:**
```bash
# Go to Vercel Dashboard
https://vercel.com/igor-ieromenkos-projects/olgish-cakes/settings/environment-variables
```

**Look for:** `SANITY_API_TOKEN`

**If missing:** This is the problem!

---

### 2. **Token Doesn't Have Write Permissions**

Even if `SANITY_API_TOKEN` is set, it needs **Editor** or **Admin** permissions.

---

## ✅ Solution

### Step 1: Get Your Sanity API Token

1. Go to: https://sanity.io/manage
2. Select your **Olgish Cakes** project
3. Navigate to: **API → Tokens**
4. Find your existing token OR create a new one:
   - **Name:** `Production API Token`
   - **Permissions:** **Editor** (needs write access)
5. Copy the token

### Step 2: Add Token to Vercel

1. Go to: https://vercel.com/igor-ieromenkos-projects/olgish-cakes/settings/environment-variables
2. Add or update: `SANITY_API_TOKEN`
3. Value: `<paste-your-token-from-step-1>`
4. Environment: **Production** (and Preview if you want)
5. Click **Save**

### Step 3: Redeploy

Vercel will automatically redeploy, OR manually trigger:

```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin development
```

### Step 4: Test

1. Go to your website: https://olgishcakes.co.uk
2. Submit a test order
3. Check Sanity Studio: https://olgishcakes.co.uk/studio
4. Go to **Orders** section
5. Your order should appear! ✅

---

## 🧪 Diagnostic Endpoint

I've created a test endpoint to check Sanity connectivity:

```bash
# Test locally
curl http://localhost:3000/api/test-sanity-write

# Test production (after deploying)
curl https://olgishcakes.co.uk/api/test-sanity-write
```

**Good Response:**
```json
{
  "success": true,
  "hasToken": true,
  "canRead": true,
  "message": "Sanity connection is working..."
}
```

**Bad Response (Missing Token):**
```json
{
  "error": "SANITY_API_TOKEN not set",
  "hasToken": false
}
```

---

## 🔍 Check Production Logs

After submitting an order, check Vercel logs for errors:

```bash
# In Vercel Dashboard
https://vercel.com/igor-ieromenkos-projects/olgish-cakes/logs

# Look for these log lines:
📦 Orders API: Received order creation request
📦 Orders API: Parsed order data for customer: xxx@example.com
📦 Orders API: Generated order number: OCxxxxxx
📦 Orders API: Creating order in Sanity...
✅ Orders API: Order created in Sanity with ID: xxx
```

**If you see an error instead:**
- `401 Unauthorized` → Token is invalid
- `403 Forbidden` → Token doesn't have write permissions
- `Missing project/dataset` → Environment variables not set

---

## 📋 Quick Checklist

Verify these environment variables are set in Vercel:

- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your project ID
- [ ] `NEXT_PUBLIC_SANITY_DATASET` - Usually "production"
- [ ] `SANITY_API_TOKEN` - **Token with Editor/Admin permissions** ⚠️

---

## 🎯 Most Likely Issue

**`SANITY_API_TOKEN` is missing or has wrong permissions in Vercel.**

**Quick Fix:**
1. Get token from Sanity (with Editor permissions)
2. Add to Vercel environment variables
3. Redeploy
4. Test order submission

---

## 💡 Why This Happens

The security improvements we made don't affect Sanity writing. However, if you:
- Recently changed tokens
- Recreated your Vercel project
- Updated environment variables

The `SANITY_API_TOKEN` might have been lost or not copied over.

---

**Time to fix:** 3 minutes

**Next step:** Check Vercel environment variables for `SANITY_API_TOKEN`

