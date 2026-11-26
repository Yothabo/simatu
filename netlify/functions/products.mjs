import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';
import { validateProduct, uuidPattern } from './_shared/product-validation.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}

async function saveProduct(body, isUpdate, admin, requestId) {
  const operation = isUpdate ? 'update' : 'create';
  const dbStartedAt = Date.now();

  if (isUpdate) {
    const id = String(body?.id || '');
    if (!uuidPattern.test(id)) {
      return json({ error: 'A valid product ID is required.' }, 400);
    }
  }

  const validation = validateProduct(body);
  if (validation.error) {
    return json({ error: validation.error }, 400);
  }

  const product = validation.product;

  if (admin.role === 'store_admin') {
    if (product.storefront && product.storefront !== admin.store_slug) {
      return json({ error: 'You cannot manage products for another storefront.' }, 403);
    }

    product.storefront = admin.store_slug;
  } else if (!isUpdate && !product.storefront) {
    return json({ error: 'A storefront is required for a new product.' }, 400);
  }

  let client;
  let result;

  try {
    client = await pool.connect();

    await client.query('BEGIN');
    await client.query(
      "SELECT set_config('app.actor_email', $1, true)",
      [admin.email || '']
    );

    // On updates, retain the product's existing storefront.
    // Store admins are restricted to products belonging to their own store.
    let existingProduct = null;

    if (isUpdate) {
      const existing = await client.query(
        `SELECT storefront, category_id, subcategory_id, marketplace_subcategory_id
         FROM public.products
         WHERE id = $1
           AND ($2::text IS NULL OR storefront = $2)
         FOR UPDATE`,
        [body.id, admin.role === 'store_admin' ? admin.store_slug : null]
      );

      if (!existing.rowCount) {
        await client.query('ROLLBACK');
        return json({ error: 'Product not found.' }, 404);
      }

      existingProduct = existing.rows[0];
      product.storefront = existingProduct.storefront;
    }

    const storeResult = await client.query(
      `SELECT id
       FROM public.stores
       WHERE slug = $1`,
      [product.storefront]
    );

    if (!storeResult.rowCount) {
      await client.query('ROLLBACK');
      return json({ error: 'The selected storefront does not exist.' }, 400);
    }

    const storeId = storeResult.rows[0].id;

    // Resolve category IDs within the effective storefront.
    // Legacy Poshies "Spaces" submissions resolve to canonical "Lounge".
    const categoryResult = product.category_id
      ? await client.query(
          `SELECT id, name, is_active
           FROM public.categories
           WHERE id = $1
             AND store_id = $2
             AND (is_active IS TRUE OR id = $3)`,
          [product.category_id, storeId, existingProduct?.category_id ?? null]
        )
      : await client.query(
          `SELECT id, name, is_active
           FROM public.categories
           WHERE store_id = $1
             AND is_active IS TRUE
             AND lower(name) = lower(
               CASE
                 WHEN $2 = 'poshies' AND lower(trim($3)) = 'spaces'
                   THEN 'Lounge'
                 ELSE trim($3)
               END
             )`,
          [storeId, product.storefront, product.category]
        );

    if (!categoryResult.rowCount) {
      await client.query('ROLLBACK');
      return json({ error: 'The selected category is not available in this storefront.' }, 400);
    }

    const category = categoryResult.rows[0];

    // Resolve the subcategory within the selected category and storefront.
    const subcategoryResult = product.subcategory_id
      ? await client.query(
          `SELECT id, name
           FROM public.subcategories
           WHERE id = $1
             AND store_id = $2
             AND category_id = $3
             AND (is_active IS TRUE OR id = $4)
             AND ( $5::boolean IS TRUE OR id = $4 )`,
          [
            product.subcategory_id,
            storeId,
            category.id,
            existingProduct?.subcategory_id ?? null,
            category.is_active,
          ]
        )
      : await client.query(
          `SELECT id, name
           FROM public.subcategories
           WHERE store_id = $1
             AND category_id = $2
             AND is_active IS TRUE
             AND lower(name) = lower(trim($3))`,
          [storeId, category.id, product.subcategory]
        );

    if (!subcategoryResult.rowCount) {
      await client.query('ROLLBACK');
      return json({ error: 'The selected subcategory is not available under this category.' }, 400);
    }

    const subcategory = subcategoryResult.rows[0];

    // Preserve legacy classification when omitted; otherwise validate selected category scope.
    product.marketplace_subcategory_id = product.marketplace_subcategory_id ?? existingProduct?.marketplace_subcategory_id ?? null;
    if (product.marketplace_subcategory_id) {
      const platformSubcategory = await client.query(
        `SELECT msc.id
         FROM public.marketplace_subcategories msc
         JOIN public.marketplace_categories mc ON mc.id = msc.marketplace_category_id
         WHERE msc.id = $1
           AND (msc.is_active IS TRUE OR msc.id = $2)
           AND ($3::text IS NULL OR mc.slug = $3)`,
        [product.marketplace_subcategory_id, existingProduct?.marketplace_subcategory_id ?? null, product.marketplace_category_slug ?? null]
      );
      if (!platformSubcategory.rowCount) {
        await client.query('ROLLBACK');
        return json({ error: 'The selected marketplace subcategory is unavailable.' }, 400);
      }
    }


    const values = [
      product.name,
      product.price,
      category.name,
      subcategory.name,
      product.description,
      product.image_url,
      product.is_active,
      product.sort_order,
      product.storefront,
      storeId,
      category.id,
      subcategory.id,
      product.supplier_cost,
      product.sku,
      product.sizes,
      product.marketplace_visible,
      product.storefront_visible,
      product.marketplace_subcategory_id,
    ];

    if (isUpdate) {
      result = await client.query(
        `UPDATE public.products
         SET name = $1,
             price = $2,
             category = $3,
             subcategory = $4,
             description = $5,
             image_url = $6,
             is_active = $7,
             sort_order = $8,
             storefront = $9,
             store_id = $10,
             category_id = $11,
             subcategory_id = $12,
             supplier_cost = $13,
             sku = $14,
             sizes = $15,
             marketplace_visible = $16,
             storefront_visible = $17,
             marketplace_subcategory_id = $18
         WHERE id = $19
           AND ($20::text IS NULL OR storefront = $20)
         RETURNING id, name, price, supplier_cost, sku, sizes,
                   category, subcategory, description, image_url,
                   is_active, marketplace_visible, storefront_visible,
                   sort_order, storefront, store_id,
                   category_id, subcategory_id, marketplace_subcategory_id, created_at`,
        [
          ...values,
          body.id,
          admin.role === 'store_admin' ? admin.store_slug : null,
        ]
      );
    } else {
      result = await client.query(
        `INSERT INTO public.products
           (name, price, category, subcategory, description, image_url,
            is_active, sort_order, storefront, store_id, category_id,
            subcategory_id, supplier_cost, sku, sizes,
            marketplace_visible, storefront_visible, marketplace_subcategory_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         RETURNING id, name, price, supplier_cost, sku, sizes,
                   category, subcategory, description, image_url,
                   is_active, marketplace_visible, storefront_visible,
                   sort_order, storefront, store_id,
                   category_id, subcategory_id, marketplace_subcategory_id, created_at`,
        values
      );
    }

    if (!result.rowCount) {
      await client.query('ROLLBACK');
      return json({ error: 'Product not found.' }, 404);
    }

    await client.query('COMMIT');

    console.info('[products] save committed', JSON.stringify({
      requestId,
      operation,
      productId: result.rows[0].id,
      storefront: result.rows[0].storefront,
      dbDurationMs: Date.now() - dbStartedAt,
    }));
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }

    console.error('[products] save failed', JSON.stringify({
      requestId,
      operation,
      dbDurationMs: Date.now() - dbStartedAt,
      errorCode: error?.code || null,
      errorMessage: error?.message || 'Unknown database error',
    }));

    throw error;
  } finally {
    client?.release();
  }

  return json(
    { product: result.rows[0] },
    isUpdate ? 200 : 201,
    { 'x-request-id': requestId }
  );
}

