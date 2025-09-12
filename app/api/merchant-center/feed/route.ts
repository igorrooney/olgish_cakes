import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { getAllCakes } from "@/app/utils/fetchCakes";
import { getAllGiftHampers } from "@/app/utils/fetchGiftHampers";
import { unstable_cache } from "next/cache";

// Cached function to generate the product feed
const generateProductFeed = unstable_cache(
  async () => {
    const [cakes, giftHampers] = await Promise.all([
      getAllCakes(),
      getAllGiftHampers(),
    ]);

    const baseUrl = "https://olgishcakes.co.uk";
    
    // Generate XML feed
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Olgish Cakes - Ukrainian Bakery Products</title>
    <link>${baseUrl}</link>
    <description>Traditional Ukrainian cakes and gift hampers from Olgish Cakes in Leeds</description>
    <language>en-GB</language>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
    
    ${cakes.map(cake => generateCakeItem(cake, baseUrl)).join('\n')}
    ${giftHampers.map(hamper => generateHamperItem(hamper, baseUrl)).join('\n')}
    
  </channel>
</rss>`;

    return xmlContent;
  },
  ['merchant-center-feed'],
  {
    tags: ['cakes', 'gift-hampers', 'merchant-center-feed'],
    revalidate: 3600, // Cache for 1 hour
  }
);

// Google Merchant Center Product Feed XML Generator
export async function GET(request: NextRequest) {
  try {
    const xmlContent = await generateProductFeed();

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating merchant center feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate product feed' },
      { status: 500 }
    );
  }
}

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
      <g:custom_label_0>Ukrainian</g:custom_label_0>
      <g:custom_label_1>Traditional</g:custom_label_1>
      <g:custom_label_2>Handmade</g:custom_label_2>
      <g:custom_label_3>Leeds Bakery</g:custom_label_3>
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>Standard delivery</g:service>
        <g:price>0.00 GBP</g:price>
      </g:shipping>
      <g:tax>
        <g:country>GB</g:country>
        <g:rate>20</g:rate>
        <g:tax_ship>y</g:tax_ship>
      </g:tax>
      ${cake.ingredients ? `<g:additional_image_link>${imageUrl}</g:additional_image_link>` : ''}
      <g:age_group>all</g:age_group>
      <g:gender>all</g:gender>
      <g:size>${cake.size || '6'} inch</g:size>
      <g:color>Traditional</g:color>
      <g:material>Fresh ingredients</g:material>
      <g:pattern>Traditional Ukrainian design</g:pattern>
      <g:item_group_id>cake_${cake.category || 'honey-cake'}</g:item_group_id>
      <g:adult>no</g:adult>
      <g:multipack>1</g:multipack>
      <g:is_bundle>no</g:is_bundle>
      <g:energy_efficiency_class>not_applicable</g:energy_efficiency_class>
      <g:min_energy_efficiency_class>not_applicable</g:min_energy_efficiency_class>
      <g:max_energy_efficiency_class>not_applicable</g:max_energy_efficiency_class>
      <g:unit_pricing_measure>each</g:unit_pricing_measure>
      <g:unit_pricing_base_measure>1</g:unit_pricing_base_measure>
      <g:sale_price>${price} GBP</g:sale_price>
      <g:sale_price_effective_date>${new Date().toISOString().split('T')[0]}T00:00:00+00:00/${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T23:59:59+00:00</g:sale_price_effective_date>
      <g:installment>
        <g:months>1</g:months>
        <g:amount>${price} GBP</g:amount>
      </g:installment>
      <g:loyalty_points>
        <g:name>Olgish Cakes Loyalty</g:name>
        <g:points_value>${Math.round(price)}</g:points_value>
        <g:ratio>1</g:ratio>
      </g:loyalty_points>
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
      <g:custom_label_0>Ukrainian</g:custom_label_0>
      <g:custom_label_1>Gift Hamper</g:custom_label_1>
      <g:custom_label_2>Handmade</g:custom_label_2>
      <g:custom_label_3>Leeds Bakery</g:custom_label_3>
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>Standard delivery</g:service>
        <g:price>0.00 GBP</g:price>
      </g:shipping>
      <g:tax>
        <g:country>GB</g:country>
        <g:rate>20</g:rate>
        <g:tax_ship>y</g:tax_ship>
      </g:tax>
      <g:age_group>all</g:age_group>
      <g:gender>all</g:gender>
      <g:color>Traditional</g:color>
      <g:material>Premium ingredients</g:material>
      <g:pattern>Ukrainian traditional</g:pattern>
      <g:item_group_id>hamper_${hamper.category || 'gift-hamper'}</g:item_group_id>
      <g:adult>no</g:adult>
      <g:multipack>1</g:multipack>
      <g:is_bundle>yes</g:is_bundle>
      <g:energy_efficiency_class>not_applicable</g:energy_efficiency_class>
      <g:min_energy_efficiency_class>not_applicable</g:min_energy_efficiency_class>
      <g:max_energy_efficiency_class>not_applicable</g:max_energy_efficiency_class>
      <g:unit_pricing_measure>each</g:unit_pricing_measure>
      <g:unit_pricing_base_measure>1</g:unit_pricing_base_measure>
      <g:sale_price>${price} GBP</g:sale_price>
      <g:sale_price_effective_date>${new Date().toISOString().split('T')[0]}T00:00:00+00:00/${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T23:59:59+00:00</g:sale_price_effective_date>
      <g:installment>
        <g:months>1</g:months>
        <g:amount>${price} GBP</g:amount>
      </g:installment>
      <g:loyalty_points>
        <g:name>Olgish Cakes Loyalty</g:name>
        <g:points_value>${Math.round(price)}</g:points_value>
        <g:ratio>1</g:ratio>
      </g:loyalty_points>
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
