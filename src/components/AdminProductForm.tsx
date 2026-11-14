import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';
import Modal from './Modal';
import CustomDropdown from './CustomDropdown';

export type AdminProduct = {
  id?: string;
  storefront: 'yotaabo' | 'poshies';
  name: string;
  price: number;
  supplier_cost?: number | null;
  sku?: string | null;
  category: string;
  category_id: string | null;
  subcategory: string;
  subcategory_id: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type SavedAdminProduct = AdminProduct & {
  id: string;
  created_at: string;
};

type AdminProductFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: SavedAdminProduct) => void;
  productToEdit?: AdminProduct | null;
  adminRole?: 'super_admin' | 'store_admin' | null;
  storeSlug?: 'yotaabo' | 'poshies' | null;
};

type CatalogueSubcategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

type CatalogueCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  subcategories: CatalogueSubcategory[];
};

const DRAFT_STORAGE_KEY = 'yotaabo-admin-product-form-draft';

const getProductStoragePath = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const marker = '/storage/v1/object/public/products/';
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

const emptyProduct: AdminProduct = {
  storefront: 'yotaabo',
  name: '',
  price: 0,
  supplier_cost: null,
  sku: '',
  category: '',
  category_id: null,
  subcategory: '',
  subcategory_id: null,
  description: '',
  image_url: '',
  is_active: true,
  sort_order: 0,
};

const normalizeSupplierCost = (value: unknown): number | null => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  return Number.NaN;
};

