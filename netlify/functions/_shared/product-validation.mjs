export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const numericPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
const integerPattern = /^\+?\d+$/;

function parseNumeric(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();

    if (!numericPattern.test(normalized)) {
      return NaN;
    }

    return Number(normalized);
  }

  return NaN;
}

function parseInteger(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();

    if (!integerPattern.test(normalized)) {
      return NaN;
    }

    return Number(normalized);
  }

  return NaN;
}

export function validateProduct(body) {
  const name = typeof body?.name === 'string'
    ? body.name.trim()
    : '';

  const storefront = body?.storefront == null ||
    (typeof body.storefront === 'string' && body.storefront.trim() === '')
    ? null
    : typeof body.storefront === 'string'
      ? body.storefront.trim().toLowerCase()
      : '__invalid__';

  const price = parseNumeric(body?.price);
  const supplierCost = body?.supplier_cost == null ||
    (typeof body.supplier_cost === 'string' && body.supplier_cost.trim() === '')
    ? null
    : parseNumeric(body.supplier_cost);

  const sku = body?.sku == null || (typeof body.sku === 'string' && body.sku.trim() === '')
    ? null
    : typeof body.sku === 'string'
      ? body.sku.trim().toUpperCase()
      : '__invalid__';

  const category = typeof body?.category === 'string'
    ? body.category.trim()
    : '';

  const subcategory = typeof body?.subcategory === 'string'
    ? body.subcategory.trim()
    : '';

  const categoryId = body?.category_id == null ||
    (typeof body.category_id === 'string' && body.category_id.trim() === '')
    ? null
    : typeof body.category_id === 'string'
      ? body.category_id.trim()
      : '__invalid__';

  const subcategoryId = body?.subcategory_id == null ||
    (typeof body.subcategory_id === 'string' && body.subcategory_id.trim() === '')
    ? null
    : typeof body.subcategory_id === 'string'
      ? body.subcategory_id.trim()
      : '__invalid__';

  if (
    body?.description != null &&
    typeof body.description !== 'string'
  ) {
    return { error: 'Product description is invalid.' };
  }

  if (
    body?.image_url != null &&
    typeof body.image_url !== 'string'
  ) {
    return { error: 'Product image URL is invalid.' };
  }

  const description = body?.description
    ? body.description.trim()
    : null;

  const imageUrl = body?.image_url
    ? body.image_url.trim()
    : null;

  const isActive = body?.is_active;
  const marketplaceVisible = body?.marketplace_visible == null ? true : body.marketplace_visible;
  const storefrontVisible = body?.storefront_visible == null ? true : body.storefront_visible;
  const sortOrder = parseInteger(body?.sort_order ?? 0);
  const rawSizes = body?.sizes ?? [];

  if (!Array.isArray(rawSizes) || rawSizes.length > 50) {
    return { error: 'Product sizes must be a list of up to 50 labels.' };
  }

  const sizes = [];
  const seenSizes = new Set();

  for (const value of rawSizes) {
    if (typeof value !== 'string') {
      return { error: 'Each product size must be a text label.' };
    }

    const size = value.trim();
    const normalizedSize = size.toLocaleLowerCase();

    if (!size || size.length > 80) {
      return { error: 'Product size labels must contain 1 to 80 characters.' };
    }

    if (seenSizes.has(normalizedSize)) {
      return { error: 'Product sizes cannot contain duplicates.' };
    }

    seenSizes.add(normalizedSize);
    sizes.push(size);
  }

  if (name.length < 1 || name.length > 160) {
    return {
      error: 'Product name must be between 1 and 160 characters.',
    };
  }

  if (!Number.isFinite(price) || price <= 0 || price > 1000000) {
    return { error: 'Please provide a valid product price.' };
  }

  const roundedPrice = Math.round(price * 100) / 100;

  if (roundedPrice <= 0) {
    return { error: 'Please provide a valid product price.' };
  }

  if (
    supplierCost !== null &&
    (!Number.isFinite(supplierCost) || supplierCost < 0 || supplierCost > 1000000)
  ) {
    return { error: 'Please provide a valid supplier cost.' };
  }

  if (
    sku !== null &&
    (sku === '__invalid__' || !/^[A-Z0-9][A-Z0-9._/-]{0,79}$/.test(sku))
  ) {
    return { error: 'SKU must contain 1–80 valid letters, numbers or . _ / - characters.' };
  }

  if (storefront !== null && !['yotaabo', 'poshies'].includes(storefront)) {
    return { error: 'Please select a valid storefront.' };
  }

  if (!categoryId && !category) {
    return { error: 'Please select a valid category.' };
  }

  if (categoryId && !uuidPattern.test(categoryId)) {
    return { error: 'Please provide a valid category.' };
  }

  if (!subcategoryId && !subcategory) {
    return { error: 'Please provide a valid subcategory.' };
  }

  if (subcategoryId && !uuidPattern.test(subcategoryId)) {
    return { error: 'Please provide a valid subcategory.' };
  }

  if (category.length > 120 || subcategory.length > 120) {
    return {
      error: 'The selected category or subcategory is invalid.',
    };
  }

  if (typeof isActive !== 'boolean') {
    return { error: 'Please provide a valid product status.' };
  }

  if (typeof marketplaceVisible !== 'boolean' || typeof storefrontVisible !== 'boolean') {
    return { error: 'Please provide valid product visibility settings.' };
  }

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    return { error: 'Please provide a valid sort order.' };
  }

  if (description && description.length > 10000) {
    return { error: 'Product description is too long.' };
  }

  if (imageUrl && imageUrl.length > 2048) {
    return { error: 'Product image URL is too long.' };
  }

  return {
    product: {
      name,
      storefront,
      price: roundedPrice,
      supplier_cost: supplierCost === null
        ? null
        : Math.round(supplierCost * 100) / 100,
      sku,
      sizes,
      category,
      category_id: categoryId,
      subcategory,
      subcategory_id: subcategoryId,
      description,
      image_url: imageUrl,
      is_active: isActive,
      marketplace_visible: marketplaceVisible,
      storefront_visible: storefrontVisible,
      sort_order: sortOrder,
    },
  };
}
