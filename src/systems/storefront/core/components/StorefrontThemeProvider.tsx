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
  const { storeKey, designSystem } = useStorefront();

  useEffect(() => {
    const root = document.documentElement;
    const previousStorefront = root.getAttribute('data-storefront');
    const previousOverrides = Object.entries(designSystem.overrides).map(([property]) => ({
      property,
      value: root.style.getPropertyValue(property),
      priority: root.style.getPropertyPriority(property),
    }));

    root.setAttribute('data-storefront', storeKey);
    Object.entries(designSystem.overrides).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    return () => {
      previousOverrides.forEach(({ property, value, priority }) => {
        if (value) root.style.setProperty(property, value, priority);
        else root.style.removeProperty(property);
      });
      if (previousStorefront === null) {
        root.removeAttribute('data-storefront');
      } else {
        root.setAttribute('data-storefront', previousStorefront);
      }
    };
  }, [storeKey, designSystem.overrides]);

  return <>{children}</>;
}
