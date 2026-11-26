import { useState } from 'react';
import { BUSINESS_CENTER_MODULES } from '../../business-center/catalog';
import type { BusinessCenterModuleId } from '../../business-center/types';

const ICONS: Record<BusinessCenterModuleId, string> = {
  subscriptions: '◇',
  promotions: '％',
  campaigns: '↗',
  advertising: '◉',
  commission: 'R',
  intelligence: '⌁',
};

export default function AdminBusinessCenter() {
  const [selected, setSelected] = useState<BusinessCenterModuleId | null>(null);
  const activeModule = selected ? BUSINESS_CENTER_MODULES.find((item) => item.id === selected) : undefined;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5" aria-label="Business Center">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-60">Business tools</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Business Center</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-70">Grow your store with marketing, monetization, and performance tools. These tools are designed to work together.</p>
      </header>

      {activeModule ? (
        <div className="mb-5 rounded-2xl border p-5" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
          <button type="button" onClick={() => setSelected(null)} className="mb-4 text-sm underline underline-offset-4">← All business tools</button>
          <div className="text-3xl" aria-hidden="true">{ICONS[activeModule.id]}</div>
          <h2 className="mt-2 text-xl font-semibold">{activeModule.title}</h2>
          <p className="mt-2 text-sm opacity-70">{activeModule.description}</p>
          <div className="mt-5 rounded-xl border border-dashed p-4" style={{ borderColor: 'var(--admin-border-subtle)' }}>
            <p className="font-medium">Setup workspace</p>
            <p className="mt-1 text-sm opacity-70">This workspace is being connected to store data and operational actions. You can continue building its configuration before products or activity are available.</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BUSINESS_CENTER_MODULES.map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => setSelected(module.id)}
            className="group flex min-h-44 flex-col rounded-2xl border p-4 text-left transition-colors hover:border-current"
            style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' }}
          >
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
