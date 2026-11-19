import { useMemo } from 'react';
import type { Order, AdminRow } from '../types/admin.types';
import type { RevenueSeries } from '../components/RevenueChart';
import { getCategoryTheme } from '../../../systems/storefront/core/configuration/categoryTheme';

type Args = {
  orders: Order[];
  products: AdminRow[];
  activeFilter: string;
};

export function useRevenueSeries({ orders, products, activeFilter }: Args): RevenueSeries[] {
  return useMemo(() => {
    const currentMonthIndex = new Date().getMonth();
    const elapsedMonths = currentMonthIndex + 1;

    // Build a name → category lookup per storefront
    const categoryByName = new Map<string, string>();
    for (const p of products) {
      const storefront = (p as { storefront?: string }).storefront;
      const key = `${storefront ?? ''}::${p.name}`;
      if (p.category) categoryByName.set(key, p.category);
    }

    const resolveCategory = (storefront: string, itemName: string): string | null =>
      categoryByName.get(`${storefront}::${itemName}`) ?? null;

    const computeMonthlyCounts = (
      storefrontPredicate: (storefront: string) => boolean,
      categoryPredicate: (category: string | null) => boolean,
    ): (number | null)[] => {
      const counts: (number | null)[] = [];
      for (let m = 0; m < 12; m++) {
        if (m > currentMonthIndex) {
          counts.push(null);
          continue;
        }
        let total = 0;
        for (const o of orders) {
          if (o.status === 'cancelled') continue;
          if (!storefrontPredicate(o.storefront)) continue;
          if (new Date(o.created_at).getMonth() !== m) continue;
          for (const item of o.items) {
            const cat = resolveCategory(o.storefront, item.name);
            if (categoryPredicate(cat)) total += 1;
          }
        }
        counts.push(total);
      }
      return counts;
    };

    const averageOf = (data: (number | null)[]): (number | null)[] => {
      const nums = data.slice(0, elapsedMonths).filter((v): v is number => v !== null);
      if (nums.length === 0) return data.map(() => null);
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      const rounded = Math.round(avg * 10) / 10;
      return data.map((_, idx) => (idx <= currentMonthIndex ? rounded : null));
    };

    const his = getCategoryTheme('His');
    const hers = getCategoryTheme('Hers');
    const spaces = getCategoryTheme('Spaces');
    const lounge = getCategoryTheme('Lounge');

    if (activeFilter === 'yotaabo') {
      const isYotaabo = (s: string) => s === 'yotaabo';
      const hisData = computeMonthlyCounts(isYotaabo, (c) => c === 'His');
      const hersData = computeMonthlyCounts(isYotaabo, (c) => c === 'Hers');
      const spacesData = computeMonthlyCounts(isYotaabo, (c) => c === 'Spaces');
      const combined = hisData.map((v, i) => {
        const a = v ?? 0;
        const b = hersData[i] ?? 0;
        const c = spacesData[i] ?? 0;
        return v === null && hersData[i] === null && spacesData[i] === null ? null : a + b + c;
      });
      return [
        { key: 'his', label: 'His', color: his.hexColor, data: hisData },
        { key: 'hers', label: 'Hers', color: hers.hexColor, data: hersData },
        { key: 'spaces', label: 'Spaces', color: spaces.hexColor, data: spacesData },
        { key: 'avg', label: 'Average', color: 'var(--admin-accent)', data: averageOf(combined), dashed: true },
      ];
    }

    if (activeFilter === 'poshies') {
      const isPoshies = (s: string) => s === 'poshies';
      const hisData = computeMonthlyCounts(isPoshies, (c) => c === 'His');
      const hersData = computeMonthlyCounts(isPoshies, (c) => c === 'Hers');
      const loungeData = computeMonthlyCounts(isPoshies, (c) => c === 'Lounge');
      const combined = hisData.map((v, i) => {
        const a = v ?? 0;
        const b = hersData[i] ?? 0;
        const c = loungeData[i] ?? 0;
        return v === null && hersData[i] === null && loungeData[i] === null ? null : a + b + c;
      });
      return [
        { key: 'his', label: 'His', color: his.hexColor, data: hisData },
        { key: 'hers', label: 'Hers', color: hers.hexColor, data: hersData },
        { key: 'lounge', label: 'Lounge', color: lounge.hexColor, data: loungeData },
        { key: 'avg', label: 'Average', color: 'var(--admin-accent)', data: averageOf(combined), dashed: true },
      ];
    }

    const yotaaboData = computeMonthlyCounts((s) => s === 'yotaabo', () => true);
    const poshiesData = computeMonthlyCounts((s) => s === 'poshies', () => true);
    const combined = yotaaboData.map((v, i) => {
      const a = v ?? 0;
      const b = poshiesData[i] ?? 0;
      return v === null && poshiesData[i] === null ? null : a + b;
    });
    return [
      { key: 'yotaabo', label: 'Yotaabo', color: his.hexColor, data: yotaaboData },
      { key: 'poshies', label: 'Poshies', color: hers.hexColor, data: poshiesData },
      { key: 'avg', label: 'Average', color: 'var(--admin-accent)', data: averageOf(combined), dashed: true },
    ];
  }, [orders, products, activeFilter]);
}
