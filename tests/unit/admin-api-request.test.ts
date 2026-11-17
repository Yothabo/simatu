import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  createAdminRequestId: vi.fn(() => 'request-1'),
  getAdminFlowId: vi.fn(() => 'flow-1'),
  logAdminTiming: vi.fn(),
  startAdminTimer: vi.fn(() => 100),
}));

vi.mock('../../src/utils/supabase', () => ({
  supabase: { auth: { getSession: mocks.getSession } },
}));

vi.mock('../../src/features/admin/auth/adminRequestTelemetry', () => ({
  createAdminRequestId: mocks.createAdminRequestId,
  getAdminFlowId: mocks.getAdminFlowId,
  logAdminTiming: mocks.logAdminTiming,
  startAdminTimer: mocks.startAdminTimer,
}));

import { requestAdminApi } from '../../src/features/admin/auth/adminApiRequest';

describe('requestAdminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token',
          user: { id: 'admin-1' },
        },
      },
      error: null,
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  it('sends the authenticated request and returns parsed endpoint data', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ products: [{ id: 'product-1' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await requestAdminApi({
      userId: 'admin-1',
      url: '/api/products?scope=admin',
      method: 'GET',
      resource: 'products',
      responseCollection: 'products',
      fallbackError: 'Products failed.',
    });

    expect(result.products).toEqual([{ id: 'product-1' }]);
    expect(fetch).toHaveBeenCalledWith(
      '/api/products?scope=admin',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'X-Request-ID': 'request-1',
          'X-Admin-Flow-ID': 'flow-1',
        }),
      }),
    );
    expect(mocks.logAdminTiming).toHaveBeenCalledWith(
      'admin.products.total',
      'request-1',
      100,
      expect.objectContaining({ outcome: 'success', httpStatus: 200 }),
    );
  });

  it('rejects requests when the current session belongs to another user', async () => {
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token',
          user: { id: 'different-admin' },
        },
      },
      error: null,
    });

    await expect(
      requestAdminApi({
        userId: 'admin-1',
        url: '/api/orders',
        method: 'GET',
        resource: 'orders',
        responseCollection: 'orders',
        fallbackError: 'Orders failed.',
      }),
    ).rejects.toThrow('Your admin session has expired.');

    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.logAdminTiming).toHaveBeenCalledWith(
      'admin.orders.total',
      'request-1',
      100,
      expect.objectContaining({ outcome: 'invalid_session' }),
    );
  });

  it('uses the endpoint error message for non-success responses', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Access denied.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      requestAdminApi({
        userId: 'admin-1',
        url: '/api/orders',
        method: 'GET',
        resource: 'orders',
        responseCollection: 'orders',
        fallbackError: 'Orders failed.',
      }),
    ).rejects.toThrow('Access denied.');
  });
});
