import { describe, expect, it } from 'vitest';
import {
  validateProduct,
  uuidPattern,
} from '../../netlify/functions/_shared/product-validation.mjs';

const validCategoryId = '123e4567-e89b-42d3-a456-426614174000';
const validSubcategoryId = '223e4567-e89b-42d3-a456-426614174000';

const validProduct = () => ({
  name: 'Test Fragrance',
  price: 199.99,
  storefront: 'yotaabo',
  category: 'His',
  subcategory: 'Eau de Parfum',
  is_active: true,
  sort_order: 0,
});

describe('uuidPattern', () => {
  it('accepts a valid UUID', () => {
    expect(uuidPattern.test(validCategoryId)).toBe(true);
  });

  it('accepts uppercase UUIDs', () => {
    expect(uuidPattern.test(validCategoryId.toUpperCase())).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(uuidPattern.test('')).toBe(false);
  });

  it('rejects malformed UUIDs', () => {
    const invalid = [
      'not-a-uuid',
      '123e4567-e89b-42d3-a456',
      '123e4567e89b42d3a456426614174000',
      '123e4567-e89b-42d3-a456-42661417400g',
      '123e4567-e89b-02d3-a456-426614174000',
      '123e4567-e89b-42d3-7456-426614174000',
      '123e4567-e89b-42d3-a456-426614174000-extra',
    ];

    for (const value of invalid) {
      expect(uuidPattern.test(value), value).toBe(false);
    }
  });
});

describe('validateProduct: valid input', () => {
  it('accepts a complete valid product', () => {
    const result = validateProduct(validProduct());

    expect(result).toEqual({
      product: {
        name: 'Test Fragrance',
        storefront: 'yotaabo',
        price: 199.99,
        supplier_cost: null,
        sku: null,
        sizes: [],
        category: 'His',
        category_id: null,
        subcategory: 'Eau de Parfum',
        subcategory_id: null,
        description: null,
        image_url: null,
        is_active: true,
        sort_order: 0,
      },
    });
  });

  it('trims the product name', () => {
    const result = validateProduct({
      ...validProduct(),
      name: '  Test Fragrance  ',
    });

    expect(result.product?.name).toBe('Test Fragrance');
  });

  it('normalises storefront casing and whitespace', () => {
    const result = validateProduct({
      ...validProduct(),
      storefront: '  POSHIES  ',
    });

    expect(result.product?.storefront).toBe('poshies');
  });

  it('converts an empty storefront to null', () => {
    const result = validateProduct({
      ...validProduct(),
      storefront: '   ',
    });

    expect(result.product?.storefront).toBeNull();
  });

  it('accepts a missing storefront for later server-side resolution', () => {
    const product = validProduct();
    delete (product as Record<string, unknown>).storefront;

    expect(validateProduct(product).product?.storefront).toBeNull();
  });

  it('trims category and subcategory names', () => {
    const result = validateProduct({
      ...validProduct(),
      category: '  His  ',
      subcategory: '  Eau de Parfum  ',
    });

    expect(result.product?.category).toBe('His');
    expect(result.product?.subcategory).toBe('Eau de Parfum');
  });

  it('accepts category and subcategory UUIDs', () => {
    const result = validateProduct({
      ...validProduct(),
      category: '',
      subcategory: '',
      category_id: validCategoryId,
      subcategory_id: validSubcategoryId,
    });

    expect(result.product?.category_id).toBe(validCategoryId);
    expect(result.product?.subcategory_id).toBe(validSubcategoryId);
  });

  it('trims category and subcategory UUIDs', () => {
    const result = validateProduct({
      ...validProduct(),
      category_id: ` ${validCategoryId} `,
      subcategory_id: ` ${validSubcategoryId} `,
    });

    expect(result.product?.category_id).toBe(validCategoryId);
    expect(result.product?.subcategory_id).toBe(validSubcategoryId);
  });

  it('rounds prices to two decimal places', () => {
    const result = validateProduct({
      ...validProduct(),
      price: 19.999,
    });

    expect(result.product?.price).toBe(20);
  });

  it('accepts a numeric price supplied as a string', () => {
    const result = validateProduct({
      ...validProduct(),
      price: '249.50',
    });

    expect(result.product?.price).toBe(249.5);
  });

  it('defaults missing sort_order to zero', () => {
    const product = validProduct();
    delete (product as Record<string, unknown>).sort_order;

    expect(validateProduct(product).product?.sort_order).toBe(0);
  });

  it('trims descriptions and image URLs', () => {
    const result = validateProduct({
      ...validProduct(),
      description: '  A distinctive fragrance.  ',
      image_url: '  https://example.com/image.webp  ',
    });

    expect(result.product?.description).toBe('A distinctive fragrance.');
    expect(result.product?.image_url).toBe('https://example.com/image.webp');
  });

  it('converts empty optional descriptions and image URLs to null', () => {
    const result = validateProduct({
      ...validProduct(),
      description: '',
      image_url: '',
    });

    expect(result.product?.description).toBeNull();
    expect(result.product?.image_url).toBeNull();
  });
});

