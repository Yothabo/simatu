import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  poolQuery: vi.fn(),
  connect: vi.fn(),
  clientQuery: vi.fn(),
  release: vi.fn(),
  clientResponses: [] as unknown[],
}));

vi.mock('pg', () => ({
  Pool: class {
    constructor() {
      return {
        query: mocks.poolQuery,
        connect: mocks.connect,
      };
    }
  },
}));

vi.mock('../../netlify/functions/_shared/auth.mjs', () => ({
  requireAdmin: mocks.requireAdmin,
}));

import handler from '../../netlify/functions/products.mjs';

const superAdmin = {
  id: 'admin-1',
  email: 'admin@example.com',
  role: 'super_admin',
  store_id: null,
  store_slug: null,
};

const yotaaboAdmin = {
  id: 'admin-2',
  email: 'yotaabo@example.com',
  role: 'store_admin',
  store_id: 'store-y',
  store_slug: 'yotaabo',
};

const validProduct = () => ({
  name: 'Test Fragrance',
  price: 199.99,
  storefront: 'yotaabo',
  category: '',
  subcategory: '',
  marketplace_category_slug: 'fashion',
  marketplace_subcategory_id: '223e4567-e89b-42d3-a456-426614174000',
  is_active: true,
  sort_order: 0,
});

const validId = '123e4567-e89b-42d3-a456-426614174000';

function makeRequest(
  method: string,
  body?: unknown,
  query = '',
  options: { authenticated?: boolean; rawBody?: string } = {},
) {
  const headers = new Headers();

  if (options.authenticated !== false) {
    headers.set('authorization', 'Bearer test-token');
  }

  if (body !== undefined || options.rawBody !== undefined) {
    headers.set('content-type', 'application/json');
  }

  return new Request(
    `https://example.test/.netlify/functions/products${query}`,
    {
      method,
      headers,
      body:
        options.rawBody !== undefined
          ? options.rawBody
          : body === undefined
            ? undefined
            : JSON.stringify(body),
    },
  );
}

async function readResponse(response: Response) {
  return {
    status: response.status,
    body: await response.json(),
  };
}

function queueClientResponses(...responses: unknown[]) {
  mocks.clientResponses.push(...responses);
}

const emptyResult = () => ({ rowCount: 0, rows: [] });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.clientResponses.length = 0;

  mocks.requireAdmin.mockResolvedValue(superAdmin);
  mocks.poolQuery.mockResolvedValue(emptyResult());

  mocks.clientQuery.mockImplementation(async () => {
    const next = mocks.clientResponses.shift();

    if (next instanceof Error) {
      throw next;
    }

    return next ?? emptyResult();
  });

  mocks.connect.mockResolvedValue({
    query: mocks.clientQuery,
    release: mocks.release,
  });
});

