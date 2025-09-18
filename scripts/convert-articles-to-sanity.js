#!/usr/bin/env node

/**
 * Script to convert existing blog articles to Sanity blog posts
 * This script reads the existing article files and creates Sanity blog posts
 */

import fs from 'fs';
import path from 'path';

// Article data extracted from existing files
const articles = [
  {
    slug: 'best-cakes-you-can-send-by-post-uk',
    title: 'Best Honey Cake You Can Send by Post UK 2025 | Letterbox Friendly Cakes Leeds',
    excerpt: 'Find out which cakes are perfect for sending by post in UK. I learned from experience which ones travel good and how to make sure your postal cakes arrive in perfect condition. Working with customers from Leeds and all over UK.',
    category: 'Cake by Post',
    readTime: '8 min read',
    status: 'published',
    featured: true,
    publishDate: '2025-09-17T10:00:00.000Z',
    author: {
      name: 'Olgish Cakes',
      image: null
    },
    description: 'Discover the best honey cakes perfect for postal delivery in the UK. Learn from real experience about which cakes travel well and how to ensure perfect delivery to Leeds and beyond.',
    seoTitle: 'Best Honey Cake You Can Send by Post UK 2025 | Letterbox Friendly Cakes Leeds',
    seoDescription: 'Find out which cakes are perfect for sending by post in UK. I learned from experience which ones travel good and how to make sure your postal cakes arrive in perfect condition.',
    keywords: [
      'best honey cake by post UK',
      'honey cake letterbox delivery',
      'Ukrainian honey cake by post',
      'honey cake postal delivery UK',
      'honey cake by post',
      'traditional honey cake delivery',
      'honey cake birthday delivery',
      'honey cake anniversary delivery',
      'honey cake by post service',
      'letterbox honey cake online'
    ],
    content: `When customers started asking me to send cakes by post from my Leeds bakery, I tried many different types. But traditional Ukrainian honey cake (we call it Medovik) works best for postal delivery. Here's why honey cake is the best cake you can send by post, from my experience.

## Why Honey Cake is Perfect for Postal Delivery

When I first started sending cakes by post from my Leeds bakery, I tried many different types. But traditional Ukrainian honey cake (we call it Medovik) works best. Unlike other cakes, honey cake has special properties that make it perfect for sending by post:

- **Dense texture that doesn't break** - Honey cake has many thin layers that stick together good, so it doesn't crumble during transport
- **Honey keeps it fresh naturally** - In Ukraine, we always use honey in cakes because it keeps them fresh for long time without fridge
- **No fridge needed** - My honey cake stays fresh at room temperature for up to 7 days, perfect for postal delivery
- **Right size for letterbox** - I make my honey cakes exactly right size to fit through normal UK letterboxes

## Traditional Ukrainian Honey Cake Recipe

My traditional Ukrainian honey cake (Medovik) is made using my grandmother's recipe from Ukraine. I had to change it little bit to work good for postal delivery, but the main ingredients and method stay the same:

### Authentic Ingredients
I use only real honey, fresh eggs, and traditional Ukrainian way of making. No chemicals or artificial stuff - just natural ingredients that keep the cake fresh naturally, like my grandmother taught me.

### Time-Tested Method
Each layer is baked individually and assembled with care. The traditional method ensures the cake maintains its structure and flavor during postal transport.

### Letterbox Perfect Size
Specially sized to fit through standard UK letterboxes (25cm x 5cm). The compact size ensures easy delivery while maintaining generous portions.

### Premium Quality
Made fresh to order with premium ingredients. Each honey cake is individually crafted and quality-checked before packaging for postal delivery.

## Honey Cake's Natural Preservation Properties

Our traditional Ukrainian honey cake (Medovik) is specifically designed for postal delivery. This centuries-old recipe has been perfected for modern postal requirements:

**Why Honey Cake is Perfect for Post:**
- Dense, moist layers that don't dry out
- Natural preservatives in honey extend shelf life
- Firm structure prevents crumbling during transport
- Rich, complex flavors that develop over time
- Traditional recipe with no artificial preservatives

## Perfect Texture for Letterbox Delivery

Honey cake's unique texture makes it ideal for postal delivery. The dense, layered structure ensures it maintains its shape and quality during transport, making it the perfect choice for letterbox delivery.

**Why Honey Cake Texture is Perfect for Post:**
- Dense, stable layers that don't shift during transport
- Moist texture that doesn't dry out or become crumbly
- Firm structure that prevents damage from handling
- Consistent texture throughout the entire cake

## Special Occasion Honey Cake Delivery

Honey cake by post is perfect for any special occasion. Whether it's a birthday, anniversary, or just because, our traditional Ukrainian honey cake makes every celebration extra special.

### Birthdays
Surprise someone special with a traditional honey cake delivered straight to their door. Perfect for making their day extra memorable.

### Anniversaries
Celebrate your special moments with a traditional Ukrainian honey cake. A unique and meaningful way to show you care.

## Packaging and Delivery Tips for Honey Cake

Proper packaging is crucial for successful cake delivery. Here's how we ensure your cakes arrive in perfect condition:

### Vacuum Sealing
Each cake is vacuum-sealed to maintain freshness and prevent damage during transport.

### Letterbox Size
All our cakes are designed to fit through standard UK letterboxes (25cm x 5cm).

### Fast Delivery
Next-day delivery available across the UK with Royal Mail tracking.

## How to Order the Best Cakes by Post

Ordering the perfect cake by post is simple with Olgish Cakes. Here's how to get started:

1. **Choose your cake from our letterbox-friendly selection** - Browse our specially curated collection of postal cakes
2. **Select delivery date and add personal message** - Choose when you want the cake delivered and add a special note
3. **We bake fresh and package carefully** - Your cake is baked to order and vacuum-sealed for freshness
4. **Track your delivery** - Receive tracking information and delivery confirmation

Ready to send the perfect cake? Choose from our selection of letterbox-friendly cakes and surprise someone special today.`
  },
  {
    slug: 'cake-by-post-uk-complete-guide',
    title: 'Honey Cake by Post UK: Complete Guide to Letterbox Delivery 2025 | Best Postal Cakes Leeds',
    excerpt: 'Everything what you need to know about sending traditional Ukrainian honey cake by post in UK. From my experience running cake business in Leeds, learn why honey cake is perfect for letterbox delivery.',
    category: 'Cake by Post',
    readTime: '12 min read',
    status: 'published',
    featured: true,
    publishDate: '2025-09-17T10:00:00.000Z',
    author: {
      name: 'Olgish Cakes',
      image: null
    },
    description: 'Complete guide to honey cake by post in the UK. Everything you need to know about letterbox delivery, packaging, and ensuring your cake arrives perfectly.',
    seoTitle: 'Honey Cake by Post UK: Complete Guide to Letterbox Delivery 2025 | Best Postal Cakes Leeds',
    seoDescription: 'Everything what you need to know about sending traditional Ukrainian honey cake by post in UK. From my experience running cake business in Leeds, learn why honey cake is perfect for letterbox delivery.',
    keywords: [
      'honey cake by post UK',
      'honey cake letterbox delivery',
      'Ukrainian honey cake by post',
      'honey cake postal delivery UK',
      'honey cake by post',
      'letterbox friendly honey cake',
      'surprise honey cake delivery',
      'birthday honey cake by post',
      'anniversary honey cake delivery',
      'honey cake gift by post',
      'order cake online UK',
      'cake by post service',
      'honey cake by post',
      'traditional cake delivery',
      'Ukrainian cake by post'
    ],
    content: `When I started my cake business in Leeds, I never thought about sending cakes by post. But then customers started asking me - "Can you send cake to my daughter in London?" or "My mum lives in Manchester, can she get your honey cake?" So I learned how to make cakes that travel good through the post.

## What is Cake by Post?

The idea is simple - make cakes that fit through normal UK letterboxes, so even if nobody is home, the cake still arrives. I use special packaging that keeps cakes fresh for few days, and honey cake is perfect for this because it doesn't go bad quickly like other cakes.

## Why Honey Cake is Perfect for Postal Delivery

In Ukraine, we make honey cake (we call it Medovik) for special occasions, and it's perfect for sending by post. My grandmother taught me this recipe, and I never thought it would work so good for postal delivery until I tried it.

### Natural Preservation
In Ukraine, we always use honey in cakes because it keeps them fresh for long time. I tested this with my honey cake - it stays good for up to 7 days without fridge, which is perfect for sending by post.

### Dense Structure
When I first tried to send regular cake by post, it arrived all broken. But honey cake is different - it has many thin layers that stick together good, so it doesn't break during transport. Each layer stays in place.

### Letterbox Perfect
I had to learn the hard way about UK letterbox sizes! First cakes I sent were too big and got returned. Now I make them exactly right size (25cm x 5cm) so they fit through any letterbox in UK.

### Traditional Recipe
This is my grandmother's recipe from Ukraine, made with real honey, fresh eggs, and natural ingredients. No chemicals or artificial stuff - just like we make it at home. That's why it tastes so good and stays fresh.

## How Cake by Post Works

When you order cake by post from me, here's what happens:

1. **You Order Online** - Tell me what cake you want and where to send it. I need the address and any special instructions
2. **I Bake Fresh** - I make your cake fresh in my kitchen in Leeds and cut it into pieces that fit through letterbox
3. **I Pack Carefully** - Each piece goes in special packaging that keeps it fresh and safe during transport
4. **I Send It** - I post it within 2-3 days and give you tracking number so you can see where it is

## Packaging and Freshness

Packaging is very important for cake by post. I learned this the hard way when first cakes arrived broken! Now I use special packaging that keeps cakes safe:

### Vacuum Sealing
Each cake slice is individually vacuum-packed to maintain maximum freshness

### Letterbox Design
Specially designed packaging that fits through standard UK letterboxes

### Protection
Sturdy packaging protects against crushing and maintains cake integrity

## Delivery Times and Costs

Understanding delivery options helps you plan the perfect surprise:

### Standard Delivery
- **Free UK Delivery** - Included on all cake by post orders
- **2-3 Working Days** - Typical delivery time for UK mainland
- **Tracking Included** - Full tracking information provided for peace of mind

## Perfect Occasions for Cake by Post

Cake by post is perfect for various occasions when you can't be there in person:

### Birthdays
Surprise someone on their special day with a delicious birthday cake delivered straight to their door.

### Anniversaries
Celebrate anniversaries and milestones with a romantic cake delivery, even from afar.

### Just Because
Sometimes the best surprises are unexpected. Brighten someone's day with a thoughtful cake delivery.

### Holidays
Send festive cheer with holiday-themed cakes for Christmas, Easter, and other celebrations.

## Tips for Successful Cake Delivery

Follow these expert tips to ensure your cake by post delivery is successful:

- **Provide Accurate Address** - Double-check the recipient's address and include any special delivery instructions
- **Consider Timing** - Order 3-5 days in advance to ensure delivery on the desired date
- **Check Letterbox Size** - Ensure the recipient has a standard-sized letterbox for delivery
- **Include a Personal Note** - Add a personal message to make the surprise even more special

## Frequently Asked Questions

**How long does cake by post stay fresh?**
Our vacuum-packed cakes stay fresh for up to 7 days when stored properly. We recommend consuming within 3-4 days for the best taste experience.

**Do you deliver to all UK addresses?**
Yes, we deliver our cake by post service to all UK mainland addresses with free standard delivery. We also offer international shipping for special occasions.

**What if the recipient isn't home?**
That's the beauty of cake by post! Our packaging is designed to fit through standard letterboxes, so delivery is guaranteed even when no one is home.

**Can I track my cake delivery?**
Absolutely! We provide full tracking information for all cake by post deliveries, so you can monitor your order from dispatch to delivery.

Ready to send cake by post? Surprise someone special with our traditional Ukrainian honey cake delivered straight to their door.`
  },
  {
    slug: 'how-surprise-someone-cake-delivery-post',
    title: 'How to Surprise Someone with Cake Delivery by Post UK | Postal Cake Ideas Leeds',
    excerpt: 'Creative ideas how to surprise your loved ones with cake delivery by post. Some tips from my experience to make special moments more memorable with postal cake surprises. Perfect for birthdays, anniversaries, and special occasions.',
    category: 'Cake by Post',
    readTime: '10 min read',
    status: 'published',
    featured: false,
    publishDate: '2025-09-17T10:00:00.000Z',
    author: {
      name: 'Olgish Cakes',
      image: null
    },
    description: 'Learn creative ways to surprise someone with cake delivery by post in the UK. Discover unique postal cake ideas and how to make special moments memorable.',
    seoTitle: 'How to Surprise Someone with Cake Delivery by Post UK | Postal Cake Ideas Leeds',
    seoDescription: 'Creative ideas how to surprise your loved ones with cake delivery by post. Some tips from my experience to make special moments more memorable with postal cake surprises.',
    keywords: [
      'surprise honey cake delivery',
      'honey cake delivery surprise ideas',
      'how to surprise someone with honey cake',
      'birthday honey cake surprise',
      'anniversary honey cake delivery',
      'surprise honey cake by post',
      'creative honey cake delivery',
      'honey cake surprise tips',
      'letterbox honey cake surprise',
      'honey cake delivery timing'
    ],
    content: `There's something special about surprising someone with traditional Ukrainian honey cake delivered to their door. Whether it's birthday, anniversary, or just because you care, honey cake delivery by post is perfect way to show someone you think about them. Here's my guide to creating nice honey cake surprises, from my experience.

## Perfect Timing for Cake Surprises

Timing is very important for cake surprises. Right timing makes surprise more special, but wrong timing can spoil the moment. From my experience, here's how to get it right:

### Birthday Surprises
**Best timing:** Morning delivery (9-11 AM) for breakfast surprise, or afternoon (2-4 PM) for tea time.
**Pro tip:** Order 2-3 days in advance to ensure delivery on the exact day.

### Anniversary Surprises
**Best timing:** Evening delivery (5-7 PM) for romantic dinner surprise.
**Pro tip:** Coordinate with their partner for the perfect romantic moment.

### Just Because Surprises
**Best timing:** Mid-week delivery to brighten up a regular day.
**Pro tip:** Choose a day when you know they'll be home to enjoy it.

### Achievement Celebrations
**Best timing:** Same day or next day after the achievement.
**Pro tip:** Include a congratulatory message in the delivery.

## Creative Surprise Ideas by Occasion

Different occasions call for different approaches. Here are creative ideas tailored to specific celebrations:

### Birthday Surprises
- **Morning surprise with coffee** - Deliver the cake early morning with a note suggesting they enjoy it with their morning coffee
- **Countdown surprise** - Send a small cake each day leading up to their birthday, with the main cake on the actual day
- **Virtual party coordination** - Coordinate with friends to have everyone send cakes for a virtual birthday celebration

### Anniversary Surprises
- **Memory lane cake** - Choose a cake flavor that reminds them of your first date or special memory
- **Year-by-year tradition** - Start a tradition of sending a special cake each anniversary with a note about that year
- **Surprise dinner setup** - Coordinate with their partner to have the cake arrive just before a romantic dinner

### Just Because Surprises
- **Mid-week pick-me-up** - Surprise them on a Wednesday to break up the work week
- **Weather-based surprise** - Send a warm, comforting cake on a cold, rainy day
- **Achievement celebration** - Celebrate small wins like completing a project or reaching a goal

## Personal Touches That Make It Special

The personal touches you add can transform a simple cake delivery into an unforgettable surprise. Here are ways to make your cake surprise truly special:

### Personal Messages
Write a heartfelt note that explains why you're sending the cake and what they mean to you.
**Examples:** "Because you make every day brighter" or "Celebrating your amazing achievement"

### Special Packaging
Choose special packaging or add decorative elements to make the delivery extra special.
**Ideas:** Ribbon, confetti, or a small gift alongside the cake

### Photo Memories
Include a photo of a special memory or moment you shared together.
**Tip:** Print a small photo and include it with the delivery

### Coordinated Surprise
Coordinate with friends or family to create a bigger surprise moment.
**Example:** Have everyone call or video chat when the cake arrives

## Choosing the Right Cake for the Surprise

The cake you choose can make or break the surprise. Consider their preferences, dietary restrictions, and the occasion when selecting the perfect cake:

- **Consider their favorite flavors** - Think about what they usually order or mention enjoying
- **Check for dietary restrictions** - Ensure the cake is suitable for any allergies or dietary preferences
- **Match the occasion** - Choose a cake that fits the celebration (elegant for anniversaries, fun for birthdays)
- **Consider portion size** - Make sure the cake size is appropriate for them and any guests

## Coordinating with Family and Friends

Sometimes the best surprises involve coordinating with others. Here's how to work with family and friends to create an even more memorable honey cake surprise:

- **Coordinate delivery timing with family members** - Make sure everyone knows when the cake will arrive
- **Plan a group video call or celebration** - Have everyone join in when the cake arrives
- **Share the surprise moment** - Capture photos or videos of their reaction
- **Create a group celebration** - Turn the surprise into a shared experience

## Follow-Up Ideas to Extend the Joy

The surprise doesn't have to end when the cake arrives. Here are some follow-up ideas to extend the joy and make the experience even more memorable:

### Follow-Up Call
Call them after the cake arrives to hear about their reaction and share in their excitement.

### Share Photos
Ask them to share photos of the cake and their reaction to create lasting memories.

## Common Mistakes to Avoid

Learn from common mistakes to ensure your cake surprise goes perfectly:

### Common Mistakes to Avoid:
- **Not checking their schedule** - Make sure they'll be home to receive and enjoy the cake
- **Forgetting dietary restrictions** - Always check for allergies or dietary preferences before ordering
- **Poor timing** - Avoid sending cakes during busy periods or when they're away
- **Generic messages** - Personalize your message to make it meaningful and special
- **Not following up** - Check in after the delivery to see how they enjoyed their surprise

Ready to create the perfect cake surprise? Use our expert tips to create unforgettable cake delivery surprises that will make someone's day extra special.`
  },
  {
    slug: 'top-5-reasons-order-letterbox-cakes-online',
    title: 'Why Order Letterbox Cakes Online UK 2025 | Best Postal Cake Delivery Leeds',
    excerpt: 'Why letterbox cakes are becoming more popular choice for many customers. Discover the benefits of ordering cakes online for postal delivery from my experience. Convenient, fresh, and perfect for any occasion.',
    category: 'Cake by Post',
    readTime: '8 min read',
    status: 'published',
    featured: false,
    publishDate: '2025-09-17T10:00:00.000Z',
    author: {
      name: 'Olgish Cakes',
      image: null
    },
    description: 'Discover why letterbox cakes are becoming the popular choice for customers. Learn about the benefits of ordering cakes online for postal delivery from real experience.',
    seoTitle: 'Why Order Letterbox Cakes Online UK 2025 | Best Postal Cake Delivery Leeds',
    seoDescription: 'Why letterbox cakes are becoming more popular choice for many customers. Discover the benefits of ordering cakes online for postal delivery from my experience.',
    keywords: [
      'honey cake by post online',
      'honey cake delivery benefits',
      'order honey cake online UK',
      'honey cake postal delivery',
      'honey cake letterbox advantages',
      'honey cake delivery convenience',
      'surprise honey cake delivery',
      'online honey cake ordering',
      'honey cake by post service',
      'letterbox friendly honey cake'
    ],
    content: `When I started my cake business in Leeds, I never thought about sending cakes by post. But customers kept asking me, and now I see why letterbox cake delivery is so popular. Here are the main reasons why more people choose to order cakes by post online instead of normal delivery.

## 1. Ultimate Convenience - No Need to Be Home

Traditional cake delivery requires someone to be home to receive the order. With letterbox cakes, this limitation is completely eliminated. Your cake arrives directly through the letterbox, ensuring it's delivered even when no one is home.

### Why This Matters:
- No missed deliveries or rescheduling needed
- Perfect for busy professionals and families
- Works around your schedule, not the other way around
- Ideal for surprise deliveries

This convenience factor alone has made letterbox cakes the preferred choice for many customers, especially those with unpredictable schedules or who want to surprise someone without them knowing.

## 2. Perfect Surprise Factor

There's something magical about discovering a beautifully packaged cake in your letterbox. The surprise element is unmatched, making letterbox cakes perfect for special occasions, birthdays, anniversaries, or just because moments.

### Unexpected Joy
The element of surprise creates lasting memories and special moments.

### Perfect Timing
Arrive exactly when you want them, without spoiling the surprise.

Whether it's a birthday surprise, anniversary celebration, or just a thoughtful gesture, letterbox cakes deliver the perfect amount of surprise and delight.

## 3. Superior Quality and Freshness

Letterbox cakes are specifically designed for postal delivery, which means they're made with quality ingredients and traditional recipes that maintain their taste and texture during transport.

- **Traditional recipes with natural preservatives** - Honey, sugar, and traditional baking methods ensure longevity
- **Vacuum-sealed packaging maintains freshness** - Professional packaging prevents air exposure and contamination
- **Dense, moist textures that don't crumble** - Specially formulated recipes for postal delivery
- **No artificial preservatives needed** - Natural ingredients and traditional methods preserve quality

The quality of letterbox cakes often exceeds that of traditional cake delivery because they're specifically engineered for the postal journey, ensuring they arrive in perfect condition.

## 4. Cost-Effective and Reliable

Letterbox cake delivery offers excellent value for money with reliable service and no additional delivery fees or scheduling complications.

### No Extra Fees
Standard postage included in the price

### Reliable Delivery
Royal Mail's proven postal system

### No Scheduling
No need to coordinate delivery times

The simplicity of letterbox delivery means fewer complications, lower costs, and a more reliable service overall.

## 5. Eco-Friendly and Sustainable

Letterbox cake delivery is more environmentally friendly than traditional delivery methods, using existing postal infrastructure and efficient packaging.

### Environmental Benefits:
- Uses existing postal routes - no additional vehicle emissions
- Efficient packaging reduces waste
- No failed delivery attempts or redeliveries
- Consolidated delivery reduces carbon footprint

By choosing letterbox delivery, you're making an environmentally conscious choice that reduces the overall carbon footprint of your cake delivery.

## How to Get Started with Letterbox Cakes

Ready to experience the benefits of letterbox cake delivery? Here's how to get started:

1. **Browse our letterbox-friendly cake selection** - Choose from our specially curated collection of postal cakes
2. **Select your preferred delivery date** - Choose when you want the cake to arrive
3. **Add a personal message (optional)** - Include a special note to make it even more personal
4. **Place your order and track delivery** - We'll send you tracking information and delivery confirmation

Experience letterbox cake delivery today! Join thousands of satisfied customers who have discovered the convenience and joy of letterbox cake delivery.`
  }
];

async function createBlogPosts() {
  console.log('🚀 Starting to convert articles to Sanity blog posts...');
  
  for (const article of articles) {
    try {
      console.log(`📝 Creating blog post: ${article.title}`);
      
      const response = await fetch('http://localhost:3000/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Successfully created: ${article.title} (ID: ${result.id})`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to create ${article.title}:`, error);
      }
    } catch (error) {
      console.error(`❌ Error creating ${article.title}:`, error.message);
    }
  }
  
  console.log('🎉 Article conversion completed!');
}

// Run the script
createBlogPosts().catch(console.error);
