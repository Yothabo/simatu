import { useRef, useState } from 'react';
import type { Order } from '../../types/admin.types';

export function useAdminOrdersScope(
  isAdmin: boolean | null,
  userId: string | null,
) {
  const adminRef = useRef(isAdmin);
  const userIdRef = useRef(userId);
  const adminGenerationRef = useRef(0);
  const previousScopeRef = useRef({ isAdmin, userId });

  if (
    previousScopeRef.current.isAdmin !== isAdmin ||
    previousScopeRef.current.userId !== userId
  ) {
    adminGenerationRef.current += 1;
    previousScopeRef.current = { isAdmin, userId };
  }

  adminRef.current = isAdmin;
  userIdRef.current = userId;

  const [orders, setOrders] = useState<Order[]>([]);

  return {
    adminRef,
    userIdRef,
    adminGenerationRef,
    orders,
    setOrders,
  };
}