describe('validateProduct: product name boundaries', () => {
  it('rejects a missing name', () => {
    expect(validateProduct({
      ...validProduct(),
      name: undefined,
    }).error).toBe('Product name must be between 1 and 160 characters.');
  });

  it('rejects a null name', () => {
    expect(validateProduct({
      ...validProduct(),
      name: null,
    }).error).toBe('Product name must be between 1 and 160 characters.');
  });

  it('rejects whitespace-only names', () => {
    expect(validateProduct({
      ...validProduct(),
      name: '     ',
    }).error).toBe('Product name must be between 1 and 160 characters.');
  });

  it('accepts a one-character name', () => {
    expect(validateProduct({
      ...validProduct(),
      name: 'A',
    }).product?.name).toBe('A');
  });

  it('accepts a 160-character name', () => {
    expect(validateProduct({
      ...validProduct(),
      name: 'A'.repeat(160),
    }).product?.name).toHaveLength(160);
  });

  it('rejects a 161-character name', () => {
    expect(validateProduct({
      ...validProduct(),
      name: 'A'.repeat(161),
    }).error).toBe('Product name must be between 1 and 160 characters.');
  });
});

describe('validateProduct: price boundaries and types', () => {
  it.each([
    ['missing', undefined],
    ['null', null],
    ['zero', 0],
    ['negative', -1],
    ['above maximum', 1000000.01],
    ['NaN string', 'not-a-number'],
    ['empty string', ''],
    ['infinity', Infinity],
    ['negative infinity', -Infinity],
  ])('rejects %s prices', (_label, price) => {
    expect(validateProduct({
      ...validProduct(),
      price,
    }).error).toBe('Please provide a valid product price.');
  });

  it('rejects the smallest positive representable price when it rounds to zero', () => {
    expect(validateProduct({
      ...validProduct(),
      price: Number.MIN_VALUE,
    }).error).toBe('Please provide a valid product price.');
  });

  it('accepts the maximum permitted price', () => {
    expect(validateProduct({
      ...validProduct(),
      price: 1000000,
    }).product?.price).toBe(1000000);
  });

  it('rejects boolean prices instead of coercing true to one', () => {
    expect(validateProduct({
      ...validProduct(),
      price: true,
    }).error).toBe('Please provide a valid product price.');
  });

  it('rejects array prices instead of coercing them to numbers', () => {
    expect(validateProduct({
      ...validProduct(),
      price: [100],
    }).error).toBe('Please provide a valid product price.');
  });

  it('rejects object prices instead of coercing them to numbers', () => {
    expect(validateProduct({
      ...validProduct(),
      price: { value: 100 },
    }).error).toBe('Please provide a valid product price.');
  });
});

