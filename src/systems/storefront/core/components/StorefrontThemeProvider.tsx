import { useEffect, type ReactNode } from 'react';
import useStorefront from '../hooks/useStorefront';

type StorefrontThemeProviderProps = {
  children: ReactNode;
};

/**
 * Selects the active storefront theme at the document boundary.
 * Brand values are supplied by each store's scoped stylesheet, not inline
 * runtime overrides, so shared components have one predictable token source.
 */
export default function StorefrontThemeProvider({
  children,
}: StorefrontThemeProviderProps) {
  const { storeKey } = useStorefront();

  useEffect(() => {
    const root = document.documentElement;
    const previousStorefront = root.getAttribute('data-storefront');

    root.setAttribute('data-storefront', storeKey);

    return () => {
      if (previousStorefront === null) {
        root.removeAttribute('data-storefront');
      } else {
        root.setAttribute('data-storefront', previousStorefront);
      }
    };
  }, [storeKey]);

  return <>{children}</>;
}
