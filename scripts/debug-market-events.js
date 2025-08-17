/**
 * Debug script to check market events data
 * Run with: node scripts/debug-market-events.js
 */

const { createClient } = require("@sanity/client");

// Configure Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  useCdn: false,
  apiVersion: "2024-01-01",
});

async function debugMarketEvents() {
  try {
    console.log("🔍 Checking market events...\n");

    // Fetch all market events
    const allEvents = await client.fetch(`
      *[_type == "marketSchedule"] | order(date asc) {
        _id,
        title,
        slug,
        location,
        date,
        startTime,
        endTime,
        active,
        featured
      }
    `);

    console.log(`📊 Total events found: ${allEvents.length}\n`);

    if (allEvents.length === 0) {
      console.log("❌ No market events found in Sanity");
      console.log("💡 Please add some market events in your Sanity Studio at /studio");
      return;
    }

    // Check each event for required fields
    allEvents.forEach((event, index) => {
      console.log(`📅 Event ${index + 1}: ${event.title || "No title"}`);
      console.log(`   ID: ${event._id}`);
      console.log(`   Slug: ${event.slug?.current || "❌ Missing slug"}`);
      console.log(`   Location: ${event.location || "❌ Missing location"}`);
      console.log(`   Date: ${event.date || "❌ Missing date"}`);
      console.log(
        `   Time: ${event.startTime || "❌ Missing start time"} - ${event.endTime || "❌ Missing end time"}`
      );
      console.log(`   Active: ${event.active ? "✅" : "❌"}`);
      console.log(`   Featured: ${event.featured ? "⭐" : "📍"}`);

      // Check for missing required fields
      const missingFields = [];
      if (!event.title) missingFields.push("title");
      if (!event.slug?.current) missingFields.push("slug");
      if (!event.location) missingFields.push("location");
      if (!event.date) missingFields.push("date");
      if (!event.startTime) missingFields.push("startTime");
      if (!event.endTime) missingFields.push("endTime");

      if (missingFields.length > 0) {
        console.log(`   ⚠️  Missing required fields: ${missingFields.join(", ")}`);
      } else {
        console.log(`   ✅ All required fields present`);
      }
      console.log("");
    });

    // Check featured events specifically
    const featuredEvents = allEvents.filter(event => event.featured && event.active);
    console.log(`⭐ Featured active events: ${featuredEvents.length}`);

    // Check upcoming events
    const today = new Date().toISOString().split("T")[0];
    const upcomingEvents = allEvents.filter(event => {
      return event.date >= today && event.active;
    });
    console.log(`📅 Upcoming active events: ${upcomingEvents.length}`);

    if (upcomingEvents.length === 0) {
      console.log("\n💡 Tips:");
      console.log("   - Make sure your events have dates in the future");
      console.log('   - Ensure events are marked as "Active" in Sanity Studio');
      console.log("   - Check the date format is YYYY-MM-DD");
    }
  } catch (error) {
    console.error("❌ Error fetching market events:", error.message);
    console.log("\n💡 Make sure:");
    console.log("   - Your Sanity environment variables are set correctly");
    console.log("   - Your Sanity project is accessible");
    console.log("   - The marketSchedule schema is deployed");
  }
}

// Run the debug function
debugMarketEvents();
