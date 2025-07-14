# Production Content Updates Guide

This guide explains how content updates work in production and how to set up immediate updates.

## 🚀 **Production Update Strategies**

### **1. Automatic Revalidation (Default)**

- **Time-based**: Pages revalidate every 5 minutes
- **CDN Caching**: Fast delivery with Sanity CDN
- **ISR**: Incremental Static Regeneration for static pages

### **2. Webhook-Based Updates (Recommended)**

- **Instant updates**: Content updates immediately when published
- **Selective revalidation**: Only affected pages are updated
- **Zero downtime**: Updates happen in the background

### **3. Manual Cache Clearing**

- **Admin tools**: Clear cache from admin panel
- **API endpoints**: Programmatic cache invalidation
- **Command line**: Scripts for cache management

## 🔧 **Setup Instructions**

### **Step 1: Configure Sanity Webhook**

1. **Go to Sanity Management Console**

   ```
   https://www.sanity.io/manage
   ```

2. **Navigate to your project → API → Webhooks**

3. **Create a new webhook:**

   - **Name**: `Content Revalidation`
   - **URL**: `https://your-domain.com/api/revalidate`
   - **HTTP Method**: `POST`
   - **Dataset**: `production`
   - **Filter**: `_type in ["cake", "testimonial", "faq"]`
   - **Events**: `create`, `update`, `delete`

4. **Save the webhook**

### **Step 2: Environment Variables**

Add these to your production environment:

```bash
# Required for webhook authentication
SANITY_API_TOKEN=your_write_token_here

# Optional: Custom revalidation time (in seconds)
NEXT_PUBLIC_REVALIDATE_TIME=300
```

### **Step 3: Test the Webhook**

1. **Test locally:**

   ```bash
   curl -X POST http://localhost:3000/api/revalidate \
     -H "Content-Type: application/json" \
     -d '{"_type":"cake","_id":"test","slug":{"current":"honey-cake-medovik"}}'
   ```

2. **Test in production:**
   ```bash
   curl -X POST https://your-domain.com/api/revalidate \
     -H "Content-Type: application/json" \
     -d '{"_type":"cake","_id":"test","slug":{"current":"honey-cake-medovik"}}'
   ```

## 📊 **How It Works**

### **Content Update Flow**

1. **Content Published in Sanity Studio**
2. **Sanity sends webhook to your app**
3. **App revalidates affected pages**
4. **Cache is cleared for updated content**
5. **Users see updated content immediately**

### **Revalidation Logic**

```typescript
// When a cake is updated:
if (_type === "cake") {
  revalidatePath(`/cakes/${slug.current}`); // Individual cake page
  revalidatePath("/cakes"); // Cakes list page
  revalidatePath("/"); // Home page
  invalidateCache(`cake-${slug.current}`); // Clear specific cache
}
```

## 🛠 **Production Tools**

### **1. Admin Cache Management**

Create an admin panel for cache management:

```typescript
// app/admin/cache/page.tsx
"use client";

import { Button } from '@mui/material';

export default function AdminCachePage() {
  const clearCache = async () => {
    await fetch('/api/admin/clear-cache', { method: 'POST' });
  };

  return (
    <div>
      <Button onClick={clearCache}>Clear All Cache</Button>
    </div>
  );
}
```

### **2. API Endpoints for Cache Management**

```typescript
// app/api/admin/clear-cache/route.ts
import { NextResponse } from "next/server";
import { invalidateCache } from "@/app/utils/fetchCakes";

export async function POST() {
  await invalidateCache();
  return NextResponse.json({ success: true });
}
```

### **3. Monitoring and Logs**

Monitor webhook activity:

```typescript
// Add to your webhook handler
console.log("🔄 Webhook received:", {
  timestamp: new Date().toISOString(),
  type: body._type,
  id: body._id,
  userAgent: request.headers.get("user-agent"),
});
```

## 🔍 **Troubleshooting**

### **Webhook Not Working?**

1. **Check webhook URL**

   - Ensure it's accessible from the internet
   - Verify HTTPS in production

2. **Check authentication**

   - Verify `SANITY_API_TOKEN` is set
   - Ensure token has write permissions

3. **Check logs**
   - Monitor Vercel/Netlify logs
   - Look for webhook errors

### **Content Not Updating?**

1. **Verify webhook is triggered**

   - Check Sanity webhook logs
   - Monitor your app logs

2. **Check revalidation**

   - Verify `revalidatePath()` is called
   - Check cache invalidation

3. **Test manually**
   ```bash
   pnpm run clear-cache
   ```

### **Performance Issues?**

1. **Optimize revalidation**

   - Only revalidate affected pages
   - Use selective cache clearing

2. **Monitor API usage**
   - Track Sanity API calls
   - Optimize query patterns

## 📈 **Performance Optimization**

### **Cache Strategy**

```typescript
// Development: Fast updates
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Production: Performance optimized
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### **Selective Revalidation**

```typescript
// Only revalidate what's needed
if (_type === "cake") {
  revalidatePath(`/cakes/${slug.current}`);
  invalidateCache(`cake-${slug.current}`);
}
```

### **CDN Optimization**

```typescript
// Use CDN for performance
export const client = createClient({
  useCdn: true, // Fast delivery
  perspective: "published", // Only published content
});
```

## 🚀 **Deployment Checklist**

- [ ] Webhook configured in Sanity
- [ ] Environment variables set
- [ ] API endpoint accessible
- [ ] Cache management tools ready
- [ ] Monitoring in place
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Documentation updated

## 📞 **Support**

If you need help with production updates:

1. Check the webhook logs in Sanity
2. Monitor your application logs
3. Test the revalidation endpoint
4. Verify environment variables
5. Contact support with specific error messages
