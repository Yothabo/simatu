export function getAdminProductPlaceholderColor(category: string): string {
  const colors: Record<string, string> = {
    His: 'bg-[#8aa89b]',
    Hers: 'bg-[#ff1493]',
    Spaces: 'bg-[#c8ad8d]',
    Lounge: 'bg-[#c8ad8d]',
  };
  return colors[category] ?? colors.His;
}

export function getAdminProductAccentColor(category: string): string {
  const colors: Record<string, string> = {
    His: 'text-[#8aa89b]',
    Hers: 'text-[#ff1493]',
    Spaces: 'text-[#c8ad8d]',
    Lounge: 'text-[#c8ad8d]',
  };
  return colors[category] ?? colors.His;
}
