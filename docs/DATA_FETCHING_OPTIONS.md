# Data Fetching and Caching Options

This document explains the different ways to configure data fetching from Sanity CMS in your Olgish Cakes application.

## 🚀 **Quick Configuration**

### **Real-Time Data (No Caching)**

```bash
# Set this environment variable to enable real-time data
NEXT_PUBLIC_USE_REAL_TIME_DATA=true
```

### **Cached Data (Better Performance)**

```bash
# Set this environment variable to enable caching
NEXT_PUBLIC_USE_REAL_TIME_DATA=false
```

## 📊 **Comparison of Options**

| Feature             | Real-Time Data        | Cached Data        |
| ------------------- | --------------------- | ------------------ |
| **Data Freshness**  | ✅ Always current     | ⚠️ 5-minute delay  |
| **Performance**     | ⚠️ Slower (API calls) | ✅ Faster (cached) |
| **API Usage**       | ⚠️ Higher             | ✅ Lower           |
| **User Experience** | ✅ Immediate updates  | ⚠️ Slight delay    |
| **Cost**            | ⚠️ Higher API costs   | ✅ Lower costs     |

## 🔧 **Configuration Options**

### **Option 1: Real-Time Data (Recommended for Development)**

**Benefits:**

- Immediate content updates
- No cache management needed
- Perfect for development and testing

**Configuration:**

```bash
# .env.local or .env.production
NEXT_PUBLIC_USE_REAL_TIME_DATA=true
```

**How it works:**

- Disables Sanity CDN caching (`useCdn: false`)
- Disables application-level caching
- Fetches fresh data on every request
- Updates immediately when content changes

### **Option 2: Cached Data (Recommended for Production)**

**Benefits:**

- Better performance
- Lower API costs
- Reduced server load
- Better user experience

**Configuration:**

```bash
# .env.local or .env.production
NEXT_PUBLIC_USE_REAL_TIME_DATA=false
```

**How it works:**

- Uses Sanity CDN caching (`useCdn: true`)
- 5-minute application cache
- Automatic revalidation
- Webhook-based updates

### **Option 3: Hybrid Approach**

**Benefits:**

- Best of both worlds
- Real-time for critical content
- Cached for performance

**Configuration:**

```typescript
// Use real-time for specific queries
const criticalData = await getClient(true).fetch(query);

// Use cached for general queries
const generalData = await getClient(false).fetch(query);
```

## 🛠 **Implementation Details**

### **Sanity Client Configuration**

```typescript
// sanity/lib/client.ts
const USE_REAL_TIME_DATA =
  process.env.NEXT_PUBLIC_USE_REAL_TIME_DATA === "true" || process.env.NODE_ENV === "development";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !USE_REAL_TIME_DATA, // Disable CDN for real-time
  perspective: "published",
});
```

### **Application Cache Configuration**

```typescript
// app/utils/fetchCakes.ts
const CACHE_DURATION = USE_REAL_TIME_DATA
  ? 0 // No caching for real-time
  : process.env.NODE_ENV === "development"
    ? 30 * 1000
    : 5 * 60 * 1000;
```

## 📈 **Performance Impact**

### **Real-Time Data Performance**

- **API Calls**: Every request hits Sanity API
- **Response Time**: 200-500ms per request
- **Bandwidth**: Higher usage
- **Cost**: Higher API costs

### **Cached Data Performance**

- **API Calls**: Cached for 5 minutes
- **Response Time**: 50-100ms (cached)
- **Bandwidth**: Lower usage
- **Cost**: Lower API costs

## 🔄 **Content Update Strategies**

### **Real-Time Updates**

1. Content published in Sanity Studio
2. Immediate availability on website
3. No manual intervention needed

### **Cached Updates**

1. Content published in Sanity Studio
2. Webhook triggers revalidation
3. Cache cleared automatically
4. Updates available within 5 minutes

### **Manual Cache Clearing**

```bash
# Clear cache manually
pnpm run clear-cache

# Or use the admin API
curl -X POST /api/admin/clear-cache
```

## 🎯 **Recommendations**

### **Development Environment**

```bash
# Always use real-time data for development
NEXT_PUBLIC_USE_REAL_TIME_DATA=true
```

### **Production Environment**

```bash
# Use cached data for better performance
NEXT_PUBLIC_USE_REAL_TIME_DATA=false
```

### **High-Traffic Websites**

```bash
# Definitely use caching
NEXT_PUBLIC_USE_REAL_TIME_DATA=false
```

### **Content-Heavy Updates**

```bash
# Consider real-time for frequent updates
NEXT_PUBLIC_USE_REAL_TIME_DATA=true
```

## 🔍 **Monitoring and Debugging**

### **Check Current Configuration**

```typescript
import { USE_REAL_TIME_DATA } from "@/sanity/lib/client";

console.log("Real-time data enabled:", USE_REAL_TIME_DATA);
```

### **Monitor API Usage**

- Check Sanity dashboard for API usage
- Monitor response times
- Track cache hit rates

### **Debug Cache Issues**

```typescript
// Force cache clear
import { clearCache } from "@/app/utils/fetchCakes";
clearCache();
```

## 🚨 **Important Considerations**

### **API Limits**

- Sanity has API rate limits
- Real-time data uses more API calls
- Monitor usage in production

### **Cost Implications**

- More API calls = higher costs
- CDN caching reduces costs
- Consider your content update frequency

### **User Experience**

- Cached data loads faster
- Real-time data is always current
- Balance based on your needs

## 📞 **Support**

If you need help configuring data fetching:

1. Check your environment variables
2. Monitor API usage in Sanity dashboard
3. Test both configurations
4. Consider your specific use case

Remember: You can always switch between configurations by changing the environment variable!
