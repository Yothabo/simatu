import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function json(data, status = 200, admin = false) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': admin
        ? 'private, no-store'
        : 'public, max-age=30, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

function nameValue(value) {
  if (typeof value !== 'string') return null;
  const name = value.trim();
  return name && name.length <= 120 &&
    !/[\u0000-\u001f\u007f]/.test(name) ? name : null;
}

function slugValue(value, name) {
  const slug = typeof value === 'string' && value.trim()
    ? value.trim().toLowerCase()
    : name.normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

  return SLUG.test(slug) ? slug : null;
}

function sortValue(value) {
  if (value === undefined || value === null || value === '') return 0;
  return Number.isSafeInteger(value) ? value : null;
}

async function withWrite(admin, callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      "SELECT set_config('app.actor_email', $1, true)",
      [admin.email || '']
    );

    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function resolveStore(client, admin, value) {
  const storefront = String(value || '').trim().toLowerCase();

  if (!SLUG.test(storefront)) {
    throw Object.assign(new Error('A valid storefront is required.'), {
      status: 400,
    });
  }

  if (admin.role === 'store_admin' &&
      storefront !== admin.store_slug) {
    throw Object.assign(new Error('You cannot manage another storefront.'), {
      status: 403,
    });
  }

  const result = await client.query(
    `SELECT id, slug
     FROM public.stores
     WHERE slug = $1 AND is_active IS TRUE`,
    [storefront]
  );

  if (!result.rowCount) {
    throw Object.assign(new Error('Storefront not found.'), {
      status: 404,
    });
  }

  return result.rows[0];
}

async function createEntity(body, admin, entity) {
  const name = nameValue(body?.name);
  const slug = name ? slugValue(body?.slug, name) : null;
  const sortOrder = sortValue(body?.sort_order);
  const isActive = body?.is_active === undefined
    ? true
    : body.is_active;

  if (!name) throw Object.assign(new Error('A valid name is required.'), { status: 400 });
  if (!slug) throw Object.assign(new Error('A valid slug is required.'), { status: 400 });
  if (sortOrder === null) throw Object.assign(new Error('Sort order must be an integer.'), { status: 400 });
  if (typeof isActive !== 'boolean') throw Object.assign(new Error('Status must be boolean.'), { status: 400 });

  return withWrite(admin, async (client) => {
    const store = await resolveStore(client, admin, body.storefront);

    if (entity === 'category') {
      const result = await client.query(
        `INSERT INTO public.categories
           (store_id, name, slug, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, slug, sort_order, is_active`,
        [store.id, name, slug, sortOrder, isActive]
      );

      return json({ category: result.rows[0] }, 201, true);
    }

    const categoryId = String(body.category_id || '');

    if (!UUID.test(categoryId)) {
      throw Object.assign(new Error('A valid parent category is required.'), { status: 400 });
    }

    const parent = await client.query(
      `SELECT id, is_active
       FROM public.categories
       WHERE id = $1 AND store_id = $2
       FOR UPDATE`,
      [categoryId, store.id]
    );

    if (!parent.rowCount) {
      throw Object.assign(new Error('Parent category not found.'), { status: 404 });
    }

    if (isActive && !parent.rows[0].is_active) {
      throw Object.assign(new Error('Activate the parent category first.'), { status: 400 });
    }

    const result = await client.query(
      `INSERT INTO public.subcategories
         (store_id, category_id, name, slug, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, category_id, name, slug, sort_order, is_active`,
      [store.id, categoryId, name, slug, sortOrder, isActive]
    );

    return json({ subcategory: result.rows[0] }, 201, true);
  });
}

async function updateEntity(body, admin, entity) {
  const id = String(body?.id || '');
  const name = nameValue(body?.name);
  const slug = name ? slugValue(body?.slug, name) : null;
  const sortOrder = sortValue(body?.sort_order);

  if (!UUID.test(id)) throw Object.assign(new Error('A valid ID is required.'), { status: 400 });
  if (!name) throw Object.assign(new Error('A valid name is required.'), { status: 400 });
  if (!slug) throw Object.assign(new Error('A valid slug is required.'), { status: 400 });
  if (sortOrder === null) throw Object.assign(new Error('Sort order must be an integer.'), { status: 400 });

  return withWrite(admin, async (client) => {
    const store = await resolveStore(client, admin, body.storefront);
    const table = entity === 'category' ? 'categories' : 'subcategories';

    const locked = await client.query(
      `SELECT id FROM public.${table}
       WHERE id = $1 AND store_id = $2
       FOR UPDATE`,
      [id, store.id]
    );

    if (!locked.rowCount) {
      throw Object.assign(new Error(`${entity} not found.`), { status: 404 });
    }

    const result = await client.query(
      `UPDATE public.${table}
       SET name = $1,
           slug = $2,
           sort_order = $3,
           updated_at = NOW()
       WHERE id = $4 AND store_id = $5
       RETURNING id, name, slug, sort_order, is_active`,
      [name, slug, sortOrder, id, store.id]
    );

    return json({ [entity]: result.rows[0] }, 200, true);
  });
}

