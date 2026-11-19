import { useEffect, type ReactNode } from 'react';
import useStorefront from '../hooks/useStorefront';

type StorefrontThemeProviderProps = {
  children: ReactNode;
};

/**
 * Applies the active store's selected design-system identity at the document
 * boundary. Store-specific tokens are CSS-scoped by data-storefront, while
 * configuration overrides provide runtime token customisation.
 */
export default function StorefrontThemeProvider({
  children,
}: StorefrontThemeProviderProps) {
  const { storeKey, designSystem } = useStorefront();

  useEffect(() => {
    const root = document.documentElement;
    const previousStorefront = root.getAttribute('data-storefront');
    const previousValues = new Map<string, string>();

    root.setAttribute('data-storefront', storeKey);

    Object.entries(designSystem.overrides ?? {}).forEach(([token, value]) => {
      previousValues.set(token, root.style.getPropertyValue(token));
      root.style.setProperty(token, value);
    });

    return () => {
      if (previousStorefront === null) {
        root.removeAttribute('data-storefront');
      } else {
        root.setAttribute('data-storefront', previousStorefront);
      }

      previousValues.forEach((value, token) => {
        if (value) {
          root.style.setProperty(token, value);
        } else {
          root.style.removeProperty(token);
        }
      });
    };
  }, [storeKey, designSystem]);

  return <>{children}</>;
}
