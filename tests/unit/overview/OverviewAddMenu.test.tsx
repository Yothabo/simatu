import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverviewAddMenu from '../../../src/features/admin/components/overview/header/OverviewAddMenu';

describe('OverviewAddMenu actions', () => {
  it('opens the menu and launches product creation', async () => {
    const user = userEvent.setup();
    const onAddProduct = vi.fn();
    render(<OverviewAddMenu onAddProduct={onAddProduct} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('menuitem', { name: 'Add new product' }));

    expect(onAddProduct).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu', { name: 'Add action menu' })).not.toBeInTheDocument();
  });

  it('clearly disables actions that have no implemented workflow', async () => {
    const user = userEvent.setup();
    render(<OverviewAddMenu onAddProduct={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('menuitem', { name: 'Register a direct sale' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: 'Create a receipt' })).toBeDisabled();
  });
});
