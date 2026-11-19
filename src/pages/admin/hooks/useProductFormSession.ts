import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { AdminProduct } from '../../../features/admin/components/AdminProductForm';

type Args = {
  formUserId: string | null;
};

export function useProductFormSession({ formUserId }: Args) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [formStateReady, setFormStateReady] = useState(false);
  const restoredFormScopeRef = useRef<string | null>(null);

  // Restore a product form only after this admin has been authorized.
  useLayoutEffect(() => {
    if (!formUserId) {
      restoredFormScopeRef.current = null;
      setFormOpen(false);
      setEditing(null);
      setFormStateReady(false);
      return;
    }

    setFormStateReady(false);

    try {
      const formOpenKey = `yotaabo-admin-product-form-open:${formUserId}`;
      const editingKey = `yotaabo-admin-product-editing:${formUserId}`;

      const savedOpen = sessionStorage.getItem(formOpenKey) === 'true';
      const savedEditing = sessionStorage.getItem(editingKey);

      let restoredEditing: AdminProduct | null = null;

      if (savedEditing) {
        try {
          restoredEditing = JSON.parse(savedEditing) as AdminProduct;
        } catch {
          sessionStorage.removeItem(editingKey);
        }
      }

      setFormOpen(savedOpen);
      setEditing(restoredEditing);
    } catch {
      setFormOpen(false);
      setEditing(null);
    }

    restoredFormScopeRef.current = formUserId;
    setFormStateReady(true);
  }, [formUserId]);

  // Preserve the authorized admin's open form across browser reloads.
  useEffect(() => {
    if (
      !formUserId ||
      !formStateReady ||
      restoredFormScopeRef.current !== formUserId
    ) {
      return;
    }

    try {
      const formOpenKey = `yotaabo-admin-product-form-open:${formUserId}`;
      const editingKey = `yotaabo-admin-product-editing:${formUserId}`;

      if (formOpen) {
        sessionStorage.setItem(formOpenKey, 'true');

        if (editing) {
          sessionStorage.setItem(editingKey, JSON.stringify(editing));
        } else {
          sessionStorage.removeItem(editingKey);
        }
      } else {
        sessionStorage.removeItem(formOpenKey);
        sessionStorage.removeItem(editingKey);
      }
    } catch {
      // Storage may be unavailable; the admin form remains usable.
    }
  }, [formUserId, formStateReady, formOpen, editing]);

  const openCreateForm = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((product: AdminProduct) => {
    setEditing(product);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  return {
    formOpen,
    editing,
    openCreateForm,
    openEditForm,
    closeForm,
  };
}
