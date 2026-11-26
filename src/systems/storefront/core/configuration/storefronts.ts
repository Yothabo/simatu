import type { StorefrontConfiguration } from '../types/storefront';

/**
 * Store-owned content and presentation configuration.
 * Experience components render these values; they do not identify individual brands.
 */
export const STOREFRONTS = {
  yotaabo: {
    name: 'Yotaabo',
    basePath: '/yotaabo',
    primaryAccent: '#8aa89b',
    categoryOrder: ['His', 'Hers', 'Spaces'],
    designSystem: { source: 'shared', name: 'storefront-foundation', overrides: {} },
    hero: {
      variant: 'wordmark',
      wordmark: 'Yotaabo',
      description: 'The scents our community loves most.',
    },
    story: {
      heading: 'A scent should feel like you.',
      paragraphs: [
        'Fragrance is more than something you wear. It can express a mood, complete a personal style, and become part of the way people remember you.',
        'Yotaabo is built around that personal connection: finding scents that feel considered, distinctive, and right for the moment.',
      ],
      tone: 'canvas',
    },
    contact: {
      heading: 'Find the scent that feels like you.',
      description: 'Explore the collection and discover a fragrance direction that fits your mood, your style, and your everyday.',
      actionLabel: 'Explore fragrances',
    },
    footer: { policyLinks: [], className: 'bg-white' },
    navigation: {
      variant: 'sections',
      homeLabel: 'Home',
      catalogueLabel: 'Catalogue',
      categoryLabel: 'Categories',
      sections: [
        { id: 'home', label: 'Home' },
        { id: 'services', label: 'Collections' },
        { id: 'about', label: 'About' },
      ],
      categories: [],
    },
    collections: [
      { id: 'his', title: 'His', eyebrow: 'REFINED. GROUNDED. REMEMBERED.', description: 'Crafted for presence. Distinctive scents for the modern man, refined in character, grounded in confidence, and made to be remembered.', productCategory: 'His', collectionTitle: 'His Collection', textTone: 'default', accentRole: 'primary', hasWatermark: true, imageSrc: '/systems/storefront/shared/images/hisimage.webp' },
      { id: 'hers', title: 'Hers', eyebrow: 'ELEGANCE IN EVERY NOTE', description: 'Fragrances crafted to complement elegance and individuality, whether soft and floral or bold and warm.', productCategory: 'Hers', collectionTitle: 'Her Collection', textTone: 'inverse', accentRole: 'secondary', hasWatermark: true, imageSrc: '/systems/storefront/shared/images/herimage.webp' },
      { id: 'spaces', title: 'Spaces', eyebrow: 'SCENTS FOR EVERY ROOM', description: 'Extend your signature into every space. Ambient scents for the home and car, quietly shaping the atmosphere wherever you go.', productCategory: 'Spaces', collectionTitle: 'Collections', textTone: 'inverse', accentRole: 'tertiary', hasWatermark: true },
      { id: 'about', title: 'about', eyebrow: 'THE STORY BEHIND THE SCENT', description: 'Born from a simple, enduring belief: fragrance is not merely something you wear, but a reflection of who you are. We curate distinctive scents that speak quietly yet linger long, carefully designed to become an unforgettable part of how you are remembered.', textTone: 'inverse', accentRole: 'primary', hasWatermark: false, decorativeWordmark: true },
    ],
  },
  poshies: {
    name: 'Poshies',
    basePath: '/poshies',
    primaryAccent: '#ff1493',
    categoryOrder: ['Hers', 'His', 'Lounge'],
    designSystem: { source: 'shared', name: 'storefront-foundation', overrides: {} },
    hero: { variant: 'campaign', wordmark: 'Poshies', description: 'Comfort, confidence and everyday essentials.', className: 'storefront-hero--campaign' },
    story: {
      heading: 'Comfort should feel like you.',
      paragraphs: [
        'What you wear close to you should feel comfortable, look good, and fit naturally into your everyday life.',
        'Poshies is built around everyday comfort, thoughtful details, and intimate pieces that let you feel good in your own skin.',
      ],
      tone: 'inverse',
    },
    contact: {
      heading: 'Find the pieces that feel like you.',
      description: 'Explore intimate essentials, everyday underwear, and comfortable pieces for relaxing and unwinding.',
      actionLabel: 'Explore collections',
    },
    collectionsClassName: 'storefront-collections--campaign',
    footer: {
      className: 'storefront-footer--campaign',
      policyLinks: [
        { label: 'Privacy policy', path: 'privacy' },
        { label: 'Terms of use', path: 'terms' },
        { label: 'Delivery policy', path: 'delivery' },
        { label: 'Refund & returns policy', path: 'refund' },
      ],
    },
    navigation: {
      variant: 'expanded',
      homeLabel: 'Home',
      catalogueLabel: 'Catalogue',
      categoryLabel: 'Categories',
      sections: [],
      categories: [
        { id: 'hers', label: 'Hers' },
        { id: 'his', label: 'His' },
        { id: 'spaces', label: 'Lounge' },
      ],
    },
    collections: [
      { id: 'his', title: 'Him', eyebrow: 'COMFORT THAT FEELS LIKE YOURS.', description: 'Everyday briefs, boxers and trunks with a comfortable fit and a little more confidence in every layer.', productCategory: 'His', collectionTitle: 'Collection', collectionHeading: 'His', textTone: 'default', accentRole: 'primary', hasWatermark: true, variantClassName: 'his', carouselVariant: 'editorial', isDark: false, mockProductCategory: 'His' },
      { id: 'hers', title: 'Her', eyebrow: 'MADE TO FEEL GOOD ON YOUR SKIN.', description: 'Discover bras, panties, matching sets and lingerie chosen for the way they feel, fit and let you express yourself.', productCategory: 'Hers', collectionTitle: 'Collection', collectionHeading: 'Her', textTone: 'inverse', accentRole: 'primary', hasWatermark: true, variantClassName: 'hers', carouselVariant: 'editorial', isDark: false, mockProductCategory: 'Hers' },
      { id: 'spaces', title: 'Lounge', eyebrow: 'SOFT MOMENTS. YOUR OWN SPACE.', description: 'Slip into soft sleepwear, robes and relaxed sets made for slow mornings, quiet evenings and time that belongs to you.', productCategory: 'Lounge', collectionTitle: 'Collection', collectionHeading: 'Lounge', textTone: 'inverse', accentRole: 'primary', hasWatermark: true, variantClassName: 'lounge', carouselVariant: 'editorial', isDark: false, mockProductCategory: 'Lounge' },
      { id: 'about', title: 'about', eyebrow: 'INTIMACY, ON YOUR OWN TERMS.', description: 'Poshies is a space for intimate essentials, everyday comfort and personal expression. Find pieces that feel right against your skin and let confidence begin with you.', textTone: 'inverse', accentRole: 'primary', hasWatermark: true, variantClassName: 'about' },
    ],
  },
} as const satisfies Record<string, StorefrontConfiguration>;

export function isStorefrontKey(value: string): value is keyof typeof STOREFRONTS {
  return Object.prototype.hasOwnProperty.call(STOREFRONTS, value);
}
