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
const validId = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

async function getAdmin(request) {
  try { return await requireAdmin(request, pool); } catch (error) {
    console.error('[business-center] auth error', error?.message);
    return null;
  }
}

export default async (request) => {
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
  const admin = await getAdmin(request);
  if (!admin) return json({ error: 'Unauthorized.' }, 401);

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'overview';
  const requestedStore = url.searchParams.get('store') || '';
  const storeSlug = admin.role === 'store_admin' ? admin.store_slug : requestedStore;
  if (admin.role === 'super_admin' && !storeSlug && action !== 'plans') return json({ error: 'A store scope is required.' }, 400);

  try {
    const storeResult = storeSlug ? await pool.query('SELECT id,slug,name FROM public.stores WHERE slug=$1 AND is_active IS TRUE', [storeSlug]) : null;
    if (storeSlug && !storeResult?.rowCount) return json({ error: 'Store not found.' }, 404);
    const store = storeResult?.rows[0] || null;

    if (action === 'plans' && request.method === 'GET') {
      const plans = await pool.query('SELECT id,name,description,monthly_price_cents,features FROM public.simatu_subscription_plans WHERE is_active IS TRUE ORDER BY monthly_price_cents');
      return json({ plans: plans.rows });
    }

    if (action === 'campaigns' && request.method === 'GET') {
      const result = await pool.query(
        `SELECT c.*, COUNT(DISTINCT cp.product_id)::int AS product_count,
          (SELECT COUNT(*)::int FROM public.simatu_promotion_events e WHERE e.campaign_id=c.id AND e.event_type='impression') AS impressions,
          (SELECT COUNT(*)::int FROM public.simatu_promotion_events e WHERE e.campaign_id=c.id AND e.event_type='click') AS clicks,
          (SELECT COUNT(*)::int FROM public.simatu_promotion_events e WHERE e.campaign_id=c.id AND e.event_type='add_to_cart') AS carts,
          (SELECT COUNT(*)::int FROM public.simatu_promotion_events e WHERE e.campaign_id=c.id AND e.event_type='purchase') AS purchases
         FROM public.simatu_campaigns c
         LEFT JOIN public.simatu_campaign_products cp ON cp.campaign_id=c.id
         LEFT JOIN public.simatu_promotion_events e ON e.campaign_id=c.id
         WHERE c.store_id=$1
         GROUP BY c.id ORDER BY c.created_at DESC`,
        [store.id]
      );
      return json({ campaigns: result.rows });
    }

    if (action === 'campaigns' && request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body || typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 120) return json({ error: 'Campaign name must be 2–120 characters.' }, 400);
      const type = body.campaign_type;
      if (!['product_boost','category_sponsor','store_feature','seasonal'].includes(type)) return json({ error: 'Unsupported campaign type.' }, 400);
      const products = Array.isArray(body.product_ids) ? [...new Set(body.product_ids)] : [];
      if (products.length > 100 || products.some((id) => !validId(id))) return json({ error: 'Campaign product selection is invalid.' }, 400);
      if (type === 'product_boost' && !products.length) return json({ error: 'Select at least one product for a product boost.' }, 400);
      const start = body.starts_at ? new Date(body.starts_at) : null;
      const end = body.ends_at ? new Date(body.ends_at) : null;
      if ((start && Number.isNaN(start.valueOf())) || (end && Number.isNaN(end.valueOf())) || (start && end && end <= start)) return json({ error: 'Campaign dates are invalid.' }, 400);
      const budget = body.budget_cents == null ? null : Number(body.budget_cents);
      if (budget !== null && (!Number.isSafeInteger(budget) || budget < 0)) return json({ error: 'Budget must be a non-negative integer in cents.' }, 400);
      const status = start && start > new Date() ? 'scheduled' : 'draft';
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        if (products.length) {
          const check = await client.query(
            `SELECT id FROM public.products WHERE id=ANY($1::uuid[]) AND store_id=$2 AND is_active IS TRUE AND marketplace_visible IS TRUE AND COALESCE(is_age_restricted,FALSE) IS FALSE`,
            [products, store.id]
          );
          if (check.rowCount !== products.length) {
            await client.query('ROLLBACK');
            return json({ error: 'One or more selected products are unavailable for marketplace promotion.' }, 400);
          }
        }
        const created = await client.query(
          `INSERT INTO public.simatu_campaigns (store_id,name,campaign_type,status,starts_at,ends_at,budget_cents,target_category_slug,created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
          [store.id,body.name.trim(),type,status,start?.toISOString() || null,end?.toISOString() || null,budget,body.target_category_slug || null,admin.id]
        );
        if (products.length) await client.query('INSERT INTO public.simatu_campaign_products(campaign_id,product_id) SELECT $1,unnest($2::uuid[])', [created.rows[0].id,products]);
        await client.query('COMMIT');
        return json({ campaign: created.rows[0] }, 201);
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally { client.release(); }
    }

    if (action === 'overview' && request.method === 'GET') {
      const [productSummary, events, subscription] = await Promise.all([
        pool.query(`SELECT COUNT(*)::int AS product_count, COUNT(*) FILTER (WHERE is_active IS TRUE AND marketplace_visible IS TRUE)::int AS eligible_products FROM public.products WHERE store_id=$1`, [store.id]),
        pool.query(`SELECT event_type,COUNT(*)::int AS count FROM public.simatu_promotion_events WHERE store_id=$1 AND occurred_at >= now()-interval '30 days' GROUP BY event_type`, [store.id]),
        pool.query(`SELECT ss.status,sp.id AS plan_id,sp.name AS plan_name,sp.features FROM public.simatu_store_subscriptions ss JOIN public.simatu_subscription_plans sp ON sp.id=ss.plan_id WHERE ss.store_id=$1 ORDER BY ss.created_at DESC LIMIT 1`, [store.id]),
      ]);
      const eventCounts = Object.fromEntries(events.rows.map((row) => [row.event_type,row.count]));
      const impressions = eventCounts.impression || 0;
      const clicks = eventCounts.click || 0;
      return json({
        store,
        products: productSummary.rows[0],
        promotion_metrics: { impressions, clicks, carts: eventCounts.add_to_cart || 0, purchases: eventCounts.purchase || 0, ctr: impressions ? clicks / impressions : 0 },
        subscription: subscription.rows[0] || { status: 'none', plan_id: 'free', plan_name: 'Free', features: { analytics: 'basic', campaigns: false, promotions: false } },
      });
    }

    if (action === 'intelligence' && request.method === 'GET') {
      const result = await pool.query(
        `SELECT p.id,p.name,p.price,p.image_url,p.is_active,p.marketplace_visible,
          COUNT(e.id) FILTER (WHERE e.event_type='impression')::int AS impressions,
          COUNT(e.id) FILTER (WHERE e.event_type='click')::int AS clicks,
          COUNT(e.id) FILTER (WHERE e.event_type='add_to_cart')::int AS add_to_carts,
          COUNT(e.id) FILTER (WHERE e.event_type='purchase')::int AS purchases
         FROM public.products p LEFT JOIN public.simatu_promotion_events e ON e.product_id=p.id AND e.occurred_at>=now()-interval '30 days'
         WHERE p.store_id=$1 GROUP BY p.id ORDER BY purchases DESC,clicks DESC,impressions DESC LIMIT 100`,
        [store.id]
      );
      const insights = result.rows.map((p) => {
        const notes = [];
        if (!p.image_url) notes.push('Add a product image to improve listing quality.');
        if (!p.impressions) notes.push('No tracked visibility yet. Consider a relevant campaign once product information is complete.');
        if (p.impressions > 20 && !p.add_to_carts) notes.push('Visibility without cart activity: review price, imagery and description.');
        if (p.add_to_carts > 0 && !p.purchases) notes.push('Cart interest without tracked purchases: review checkout, price and delivery details.');
        return { ...p, recommendations: notes };
      });
      return json({ insights, period_days: 30, data_notice: 'Recommendations are based only on tracked Simatu events and available product data.' });
    }

    return json({ error: 'Unknown action.' }, 404);
  } catch (error) {
    console.error('[business-center] request failed', { action, code: error?.code, message: error?.message });
    return json({ error: 'Business Center data is temporarily unavailable.' }, 500);
  }
};
