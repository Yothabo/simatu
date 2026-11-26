import { useEffect, type ReactNode } from 'react';
import useStorefront from '../hooks/useStorefront';

const EMPTY_THEME_OVERRIDES: Record<string, string> = {};
const storefrontThemeStylesheets = import.meta.glob(
  '../../stores/*/design-system/index.css',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;

type StorefrontThemeProviderProps = {
  children: ReactNode;
};

/**
 * Selects the active storefront theme at the document boundary.
 * Brand values are supplied by scoped store stylesheets and configuration
 * overrides. Shared components consume the same semantic token contract.
 */
export default function StorefrontThemeProvider({
  children,
}: StorefrontThemeProviderProps) {
  const { storeKey, designSystem } = useStorefront();
  const themeOverrides = designSystem.overrides ?? EMPTY_THEME_OVERRIDES;
  const themeStylesheet = storefrontThemeStylesheets[`../../stores/${storeKey}/design-system/index.css`];

  useEffect(() => {
    const root = document.documentElement;
    const previousStorefront = root.getAttribute('data-storefront');
    const previousOverrides = Object.entries(themeOverrides).map(([property]) => ({
      property,
      value: root.style.getPropertyValue(property),
      priority: root.style.getPropertyPriority(property),
    }));

    root.setAttribute('data-storefront', storeKey);
    Object.entries(themeOverrides).forEach(([property, value]) => {
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
  }, [storeKey, themeOverrides, themeStylesheet]);

  return <>{children}</>;
}
