/**
 * ESLint rule to prevent string prices in structured data offers
 * Catches patterns like: price: "25" or price: "From £25" in offer objects
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent string prices in structured data offers (must be numeric for Google Merchant Center)',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      stringPriceInOffer: 'Price in structured data offer must be a number, not a string. Use formatStructuredDataPrice() from lib/utils/price-formatting.ts or ensure price is numeric. Found: {{price}}',
    },
  },
  create(context) {
    return {
      Property(node) {
        // Check if this is a price property in an offer object
        if (
          node.key &&
          (node.key.name === 'price' || (node.key.type === 'Literal' && node.key.value === 'price'))
        ) {
          // Check if the value is a string literal
          if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
            // Check if parent is an object that might be an offer
            const parent = node.parent
            if (parent && parent.type === 'ObjectExpression') {
              // Check if parent has @type: "Offer" or is in a context that suggests structured data
              const hasOfferType = parent.properties.some(
                (prop) =>
                  prop.key &&
                  (prop.key.name === '@type' ||
                    (prop.key.type === 'Literal' && prop.key.value === '@type')) &&
                  prop.value &&
                  prop.value.type === 'Literal' &&
                  prop.value.value === 'Offer'
              )

              // Also check for common structured data patterns
              const hasStructuredDataContext = parent.properties.some(
                (prop) =>
                  prop.key &&
                  (prop.key.name === '@context' ||
                    (prop.key.type === 'Literal' && prop.key.value === '@context'))
              )

              if (hasOfferType || hasStructuredDataContext) {
                context.report({
                  node: node.value,
                  messageId: 'stringPriceInOffer',
                  data: {
                    price: node.value.value,
                  },
                })
              }
            }
          }
        }
      },
    }
  },
}
