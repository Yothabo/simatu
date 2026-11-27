import { useCallback, useEffect, useMemo, useState } from 'react';

type Category = { id: string; name: string; slug: string; description: string | null; sort_order: number; audience_policy: 'general' | 'restricted'; minimum_age: number | null; is_active: boolean };
type Subcategory = { id: string; marketplace_category_id: string; name: string; slug: string; description: string | null; sort_order: number; is_active: boolean };
type Tile = { id: string; marketplace_category_id: string; category_name?: string; category_slug?: string; title: string; image_url: string; alt_text: string; subtitle: string | null; destination_path: string; sort_order: number; is_active: boolean };
type Editor = { kind: 'category' | 'subcategory' | 'tile'; record?: Category | Subcategory | Tile };
type Props = { accessToken: string };

const input = 'w-full rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]';
const button = 'rounded-lg border border-[var(--admin-border-subtle)] px-3 py-2 text-sm font-medium hover:opacity-80';
const blank = (kind: Editor['kind'], parent: string) => kind === 'category'
  ? { name: '', slug: '', description: '', sort_order: 0, audience_policy: 'general', minimum_age: null, is_active: true }
  : kind === 'subcategory'
    ? { marketplace_category_id: parent, name: '', slug: '', description: '', sort_order: 0, is_active: true }
    : { marketplace_category_id: parent, title: '', image_url: '', alt_text: '', subtitle: '', destination_path: '/discover/', sort_order: 0, is_active: true };

