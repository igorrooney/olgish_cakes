# Blog Scheduling Setup Guide

## 🚀 What We've Built

Your Next.js website now has a complete blog scheduling system using Sanity.io! Here's what's included:

### **1. Sanity Blog Post Schema**
- **Content fields**: Title, excerpt, content, featured image
- **SEO fields**: SEO title, description, keywords
- **Scheduling**: Status (draft/scheduled/published), publish date
- **Organization**: Categories, featured posts, read time

### **2. API Routes**
- **`/api/blog-posts`** - Get/create blog posts
- **`/api/blog-posts/[id]`** - Update/delete specific posts
- **`/api/publish-scheduled-posts`** - Publish scheduled posts

### **3. Automated Scheduling**
- **Vercel Cron Jobs** - Runs 3 times daily (9 AM, 3 PM, 6 PM)
- **Automatic publishing** of scheduled posts
- **Status updates** from scheduled to published

### **4. Admin Interface**
- **`/admin/blog`** - Manage all blog posts
- **Create/Edit/Delete** posts
- **Schedule posts** for future publishing
- **Manual publish** scheduled posts

## 📋 Setup Instructions

### **1. Environment Variables**
Add these to your `.env.local`:

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
```

### **2. Sanity Studio Setup**
1. **Deploy your Sanity schema**:
   ```bash
   cd sanity
   npm run deploy
   ```

2. **Access Sanity Studio**:
   - Go to `https://your-project.sanity.studio`
   - Create your first blog post
   - Set status to "scheduled" and choose a publish date

### **3. Vercel Deployment**
1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Cron jobs will start automatically** - no additional setup needed!

## 🎯 How to Use

### **Creating Blog Posts**

#### **Option 1: Sanity Studio (Recommended)**
1. Go to `https://your-project.sanity.studio`
2. Click "Create" → "Blog Post"
3. Fill in all fields
4. Set status to "Scheduled" and choose publish date
5. Save - it will auto-publish at the scheduled time!

#### **Option 2: Admin Interface**
1. Go to `https://your-site.com/admin/blog`
2. Click "Create Post"
3. Fill in the form
4. Choose "Scheduled" status and set publish date
5. Save

### **Scheduling Posts**
1. **Set status** to "Scheduled"
2. **Choose publish date** and time
3. **Save** - the system will automatically publish it!

### **Manual Publishing**
- Go to `/admin/blog`
- Click "Publish Scheduled" to manually trigger publishing
- Or change status to "Published" in Sanity Studio

## 📅 Daily Blogging Workflow

### **Weekly Planning**
1. **Plan 7 articles** using the content calendar
2. **Write in Sanity Studio** (better writing experience)
3. **Schedule each post** for different times
4. **Set categories** and SEO fields
5. **Publish** - they'll go live automatically!

### **Content Calendar Integration**
- Use the provided content calendar
- **Monday**: Cake by Post Monday
- **Tuesday**: Traditional Tuesday
- **Wednesday**: Wedding Wednesday
- **Thursday**: Throwback Thursday
- **Friday**: Fresh Friday
- **Saturday**: Success Saturday
- **Sunday**: Sweet Sunday

## 🔧 Customization

### **Adding New Categories**
Edit `sanity/schemas/blogPost.ts`:
```typescript
options: {
  list: [
    { title: 'Business Guide', value: 'Business Guide' },
    { title: 'Cake by Post', value: 'Cake by Post' },
    // Add your new category here
    { title: 'New Category', value: 'New Category' },
  ]
}
```

### **Changing Cron Schedule**
Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/publish-scheduled-posts",
      "schedule": "0 8 * * *"  // 8 AM daily
    }
  ]
}
```

### **Adding More Fields**
Edit `sanity/schemas/blogPost.ts` to add new fields like:
- Author information
- Reading time calculation
- Social media previews
- Related posts

## 📊 Monitoring

### **Check Scheduled Posts**
- Go to `/admin/blog` to see all posts
- Filter by "Scheduled" status
- See which posts are coming up

### **Manual Publishing**
- Use "Publish Scheduled" button for immediate publishing
- Check logs in Vercel dashboard for cron job status

### **Troubleshooting**
- Check Vercel function logs for errors
- Verify Sanity API token permissions
- Ensure cron jobs are enabled in Vercel

## 🎉 Benefits

### **SEO Advantages**
- **Fresh content** published automatically
- **Consistent posting** schedule
- **SEO-optimized** content structure
- **Local SEO** with Leeds references

### **Time Saving**
- **Batch writing** - write multiple posts at once
- **Automatic publishing** - no manual work needed
- **Content calendar** - organized planning
- **Admin interface** - easy management

### **Professional Setup**
- **Headless CMS** - scalable and flexible
- **API-driven** - works with your Next.js site
- **Scheduled publishing** - professional content management
- **SEO-ready** - optimized for search engines

Your blog is now ready for daily posting with automated scheduling! 🚀
