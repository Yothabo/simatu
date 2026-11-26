import { useState } from 'react';

const KPI_CARDS = [
  {label:'Gross sales',value:'—',detail:'Waiting for order data'},
  {label:'Conversion rate',value:'—',detail:'Waiting for visit and order events'},
  {label:'Promotion lift',value:'—',detail:'Requires promotion attribution'},
  {label:'Campaign return',value:'—',detail:'Requires campaign spend and sales'},
];

export default function IntelligenceWorkspace() {
  const [focus,setFocus]=useState<'sales'|'marketing'|'catalogue'>('sales');
  return <div className="mt-5 space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{KPI_CARDS.map(card=><div key={card.label} className="rounded-xl border p-4" style={{borderColor:'var(--admin-border-subtle)'}}><p className="text-sm opacity-70">{card.label}</p><p className="mt-2 text-2xl font-semibold">{card.value}</p><p className="mt-1 text-xs opacity-60">{card.detail}</p></div>)}</div>
    <div className="rounded-xl border p-4" style={{borderColor:'var(--admin-border-subtle)'}}>
      <label className="text-sm font-medium">Insight area<select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" value={focus} onChange={e=>setFocus(e.target.value as typeof focus)}><option value="sales">Sales</option><option value="marketing">Marketing</option><option value="catalogue">Catalogue health</option></select></label>
      <div className="mt-3 rounded-lg border border-dashed p-4"><p className="font-medium">{focus==='sales'?'Sales analysis':focus==='marketing'?'Marketing performance':'Catalogue health'}</p><p className="mt-1 text-sm opacity-70">Insights will appear once real store data is connected. No sample metrics are fabricated.</p><ul className="mt-3 list-disc pl-5 text-sm opacity-70">{(focus==='sales'?['Sales trends','Order value','Conversion']:focus==='marketing'?['Campaign performance','Promotion redemption','Paid placement attribution']:['Product completeness','Category distribution','Inventory signals']).map(item=><li key={item}>{item}</li>)}</ul></div>
    </div>
  </div>;
}
