import type { ComponentProps } from 'react';
import AdminProductModals from './AdminProductModals';
import AdminOrderModals from './AdminOrderModals';

type ProductModalProps = ComponentProps<typeof AdminProductModals>;
type OrderModalProps = ComponentProps<typeof AdminOrderModals>;
type AdminPageModalsProps = ProductModalProps & OrderModalProps;

export default function AdminPageModals(props: AdminPageModalsProps) {
  return (
    <>
      <AdminProductModals {...props} />
      <AdminOrderModals {...props} />
    </>
  );
}
