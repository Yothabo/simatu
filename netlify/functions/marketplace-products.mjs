import { Pool } from 'pg';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false }, max: 2, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9]{3}-[89ab][0-9]{3}-[0-9a-f]{12}$/i;
const json = (data, status = 200, headers = {}) => Response.json(data, { status, headers });
const imageUrlValid = (value) => { try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } };

function validate(body) {
  const p = {
    name: typeof body?.name === 'string' ? body.name.trim() : '',
    sku: typeof body?.sku === 'string' ? body.sku.trim().toUpperCase() : '',
    description: typeof body?.description === 'string' ? body.description.trim() : '',
    image_url: typeof body?.image_url === 'string' ? body.image_url.trim() : '',
    price: Number(body?.price),
    supplier_cost: body?.supplier_cost == null ? null : Number(body.supplier_cost),
    category_slug: typeof body?.category_slug === 'string' ? body.category_slug.trim() : '',
    subcategory_id: typeof body?.subcategory_id === 'string' ? body.subcategory_id.trim() : '',
    variants: body?.variants ?? [],
    attributes: body?.attributes ?? [],
    is_active: body?.is_active !== false,
    marketplace_visible: body?.marketplace_visible !== false,
    sort_order: Number.isInteger(body?.sort_order) && body.sort_order >= 0 ? body.sort_order : 0,
  };
  if (!p.name || p.name.length > 200) return 'Product name is required (max 200 characters).';
  if (!p.sku || p.sku.length > 100 || !/^[A-Z0-9][A-Z0-9._/-]*$/.test(p.sku)) return 'A valid unique SKU is required.';
  if (!Number.isFinite(p.price) || p.price < 0 || p.price > 1000000) return 'A valid price is required.';
  if (p.supplier_cost !== null && (!Number.isFinite(p.supplier_cost) || p.supplier_cost < 0 || p.supplier_cost > 1000000)) return 'Supplier cost is invalid.';
  if (!p.image_url || p.image_url.length > 2048 || !imageUrlValid(p.image_url)) return 'A valid HTTP(S) product image URL is required.';
  if (!p.category_slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.category_slug)) return 'A marketplace category is required.';
  if (!uuidPattern.test(p.subcategory_id)) return 'A valid marketplace subcategory is required.';
  if (p.description.length > 10000) return 'Description is too long.';
  if (!Array.isArray(p.variants) || p.variants.length > 100) return 'Variants must be a list of up to 100 entries.';
  if (!Array.isArray(p.attributes) || p.attributes.length > 100) return 'Attributes must be a list of up to 100 entries.';
  for (const v of p.variants) if (!v || typeof v.sku !== 'string' || !v.sku.trim() || !Number.isFinite(Number(v.price)) || Number(v.price) < 0 || !v.options || typeof v.options !== 'object' || Array.isArray(v.options)) return 'Each variant requires SKU, price, and an options object.';
  for (const a of p.attributes) if (!a || typeof a.key !== 'string' || !/^[a-z][a-z0-9_]{0,79}$/.test(a.key) || typeof a.label !== 'string' || !a.label.trim() || !['text','number','boolean','date','measurement','select','multi_select'].includes(a.data_type) || !Object.hasOwn(a,'value')) return 'Invalid product attribute.';
  return p;
}

async function superAdmin(request) {
  const admin = await requireAdmin(request, pool);
  if (!admin) return { response: json({ error: 'Authentication required.' }, 401) };
  if (admin.role !== 'super_admin') return { response: json({ error: 'Super Admin access required.' }, 403) };
  return { admin };
}

async function list(request) {
  const url = new URL(request.url);
  const adminScope = url.searchParams.get('scope') === 'admin';
  if (adminScope) { const auth = await superAdmin(request); if (auth.response) return auth.response; }
  const filters = adminScope ? [] : ['mp.is_active IS TRUE'];
  const vals = [];
  if (!adminScope) filters.push("mp.marketplace_visible IS TRUE AND mc.audience_policy = 'general'");
  const cat = url.searchParams.get('category');
  const sub = url.searchParams.get('subcategory_id');
  if (cat) { vals.push(cat); filters.push('mc.slug = $' + vals.length); }
  if (sub && uuidPattern.test(sub)) { vals.push(sub); filters.push('mp.marketplace_subcategory_id = $' + vals.length); }
  const result = await pool.query('SELECT mp.*, mc.slug AS category_slug, mc.name AS category_name, msc.slug AS subcategory_slug, msc.name AS subcategory_name FROM public.marketplace_products mp JOIN public.marketplace_categories mc ON mc.id=mp.marketplace_category_id JOIN public.marketplace_subcategories msc ON msc.id=mp.marketplace_subcategory_id AND msc.marketplace_category_id=mc.id WHERE ' + filters.join(' AND ') + ' ORDER BY mc.sort_order,msc.sort_order,mp.sort_order,mp.created_at DESC', vals);
  const ids = result.rows.map(x => x.id);
  if (!ids.length) return json({ products: [] }, 200, { 'Cache-Control': adminScope ? 'private, no-store' : 'public, max-age=15, s-maxage=60' });
  const [vr, ar] = await Promise.all([
    pool.query('SELECT * FROM public.marketplace_product_variants WHERE marketplace_product_id=ANY($1::uuid[]) AND is_active IS TRUE ORDER BY sort_order', [ids]),
    pool.query("SELECT v.marketplace_product_id,d.attribute_key,d.label,d.data_type,d.unit,v.value FROM public.marketplace_product_attribute_values v JOIN public.product_attribute_definitions d ON d.id=v.definition_id AND d.scope='marketplace' AND d.is_active IS TRUE WHERE v.marketplace_product_id=ANY($1::uuid[])", [ids])
  ]);
  const vm = new Map(), am = new Map();
  for (const v of vr.rows) { const a=vm.get(v.marketplace_product_id)||[]; a.push(v); vm.set(v.marketplace_product_id,a); }
  for (const a of ar.rows) { const b=am.get(a.marketplace_product_id)||[]; b.push(a); am.set(a.marketplace_product_id,b); }
  return json({ products: result.rows.map(p => ({ ...p, variants: vm.get(p.id)||[], attributes: am.get(p.id)||[] })) }, 200, { 'Cache-Control': adminScope ? 'private, no-store' : 'public, max-age=15, s-maxage=60' });
}

