import { Pool } from 'pg';
import { randomBytes } from 'node:crypto';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false }, max: 2, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9]{3}-[89ab][0-9]{3}-[0-9a-f]{12}$/i;
const orderStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
const paymentStatuses = ['unpaid','pending','paid','failed','refunded'];
const json = (data, status=200, headers={}) => Response.json(data,{status,headers});
const error = (message,status=400) => json({error:message},status);
const orderNumber = () => {
  const date = new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Johannesburg',year:'2-digit',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\//g,'');
  return 'SM-'+date+'-'+randomBytes(3).toString('hex').toUpperCase();
};

async function createOrder(body) {
  const name = typeof body?.customer_name === 'string' ? body.customer_name.trim() : '';
  const phone = typeof body?.customer_phone === 'string' ? body.customer_phone.replace(/\D/g,'') : '';
  const address = typeof body?.delivery_address === 'string' ? body.delivery_address.trim() : '';
  const items = body?.items;
  if (name.length < 2 || name.length > 120) return error('Enter a valid full name.');
  if (phone.length < 7 || phone.length > 15) return error('Enter a valid contact number.');
  if (address.length < 8 || address.length > 2000) return error('Enter a delivery address.');
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) return error('Cart is empty or has too many lines.');
  const normalized = [];
  for (const item of items) {
    const productId = String(item?.product_id || '');
    const variantId = item?.variant_id == null || item.variant_id === '' ? null : String(item.variant_id);
    const quantity = Number(item?.quantity);
    if (!uuidPattern.test(productId) || (variantId && !uuidPattern.test(variantId)) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return error('A cart line is invalid.');
    normalized.push({productId,variantId,quantity});
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const merged = new Map();
    for (const item of normalized) {
      const key = item.productId+'|'+(item.variantId||'base');
      const existing = merged.get(key);
      if (existing) existing.quantity += item.quantity;
      else merged.set(key,{...item});
    }
    const lines=[];
    let totalCents=0;
    for (const item of merged.values()) {
      if (item.quantity>20) { await client.query('ROLLBACK'); return error('Maximum quantity per product/variant is 20.'); }
      const pr=await client.query('SELECT id,name,sku,price,image_url FROM public.marketplace_products WHERE id=$1 AND is_active IS TRUE AND marketplace_visible IS TRUE FOR UPDATE',[item.productId]);
      if (!pr.rowCount) { await client.query('ROLLBACK'); return error('A product is no longer available.',409); }
      const product=pr.rows[0];
      let unitPrice=Number(product.price), variantName='', variantSku=product.sku, options={};
      if (item.variantId) {
        const vr=await client.query('SELECT id,name,sku,price,options FROM public.marketplace_product_variants WHERE id=$1 AND marketplace_product_id=$2 AND is_active IS TRUE FOR UPDATE',[item.variantId,item.productId]);
        if (!vr.rowCount) { await client.query('ROLLBACK'); return error('A selected variant is no longer available.',409); }
        const variant=vr.rows[0]; unitPrice=Number(variant.price); variantName=variant.name||''; variantSku=variant.sku; options=variant.options||{};
      } else {
        const count=await client.query('SELECT COUNT(*)::int count FROM public.marketplace_product_variants WHERE marketplace_product_id=$1 AND is_active IS TRUE',[item.productId]);
        if (count.rows[0].count>0) { await client.query('ROLLBACK'); return error('Choose a variant for this product.'); }
      }
      const cents=Math.round(unitPrice*100);
      const lineCents=cents*item.quantity;
      totalCents+=lineCents;
      if (!Number.isSafeInteger(totalCents) || totalCents>100000000) { await client.query('ROLLBACK'); return error('Order total is too large.'); }
      lines.push({product_id:product.id,variant_id:item.variantId,product_name:product.name,variant_name:variantName,sku:variantSku,unit_price:(cents/100).toFixed(2),quantity:item.quantity,line_total:(lineCents/100).toFixed(2),options});
    }
    const order=await client.query('INSERT INTO public.marketplace_orders(order_number,customer_name,customer_phone,delivery_address,subtotal,status,payment_status) VALUES($1,$2,$3,$4,$5,\'pending\',\'unpaid\') RETURNING id,order_number,customer_name,customer_phone,delivery_address,subtotal,status,payment_status,created_at',[orderNumber(),name,phone,address,(totalCents/100).toFixed(2)]);
    for (const line of lines) await client.query('INSERT INTO public.marketplace_order_items(order_id,marketplace_product_id,marketplace_variant_id,product_name,variant_name,sku,unit_price,quantity,line_total,options) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[order.rows[0].id,line.product_id,line.variant_id,line.product_name,line.variant_name,line.sku,line.unit_price,line.quantity,line.line_total,JSON.stringify(line.options)]);
    await client.query('COMMIT');
    return json({order:{...order.rows[0],subtotal:Number(order.rows[0].subtotal),items:lines}},201);
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('[marketplace-orders] create failed',{code:e?.code||null});
    return error('Unable to create marketplace order right now.',500);
  } finally { client.release(); }
}

async function authorizeSuperAdmin(request) {
  const admin=await requireAdmin(request,pool);
  if(!admin) return {response:error('Authentication required.',401)};
  if(admin.role!=='super_admin') return {response:error('Super Admin access required.',403)};
  return {admin};
}
async function adminList(request) {
  const auth=await authorizeSuperAdmin(request); if(auth.response) return auth.response;
  const url=new URL(request.url);
  const status=url.searchParams.get('status');
  const values=[]; const where=[];
  if(status&&orderStatuses.includes(status)){values.push(status);where.push('o.status=$1');}
  const orders=await pool.query('SELECT o.* FROM public.marketplace_orders o '+(where.length?'WHERE '+where.join(' AND '):'')+' ORDER BY o.created_at DESC LIMIT 200',values);
  if(!orders.rowCount) return json({orders:[]},200,{'Cache-Control':'private,no-store'});
  const ids=orders.rows.map(o=>o.id);
  const items=await pool.query('SELECT * FROM public.marketplace_order_items WHERE order_id=ANY($1::uuid[]) ORDER BY created_at',[ids]);
  const map=new Map();
  for(const item of items.rows){const list=map.get(item.order_id)||[];list.push(item);map.set(item.order_id,list);}
  return json({orders:orders.rows.map(o=>({...o,subtotal:Number(o.subtotal),items:map.get(o.id)||[]}))},200,{'Cache-Control':'private,no-store'});
}
async function updateOrder(request,body) {
  const auth=await authorizeSuperAdmin(request); if(auth.response) return auth.response;
  const id=String(body?.id||''); const status=String(body?.status||''); const payment=body?.payment_status==null?null:String(body.payment_status);
  if(!uuidPattern.test(id)) return error('Invalid order ID.');
  if(!orderStatuses.includes(status)) return error('Invalid order status.');
  if(payment!==null&&!paymentStatuses.includes(payment)) return error('Invalid payment status.');
  const result=await pool.query('UPDATE public.marketplace_orders SET status=$1,payment_status=COALESCE($2,payment_status),updated_at=now() WHERE id=$3 RETURNING id,order_number,status,payment_status',[status,payment,id]);
  return result.rowCount?json({order:result.rows[0]}):error('Order not found.',404);
}
export default async (request) => {
  try {
    if(!process.env.SUPABASE_DB_URL) return error('Marketplace order service is not configured.',500);
    if(request.method==='POST'){let body;try{body=await request.json();}catch{return error('Malformed JSON.');}return createOrder(body);}
    if(request.method==='GET') return adminList(request);
    if(request.method==='PATCH'){let body;try{body=await request.json();}catch{return error('Malformed JSON.');}return updateOrder(request,body);}
    return error('Method not allowed.',405);
  } catch(e) {
    console.error('[marketplace-orders] handler error',{code:e?.code||null});
    return error('Marketplace order service unavailable.',500);
  }
};
