import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import SimatuPlatformServicesAdmin from './SimatuPlatformServicesAdmin';
import SimatuPlatformCampaignsAdmin from './SimatuPlatformCampaignsAdmin';
import SimatuPlatformAdvertisingAdmin from './SimatuPlatformAdvertisingAdmin';

type Category = { id: string; name: string; slug: string };
type Subcategory = { id: string; name: string; slug: string; category_slug: string };
type MarketplaceProduct = {
  id: string; name: string; sku: string; description: string; image_url: string;
  price: number; supplier_cost: number | null; category_slug: string; category_name: string;
  marketplace_subcategory_id: string; subcategory_name: string; is_active: boolean;
  marketplace_visible: boolean; sort_order: number;
  variants?: Array<Record<string, unknown>>; attributes?: Array<Record<string, unknown>>;
};
type Props = { accessToken: string };

const blank = {
  name: '', sku: '', description: '', image_url: '', price: '0', supplier_cost: '',
  category_slug: '', subcategory_id: '', is_active: true, marketplace_visible: true, sort_order: '0',
};
const field = 'w-full rounded-xl border px-3 py-2 text-sm';
const surface = { borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' };

export default function SimatuMarketplaceAdmin({ accessToken }: Props) {
  const [section, setSection] = useState<'products'|'services'|'campaigns'|'advertising'>('products');
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const headers = useMemo(() => ({ Authorization: `Bearer ${accessToken}` }), [accessToken]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [p, c, s] = await Promise.all([
        fetch('/api/marketplace-products?scope=admin', { headers, cache: 'no-store' }),
        fetch('/api/marketplace-categories', { cache: 'no-store' }),
        fetch('/api/marketplace-subcategories', { cache: 'no-store' }),
      ]);
      if (!p.ok || !c.ok || !s.ok) throw new Error('Marketplace data could not be loaded.');
      const [pd, cd, sd] = await Promise.all([p.json(), c.json(), s.json()]);
      setProducts(Array.isArray(pd.products) ? pd.products : []);
      setCategories(Array.isArray(cd.categories) ? cd.categories : []);
      setSubcategories(Array.isArray(sd.subcategories) ? sd.subcategories : []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Marketplace data failed to load.'); }
    finally { setLoading(false); }
  }, [headers]);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => products.filter(p => {
    const q = search.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  }), [products, search]);
  const availableSubcategories = subcategories.filter(s => s.category_slug === draft.category_slug);

  const startEdit = (product: MarketplaceProduct) => {
    setEditing(product); setFormOpen(true);
    setDraft({
      name: product.name, sku: product.sku, description: product.description || '',
      image_url: product.image_url, price: String(product.price ?? 0),
      supplier_cost: product.supplier_cost == null ? '' : String(product.supplier_cost),
      category_slug: product.category_slug, subcategory_id: product.marketplace_subcategory_id,
      is_active: product.is_active, marketplace_visible: product.marketplace_visible,
      sort_order: String(product.sort_order ?? 0),
    });
    setNotice(''); setError('');
  };
  const reset = () => { setEditing(null); setFormOpen(false); setDraft(blank); setError(''); setNotice(''); };
  const change = (key: keyof typeof blank, value: string | boolean) => setDraft(current => ({
    ...current, [key]: value,
    ...(key === 'category_slug' ? { subcategory_id: '' } : {}),
  }));

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const payload = {
      ...draft, price: Number(draft.price), supplier_cost: draft.supplier_cost === '' ? null : Number(draft.supplier_cost),
      sort_order: Number(draft.sort_order), id: editing?.id,
      variants: (editing?.variants ?? []).map(v => ({ sku: v.sku, name: v.name, price: v.price, supplier_cost: v.supplier_cost ?? null, options: v.options ?? {}, is_active: v.is_active !== false })),
      attributes: (editing?.attributes ?? []).map(a => ({ key: a.attribute_key ?? a.key, label: a.label, data_type: a.data_type, unit: a.unit ?? null, validation: a.validation ?? {}, required: Boolean(a.is_required ?? a.required), value: a.value, sort_order: a.sort_order ?? 0, is_active: a.is_active !== false })),
    };
    try {
      const response = await fetch('/api/marketplace-products', {
        method: editing ? 'PATCH' : 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Product could not be saved.');
      const successMessage = editing ? 'Marketplace product updated.' : 'Marketplace product created.';
      setEditing(null); setFormOpen(false); setDraft(blank); setError(''); setNotice(successMessage); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setSaving(false); }
  }

  async function archive(product: MarketplaceProduct) {
    if (!window.confirm(`Remove "${product.name}" from marketplace visibility and archive it?`)) return;
    setError(''); setNotice('');
    try {
      const response = await fetch('/api/marketplace-products', {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id, name: product.name, sku: product.sku, description: product.description || '',
          image_url: product.image_url, price: Number(product.price), supplier_cost: product.supplier_cost ?? null,
          category_slug: product.category_slug, subcategory_id: product.marketplace_subcategory_id,
          is_active: false, marketplace_visible: false, sort_order: product.sort_order ?? 0,
          variants: (product.variants ?? []).map(v => ({ sku: v.sku, name: v.name, price: v.price, supplier_cost: v.supplier_cost ?? null, options: v.options ?? {}, is_active: v.is_active !== false })),
          attributes: (product.attributes ?? []).map(a => ({ key: a.attribute_key ?? a.key, label: a.label, data_type: a.data_type, unit: a.unit ?? null, validation: a.validation ?? {}, required: Boolean(a.is_required ?? a.required), value: a.value, sort_order: a.sort_order ?? 0, is_active: a.is_active !== false })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Product could not be archived.');
      setNotice(`"${product.name}" archived and removed from marketplace visibility.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Archive failed.'); }
  }

  const labelStyle = { display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--admin-text-primary)' } as const;
  const inputStyle = { borderColor: 'var(--admin-border-strong)', background: 'var(--admin-surface)', color: 'var(--admin-text-primary)' };

  return <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-28 pt-5" aria-label="Simatu marketplace administration">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-widest opacity-60">Platform-owned catalogue</p><h1 className="mt-1 text-2xl font-semibold">Simatu Marketplace</h1><p className="mt-2 max-w-xl text-sm opacity-70">Create and manage products published directly by Simatu. These products are independent of store-owned catalogues.</p></div>
      {section === 'products' && <button type="button" onClick={() => { reset(); setFormOpen(true); }} className="rounded-xl border px-4 py-2 text-sm font-semibold">+ Add marketplace product</button>}
    </header>
    <nav className="flex flex-wrap gap-2" aria-label="Marketplace admin sections">{(['products','services','campaigns','advertising'] as const).map(item=><button key={item} type="button" onClick={()=>setSection(item)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${section===item?'bg-neutral-900 text-white':'opacity-70'}`}>{item==='products'?'Products':item==='services'?'Services':item==='campaigns'?'Campaigns':'Advertising'}</button>)}</nav>
    {section === 'services' && <SimatuPlatformServicesAdmin accessToken={accessToken} />}
    {section === 'campaigns' && <SimatuPlatformCampaignsAdmin accessToken={accessToken} />}
    {section === 'advertising' && <SimatuPlatformAdvertisingAdmin accessToken={accessToken} />}
    {section === 'products' && <>
    {error && <p role="alert" className="rounded-xl border border-red-300 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-xl border p-3 text-sm">{notice}</p>}
    {formOpen ? <form onSubmit={save} className="space-y-4 rounded-2xl border p-4" style={surface}>
      <div className="flex items-center justify-between"><h2 className="font-semibold">{editing ? 'Edit platform product' : 'Create platform product'}</h2><button type="button" onClick={reset} className="text-sm underline">Cancel</button></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label style={labelStyle}>Product name<input required maxLength={200} className={field} style={inputStyle} value={draft.name} onChange={e=>change('name',e.target.value)}/></label>
        <label style={labelStyle}>SKU<input required maxLength={100} className={field} style={inputStyle} value={draft.sku} onChange={e=>change('sku',e.target.value.toUpperCase())}/></label>
        <label style={labelStyle}>Marketplace category<select required className={field} style={inputStyle} value={draft.category_slug} onChange={e=>change('category_slug',e.target.value)}><option value="">Select category</option>{categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}</select></label>
        <label style={labelStyle}>Subcategory<select required className={field} style={inputStyle} value={draft.subcategory_id} onChange={e=>change('subcategory_id',e.target.value)} disabled={!draft.category_slug}><option value="">Select subcategory</option>{availableSubcategories.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label style={labelStyle}>Marketplace price (R)<input type="number" min="0" step="0.01" required className={field} style={inputStyle} value={draft.price} onChange={e=>change('price',e.target.value)}/></label>
        <label style={labelStyle}>Cost (optional)<input type="number" min="0" step="0.01" className={field} style={inputStyle} value={draft.supplier_cost} onChange={e=>change('supplier_cost',e.target.value)}/></label>
        <label style={labelStyle}>Image URL<input required type="url" className={field} style={inputStyle} value={draft.image_url} onChange={e=>change('image_url',e.target.value)} placeholder="https://…"/></label>
        <label style={labelStyle}>Sort order<input type="number" min="0" step="1" className={field} style={inputStyle} value={draft.sort_order} onChange={e=>change('sort_order',e.target.value)}/></label>
      </div>
      <label style={labelStyle}>Description<textarea maxLength={10000} rows={4} className={field} style={inputStyle} value={draft.description} onChange={e=>change('description',e.target.value)}/></label>
      <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={draft.is_active} onChange={e=>change('is_active',e.target.checked)}/>Active</label><label className="flex items-center gap-2"><input type="checkbox" checked={draft.marketplace_visible} onChange={e=>change('marketplace_visible',e.target.checked)}/>Marketplace presence</label></div>
      {editing && ((editing.variants?.length ?? 0)>0 || (editing.attributes?.length ?? 0)>0) && <aside className="rounded-xl border p-3 text-sm opacity-80"><strong>Existing product configuration preserved.</strong><p className="mt-1">Variants and attributes are retained during edits; their editors are not included in this first management slice.</p></aside>}
      <button disabled={saving} className="rounded-xl border px-4 py-2 text-sm font-semibold" type="submit">{saving ? 'Saving…' : editing ? 'Save changes' : 'Create marketplace product'}</button>
    </form> : null}
    <div className="flex flex-wrap gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} className={field} style={{...inputStyle, maxWidth:420}} placeholder="Search marketplace products by name or SKU"/><button type="button" onClick={()=>void load()} className="rounded-xl border px-3 py-2 text-sm">Refresh</button></div>
    {loading ? <p className="text-sm opacity-70">Loading marketplace catalogue…</p> : filtered.length===0 ? <div className="rounded-2xl border p-6 text-sm opacity-70" style={surface}>No Simatu marketplace products found.</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map(product=><article key={product.id} className="overflow-hidden rounded-2xl border" style={surface}>
        <img src={product.image_url} alt={product.name} className="h-48 w-full object-cover" loading="lazy"/>
        <div className="space-y-2 p-4"><div className="flex items-start justify-between gap-2"><h2 className="font-semibold">{product.name}</h2><span className="text-xs opacity-60">{product.is_active?'Active':'Inactive'}</span></div><p className="text-sm opacity-70">{product.sku}</p><p className="text-sm font-semibold">R {Number(product.price).toFixed(2)}</p><p className="text-xs opacity-60">{product.category_name} · {product.subcategory_name}</p><p className="text-xs opacity-60">{product.marketplace_visible?'Marketplace visible':'Not published'}</p><div className="flex gap-2 pt-2"><button type="button" onClick={()=>startEdit(product)} className="rounded-lg border px-3 py-2 text-sm">Edit</button><button type="button" onClick={()=>void archive(product)} className="rounded-lg border px-3 py-2 text-sm">Archive</button></div></div>
      </article>)}
    </div>}
    </>}
  </section>;
}
