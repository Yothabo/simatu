import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { STOREFRONTS } from '../systems/storefront/core';
import type { StorefrontKey } from '../systems/storefront/core';

export type { StorefrontCategory } from '../systems/storefront/core';

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
    const cleanPath = path.replace(/^\\/+/, '');
    return cleanPath ? `${store.basePath}/${cleanPath}` : store.basePath;
  };

  return { ...store, pathFor, hasStorefrontContext };
}
