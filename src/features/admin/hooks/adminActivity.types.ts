export type AdminActivity = {
  id: string;
  event_type: string;
  entity_type: 'product' | 'order' | 'admin';
  entity_id: string | null;
  description: string;
  actor_email: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function isAdminActivities(value: unknown): value is AdminActivity[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => {
      if (!entry || typeof entry !== 'object') return false;

      const item = entry as Record<string, unknown>;

      return (
        typeof item.id === 'string' &&
        typeof item.event_type === 'string' &&
        (
          item.entity_type === 'product' ||
          item.entity_type === 'order' ||
          item.entity_type === 'admin'
        ) &&
        (item.entity_id === null || typeof item.entity_id === 'string') &&
        typeof item.description === 'string' &&
        (item.actor_email === null || typeof item.actor_email === 'string') &&
        !!item.metadata &&
        typeof item.metadata === 'object' &&
        !Array.isArray(item.metadata) &&
        typeof item.created_at === 'string' &&
        Number.isFinite(Date.parse(item.created_at))
      );
    })
  );
}