async function save(body, update) {
  const p = validate(body);
  if (typeof p === 'string') return json({ error: p }, 400);
  if (update && !uuidPattern.test(String(body.id || ''))) return json({ error: 'Valid product ID required.' }, 400);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const taxonomy = await client.query("SELECT mc.id category_id,ms.id subcategory_id FROM public.marketplace_categories mc JOIN public.marketplace_subcategories ms ON ms.marketplace_category_id=mc.id WHERE mc.slug=$1 AND mc.is_active IS TRUE AND mc.audience_policy='general' AND ms.id=$2 AND ms.is_active IS TRUE", [p.category_slug,p.subcategory_id]);
    if (!taxonomy.rowCount) { await client.query('ROLLBACK'); return json({ error: 'Category or subcategory unavailable.' }, 400); }
    const t=taxonomy.rows[0];
    const params=[p.name,p.sku,p.description,p.price,p.supplier_cost,p.image_url,t.category_id,t.subcategory_id,p.is_active,p.marketplace_visible,p.sort_order];
    let saved;
    if (update) {
      saved=await client.query('UPDATE public.marketplace_products SET name=$1,sku=$2,description=$3,price=$4,supplier_cost=$5,image_url=$6,marketplace_category_id=$7,marketplace_subcategory_id=$8,is_active=$9,marketplace_visible=$10,sort_order=$11,updated_at=now() WHERE id=$12 RETURNING *',params.concat(body.id));
      if (!saved.rowCount) { await client.query('ROLLBACK'); return json({ error: 'Product not found.' }, 404); }
    } else saved=await client.query("INSERT INTO public.marketplace_products(name,sku,description,price,supplier_cost,image_url,marketplace_category_id,marketplace_subcategory_id,is_active,marketplace_visible,sort_order,product_source) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'platform') RETURNING *",params);
    const productId=saved.rows[0].id;
    await client.query('DELETE FROM public.marketplace_product_variants WHERE marketplace_product_id=$1',[productId]);
    for (const [i,v] of p.variants.entries()) await client.query('INSERT INTO public.marketplace_product_variants(marketplace_product_id,sku,name,price,supplier_cost,options,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7)',[productId,v.sku.trim().toUpperCase(),typeof v.name==='string'?v.name.trim():'',Number(v.price),v.supplier_cost==null?null:Number(v.supplier_cost),JSON.stringify(v.options),i]);
    for (const [i,a] of p.attributes.entries()) {
      const d=await client.query("INSERT INTO public.product_attribute_definitions(attribute_key,label,data_type,scope,marketplace_product_id,unit,validation,is_required,sort_order,is_active) VALUES($1,$2,$3,'marketplace',$4,$5,$6,$7,$8,true) ON CONFLICT (marketplace_product_id,attribute_key) WHERE scope='marketplace' DO UPDATE SET label=EXCLUDED.label,data_type=EXCLUDED.data_type,unit=EXCLUDED.unit,validation=EXCLUDED.validation,is_required=EXCLUDED.is_required,sort_order=EXCLUDED.sort_order,is_active=true RETURNING id",[a.key,a.label.trim(),a.data_type,productId,a.unit||null,JSON.stringify(a.validation||{}),Boolean(a.required),Number.isInteger(a.sort_order)?a.sort_order:i]);
      await client.query('INSERT INTO public.marketplace_product_attribute_values(marketplace_product_id,definition_id,value) VALUES($1,$2,$3) ON CONFLICT(marketplace_product_id,definition_id) DO UPDATE SET value=EXCLUDED.value,updated_at=now()',[productId,d.rows[0].id,JSON.stringify(a.value)]);
    }
    await client.query('COMMIT');
    return json({ product:saved.rows[0] },update?200:201);
  } catch(e) { await client.query('ROLLBACK').catch(()=>{}); if(e?.code==='23505') return json({ error:'Product or variant SKU is already in use.' },409); throw e; } finally { client.release(); }
}

async function remove(body) {
  if (!uuidPattern.test(String(body?.id||''))) return json({ error:'Valid product ID required.' },400);
  const result=await pool.query('DELETE FROM public.marketplace_products WHERE id=$1 RETURNING id,name,sku',[body.id]);
  return result.rowCount?json({deleted:result.rows[0]}):json({error:'Product not found.'},404);
}

export default async (request) => {
  try {
    if (request.method==='GET') return await list(request);
    if (!['POST','PATCH','DELETE'].includes(request.method)) return json({error:'Method not allowed.'},405,{Allow:'GET, POST, PATCH, DELETE'});
    const auth=await superAdmin(request); if(auth.response) return auth.response;
    let body; try { body=await request.json(); } catch { return json({error:'Malformed JSON.'},400); }
    if(request.method==='DELETE') return await remove(body);
    return await save(body,request.method==='PATCH');
  } catch(e) {
    console.error('[marketplace-products]',{code:e?.code||null,message:e?.message||'Unknown error'});
    return json({error:'Marketplace products are temporarily unavailable.'},500,{'Cache-Control':'no-store'});
  }
};
