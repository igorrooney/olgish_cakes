import { createClient as createSanityClient } from "@sanity/client";
import dotenv from "dotenv";
import path from "path";

interface SanityImage {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
}

interface SanitySlug {
  _type: "slug";
  current: string;
}

interface CakePricing {
  standard: number;
  individual: number;
}

interface CakeDesigns {
  standard: never[];
  individual: never[];
}

interface Cake {
  _type: "cake";
  name: string;
  slug: SanitySlug;
  description: string;
  size: string;
  pricing: CakePricing;
  designs: CakeDesigns;
  category: string;
  ingredients: string[];
  allergens: string[];
  images: SanityImage[];
}

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing required environment variables. Please check your .env.local file.");
  process.exit(1);
}

const sanityClient = createSanityClient({
  projectId,
  dataset,
  apiVersion: "2024-03-31",
  token,
  useCdn: false,
});

const cakes: Cake[] = [
  {
    _type: "cake",
    name: "Classic Vanilla",
    slug: {
      _type: "slug",
      current: "classic-vanilla",
    },
    description: "A timeless vanilla cake with buttercream frosting",
    size: "medium",
    pricing: {
      standard: 45,
      individual: 55,
    },
    designs: {
      standard: [],
      individual: [],
    },
    category: "classic",
    ingredients: ["Vanilla", "Butter", "Sugar", "Flour", "Eggs"],
    allergens: ["Eggs", "Dairy", "Gluten"],
    images: [
      {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-1",
        },
      },
    ],
  },
  {
    _type: "cake",
    name: "Chocolate Fudge",
    slug: {
      _type: "slug",
      current: "chocolate-fudge",
    },
    description: "Rich chocolate cake with fudge filling",
    size: "medium",
    pricing: {
      standard: 50,
      individual: 60,
    },
    designs: {
      standard: [],
      individual: [],
    },
    category: "chocolate",
    ingredients: ["Chocolate", "Butter", "Sugar", "Flour", "Eggs"],
    allergens: ["Eggs", "Dairy", "Gluten"],
    images: [
      {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-2",
        },
      },
    ],
  },
  {
    _type: "cake",
    name: "Kyiv Cake",
    slug: {
      _type: "slug",
      current: "kyiv-cake",
    },
    description:
      "The legendary Kyiv Cake - a beloved Ukrainian dessert featuring crispy meringue layers with hazelnuts, filled with a rich chocolate-buttercream frosting. Each bite is a perfect harmony of crunchy and creamy textures.",
    size: "8",
    pricing: {
      standard: 45,
      individual: 55,
    },
    designs: {
      standard: [],
      individual: [],
    },
    category: "traditional",
    ingredients: ["Meringue", "Hazelnuts", "Chocolate", "Buttercream", "Eggs", "Sugar"],
    allergens: ["eggs", "nuts", "milk"],
    images: [
      {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-3",
        },
      },
    ],
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
    size: "8",
    pricing: {
      standard: 40,
      individual: 50,
    },
    designs: {
      standard: [],
      individual: [],
    },
    category: "traditional",
    ingredients: ["Honey", "Flour", "Sour Cream", "Butter", "Eggs", "Sugar"],
    allergens: ["gluten", "eggs", "milk"],
    images: [
      {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-4",
        },
      },
    ],
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
    size: "8",
    pricing: {
      standard: 42,
      individual: 52,
    },
    designs: {
      standard: [],
      individual: [],
    },
    category: "traditional",
    ingredients: ["Puff Pastry", "Milk", "Vanilla", "Eggs", "Butter", "Flour"],
    allergens: ["gluten", "eggs", "milk"],
    images: [
      {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-5",
        },
      },
    ],
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
    size: "8",
    pricing: {
      standard: 35,
      individual: 45,
    },
    designs: {
      standard: [],
      individual: [],
    },
    category: "traditional",
    ingredients: ["Poppy Seeds", "Yeast Dough", "Milk", "Butter", "Eggs", "Sugar"],
    allergens: ["gluten", "eggs", "milk"],
    images: [
      {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-6",
        },
      },
    ],
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
    size: "8",
    pricing: {
      standard: 38,
      individual: 48,
    },
    designs: {
      standard: [],
      individual: [],
    },
    category: "traditional",
    ingredients: ["Cherries", "Sponge Cake", "Vanilla Cream", "Eggs", "Flour", "Sugar"],
    allergens: ["gluten", "eggs", "milk"],
    images: [
      {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-7",
        },
      },
    ],
  },
];

async function seedCakes() {
  try {
    const transactions = cakes.map(cake => ({
      create: cake,
    }));

    await sanityClient.transaction(transactions).commit();
    console.log("Successfully seeded cakes!");
  } catch (error) {
    console.error("Error seeding cakes:", error);
    process.exit(1);
  }
}

seedCakes();
