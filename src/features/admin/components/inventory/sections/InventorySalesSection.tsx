import { AdminCard, AdminText } from '../../../../../design-system/components';

export default function InventorySalesSection() {
  return (
    <AdminCard>
      <AdminText variant="supporting" as="p">
        Record offline transactions, select products, capture quantities and
        payment details, and update inventory through audited movements.
      </AdminText>
    </AdminCard>
  );
}
