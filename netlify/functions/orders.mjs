import { Pool } from 'pg';
import { randomBytes } from 'node:crypto';
import { requireAdmin } from './_shared/auth.mjs';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

const statuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}

function error(message, status = 400, headers = {}) {
  return json({ error: message }, status, headers);
}

function orderNumber() {
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Johannesburg',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()).replace(/\//g, '');

  return `#YT-${date}-${randomBytes(2).toString('hex').toUpperCase()}`;
}

async function createOrder(body) {
  const fallbackStorefront = String(body?.storefront || '').trim().toLowerCase();
  const customerName = String(body?.customer_name || '').trim();
  const customerPhone = String(body?.customer_phone || '').replace(/\D/g, '');
  const submittedItems = body?.items;

  if (customerName.length < 2 || customerName.length > 120) {
    return error('Please provide a valid full name.');
  }

  if (customerPhone.length < 7 || customerPhone.length > 15) {
    return error('Please provide a valid WhatsApp number.');
  }

  if (!Array.isArray(submittedItems) || submittedItems.length < 1 || submittedItems.length > 50) {
    return error('Your cart is empty or contains too many items.');
  }

  const quantitiesByStore = new Map();

  for (const item of submittedItems) {
    const storefront = String(item?.storefront || fallbackStorefront).trim().toLowerCase();
    const id = String(item?.product_id || '');
    const quantity = Number(item?.quantity);

    if (!['yotaabo', 'poshies'].includes(storefront)) {
      return error('One or more cart items belong to an unsupported store.');
    }

    if (!uuidPattern.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return error('One or more cart items are invalid.');
    }

    const storeQuantities = quantitiesByStore.get(storefront) || new Map();
    storeQuantities.set(id, (storeQuantities.get(id) || 0) + quantity);
    quantitiesByStore.set(storefront, storeQuantities);
  }

  const preparedOrders = [];

  for (const [storefront, quantities] of quantitiesByStore.entries()) {
    for (const quantity of quantities.values()) {
      if (quantity > 20) return error('Maximum quantity per product is 20.');
    }

    const productIds = [...quantities.keys()];
    const productResult = await pool.query(
      'SELECT id, name, price FROM public.products WHERE id = ANY($1::uuid[]) AND is_active IS TRUE AND storefront = $2',
      [productIds, storefront]
    );

    if (productResult.rowCount !== productIds.length) {
      return error('A product in your cart is no longer available. Please refresh your cart.', 409);
    }

    const products = productResult.rows.map((product) => {
      const unitCents = Math.round(Number(product.price) * 100);
      const quantity = quantities.get(product.id);
      return {
        product_id: product.id,
        product_name: product.name,
        unit_price: (unitCents / 100).toFixed(2),
        quantity,
        line_total: ((unitCents * quantity) / 100).toFixed(2),
        line_cents: unitCents * quantity,
      };
    });

    const subtotalCents = products.reduce((sum, item) => sum + item.line_cents, 0);
    preparedOrders.push({
      storefront,
      products,
      subtotal: (subtotalCents / 100).toFixed(2),
      subtotalCents,
    });
  }

  const client = await pool.connect();
  const createdOrders = [];

  try {
    await client.query('BEGIN');

    for (const group of preparedOrders) {
      const insertedOrder = await client.query(
        "INSERT INTO public.orders (order_number, customer_name, customer_phone, subtotal, status, storefront) VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING id, order_number, customer_name, customer_phone, subtotal, status, storefront, created_at, updated_at",
        [orderNumber(), customerName, customerPhone, group.subtotal, group.storefront]
      );

      const order = insertedOrder.rows[0];

      for (const item of group.products) {
        await client.query(
          'INSERT INTO public.order_items (order_id, product_id, product_name, unit_price, quantity) VALUES ($1, $2, $3, $4, $5)',
          [order.id, item.product_id, item.product_name, item.unit_price, item.quantity]
        );
      }

      createdOrders.push({
        ...order,
        subtotal: Number(order.subtotal),
        items: group.products.map(({ line_cents, ...item }) => item),
      });
    }

    await client.query('COMMIT');

    const combinedItems = createdOrders.flatMap((order) =>
      order.items.map((item) => ({ ...item, storefront: order.storefront }))
    );
    const combinedSubtotal = createdOrders.reduce((sum, order) => sum + Number(order.subtotal), 0);

    return json({
      order: {
        order_number: createdOrders.map((order) => order.order_number).join(' / '),
        subtotal: Number(combinedSubtotal.toFixed(2)),
        items: combinedItems,
        store_orders: createdOrders.map((order) => ({
          id: order.id,
          storefront: order.storefront,
          order_number: order.order_number,
          subtotal: order.subtotal,
          status: order.status,
        })),
      },
    }, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listOrders(admin, requestId, flowId) {
  const ordersQueryStartedAt = Date.now();
  const result = await pool.query(
    `SELECT id, order_number, customer_name, customer_phone,
            subtotal, status, storefront, created_at, updated_at
     FROM public.orders
     WHERE ($1::text IS NULL OR storefront = $1)
     ORDER BY created_at DESC`,
    [admin.role === 'store_admin' ? admin.store_slug : null]
  );
  console.info('[admin-data-timing]', JSON.stringify({
    requestId,
    flowId,
    endpoint: 'orders',
    stage: 'orders_select',
    durationMs: Date.now() - ordersQueryStartedAt,
    rowCount: result.rowCount,
  }));

  if (!result.rowCount) return json({ orders: [] }, 200, { 'x-request-id': requestId });

  const ids = result.rows.map((order) => order.id);
  const itemsQueryStartedAt = Date.now();
  const itemResult = await pool.query(
    `SELECT order_id, product_id, product_name, unit_price, quantity
     FROM public.order_items
     WHERE order_id = ANY($1::uuid[])
     ORDER BY created_at ASC`,
    [ids]
  );
  console.info('[admin-data-timing]', JSON.stringify({
    requestId,
    flowId,
    endpoint: 'orders',
    stage: 'order_items_select',
    durationMs: Date.now() - itemsQueryStartedAt,
    orderCount: result.rowCount,
    itemRowCount: itemResult.rowCount,
  }));

  const itemsByOrder = new Map();

  for (const item of itemResult.rows) {
    const items = itemsByOrder.get(item.order_id) || [];
    items.push({
      product_id: item.product_id,
      name: item.product_name,
      price: Number(item.unit_price),
      qty: item.quantity,
    });
    itemsByOrder.set(item.order_id, items);
  }

  return json({
    orders: result.rows.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      items: itemsByOrder.get(order.id) || [],
    })),
  }, 200, { 'x-request-id': requestId });
}