async function listProducts(request, requestId) {
  const url = new URL(request.url);
  const isAdminRequest = url.searchParams.get('scope') === 'admin';
  const isMarketplaceRequest = !isAdminRequest && url.searchParams.get('scope') === 'marketplace';
  let requestedStorefront = url.searchParams.get('storefront')?.trim().toLowerCase() || null;

  if (isAdminRequest) {
    const authStartedAt = Date.now();
    const admin = await requireAdmin(request, pool);
    console.info('[admin-data-timing]', JSON.stringify({
      requestId,
      flowId: request.headers.get('x-admin-flow-id') || null,
      endpoint: 'products',
      stage: 'admin_authorization',
      durationMs: Date.now() - authStartedAt,
      outcome: admin ? 'authorized' : 'denied',
    }));

    if (!admin) {
      return json({ error: 'You are not authorised to view products.' }, 401, { 'x-request-id': requestId });
    }

    if (admin.role === 'store_admin') {
      if (requestedStorefront && requestedStorefront !== admin.store_slug) {
        return json({ error: 'You cannot view another storefront.' }, 403);
      }
      requestedStorefront = admin.store_slug;
    }
  }

  const storefrontFilter = requestedStorefront || (isAdminRequest || isMarketplaceRequest ? null : 'yotaabo');
  const filters = [];
  const queryValues = [];

  if (!isAdminRequest) {
    filters.push('is_active = TRUE');
    // Restricted listings are never exposed to public marketplace/storefront APIs.
    filters.push('COALESCE(is_age_restricted, FALSE) = FALSE');
  }
  if (isMarketplaceRequest) filters.push('marketplace_visible = TRUE');
  else if (!isAdminRequest) filters.push('storefront_visible = TRUE');

  if (storefrontFilter) {
    queryValues.push(storefrontFilter);
    filters.push(`storefront = $${queryValues.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const selectedColumns = isAdminRequest
    ? '*'
    : `
        id,
        name,
        price,
        sku,
        sizes,
        storefront,
        marketplace_visible,
        storefront_visible,
        category,
        subcategory,
        description,
        image_url,
        is_active,
        sort_order,
        order_count,
        marketplace_subcategory_id,
        created_at
      `;

  const queryStartedAt = Date.now();
  const result = await pool.query(
    `SELECT ${selectedColumns}
     FROM public.products
     ${whereClause}
     ORDER BY category ASC, sort_order ASC, created_at DESC`,
    queryValues
  );
  console.info('[admin-data-timing]', JSON.stringify({
    requestId,
    flowId: request.headers.get('x-admin-flow-id') || null,
    endpoint: 'products',
    stage: 'products_select',
    durationMs: Date.now() - queryStartedAt,
    rowCount: result.rowCount,
  }));

  return new Response(JSON.stringify({ products: result.rows }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'Cache-Control': isAdminRequest
        ? 'private, no-store'
        : isMarketplaceRequest
          ? 'public, max-age=15, s-maxage=60, stale-while-revalidate=120'
          : 'public, max-age=30, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

async function updateProductStatus(body, admin) {
  const id = String(body?.id || '');

  if (!uuidPattern.test(id)) {
    return json({ error: 'A valid product ID is required.' }, 400);
  }

  if (typeof body?.is_active !== 'boolean') {
    return json({ error: 'A valid product status is required.' }, 400);
  }

  const client = await pool.connect();
  let result;

  try {
    await client.query('BEGIN');
    await client.query(
      "SELECT set_config('app.actor_email', $1, true)",
      [admin.email || '']
    );

    result = await client.query(
      `UPDATE public.products
       SET is_active = $1
       WHERE id = $2
         AND ($3::text IS NULL OR storefront = $3)
       RETURNING id, name, is_active`,
      [body.is_active, id, admin.role === 'store_admin' ? admin.store_slug : null]
    );

    if (!result.rowCount) {
      await client.query('ROLLBACK');
      return json({ error: 'Product not found.' }, 404);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return json({ product: result.rows[0] });
}

async function deleteProduct(body, admin) {
  const id = String(body?.id || '');

  if (!uuidPattern.test(id)) {
    return json({ error: 'A valid product ID is required.' }, 400);
  }

  const client = await pool.connect();
  let result;

  try {
    await client.query('BEGIN');
    await client.query(
      "SELECT set_config('app.actor_email', $1, true)",
      [admin.email || '']
    );

    result = await client.query(
      `DELETE FROM public.products
       WHERE id = $1
         AND ($2::text IS NULL OR storefront = $2)
       RETURNING id, name, image_url, storefront`,
      [id, admin.role === 'store_admin' ? admin.store_slug : null]
    );

    if (!result.rowCount) {
      await client.query('ROLLBACK');
      return json({ error: 'Product not found.' }, 404);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return json({ deleted: result.rows[0] });
}

export default async (request) => {
  const requestId =
    request.headers.get('x-request-id') || globalThis.crypto.randomUUID();
  const requestStartedAt = Date.now();

  try {
    if (request.method === 'GET') {
      const response = await listProducts(request, requestId);
      console.info('[products] request completed', JSON.stringify({
        requestId,
        method: request.method,
        status: response.status,
        totalDurationMs: Date.now() - requestStartedAt,
      }));
      return response;
    }

    if (!['POST', 'PATCH', 'DELETE'].includes(request.method)) {
      return json({ error: 'Method not allowed.' }, 405);
    }

    const admin = await requireAdmin(request, pool);
    if (!admin) {
      return json({ error: 'You are not authorised to manage products.' }, 401);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request body.' }, 400);
    }

    if (request.method === 'DELETE') {
      return await deleteProduct(body, admin);
    }

    if (request.method === 'PATCH' && body?.action === 'set-status') {
      return await updateProductStatus(body, admin);
    }

    const response = await saveProduct(
      body,
      request.method === 'PATCH',
      admin,
      requestId
    );

    console.info('[products] request completed', JSON.stringify({
      requestId,
      method: request.method,
      status: response.status,
      totalDurationMs: Date.now() - requestStartedAt,
    }));

    return response;
  } catch (error) {
    if (
      error?.code === '23505' &&
      error?.constraint === 'products_store_sku_unique'
    ) {
      return json(
        { error: 'This SKU is already assigned to another product in this store.' },
        409,
        { 'x-request-id': requestId }
      );
    }

    console.error('[products] request failed', JSON.stringify({
      requestId,
      method: request.method,
      totalDurationMs: Date.now() - requestStartedAt,
      errorCode: error?.code || null,
      errorMessage: error?.message || 'Unknown error',
    }));

    return json(
      { error: 'Unable to process the product request right now.' },
      500,
      { 'x-request-id': requestId }
    );
  }
};
