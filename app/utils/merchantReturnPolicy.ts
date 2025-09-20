/**
 * Standard Merchant Return Policy for Google Merchant Center compliance
 * This ensures all offers have consistent return policy information
 */

export const STANDARD_MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "GB",
  returnFees: "https://schema.org/FreeReturn",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
} as const;

/**
 * Ensures an offer object has the required hasMerchantReturnPolicy field
 * @param offer - The offer object to check and enhance
 * @returns The offer with hasMerchantReturnPolicy added if missing
 */
export function ensureMerchantReturnPolicy(offer: any): any {
  if (!offer["@type"] || offer["@type"] !== "Offer") {
    return offer;
  }

  if (!offer.hasMerchantReturnPolicy) {
    return {
      ...offer,
      hasMerchantReturnPolicy: STANDARD_MERCHANT_RETURN_POLICY,
    };
  }

  return offer;
}

/**
 * Ensures all offers in an array have the required hasMerchantReturnPolicy field
 * @param offers - Array of offer objects
 * @returns Array of offers with hasMerchantReturnPolicy added where missing
 */
export function ensureAllOffersHaveReturnPolicy(offers: any[]): any[] {
  return offers.map(offer => ensureMerchantReturnPolicy(offer));
}

/**
 * Validates that a structured data object has proper merchant return policies
 * @param structuredData - The structured data object to validate
 * @returns Object with validation results
 */
export function validateMerchantReturnPolicies(structuredData: any): {
  isValid: boolean;
  missingPolicies: string[];
  fixedData: any;
} {
  const missingPolicies: string[] = [];
  let fixedData = { ...structuredData };

  // Check if this is a Product with offers
  if (structuredData["@type"] === "Product" && structuredData.offers) {
    if (!structuredData.offers.hasMerchantReturnPolicy) {
      missingPolicies.push(`Product "${structuredData.name}" - main offer`);
      fixedData.offers = ensureMerchantReturnPolicy(structuredData.offers);
    }
  }

  // Check hasOfferCatalog items
  if (structuredData.hasOfferCatalog?.itemListElement) {
    const items = structuredData.hasOfferCatalog.itemListElement;
    items.forEach((item: any, index: number) => {
      if (item["@type"] === "Offer" && !item.hasMerchantReturnPolicy) {
        missingPolicies.push(`OfferCatalog item ${index}: "${item.itemOffered?.name || 'unnamed'}"`);
      }
    });
    fixedData.hasOfferCatalog.itemListElement = ensureAllOffersHaveReturnPolicy(items);
  }

  // Check @graph array (for advanced structured data)
  if (structuredData["@graph"] && Array.isArray(structuredData["@graph"])) {
    structuredData["@graph"].forEach((item: any, index: number) => {
      if (item["@type"] === "Product" && item.offers && !item.offers.hasMerchantReturnPolicy) {
        missingPolicies.push(`@graph Product ${index}: "${item.name}"`);
        fixedData["@graph"][index].offers = ensureMerchantReturnPolicy(item.offers);
      }
    });
  }

  return {
    isValid: missingPolicies.length === 0,
    missingPolicies,
    fixedData,
  };
}
