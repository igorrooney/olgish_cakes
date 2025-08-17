# Market Schedule Testing Guide

## ✅ **Fixed Runtime Error**

The `useTheme is not a function` error has been resolved by:

1. **Added Missing Exports**: Added `useTheme` and `useMediaQuery` hooks to `lib/mui-optimization.tsx`
2. **Added Missing Icons**: Added `CalendarTodayIcon`, `AccessTimeIcon`, `LocalOfferIcon`, and `EventIcon`
3. **Proper Hook Imports**: Fixed the import structure for Material-UI hooks

## 🧪 **Testing Your Market Schedule**

### Step 1: Check if the Page Loads

1. **Visit your home page**: `http://localhost:3000`
2. **Expected**: Page should load without any runtime errors
3. **If no events exist**: Market schedule section won't appear (this is normal)

### Step 2: Add Sample Market Events

1. **Go to Sanity Studio**: `http://localhost:3000/studio`
2. **Navigate to**: Market Schedule → All Events
3. **Click**: "Create" button
4. **Fill in these required fields**:

```
Title: Meanwood Farmers' Market
Slug: meanwood-farmers-market (auto-generated)
Location: Meanwood Institute
Address: Meanwood Road, Meanwood, Leeds LS6 4QL
Date: [Pick a future date]
Start Time: 09:00
End Time: 16:00
Frequency: Weekly
Featured: ✅ Yes
Active: ✅ Yes
Description: Join us every Saturday for authentic Ukrainian cakes!
```

5. **Add an image** (optional but recommended)
6. **Publish** the event

### Step 3: Verify the Display

1. **Refresh your home page**
2. **Expected to see**:
   - Market Schedule section appears
   - Professional event card with:
     - Event image (if added)
     - Date badge in top-right
     - "Featured Event" badge (if featured)
     - Event title and details
     - Location and clickable address
     - Professional styling with brand colors

### Step 4: Test SEO Features

1. **View page source** (`Ctrl+U` or `Cmd+U`)
2. **Search for** `"@type": "Event"`
3. **Expected**: JSON-LD structured data for your events
4. **Check title**: Should include event location if you have upcoming events

### Step 5: Test Responsive Design

1. **Resize browser window** or use mobile view
2. **Expected**:
   - Desktop: 3 columns
   - Tablet: 2 columns
   - Mobile: 1 column
   - All touch targets are 44px+ minimum

## 🚀 **Debug Commands**

### Check Market Events Data

```bash
node scripts/debug-market-events.js
```

This will show:

- How many events exist
- Which fields are missing
- Event status (active/featured)
- Upcoming events count

### Check Console for Warnings

Open browser console (`F12`) and look for:

- ✅ `Skipping event with missing required fields` - Normal if events are incomplete
- ❌ Any red errors - Need to be fixed

## 📊 **Expected Behavior**

### With No Events

- ✅ Home page loads normally
- ✅ No market schedule section appears
- ✅ No runtime errors

### With Events (All Required Fields)

- ✅ Market schedule section appears
- ✅ Professional event cards display
- ✅ Animations work smoothly
- ✅ Responsive design functions
- ✅ SEO structured data generated

### With Incomplete Events

- ✅ Warning in console about missing fields
- ✅ Incomplete events filtered out automatically
- ✅ Only complete events display

## 🔧 **Troubleshooting**

### "No market events found"

- Add events in Sanity Studio
- Make sure events are marked as "Active"
- Ensure dates are in the future

### "Events appear but no images"

- Add images to events in Sanity Studio
- Check image uploads are working
- Fallback pattern image will be used

### "Events don't appear on home page"

- Check console for warnings
- Verify events have all required fields
- Make sure at least one event is "Featured"
- Ensure events are marked as "Active"

### "SEO data not generating"

- Check browser console for errors
- Verify events have title, date, location
- View page source to confirm JSON-LD

## 🎯 **Success Criteria**

✅ **Page loads without errors**  
✅ **Market schedule displays with sample data**  
✅ **Responsive design works on all devices**  
✅ **SEO structured data appears in page source**  
✅ **Professional styling matches brand colors**  
✅ **Touch targets meet accessibility standards**

Your market schedule feature is now fully functional and ready to help you achieve #1 Google rankings! 🎂✨
