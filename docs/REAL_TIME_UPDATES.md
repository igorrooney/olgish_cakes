# Real-Time Content Updates

This document explains how to get immediate content updates after publishing changes in Sanity Studio.

## Overview

The application now supports real-time content updates with multiple ways to refresh content:

1. **Automatic cache management** - Reduced cache duration in development
2. **Development tools** - UI components for clearing cache
3. **Command-line tools** - Scripts for cache management
4. **Real-time listeners** - Live updates via Sanity's real-time API

## Quick Start

### For Immediate Updates (Development)

1. **Use the Dev Tools** (recommended)

   - Look for the "Dev Tools" panel in the bottom-right corner of your website
   - Click "Clear Cache" to refresh content
   - Click "Force Refresh" to reload the entire page

2. **Use the command line**

   ```bash
   pnpm run clear-cache
   ```

3. **Manual browser refresh**
   - Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac) for hard refresh
   - This bypasses browser cache

### For Production

In production, content updates are handled automatically with:

- **CDN caching** for performance (5-minute cache)
- **Real-time listeners** for immediate updates
- **ISR (Incremental Static Regeneration)** for static pages

## How It Works

### Cache Strategy

- **Development**: 30-second cache for immediate feedback
- **Production**: 5-minute cache for performance
- **Preview mode**: No caching for real-time updates

### Client Configuration

```typescript
// Main client (production)
export const client = createClient({
  useCdn: true, // Fast CDN delivery
  perspective: "published", // Only published content
});

// Preview client (real-time)
export const previewClient = createClient({
  useCdn: false, // No CDN for fresh data
  perspective: "previewDrafts", // Include drafts
  token: process.env.SANITY_API_TOKEN,
});
```

### Real-Time Updates

The `useSanityLive` hook provides real-time updates:

```typescript
const { data, isLoading, error } = useSanityLive({
  query: '*[_type == "cake"]',
  initialData: serverData,
});
```

## Troubleshooting

### Content Still Not Updating?

1. **Check your environment variables**

   ```bash
   # Make sure you have these set
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_token
   ```

2. **Clear all caches**

   ```bash
   # Clear application cache
   pnpm run clear-cache

   # Clear browser cache
   # Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   ```

3. **Check Sanity Studio**

   - Make sure content is published (not just saved as draft)
   - Verify the content is in the correct dataset

4. **Development vs Production**
   - Development: Updates should be immediate
   - Production: May take up to 5 minutes due to CDN caching

### Performance Considerations

- **Development**: Fast updates, higher API usage
- **Production**: Optimized caching, lower API usage
- **Real-time listeners**: Only enabled when needed

## Advanced Usage

### Custom Cache Duration

You can modify cache duration in `app/utils/fetchCakes.ts`:

```typescript
const CACHE_DURATION =
  process.env.NODE_ENV === "development"
    ? 30 * 1000 // 30 seconds in development
    : 5 * 60 * 1000; // 5 minutes in production
```

### Force Preview Mode

For testing unpublished content:

```typescript
const cake = await getCakeBySlug("honey-cake", true); // preview = true
```

### Real-Time Components

Use the `useSanityLive` hook for components that need real-time updates:

```typescript
"use client";

import { useSanityLive } from '@/app/hooks/useSanityLive';

export function LiveCakeList() {
  const { data: cakes, isLoading } = useSanityLive({
    query: '*[_type == "cake"] | order(_createdAt desc)',
    enabled: true // Only enable when needed
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {cakes?.map(cake => (
        <div key={cake._id}>{cake.name}</div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Use Dev Tools in development** - Quick and easy cache clearing
2. **Publish content properly** - Make sure to publish, not just save drafts
3. **Monitor API usage** - Real-time listeners use more API calls
4. **Test in production** - Verify caching behavior in production environment
5. **Use appropriate cache strategies** - Different strategies for different use cases

## Support

If you're still experiencing issues with content updates:

1. Check the browser console for errors
2. Verify your Sanity project configuration
3. Ensure your API token has the correct permissions
4. Contact support with specific error messages