describe('products API: HTTP contract', () => {
  it('rejects unsupported HTTP methods', async () => {
    const result = await readResponse(
      await handler(makeRequest('PUT')),
    );

    expect(result).toEqual({
      status: 405,
      body: { error: 'Method not allowed.' },
    });
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated product management requests', async () => {
    mocks.requireAdmin.mockResolvedValue(null);

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(401);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON', async () => {
    const result = await readResponse(
      await handler(
        makeRequest('POST', undefined, '', {
          rawBody: '{"name":',
        }),
      ),
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Invalid request body.');
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('rejects invalid storefront filters before querying the database', async () => {
    const result = await readResponse(
      await handler(makeRequest('GET', undefined, '?storefront=unknown')),
    );

    expect(result.status).toBe(400);
    expect(mocks.poolQuery).not.toHaveBeenCalled();
  });
});

describe('products API: public listing', () => {
  it('defaults public requests to active Yotaabo products', async () => {
    mocks.poolQuery.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: validId, storefront: 'yotaabo' }],
    });

    const response = await handler(makeRequest('GET'));
    const result = await readResponse(response);

    expect(result.status).toBe(200);
    expect(result.body.products).toHaveLength(1);

    const sql = mocks.poolQuery.mock.calls[0][0];

    expect(sql).toContain('id');
    expect(sql).toContain('name');
    expect(sql).toContain('price');
    expect(sql).toContain('is_active = TRUE');
    expect(sql).not.toContain('SELECT *');
    expect(sql).not.toContain('supplier_cost');
    expect(sql).not.toContain('sku');

    expect(mocks.poolQuery).toHaveBeenCalledWith(
      expect.stringContaining('is_active = TRUE'),
      ['yotaabo'],
    );
    expect(response.headers.get('cache-control')).toContain('public');
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });

  it('allows public requests to select Poshies', async () => {
    await handler(
      makeRequest('GET', undefined, '?storefront=poshies'),
    );

    expect(mocks.poolQuery).toHaveBeenCalledWith(
      expect.stringContaining('storefront = $1'),
      ['poshies'],
    );
  });

  it('does not expose inactive products in public listings', async () => {
    await handler(makeRequest('GET'));

    const sql = mocks.poolQuery.mock.calls[0][0];

    expect(sql).toContain('is_active = TRUE');
  });

  it('requires published shared taxonomy membership for marketplace listings', async () => {
    await handler(makeRequest('GET', undefined, '?scope=marketplace'));

    const sql = mocks.poolQuery.mock.calls[0][0];

    expect(sql).toContain('marketplace_visible = TRUE');
    expect(sql).toContain('FROM public.marketplace_subcategories msc');
    expect(sql).toContain("mc.publication_status = 'published'");
    expect(sql).toContain("msc.publication_status = 'published'");
    expect(sql).toContain('public.store_marketplace_categories');
  });

  it('keeps legacy storefront products readable during the classification transition', async () => {
    await handler(makeRequest('GET'));

    const sql = mocks.poolQuery.mock.calls[0][0];

    expect(sql).not.toContain('FROM public.marketplace_subcategories msc');
  });
});

describe('products API: admin listing', () => {
  it('rejects unauthenticated admin listing requests', async () => {
    mocks.requireAdmin.mockResolvedValue(null);

    const result = await readResponse(
      await handler(makeRequest('GET', undefined, '?scope=admin')),
    );

    expect(result.status).toBe(401);
    expect(mocks.poolQuery).not.toHaveBeenCalled();
  });

  it('allows a super admin to list all storefronts', async () => {
    const response = await handler(
      makeRequest('GET', undefined, '?scope=admin'),
    );

    expect(response.headers.get('cache-control')).toBe('private, no-store');

    const sql = mocks.poolQuery.mock.calls[0][0];

    expect(sql).toContain('SELECT *');
    expect(mocks.poolQuery).toHaveBeenCalledWith(
      expect.not.stringContaining('WHERE'),
      [],
    );
  });

  it('restricts a store admin to their own storefront', async () => {
    mocks.requireAdmin.mockResolvedValue(yotaaboAdmin);

    await handler(makeRequest('GET', undefined, '?scope=admin'));

    expect(mocks.poolQuery).toHaveBeenCalledWith(
      expect.stringContaining('storefront = $1'),
      ['yotaabo'],
    );
  });

  it('rejects a store admin requesting another storefront', async () => {
    mocks.requireAdmin.mockResolvedValue(yotaaboAdmin);

    const result = await readResponse(
      await handler(
        makeRequest('GET', undefined, '?scope=admin&storefront=poshies'),
      ),
    );

    expect(result.status).toBe(403);
    expect(mocks.poolQuery).not.toHaveBeenCalled();
  });
});

