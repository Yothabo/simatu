import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

type MarketplaceCategory = { id: string; name: string; slug: string };
type MarketplaceStore = {
  store_id: string;
  store_name: string;
  store_slug: string;
  is_active: boolean;
  categories: MarketplaceCategory[];
};

type Props = { accessToken: string };

const surface: CSSProperties = {
  border: '1px solid var(--admin-border-subtle)',
  borderRadius: 'var(--ds-radius-lg)',
  background: 'var(--admin-surface)',
  padding: 'var(--admin-space-md)',
};

export default function MarketplaceCategoryManagement({ accessToken }: Props) {
  const [stores, setStores] = useState<MarketplaceStore[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [assignmentResponse, categoryResponse] = await Promise.all([
        fetch('/api/marketplace-category-assignments', { headers, cache: 'no-store' }),
        fetch('/api/marketplace-categories', { cache: 'no-store' }),
      ]);
      if (!assignmentResponse.ok) throw new Error('Could not load platform business assignments.');
      if (!categoryResponse.ok) throw new Error('Could not load marketplace categories.');
      const assignments = await assignmentResponse.json();
      const categoryData = await categoryResponse.json();
      setStores(Array.isArray(assignments.stores) ? assignments.stores : []);
      setCategories(Array.isArray(categoryData.categories) ? categoryData.categories : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Marketplace management failed to load.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { void load(); }, [load]);

  const visibleStores = useMemo(() => stores.filter((store) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || store.store_name.toLowerCase().includes(term) || store.store_slug.toLowerCase().includes(term);
    const assigned = store.categories.some((category) => category.id === categoryFilter);
    return matchesSearch && (categoryFilter === 'all' || assigned);
  }), [stores, search, categoryFilter]);

  async function toggle(store: MarketplaceStore, category: MarketplaceCategory) {
    const assigned = store.categories.some((item) => item.id === category.id);
    const key = `${store.store_id}:${category.id}`;
    setBusyKey(key);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/marketplace-category-assignments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: assigned ? 'unassign' : 'assign', storeId: store.store_id, categoryId: category.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Assignment update failed.');
      setStores((current) => current.map((entry) => entry.store_id !== store.store_id ? entry : {
        ...entry,
        categories: assigned
          ? entry.categories.filter((item) => item.id !== category.id)
          : [...entry.categories, category].sort((a, b) => a.name.localeCompare(b.name)),
      }));
      setNotice(`${category.name} ${assigned ? 'removed from' : 'assigned to'} ${store.store_name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assignment update failed.');
    } finally {
      setBusyKey('');
    }
  }

  return (
    <section className="flex w-full flex-col" style={{ gap: 'var(--admin-space-md)' }}>
      <div className="flex flex-col" style={{ gap: 'var(--admin-space-xs)' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--admin-size-heading-2)', fontWeight: 'var(--admin-weight-semibold)', color: 'var(--admin-text-primary)' }}>
          Marketplace classification
        </h2>
        <p style={{ margin: 0, fontSize: 'var(--admin-size-supporting)', lineHeight: 1.5, color: 'var(--admin-text-secondary)' }}>
          Assign platform-wide discovery categories to businesses. A business may belong to multiple categories; only eligible public listings are surfaced.
        </p>
      </div>

      <div style={{ ...surface, display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-sm)' }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search businesses by name or slug"
          aria-label="Search marketplace businesses"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--admin-border-strong)', borderRadius: 'var(--ds-radius-md)', background: 'var(--admin-surface)', color: 'var(--admin-text-primary)' }}
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by assigned category"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--admin-border-strong)', borderRadius: 'var(--ds-radius-md)', background: 'var(--admin-surface)', color: 'var(--admin-text-primary)' }}
        >
          <option value="all">All businesses</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </div>

      {error && <p role="alert" style={{ margin: 0, color: 'var(--admin-status-red)', fontSize: 'var(--admin-size-supporting)' }}>{error}</p>}
      {notice && <p role="status" style={{ margin: 0, color: 'var(--admin-status-green)', fontSize: 'var(--admin-size-supporting)' }}>{notice}</p>}
      {loading ? (
        <p style={{ margin: 0, color: 'var(--admin-text-secondary)', fontSize: 'var(--admin-size-supporting)' }}>Loading businesses and assignments…</p>
      ) : visibleStores.length === 0 ? (
        <div style={surface}><p style={{ margin: 0, color: 'var(--admin-text-secondary)', fontSize: 'var(--admin-size-supporting)' }}>No businesses match this filter.</p></div>
      ) : (
        <div className="flex flex-col" style={{ gap: 'var(--admin-space-md)' }}>
          {visibleStores.map((store) => (
            <article key={store.store_id} style={surface}>
              <div className="flex flex-col" style={{ gap: 'var(--admin-space-xs)', marginBottom: 'var(--admin-space-md)' }}>
                <div className="flex items-center justify-between" style={{ gap: 'var(--admin-space-sm)' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--admin-size-heading-3)', fontWeight: 'var(--admin-weight-semibold)', color: 'var(--admin-text-primary)' }}>{store.store_name}</h3>
                  <span style={{ fontSize: '12px', color: store.is_active ? 'var(--admin-status-green)' : 'var(--admin-text-tertiary)' }}>{store.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <span style={{ color: 'var(--admin-text-secondary)', fontSize: '12px' }}>{store.store_slug}</span>
              </div>
              <div className="flex flex-wrap" style={{ gap: '8px' }}>
                {categories.map((category) => {
                  const assigned = store.categories.some((item) => item.id === category.id);
                  const key = `${store.store_id}:${category.id}`;
                  const isBusy = busyKey === key;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      disabled={Boolean(busyKey)}
                      onClick={() => void toggle(store, category)}
                      aria-pressed={assigned}
                      style={{
                        border: assigned ? '1px solid var(--admin-text-primary)' : '1px solid var(--admin-border-strong)',
                        borderRadius: '999px',
                        padding: '7px 11px',
                        background: assigned ? 'var(--admin-text-primary)' : 'var(--admin-surface)',
                        color: assigned ? 'var(--admin-surface)' : 'var(--admin-text-primary)',
                        fontSize: '12px',
                        cursor: busyKey ? 'wait' : 'pointer',
                        opacity: isBusy ? 0.65 : 1,
                      }}
                    >
                      {isBusy ? 'Saving…' : category.name}
                    </button>
                  );
                })}
              </div>
              {store.categories.length === 0 && <p style={{ margin: 'var(--admin-space-sm) 0 0', fontSize: '12px', color: 'var(--admin-text-tertiary)' }}>No marketplace categories assigned yet.</p>}
            </article>
          ))}
        </div>
      )}
      {!loading && <button type="button" onClick={() => void load()} disabled={Boolean(busyKey)} style={{ alignSelf: 'flex-start', border: '1px solid var(--admin-border-strong)', borderRadius: '999px', padding: '8px 13px', background: 'var(--admin-surface)', color: 'var(--admin-text-primary)', fontSize: 'var(--admin-size-supporting)' }}>Refresh businesses</button>}
    </section>
  );
}