async function setStatus(body, admin) {
  const { entity, is_active: isActive } = body || {};
  const id = String(body?.id || '');

  if (!['category', 'subcategory'].includes(entity)) {
    throw Object.assign(new Error('Invalid category entity.'), { status: 400 });
  }
  if (!UUID.test(id)) {
    throw Object.assign(new Error('A valid ID is required.'), { status: 400 });
  }
  if (typeof isActive !== 'boolean') {
    throw Object.assign(new Error('Status must be boolean.'), { status: 400 });
  }

  return withWrite(admin, async (client) => {
    const store = await resolveStore(client, admin, body.storefront);
    const table = entity === 'category' ? 'categories' : 'subcategories';

    const result = await client.query(
      `UPDATE public.${table}
       SET is_active = $1, updated_at = NOW()
       WHERE id = $2 AND store_id = $3
       RETURNING id, name, slug, sort_order, is_active`,
      [isActive, id, store.id]
    );

    if (!result.rowCount) {
      throw Object.assign(new Error(`${entity} not found.`), { status: 404 });
    }

    return json({ [entity]: result.rows[0] }, 200, true);
  });
}

async function listCategories(request) {
  const url = new URL(request.url);
  const isAdmin = url.searchParams.get('scope') === 'admin';
  let storefront = (url.searchParams.get('storefront') || 'yotaabo')
    .trim()
    .toLowerCase();

  if (!SLUG.test(storefront)) {
    return json({ error: 'Invalid storefront.' }, 400, isAdmin);
  }

  const storeResult = await pool.query(
    'SELECT id FROM public.stores WHERE slug = $1 AND is_active IS TRUE',
    [storefront]
  );
  if (!storeResult.rowCount) {
    return json({ error: 'Storefront not found.' }, 404, isAdmin);
  }

  if (isAdmin) {
    const admin = await requireAdmin(request, pool);

    if (!admin) {
      return json({ error: 'You are not authorised to view categories.' }, 401, true);
    }

    if (admin.role === 'store_admin' &&
        storefront !== admin.store_slug) {
      return json({ error: 'You cannot view another storefront.' }, 403, true);
    }

    if (admin.role === 'store_admin') {
      storefront = admin.store_slug;
    }
  }

  const result = await pool.query(
    `SELECT
       c.id,
       c.name,
       c.slug,
       c.sort_order,
       c.is_active,
       COALESCE(
         json_agg(
           json_build_object(
             'id', sc.id,
             'name', sc.name,
             'slug', sc.slug,
             'sort_order', sc.sort_order,
             'is_active', sc.is_active
           )
           ORDER BY sc.sort_order, sc.name
         ) FILTER (WHERE sc.id IS NOT NULL),
         '[]'::json
       ) AS subcategories
     FROM public.categories c
     JOIN public.stores s ON s.id = c.store_id
     LEFT JOIN public.subcategories sc
       ON sc.category_id = c.id
      AND sc.store_id = c.store_id
      AND ($2::boolean IS TRUE OR sc.is_active IS TRUE)
     WHERE s.slug = $1
       AND ($2::boolean IS TRUE OR c.is_active IS TRUE)
     GROUP BY c.id, c.name, c.slug, c.sort_order, c.is_active
     ORDER BY c.sort_order, c.name`,
    [storefront, isAdmin]
  );

  return json({ storefront, categories: result.rows }, 200, isAdmin);
}

export default async (request) => {
  const url = new URL(request.url);
  const isAdminRequest =
    request.method !== 'GET' ||
    url.searchParams.get('scope') === 'admin';

  try {
    if (request.method === 'GET') {
      return await listCategories(request);
    }

    if (!['POST', 'PATCH'].includes(request.method)) {
      return json({ error: 'Method not allowed.' }, 405, isAdminRequest);
    }

    const admin = await requireAdmin(request, pool);

    if (!admin) {
      return json({ error: 'You are not authorised to manage categories.' }, 401, true);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid request body.' }, 400, true);
    }

    if (request.method === 'POST') {
      if (body?.action === 'create-category') {
        return await createEntity(body, admin, 'category');
      }

      if (body?.action === 'create-subcategory') {
        return await createEntity(body, admin, 'subcategory');
      }
    }

    if (request.method === 'PATCH') {
      if (body?.action === 'update-category') {
        return await updateEntity(body, admin, 'category');
      }

      if (body?.action === 'update-subcategory') {
        return await updateEntity(body, admin, 'subcategory');
      }

      if (body?.action === 'set-status') {
        return await setStatus(body, admin);
      }
    }

    return json({ error: 'Unsupported category action.' }, 400, true);
  } catch (error) {
    if (error.code === '23505') {
      return json({
        error: 'A category or subcategory with that name or slug already exists.',
      }, 409, true);
    }

    if (['23503', '23514', '23502', '22P02'].includes(error.code)) {
      return json({
        error: 'The category data conflicts with the catalogue rules.',
      }, 400, true);
    }

    if (error.status) {
      return json({ error: error.message }, error.status, true);
    }

    console.error('Categories function error:', error);
    return json({
      error: 'Unable to process the category request right now.',
    }, 500, true);
  }
};
