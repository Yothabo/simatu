export function getProductStoragePath(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const marker = '/storage/v1/object/public/products/';
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}
