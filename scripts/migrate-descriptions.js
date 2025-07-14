import { createClient } from "@sanity/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false, // We need to write data, so disable CDN
  token: process.env.SANITY_API_TOKEN, // You'll need a write token
});

async function migrateDescriptions() {
  try {
    console.log("Starting description migration...");

    // Check if we have the required token
    if (!process.env.SANITY_API_TOKEN) {
      console.error("❌ SANITY_API_TOKEN environment variable is required for migration");
      console.log("Please add your Sanity write token to your .env file:");
      console.log("SANITY_API_TOKEN=your_write_token_here");
      return;
    }

    // Fetch all cakes with text descriptions
    const cakes = await client.fetch(`
      *[_type == "cake" && typeof(description) == "string"] {
        _id,
        name,
        description
      }
    `);

    console.log(`Found ${cakes.length} cakes with text descriptions to migrate`);

    if (cakes.length === 0) {
      console.log("No cakes with string descriptions found. Migration not needed.");
      return;
    }

    // Convert each text description to rich text blocks
    for (const cake of cakes) {
      const richTextBlocks = [
        {
          _type: "block",
          style: "normal",
          children: [
            {
              _type: "span",
              text: cake.description,
              marks: [],
            },
          ],
          markDefs: [],
        },
      ];

      // Update the document
      await client.patch(cake._id).set({ description: richTextBlocks }).commit();

      console.log(`✅ Migrated description for: ${cake.name}`);
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

// Run the migration
migrateDescriptions();
