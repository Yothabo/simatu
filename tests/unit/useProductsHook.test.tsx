import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, renderHook, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import {
  invalidateProductsCache,
  useProducts,
  type Product
} from '../../src/systems/storefront/core'

let fetchMock: ReturnType<typeof vi.fn>

const product = (overrides: Partial<Product> = {}): Product => ({
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

function mockProducts(products: Product[]) {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ products })
  })
}

function renderProducts(path: string) {
  return renderHook(() => useProducts(), {
    wrapper: ({ children }) => (
      <MemoryRouter
        initialEntries={[path]}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        {children}
      </MemoryRouter>
    )
  })
}

beforeEach(() => {
  invalidateProductsCache()
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  invalidateProductsCache()
  vi.useRealTimers()
})

describe('useProducts network requests', () => {
  it('recovers when cache entries exist without cached values or timestamps', async () => {
    const products = [product()]
    mockProducts(products)

    const originalHas = Map.prototype.has
    const hasSpy = vi.spyOn(Map.prototype, 'has')

    hasSpy.mockImplementation(function (
      this: Map<unknown, unknown>,
      key: unknown
    ) {
      if (key === 'yotaabo' && this.size === 0) {
        return true
      }

      return originalHas.call(this, key)
    })

    try {
      const { result } = renderProducts('/yotaabo')

      await waitFor(() => {
        expect(result.current.products).toEqual(products)
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(fetchMock).toHaveBeenCalledOnce()
    } finally {
      hasSpy.mockRestore()
    }
  })

  it('requests products from the correct Yotaabo endpoint', async () => {
    const products = [product()]
    mockProducts(products)

    const { result } = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(result.current.products).toEqual(products)
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products?storefront=yotaabo',
      { headers: { Accept: 'application/json' } }
    )
  })

  it('requests products from the correct Poshies endpoint', async () => {
    const products = [
      product({ id: 'poshies-1', category: 'Lounge' })
    ]
    mockProducts(products)

    const { result } = renderProducts('/poshies')

    await waitFor(() => {
      expect(result.current.products).toEqual(products)
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products?storefront=poshies',
      expect.any(Object)
    )
  })

  it('returns an empty array when the API products value is not an array', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ products: null })
    })

    const { result } = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.products).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('exposes the API error message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Storefront unavailable.' })
    })

    const { result } = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(result.current.error).toBe('Storefront unavailable.')
    })

    expect(result.current.products).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('uses a fallback message when the API error field is missing', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({})
    })

    const { result } = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(result.current.error).toBe('Unable to load products.')
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('handles network failures', async () => {
    fetchMock.mockRejectedValue(new Error('Network unavailable.'))

    const { result } = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(result.current.error).toBe('Network unavailable.')
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('uses a fallback message for non-Error fetch rejections', async () => {
    fetchMock.mockRejectedValue('raw rejection')

    const { result } = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(result.current.error).toBe('Unable to load products.')
    })

    expect(result.current.isLoading).toBe(false)
  })
})

describe('useProducts storefront transitions', () => {
  it('does not expose previous storefront products while the next request is pending', async () => {
    const yotaaboProducts = [product({ id: 'yotaabo-1' })]
    let resolvePoshies!: (value: unknown) => void

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: yotaaboProducts })
      })
      .mockReturnValueOnce(new Promise(resolve => {
        resolvePoshies = resolve
      }))

    const NavigationControls = () => {
      const navigate = useNavigate()

      return (
        <button onClick={() => navigate('/poshies')}>
          Switch storefront
        </button>
      )
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter
        initialEntries={['/yotaabo']}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <NavigationControls />
        {children}
      </MemoryRouter>
    )

    const { result } = renderHook(() => useProducts(), { wrapper })

    await waitFor(() => {
      expect(result.current.products).toEqual(yotaaboProducts)
      expect(result.current.isLoading).toBe(false)
    })

    screen.getByRole('button', { name: 'Switch storefront' }).click()

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(result.current.products).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })

    resolvePoshies({
      ok: true,
      json: async () => ({
        products: [product({ id: 'poshies-1', category: 'Lounge' })]
      })
    })

    await waitFor(() => {
      expect(result.current.products).toEqual([
        product({ id: 'poshies-1', category: 'Lounge' })
      ])
      expect(result.current.isLoading).toBe(false)
    })
  })
})

describe('useProducts caching', () => {
  it('reuses fresh cached products when the hook is mounted again', async () => {
    const products = [product()]
    mockProducts(products)

    const first = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(first.result.current.products).toEqual(products)
    })

    first.unmount()

    const second = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(second.result.current.products).toEqual(products)
      expect(second.result.current.isLoading).toBe(false)
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps Yotaabo and Poshies caches separate', async () => {
    const yotaaboProducts = [
      product({ id: 'yotaabo-1' })
    ]
    const poshiesProducts = [
      product({ id: 'poshies-1', category: 'Lounge' })
    ]

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: yotaaboProducts })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: poshiesProducts })
      })

    const yotaabo = renderProducts('/yotaabo')
    const poshies = renderProducts('/poshies')

    await waitFor(() => {
      expect(yotaabo.result.current.products).toEqual(yotaaboProducts)
      expect(poshies.result.current.products).toEqual(poshiesProducts)
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('coalesces concurrent requests for the same storefront', async () => {
    const products = [product()]
    let resolveRequest!: (value: unknown) => void

    fetchMock.mockReturnValue(
      new Promise(resolve => {
        resolveRequest = resolve
      })
    )

    const first = renderProducts('/yotaabo')
    const second = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    resolveRequest({
      ok: true,
      json: async () => ({ products })
    })

    await waitFor(() => {
      expect(first.result.current.products).toEqual(products)
      expect(second.result.current.products).toEqual(products)
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('fetches fresh products after cache invalidation', async () => {
    const originalProducts = [product()]
    const updatedProducts = [
      product({ id: 'updated-product', name: 'Updated Fragrance' })
    ]

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: originalProducts })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: updatedProducts })
      })

    const first = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(first.result.current.products).toEqual(originalProducts)
    })

    first.unmount()
    invalidateProductsCache()

    const second = renderProducts('/yotaabo')

    await waitFor(() => {
      expect(second.result.current.products).toEqual(updatedProducts)
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
