import { useCallback, useRef, useState } from 'react';
import type { AdminRow } from '../../types/admin.types';

export function useAdminProductsScope(
  isAdmin: boolean | null,
  userId: string | null,
) {
  const adminRef = useRef(isAdmin);
  const userIdRef = useRef(userId);
  const adminGenerationRef = useRef(0);
  const loadRequestVersionRef = useRef(0);
  const productsRef = useRef<AdminRow[]>([]);
  const previousScopeRef = useRef({ isAdmin, userId });

  if (
    previousScopeRef.current.isAdmin !== isAdmin ||
    previousScopeRef.current.userId !== userId
  ) {
    adminGenerationRef.current += 1;
    loadRequestVersionRef.current += 1;
    previousScopeRef.current = { isAdmin, userId };
  }

  adminRef.current = isAdmin;
  userIdRef.current = userId;

  const [products, setProducts] = useState<AdminRow[]>([]);

  const updateProducts = useCallback((nextProducts: AdminRow[]) => {
    productsRef.current = nextProducts;
    setProducts(nextProducts);
  }, []);

  return {
    adminRef,
    userIdRef,
    adminGenerationRef,
    loadRequestVersionRef,
    productsRef,
    products,
    updateProducts,
  };
}
