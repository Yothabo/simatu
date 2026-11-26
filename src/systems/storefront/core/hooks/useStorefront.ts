import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { STOREFRONTS, isStorefrontKey } from '../configuration/storefronts';

export type { StorefrontCategory } from '../types/storefront';

const STORAGE_KEY = 'simatu:last-storefront';

export default function useStorefront() {
  const { pathname } = useLocation();
  const activeStorefront = Object.entries(STOREFRONTS).find(([, store]) =>
    pathname === store.basePath || pathname.startsWith(`${store.basePath}/`)
  )?.[0] ?? null;

  useEffect(() => {
    if (activeStorefront) window.sessionStorage.setItem(STORAGE_KEY, activeStorefront);
  }, [activeStorefront]);

  const remembered = window.sessionStorage.getItem(STORAGE_KEY);
  const storeKey = activeStorefront ?? (remembered && isStorefrontKey(remembered) ? remembered : 'yotaabo');
  const store = STOREFRONTS[storeKey];

  const pathFor = (path = '') => {
    const cleanPath = path.replace(/^\/+/, '');
    return cleanPath ? `${store.basePath}/${cleanPath}` : store.basePath;
  };

  return { ...store, storeKey, pathFor, hasStorefrontContext: activeStorefront !== null || Boolean(remembered && isStorefrontKey(remembered)) };
}
