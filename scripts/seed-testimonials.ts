import { client } from "../sanity/lib/client";

const testimonials = [
  {
    _type: "testimonial",
    customerName: "Emma W.",
    cakeType: "Wedding Cake",
    rating: 5,
    date: "2024-02-15",
    text: "Our wedding cake was absolutely stunning! The intricate floral details were exactly what we wanted, and the taste was divine. Every guest commented on how delicious it was. Thank you for making our special day even more memorable!",
    source: "instagram",
  },
  {
    _type: "testimonial",
    customerName: "Michael R.",
    cakeType: "Birthday Cake",
    rating: 5,
    date: "2024-02-10",
    text: "Ordered a birthday cake for my daughter and it exceeded all expectations! The design was perfect and the taste was incredible. The Ukrainian honey layers were something special - unlike anything we've had before.",
    source: "facebook",
  },
  {
    _type: "testimonial",
    customerName: "Sarah L.",
    cakeType: "Custom Cake",
    rating: 5,
    date: "2024-01-28",
    text: "I ordered a custom cake for my mother's 60th birthday and it was perfect! The attention to detail was amazing, and the Ukrainian flavors brought back wonderful memories. Everyone loved it!",
    source: "google",
  },
  {
    _type: "testimonial",
    customerName: "David P.",
    cakeType: "Anniversary Cake",
    rating: 5,
    date: "2024-01-20",
    text: "The anniversary cake was beautiful and delicious! The combination of traditional Ukrainian recipes with modern design made it unique. The service was excellent from start to finish.",
    source: "direct",
  },
  {
    _type: "testimonial",
    customerName: "Sophie T.",
    cakeType: "Birthday Cake",
    rating: 5,
    date: "2024-01-15",
    text: "Best cake I've ever had in Leeds! The honey layers were perfectly balanced, and the decoration was stunning. Will definitely order again!",
    source: "google",
  },
  {
    _type: "testimonial",
    customerName: "James H.",
    cakeType: "Wedding Cake",
    rating: 5,
    date: "2024-01-05",
    text: "Our wedding cake was the talk of the reception! Not only was it visually stunning, but the taste was incredible. The Ukrainian honey cake layers were a unique touch that everyone loved.",
    source: "instagram",
  },
  {
    _type: "testimonial",
    customerName: "Anna M.",
    cakeType: "Custom Cake",
    rating: 5,
    date: "2023-12-28",
    text: "Ordered a custom cake for a family celebration and it was perfect! The flavors were amazing and the decoration was exactly what I wanted. Professional service from start to finish.",
    source: "facebook",
  },
  {
    _type: "testimonial",
    customerName: "Rachel K.",
    cakeType: "Birthday Cake",
    rating: 5,
    date: "2023-12-20",
    text: "The birthday cake was absolutely amazing! Everyone at the party was asking where it was from. The Ukrainian twist on traditional flavors made it really special.",
    source: "google",
  },
];

async function seedTestimonials() {
  console.log("🌱 Seeding test testimonials...");

  try {
    for (const testimonial of testimonials) {
      await client.create(testimonial);
      console.log(`✅ Created testimonial for ${testimonial.customerName}`);
    }

    console.log("✨ Finished seeding testimonials!");
  } catch (error) {
    console.error("Error seeding testimonials:", error);
  }
}

seedTestimonials();