export default function SimatuMarketplaceAdmin({ accessToken }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subs, setSubs] = useState<Subcategory[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selected, setSelected] = useState('');
  const [view, setView] = useState<'taxonomy' | 'tiles'>('taxonomy');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const api = useCallback(async (path: string, method = 'GET', body?: unknown) => {
    const res = await fetch(path, { method, headers: { Authorization: 'Bearer ' + accessToken, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
    return data;
  }, [accessToken]);

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [taxonomy, discovery] = await Promise.all([api('/api/admin-marketplace-taxonomy'), api('/api/admin-marketplace-discovery-tiles')]);
      const cats = Array.isArray(taxonomy.categories) ? taxonomy.categories : [];
      setCategories(cats); setSubs(Array.isArray(taxonomy.subcategories) ? taxonomy.subcategories : []);
      setTiles(Array.isArray(discovery.tiles) ? discovery.tiles : []);
      setSelected((current) => current && cats.some((c: Category) => c.id === current) ? current : cats[0]?.id || '');
    } catch (e) { setError(e instanceof Error ? e.message : 'Marketplace data failed to load.'); }
    finally { setLoading(false); }
  }, [api]);
  useEffect(() => { void refresh(); }, [refresh]);

  const category = categories.find(c => c.id === selected) || categories[0];
  const childSubs = useMemo(() => subs.filter(s => s.marketplace_category_id === category?.id), [subs, category?.id]);
  const childTiles = useMemo(() => tiles.filter(t => t.marketplace_category_id === category?.id), [tiles, category?.id]);

  const open = (kind: Editor['kind'], record?: Category | Subcategory | Tile) => {
    setEditor({ kind, record });
    setDraft(record ? { ...record } : blank(kind, category?.id || ''));
    setError(''); setNotice('');
  };
  const save = async () => {
    if (!editor) return;
    setBusy(true); setError('');
    try {
      if (editor.kind === 'tile') await api('/api/admin-marketplace-discovery-tiles', editor.record ? 'PATCH' : 'POST', { ...draft, ...(editor.record ? { id: editor.record.id } : {}) });
      else await api('/api/admin-marketplace-taxonomy', editor.record ? 'PATCH' : 'POST', { ...draft, type: editor.kind, ...(editor.record ? { id: editor.record.id } : {}) });
      setEditor(null); setNotice('Saved.'); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  };
  const archive = async (kind: Editor['kind'], record: Category | Subcategory | Tile) => {
    if (!window.confirm('Archive this item? It will be hidden publicly but retained.')) return;
    setBusy(true); setError('');
    try {
      if (kind === 'tile') await api('/api/admin-marketplace-discovery-tiles', 'DELETE', { id: record.id });
      else await api('/api/admin-marketplace-taxonomy', 'DELETE', { type: kind, id: record.id });
      setNotice('Archived.'); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Archive failed.'); }
    finally { setBusy(false); }
  };
  const field = (label: string, key: string, type: 'text' | 'number' = 'text') => <label className="grid gap-1 text-sm font-medium text-[var(--admin-text)]">{label}<input className={input} type={type} value={String(draft[key] ?? '')} onChange={e => setDraft(d => ({ ...d, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}/></label>;
  const toggle = (label: string, key: string) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft[key] !== false} onChange={e => setDraft(d => ({ ...d, [key]: e.target.checked }))}/>{label}</label>;
  const row = (name: string, slug: string, active: boolean, edit: () => void, hide: () => void) => <div key={slug} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--admin-border-subtle)] p-3"><div><strong>{name}</strong><p className="text-xs opacity-60">{slug} · {active ? 'Active' : 'Archived'}</p></div><div className="flex gap-2"><button className={button} onClick={edit}>Edit</button>{active && <button className={button} disabled={busy} onClick={hide}>Archive</button>}</div></div>;

  return <section className="admin-scope mx-auto max-w-6xl px-4 pb-28 pt-5">
    <div className="mb-5 flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-semibold">Marketplace structure</h1><p className="text-sm opacity-70">Manage categories, subcategories and discovery tiles.</p></div><button className={button} disabled={loading || busy} onClick={() => void refresh()}>Refresh</button></div>
    <div className="mb-4 flex gap-2"><button className={button} aria-pressed={view === 'taxonomy'} onClick={() => setView('taxonomy')}>Categories & subcategories</button><button className={button} aria-pressed={view === 'tiles'} onClick={() => setView('tiles')}>Discovery tiles</button></div>
    {error && <p role="alert" className="mb-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
    {loading ? <p className="py-8 text-center">Loading marketplace…</p> : <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="grid content-start gap-2 rounded-xl border border-[var(--admin-border-subtle)] p-3"><div className="flex justify-between"><strong>Categories</strong><button className={button} onClick={() => open('category')}>Add +</button></div>{categories.map(c => <button key={c.id} onClick={() => setSelected(c.id)} className={'rounded-lg p-3 text-left ' + (c.id === category?.id ? 'bg-[var(--admin-surface-subtle)] font-semibold' : '')}><span className="block">{c.name}</span><small className="opacity-60">{c.slug} · {c.is_active ? 'Active' : 'Archived'}</small></button>)}</aside>
      <div className="min-w-0 rounded-xl border border-[var(--admin-border-subtle)] p-4">
        {!category ? <p>No categories. Add one to begin.</p> : view === 'taxonomy' ? <><div className="mb-4 flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-semibold">{category.name}</h2><p className="text-sm opacity-70">Category details and child subcategories</p></div><button className={button} onClick={() => open('category', category)}>Edit category</button></div><div className="mb-4 flex gap-2 text-xs"><span className="rounded-full border px-2 py-1">{category.audience_policy === 'restricted' ? (category.minimum_age || 18) + '+ restricted' : 'General audience'}</span><span className="rounded-full border px-2 py-1">{category.is_active ? 'Published' : 'Archived'}</span></div><div className="mb-3 flex flex-wrap justify-between gap-2"><div><h3 className="font-semibold">Subcategories</h3><p className="text-xs opacity-70">Manage subcategory carousel items</p></div><button className={button} onClick={() => open('subcategory')}>Add subcategory +</button></div><div className="grid gap-2">{childSubs.map(s => row(s.name, s.slug, s.is_active, () => open('subcategory', s), () => void archive('subcategory', s)))}</div></> : <><div className="mb-3 flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-semibold">{category.name} tiles</h2><p className="text-sm opacity-70">Discovery image, text and destination route</p></div><button className={button} onClick={() => open('tile')}>Add tile +</button></div><div className="grid gap-3 sm:grid-cols-2">{childTiles.map(t => <article className="overflow-hidden rounded-xl border border-[var(--admin-border-subtle)]" key={t.id}><img className="h-40 w-full object-cover" src={t.image_url} alt={t.alt_text}/><div className="p-3"><strong>{t.title}</strong><p className="text-xs opacity-60">{t.destination_path} · order {t.sort_order} · {t.is_active ? 'Active' : 'Archived'}</p><div className="mt-3 flex gap-2"><button className={button} onClick={() => open('tile', t)}>Edit</button>{t.is_active && <button className={button} disabled={busy} onClick={() => void archive('tile', t)}>Archive</button>}</div></div></article>)}</div>{!childTiles.length && <p className="py-6 text-sm opacity-70">No managed tiles for this category yet.</p>}</>}
      </div></div>}
    {editor && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true"><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--admin-surface)] p-5 shadow-xl"><div className="mb-4 flex justify-between"><h2 className="text-lg font-semibold">{editor.record ? 'Edit ' : 'Add '}{editor.kind}</h2><button className={button} onClick={() => setEditor(null)}>Close</button></div><div className="grid gap-3">
      {editor.kind === 'tile' ? <>{field('Tile title', 'title')}{field('Image URL', 'image_url')}{field('Alt text', 'alt_text')}{field('Subtitle', 'subtitle')}{field('Destination route (/discover/slug)', 'destination_path')}{field('Order', 'sort_order', 'number')}<label className="grid gap-1 text-sm font-medium">Category<select className={input} value={draft.marketplace_category_id || ''} onChange={e => setDraft(d => ({ ...d, marketplace_category_id: e.target.value }))}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>{toggle('Published', 'is_active')}</> : <>{field('Name', 'name')}{field('Slug', 'slug')}{field('Description', 'description')}{field('Order', 'sort_order', 'number')}{editor.kind === 'subcategory' && <label className="grid gap-1 text-sm font-medium">Parent category<select className={input} value={draft.marketplace_category_id || ''} onChange={e => setDraft(d => ({ ...d, marketplace_category_id: e.target.value }))}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}{editor.kind === 'category' && <><label className="grid gap-1 text-sm font-medium">Audience<select className={input} value={draft.audience_policy || 'general'} onChange={e => setDraft(d => ({ ...d, audience_policy: e.target.value, minimum_age: e.target.value === 'restricted' ? d.minimum_age || 18 : null }))}><option value="general">General</option><option value="restricted">Restricted</option></select></label>{draft.audience_policy === 'restricted' && field('Minimum age (18+)', 'minimum_age', 'number')}</>}{toggle('Published', 'is_active')}</>}
      <div className="flex justify-end gap-2 pt-2"><button className={button} onClick={() => setEditor(null)}>Cancel</button><button className={button} disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save'}</button></div></div></div></div>}
  </section>;
}
