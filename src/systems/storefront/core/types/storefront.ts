export type StorefrontCategory = 'His' | 'Hers' | 'Spaces' | 'Lounge';

export type StorefrontKey = 'yotaabo' | 'poshies';

export type StorefrontDesignSystem =
  | {
      source: 'shared';
      name: string;
      overrides: Record<string, string>;
    }
  | {
      source: 'local';
      name: string;
      overrides?: Record<string, string>;
    };

export interface StorefrontConfiguration {
  name: string;
  basePath: `/${string}`;
  primaryAccent: string;
  categoryOrder: readonly StorefrontCategory[];
  designSystem: StorefrontDesignSystem;
}
