import { useState } from 'react';
import { validateCampaign } from '../../business-center/campaign-rules';
import { resolveEntitlements } from '../../business-center/entitlements';
import { canUseBusinessCenterModule, countLimitEligibleCampaigns, transitionCampaign } from '../../business-center/lifecycle';
import type { SubscriptionTierId, CampaignStatus } from '../../business-center/types';

export default function CampaignWorkspace({ tier }: { tier: SubscriptionTierId }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<'reach' | 'clicks' | 'sales' | 'conversions'>('sales');
  const [budget, setBudget] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'active'>('draft');
  const [items, setItems] = useState<{id:string; name:string; goal:string; budget:string; start:string; end:string; status:CampaignStatus}[]>([]);
  const entitlements=resolveEntitlements(tier);
  const [errors, setErrors] = useState<string[]>([]);
  const create = () => {
    const validation = validateCampaign({status, startsAt:start, endsAt:end, goal, participatingStoreIds:[], budgetMinor:budget===''?undefined:Math.round(Number(budget)*100)});
    const all = [...validation.errors];
    if (!name.trim()) all.unshift('Campaign name is required.');
    if (!canUseBusinessCenterModule(entitlements,'campaigns')) all.unshift('Campaigns are not included in this plan. Preview an eligible tier in Subscriptions.');
    if (countLimitEligibleCampaigns([...items.map(item=>item.status),status])>=entitlements.limits.activeCampaigns) all.unshift('Your plan has reached its active/scheduled campaign limit.');
    if (budget!=='' && (!Number.isFinite(Number(budget)) || Number(budget)<0)) all.push('Budget must be zero or more.');
    setErrors(all);
    if (all.length) return;
    setItems((current)=>[...current,{id:`campaign-${Date.now()}`,name:name.trim(),goal,budget,start,end,status}]);
    setName('');setErrors([]);
  };
  const updateStatus=(id:string,next:CampaignStatus)=>setItems(current=>current.map(item=>{if(item.id!==id)return item;const transition=transitionCampaign(item.status,next);return transition.valid?{...item,status:transition.next}:item;}));
  const cls='mt-1 w-full rounded-xl border px-3 py-2 text-sm';
  return <div className="mt-5 space-y-4">
    <div className="rounded-xl border p-4" style={{borderColor:'var(--admin-border-subtle)'}}>
      <p className="text-xs uppercase tracking-wide opacity-60">Campaign setup · session preview</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Campaign name<input className={cls} value={name} onChange={e=>setName(e.target.value)} placeholder="Campaign name"/></label>
        <label className="text-sm font-medium">Goal<select className={cls} value={goal} onChange={e=>setGoal(e.target.value as typeof goal)}><option value="reach">Reach</option><option value="clicks">Clicks</option><option value="sales">Sales</option><option value="conversions">Conversions</option></select></label>
        <label className="text-sm font-medium">Budget (R, optional)<input type="number" min="0" step="0.01" className={cls} value={budget} onChange={e=>setBudget(e.target.value)} /></label>
        <label className="text-sm font-medium">Status<select className={cls} value={status} onChange={e=>setStatus(e.target.value as typeof status)}><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="active">Active</option></select></label>
        <label className="text-sm font-medium">Starts<input type="datetime-local" className={cls} value={start} onChange={e=>setStart(e.target.value)} /></label>
        <label className="text-sm font-medium">Ends<input type="datetime-local" className={cls} value={end} onChange={e=>setEnd(e.target.value)} /></label>
      </div>
      {errors.length>0&&<div role="alert" className="mt-3 text-sm"><ul className="list-disc pl-5">{errors.map(e=><li key={e}>{e}</li>)}</ul></div>}
      <button type="button" onClick={create} className="mt-4 rounded-xl border px-4 py-2 text-sm font-semibold">Validate campaign</button>
    </div>
    <div className="rounded-xl border p-4" style={{borderColor:'var(--admin-border-subtle)'}}>
      <h3 className="font-medium">Campaign drafts</h3>{items.length===0?<p className="mt-2 text-sm opacity-60">No campaign drafts in this session.</p>:<ul className="mt-3 space-y-2">{items.map((item,i)=><li key={i} className="rounded-lg border p-3"><strong>{item.name}</strong><span className="ml-2 text-xs capitalize">{item.status}</span><div className="mt-2 flex flex-wrap gap-2">{item.status==='draft'&&<button type="button" className="rounded border px-2 py-1 text-xs" onClick={()=>updateStatus(item.id,'scheduled')}>Schedule</button>}{item.status==='scheduled'&&<button type="button" className="rounded border px-2 py-1 text-xs" onClick={()=>updateStatus(item.id,'active')}>Activate</button>}{item.status==='active'&&<button type="button" className="rounded border px-2 py-1 text-xs" onClick={()=>updateStatus(item.id,'paused')}>Pause</button>}{item.status==='paused'&&<button type="button" className="rounded border px-2 py-1 text-xs" onClick={()=>updateStatus(item.id,'active')}>Resume</button>}</div><p className="text-sm opacity-70">{item.goal} · {item.budget? 'R'+item.budget:'No budget set'}</p><p className="text-xs opacity-60">{item.start} → {item.end}</p></li>)}</ul>}
    </div>
  </div>;
}
