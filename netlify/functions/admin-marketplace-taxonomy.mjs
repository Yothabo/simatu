import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: true },
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
const validPublicationStatus = (status) => ['draft', 'published', 'archived'].includes(status);
const storageBase = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const mediaUrl = (path) => path && storageBase
  ? `${storageBase}/storage/v1/object/public/marketplace-media/${path.split('/').map(encodeURIComponent).join('/')}`
  : null;

export default async (request) => {
  let admin;
  try {
    admin = await requireAdmin(request, pool);
  } catch (error) {
    console.error('[admin-marketplace-taxonomy] auth failed', error?.message || 'unknown');
    return json({ error: 'Unable to verify administrator access.' }, 503);
  }
  if (!admin) return json({ error: 'Authentication required.' }, 401);
  if (admin.role !== 'super_admin') return json({ error: 'Only platform administrators may manage marketplace taxonomy.' }, 403);

  if (request.method === 'GET') {
    try {
      const [categories, subcategories] = await Promise.all([
        pool.query(`SELECT mc.id,mc.name,mc.slug,mc.description,mc.sort_order,
            mc.audience_policy,mc.minimum_age,mc.is_active,mc.publication_status,mc.image_media_id,
            media.jpeg_path,media.jxl_path,media.alt_text AS image_alt_text
          FROM public.marketplace_categories mc
          LEFT JOIN public.marketplace_content_media media
            ON media.id=mc.image_media_id AND media.retired_at IS NULL
          ORDER BY mc.sort_order,mc.name`),
        pool.query(`SELECT msc.id,msc.marketplace_category_id,msc.name,msc.slug,
            msc.description,msc.sort_order,msc.is_active,msc.publication_status,msc.image_media_id,
            media.jpeg_path,media.jxl_path,media.alt_text AS image_alt_text
          FROM public.marketplace_subcategories msc
          LEFT JOIN public.marketplace_content_media media
            ON media.id=msc.image_media_id AND media.retired_at IS NULL
          ORDER BY msc.marketplace_category_id,msc.sort_order,msc.name`),
      ]);
      const withMedia = (rows) => rows.map(({ jpeg_path, jxl_path, ...item }) => ({
        ...item,
        image_url: mediaUrl(jpeg_path),
        image_jxl_url: mediaUrl(jxl_path),
      }));
      return json({ categories: withMedia(categories.rows), subcategories: withMedia(subcategories.rows) });
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
  const publicationStatus = body?.publication_status == null
    ? (request.method === 'POST' ? 'draft' : 'published')
    : String(body.publication_status);
  if (request.method !== 'DELETE' && !validPublicationStatus(publicationStatus)) {
    return json({ error: 'Publication status must be draft, published or archived.' }, 400);
  }
  if (request.method === 'POST' && publicationStatus === 'published') {
    return json({ error: 'Create taxonomy content as a draft, upload its optimized JPEG and JPEG XL image, then publish it.' }, 409);
  }

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
          (name,slug,description,sort_order,audience_policy,minimum_age,is_active,publication_status,published_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CASE WHEN $8='published' THEN NOW() ELSE NULL END)
          RETURNING id,name,slug,description,sort_order,audience_policy,minimum_age,is_active,publication_status`,
          [name.trim(),slug,description,sortOrder,audiencePolicy,minimumAge,isActive,publicationStatus]);
        return json({ category: result.rows[0] }, 201);
      }
      if (request.method === 'PATCH') {
        if (publicationStatus === 'published') {
          const current = await pool.query(
            `SELECT mc.publication_status,
                    EXISTS (SELECT 1 FROM public.marketplace_content_media media
                            WHERE media.id = mc.image_media_id AND media.retired_at IS NULL) AS has_active_image
             FROM public.marketplace_categories mc WHERE mc.id = $1`,
            [id]
          );
          if (!current.rowCount) return json({ error: 'Category not found.' }, 404);
          if (current.rows[0].publication_status !== 'published' && !current.rows[0].has_active_image) {
            return json({ error: 'Upload an optimized JPEG and JPEG XL image before publishing this category.' }, 409);
          }
        }
        const result = await pool.query(`UPDATE public.marketplace_categories SET
          name=$2,slug=$3,description=$4,sort_order=$5,audience_policy=$6,minimum_age=$7,
          is_active=$8,publication_status=$9,
          published_at=CASE WHEN $9='published' THEN COALESCE(published_at,NOW()) ELSE published_at END,
          updated_at=NOW()
          WHERE id=$1 RETURNING id,name,slug,description,sort_order,audience_policy,minimum_age,is_active,publication_status`,
          [id,name.trim(),slug,description,sortOrder,audiencePolicy,minimumAge,isActive,publicationStatus]);
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

  if (request.method === 'POST' && publicationStatus === 'published') {
    return json({ error: 'Create subcategories as drafts, upload their optimized JPEG and JPEG XL image, then publish them.' }, 409);
  }

  const categoryId = String(body?.marketplace_category_id || '');
  if (request.method !== 'DELETE' && !uuidPattern.test(categoryId)) return json({ error: 'A valid parent category is required.' }, 400);
  try {
    if (request.method === 'POST') {
      const result = await pool.query(`INSERT INTO public.marketplace_subcategories
        (marketplace_category_id,name,slug,description,sort_order,is_active,publication_status,published_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $7='published' THEN NOW() ELSE NULL END)
        RETURNING id,marketplace_category_id,name,slug,description,sort_order,is_active,publication_status`,
        [categoryId,name.trim(),slug,description,sortOrder,isActive,publicationStatus]);
      return json({ subcategory: result.rows[0] }, 201);
    }
    if (request.method === 'PATCH') {
      if (publicationStatus === 'published') {
        const current = await pool.query(
          `SELECT msc.publication_status,
                  EXISTS (SELECT 1 FROM public.marketplace_content_media media
                          WHERE media.id = msc.image_media_id AND media.retired_at IS NULL) AS has_active_image,
                  mc.is_active AS parent_is_active,
                  mc.publication_status AS parent_publication_status,
                  mc.audience_policy AS parent_audience_policy
           FROM public.marketplace_subcategories msc
           JOIN public.marketplace_categories mc ON mc.id = msc.marketplace_category_id
           WHERE msc.id = $1`,
          [id]
        );
        if (!current.rowCount) return json({ error: 'Subcategory not found.' }, 404);
        const state = current.rows[0];
        if (!state.parent_is_active || state.parent_publication_status !== 'published' || state.parent_audience_policy !== 'general') {
          return json({ error: 'Subcategories can only be published under an active, published, general-audience category.' }, 409);
        }
        if (state.publication_status !== 'published' && !state.has_active_image) {
          return json({ error: 'Upload an optimized JPEG and JPEG XL image before publishing this subcategory.' }, 409);
        }
      }
      const result = await pool.query(`UPDATE public.marketplace_subcategories SET
        marketplace_category_id=$2,name=$3,slug=$4,description=$5,sort_order=$6,is_active=$7,
        publication_status=$8,
        published_at=CASE WHEN $8='published' THEN COALESCE(published_at,NOW()) ELSE published_at END,
        updated_at=NOW()
        WHERE id=$1 RETURNING id,marketplace_category_id,name,slug,description,sort_order,is_active,publication_status`,
        [id,categoryId,name.trim(),slug,description,sortOrder,isActive,publicationStatus]);
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
