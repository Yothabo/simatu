export const poshiesStorefrontConfig = {
  key: 'poshies',
  name: 'Poshies',
  theme: 'poshies',
} as const;


export type StorefrontThemeKey = typeof poshiesStorefrontConfig.theme;
