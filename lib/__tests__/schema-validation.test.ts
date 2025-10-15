import { validateProductSchema, validateMPNUniqueness, validateReviewSchema } from '../schema-validation';
import { WithContext, Product, Review } from 'schema-dts';

describe('validateProductSchema', () => {
  const validSchema: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Test Cake',
    description: 'A delicious test cake with authentic flavors',
    sku: 'OC-TEST-CAKE-001',
    mpn: 'TEST-CAKE-35-001',
    brand: {
      '@type': 'Brand',
      name: 'Olgish Cakes',
    },
    image: ['https://example.com/image.jpg'],
    offers: {
      '@type': 'Offer',
      price: '35',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };

  it('should validate a correct schema', () => {
    const result = validateProductSchema(validSchema);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing product name', () => {
    const invalid = { ...validSchema, name: '' };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing or invalid product name');
  });

  it('should detect product name too short', () => {
    const invalid = { ...validSchema, name: 'AB' };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Product name too short (minimum 3 characters)');
  });

  it('should detect product name too long', () => {
    const invalid = { ...validSchema, name: 'A'.repeat(151) };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Product name too long (maximum 150 characters)');
  });

  it('should detect missing description', () => {
    const invalid = { ...validSchema, description: '' };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing or invalid product description');
  });

  it('should detect invalid price', () => {
    const invalid = {
      ...validSchema,
      offers: {
        '@type': 'Offer' as const,
        price: '-10',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2026-01-01',
      },
    };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Price must be greater than zero');
  });

  it('should detect price too high', () => {
    const invalid = {
      ...validSchema,
      offers: {
        '@type': 'Offer' as const,
        price: '15000',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2026-01-01',
      },
    };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Price seems unusually high (>£10,000)');
  });

  it('should detect invalid SKU format', () => {
    const invalid = { ...validSchema, sku: 'INVALID-SKU' };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('OC-'))).toBe(true);
  });

  it('should detect invalid SKU ending', () => {
    const invalid = { ...validSchema, sku: 'OC-TEST-AB' };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('3 digits'))).toBe(true);
  });

  it('should detect MPN too short', () => {
    const invalid = { ...validSchema, mpn: 'AB' };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('MPN too short (minimum 3 characters)');
  });

  it('should detect MPN too long', () => {
    const invalid = { ...validSchema, mpn: 'A'.repeat(71) };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('MPN too long (maximum 70 characters for Google Merchant Center)');
  });

  it('should detect past priceValidUntil date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const invalid = {
      ...validSchema,
      offers: {
        '@type': 'Offer' as const,
        price: '35',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        priceValidUntil: yesterday.toISOString().split('T')[0],
      },
    };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('priceValidUntil date is in the past');
  });

  it('should validate aggregate rating range', () => {
    const invalid = {
      ...validSchema,
      aggregateRating: {
        '@type': 'AggregateRating' as const,
        ratingValue: '6',
        reviewCount: '10',
      },
    };
    const result = validateProductSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('ratingValue must be between 1 and 5');
  });
});

describe('validateMPNUniqueness', () => {
  it('should pass with unique MPNs', () => {
    const schemas: WithContext<Product>[] = [
      { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any,
      { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-002' } as any,
      { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-003' } as any,
    ];
    
    const result = validateMPNUniqueness(schemas);
    expect(result.isValid).toBe(true);
    expect(result.duplicates).toHaveLength(0);
  });

  it('should detect duplicate MPNs', () => {
    const schemas: WithContext<Product>[] = [
      { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any,
      { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-002' } as any,
      { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any,
    ];
    
    const result = validateMPNUniqueness(schemas);
    expect(result.isValid).toBe(false);
    expect(result.duplicates).toContain('MPN-001');
  });

  it('should handle schemas without MPNs', () => {
    const schemas: WithContext<Product>[] = [
      { '@context': 'https://schema.org', '@type': 'Product' } as any,
      { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any,
    ];
    
    const result = validateMPNUniqueness(schemas);
    expect(result.isValid).toBe(true);
  });
});

describe('validateReviewSchema', () => {
  const validReview: WithContext<Review> = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'John Doe',
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: 'Excellent cake!',
    datePublished: '2025-10-15',
  };

  it('should validate a correct review schema', () => {
    const result = validateReviewSchema(validReview);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing author', () => {
    const invalid = { ...validReview, author: undefined };
    const result = validateReviewSchema(invalid as any);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing review author');
  });

  it('should detect missing review body', () => {
    const invalid = { ...validReview, reviewBody: '' };
    const result = validateReviewSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing or invalid reviewBody');
  });

  it('should detect invalid date format', () => {
    const invalid = { ...validReview, datePublished: '15/10/2025' };
    const result = validateReviewSchema(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid datePublished format (should be YYYY-MM-DD)');
  });
});

