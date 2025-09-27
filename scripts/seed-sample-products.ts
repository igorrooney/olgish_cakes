#!/usr/bin/env tsx

import { Client, Databases } from 'appwrite';

// Configuration
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'olgish_cakes_db';
const PRODUCTS_COLLECTION_ID = process.env.APPWRITE_PRODUCTS_COLLECTION_ID || 'products';
const CATEGORIES_COLLECTION_ID = process.env.APPWRITE_CATEGORIES_COLLECTION_ID || 'categories';

// Sample categories
const categories = [
  {
    name: 'Gift Hampers',
    slug: 'gift-hampers',
  },
  {
    name: 'Traditional Cakes',
    slug: 'traditional-cakes',
  },
  {
    name: 'Seasonal Specials',
    slug: 'seasonal-specials',
  },
];

// Sample products
const products = [
  {
    name: 'Ukrainian Honey Cake Gift Hamper',
    slug: 'ukrainian-honey-cake-gift-hamper',
    description: 'Beautiful gift hamper with traditional Ukrainian honey cake (Medovik). Perfect for special occasions or to send love to someone far away. Includes our signature honey cake, traditional tea, and lovely packaging.',
    priceGBP: 3499, // £34.99 in pence
    isGiftHamper: true,
    stripePriceId: process.env.STRIPE_PRICE_HAMPER_CLASSIC || 'price_placeholder',
    categoryId: 'gift-hampers', // Will be replaced with actual category ID
    images: [
      'https://olgishcakes.co.uk/images/honey-cake-gift-hamper.jpg',
      'https://olgishcakes.co.uk/images/gift-hamper-packaging.jpg',
    ],
    isActive: true,
  },
  {
    name: 'Traditional Medovik (Honey Cake)',
    slug: 'traditional-medovik-honey-cake',
    description: 'Our signature traditional Ukrainian honey cake. Made with authentic recipe passed down through generations. Layers of honey sponge with creamy filling, dusted with walnuts.',
    priceGBP: 2499, // £24.99 in pence
    isGiftHamper: false,
    categoryId: 'traditional-cakes',
    images: [
      'https://olgishcakes.co.uk/images/medovik-honey-cake.jpg',
      'https://olgishcakes.co.uk/images/medovik-slice.jpg',
    ],
    isActive: true,
  },
  {
    name: 'Kyiv Cake Gift Box',
    slug: 'kyiv-cake-gift-box',
    description: 'Classic Kyiv cake in beautiful gift box. Hazelnut meringue with chocolate buttercream, decorated with traditional Ukrainian patterns. Perfect for celebrations.',
    priceGBP: 2899, // £28.99 in pence
    isGiftHamper: true,
    stripePriceId: 'price_kyiv_cake_placeholder',
    categoryId: 'gift-hampers',
    images: [
      'https://olgishcakes.co.uk/images/kyiv-cake-gift-box.jpg',
    ],
    isActive: true,
  },
  {
    name: 'Christmas Honey Cake Special',
    slug: 'christmas-honey-cake-special',
    description: 'Special Christmas edition of our honey cake with festive decorations. Includes seasonal spices and winter-themed presentation. Limited time only!',
    priceGBP: 3199, // £31.99 in pence
    isGiftHamper: true,
    stripePriceId: 'price_christmas_placeholder',
    categoryId: 'seasonal-specials',
    images: [
      'https://olgishcakes.co.uk/images/christmas-honey-cake.jpg',
    ],
    isActive: true,
  },
  {
    name: 'Traditional Kyiv Cake',
    slug: 'traditional-kyiv-cake',
    description: 'Classic Ukrainian Kyiv cake with hazelnut meringue layers and chocolate buttercream. Traditional recipe, modern presentation.',
    priceGBP: 2299, // £22.99 in pence
    isGiftHamper: false,
    categoryId: 'traditional-cakes',
    images: [
      'https://olgishcakes.co.uk/images/kyiv-cake.jpg',
    ],
    isActive: true,
  },
];

async function seedData() {
  try {
    console.log('🌱 Seeding sample data...');

    // Create categories
    const categoryIds: { [key: string]: string } = {};
    
    for (const category of categories) {
      try {
        const result = await databases.createDocument(
          DATABASE_ID,
          CATEGORIES_COLLECTION_ID,
          'unique()',
          category
        );
        categoryIds[category.slug] = result.$id;
        console.log(`✅ Created category: ${category.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          // Find existing category by slug
          const existing = await databases.listDocuments(
            DATABASE_ID,
            CATEGORIES_COLLECTION_ID,
            [`slug=${category.slug}`]
          );
          if (existing.documents.length > 0) {
            categoryIds[category.slug] = existing.documents[0].$id;
            console.log(`✅ Found existing category: ${category.name}`);
          }
        } else {
          console.error(`❌ Error creating category ${category.name}:`, error.message);
        }
      }
    }

    // Create products
    for (const product of products) {
      try {
        // Replace categoryId with actual category ID
        const productData = {
          ...product,
          categoryId: categoryIds[product.categoryId] || null,
        };

        const result = await databases.createDocument(
          DATABASE_ID,
          PRODUCTS_COLLECTION_ID,
          'unique()',
          productData
        );
        console.log(`✅ Created product: ${product.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Product already exists: ${product.name}`);
        } else {
          console.error(`❌ Error creating product ${product.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Sample data seeding completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update Stripe Price IDs in the products');
    console.log('2. Add real product images');
    console.log('3. Test the gift hamper checkout flow');
    console.log('4. Create additional products as needed');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeding
seedData();

