import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.local' });

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN, // You'll need to add this to your .env.local
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31',
});

const cakeByPostLink = `**🎂 Ready to try our famous honey cake? [Order our letterbox-friendly cake by post](/gift-hampers/cake-by-post) and taste authentic Ukrainian baking delivered straight to your door!**`;

async function addCakeByPostLinks() {
  try {
    console.log('Fetching all blog posts...');
    
    // Get all published blog posts
    const posts = await client.fetch(`
      *[_type == "blogPost" && defined(slug.current)] {
        _id,
        title,
        slug,
        content
      }
    `);

    console.log(`Found ${posts.length} blog posts`);

    for (const post of posts) {
      try {
        console.log(`Processing: ${post.title}`);
        
        // Check if the link is already in the content
        const contentString = typeof post.content === 'string' 
          ? post.content 
          : JSON.stringify(post.content);
          
        if (contentString.includes('cake-by-post') || contentString.includes('Order our letterbox-friendly cake by post')) {
          console.log(`  ✓ Link already exists in: ${post.title}`);
          continue;
        }

        // Add the link to the content
        let updatedContent;
        if (typeof post.content === 'string') {
          // For markdown content
          updatedContent = post.content + '\n\n' + cakeByPostLink;
        } else {
          // For PortableText content, add as a new block
          const newBlock = {
            _type: 'block',
            _key: `cake-by-post-${Date.now()}`,
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: `cake-by-post-span-${Date.now()}`,
                text: '🎂 Ready to try our famous honey cake? ',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: `cake-by-post-link-${Date.now()}`,
                text: 'Order our letterbox-friendly cake by post',
                marks: ['link']
              },
              {
                _type: 'span',
                _key: `cake-by-post-end-${Date.now()}`,
                text: ' and taste authentic Ukrainian baking delivered straight to your door!',
                marks: ['strong']
              }
            ],
            markDefs: [
              {
                _type: 'link',
                _key: 'cake-by-post-link-def',
                href: '/gift-hampers/cake-by-post'
              }
            ]
          };
          
          updatedContent = [...post.content, newBlock];
        }

        // Update the post
        await client
          .patch(post._id)
          .set({ content: updatedContent })
          .commit();

        console.log(`  ✓ Updated: ${post.title}`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ✗ Error updating ${post.title}:`, error.message);
      }
    }

    console.log('✅ Bulk update completed!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
addCakeByPostLinks();
