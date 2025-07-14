import { client } from "../sanity/lib/client";

async function migrateDescriptions() {
  try {
    console.log("Starting description migration...");

    // Fetch all cakes with text descriptions
    const cakes = await client.fetch(`
      *[_type == "cake" && typeof(description) == "string"] {
        _id,
        name,
        description
      }
    `);

    console.log(`Found ${cakes.length} cakes with text descriptions to migrate`);

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

      console.log(`Migrated description for: ${cake.name}`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run the migration
migrateDescriptions();
