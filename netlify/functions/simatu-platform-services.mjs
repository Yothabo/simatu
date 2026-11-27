import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false }, max: 2, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
const validImage = (value) => { if (!value) return true; try { return ['https:','http:'].includes(new URL(value).protocol); } catch { return false; } };
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100);
const validate = (body) => {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const slug = typeof body?.slug === 'string' && body.slug.trim() ? slugify(body.slug) : slugify(name);
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const categorySlug = typeof body?.category_slug === 'string' ? body.category_slug.trim() || null : null;
  const imageUrl = typeof body?.image_url === 'string' ? body.image_url.trim() || null : null;
  const priceCents = body?.price_cents == null || body.price_cents === '' ? null : Number(body.price_cents);
  const pricingModel = body?.pricing_model ?? 'fixed';
  const status = body?.status ?? 'draft';
  const sortOrder = Number.isInteger(body?.sort_order) && body.sort_order >= 0 ? body.sort_order : 0;
  const metadata = body?.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata) ? body.metadata : {};
  if (name.length < 2 || name.length > 200) return { error: 'Service name must be 2–200 characters.' };
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: 'A valid service slug is required.' };
  if (description.length > 10000) return { error: 'Description is too long.' };
  if (!validImage(imageUrl)) return { error: 'Image URL must be HTTP or HTTPS.' };
  if (priceCents !== null && (!Number.isSafeInteger(priceCents) || priceCents < 0)) return { error: 'Price must be non-negative cents or blank.' };
  if (!['fixed','starting_at','quote','free'].includes(pricingModel)) return { error: 'Pricing model is invalid.' };
  if (!['draft','published','paused','archived'].includes(status)) return { error: 'Service status is invalid.' };
  return { value: { name, slug, description, category_slug: categorySlug, image_url: imageUrl, price_cents: priceCents, pricing_model: pricingModel, status, sort_order: sortOrder, metadata } };
};
export default async (request) => {
  if (!['GET','POST','PATCH'].includes(request.method)) return json({ error: 'Method not allowed.' },405);
  let admin;
  try { admin = await requireAdmin(request,pool); } catch { return json({ error: 'Unauthorized.' },401); }
  if (!admin || admin.role !== 'super_admin') return json({ error: 'Super Admin access required.' },403);
  try {
    if (request.method === 'GET') {
      const result = await pool.query('SELECT * FROM public.simatu_platform_services ORDER BY sort_order,created_at DESC');
      return json({ services: result.rows });
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return json({ error: 'A valid JSON body is required.' },400);
    const checked = validate(body);
    if (checked.error) return json({ error: checked.error },400);
    const v = checked.value;
    if (request.method === 'POST') {
      const result = await pool.query(
        `INSERT INTO public.simatu_platform_services(name,slug,description,category_slug,image_url,price_cents,pricing_model,status,sort_order,metadata,created_by)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [v.name,v.slug,v.description,v.category_slug,v.image_url,v.price_cents,v.pricing_model,v.status,v.sort_order,JSON.stringify(v.metadata),admin.id]
      );
      return json({ service: result.rows[0] },201);
    }
    if (typeof body.id !== 'string') return json({ error: 'Service ID is required.' },400);
    const result = await pool.query(
      `UPDATE public.simatu_platform_services SET name=$2,slug=$3,description=$4,category_slug=$5,image_url=$6,price_cents=$7,pricing_model=$8,status=$9,sort_order=$10,metadata=$11,updated_at=now() WHERE id=$1 RETURNING *`,
      [body.id,v.name,v.slug,v.description,v.category_slug,v.image_url,v.price_cents,v.pricing_model,v.status,v.sort_order,JSON.stringify(v.metadata)]
    );
    if (!result.rowCount) return json({ error: 'Service not found.' },404);
    return json({ service: result.rows[0] });
  } catch (error) {
    if (error?.code === '23505') return json({ error: 'A service with this slug already exists.' },409);
    console.error('[simatu-platform-services]',error?.message);
    return json({ error: 'Service operation failed.' },500);
  }
};