export default function AdminProductForm({
  isOpen,
  onClose,
  onSaved,
  productToEdit,
  adminRole,
  storeSlug,
}: AdminProductFormProps) {
  const [form, setForm] = useState<AdminProduct>(emptyProduct);
  const [statusValue, setStatusValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const [categoriesStorefront, setCategoriesStorefront] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryLoadError, setCategoryLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsDraftHydrated(false);
      return;
    }

    setIsDraftHydrated(false);

    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      const saved = raw
        ? JSON.parse(raw) as {
            productId: string | null;
            form: AdminProduct;
            statusValue: string;
          }
        : null;

      const currentProductId = productToEdit?.id ?? null;

      if (
        saved &&
        saved.productId === currentProductId &&
        saved.form
      ) {
        setForm({
          ...emptyProduct,
          ...saved.form,
          supplier_cost: normalizeSupplierCost(saved.form.supplier_cost),
          storefront: adminRole === 'store_admin' && storeSlug ? storeSlug : saved.form.storefront === 'poshies' ? 'poshies' : 'yotaabo',
        });
        setStatusValue(saved.statusValue ?? '');
      } else {
        setForm(productToEdit
          ? {
              ...emptyProduct,
              ...productToEdit,
              supplier_cost: normalizeSupplierCost(productToEdit.supplier_cost),
              storefront: adminRole === 'store_admin' && storeSlug ? storeSlug : productToEdit.storefront === 'poshies' ? 'poshies' : 'yotaabo',
            }
          : {
            ...emptyProduct,
            storefront: adminRole === 'store_admin' && storeSlug ? storeSlug : emptyProduct.storefront,
          });
        setStatusValue(
          productToEdit
            ? productToEdit.is_active ? 'active' : 'hidden'
            : ''
        );
      }
    } catch {
      setForm(productToEdit
        ? {
            ...emptyProduct,
            ...productToEdit,
            supplier_cost: normalizeSupplierCost(productToEdit.supplier_cost),
            storefront: adminRole === 'store_admin' && storeSlug ? storeSlug : productToEdit.storefront === 'poshies' ? 'poshies' : 'yotaabo',
          }
        : {
            ...emptyProduct,
            storefront: adminRole === 'store_admin' && storeSlug ? storeSlug : emptyProduct.storefront,
          });
      setStatusValue(
        productToEdit
          ? productToEdit.is_active ? 'active' : 'hidden'
          : ''
      );
    }

    setIsDraftHydrated(true);
  }, [isOpen, productToEdit, adminRole, storeSlug]);

  useEffect(() => {
    if (!isOpen || !isDraftHydrated) {
      setCategories([]);
      setCategoriesStorefront(null);
      setCategoryLoadError(null);
      return;
    }

    let cancelled = false;
    const storefront = form.storefront;

    setCategories([]);
    setCategoriesStorefront(null);
    setCategoryLoadError(null);
    setIsLoadingCategories(true);

    const loadCategories = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('Your session has expired. Please sign in again.');
        }

        const response = await fetch(
          `/api/categories?storefront=${encodeURIComponent(storefront)}&scope=admin`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load categories.');
        }

        if (!Array.isArray(data.categories)) {
          throw new Error('The categories response is invalid.');
        }

        if (cancelled) return;

        setCategories(data.categories as CatalogueCategory[]);
        setCategoriesStorefront(storefront);
      } catch (error) {
        if (cancelled) return;

        setCategoryLoadError(
          error instanceof Error
            ? error.message
            : 'Unable to load categories.'
        );
      } finally {
        if (!cancelled) setIsLoadingCategories(false);
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [isOpen, isDraftHydrated, form.storefront]);

  useEffect(() => {
    if (
      !isOpen ||
      !isDraftHydrated ||
      isLoadingCategories ||
      categoryLoadError ||
      categoriesStorefront !== form.storefront ||
      categories.length === 0
    ) {
      return;
    }

    setForm((prev) => {
      const legacyCategoryName =
        prev.storefront === 'poshies' && prev.category.toLowerCase() === 'spaces'
          ? 'Lounge'
          : prev.category;

      const category =
        categories.find((item) => item.id === prev.category_id) ||
        categories.find(
          (item) => item.name.toLowerCase() === legacyCategoryName.toLowerCase()
        ) ||
        (!prev.category && !prev.category_id
          ? categories.find((item) => item.is_active)
          : undefined);

      if (!category) return prev;

      const subcategory =
        category.subcategories.find(
          (item) => item.id === prev.subcategory_id
        ) ||
        category.subcategories.find(
          (item) => item.name.toLowerCase() === prev.subcategory.toLowerCase()
        ) ||
        (!prev.subcategory && !prev.subcategory_id
          ? category.subcategories.find((item) => item.is_active)
          : undefined);

      const nextSubcategory = subcategory ?? null;

      if (
        prev.category_id === category.id &&
        prev.category === category.name &&
        prev.subcategory_id === (nextSubcategory?.id ?? null) &&
        prev.subcategory === (nextSubcategory?.name ?? '')
      ) {
        return prev;
      }

      return {
        ...prev,
        category_id: category.id,
        category: category.name,
        subcategory_id: nextSubcategory?.id ?? null,
        subcategory: nextSubcategory?.name ?? '',
      };
    });
  }, [
    isOpen,
    isDraftHydrated,
    isLoadingCategories,
    categoryLoadError,
    categoriesStorefront,
    form.storefront,
    form.category,
    form.category_id,
    form.subcategory,
    form.subcategory_id,
    categories,
  ]);

  useEffect(() => {
    if (!isOpen || !isDraftHydrated) return;

    try {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          productId: productToEdit?.id ?? null,
          form,
          statusValue,
        })
      );
    } catch {
      // Storage may be unavailable; the form remains usable.
    }
  }, [isOpen, isDraftHydrated, form, statusValue, productToEdit]);

  const handleClose = () => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage errors when closing.
    }

    setIsDraftHydrated(false);
    onClose();
  };

  const handleChange = (field: keyof AdminProduct, value: any) => {
    if (field === 'category') {
      const selected = categories.find((item) => item.id === value);
      if (!selected) return;

      const firstSubcategory =
        selected.subcategories.find((item) => item.is_active) ?? null;

      setForm((prev) => ({
        ...prev,
        category: selected.name,
        category_id: selected.id,
        subcategory: firstSubcategory?.name ?? '',
        subcategory_id: firstSubcategory?.id ?? null,
      }));
      return;
    }

    if (field === 'subcategory') {
      const selected = categories
        .find((item) => item.id === form.category_id)
        ?.subcategories.find((item) => item.id === value);

      if (!selected) return;

      setForm((prev) => ({
        ...prev,
        subcategory: selected.name,
        subcategory_id: selected.id,
      }));
      return;
    }

    if (field === 'storefront') {
      setForm((prev) => ({
        ...prev,
        storefront: value,
        category: '',
        category_id: null,
        subcategory: '',
        subcategory_id: null,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!supportedTypes.includes(file.type)) {
        throw new Error('Please select a JPEG, PNG, or WebP image.');
      }

      const optimizedFile = await new Promise<File>((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        const cleanup = () => URL.revokeObjectURL(objectUrl);

        image.onload = () => {
          try {
            const maxDimension = 1600;
            const scale = Math.min(
              1,
              maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
            );

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

            const context = canvas.getContext('2d');

            if (!context) {
              throw new Error('Could not process this image.');
            }

            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
              (blob) => {
                cleanup();

                if (!blob || blob.type !== 'image/webp') {
                  reject(new Error('Your browser could not convert this image to WebP.'));
                  return;
                }

                const filename = file.name.replace(/\.[^.]+$/, '') || 'product';

                resolve(
                  new File([blob], `${filename}.webp`, {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  })
                );
              },
              'image/webp',
              0.82
            );
          } catch (error) {
            cleanup();
            reject(error);
          }
        };

        image.onerror = () => {
          cleanup();
          reject(new Error('Could not read this image. Try another file.'));
        };

        image.src = objectUrl;
      });

      const path = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;

      const { error } = await supabase.storage
        .from('products')
        .upload(path, optimizedFile, {
          cacheControl: '31536000',
          contentType: 'image/webp',
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('products').getPublicUrl(path);

      setForm((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success('Image optimised and uploaded');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred.';

      toast.error('Image upload failed: ' + message);
    } finally {
      setIsUploading(false);
      input.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (form.price <= 0) return toast.error('Price must be greater than 0');
    if (form.supplier_cost != null && (!Number.isFinite(form.supplier_cost) || form.supplier_cost < 0)) return toast.error('Supplier cost must be zero or greater');
    if (!statusValue) return toast.error('Status is required');
    if (isLoadingCategories) return toast.error('Categories are still loading');
    if (categoryLoadError) return toast.error('Categories could not be loaded');
    if (!form.category_id) return toast.error('Select a valid category');
    if (!form.subcategory_id) return toast.error('Select a valid subcategory');

    setIsSaving(true);

    const requestId = crypto.randomUUID();
    const startedAt = Date.now();

    const payload = {
      storefront: form.storefront,
      name: form.name.trim(),
      price: form.price,
      supplier_cost: form.supplier_cost ?? null,
      sku: form.sku?.trim().toUpperCase() || null,
      category: form.category,
      category_id: form.category_id,
      subcategory: form.subcategory,
      subcategory_id: form.subcategory_id,
      description: form.description?.trim() || null,
      image_url: form.image_url?.trim() || null,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const response = await fetch('/api/products', {
        method: productToEdit?.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          'x-request-id': requestId,
        },
        body: JSON.stringify({
          ...payload,
          ...(productToEdit?.id ? { id: productToEdit.id } : {}),
        }),
      });

      const responseText = await response.text();
      let data: { error?: string; product?: SavedAdminProduct } = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          // Handle non-JSON server responses below.
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save the product.');
      }

      if (
        !data.product ||
        typeof data.product.id !== 'string' ||
        !data.product.id ||
        typeof data.product.created_at !== 'string' ||
        !data.product.created_at
      ) {
        throw new Error('The server response did not contain a confirmed saved product.');
      }

      const savedProduct = data.product;

      console.info('[admin-products] save confirmed', {
        requestId,
        operation: productToEdit?.id ? 'update' : 'create',
        productId: savedProduct.id,
        storefront: savedProduct.storefront,
        status: response.status,
        serverRequestId: response.headers.get('x-request-id'),
        totalDurationMs: Date.now() - startedAt,
      });

      try {
        onSaved(savedProduct);
      } catch (reconcileError) {
        console.error('[admin-products] saved product reconciliation failed', {
          requestId,
          productId: savedProduct.id,
          error: reconcileError,
        });

        toast.error('Product saved, but the product list could not be updated immediately.');
      }

      toast.success(productToEdit ? 'Product updated' : 'Product added');
      handleClose();

      if (
        productToEdit?.image_url &&
        productToEdit.image_url !== payload.image_url
      ) {
        const oldImagePath = getProductStoragePath(productToEdit.image_url);

        if (oldImagePath) {
          void supabase.storage
            .from('products')
            .remove([oldImagePath])
            .then(({ error: deleteError }) => {
              if (deleteError) {
                console.error('[admin-products] previous image cleanup failed', {
                  requestId,
                  productId: savedProduct.id,
                  error: deleteError,
                });

                toast.error('Product saved, but the previous image could not be deleted.');
                return;
              }

              console.info('[admin-products] previous image cleanup completed', {
                requestId,
                productId: savedProduct.id,
              });
            })
            .catch((deleteError) => {
              console.error('[admin-products] previous image cleanup failed', {
                requestId,
                productId: savedProduct.id,
                error: deleteError,
              });

              toast.error('Product saved, but the previous image could not be deleted.');
            });
        }
      }
    } catch (error) {
      console.error('[admin-products] save request failed', {
        requestId,
        operation: productToEdit?.id ? 'update' : 'create',
        totalDurationMs: Date.now() - startedAt,
        error,
      });

      toast.error(
        error instanceof Error ? error.message : 'Unable to save the product.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategory = categories.find(
    (item) => item.id === form.category_id
  );

  const categoryOptions = categories
    .filter((item) => item.is_active || item.id === form.category_id)
    .map((item) => ({
      value: item.id,
      label: item.is_active ? item.name : `${item.name} (Inactive)`,
    }));

  const subcategoryOptions = (selectedCategory?.subcategories ?? [])
    .filter((item) => item.is_active || item.id === form.subcategory_id)
    .map((item) => ({
      value: item.id,
      label: item.is_active ? item.name : `${item.name} (Inactive)`,
    }));

  const inputClass =
    'w-full border-0 bg-[#f5f5f5] px-4 py-3 admin-type-body text-[#4d4d4d] outline-none ring-0 transition-colors placeholder:text-[#4d4d4d]/40 focus:border-0 focus:outline-none focus:ring-0';

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 sm:p-8">
        <h2 className="admin-type-section-title text-[#4d4d4d]">
          {productToEdit ? 'Edit Product' : 'Add Product'}
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Name</span>
            <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} placeholder="e.g. Noir Oud" />
          </label>

          {adminRole === 'super_admin' ? (
            <label className="block">
              <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Storefront</span>
              <CustomDropdown
                value={form.storefront}
                onChange={(value) => handleChange('storefront', value)}
                options={[
                  { value: 'yotaabo', label: 'Yotaabo' },
                  { value: 'poshies', label: 'Poshies' },
                ]}
                placeholder="Select storefront"
              />
            </label>
          ) : (
            <div>
              <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Storefront</span>
              <div className="border border-solid border-[#4d4d4d]/20 px-3 py-2 text-sm text-[#4d4d4d]">
                {form.storefront === 'poshies' ? 'Poshies' : 'Yotaabo'}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Price (R)</span>
              <input type="number" value={form.price || ''} onChange={(e) => handleChange('price', Number(e.target.value))} className={`${inputClass} admin-type-price`} placeholder="0" />
            </label>

            <label className="block">
              <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Status</span>
              <CustomDropdown
                value={statusValue}
                onChange={(v) => { setStatusValue(v); handleChange('is_active', v === 'active'); }}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'hidden', label: 'Hidden' },
                ]}
                placeholder="Select"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Supplier Cost (R)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.supplier_cost ?? ''}
                onChange={(e) => handleChange('supplier_cost', e.target.value === '' ? null : Number(e.target.value))}
                className={inputClass}
                placeholder="0.00"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">SKU</span>
              <input
                type="text"
                value={form.sku ?? ''}
                onChange={(e) => handleChange('sku', e.target.value)}
                className={inputClass}
                placeholder="e.g. YOT-001"
                maxLength={80}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Category</span>
              <CustomDropdown
                value={form.category_id ?? ''}
                onChange={(v) => handleChange('category', v)}
                options={categoryOptions}
                placeholder={
                  isLoadingCategories
                    ? 'Loading categories...'
                    : categoryLoadError
                      ? 'Categories unavailable'
                      : 'Select'
                }
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Subcategory</span>
              <CustomDropdown
                value={form.subcategory_id ?? ''}
                onChange={(v) => handleChange('subcategory', v)}
                options={subcategoryOptions}
                placeholder={
                  !form.category_id
                    ? 'Select category first'
                    : isLoadingCategories
                      ? 'Loading subcategories...'
                      : 'Select'
                }
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Description</span>
            <textarea rows={3} value={form.description ?? ''} onChange={(e) => handleChange('description', e.target.value)} className={`resize-none ${inputClass}`} placeholder="Write a short product description..." />
          </label>

          <div>
            <span className="mb-1.5 block admin-type-micro font-semibold uppercase tracking-widest text-[#4d4d4d]/40">Product Image</span>

            <div className="flex gap-2">
              <input
                type="url"
                value={form.image_url ?? ''}
                onChange={(e) => handleChange('image_url', e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />

              <label className={`flex h-[46px] shrink-0 cursor-pointer items-center justify-center border-0 bg-[#4d4d4d] px-4 admin-type-body text-white transition-colors hover:bg-[#3a3a3a] ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}>
                {isUploading ? '...' : form.image_url?.trim() ? 'Change' : 'Upload'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            {form.image_url?.trim() && (
              <div className="mt-3 flex h-40 w-full items-center justify-center overflow-hidden bg-[#f5f5f5] p-3">
                <img
                  src={form.image_url}
                  alt="Product preview"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="button" onClick={handleClose} className="flex h-12 flex-1 items-center justify-center border-0 bg-[#f5f5f5] admin-type-body text-[#4d4d4d] transition-colors hover:bg-[#e5e5e5]">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={isSaving} className="flex h-12 flex-1 items-center justify-center border border-solid border-[#4d4d4d] bg-[#4d4d4d] admin-type-body text-white transition-colors hover:bg-transparent hover:text-[#4d4d4d] disabled:opacity-50">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </span>
              ) : productToEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
