require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@sanity/client");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-03-31",
  token: process.env.SANITY_API_TOKEN, // You'll need this
  useCdn: false,
});

const cakes = [
  {
    _type: "cake",
    name: "Kyiv Cake",
    slug: {
      _type: "slug",
      current: "kyiv-cake",
    },
    description:
      "The legendary Kyiv Cake - a beloved Ukrainian dessert featuring crispy meringue layers with hazelnuts, filled with a rich chocolate-buttercream frosting. Each bite is a perfect harmony of crunchy and creamy textures.",
    price: 45,
    category: "traditional",
    ingredients: ["Meringue", "Hazelnuts", "Chocolate", "Buttercream", "Eggs", "Sugar"],
    allergens: ["eggs", "nuts", "milk"],
  },
  {
    _type: "cake",
    name: "Honey Cake (Medovik)",
    slug: {
      _type: "slug",
      current: "honey-cake-medovik",
    },
    description:
      "Traditional Ukrainian Honey Cake (Medovik) with delicate honey-infused layers and smooth sour cream filling. This cake is known for its melt-in-your-mouth texture and rich honey flavor.",
    price: 40,
    category: "traditional",
    ingredients: ["Honey", "Flour", "Sour Cream", "Butter", "Eggs", "Sugar"],
    allergens: ["gluten", "eggs", "milk"],
  },
  {
    _type: "cake",
    name: "Napoleon Cake",
    slug: {
      _type: "slug",
      current: "napoleon-cake",
    },
    description:
      "A Ukrainian take on the classic Napoleon cake with multiple layers of flaky puff pastry and rich vanilla custard cream. Each slice reveals beautiful layers that tell a story of culinary craftsmanship.",
    price: 42,
    category: "traditional",
    ingredients: ["Puff Pastry", "Milk", "Vanilla", "Eggs", "Butter", "Flour"],
    allergens: ["gluten", "eggs", "milk"],
  },
  {
    _type: "cake",
    name: "Poppy Seed Roll (Makivnyk)",
    slug: {
      _type: "slug",
      current: "poppy-seed-roll",
    },
    description:
      "Traditional Ukrainian Poppy Seed Roll (Makivnyk) - a soft yeast dough filled with a generous layer of sweetened poppy seed filling. A perfect balance of soft bread and rich filling.",
    price: 35,
    category: "traditional",
    ingredients: ["Poppy Seeds", "Yeast Dough", "Milk", "Butter", "Eggs", "Sugar"],
    allergens: ["gluten", "eggs", "milk"],
  },
  {
    _type: "cake",
    name: "Cherry Cake (Vyshnevyi)",
    slug: {
      _type: "slug",
      current: "cherry-cake",
    },
    description:
      "A delightful Ukrainian Cherry Cake featuring layers of soft sponge cake filled with sweet-tart cherry filling and topped with vanilla cream. Made with fresh Ukrainian cherries when in season.",
    price: 38,
    category: "traditional",
    ingredients: ["Cherries", "Sponge Cake", "Vanilla Cream", "Eggs", "Flour", "Sugar"],
    allergens: ["gluten", "eggs", "milk"],
  },
];

async function seedCakes() {
  console.log("Seeding cakes...");
  try {
    for (const cake of cakes) {
      const result = await client.create(cake);
      console.log(`Created cake: ${cake.name} with ID: ${result._id}`);
    }
    console.log("Seeding completed!");
  } catch (error: any) {
    console.error("Error seeding cakes:", error);
    // Log more detailed error information
    if (error.response) {
      console.error("Response details:", error.response.body);
    }
  }
}

seedCakes();
