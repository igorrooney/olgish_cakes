import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  try {
    // Fetch cakes
    const cakes = await serverClient.fetch(`
      *[_type == "cake"] {
        _id,
        name,
        size,
        pricing,
        category,
        slug,
        order
      } | order(order asc, _createdAt desc)
    `);

    // Fetch gift hampers
    const giftHampers = await serverClient.fetch(`
      *[_type == "giftHamper"] {
        _id,
        name,
        price,
        category,
        slug,
        order
      } | order(order asc, _createdAt desc)
    `);

    // Transform data for easier use in the frontend
    const products = [
      ...cakes.map((cake: any) => ({
        id: cake._id,
        name: cake.name,
        type: 'cake',
        category: cake.category,
        size: cake.size,
        pricing: cake.pricing,
        slug: cake.slug?.current || '',
        displayName: `${cake.name} (${cake.size} inch)`,
        standardPrice: cake.pricing?.standard || 0,
        individualPrice: cake.pricing?.individual || 0,
      })),
      ...giftHampers.map((hamper: any) => ({
        id: hamper._id,
        name: hamper.name,
        type: 'gift-hamper',
        category: hamper.category,
        price: hamper.price || 0,
        slug: hamper.slug?.current || '',
        displayName: hamper.name,
        standardPrice: hamper.price || 0,
        individualPrice: hamper.price || 0,
      })),
    ];

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
