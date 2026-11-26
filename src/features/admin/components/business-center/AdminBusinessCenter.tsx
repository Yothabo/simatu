import { useMemo, useState } from 'react';
import { BUSINESS_CENTER_MODULES } from '../../business-center/catalog';
import { resolveEntitlements } from '../../business-center/entitlements';
import { validatePromotionRule } from '../../business-center/promotion-rules';
import type { BusinessCenterModuleId, SubscriptionTierId, PromotionStatus } from '../../business-center/types';
import type { PromotionDiscount } from '../../business-center/promotion-rules';
import { canUseBusinessCenterModule, countLimitEligiblePromotions, transitionPromotion } from '../../business-center/lifecycle';
import CampaignWorkspace from './CampaignWorkspace';
import AdvertisingWorkspace from './AdvertisingWorkspace';
import CommissionWorkspace from './CommissionWorkspace';
import IntelligenceWorkspace from './IntelligenceWorkspace';

const ICONS: Record<BusinessCenterModuleId, string> = {
  subscriptions: '◇',
  promotions: '％',
  campaigns: '↗',
  advertising: '◉',
  commission: 'R',
  intelligence: '⌁',
};

const TIERS: { id: SubscriptionTierId; name: string; description: string }[] = [
  { id: 'free', name: 'Free', description: 'Core store tools' },
  { id: 'starter', name: 'Starter', description: 'Promotion tools for growing stores' },
  { id: 'growth', name: 'Growth', description: 'Promotions and campaigns' },
  { id: 'pro', name: 'Pro', description: 'Full Business Center access' },
];

type PromotionPreview = {
  id: string;
  name: string;
  discount: PromotionDiscount;
  startsAt: string;
  endsAt: string;
  status: PromotionStatus;
};

