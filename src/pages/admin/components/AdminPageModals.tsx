import type { ComponentProps } from 'react';
import AdminProductModals from './AdminProductModals';
import AdminOrderModals from './AdminOrderModals';

type AdminPageModalsProps = {
  productProps: ComponentProps<typeof AdminProductModals>;
  orderProps: ComponentProps<typeof AdminOrderModals>;
};

export default function AdminPageModals({
  productProps,
  orderProps,
}: AdminPageModalsProps) {
  return (
    <>
      <AdminProductModals {...productProps} />
      <AdminOrderModals {...orderProps} />
    </>
  );
}
