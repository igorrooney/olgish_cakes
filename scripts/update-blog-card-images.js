import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.local' });

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31',
});

async function updateBlogCardImages() {
  try {
    console.log('Fetching all blog posts...');
    
    // Get all published blog posts
    const posts = await client.fetch(`
      *[_type == "blogPost" && defined(slug.current)] {
        _id,
        title,
        slug,
        featuredImage,
        cardImage
      }
    `);

    console.log(`Found ${posts.length} blog posts`);

    for (const post of posts) {
      try {
        console.log(`Processing: ${post.title}`);
        
        // Check if the post already has a cardImage
        if (post.cardImage) {
          console.log(`  ✓ Already has card image: ${post.title}`);
          continue;
        }

        // If no cardImage but has featuredImage, copy featuredImage to cardImage
        if (post.featuredImage && !post.cardImage) {
          console.log(`  → Copying featured image to card image for: ${post.title}`);
          
          await client
            .patch(post._id)
            .set({ 
              cardImage: post.featuredImage 
            })
            .commit();

          console.log(`  ✓ Updated: ${post.title}`);
        } else {
          console.log(`  ⚠ No images found for: ${post.title}`);
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ✗ Error updating ${post.title}:`, error.message);
      }
    }

    console.log('✅ Card image update completed!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
updateBlogCardImages();