describe('products API: product creation', () => {
  it('returns 409 when a SKU already exists in the selected store', async () => {
    const duplicateSkuError = Object.assign(
      new Error('Duplicate SKU database detail'),
      {
        code: '23505',
        constraint: 'products_store_sku_unique',
      },
    );

    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      { rowCount: 1, rows: [{ id: 'store-y' }] }, // Store
      {
        rowCount: 1,
        rows: [{
          category_id: 'category-y',
          category_name: 'Fashion',
          subcategory_id: 'subcategory-y',
          subcategory_name: 'Eau de Parfum',
        }],
      }, // Assigned shared taxonomy
      duplicateSkuError, // INSERT
      emptyResult(), // ROLLBACK
    );

    const result = await readResponse(
      await handler(makeRequest('POST', {
        ...validProduct(),
        sku: 'TEST-SKU-001',
      })),
    );

    expect(result.status).toBe(409);
    expect(result.body.error).toBe(
      'This SKU is already assigned to another product in this store.',
    );
    expect(result.body.error).not.toContain('Duplicate SKU');
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('rejects invalid product data before connecting', async () => {
    const result = await readResponse(
      await handler(makeRequest('POST', {
        ...validProduct(),
        name: '',
      })),
    );

    expect(result.status).toBe(400);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('rejects a storefront that does not exist and rolls back', async () => {
    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      emptyResult(), // storefront lookup
      emptyResult(), // ROLLBACK
    );

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toBe(
      'The selected storefront does not exist.',
    );
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('returns not found when the product insert returns no row', async () => {
    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      { rowCount: 1, rows: [{ id: 'store-y' }] },
      {
        rowCount: 1,
        rows: [{
          category_id: 'category-y',
          category_name: 'Fashion',
          subcategory_id: 'subcategory-y',
          subcategory_name: 'Eau de Parfum',
        }],
      },
      emptyResult(), // INSERT
      emptyResult(), // ROLLBACK
    );

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(404);
    expect(result.body.error).toBe('Product not found.');
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('requires a storefront for super-admin product creation', async () => {
    const product = validProduct();
    delete (product as Partial<typeof product>).storefront;

    const result = await readResponse(
      await handler(makeRequest('POST', product)),
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toBe(
      'A storefront is required for a new product.',
    );
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('prevents a store admin from creating products for another storefront', async () => {
    mocks.requireAdmin.mockResolvedValue(yotaaboAdmin);

    const result = await readResponse(
      await handler(
        makeRequest('POST', {
          ...validProduct(),
          storefront: 'poshies',
        }),
      ),
    );

    expect(result.status).toBe(403);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('uses an empty actor email when the admin email is missing', async () => {
    mocks.requireAdmin.mockResolvedValue({
      ...superAdmin,
      email: undefined,
    });

    queueClientResponses(
      emptyResult(),
      emptyResult(),
      { rowCount: 1, rows: [{ id: 'store-y' }] },
      {
        rowCount: 1,
        rows: [{
          category_id: 'category-y',
          category_name: 'Fashion',
          subcategory_id: 'subcategory-y',
          subcategory_name: 'Eau de Parfum',
        }],
      },
      {
        rowCount: 1,
        rows: [{ id: validId, name: 'Test Fragrance' }],
      },
    );

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(201);
    expect(mocks.clientQuery).toHaveBeenCalledWith(
      "SELECT set_config('app.actor_email', $1, true)",
      [''],
    );
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('forces a store admin product into their own storefront', async () => {
    mocks.requireAdmin.mockResolvedValue(yotaaboAdmin);

    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      { rowCount: 1, rows: [{ id: 'store-y' }] },
      {
        rowCount: 1,
        rows: [{
          category_id: 'category-y',
          category_name: 'Fashion',
          subcategory_id: 'subcategory-y',
          subcategory_name: 'Eau de Parfum',
        }],
      },
      {
        rowCount: 1,
        rows: [{
          id: validId,
          name: 'Test Fragrance',
          storefront: 'yotaabo',
        }],
      },
    );

    const product = validProduct();
    delete (product as Partial<typeof product>).storefront;

    const result = await readResponse(
      await handler(makeRequest('POST', product)),
    );

    expect(result.status).toBe(201);

    const storeLookup = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('FROM public.stores'),
    );

    expect(storeLookup?.[1]).toEqual(['yotaabo']);

    const insert = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('INSERT INTO public.products'),
    );

    expect(insert?.[1][8]).toBe('yotaabo');
    expect(mocks.clientQuery).toHaveBeenCalledWith(
      'COMMIT',
    );
    expect(mocks.release).toHaveBeenCalledOnce();
  });
});

describe('products API: product updates', () => {
  it('rejects a missing product ID before connecting', async () => {
    const result = await readResponse(
      await handler(makeRequest('PATCH', validProduct())),
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('A valid product ID is required.');
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('rejects an invalid product ID before connecting', async () => {
    const result = await readResponse(
      await handler(
        makeRequest('PATCH', {
          ...validProduct(),
          id: 'not-a-uuid',
        }),
      ),
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toBe('A valid product ID is required.');
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('does not restrict a super-admin update to a storefront', async () => {
    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      {
        rowCount: 1,
        rows: [{
          storefront: 'yotaabo',
          category_id: null,
          subcategory_id: null,
        }],
      }, // Existing product
      { rowCount: 1, rows: [{ id: 'store-y' }] },
      {
        rowCount: 1,
        rows: [{
          category_id: 'category-y',
          category_name: 'Fashion',
          subcategory_id: 'subcategory-y',
          subcategory_name: 'Eau de Parfum',
        }],
      },
      { rowCount: 1, rows: [{ id: validId, name: 'Test Fragrance' }] },
      emptyResult(), // COMMIT
    );

    const result = await readResponse(
      await handler(makeRequest('PATCH', {
        ...validProduct(),
        id: validId,
      })),
    );

    expect(result.status).toBe(200);

    const lookup = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('FOR UPDATE'),
    );
    const update = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('UPDATE public.products'),
    );

    expect(lookup?.[1]).toEqual([validId, null]);
    expect(update?.[1][18]).toBe(validId);
    expect(update?.[1][19]).toBeNull();
    expect(mocks.clientQuery).toHaveBeenCalledWith('COMMIT');
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('scopes a successful store-admin update to their own storefront', async () => {
    mocks.requireAdmin.mockResolvedValue(yotaaboAdmin);

    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      {
        rowCount: 1,
        rows: [{
          storefront: 'yotaabo',
          category_id: null,
          subcategory_id: null,
        }],
      }, // Existing product
      { rowCount: 1, rows: [{ id: 'store-y' }] },
      {
        rowCount: 1,
        rows: [{
          category_id: 'category-y',
          category_name: 'Fashion',
          subcategory_id: 'subcategory-y',
          subcategory_name: 'Eau de Parfum',
        }],
      },
      { rowCount: 1, rows: [{ id: validId, name: 'Test Fragrance' }] },
      emptyResult(), // COMMIT
    );

    const result = await readResponse(
      await handler(makeRequest('PATCH', {
        ...validProduct(),
        id: validId,
      })),
    );

    expect(result.status).toBe(200);

    const lookup = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('FOR UPDATE'),
    );
    const update = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('UPDATE public.products'),
    );

    expect(lookup?.[1]).toEqual([validId, 'yotaabo']);
    expect(update?.[1][18]).toBe(validId);
    expect(update?.[1][19]).toBe('yotaabo');
    expect(mocks.clientQuery).toHaveBeenCalledWith('COMMIT');
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('scopes store-admin product lookup to their own storefront', async () => {
    mocks.requireAdmin.mockResolvedValue(yotaaboAdmin);

    queueClientResponses(
      emptyResult(),
      emptyResult(),
      emptyResult(),
    );

    const result = await readResponse(
      await handler(
        makeRequest('PATCH', {
          ...validProduct(),
          id: validId,
        }),
      ),
    );

    expect(result.status).toBe(404);

    const lookup = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('FOR UPDATE'),
    );

    expect(lookup?.[1]).toEqual([validId, 'yotaabo']);
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();
  });
});

describe('products API: status changes', () => {
  it('uses an empty actor email when the admin email is missing', async () => {
    mocks.requireAdmin.mockResolvedValue({
      ...superAdmin,
      email: undefined,
    });

    queueClientResponses(
      emptyResult(),
      emptyResult(),
      { rowCount: 1, rows: [{ id: validId, name: 'Test Fragrance', is_active: false }] },
      emptyResult(),
    );

    const result = await readResponse(
      await handler(makeRequest('PATCH', {
        action: 'set-status',
        id: validId,
        is_active: false,
      })),
    );

    expect(result.status).toBe(200);
    expect(mocks.clientQuery).toHaveBeenCalledWith(
      "SELECT set_config('app.actor_email', $1, true)",
      [''],
    );
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('returns not found and rolls back when no product matches', async () => {
    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      emptyResult(), // UPDATE
      emptyResult(), // ROLLBACK
    );

    const result = await readResponse(
      await handler(makeRequest('PATCH', {
        action: 'set-status',
        id: validId,
        is_active: false,
      })),
    );

    expect(result.status).toBe(404);
    expect(result.body.error).toBe('Product not found.');
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('returns a generic error and releases after a status query failure', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      new Error('Sensitive status query failure'),
      emptyResult(), // ROLLBACK
    );

    const result = await readResponse(
      await handler(makeRequest('PATCH', {
        action: 'set-status',
        id: validId,
        is_active: false,
      })),
    );

    expect(result.status).toBe(500);
    expect(result.body.error).toBe(
      'Unable to process the product request right now.',
    );
    expect(result.body.error).not.toContain('Sensitive');
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });

  it('rejects a missing product ID before connecting', async () => {
    const result = await readResponse(
      await handler(makeRequest('PATCH', {
        action: 'set-status',
        is_active: true,
      })),
    );

    expect(result.status).toBe(400);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('rejects invalid product IDs', async () => {
    const result = await readResponse(
      await handler(
        makeRequest('PATCH', {
          action: 'set-status',
          id: 'invalid',
          is_active: true,
        }),
      ),
    );

    expect(result.status).toBe(400);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('rejects non-boolean product status values', async () => {
    const result = await readResponse(
      await handler(
        makeRequest('PATCH', {
          action: 'set-status',
          id: validId,
          is_active: 'false',
        }),
      ),
    );

    expect(result.status).toBe(400);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('scopes status updates to the store admin storefront', async () => {
    mocks.requireAdmin.mockResolvedValue(yotaaboAdmin);

    queueClientResponses(
      emptyResult(),
      emptyResult(),
      {
        rowCount: 1,
        rows: [{ id: validId, name: 'Test Fragrance', is_active: false }],
      },
    );

    const result = await readResponse(
      await handler(
        makeRequest('PATCH', {
          action: 'set-status',
          id: validId,
          is_active: false,
        }),
      ),
    );

    expect(result.status).toBe(200);

    const update = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('UPDATE public.products'),
    );

    expect(update?.[1]).toEqual([false, validId, 'yotaabo']);
    expect(mocks.release).toHaveBeenCalledOnce();
  });
});

describe('products API: deletion', () => {
  it('uses an empty actor email when the admin email is missing', async () => {
    mocks.requireAdmin.mockResolvedValue({
      ...superAdmin,
      email: undefined,
    });

    queueClientResponses(
      emptyResult(),
      emptyResult(),
      {
        rowCount: 1,
        rows: [{
          id: validId,
          name: 'Test Fragrance',
          image_url: null,
          storefront: 'yotaabo',
        }],
      },
      emptyResult(),
    );

    const result = await readResponse(
      await handler(makeRequest('DELETE', { id: validId })),
    );

    expect(result.status).toBe(200);
    expect(mocks.clientQuery).toHaveBeenCalledWith(
      "SELECT set_config('app.actor_email', $1, true)",
      [''],
    );
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('deletes a product and commits the transaction', async () => {
    const deletedProduct = {
      id: validId,
      name: 'Test Fragrance',
      image_url: null,
      storefront: 'yotaabo',
    };

    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      { rowCount: 1, rows: [deletedProduct] }, // DELETE
      emptyResult(), // COMMIT
    );

    const result = await readResponse(
      await handler(makeRequest('DELETE', { id: validId })),
    );

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ deleted: deletedProduct });
    expect(mocks.clientQuery).toHaveBeenCalledWith('COMMIT');
    expect(mocks.clientQuery).not.toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();
  });

  it('returns a generic error and rolls back after a deletion query failure', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      new Error('Sensitive deletion query failure'),
      emptyResult(), // ROLLBACK
    );

    const result = await readResponse(
      await handler(makeRequest('DELETE', { id: validId })),
    );

    expect(result.status).toBe(500);
    expect(result.body.error).toBe(
      'Unable to process the product request right now.',
    );
    expect(result.body.error).not.toContain('Sensitive');
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });

  it('rejects a missing product ID before connecting', async () => {
    const result = await readResponse(
      await handler(makeRequest('DELETE', {})),
    );

    expect(result.status).toBe(400);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('rejects invalid product IDs', async () => {
    const result = await readResponse(
      await handler(makeRequest('DELETE', { id: 'invalid' })),
    );

    expect(result.status).toBe(400);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it('scopes deletion to the store admin storefront', async () => {
    mocks.requireAdmin.mockResolvedValue(yotaaboAdmin);

    queueClientResponses(
      emptyResult(),
      emptyResult(),
      emptyResult(),
    );

    const result = await readResponse(
      await handler(makeRequest('DELETE', { id: validId })),
    );

    expect(result.status).toBe(404);

    const deletion = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('DELETE FROM public.products'),
    );

    expect(deletion?.[1]).toEqual([validId, 'yotaabo']);
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();
  });
});

describe('products API: database failure handling', () => {
  it('returns a generic error and releases the connection after a query failure', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mocks.clientQuery.mockImplementationOnce(async () => {
      throw new Error('Sensitive database details');
    });

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(500);
    expect(result.body.error).toBe(
      'Unable to process the product request right now.',
    );
    expect(result.body.error).not.toContain('Sensitive');
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });
});

describe('products API: shared marketplace classification', () => {
  it('rejects a subcategory that is not assigned to the selected store', async () => {
    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      { rowCount: 1, rows: [{ id: 'store-y' }] }, // Store
      emptyResult(), // Shared taxonomy + store assignment
      emptyResult(), // ROLLBACK
    );

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toContain('category assigned to this store');
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
  });

  it('persists shared category labels and leaves legacy store category IDs null', async () => {
    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      { rowCount: 1, rows: [{ id: 'store-y' }] }, // Store
      {
        rowCount: 1,
        rows: [{
          category_id: 'market-category',
          category_name: 'Fashion',
          subcategory_id: '223e4567-e89b-42d3-a456-426614174000',
          subcategory_name: 'Fragrance',
        }],
      }, // Assigned shared taxonomy
      { rowCount: 1, rows: [{ id: validId, name: 'Test Fragrance' }] }, // INSERT
      emptyResult(), // COMMIT
    );

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(201);
    const insert = mocks.clientQuery.mock.calls.find(
      ([sql]) => String(sql).includes('INSERT INTO public.products'),
    );
    expect(insert?.[1][2]).toBe('Fashion');
    expect(insert?.[1][3]).toBe('Fragrance');
    expect(insert?.[1][10]).toBeNull();
    expect(insert?.[1][11]).toBeNull();
    expect(insert?.[1][17]).toBe('223e4567-e89b-42d3-a456-426614174000');
  });
});

describe('products API: transaction failure edge cases', () => {
  it('rolls back and releases the connection when COMMIT fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    queueClientResponses(
      emptyResult(), // BEGIN
      emptyResult(), // set_config
      { rowCount: 1, rows: [{ id: 'store-y' }] },
      {
        rowCount: 1,
        rows: [{
          category_id: 'category-y',
          category_name: 'Fashion',
          subcategory_id: 'subcategory-y',
          subcategory_name: 'Eau de Parfum',
        }],
      },
      {
        rowCount: 1,
        rows: [{ id: validId }],
      },
      new Error('Commit failed'),
      emptyResult(), // ROLLBACK
    );

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(500);
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });

  it('still releases the connection when ROLLBACK itself fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mocks.clientQuery
      .mockRejectedValueOnce(new Error('Original database failure'))
      .mockRejectedValueOnce(new Error('Rollback also failed'));

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(500);
    expect(mocks.clientQuery).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });

  it('returns a generic error when a database connection cannot be acquired', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mocks.connect.mockRejectedValueOnce(
      new Error('Database connection refused'),
    );

    const result = await readResponse(
      await handler(makeRequest('POST', validProduct())),
    );

    expect(result.status).toBe(500);
    expect(result.body.error).toBe(
      'Unable to process the product request right now.',
    );
    expect(mocks.release).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