describe('validateProduct: supplier cost', () => {
  it('accepts a valid supplier cost', () => {
    expect(validateProduct({
      ...validProduct(),
      supplier_cost: 120.50,
    }).product?.supplier_cost).toBe(120.5);
  });

  it('rounds supplier cost to two decimal places', () => {
    expect(validateProduct({
      ...validProduct(),
      supplier_cost: 19.999,
    }).product?.supplier_cost).toBe(20);
  });

  it('accepts a numeric supplier cost supplied as a string', () => {
    expect(validateProduct({
      ...validProduct(),
      supplier_cost: '249.50',
    }).product?.supplier_cost).toBe(249.5);
  });

  it('accepts zero supplier cost', () => {
    expect(validateProduct({
      ...validProduct(),
      supplier_cost: 0,
    }).product?.supplier_cost).toBe(0);
  });

  it.each([undefined, null, '', '   '])(
    'converts missing or blank supplier cost to null: %s',
    (supplier_cost) => {
      expect(validateProduct({
        ...validProduct(),
        supplier_cost,
      }).product?.supplier_cost).toBeNull();
    },
  );

  it.each([
    ['negative', -1],
    ['above maximum', 1000000.01],
    ['invalid string', 'not-a-number'],
    ['boolean', true],
    ['array', [100]],
    ['object', { value: 100 }],
    ['infinity', Infinity],
  ])('rejects %s supplier cost', (_label, supplier_cost) => {
    expect(validateProduct({
      ...validProduct(),
      supplier_cost,
    }).error).toBe('Please provide a valid supplier cost.');
  });

  it('accepts the maximum permitted supplier cost', () => {
    expect(validateProduct({
      ...validProduct(),
      supplier_cost: 1000000,
    }).product?.supplier_cost).toBe(1000000);
  });
});

describe('validateProduct: SKU', () => {
  it('trims and uppercases SKU', () => {
    expect(validateProduct({
      ...validProduct(),
      sku: '  yot-001  ',
    }).product?.sku).toBe('YOT-001');
  });

  it('converts missing and blank SKU to null', () => {
    for (const sku of [undefined, null, '', '   ']) {
      expect(validateProduct({
        ...validProduct(),
        sku,
      }).product?.sku).toBeNull();
    }
  });

  it('accepts permitted SKU punctuation', () => {
    expect(validateProduct({
      ...validProduct(),
      sku: 'yot_01.2/ab-3',
    }).product?.sku).toBe('YOT_01.2/AB-3');
  });

  it('accepts an 80-character SKU', () => {
    expect(validateProduct({
      ...validProduct(),
      sku: 'A'.repeat(80),
    }).product?.sku).toHaveLength(80);
  });

  it.each([
    ['contains spaces', 'YOT 001'],
    ['contains unsupported punctuation', 'YOT@001'],
    ['starts with punctuation', '-YOT001'],
    ['exceeds 80 characters', 'A'.repeat(81)],
    ['is a number', 123],
    ['is a boolean', true],
    ['is an object', { value: 'YOT-001' }],
  ])('rejects SKU that %s', (_label, sku) => {
    expect(validateProduct({
      ...validProduct(),
      sku,
    }).error).toBe(
      'SKU must contain 1–80 valid letters, numbers or . _ / - characters.',
    );
  });
});

describe('validateProduct: storefront validation', () => {
  it.each(['invalid', 'yotaabo2', 'poshies-extra', 'admin', 'null'])(
    'rejects invalid storefront %s',
    (storefront) => {
      expect(validateProduct({
        ...validProduct(),
        storefront,
      }).error).toBe('Please select a valid storefront.');
    },
  );

  it('accepts Yotaabo case-insensitively', () => {
    expect(validateProduct({
      ...validProduct(),
      storefront: 'YOTAABO',
    }).product?.storefront).toBe('yotaabo');
  });

  it('accepts Poshies case-insensitively', () => {
    expect(validateProduct({
      ...validProduct(),
      storefront: 'POSHIES',
    }).product?.storefront).toBe('poshies');
  });
});

describe('validateProduct: category validation', () => {
  it('rejects a missing category name and ID', () => {
    expect(validateProduct({
      ...validProduct(),
      category: '',
    }).error).toBe('Please select a valid category.');
  });

  it('rejects a whitespace-only category', () => {
    expect(validateProduct({
      ...validProduct(),
      category: '   ',
    }).error).toBe('Please select a valid category.');
  });

  it('rejects malformed category UUIDs', () => {
    expect(validateProduct({
      ...validProduct(),
      category_id: 'not-a-uuid',
    }).error).toBe('Please provide a valid category.');
  });

  it('rejects category names longer than 120 characters', () => {
    expect(validateProduct({
      ...validProduct(),
      category: 'A'.repeat(121),
    }).error).toBe('The selected category or subcategory is invalid.');
  });

  it('accepts a category name of exactly 120 characters', () => {
    expect(validateProduct({
      ...validProduct(),
      category: 'A'.repeat(120),
    }).product?.category).toHaveLength(120);
  });
});