export default async (request) => {
  const requestId = request.headers.get('x-request-id') || globalThis.crypto.randomUUID();
  const flowId = request.headers.get('x-admin-flow-id') || null;
  const requestStartedAt = Date.now();

  try {
    if (!process.env.SUPABASE_DB_URL) {
      return error('Order service is not configured.', 500);
    }

    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return error('Invalid request body.');
      }
      return await createOrder(body);
    }

    if (!['GET', 'PATCH', 'DELETE'].includes(method)) {
      return error('Method not allowed.', 405);
    }

    const admin = await requireAdmin(request, pool);
    if (!admin) return error('You are not authorised to manage orders.', 401, { 'x-request-id': requestId });

    if (method === 'GET') {
      const response = await listOrders(admin, requestId, flowId);
      console.info('[orders] request completed', JSON.stringify({
        requestId,
        flowId,
        method,
        status: response.status,
        totalDurationMs: Date.now() - requestStartedAt,
      }));
      return response;
    }

    const body = await request.json();
    const id = String(body.id || url.searchParams.get('id') || '');

    if (!uuidPattern.test(id)) return error('Invalid order ID.');

    if (method === 'PATCH') {
      const status = String(body.status || '');

      if (!statuses.includes(status)) return error('Invalid order status.');

      const client = await pool.connect();
      let result;

      try {
        await client.query('BEGIN');
        await client.query(
          "SELECT set_config('app.actor_email', $1, true)",
          [admin.email || '']
        );

        result = await client.query(
          `UPDATE public.orders
           SET status = $1, updated_at = now()
           WHERE id = $2
             AND ($3::text IS NULL OR storefront = $3)
           RETURNING id, order_number, status`,
          [status, id, admin.role === 'store_admin' ? admin.store_slug : null]
        );

        if (!result.rowCount) {
          await client.query('ROLLBACK');
          return error('Order not found.', 404);
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      return json({ order: result.rows[0] });
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
        `DELETE FROM public.orders
         WHERE id = $1
           AND ($2::text IS NULL OR storefront = $2)
         RETURNING id, order_number`,
        [id, admin.role === 'store_admin' ? admin.store_slug : null]
      );

      if (!result.rowCount) {
        await client.query('ROLLBACK');
        return error('Order not found.', 404);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return json({ deleted: result.rows[0] });
  } catch (err) {
    console.error('Orders function error:', err);
    return error('The order request could not be completed.', 500);
  }
};
