export function getSessionUserId(): string | null {
  try {
    const ref = (import.meta.env.VITE_SUPABASE_URL || '')
      .split('//')[1]
      ?.split('.')[0];

    if (!ref) return null;

    const key = `sb-${ref}-auth-token`;
    const raw = localStorage.getItem(key);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as { user?: { id?: string } };
    return parsed.user?.id ?? null;
  } catch {
    return null;
  }
}
