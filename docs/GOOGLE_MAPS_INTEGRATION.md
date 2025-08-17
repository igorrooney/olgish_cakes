# Google Maps Integration for Market Events

## ✅ **What's Been Added**

### **1. Clickable Address Links**

- 🎯 **Smart Links**: Uses GPS coordinates when available, falls back to address search
- 📱 **Mobile-Friendly**: Entire address is clickable, opens in new tab
- 🎨 **Clean Design**: Subtle underline with brand colors and hover effects
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation

### **2. Enhanced Sanity Schema**

- 📍 **GPS Coordinates Field**: Optional latitude/longitude input
- ✅ **Validation**: Ensures coordinates are within valid ranges
- 📝 **Help Text**: Clear instructions for finding coordinates

### **3. Advanced SEO Integration**

- 🔍 **Rich Snippets**: GeoCoordinates in structured data
- 🗺️ **Google Maps**: Better local search integration
- 📍 **Precise Location**: Exact positioning for search engines

## 🚀 **How It Works**

### **For Users:**

1. **See Event Card**: Professional display with location info
2. **Click Address**: Opens Google Maps in new tab
3. **Get Directions**: Instant navigation to your market stall

### **For You (Admin):**

1. **Add Event**: Create market event in Sanity Studio
2. **Add Address**: Enter full address for basic mapping
3. **Add GPS (Optional)**: Add exact coordinates for precision
4. **Publish**: Google Maps links automatically generated

## 📍 **How to Add GPS Coordinates**

### **Method 1: Google Maps**

1. Go to [Google Maps](https://maps.google.com)
2. Search for your market location
3. Right-click on the exact spot
4. Click the coordinates (first option)
5. Copy the numbers: `53.8308, -1.5661`

### **Method 2: Phone GPS**

1. Use your phone's GPS app
2. Stand at your market stall location
3. Note the coordinates displayed
4. Enter in Sanity Studio

### **Method 3: What3Words**

1. Go to [what3words.com](https://what3words.com)
2. Find your exact location
3. Click "Coordinates" to get GPS numbers
4. Enter in Sanity Studio

## 🎯 **Link Generation Logic**

### **With GPS Coordinates:**

```
https://www.google.com/maps/search/?api=1&query=53.8308,-1.5661
```

**Result**: Opens exact pinpoint location

### **Without GPS (Address Only):**

```
https://www.google.com/maps/search/?api=1&query=Meanwood%20Institute
```

**Result**: Searches for location name

### **Without GPS (No Address):**

```
https://www.google.com/maps/search/?api=1&query=Meanwood%20Farmers%20Market
```

**Result**: Searches for event title

## 🏆 **SEO Benefits**

### **Local Search Optimization**

- ✅ **Rich Snippets**: Events show with exact location
- ✅ **Google Maps Integration**: Appear in local map searches
- ✅ **Mobile Experience**: One-tap navigation for customers
- ✅ **Local Pack Rankings**: Better local business visibility

### **Structured Data Enhancement**

```json
{
  "@type": "Place",
  "name": "Meanwood Institute",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Meanwood Road",
    "addressLocality": "Leeds",
    "postalCode": "LS6 4QL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 53.8308,
    "longitude": -1.5661
  }
}
```

## 📱 **Mobile Experience**

### **Touch-Friendly Design**

- **Minimum 32px**: Meets accessibility standards
- **Visual Feedback**: Hover and focus states
- **Clear Icon**: Location pin + "View on Maps" text
- **Safe Target**: Adequate spacing from other elements

### **User Journey**

1. **Browse Events**: On your website
2. **See Location**: Event card with address
3. **Tap Maps Button**: Opens Google Maps
4. **Get Directions**: Instant navigation
5. **Find You**: Arrives at exact location

## 🧪 **Testing Your Integration**

### **Test Cases**

1. **Event with GPS**: Should open exact location
2. **Event with Address Only**: Should search for address
3. **Event with Location Name Only**: Should search for name
4. **Mobile Device**: Tap should open Maps app
5. **Desktop**: Should open maps.google.com

### **Expected Behavior**

- ✅ Links open in new tab/window
- ✅ No broken or 404 links
- ✅ Accurate locations on Google Maps
- ✅ Professional button styling
- ✅ Responsive on all devices

## 🎨 **Visual Design**

### **Link Styling**

- **Text Color**: Brand primary color
- **Underline**: Subtle 1px underline
- **Hover**: Darker color with thicker underline
- **Spacing**: Proper offset from text
- **Touch**: Large enough touch target for mobile

### **Layout Integration**

- **Position**: Below address in event details
- **Spacing**: Adequate margin from other elements
- **Alignment**: Left-aligned with location info
- **Responsiveness**: Adapts to screen size

## 🚀 **Performance Impact**

### **Optimizations**

- ✅ **No External Requests**: Links only, no embedded maps
- ✅ **Lazy Loading**: Component only renders when needed
- ✅ **Minimal Bundle**: No heavy mapping libraries
- ✅ **Fast Rendering**: Simple link generation

### **User Benefits**

- **Fast Loading**: No performance impact
- **Universal**: Works on all devices
- **Reliable**: Uses Google's robust mapping
- **Accessible**: Screen reader friendly

Your Google Maps integration is now complete and will significantly improve the user experience for customers trying to find your market stalls! 🗺️✨
