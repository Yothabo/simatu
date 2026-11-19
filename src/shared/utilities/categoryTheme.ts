export type CategoryTheme = {
  placeholderColor: string;
  accentColor: string;
  fillColor: string;
  hexColor: string;
};

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  His: {
    placeholderColor: 'bg-[#8aa89b]',
    accentColor: 'text-[#8aa89b]',
    fillColor: 'fill-[#8aa89b]',
    hexColor: '#8aa89b',
  },
  Hers: {
    placeholderColor: 'bg-[#ff1493]',
    accentColor: 'text-[#ff1493]',
    fillColor: 'fill-[#ff1493]',
    hexColor: '#ff1493',
  },
  Spaces: {
    placeholderColor: 'bg-[#c8ad8d]',
    accentColor: 'text-[#c8ad8d]',
    fillColor: 'fill-[#c8ad8d]',
    hexColor: '#c8ad8d',
  },
  Lounge: {
    placeholderColor: 'bg-[#c8ad8d]',
    accentColor: 'text-[#c8ad8d]',
    fillColor: 'fill-[#c8ad8d]',
    hexColor: '#c8ad8d',
  },
};

export function getCategoryTheme(category: string): CategoryTheme {
  return CATEGORY_THEMES[category] ?? CATEGORY_THEMES.His;
}
