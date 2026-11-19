import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { STOREFRONTS } from '../configuration/storefronts';
import type { StorefrontCategory, StorefrontKey } from '../types/storefront';

export type { StorefrontCategory } from '../types/storefront';

const STORAGE_KEY = 'simatu:last-storefront';

export default function useStorefront() {
  const { pathname } = useLocation();

  const isYotaabo =
    pathname === '/yotaabo' || pathname.startsWith('/yotaabo/');

  const isPoshies =
    pathname === '/poshies' || pathname.startsWith('/poshies/');

  const activeStorefront: StorefrontKey | null = isYotaabo
    ? 'yotaabo'
    : isPoshies
      ? 'poshies'
      : null;

  useEffect(() => {
    if (activeStorefront) {
      window.sessionStorage.setItem(STORAGE_KEY, activeStorefront);
    }
  }, [activeStorefront]);

  const rememberedStorefront = window.sessionStorage.getItem(STORAGE_KEY);

  const hasStorefrontContext =
    activeStorefront !== null ||
    rememberedStorefront === 'yotaabo' ||
    rememberedStorefront === 'poshies';

  const storeKey: StorefrontKey =
    activeStorefront ??
    (rememberedStorefront === 'poshies' ? 'poshies' : 'yotaabo');

  const store = STOREFRONTS[storeKey];

  const pathFor = (path = '') => {
    const cleanPath = path.replace(/^\/+/, '');
    return cleanPath ? `${store.basePath}/${cleanPath}` : store.basePath;
  };

  return { ...store, storeKey, pathFor, hasStorefrontContext };
}
