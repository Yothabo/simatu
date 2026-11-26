export type StorefrontCategory = 'His' | 'Hers' | 'Spaces' | 'Lounge';
export type StorefrontKey = string;

export type StorefrontDesignSystem =
  | { source: 'shared'; name: string; overrides: Record<string, string> }
  | { source: 'local'; name: string; overrides?: Record<string, string> };

export interface StorefrontCollectionConfiguration {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  productCategory?: StorefrontCategory;
  collectionTitle?: string;
  collectionHeading?: string;
  textTone: 'default' | 'inverse';
  accentRole: 'primary' | 'secondary' | 'tertiary';
  hasWatermark: boolean;
  decorativeWordmark?: boolean;
  imageSrc?: string;
  variantClassName?: string;
  carouselVariant?: 'standard' | 'editorial';
  isDark?: boolean;
  mockProductCategory?: StorefrontCategory;
}

export interface StorefrontConfiguration {
  name: string;
  basePath: `/${string}`;
  primaryAccent: string;
  categoryOrder: readonly StorefrontCategory[];
  designSystem: StorefrontDesignSystem;
  hero: { variant: 'campaign' | 'wordmark'; wordmark: string; description: string; className?: string };
  collectionsClassName?: string;
  story: { heading: string; paragraphs: readonly string[]; tone: 'canvas' | 'inverse' };
  contact: { heading: string; description: string; actionLabel: string };
  productDescriptionFallback: string;
  footer: { policyLinks: readonly { label: string; path: string }[]; className?: string };
  navigation: {
    variant: 'expanded' | 'sections';
    homeLabel: string;
    catalogueLabel: string;
    categoryLabel: string;
    sections: readonly { id: string; label: string }[];
    categories: readonly { id: string; label: string }[];
  };
  collections: readonly StorefrontCollectionConfiguration[];
}
