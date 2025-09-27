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

const DATABASE_ID = 'olgish_cakes_db';

// Collection definitions
const collections = [
  {
    id: 'users_private',
    name: 'Users Private',
    permissions: ['read("user")', 'write("user")', 'read("admin")', 'write("admin")'],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true, array: false },
      { key: 'name', type: 'string', size: 255, required: false, array: false },
      { key: 'phone', type: 'string', size: 20, required: false, array: false },
      { key: 'role', type: 'enum', elements: ['CUSTOMER', 'ADMIN', 'STAFF'], required: true, array: false },
      { key: 'deletedAt', type: 'datetime', required: false, array: false },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'role', type: 'key', attributes: ['role'] },
    ],
  },
  {
    id: 'addresses',
    name: 'Addresses',
    permissions: ['read("user")', 'write("user")', 'read("admin")', 'write("admin")'],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true, array: false },
      { key: 'label', type: 'string', size: 100, required: true, array: false },
      { key: 'line1', type: 'string', size: 255, required: true, array: false },
      { key: 'line2', type: 'string', size: 255, required: false, array: false },
      { key: 'city', type: 'string', size: 100, required: true, array: false },
      { key: 'county', type: 'string', size: 100, required: false, array: false },
      { key: 'postcode', type: 'string', size: 10, required: true, array: false },
      { key: 'country', type: 'string', size: 2, required: true, array: false },
      { key: 'isDefault', type: 'boolean', required: true, array: false },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'userId_isDefault', type: 'key', attributes: ['userId', 'isDefault'] },
    ],
  },
  {
    id: 'categories',
    name: 'Categories',
    permissions: ['read("any")', 'write("admin")'],
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true, array: false },
      { key: 'slug', type: 'string', size: 100, required: true, array: false },
    ],
    indexes: [
      { key: 'slug', type: 'unique', attributes: ['slug'] },
    ],
  },
  {
    id: 'products',
    name: 'Products',
    permissions: ['read("any")', 'write("admin")'],
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true, array: false },
      { key: 'slug', type: 'string', size: 255, required: true, array: false },
      { key: 'description', type: 'string', size: 1000, required: true, array: false },
      { key: 'priceGBP', type: 'integer', size: 10, required: true, array: false },
      { key: 'isGiftHamper', type: 'boolean', required: true, array: false },
      { key: 'stripePriceId', type: 'string', size: 255, required: false, array: false },
      { key: 'categoryId', type: 'string', size: 255, required: false, array: false },
      { key: 'images', type: 'string', size: 1000, required: false, array: true },
      { key: 'isActive', type: 'boolean', required: true, array: false },
    ],
    indexes: [
      { key: 'slug', type: 'unique', attributes: ['slug'] },
      { key: 'isGiftHamper', type: 'key', attributes: ['isGiftHamper'] },
      { key: 'isActive', type: 'key', attributes: ['isActive'] },
      { key: 'categoryId', type: 'key', attributes: ['categoryId'] },
    ],
  },
  {
    id: 'orders',
    name: 'Orders',
    permissions: ['read("user")', 'write("admin")'],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true, array: false },
      { key: 'status', type: 'enum', elements: ['PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED'], required: true, array: false },
      { key: 'subtotalGBP', type: 'integer', size: 10, required: true, array: false },
      { key: 'totalGBP', type: 'integer', size: 10, required: true, array: false },
      { key: 'currency', type: 'string', size: 3, required: true, array: false },
      { key: 'paymentIntentId', type: 'string', size: 255, required: false, array: false },
      { key: 'stripeCheckoutSessionId', type: 'string', size: 255, required: true, array: false },
      { key: 'email', type: 'string', size: 255, required: true, array: false },
      { key: 'shippingName', type: 'string', size: 255, required: true, array: false },
      { key: 'shippingAddress', type: 'string', size: 1000, required: true, array: false },
    ],
    indexes: [
      { key: 'userId', type: 'key', attributes: ['userId'] },
      { key: 'status', type: 'key', attributes: ['status'] },
      { key: 'stripeCheckoutSessionId', type: 'unique', attributes: ['stripeCheckoutSessionId'] },
      { key: 'userId_createdAt', type: 'key', attributes: ['userId', '$createdAt'] },
    ],
  },
  {
    id: 'order_items',
    name: 'Order Items',
    permissions: ['read("user")', 'write("admin")'],
    attributes: [
      { key: 'orderId', type: 'string', size: 255, required: true, array: false },
      { key: 'productId', type: 'string', size: 255, required: true, array: false },
      { key: 'name', type: 'string', size: 255, required: true, array: false },
      { key: 'unitPriceGBP', type: 'integer', size: 10, required: true, array: false },
      { key: 'quantity', type: 'integer', size: 5, required: true, array: false },
      { key: 'image', type: 'string', size: 500, required: false, array: false },
    ],
    indexes: [
      { key: 'orderId', type: 'key', attributes: ['orderId'] },
      { key: 'productId', type: 'key', attributes: ['productId'] },
    ],
  },
];

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Appwrite database and collections...');

    // Check if database exists
    let database;
    try {
      database = await databases.get(DATABASE_ID);
      console.log(`✅ Database '${DATABASE_ID}' already exists`);
    } catch (error) {
      // Create database if it doesn't exist
      database = await databases.create(DATABASE_ID, 'Olgish Cakes Database');
      console.log(`✅ Created database '${DATABASE_ID}'`);
    }

    // Create collections
    for (const collection of collections) {
      try {
        const existingCollection = await databases.getCollection(DATABASE_ID, collection.id);
        console.log(`✅ Collection '${collection.id}' already exists`);
        
        // Update permissions if needed
        try {
          await databases.updateCollection(
            DATABASE_ID,
            collection.id,
            collection.name,
            collection.permissions
          );
          console.log(`✅ Updated permissions for collection '${collection.id}'`);
        } catch (permError) {
          console.log(`⚠️  Could not update permissions for '${collection.id}':`, permError.message);
        }
      } catch (error) {
        // Create collection if it doesn't exist
        await databases.createCollection(
          DATABASE_ID,
          collection.id,
          collection.name,
          collection.permissions
        );
        console.log(`✅ Created collection '${collection.id}'`);
      }

      // Create attributes
      for (const attr of collection.attributes) {
        try {
          await databases.createStringAttribute(
            DATABASE_ID,
            collection.id,
            attr.key,
            attr.size || 255,
            attr.required,
            attr.array || false
          );
          console.log(`  ✅ Added string attribute '${attr.key}' to '${collection.id}'`);
        } catch (attrError) {
          if (attrError.message.includes('already exists')) {
            console.log(`  ⚠️  Attribute '${attr.key}' already exists in '${collection.id}'`);
          } else {
            console.log(`  ❌ Error adding attribute '${attr.key}' to '${collection.id}':`, attrError.message);
          }
        }
      }

      // Create indexes
      for (const index of collection.indexes) {
        try {
          await databases.createIndex(
            DATABASE_ID,
            collection.id,
            index.key,
            index.type,
            index.attributes
          );
          console.log(`  ✅ Added index '${index.key}' to '${collection.id}'`);
        } catch (indexError) {
          if (indexError.message.includes('already exists')) {
            console.log(`  ⚠️  Index '${index.key}' already exists in '${collection.id}'`);
          } else {
            console.log(`  ❌ Error adding index '${index.key}' to '${collection.id}':`, indexError.message);
          }
        }
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env.local file with the collection IDs');
    console.log('2. Create some sample products in the products collection');
    console.log('3. Test the authentication flow');
    console.log('4. Set up Stripe products and update stripePriceId in products');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();


