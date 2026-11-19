import { describe, expect, it } from 'vitest'
import {
  getCategoryProducts,
  getFeaturedProducts,
  type Product
} from '../../src/systems/storefront/core'

const createProduct = (
  overrides: Partial<Product> = {}
): Product => ({
  id: 'product-1',
  name: 'Test Fragrance',
  price: 299,
  category: 'His',
  subcategory: 'Fresh',
  description: null,
  image_url: null,
  is_active: true,
  sort_order: 1,
  order_count: 0,
  created_at: '2026-01-01T10:00:00.000Z',
  ...overrides
})

describe('getFeaturedProducts', () => {
  it('excludes inactive products', () => {
    const products = [
      createProduct({ id: 'active' }),
      createProduct({
        id: 'inactive',
        is_active: false,
        order_count: 100
      })
    ]

    expect(getFeaturedProducts(products).map(p => p.id))
      .toEqual(['active'])
  })

  it('ranks products by order count descending', () => {
    const products = [
      createProduct({ id: 'low', order_count: 2 }),
      createProduct({ id: 'high', order_count: 20 }),
      createProduct({ id: 'medium', order_count: 10 })
    ]

    expect(getFeaturedProducts(products).map(p => p.id))
      .toEqual(['high', 'medium', 'low'])
  })

  it('uses sort order when order counts are equal', () => {
    const products = [
      createProduct({ id: 'later', order_count: 5, sort_order: 3 }),
      createProduct({ id: 'first', order_count: 5, sort_order: 1 }),
      createProduct({ id: 'middle', order_count: 5, sort_order: 2 })
    ]

    expect(getFeaturedProducts(products).map(p => p.id))
      .toEqual(['first', 'middle', 'later'])
  })

  it('uses newest creation date as the final tie-breaker', () => {
    const products = [
      createProduct({
        id: 'older',
        order_count: 5,
        sort_order: 1,
        created_at: '2026-01-01T10:00:00.000Z'
      }),
      createProduct({
        id: 'newer',
        order_count: 5,
        sort_order: 1,
        created_at: '2026-02-01T10:00:00.000Z'
      })
    ]

    expect(getFeaturedProducts(products).map(p => p.id))
      .toEqual(['newer', 'older'])
  })

  it('respects the requested result limit', () => {
    const products = Array.from({ length: 8 }, (_, index) =>
      createProduct({ id: `product-${index}` })
    )

    expect(getFeaturedProducts(products, 3)).toHaveLength(3)
  })

  it('does not mutate the original product array', () => {
    const products = [
      createProduct({ id: 'second', order_count: 1 }),
      createProduct({ id: 'first', order_count: 10 })
    ]

    const originalOrder = products.map(p => p.id)

    getFeaturedProducts(products)

    expect(products.map(p => p.id)).toEqual(originalOrder)
  })
})

describe('getCategoryProducts', () => {
  it('returns only active products in the requested category', () => {
    const products = [
      createProduct({ id: 'his', category: 'His' }),
      createProduct({ id: 'hers', category: 'Hers' }),
      createProduct({
        id: 'inactive-his',
        category: 'His',
        is_active: false
      })
    ]

    expect(getCategoryProducts(products, 'His').map(p => p.id))
      .toEqual(['his'])
  })

  it('sorts by admin sort order ascending', () => {
    const products = [
      createProduct({ id: 'third', sort_order: 3 }),
      createProduct({ id: 'first', sort_order: 1 }),
      createProduct({ id: 'second', sort_order: 2 })
    ]

    expect(getCategoryProducts(products, 'His').map(p => p.id))
      .toEqual(['first', 'second', 'third'])
  })

  it('uses newest creation date when sort order is equal', () => {
    const products = [
      createProduct({
        id: 'older',
        sort_order: 1,
        created_at: '2026-01-01T10:00:00.000Z'
      }),
      createProduct({
        id: 'newer',
        sort_order: 1,
        created_at: '2026-02-01T10:00:00.000Z'
      })
    ]

    expect(getCategoryProducts(products, 'His').map(p => p.id))
      .toEqual(['newer', 'older'])
  })

  it('respects the requested result limit', () => {
    const products = Array.from({ length: 8 }, (_, index) =>
      createProduct({ id: `product-${index}` })
    )

    expect(getCategoryProducts(products, 'His', 4)).toHaveLength(4)
  })

  it('returns an empty array when no products match', () => {
    const products = [
      createProduct({ category: 'His' })
    ]

    expect(getCategoryProducts(products, 'Lounge')).toEqual([])
  })
})

describe('product sorting: zero sort order', () => {
  it('handles zero sort order when ranking featured products', () => {
    const products = [
      createProduct({
        id: 'older',
        order_count: 0,
        sort_order: 0,
        created_at: '2026-01-01T10:00:00.000Z'
      }),
      createProduct({
        id: 'newer',
        order_count: 0,
        sort_order: 0,
        created_at: '2026-02-01T10:00:00.000Z'
      })
    ]

    expect(getFeaturedProducts(products).map(product => product.id))
      .toEqual(['newer', 'older'])
  })

  it('handles zero sort order when ranking category products', () => {
    const products = [
      createProduct({
        id: 'older',
        sort_order: 0,
        created_at: '2026-01-01T10:00:00.000Z'
      }),
      createProduct({
        id: 'newer',
        sort_order: 0,
        created_at: '2026-02-01T10:00:00.000Z'
      })
    ]

    expect(getCategoryProducts(products, 'His').map(product => product.id))
      .toEqual(['newer', 'older'])
  })
})

describe('product sorting: invalid creation dates', () => {
  it('handles empty and invalid dates when ranking featured products', () => {
    const products = [
      createProduct({ id: 'empty-date', created_at: '' }),
      createProduct({ id: 'invalid-date', created_at: 'not-a-date' }),
      createProduct({ id: 'valid-date', created_at: '2026-03-01T10:00:00.000Z' })
    ]

    expect(getFeaturedProducts(products).map(product => product.id))
      .toEqual(['valid-date', 'empty-date', 'invalid-date'])
  })

  it('handles empty and invalid dates when ranking category products', () => {
    const products = [
      createProduct({ id: 'empty-date', created_at: '' }),
      createProduct({ id: 'invalid-date', created_at: 'not-a-date' }),
      createProduct({ id: 'valid-date', created_at: '2026-03-01T10:00:00.000Z' })
    ]

    expect(getCategoryProducts(products, 'His').map(product => product.id))
      .toEqual(['valid-date', 'empty-date', 'invalid-date'])
  })
})
