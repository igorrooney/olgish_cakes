import { NextRequest, NextResponse } from "next/server";
import { getAllCakes } from "@/app/utils/fetchCakes";
import { getAllGiftHampers } from "@/app/utils/fetchGiftHampers";

// Google Merchant Center Feed Test Endpoint
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const type = url.searchParams.get('type') || 'all'; // all, cakes, hampers

    const [cakes, giftHampers] = await Promise.all([
      getAllCakes(),
      getAllGiftHampers(),
    ]);

    let testProducts = [];
    
    if (type === 'cakes' || type === 'all') {
      testProducts.push(...cakes.slice(0, type === 'cakes' ? limit : Math.ceil(limit / 2)));
    }
    
    if (type === 'hampers' || type === 'all') {
      testProducts.push(...giftHampers.slice(0, type === 'hampers' ? limit : Math.ceil(limit / 2)));
    }

    const baseUrl = "https://olgishcakes.co.uk";
    
    // Generate test XML feed with limited products
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Olgish Cakes - Test Feed (${testProducts.length} products)</title>
    <link>${baseUrl}</link>
    <description>Test feed for Google Merchant Center validation</description>
    <language>en-GB</language>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
    
    ${testProducts.map(product => {
      if (product.pricing) {
        return generateCakeItem(product, baseUrl);
      } else {
        return generateHamperItem(product, baseUrl);
      }
    }).join('\n')}
    
  </channel>
</rss>`;

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache', // Don't cache test feeds
      },
    });

  } catch (error) {
    console.error('Error generating test merchant center feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate test product feed' },
      { status: 500 }
    );
  }
}

// Helper functions (copied from main feed for test endpoint)
function generateCakeItem(cake: any, baseUrl: string): string {
  const productUrl = `${baseUrl}/cakes/${cake.slug.current}`;
  const imageUrl = cake.mainImage?.asset?.url 
    ? (cake.mainImage.asset.url.startsWith('http') 
        ? cake.mainImage.asset.url 
        : `https://cdn.sanity.io${cake.mainImage.asset.url}`)
    : `${baseUrl}/images/placeholder-cake.jpg`;

  const price = cake.pricing?.standard || 25;
  const availability = cake.structuredData?.availability || 'in stock';
  
  return `
    <item>
      <g:id>cake_${cake._id}</g:id>
      <g:title>${escapeXml(cake.name)} - Traditional Ukrainian Honey Cake</g:title>
      <g:description>${escapeXml(cake.shortDescription || cake.description || `Traditional Ukrainian honey cake - ${cake.name}. Handmade with authentic recipes in Leeds.`)}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:price>${price} GBP</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Olgish Cakes</g:brand>
      <g:product_type>Food &amp; Drink &gt; Bakery &gt; Cakes</g:product_type>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items &gt; Baked Goods</g:google_product_category>
    </item>`;
}

function generateHamperItem(hamper: any, baseUrl: string): string {
  const productUrl = `${baseUrl}/gift-hampers/${hamper.slug.current}`;
  const imageUrl = hamper.mainImage?.asset?.url 
    ? (hamper.mainImage.asset.url.startsWith('http') 
        ? hamper.mainImage.asset.url 
        : `https://cdn.sanity.io${hamper.mainImage.asset.url}`)
    : `${baseUrl}/images/placeholder-hamper.jpg`;

  const price = hamper.price || 35;
  
  return `
    <item>
      <g:id>hamper_${hamper._id}</g:id>
      <g:title>${escapeXml(hamper.name)} - Ukrainian Gift Hamper</g:title>
      <g:description>${escapeXml(hamper.shortDescription || hamper.description || `Beautiful Ukrainian gift hamper - ${hamper.name}. Perfect for special occasions.`)}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:price>${price} GBP</g:price>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Olgish Cakes</g:brand>
      <g:product_type>Food &amp; Drink &gt; Gift Baskets &gt; Food Gift Baskets</g:product_type>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items &gt; Gift Baskets</g:google_product_category>
    </item>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