describe('validateProduct: subcategory validation', () => {
  it('rejects a missing subcategory name and ID', () => {
    expect(validateProduct({
      ...validProduct(),
      subcategory: '',
    }).error).toBe('Please provide a valid subcategory.');
  });

  it('rejects a whitespace-only subcategory', () => {
    expect(validateProduct({
      ...validProduct(),
      subcategory: '   ',
    }).error).toBe('Please provide a valid subcategory.');
  });

  it('rejects malformed subcategory UUIDs', () => {
    expect(validateProduct({
      ...validProduct(),
      subcategory_id: 'not-a-uuid',
    }).error).toBe('Please provide a valid subcategory.');
  });

  it('rejects subcategory names longer than 120 characters', () => {
    expect(validateProduct({
      ...validProduct(),
      subcategory: 'A'.repeat(121),
    }).error).toBe('The selected category or subcategory is invalid.');
  });

  it('accepts a subcategory name of exactly 120 characters', () => {
    expect(validateProduct({
      ...validProduct(),
      subcategory: 'A'.repeat(120),
    }).product?.subcategory).toHaveLength(120);
  });
});

describe('validateProduct: product status', () => {
  it('accepts active products', () => {
    expect(validateProduct({
      ...validProduct(),
      is_active: true,
    }).product?.is_active).toBe(true);
  });

  it('accepts inactive products', () => {
    expect(validateProduct({
      ...validProduct(),
      is_active: false,
    }).product?.is_active).toBe(false);
  });

  it.each([undefined, null, 0, 1, 'true', 'false', '', [], {}])(
    'rejects invalid is_active value: %s',
    (is_active) => {
      expect(validateProduct({
        ...validProduct(),
        is_active,
      }).error).toBe('Please provide a valid product status.');
    },
  );
});

describe('validateProduct: sort order', () => {
  it('accepts zero', () => {
    expect(validateProduct({
      ...validProduct(),
      sort_order: 0,
    }).product?.sort_order).toBe(0);
  });

  it('accepts positive integers', () => {
    expect(validateProduct({
      ...validProduct(),
      sort_order: 100,
    }).product?.sort_order).toBe(100);
  });

  it('accepts numeric integer strings', () => {
    expect(validateProduct({
      ...validProduct(),
      sort_order: '12',
    }).product?.sort_order).toBe(12);
  });

  it.each([
    ['negative', -1],
    ['fractional', 1.5],
    ['NaN', 'abc'],
    ['infinity', Infinity],
    ['negative infinity', -Infinity],
  ])('rejects %s sort order', (_label, sort_order) => {
    expect(validateProduct({
      ...validProduct(),
      sort_order,
    }).error).toBe('Please provide a valid sort order.');
  });

  it('rejects boolean sort order instead of coercing true to one', () => {
    expect(validateProduct({
      ...validProduct(),
      sort_order: true,
    }).error).toBe('Please provide a valid sort order.');
  });

  it('rejects array sort order instead of coercing it to a number', () => {
    expect(validateProduct({
      ...validProduct(),
      sort_order: [5],
    }).error).toBe('Please provide a valid sort order.');
  });
});

describe('validateProduct: description boundaries', () => {
  it('accepts an empty description', () => {
    expect(validateProduct({
      ...validProduct(),
      description: '',
    }).product?.description).toBeNull();
  });

  it('accepts a description of exactly 10000 characters', () => {
    expect(validateProduct({
      ...validProduct(),
      description: 'A'.repeat(10000),
    }).product?.description).toHaveLength(10000);
  });

  it('rejects a description longer than 10000 characters', () => {
    expect(validateProduct({
      ...validProduct(),
      description: 'A'.repeat(10001),
    }).error).toBe('Product description is too long.');
  });
});

