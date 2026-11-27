import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validName = (name) => typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 120;
const validSlug = (slug) => typeof slug === 'string' && slugPattern.test(slug);
const validAgePolicy = (policy, age) => policy === 'general' ? age == null : policy === 'restricted' && Number.isInteger(age) && age >= 18 && age <= 120;

export default async (request) => {
  const admin = await requireAdmin(request, pool);
  if (!admin) return json({ error: 'Authentication required.' }, 401);
  if (admin.role !== 'super_admin') return json({ error: 'Only platform administrators may manage marketplace taxonomy.' }, 403);

  if (request.method === 'GET') {
    try {
      const [categories, subcategories] = await Promise.all([
        pool.query(`SELECT id,name,slug,description,sort_order,audience_policy,minimum_age,is_active
          FROM public.marketplace_categories ORDER BY sort_order,name`),
        pool.query(`SELECT id,marketplace_category_id,name,slug,description,sort_order,is_active
          FROM public.marketplace_subcategories ORDER BY marketplace_category_id,sort_order,name`),
      ]);
      return json({ categories: categories.rows, subcategories: subcategories.rows });
    } catch (error) {
      console.error('[admin-marketplace-taxonomy] list failed', error?.code || error?.message);
      return json({ error: 'Unable to load marketplace taxonomy.' }, 500);
    }
  }

  if (!['POST','PATCH','DELETE'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400); }
  const type = body?.type;
  if (!['category','subcategory'].includes(type)) return json({ error: 'Type must be category or subcategory.' }, 400);
  const id = String(body?.id || '');
  if (request.method !== 'POST' && !uuidPattern.test(id)) return json({ error: 'A valid id is required.' }, 400);

  const name = body?.name;
  const slug = body?.slug;
  const description = body?.description == null ? null : String(body.description).trim().slice(0,2000);
  const sortOrder = Number(body?.sort_order ?? 0);
  const isActive = body?.is_active !== false;

  if (request.method !== 'DELETE' && (!validName(name) || !validSlug(slug) || !Number.isInteger(sortOrder) || sortOrder < 0)) {
    return json({ error: 'Name, valid slug and non-negative sort order are required.' }, 400);
  }

  if (type === 'category') {
    const audiencePolicy = body?.audience_policy === 'restricted' ? 'restricted' : 'general';
    const minimumAge = body?.minimum_age == null || body?.minimum_age === '' ? null : Number(body.minimum_age);
    if (request.method !== 'DELETE' && !validAgePolicy(audiencePolicy, minimumAge)) {
      return json({ error: 'Restricted categories require a minimum age of at least 18. General categories cannot set an age limit.' }, 400);
    }
    try {
      if (request.method === 'POST') {
        const result = await pool.query(`INSERT INTO public.marketplace_categories
          (name,slug,description,sort_order,audience_policy,minimum_age,is_active)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          RETURNING id,name,slug,description,sort_order,audience_policy,minimum_age,is_active`,
          [name.trim(),slug,description,sortOrder,audiencePolicy,minimumAge,isActive]);
        return json({ category: result.rows[0] }, 201);
      }
      if (request.method === 'PATCH') {
        const result = await pool.query(`UPDATE public.marketplace_categories SET
          name=$2,slug=$3,description=$4,sort_order=$5,audience_policy=$6,minimum_age=$7,is_active=$8,updated_at=NOW()
          WHERE id=$1 RETURNING id,name,slug,description,sort_order,audience_policy,minimum_age,is_active`,
          [id,name.trim(),slug,description,sortOrder,audiencePolicy,minimumAge,isActive]);
        return result.rowCount ? json({ category: result.rows[0] }) : json({ error: 'Category not found.' }, 404);
      }
      const result = await pool.query(`UPDATE public.marketplace_categories SET is_active=FALSE,updated_at=NOW() WHERE id=$1 RETURNING id`,[id]);
      return result.rowCount ? json({ archived: true }) : json({ error: 'Category not found.' }, 404);
    } catch (error) {
      if (error?.code === '23505') return json({ error: 'A category with that slug already exists.' }, 409);
      if (error?.code === '23514') return json({ error: 'Category age policy is invalid.' }, 400);
      console.error('[admin-marketplace-taxonomy] category mutation failed', error?.code || error?.message);
      return json({ error: 'Unable to save category.' }, 500);
    }
  }

  const categoryId = String(body?.marketplace_category_id || '');
  if (request.method !== 'DELETE' && !uuidPattern.test(categoryId)) return json({ error: 'A valid parent category is required.' }, 400);
  try {
    if (request.method === 'POST') {
      const result = await pool.query(`INSERT INTO public.marketplace_subcategories
        (marketplace_category_id,name,slug,description,sort_order,is_active)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING id,marketplace_category_id,name,slug,description,sort_order,is_active`,
        [categoryId,name.trim(),slug,description,sortOrder,isActive]);
      return json({ subcategory: result.rows[0] }, 201);
    }
    if (request.method === 'PATCH') {
      const result = await pool.query(`UPDATE public.marketplace_subcategories SET
        marketplace_category_id=$2,name=$3,slug=$4,description=$5,sort_order=$6,is_active=$7,updated_at=NOW()
        WHERE id=$1 RETURNING id,marketplace_category_id,name,slug,description,sort_order,is_active`,
        [id,categoryId,name.trim(),slug,description,sortOrder,isActive]);
      return result.rowCount ? json({ subcategory: result.rows[0] }) : json({ error: 'Subcategory not found.' }, 404);
    }
    const result = await pool.query(`UPDATE public.marketplace_subcategories SET is_active=FALSE,updated_at=NOW() WHERE id=$1 RETURNING id`,[id]);
    return result.rowCount ? json({ archived: true }) : json({ error: 'Subcategory not found.' }, 404);
  } catch (error) {
    if (error?.code === '23505') return json({ error: 'A subcategory with that slug already exists under this category.' }, 409);
    if (error?.code === '23503') return json({ error: 'This classification is referenced by products or listings and cannot be deleted.' }, 409);
    console.error('[admin-marketplace-taxonomy] subcategory mutation failed', error?.code || error?.message);
    return json({ error: 'Unable to save subcategory.' }, 500);
  }
};
