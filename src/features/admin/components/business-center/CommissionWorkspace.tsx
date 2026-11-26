import { useState } from 'react';
import { calculateCommission } from '../../business-center/commission-calculator';

export default function CommissionWorkspace() {
  const [rate, setRate] = useState('500');
  const [amount, setAmount] = useState('1000');
  const [enabled, setEnabled] = useState(true);
  const [result, setResult] = useState<{commission:number; net:number}|null>(null);
  const calculate=()=>{
    const base={amountMinor:Math.round(Number(amount)*100),currency:'ZAR' as const};
    const value=calculateCommission(base,{rateBps:Number(rate),enabled});
    setResult({commission:value.commission.amountMinor,net:base.amountMinor-value.commission.amountMinor});
  };
  const cls='mt-1 w-full rounded-xl border px-3 py-2 text-sm';
  return <div className="mt-5 rounded-xl border p-4 space-y-4" style={{borderColor:'var(--admin-border-subtle)'}}>
    <p className="text-xs uppercase tracking-wide opacity-60">Commission calculator · preview only</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">Commission rate (%)<input type="number" min="0" max="100" step="0.01" className={cls} value={(Number(rate)/100).toString()} onChange={e=>setRate(String(Number(e.target.value)*100))}/></label>
      <label className="text-sm font-medium">Order subtotal (R)<input type="number" min="0" step="0.01" className={cls} value={amount} onChange={e=>setAmount(e.target.value)}/></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Commission enabled</label>
    </div>
    <button type="button" onClick={calculate} className="rounded-xl border px-4 py-2 text-sm font-semibold">Calculate</button>
    {result&&<div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border p-3"><p className="text-xs opacity-60">Commission</p><strong>R{(result.commission/100).toFixed(2)}</strong></div><div className="rounded-xl border p-3"><p className="text-xs opacity-60">After commission</p><strong>R{(result.net/100).toFixed(2)}</strong></div></div>}
    <p className="text-sm opacity-70">This is a calculator preview. Store/order attribution and ledger persistence are not connected yet.</p>
  </div>;
}