describe('validateProduct: image URL boundaries', () => {
  it('accepts an image URL of exactly 2048 characters', () => {
    const imageUrl = `https://example.com/${'a'.repeat(2028)}`;

    expect(imageUrl).toHaveLength(2048);
    expect(validateProduct({
      ...validProduct(),
      image_url: imageUrl,
    }).product?.image_url).toBe(imageUrl);
  });

  it('rejects an image URL longer than 2048 characters', () => {
    expect(validateProduct({
      ...validProduct(),
      image_url: 'a'.repeat(2049),
    }).error).toBe('Product image URL is too long.');
  });
});


describe('validateProduct: sizes', () => {
  it('preserves trimmed size labels', () => {
    const result = validateProduct({
      ...validProduct(),
      sizes: [' S ', 'M', ' L '],
    });

    expect(result.product?.sizes).toEqual(['S', 'M', 'L']);
  });

  it('defaults omitted sizes to an empty list', () => {
    expect(validateProduct(validProduct()).product?.sizes).toEqual([]);
  });

  it('rejects a non-array sizes value', () => {
    expect(validateProduct({
      ...validProduct(),
      sizes: 'S,M,L',
    }).error).toBe('Product sizes must be a list of up to 50 labels.');
  });

  it('rejects non-string size labels', () => {
    expect(validateProduct({
      ...validProduct(),
      sizes: ['S', 10],
    }).error).toBe('Each product size must be a text label.');
  });

  it('rejects blank and overlong size labels', () => {
    expect(validateProduct({
      ...validProduct(),
      sizes: ['   '],
    }).error).toBe('Product size labels must contain 1 to 80 characters.');
    expect(validateProduct({
      ...validProduct(),
      sizes: ['S'.repeat(81)],
    }).error).toBe('Product size labels must contain 1 to 80 characters.');
  });

  it('rejects duplicate labels regardless of case', () => {
    expect(validateProduct({
      ...validProduct(),
      sizes: ['Medium', ' medium '],
    }).error).toBe('Product sizes cannot contain duplicates.');
  });

  it('rejects more than 50 size labels', () => {
    expect(validateProduct({
      ...validProduct(),
      sizes: Array.from({ length: 51 }, (_, index) => `Size ${index}`),
    }).error).toBe('Product sizes must be a list of up to 50 labels.');
  });
});

describe('validateProduct: malformed JSON-like input', () => {
  it.each([null, undefined, '', 0, false, [], 'not-an-object'])(
    'does not throw for malformed request body: %s',
    (body) => {
      expect(() => validateProduct(body)).not.toThrow();
    },
  );

  it('rejects a non-string storefront', () => {
    expect(validateProduct({
      ...validProduct(),
      storefront: { value: 'yotaabo' },
    }).error).toBe('Please select a valid storefront.');
  });

  it('rejects a non-string category ID', () => {
    expect(validateProduct({
      ...validProduct(),
      category_id: { value: 'category-id' },
    }).error).toBe('Please provide a valid category.');
  });

  it('rejects a non-string subcategory ID', () => {
    expect(validateProduct({
      ...validProduct(),
      subcategory_id: { value: 'subcategory-id' },
    }).error).toBe('Please provide a valid subcategory.');
  });

  it('rejects non-string product names', () => {
    expect(validateProduct({
      ...validProduct(),
      name: { value: 'Test' },
    }).error).toBe('Product name must be between 1 and 160 characters.');
  });

  it('rejects non-string category names', () => {
    expect(validateProduct({
      ...validProduct(),
      category: { value: 'His' },
    }).error).toBe('Please select a valid category.');
  });

  it('rejects non-string subcategory names', () => {
    expect(validateProduct({
      ...validProduct(),
      subcategory: { value: 'Eau de Parfum' },
    }).error).toBe('Please provide a valid subcategory.');
  });

  it('rejects non-string descriptions', () => {
    expect(validateProduct({
      ...validProduct(),
      description: { text: 'Description' },
    }).error).toBe('Product description is invalid.');
  });

  it('rejects non-string image URLs', () => {
    expect(validateProduct({
      ...validProduct(),
      image_url: { url: 'https://example.com/image.webp' },
    }).error).toBe('Product image URL is invalid.');
  });
});