const formatZar = (minor: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(minor / 100);

const fieldClass = 'mt-1 w-full rounded-xl border px-3 py-2 text-sm';
const fieldStyle = { borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' };

export default function AdminBusinessCenter() {
  const [selected, setSelected] = useState<BusinessCenterModuleId | null>(null);
  const [tier, setTier] = useState<SubscriptionTierId>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'trial' | 'active' | 'past_due' | 'cancelled'>('active');
  const [promotionName, setPromotionName] = useState('');
  const [discountKind, setDiscountKind] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minimumSubtotal, setMinimumSubtotal] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [promotionStatus, setPromotionStatus] = useState<'draft' | 'scheduled' | 'active'>('draft');
  const [promotions, setPromotions] = useState<PromotionPreview[]>([]);
  const [promotionErrors, setPromotionErrors] = useState<string[]>([]);
  const entitlements = useMemo(() => resolveEntitlements(tier), [tier]);
  const activeModule = selected ? BUSINESS_CENTER_MODULES.find((item) => item.id === selected) : undefined;

  const addPromotion = () => {
    const discount: PromotionDiscount = discountKind === 'percentage'
      ? { kind: 'percentage', value: Number(discountValue) }
      : { kind: 'fixed', valueMinor: Math.round(Number(discountValue) * 100) };
    const validation = validatePromotionRule({
      status: promotionStatus,
      startsAt,
      endsAt,
      discount,
      minimumSubtotalMinor: minimumSubtotal === '' ? undefined : Math.round(Number(minimumSubtotal) * 100),
    });
    const errors = [...validation.errors];
    if (!promotionName.trim()) errors.unshift('Promotion name is required.');
    if (tier === 'free') errors.unshift('Promotions are not included in the Free plan. Preview a paid plan in Subscriptions.');
    if (countLimitEligiblePromotions([...promotions.map((p) => p.status), promotionStatus]) >= entitlements.limits.activePromotions) {
      errors.unshift('Your plan has reached its active promotion limit.');
    }
    setPromotionErrors(errors);
    if (errors.length) return;

    setPromotions((current) => [...current, {
      id: `promotion-${Date.now()}`,
      name: promotionName.trim(),
      discount,
      startsAt,
      endsAt,
      status: promotionStatus,
    }]);
    setPromotionName('');
    setPromotionErrors([]);
  };

  const changePromotionStatus = (id: string, next: PromotionPreview['status']) => {
    setPromotions((current) => current.map((promotion) => {
      if (promotion.id !== id) return promotion;
      const result = transitionPromotion(promotion.status, next);
      if (!result.valid) { setPromotionErrors([result.error ?? 'Invalid promotion lifecycle transition.']); return promotion; }
      return { ...promotion, status: result.next };
    }));
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5" aria-label="Business Center">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-60">Business tools</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Business Center</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-70">Grow your store with marketing, monetization, and performance tools. Organic discovery remains available—paid visibility is separate and clearly labeled.</p>
      </header>

      {activeModule ? (
        <div className="mb-5 rounded-2xl border p-5" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
          <button type="button" onClick={() => setSelected(null)} className="mb-4 text-sm underline underline-offset-4">← All business tools</button>
          <div className="text-3xl" aria-hidden="true">{ICONS[activeModule.id]}</div>
          <h2 className="mt-2 text-xl font-semibold">{activeModule.title}</h2>
          <p className="mt-2 text-sm opacity-70">{activeModule.description}</p>

          {selected === 'subscriptions' ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--admin-border-subtle)' }}>
                <p className="text-xs uppercase tracking-wide opacity-60">Local plan preview · no billing connection</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium">Plan
                    <select className={fieldClass} style={fieldStyle} value={tier} onChange={(e) => setTier(e.target.value as SubscriptionTierId)}>
                      {TIERS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium">Subscription status
                    <select className={fieldClass} style={fieldStyle} value={subscriptionStatus} onChange={(e) => setSubscriptionStatus(e.target.value as typeof subscriptionStatus)}>
                      <option value="trial">Trial</option><option value="active">Active</option><option value="past_due">Past due</option><option value="cancelled">Cancelled</option>
                    </select>
                  </label>
                </div>
                <p className="mt-2 text-sm opacity-70">{TIERS.find((item) => item.id === tier)?.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border px-2 py-1 capitalize">{tier} plan</span>
                  <span className="rounded-full border px-2 py-1">{subscriptionStatus.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {Object.entries(entitlements.limits).map(([name, limit]) => (
                  <div key={name} className="rounded-xl border p-3" style={{ borderColor: 'var(--admin-border-subtle)' }}>
                    <p className="text-xs opacity-60">{name.replace(/([A-Z])/g, ' $1')}</p><p className="mt-1 text-xl font-semibold">{limit}</p><p className="text-xs opacity-60">plan limit</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--admin-border-subtle)' }}>
                <p className="font-medium">Included tools</p>
                <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                  {entitlements.modules.map((id) => <li key={id}>✓ {BUSINESS_CENTER_MODULES.find((m) => m.id === id)?.title}</li>)}
                </ul>
              </div>
            </div>
          ) : selected === 'promotions' ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--admin-border-subtle)' }}>
                <p className="text-xs uppercase tracking-wide opacity-60">Promotion builder · local preview only</p>
                <p className="mt-1 text-sm opacity-70">Configure and validate a discount before connecting products or saving to the store.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium">Promotion name<input className={fieldClass} style={fieldStyle} value={promotionName} onChange={(e) => setPromotionName(e.target.value)} placeholder="e.g. Weekend special" /></label>
                  <label className="text-sm font-medium">Discount type<select className={fieldClass} style={fieldStyle} value={discountKind} onChange={(e) => setDiscountKind(e.target.value as typeof discountKind)}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed amount (R)</option></select></label>
                  <label className="text-sm font-medium">Discount value<input type="number" min="0" step={discountKind === 'percentage' ? '1' : '0.01'} className={fieldClass} style={fieldStyle} value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} /></label>
                  <label className="text-sm font-medium">Minimum order (R, optional)<input type="number" min="0" step="0.01" className={fieldClass} style={fieldStyle} value={minimumSubtotal} onChange={(e) => setMinimumSubtotal(e.target.value)} placeholder="0.00" /></label>
                  <label className="text-sm font-medium">Start date<input type="datetime-local" className={fieldClass} style={fieldStyle} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></label>
                  <label className="text-sm font-medium">End date<input type="datetime-local" className={fieldClass} style={fieldStyle} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></label>
                  <label className="text-sm font-medium">Initial status<select className={fieldClass} style={fieldStyle} value={promotionStatus} onChange={(e) => setPromotionStatus(e.target.value as typeof promotionStatus)}><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="active">Active</option></select></label>
                </div>
                {promotionErrors.length > 0 && <div role="alert" className="mt-3 rounded-xl border p-3 text-sm"><p className="font-semibold">Please fix these items:</p><ul className="mt-1 list-disc pl-5">{promotionErrors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
                <button type="button" onClick={addPromotion} className="mt-4 rounded-xl border px-4 py-2 text-sm font-semibold hover:opacity-80" style={{ borderColor: 'var(--admin-border-subtle)' }}>Validate & add preview</button>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--admin-border-subtle)' }}>
                <div className="flex items-center justify-between gap-3"><p className="font-medium">Promotion previews</p><span className="text-xs opacity-60">{promotions.length} created</span></div>
                {promotions.length === 0 ? <p className="mt-3 text-sm opacity-60">No promotions configured in this session.</p> : <ul className="mt-3 space-y-2">{promotions.map((promo) => <li key={promo.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--admin-border-subtle)' }}><div className="flex flex-wrap items-center justify-between gap-2"><strong>{promo.name}</strong><span className="rounded-full border px-2 py-1 text-xs capitalize">{promo.status}</span></div><div className="mt-2 flex flex-wrap gap-2">{promo.status==='active'&&<button type="button" className="rounded-lg border px-2 py-1 text-xs" onClick={()=>changePromotionStatus(promo.id,'paused')}>Pause</button>}{promo.status==='paused'&&<button type="button" className="rounded-lg border px-2 py-1 text-xs" onClick={()=>changePromotionStatus(promo.id,'active')}>Resume</button>}{promo.status==='draft'&&<button type="button" className="rounded-lg border px-2 py-1 text-xs" onClick={()=>changePromotionStatus(promo.id,'scheduled')}>Schedule</button>}{promo.status==='scheduled'&&<button type="button" className="rounded-lg border px-2 py-1 text-xs" onClick={()=>changePromotionStatus(promo.id,'active')}>Activate</button>}</div><p className="mt-1 text-sm opacity-70">{promo.discount.kind === 'percentage' ? `${promo.discount.value}% off` : `${formatZar(promo.discount.valueMinor)} off`}</p><p className="text-xs opacity-60">{new Date(promo.startsAt).toLocaleString()} – {new Date(promo.endsAt).toLocaleString()}</p></li>)}</ul>}
              </div>
            </div>
          ) : selected === 'campaigns' ? (
            <CampaignWorkspace tier={tier} />
          ) : selected === 'advertising' ? (
            <AdvertisingWorkspace tier={tier} />
          ) : selected === 'commission' ? (
            <CommissionWorkspace />
          ) : selected === 'intelligence' ? (
            <IntelligenceWorkspace />
          ) : (
            <div className="mt-5 rounded-xl border border-dashed p-4" style={{ borderColor: 'var(--admin-border-subtle)' }}>
              <p className="font-medium">Workspace roadmap</p>
              <p className="mt-1 text-sm opacity-70">Workspace controls are being prepared for this module.</p>
            </div>
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BUSINESS_CENTER_MODULES.map((module) => (
          <button key={module.id} type="button" onClick={() => setSelected(module.id)} className="group flex min-h-44 flex-col rounded-2xl border p-4 text-left transition-colors hover:border-current" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border text-xl" style={{ borderColor: 'var(--admin-border-subtle)' }} aria-hidden="true">{ICONS[module.id]}</span>
            <span className="mt-4 font-semibold">{module.title}</span>
            <span className="mt-1 text-sm opacity-70">{module.description}</span>
            <span className="mt-auto pt-4 text-sm font-medium">{module.primaryAction} <span aria-hidden="true">→</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
