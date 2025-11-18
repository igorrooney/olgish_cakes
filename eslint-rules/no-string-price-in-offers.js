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
          // Check if the value is a string literal or template literal
          const isStringLiteral = node.value && 
            node.value.type === 'Literal' && 
            typeof node.value.value === 'string'
          
          const isTemplateLiteral = node.value && 
            node.value.type === 'TemplateLiteral' &&
            node.value.quasis &&
            node.value.quasis.length > 0
          
          // Check for computed values that might be strings (variables, function calls, etc.)
          // But exclude known numeric conversion functions
          const isNumericConversionFunction = node.value &&
            node.value.type === 'CallExpression' &&
            node.value.callee &&
            (node.value.callee.name === 'formatStructuredDataPrice' ||
             node.value.callee.name === 'parseFloat' ||
             node.value.callee.name === 'parseInt' ||
             node.value.callee.name === 'Number' ||
             (node.value.callee.type === 'MemberExpression' &&
              node.value.callee.object &&
              node.value.callee.object.name === 'Number' &&
              node.value.callee.property &&
              (node.value.callee.property.name === 'parseFloat' ||
               node.value.callee.property.name === 'parseInt')))
          
          const isPotentiallyString = node.value && 
            !isNumericConversionFunction &&
            (node.value.type === 'Identifier' || 
             node.value.type === 'CallExpression' ||
             node.value.type === 'MemberExpression')
          
          if (isStringLiteral || isTemplateLiteral) {
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

              // Check if parent is nested in an offers array
              const isInOffersArray = parent.parent &&
                parent.parent.type === 'ArrayExpression' &&
                parent.parent.parent &&
                parent.parent.parent.type === 'Property' &&
                parent.parent.parent.key &&
                (parent.parent.parent.key.name === 'offers' ||
                  (parent.parent.parent.key.type === 'Literal' &&
                    parent.parent.parent.key.value === 'offers'))

              if (hasOfferType || hasStructuredDataContext || isInOffersArray) {
                const priceValue = isStringLiteral 
                  ? node.value.value 
                  : isTemplateLiteral 
                    ? `\`${node.value.quasis.map(q => q.value.cooked).join('${...}')}\``
                    : 'string value'
                
                context.report({
                  node: node.value,
                  messageId: 'stringPriceInOffer',
                  data: {
                    price: priceValue,
                  },
                })
              }
            }
          }
          
          // Warn about potentially string values (variables, function calls) in offer contexts
          if (isPotentiallyString) {
            const parent = node.parent
            if (parent && parent.type === 'ObjectExpression') {
              const hasOfferType = parent.properties.some(
                (prop) =>
                  prop.key &&
                  (prop.key.name === '@type' ||
                    (prop.key.type === 'Literal' && prop.key.value === '@type')) &&
                  prop.value &&
                  prop.value.type === 'Literal' &&
                  prop.value.value === 'Offer'
              )
              
              if (hasOfferType) {
                context.report({
                  node: node.value,
                  messageId: 'stringPriceInOffer',
                  data: {
                    price: 'variable or expression (ensure it evaluates to a number)',
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
