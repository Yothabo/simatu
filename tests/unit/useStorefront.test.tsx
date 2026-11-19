import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useStorefront } from '../../src/systems/storefront/core'

function renderStorefront(path: string) {
  return renderHook(() => useStorefront(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[path]}>
        {children}
      </MemoryRouter>
    )
  })
}

describe('useStorefront', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })
  it('selects Yotaabo for the root path', () => {
    const { result } = renderStorefront('/')

    expect(result.current.name).toBe('Yotaabo')
    expect(result.current.basePath).toBe('/yotaabo')
    expect(result.current.categoryOrder).toEqual([
      'His',
      'Hers',
      'Spaces'
    ])
  })

  it('selects Yotaabo for its storefront routes', () => {
    const { result } = renderStorefront('/yotaabo/products')

    expect(result.current.name).toBe('Yotaabo')
  })

  it('selects Poshies for its root route', () => {
    const { result } = renderStorefront('/poshies')

    expect(result.current.name).toBe('Poshies')
    expect(result.current.basePath).toBe('/poshies')
    expect(result.current.categoryOrder).toEqual([
      'Hers',
      'His',
      'Lounge'
    ])
  })

  it('selects Poshies for nested routes', () => {
    const { result } = renderStorefront('/poshies/products')

    expect(result.current.name).toBe('Poshies')
  })

  it('does not mistake a similar unrelated path for Poshies', () => {
    const { result } = renderStorefront('/poshies-extra')

    expect(result.current.name).toBe('Yotaabo')
  })

  it('generates storefront URLs without duplicate slashes', () => {
    const { result } = renderStorefront('/poshies')

    expect(result.current.pathFor()).toBe('/poshies')
    expect(result.current.pathFor('products')).toBe('/poshies/products')
    expect(result.current.pathFor('/products')).toBe('/poshies/products')
  })

  it('uses the configured storefront accent colours', () => {
    const yotaabo = renderStorefront('/yotaabo')
    const poshies = renderStorefront('/poshies')

    expect(yotaabo.result.current.primaryAccent).toBe('#8aa89b')
    expect(poshies.result.current.primaryAccent).toBe('#ff1493')
  })
})
