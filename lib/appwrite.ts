import { Client, Account, Databases, Storage, Functions } from 'appwrite';

// Appwrite configuration with error handling
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

const client = new Client();

// Only initialize Appwrite if proper config is provided
if (endpoint && projectId && endpoint !== 'https://cloud.appwrite.io/v1' && projectId !== 'placeholder_project_id') {
  client.setEndpoint(endpoint).setProject(projectId);
}

// Server-side client with admin key
const serverClient = new Client();
const apiKey = process.env.APPWRITE_API_KEY;

// Only initialize server client if proper config is provided
if (endpoint && projectId && apiKey && 
    endpoint !== 'https://cloud.appwrite.io/v1' && 
    projectId !== 'placeholder_project_id' && 
    apiKey !== 'placeholder_api_key') {
  serverClient.setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
}

// Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Server-side services
export const serverDatabases = new Databases(serverClient);
export const serverAccount = new Account(serverClient);

// Collection IDs
export const COLLECTIONS = {
  USERS_PRIVATE: process.env.APPWRITE_USERS_PRIVATE_COLLECTION_ID!,
  ADDRESSES: process.env.APPWRITE_ADDRESSES_COLLECTION_ID!,
  PRODUCTS: process.env.APPWRITE_PRODUCTS_COLLECTION_ID!,
  CATEGORIES: process.env.APPWRITE_CATEGORIES_COLLECTION_ID!,
  ORDERS: process.env.APPWRITE_ORDERS_COLLECTION_ID!,
  ORDER_ITEMS: process.env.APPWRITE_ORDER_ITEMS_COLLECTION_ID!,
} as const;

// Database ID
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;

export { client };

