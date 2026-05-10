import { NextResponse } from "next/server";
import { getAllCakes } from "@/app/utils/fetchCakes";
import { getAllGiftHampers } from "@/app/utils/fetchGiftHampers";
import { blocksToText, type Cake } from "@/types/cake";
import type { GiftHamper } from "@/types/giftHamper";

// Google Merchant Center Feed Validation Endpoint
export async function GET() {
  try {
    const [cakes, giftHampers] = await Promise.all([
      getAllCakes(),
      getAllGiftHampers(),
    ]);

    const cakeValidations = cakes.map(cake => validateCakeProduct(cake));
    const hamperValidations = giftHampers.map(hamper => validateHamperProduct(hamper));

    // Collect all errors and warnings
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    [...cakeValidations, ...hamperValidations].forEach(product => {
      if (product.errors) allErrors.push(...product.errors);
      if (product.warnings) allWarnings.push(...product.warnings);
    });

    const validationResults = {
      summary: {
        totalProducts: cakes.length + giftHampers.length,
        cakes: cakes.length,
        giftHampers: giftHampers.length,
        timestamp: new Date().toISOString(),
      },
      cakes: cakeValidations,
      giftHampers: hamperValidations,
      errors: allErrors,
      warnings: allWarnings,
    };

    return NextResponse.json(validationResults, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('Error validating merchant center feed:', error);
    return NextResponse.json(
      { error: 'Failed to validate product feed' },
      { status: 500 }
    );
  }
}

function validateCakeProduct(cake: Cake) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!cake._id) errors.push(`Cake ${cake.name}: Missing product ID`);
  if (!cake.name) errors.push(`Cake: Missing product name`);
  if (!cake.slug?.current) errors.push(`Cake ${cake.name}: Missing slug`);
  if (!cake.pricing?.standard) warnings.push(`Cake ${cake.name}: Missing standard price`);
  if (!cake.mainImage?.asset?.url) warnings.push(`Cake ${cake.name}: Missing main image`);

  // Price validation
  const price = cake.pricing?.standard;
  if (price && (price < 1 || price > 1000)) {
    warnings.push(`Cake ${cake.name}: Price ${price} seems unusual`);
  }

  // Image validation
  if (cake.mainImage?.asset?.url) {
    const imageUrl = cake.mainImage.asset.url;
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      warnings.push(`Cake ${cake.name}: Image URL format may be incorrect`);
    }
  }

  // Description validation
  const description = blocksToText(cake.shortDescription || cake.description);
  if (!description) {
    warnings.push(`Cake ${cake.name}: Missing product description`);
  } else if (description.length < 50) {
    warnings.push(`Cake ${cake.name}: Description may be too short for SEO`);
  }

  return {
    id: cake._id,
    name: cake.name,
    slug: cake.slug?.current,
    type: 'cake',
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    isValid: errors.length === 0,
  };
}

function validateHamperProduct(hamper: GiftHamper) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!hamper._id) errors.push(`Hamper ${hamper.name}: Missing product ID`);
  if (!hamper.name) errors.push(`Hamper: Missing product name`);
  if (!hamper.slug?.current) errors.push(`Hamper ${hamper.name}: Missing slug`);
  if (!hamper.price) warnings.push(`Hamper ${hamper.name}: Missing price`);
  const mainImage = hamper.images?.find(image => image.isMain) || hamper.images?.[0];

  if (!mainImage?.asset?.url) warnings.push(`Hamper ${hamper.name}: Missing main image`);

  // Price validation
  const price = hamper.price;
  if (price && (price < 1 || price > 1000)) {
    warnings.push(`Hamper ${hamper.name}: Price ${price} seems unusual`);
  }

  // Image validation
  if (mainImage?.asset?.url) {
    const imageUrl = mainImage.asset.url;
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      warnings.push(`Hamper ${hamper.name}: Image URL format may be incorrect`);
    }
  }

  // Description validation
  const description = blocksToText(hamper.shortDescription || hamper.description || []);
  if (!description) {
    warnings.push(`Hamper ${hamper.name}: Missing product description`);
  } else if (description.length < 50) {
    warnings.push(`Hamper ${hamper.name}: Description may be too short for SEO`);
  }

  return {
    id: hamper._id,
    name: hamper.name,
    slug: hamper.slug?.current,
    type: 'hamper',
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    isValid: errors.length === 0,
  };
}
