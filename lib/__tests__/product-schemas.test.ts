import { generateSKU, generateProductSchema } from '../product-schemas';
import { SKU_PREFIX } from '../schema-constants';

describe('generateSKU', () => {
  it('should generate valid SKU with correct format', () => {
    const sku = generateSKU('Honey Cake', 0);
    expect(sku).toBe('OC-HONEY-CAKE-001');
  });

  it('should handle special characters in product name', () => {
    const sku = generateSKU('Kyiv\'s Best Cake!', 0);
    expect(sku).toBe('OC-KYIV-S-BEST-CAK-001');
  });

  it('should truncate long product names', () => {
    const longName = 'A Very Long Product Name That Exceeds Maximum Length';
    const sku = generateSKU(longName, 0);
    expect(sku).toMatch(/^OC-[A-Z-]+-001$/);
    expect(sku.length).toBeLessThanOrEqual(50);
  });

  it('should increment SKU numbers correctly', () => {
    expect(generateSKU('Test Cake', 0)).toBe('OC-TEST-CAKE-001');
    expect(generateSKU('Test Cake', 5)).toBe('OC-TEST-CAKE-006');
    expect(generateSKU('Test Cake', 99)).toBe('OC-TEST-CAKE-100');
  });

  it('should handle empty or invalid names with fallback', () => {
    const sku1 = generateSKU('', 0);
    expect(sku1).toMatch(/^OC-PRODUCT-001$/);
    
    const sku2 = generateSKU(null as any, 0);
    expect(sku2).toMatch(/^OC-PRODUCT-001$/);
  });

  it('should handle negative indices with fallback', () => {
    const sku = generateSKU('Test', -5);
    expect(sku).toBe('OC-TEST-001');
  });

  it('should clean multiple consecutive dashes', () => {
    const sku = generateSKU('Test---Cake', 0);
    expect(sku).toBe('OC-TEST-CAKE-001');
  });
});

describe('generateProductSchema', () => {
  const mockCake = {
    _id: 'test-cake-1',
    name: 'Test Honey Cake',
    slug: { current: 'test-honey-cake' },
    pricing: { standard: 35 },
    allergens: ['Eggs', 'Dairy'],
    ingredients: ['Flour', 'Sugar', 'Honey'],
    mainImage: { asset: { url: 'https://example.com/image.jpg' } },
    description: 'A delicious test honey cake',
  };

  const mockStats = {
    count: 10,
    averageRating: 4.5,
  };

  it('should generate valid product schema', () => {
    const schema = generateProductSchema(mockCake, 0, mockStats);
    
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Product');
    expect(schema.name).toBe('Test Honey Cake');
    expect(schema.sku).toBe('OC-TEST-HONEY-CAKE-001');
  });

  it('should include pricing information', () => {
    const schema = generateProductSchema(mockCake, 0, mockStats);
    
    expect(schema.offers).toBeDefined();
    if (typeof schema.offers === 'object' && schema.offers !== null && '@type' in schema.offers) {
      expect(schema.offers['@type']).toBe('Offer');
      expect(schema.offers.price).toBe('35');
      expect(schema.offers.priceCurrency).toBe('GBP');
    }
  });

  it('should include allergen information', () => {
    const schema = generateProductSchema(mockCake, 0, mockStats);
    
    expect(schema.containsAllergens).toEqual(['Eggs', 'Dairy']);
    if (Array.isArray(schema.additionalProperty)) {
      const allergenProp = schema.additionalProperty.find(
        (prop: any) => prop.name === 'Allergens'
      );
      expect(allergenProp).toBeDefined();
      expect(allergenProp?.value).toBe('Eggs, Dairy');
    }
  });

  it('should generate unique MPN', () => {
    const schema1 = generateProductSchema(mockCake, 0, mockStats);
    const schema2 = generateProductSchema({ ...mockCake, _id: 'test-2' }, 1, mockStats);
    
    expect(schema1.mpn).not.toBe(schema2.mpn);
  });

  it('should handle missing optional fields', () => {
    const minimalCake = {
      _id: 'minimal-cake',
      name: 'Minimal Cake',
    };
    
    const schema = generateProductSchema(minimalCake as any, 0, mockStats);
    
    expect(schema.name).toBe('Minimal Cake');
    expect(schema.sku).toBeDefined();
    expect(schema.mpn).toBeDefined();
  });

  it('should include aggregate rating from testimonial stats', () => {
    const schema = generateProductSchema(mockCake, 0, mockStats);
    
    expect(schema.aggregateRating).toBeDefined();
    if (typeof schema.aggregateRating === 'object' && schema.aggregateRating !== null) {
      expect(schema.aggregateRating.ratingValue).toBe('4.5');
      expect(schema.aggregateRating.reviewCount).toBe('10');
    }
  });
});

