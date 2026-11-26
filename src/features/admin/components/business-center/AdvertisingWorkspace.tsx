import { useState } from 'react';
import { evaluateAdvertisingPlacement, remainingAdvertisingBudget } from '../../business-center/advertising-rules';
import type { AdvertisingPlacement } from '../../business-center/advertising-rules';
import { resolveEntitlements } from '../../business-center/entitlements';
import { canUseBusinessCenterModule } from '../../business-center/lifecycle';
import type { SubscriptionTierId } from '../../business-center/types';

export default function AdvertisingWorkspace({ tier }: { tier: SubscriptionTierId }) {
  const entitlements=resolveEntitlements(tier);
  const [budget, setBudget] = useState('250');
  const [spent, setSpent] = useState('0');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [state, setState] = useState<'draft'|'pending_review'|'approved'|'active'|'paused'|'completed'>('draft');
  const [result, setResult] = useState<{eligible:boolean; reasons:string[]; remaining:number}|null>(null);
  const check = () => {
    const placement: AdvertisingPlacement = {storeId:'preview-store',status:state,startsAt:start,endsAt:end,budgetMinor:Math.round(Number(budget)*100),spentMinor:Math.round(Number(spent)*100),sponsoredLabelRequired:true};
    const evaluation=evaluateAdvertisingPlacement(placement);
    if (!canUseBusinessCenterModule(entitlements,'advertising')) {
      setResult({eligible:false,reasons:['Advertising is not included in this plan. Preview Pro in Subscriptions to inspect this feature.'],remaining:remainingAdvertisingBudget(placement)});
      return;
    }
    setResult({...evaluation,remaining:remainingAdvertisingBudget(placement)});
  };
  const cls='mt-1 w-full rounded-xl border px-3 py-2 text-sm';
  return <div className="mt-5 rounded-xl border p-4 space-y-4" style={{borderColor:'var(--admin-border-subtle)'}}>
    <p className="text-xs uppercase tracking-wide opacity-60">Sponsored placement eligibility · local preview</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">Budget (R)<input type="number" min="0" className={cls} value={budget} onChange={e=>setBudget(e.target.value)}/></label>
      <label className="text-sm font-medium">Spend to date (R)<input type="number" min="0" className={cls} value={spent} onChange={e=>setSpent(e.target.value)}/></label>
      <label className="text-sm font-medium">Placement status<select className={cls} value={state} onChange={e=>setState(e.target.value as typeof state)}><option value="draft">Draft</option><option value="pending_review">Pending review</option><option value="approved">Approved</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select></label>
      <label className="text-sm font-medium">Starts<input type="datetime-local" className={cls} value={start} onChange={e=>setStart(e.target.value)}/></label>
      <label className="text-sm font-medium">Ends<input type="datetime-local" className={cls} value={end} onChange={e=>setEnd(e.target.value)}/></label>
    </div>
    <p className="text-sm opacity-70">Sponsored disclosure is mandatory. Paid placements must never replace organic discovery.</p>
    <button type="button" onClick={check} className="rounded-xl border px-4 py-2 text-sm font-semibold">Evaluate placement</button>
    {result&&<div role="status" className="rounded-xl border p-3 text-sm"><strong>{result.eligible?'Eligible now':'Not eligible'}</strong><p className="mt-1">Budget remaining: R{(result.remaining/100).toFixed(2)}</p>{result.reasons.length>0&&<ul className="mt-2 list-disc pl-5">{result.reasons.map(r=><li key={r}>{r}</li>)}</ul>}</div>}
  </div>;
}
