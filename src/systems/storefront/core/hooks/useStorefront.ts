import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { STOREFRONTS, isStorefrontKey } from '../configuration/storefronts';

export type { StorefrontCategory } from '../types/storefront';
const STORAGE_KEY = 'simatu:last-storefront';

export default function useStorefront() {
  const { pathname } = useLocation();
  const activeStorefront = (Object.keys(STOREFRONTS) as Array<keyof typeof STOREFRONTS>).find((key) => {
    const store = STOREFRONTS[key];
    return pathname === store.basePath || pathname.startsWith(`${store.basePath}/`);
  }) ?? null;

  useEffect(() => {
    if (activeStorefront) window.sessionStorage.setItem(STORAGE_KEY, activeStorefront);
  }, [activeStorefront]);

  const remembered = window.sessionStorage.getItem(STORAGE_KEY);
  const defaultStorefront = Object.keys(STOREFRONTS)[0];
  if (!defaultStorefront) throw new Error('At least one storefront must be configured.');
  const storeKey = activeStorefront ?? (remembered && isStorefrontKey(remembered) ? remembered : defaultStorefront);
  const store = STOREFRONTS[storeKey];

  const pathFor = (path = '') => {
    const cleanPath = path.replace(/^\/+/, '');
    return cleanPath ? `${store.basePath}/${cleanPath}` : store.basePath;
  };

  return {
    ...store,
    storeKey,
    pathFor,
    hasStorefrontContext: activeStorefront !== null || Boolean(remembered && isStorefrontKey(remembered)),
  };
}
