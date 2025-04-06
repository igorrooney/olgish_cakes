const { createClient } = require("@sanity/client");
require("dotenv").config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing required environment variables. Please check your .env.local file.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-03-31",
  token,
  useCdn: false,
});

// Original prices from seed data
const cakePrices: Record<string, number> = {
  "kyiv-cake": 45,
  "honey-cake-medovik": 40,
  "napoleon-cake": 42,
  "poppy-seed-roll": 35,
  "cherry-cake": 38,
};

async function updateCakes() {
  console.log("Fetching existing cakes...");

  try {
    // Fetch all cakes
    const cakes = await client.fetch(`*[_type == "cake"]`);

    if (!cakes || cakes.length === 0) {
      console.log("No cakes found in the database.");
      return;
    }

    console.log(`Found ${cakes.length} cakes to update`);

    for (const cake of cakes) {
      const originalPrice = cakePrices[cake.slug.current] || 40; // Default to 40 if not found

      console.log(`Updating ${cake.name} with new size format...`);

      // Update the cake with new size format
      await client
        .patch(cake._id)
        .set({
          size: "8",
          price: originalPrice,
        })
        .unset(["sizes"]) // Remove the old sizes array if it exists
        .commit();

      console.log(`Updated ${cake.name} with size: 8 inch and price: £${originalPrice}`);
    }

    console.log("Update completed successfully!");
  } catch (error) {
    console.error("Error updating cakes:", error);
    process.exit(1);
  }
}

updateCakes();
