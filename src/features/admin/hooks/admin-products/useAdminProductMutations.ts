import { useMemo } from 'react';
import type { AdminRow } from '../../types/admin.types';
import {
  createDeleteProductMutation,
  createSetStatusMutation,
  createUpsertProductMutation,
} from './mutations';

type Scope = {
  adminRef: React.MutableRefObject<boolean | null>;
  userIdRef: React.MutableRefObject<string | null>;
  loadRequestVersionRef: React.MutableRefObject<number>;
  productsRef: React.MutableRefObject<AdminRow[]>;
  updateProducts: (nextProducts: AdminRow[]) => void;
};

type Args = {
  userId: string | null;
  hasLoadedProducts: boolean;
  scope: Scope;
  loadProducts: () => Promise<void>;
  productsApi: (
    method: 'GET' | 'PATCH' | 'DELETE',
    body?: Record<string, string | boolean>,
    adminScope?: boolean,
  ) => Promise<Record<string, unknown>>;
};

export function useAdminProductMutations({
  userId,
  hasLoadedProducts,
  scope,
  loadProducts,
  productsApi,
}: Args) {
  const { adminRef, userIdRef, loadRequestVersionRef, productsRef, updateProducts } =
    scope;

  const upsertProduct = useMemo(
    () =>
      createUpsertProductMutation({
        adminRef,
        userIdRef,
        loadRequestVersionRef,
        productsRef,
        updateProducts,
        userId,
        hasLoadedProducts,
        loadProducts,
      }),
    [
      adminRef,
      userIdRef,
      loadRequestVersionRef,
      productsRef,
      updateProducts,
      userId,
      hasLoadedProducts,
      loadProducts,
    ],
  );

  const hideProduct = useMemo(
    () =>
      createSetStatusMutation({
        adminRef,
        userIdRef,
        userId,
        productsApi,
        loadProducts,
        isActive: false,
        successMessage: (name) => `${name} hidden`,
        errorMessage: 'Unable to hide product.',
      }),
    [adminRef, userIdRef, userId, productsApi, loadProducts],
  );

  const reactivateProduct = useMemo(
    () =>
      createSetStatusMutation({
        adminRef,
        userIdRef,
        userId,
        productsApi,
        loadProducts,
        isActive: true,
        successMessage: (name) => `${name} reactivated`,
        errorMessage: 'Unable to reactivate product.',
      }),
    [adminRef, userIdRef, userId, productsApi, loadProducts],
  );

  const deleteProduct = useMemo(
    () =>
      createDeleteProductMutation({
        adminRef,
        userIdRef,
        userId,
        productsApi,
        loadProducts,
      }),
    [adminRef, userIdRef, userId, productsApi, loadProducts],
  );

  return {
    upsertProduct,
    hideProduct,
    reactivateProduct,
    deleteProduct,
  };
}
